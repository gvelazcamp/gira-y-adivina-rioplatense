const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.json':'application/json'};

async function preparar(page,base){
  await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.fulfill({status:200,body:''}));
  await page.addInitScript(()=>{
    localStorage.setItem('gya_nombre','Prueba');localStorage.setItem('gya_avatar','mate');
    localStorage.setItem('gya_pais','UY');localStorage.setItem('gya_bienvenida_vista','1');
    const d=new Date();localStorage.setItem('gya_dia_alta',d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'));
  });
  await page.goto(base,{waitUntil:'load'});
  await page.evaluate(()=>{document.querySelector('#splash')?.remove();document.querySelectorAll('.capa.ver').forEach(el=>el.classList.remove('ver'));});
  await page.locator('#bExtensiones').click();
  assert.equal(await page.locator('.ext-tarjeta').count(),4);
  if(process.env.UI_SCREENSHOTS){fs.mkdirSync(process.env.UI_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'frases-lobby-'+page.viewportSize().width+'.png')});}
  await page.locator('.ext-tarjeta').last().click();
}

async function fraseActual(page){
  return page.evaluate(()=>{
    const pista=document.querySelector('#fgPista').textContent.replace(/^Escena: /,'');
    const d=FRASES_EN_GIRO_DATOS.find(x=>x.pista===pista);
    if(!d)throw Error('Pista sin frase: '+pista);
    return{texto:d.texto,palabras:d.texto.split(' '),config:FrasesEnGiro.configNivel(Number(document.querySelector('#fgNivel').textContent))};
  });
}

async function resolver(page,malPrimero=false){
  return page.evaluate(malPrimero=>{
    const pista=document.querySelector('#fgPista').textContent.replace(/^Escena: /,'');
    const palabras=FRASES_EN_GIRO_DATOS.find(x=>x.pista===pista).texto.split(' ');
    const tocar=palabra=>{
      const boton=[...document.querySelectorAll('#fgBanco button')].find(b=>b.textContent===palabra);
      if(!boton||boton.disabled)throw Error('No se puede elegir '+palabra);
      boton.click();
    };
    let resultado=null;
    if(malPrimero){
      const tiempoAntes=Number(document.querySelector('#fgTiempo').textContent);
      [palabras[1],palabras[0],...palabras.slice(2)].forEach(tocar);
      document.querySelector('#fgComprobar').click();
      resultado={mensaje:document.querySelector('#fgMensaje').textContent,intentos:document.querySelector('#fgIntentos').textContent,marcas:[...document.querySelectorAll('#fgEspacios button')].map(b=>b.className),tiempoAntes,tiempoDespues:Number(document.querySelector('#fgTiempo').textContent)};
    }
    palabras.forEach(tocar);
    document.querySelector('#fgComprobar').click();
    return resultado;
  },malPrimero);
}

