const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.json':'application/json'};

(async()=>{
  const server=http.createServer((req,res)=>{
    const pathname=new URL(req.url,'http://local').pathname,file=path.join(root,pathname==='/'?'index.html':pathname);
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port;
  try{
    for(const [motor,tipo] of [['chromium',chromium],['webkit',webkit]]){
      const browser=await tipo.launch(motor==='chromium'?{headless:true,executablePath:process.env.BROWSER_EXECUTABLE}:{headless:true});
      try{
    for(const viewport of motor==='webkit'?[{width:360,height:780}]:[{width:360,height:780},{width:1280,height:900}]){
      const context=await browser.newContext({viewport,isMobile:viewport.width===360,hasTouch:viewport.width===360,serviceWorkers:'block'});
      const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.fulfill({status:200,body:''}));
      await page.addInitScript(()=>{
        localStorage.setItem('gya_nombre','Prueba');localStorage.setItem('gya_avatar','avatar-01');
        localStorage.setItem('gya_pais','uruguay');localStorage.setItem('gya_bienvenida_vista','1');
        const d=new Date();localStorage.setItem('gya_dia_alta',[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'));
      });
      await page.goto(base,{waitUntil:'load'});
      await page.evaluate(()=>{document.querySelector('#splash')?.remove();document.querySelectorAll('.capa.ver').forEach(e=>e.classList.remove('ver'));});
      const economiaAntes=await page.evaluate(()=>({monedas:meta.monedas,vidas:meta.vidas,tickets:meta.tickets}));
      await page.locator('#bExtensiones').click();
      const tarjeta=page.locator('.ext-tarjeta').filter({hasText:'Memoria en Giro'});
      assert.equal(await page.locator('.ext-tarjeta').count(),5);
      assert(await tarjeta.isEnabled());
      assert(await tarjeta.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0),'carga el logo');
      await tarjeta.click();
      assert.match(await page.locator('.mg-panel h3').textContent(),/Memoria en Giro/);
      assert.match(await page.locator('.mg-panel p').textContent(),/no gastan vidas del juego principal/);
      await page.evaluate(()=>{MEMORIA_GIRO_NIVELES[1].vista=.8;MEMORIA_GIRO_NIVELES[1].vistaGiro=.5;MEMORIA_GIRO_NIVELES[1].giro=3;});
      await page.locator('.mg-panel .mg-principal').click();
      const vista=await page.locator('#mgTablero .mg-carta').evaluateAll(botones=>botones.map(b=>({id:b.dataset.id,simbolo:b.querySelector('.mg-carta-cara').textContent})));
      assert.equal(vista.length,6);assert.equal(new Set(vista.map(x=>x.simbolo)).size,3);
      assert(vista.every(x=>vista.filter(y=>y.simbolo===x.simbolo).length===2),'cada símbolo tiene pareja');
      if(process.env.UI_SCREENSHOTS){fs.mkdirSync(process.env.UI_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'memoria-vista-'+viewport.width+'.png')});}
      await page.waitForFunction(()=>document.querySelector('#mgGiroTexto')?.textContent.startsWith('Próximo giro'));
      const a=0,b=vista.findIndex(x=>x.simbolo!==vista[a].simbolo);
      const tiempoAntesDelFallo=Number(await page.locator('#mgTiempo').textContent());
      await page.evaluate(([i,j])=>{const botones=document.querySelectorAll('#mgTablero .mg-carta');botones[i].click();botones[j].click();},[a,b]);
      assert.match(await page.locator('#mgFallas').textContent(),/Fallos: 1/);
      assert.match(await page.locator('#mgMensaje').textContent(),/No son iguales/);
      assert(tiempoAntesDelFallo-Number(await page.locator('#mgTiempo').textContent())>=2,'una pareja equivocada quita tiempo');
      await page.waitForFunction(()=>!document.querySelector('#mgTablero .mg-carta.abierta:not(.encontrada)'));
      const pareja=vista.map((x,i)=>x.simbolo===vista[a].simbolo?i:-1).filter(i=>i>=0);
      await page.evaluate(indices=>{const botones=document.querySelectorAll('#mgTablero .mg-carta');indices.forEach(i=>botones[i].click());},pareja);
      assert.equal(await page.locator('#mgPares').textContent(),'1/3');
      const fijos=await page.locator('#mgTablero .mg-carta.encontrada').evaluateAll(botones=>botones.map(b=>b.dataset.id));
      assert.equal(fijos.length,2);
      await page.locator('#mgTablero .mg-carta.girando').first().waitFor({timeout:10000});
      assert.equal(await page.locator('#mgTablero .mg-carta.girando').count(),4,'giran solo las cartas pendientes');
      assert.equal(await page.locator('#mgTablero .mg-carta.encontrada.girando').count(),0,'los pares resueltos no giran');
      assert.match(await page.locator('#mgFallas').textContent(),/2 giros con pista/);
      if(process.env.UI_SCREENSHOTS){await page.waitForTimeout(160);await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'memoria-giro-'+motor+'-'+viewport.width+'.png')});}
      await page.waitForFunction(()=>document.querySelector('#mgGiroTexto')?.textContent.startsWith('Nueva oportunidad'));
      assert.equal(await page.locator('#mgTablero .mg-carta.abierta').count(),6,'el giro vuelve a mostrar las cartas pendientes');
      if(process.env.UI_SCREENSHOTS)await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'memoria-pista-'+motor+'-'+viewport.width+'.png')});
      await page.waitForFunction(()=>document.querySelector('#mgGiroTexto')?.textContent.startsWith('Próximo giro'));
      assert.equal(await page.locator('#mgTablero .mg-carta.abierta').count(),2,'la pista termina y vuelve a tapar las pendientes');
      const despues=await page.locator('#mgTablero .mg-carta').evaluateAll(botones=>botones.map(b=>b.dataset.id));
      assert(pareja.every(i=>fijos.includes(despues[i])&&despues[i]===vista[i].id),'los pares encontrados no se mueven');
      assert(despues.some((id,i)=>id!==vista[i].id),'los pendientes cambian de posición');
      const simboloPorId=Object.fromEntries(vista.map(x=>[x.id,x.simbolo]));
      await page.evaluate(simbolos=>{
        const botones=[...document.querySelectorAll('#mgTablero .mg-carta')];
        const grupos={};botones.forEach((b,i)=>{if(!b.classList.contains('encontrada'))(grupos[simbolos[b.dataset.id]]??=[]).push(i);});
        Object.values(grupos).forEach(indices=>indices.forEach(i=>botones[i].click()));
      },simboloPorId);
      assert.match(await page.locator('.mg-panel h3').textContent(),/Todos los pares/);
      const guardado=await page.evaluate(()=>JSON.parse(localStorage.getItem('gya_memoria_en_giro')));
      assert.equal(guardado.nivelMax,2);assert.equal(guardado.ganadas,1);assert(guardado.mejor>0);
      assert.deepEqual(await page.evaluate(()=>({monedas:meta.monedas,vidas:meta.vidas,tickets:meta.tickets})),economiaAntes);
      if(process.env.UI_SCREENSHOTS){await page.waitForTimeout(700);await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'memoria-victoria-'+viewport.width+'.png')});}
      await page.evaluate(()=>{MEMORIA_GIRO_NIVELES[2].vista=.2;MEMORIA_GIRO_NIVELES[2].segundos=.4;MEMORIA_GIRO_NIVELES[2].giro=100;});
      await page.locator('.mg-panel .mg-principal').click();
      assert.equal(await page.locator('#mgTablero .mg-carta').count(),8);
      await page.locator('.mg-panel h3').filter({hasText:'Se terminó el tiempo'}).waitFor({timeout:10000});
      assert.equal(await page.locator('#mgPuntos').textContent(),'0');
      assert.match(await page.locator('.mg-panel p').textContent(),/perdiste .* puntos/);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'sin desborde horizontal');
      await page.locator('#extAtras').click();
      assert.match(await page.locator('.ext-tarjeta').filter({hasText:'Memoria en Giro'}).textContent(),new RegExp(String(guardado.mejor)));
      await page.locator('.ext-tarjeta').filter({hasText:'Memoria en Giro'}).click();
      assert.match(await page.locator('.mg-panel .mg-principal').textContent(),/nivel 2/);
      await page.locator('#extCerrar').click();
      await page.evaluate(()=>{
        const d=JSON.parse(localStorage.getItem('gya_memoria_en_giro'));d.nivelMax=4;localStorage.setItem('gya_memoria_en_giro',JSON.stringify(d));
        MEMORIA_GIRO_NIVELES[4].vista=.3;MEMORIA_GIRO_NIVELES[4].vistaGiro=.15;MEMORIA_GIRO_NIVELES[4].giro=.3;
      });
      await page.locator('#bExtensiones').click();
      await page.locator('.ext-tarjeta').filter({hasText:'Memoria en Giro'}).click();
      await page.locator('.mg-panel .mg-principal').click();
      assert.equal(await page.locator('#mgTablero .mg-carta').count(),16,'nivel avanzado tiene cuadrícula de 4 por 4');
      if(process.env.UI_SCREENSHOTS)await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'memoria-nivel4-'+viewport.width+'.png')});
      await page.waitForFunction(()=>document.querySelector('#mgGiroTexto')?.textContent.startsWith('Próximo giro'));
      await page.waitForFunction(()=>document.querySelector('#mgFallas')?.textContent.includes('0 giros con pista'),null,{timeout:10000});
      await page.waitForFunction(()=>document.querySelector('#mgGiroTexto')?.textContent.startsWith('Sin más giros'));
      await page.waitForTimeout(500);
      assert.equal(await page.locator('#mgTablero .mg-carta.girando').count(),0,'sin corazones no hay más giros');
      await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
      const tiempoPausado=await page.locator('#mgTiempo').textContent();
      await page.waitForTimeout(650);
      assert.equal(await page.locator('#mgTiempo').textContent(),tiempoPausado,'el reloj se pausa si la app queda oculta');
      await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'nivel avanzado sin desborde horizontal');
      await page.locator('#extCerrar').click();
      assert.deepEqual(errors,[]);
      console.log('PASS Memoria en Giro',motor,viewport.width,'pares, fallos, giro, victoria, derrota, progreso y economía');
      await context.close();
    }
      }finally{await browser.close();}
    }
  }finally{await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
