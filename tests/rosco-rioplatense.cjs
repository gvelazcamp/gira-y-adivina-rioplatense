const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const datos=vm.runInNewContext(fs.readFileSync(path.join(root,'rosco-rioplatense-datos.js'),'utf8')+';ROSCO_DATOS');
assert.equal(datos.length,72);assert.equal(new Set(datos.map(d=>d.palabra)).size,72);
for(const letra of 'ABCDEFGHIJKLMNOPQRSTUVYZ')assert(datos.filter(d=>d.letra===letra).length>=3);
for(const d of datos){assert(d.definicion&&d.categoria&&d.nivel);assert(d.palabra.startsWith(d.letra));}
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
for(const file of JSON.parse(sw.match(/const APP_SHELL = (\[[^;]+\]);/)[1]))assert(fs.existsSync(path.join(root,file.split('?')[0])),'PWA: '+file);
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.json':'application/json'};
(async()=>{
  const server=http.createServer((req,res)=>{
    const pathname=new URL(req.url,'http://local').pathname,file=path.join(root,pathname==='/'?'index.html':pathname);
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  const ready=page=>page.waitForFunction(()=>document.querySelector('.rr-game')?.dataset.fase==='resolver');
  async function responder(page,correcto=true,enter=true){
    await ready(page);
    const palabra=await page.evaluate(()=>ROSCO_DATOS.find(d=>d.definicion===document.querySelector('#rrDefinicion').textContent).palabra);
    await page.locator('#rrEntrada').fill(correcto?palabra.toLowerCase().replace(/a/g,'á').split('').join(' '):'incorrecta');
    if(enter)await page.locator('#rrEntrada').press('Enter');else await page.locator('#rrEnviar').click();
    return palabra;
  }
  try{for(const [motor,tipo] of [['chromium',chromium],['webkit',webkit]]){
    const browser=await tipo.launch(motor==='chromium'?{headless:true,executablePath:process.env.BROWSER_EXECUTABLE}:{headless:true});
    try{for(const viewport of motor==='chromium'?[{width:360,height:780},{width:1280,height:900}]:[{width:360,height:780}]){
      const context=await browser.newContext({viewport,isMobile:viewport.width===360,hasTouch:viewport.width===360,serviceWorkers:'block'});
      const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.fulfill({status:200,body:''}));
      await page.addInitScript(()=>{
        localStorage.setItem('gya_nombre','Prueba');localStorage.setItem('gya_avatar','avatar-01');localStorage.setItem('gya_pais','uruguay');localStorage.setItem('gya_bienvenida_vista','1');
        const d=new Date();localStorage.setItem('gya_dia_alta',[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'));
      });
      await page.goto(base,{waitUntil:'load'});
      await page.evaluate(()=>{document.querySelector('#splash')?.remove();document.querySelectorAll('.capa.ver').forEach(e=>e.classList.remove('ver'));});
      const economia=await page.evaluate(()=>({monedas:meta.monedas,vidas:meta.vidas,tickets:meta.tickets}));
      await page.locator('#bExtensiones').click();await page.locator('.ext-tarjeta').filter({hasText:'El Rosco'}).click();
      assert.equal(await page.evaluate(()=>RoscoRioplatense.configNivel(1).segundos),115);
      assert.equal(await page.evaluate(()=>RoscoRioplatense.configNivel(20).segundos),108);
      await page.locator('.rr-principal').click();
      assert.equal(await page.locator('.rr-letra').count(),12);
      const inicial=await page.locator('#rrTiempo').textContent();await page.waitForTimeout(600);
      assert.equal(await page.locator('#rrTiempo').textContent(),inicial,'el giro pausa el reloj');
      await ready(page);assert.equal(await page.evaluate(()=>document.activeElement.id),'rrEntrada');
      const primera=await page.locator('#rrGrande').textContent();
      await page.locator('#rrEntrada').press('Enter');assert.equal(await page.locator('#rrErrores').textContent(),'0');
      await page.locator('#rrPasar').click();await ready(page);
      assert.notEqual(await page.locator('#rrGrande').textContent(),primera,'pasar elige otra letra');
      assert.equal(await page.locator('.rr-letra.pendiente').count(),12,'pasar conserva las pendientes');
      if(process.env.UI_SCREENSHOTS){fs.mkdirSync(process.env.UI_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,`rosco-${motor}-${viewport.width}.png`)});}
      await page.evaluate(()=>{
        ROSCO_CONFIG.giroMs=100;ROSCO_CONFIG.pausaMs=150;musicaOn=true;window.tonos=[];
        // Este WebKit headless no expone Web Audio. Doblar solo su backend;
        // Chromium prueba los osciladores reales y ambos recorren bip/sonidoPermitido.
        if(!window.AudioContext&&!window.webkitAudioContext)window.AudioContext=class{
          constructor(){this.state='running';this.currentTime=0;this.destination={};}
          createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}
          createOscillator(){return{frequency:{value:0},connect(){},start(){},stop(){}};}
        };
        const proto=(window.AudioContext||window.webkitAudioContext).prototype,original=proto.createOscillator;
        proto.createOscillator=function(){const osc=original.call(this),start=osc.start;osc.start=function(...args){window.tonos.push([osc.frequency.value,osc.type]);return start.apply(this,args);};return osc;};
      });
      await responder(page,true);assert.equal(await page.locator('#rrAciertos').textContent(),'1/12');
      assert(await page.evaluate(()=>tonos.some(t=>t[0]===660)),'sonido de acierto');
      await ready(page);await page.evaluate(()=>tonos=[]);
      const fallada=await responder(page,false,false);
      assert.match(await page.locator('#rrMensaje').textContent(),new RegExp(fallada));
      assert.equal(await page.locator('#rrErrores').textContent(),'1');
      assert(await page.evaluate(()=>tonos.some(t=>t[0]===180)),'sonido de error distinto');
      await ready(page);await page.evaluate(()=>{musicaOn=false;tonos=[];});
      for(let i=0;i<10;i++)await responder(page,true,i%2===0);
      await page.waitForFunction(()=>document.querySelector('.rr-game')?.dataset.fase==='fin');
      assert.equal(await page.evaluate(()=>tonos.length),0,'el silencio general alcanza a aciertos, errores y giros');
      assert.match(await page.locator('.rr-panel p').first().textContent(),/11 aciertos · 1 errores · 0 sin responder/);
      const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('gya_rosco_rioplatense')));
      assert(saved.mejor>=1100);assert.equal(saved.nivelMax,2);
      assert.equal(await page.evaluate(()=>objObtenerHoy().roscoLetras),12);
      assert(await page.evaluate(()=>logrosGanados.has('roscoPrimera')));
      assert.deepEqual(await page.evaluate(()=>({monedas:meta.monedas,vidas:meta.vidas,tickets:meta.tickets})),economia);
      await page.locator('#extAtras').click();assert.match(await page.locator('.ext-tarjeta').filter({hasText:'El Rosco'}).textContent(),new RegExp(saved.mejor+' puntos'));
      await page.locator('.ext-tarjeta').filter({hasText:'El Rosco'}).click();
      await page.locator('.rr-panel button').filter({hasText:'Practicar desde'}).click();await ready(page);
      const repetidas=await page.evaluate(()=>JSON.parse(localStorage.getItem('gya_rosco_rioplatense')).ultimas);
      const letrasRonda=await page.locator('.rr-letra span').allTextContents();
      for(const l of letrasRonda)if(saved.ultimas[l])assert.notEqual(repetidas[l],saved.ultimas[l]);
      // Ronda perfecta: completa el recorrido y los dos logros, incluso con movimiento reducido.
      await page.emulateMedia({reducedMotion:'reduce'});
      for(let i=0;i<12;i++)await responder(page,true);
      await page.waitForFunction(()=>document.querySelector('.rr-game')?.dataset.fase==='fin');
      assert(await page.evaluate(()=>logrosGanados.has('roscoPerfecto')&&logrosGanados.has('roscoVeloz')));
      // Nivel de 24 letras y espacio reducido equivalente al teclado móvil.
      await page.locator('#extAtras').click();
      await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('gya_rosco_rioplatense'));d.nivelMax=4;localStorage.setItem('gya_rosco_rioplatense',JSON.stringify(d));});
      await page.locator('.ext-tarjeta').filter({hasText:'El Rosco'}).click();await page.locator('.rr-principal').click();await ready(page);
      assert.equal(await page.locator('.rr-letra').count(),24);
      if(viewport.width===360){
        await page.setViewportSize({width:360,height:430});await page.waitForTimeout(200);
        await page.locator('#rrEntrada').focus();
        const bounds=await page.locator('#rrEntrada').boundingBox();assert(bounds.y>=0&&bounds.y+bounds.height<=430,'campo visible con viewport reducido');
        const pista=await page.locator('.rr-pista').boundingBox();assert(pista.y>=0&&pista.y+pista.height<=430,'pista visible con teclado');
        assert(await page.evaluate(()=>document.querySelector('.ext-shell').scrollWidth<=innerWidth),'sin desborde horizontal');
        if(process.env.UI_SCREENSHOTS)await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,`rosco-teclado-${motor}.png`)});
        await page.setViewportSize(viewport);
      }
      await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
      const antes=await page.locator('#rrTiempo').textContent();await page.waitForTimeout(1100);assert.equal(await page.locator('#rrTiempo').textContent(),antes);
      await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});
      await page.locator('#extAtras').click();
      await page.evaluate(()=>{ROSCO_CONFIG.segundosPorLetra=.1;});
      await page.locator('.ext-tarjeta').filter({hasText:'El Rosco'}).click();await page.locator('.rr-principal').click();
      await page.waitForFunction(()=>document.querySelector('.rr-game')?.dataset.fase==='fin');
      assert.match(await page.locator('.rr-panel h3').textContent(),/terminó el tiempo/);
      assert.match(await page.locator('.rr-panel p').first().textContent(),/24 sin responder/);
      await page.locator('#extCerrar').click();await page.waitForTimeout(300);
      assert.equal(await page.locator('.ext-shell.rr-abierta').count(),0);assert.equal(await page.locator('#extShell').isVisible(),false);
      assert.deepEqual(errors,[]);console.log('PASS El Rosco',motor,viewport.width);await context.close();
    }}finally{await browser.close();}
  }}finally{server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