(async()=>{
  const server=http.createServer((req,res)=>{
    const pathname=new URL(req.url,'http://local').pathname;
    const file=path.join(root,pathname==='/'?'index.html':pathname);
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});
  try{
    for(const viewport of [{width:360,height:780},{width:1280,height:900}]){
      const context=await browser.newContext({viewport,isMobile:viewport.width===360,hasTouch:viewport.width===360,serviceWorkers:'block'});
      const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
      await preparar(page,base);
      const contenido=await page.evaluate(()=>FRASES_EN_GIRO_DATOS.map(d=>({nivel:d.nivel,pista:d.pista,texto:d.texto,trampas:d.trampas})));
      assert.equal(contenido.length,36);
      assert.equal(new Set(contenido.map(d=>d.pista)).size,contenido.length,'cada pista identifica una frase');
      assert.equal(new Set(contenido.map(d=>d.texto)).size,contenido.length,'sin frases repetidas');
      for(const d of contenido){
        const palabras=d.texto.split(' ').map(w=>w.toLocaleLowerCase('es'));
        assert(palabras.length>=5&&palabras.length<=10,'frase jugable en celular: '+d.texto);
        assert.equal(d.trampas.length,3);
        assert(d.trampas.every(w=>!palabras.includes(w.toLocaleLowerCase('es'))),'señuelo distinto: '+d.texto);
      }
      const economiaAntes=await page.evaluate(()=>({monedas:meta.monedas,vidas:meta.vidas,tickets:meta.tickets}));
      assert.match(await page.locator('.fg-panel h3').textContent(),/Frases en Giro/);
      await page.evaluate(()=>{
        window.__efectosFrases=[];
        window.__notasAcierto=[];
        const bipOriginal=window.bip;
        window.bip=function(f,...rest){
          if(f===720&&sonidoPermitido())window.__notasAcierto.push(f);
          return bipOriginal(f,...rest);
        };
        const reproducir=HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play=function(){
          if(this.src.includes('festejo-frase.mp3'))window.__efectosFrases.push(this.src);
          return reproducir.call(this);
        };
      });
      await page.evaluate(()=>{FRASES_GIRO_CONFIG.niveles[1].giro=1.2;FRASES_GIRO_CONFIG.giroAnimacionMs=180;window.fgGiros=0;new MutationObserver(()=>{if(document.querySelector('#fgBanco')?.classList.contains('gira'))window.fgGiros++;}).observe(document.querySelector('#fgBanco'),{attributes:true,attributeFilter:['class']});});
      await page.locator('.fg-panel .fg-principal').click();
      const primera=await fraseActual(page);
      assert.equal(primera.config.senuelos,0);
      assert.equal(await page.locator('#fgBanco button').count(),primera.palabras.length);
      await page.waitForFunction(()=>window.fgGiros>0);
      await page.waitForFunction(()=>!document.querySelector('#fgBanco').classList.contains('gira'));
      await resolver(page);
      assert.match(await page.locator('.fg-panel h3').textContent(),/Frase armada/);
      assert.equal(await page.evaluate(()=>window.__efectosFrases.length),1,'una frase correcta reproduce su festejo');
      assert.equal(await page.evaluate(()=>window.__notasAcierto.length),1,'cada acierto inicia una señal corta');
      assert.equal(await page.locator('#fgNivel').textContent(),'1','el tablero terminado conserva el nivel jugado');
      await page.locator('.fg-panel .fg-principal').click();
      const segunda=await fraseActual(page);
      assert.equal(await page.locator('#fgBanco button').count(),segunda.palabras.length+1,'nivel 2 agrega señuelo');
      const error=await resolver(page,true);
      assert.match(error.mensaje,/Perdiste un intento y 10 segundos/);
      assert.match(error.mensaje,/de \d+ palabras estaban en su lugar/);
      assert.equal(error.intentos,'2');
      assert(error.marcas.every(c=>c.includes('vacio')),'el error obliga a rearmar la frase sin revelar posiciones');
      assert(error.tiempoAntes-error.tiempoDespues>=9,'el error quita unos 10 segundos');
      assert.match(await page.locator('.fg-panel h3').textContent(),/Frase armada/);
      const efectosAntesDeSilenciar=await page.evaluate(()=>window.__efectosFrases.length);
      assert(efectosAntesDeSilenciar>=1,'una frase correcta mantiene el efecto de festejo disponible');
      assert.equal(await page.evaluate(()=>window.__notasAcierto.length),2,'la señal corta suena aunque el festejo anterior continúe');
      for(let n=3;n<=5;n++){
        await page.locator('.fg-panel .fg-principal').click();
        const actual=await fraseActual(page);
        assert.equal(await page.locator('#fgBanco button').count(),actual.palabras.length+actual.config.senuelos);
        if(n===3)await page.evaluate(()=>{musicaOn=false;silenciarTodo();});
        await resolver(page);
        assert.match(await page.locator('.fg-panel h3').textContent(),/Frase armada/);
        if(n===3){
          assert.equal(await page.evaluate(()=>window.__efectosFrases.length),efectosAntesDeSilenciar,'con el sonido apagado no reproduce el festejo');
          assert.equal(await page.evaluate(()=>window.__notasAcierto.length),2,'con el sonido apagado no suena la señal corta');
          await page.evaluate(()=>{musicaOn=true;});
        }
      }
      const almacen=await page.evaluate(()=>JSON.parse(localStorage.getItem('gya_frases_en_giro')));
      assert.equal(almacen.nivelMax,6);assert.equal(almacen.ganadas,5);assert(almacen.mejor>0);
      const economiaDespues=await page.evaluate(()=>({monedas:meta.monedas,vidas:meta.vidas,tickets:meta.tickets}));
      assert.deepEqual(economiaDespues,economiaAntes);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'sin desborde horizontal');
      if(process.env.UI_SCREENSHOTS){fs.mkdirSync(process.env.UI_SCREENSHOTS,{recursive:true});await page.locator('.fg-panel .fg-principal').click();await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'frases-'+viewport.width+'.png'),fullPage:true});}
      await page.locator('#extAtras').click();
      assert.match(await page.locator('.ext-tarjeta').last().textContent(),new RegExp(String(almacen.mejor)));
      await page.locator('.ext-tarjeta').last().click();
      assert.match(await page.locator('.fg-panel .fg-principal').textContent(),/nivel 6/);
      await page.locator('.fg-panel .fg-principal').click();
      await resolver(page);
      await page.locator('.fg-panel .fg-principal').click();
      const puntosEnJuego=Number(await page.locator('#fgPuntos').textContent());
      assert(puntosEnJuego>0,'la derrota debe tener puntos en juego');
      await page.evaluate(()=>{
        const pista=document.querySelector('#fgPista').textContent.replace(/^Escena: /,'');
        const palabras=FRASES_EN_GIRO_DATOS.find(x=>x.pista===pista).texto.split(' ');
        for(let i=0;i<3;i++){
          for(const palabra of [palabras[1],palabras[0],...palabras.slice(2)]){
            const b=[...document.querySelectorAll('#fgBanco button')].find(x=>x.textContent===palabra);
            if(!b)throw Error('Falta ficha '+palabra);
            b.click();
          }
          document.querySelector('#fgComprobar').click();
        }
      });
      assert.match(await page.locator('.fg-panel h3').textContent(),/Perdiste esta frase/);
      assert.match(await page.locator('.fg-panel p').textContent(),/Agotaste los 3 intentos/);
      assert.match(await page.locator('.fg-panel p').textContent(),new RegExp('perdiste '+puntosEnJuego+' puntos'));
      assert.equal(await page.locator('#fgPuntos').textContent(),'0','la derrota reinicia los puntos de la partida');
      if(process.env.UI_SCREENSHOTS){await page.waitForTimeout(750);await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'frases-derrota-'+viewport.width+'.png')});}
      await page.evaluate(()=>{FRASES_GIRO_CONFIG.niveles[7]={...FrasesEnGiro.configNivel(7),segundos:.2};});
      await page.locator('.fg-panel .fg-principal').click();
      assert.equal(await page.locator('#fgNivel').textContent(),'7','un fallo permite otra frase del mismo nivel');
      await page.locator('.fg-panel h3').filter({hasText:'Perdiste esta frase'}).waitFor();
      assert.match(await page.locator('.fg-panel p').textContent(),/Se terminó el tiempo/);
      assert.deepEqual(errors,[]);
      console.log('PASS Frases en Giro',viewport.width,'giro, señuelos, error, progresión, persistencia y economía');
      await context.close();
    }
  }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
