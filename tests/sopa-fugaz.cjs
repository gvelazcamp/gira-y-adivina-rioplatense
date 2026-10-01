const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.json':'application/json'};

function encontrarPalabra(letras,n,palabra){
  const dirs=[[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)for(const [dr,dc] of dirs){
    const ks=Array.from({length:palabra.length},(_,i)=>[r+dr*i,c+dc*i]);
    if(ks.every(([rr,cc],i)=>rr>=0&&rr<n&&cc>=0&&cc<n&&letras[rr*n+cc]===palabra[i]))return ks.map(([rr,cc])=>rr*n+cc);
  }
  throw Error('No se encontró '+palabra);
}
async function arrastrar(page,indices){
  const boxes=await page.locator('.sf-celda').evaluateAll((els,ks)=>ks.map(k=>{
    const b=els[k].getBoundingClientRect();return{x:b.x+b.width/2,y:b.y+b.height/2};
  }),indices);
  await page.mouse.move(boxes[0].x,boxes[0].y);
  await page.mouse.down();
  for(const b of boxes.slice(1))await page.mouse.move(b.x,b.y,{steps:2});
  await page.mouse.up();
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
      const page=await context.newPage(),errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.fulfill({status:200,body:''}));
      await page.addInitScript(()=>{localStorage.setItem('gya_nombre','Prueba');localStorage.setItem('gya_avatar','avatar-01');localStorage.setItem('gya_pais','uruguay');localStorage.setItem('gya_bienvenida_vista','1');const d=new Date();localStorage.setItem('gya_dia_alta',d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'));});
      await page.goto(base,{waitUntil:'load'});
      await page.evaluate(()=>{document.querySelector('#splash')?.remove();document.querySelectorAll('.capa.ver').forEach(el=>el.classList.remove('ver'));});
      assert.equal(await page.locator('#bExtensiones').isVisible(),true);
      const economiaAntes=await page.evaluate(()=>({monedas:meta.monedas,vidas:meta.vidas,tickets:meta.tickets}));
      await page.locator('#bExtensiones').click();
      assert.equal(await page.locator('.ext-tarjeta').count(),8);
      if(process.env.UI_SCREENSHOTS){fs.mkdirSync(process.env.UI_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'lobby-'+viewport.width+'.png')});}
      await page.locator('.ext-tarjeta').first().click();
      await page.locator('.sf-panel .sf-principal').click();
      assert.equal(await page.locator('.sf-celda').count(),100);
      if(process.env.UI_SCREENSHOTS)await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'sopa-'+viewport.width+'.png')});
      const niveles=await page.evaluate(()=>[SopaFugaz.configNivel(1),SopaFugaz.configNivel(7),SopaFugaz.configNivel(12)]);
      assert.equal(niveles[0].n,10);assert.equal(niveles[1].n,12);assert.equal(niveles[2].n,12);
      assert(niveles[2].mudanza>=3.5&&niveles[2].margen>=.75);
      const layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth,gridWidth:document.querySelector('#sfGrid').getBoundingClientRect().width}));
      assert(layout.scrollWidth<=layout.innerWidth,'horizontal overflow '+JSON.stringify(layout));
      assert(layout.gridWidth<=Math.min(500,viewport.width));
      const words=await page.locator('.sf-chip').allTextContents();
      assert.equal(await page.locator('#sfHistorialTitulo').textContent(),'📖 Mis palabras encontradas (0)');
      const inicial=await page.locator('.sf-celda').allTextContents();
      const horizontal=words.some(w=>{try{const ks=encontrarPalabra(inicial,10,w);return ks[1]-ks[0]===1;}catch{return false;}});
      const vertical=words.some(w=>{try{const ks=encontrarPalabra(inicial,10,w);return ks[1]-ks[0]===10;}catch{return false;}});
      assert(horizontal&&vertical,'nivel inicial tiene palabras horizontales y verticales');
      for(const word of words){
        const letras=await page.locator('.sf-celda').allTextContents();
        const indices=encontrarPalabra(letras,10,word);
        await arrastrar(page,indices);
        assert.equal(await page.locator('.sf-chip').filter({hasText:word}).getAttribute('class'),'sf-chip hecho');
      }
      await page.locator('.sf-panel h3').waitFor();
      assert.match(await page.locator('.sf-panel h3').textContent(),/Ronda superada/);
      const best=await page.evaluate(()=>JSON.parse(localStorage.getItem('gya_sopa_fugaz')).mejor);
      assert(best>=300);
      await page.locator('.sf-panel .sf-principal').click();
      assert.equal(await page.locator('.sf-celda').count(),100);
      const words2=await page.locator('.sf-chip').allTextContents();
      assert(words2.every(w=>!words.includes(w)),'la segunda ronda no repite palabras resueltas');
      await page.locator('.sf-historial summary').click();
      const historial=await page.locator('#sfHistorialLista').textContent();
      assert(words.every(w=>historial.includes(w)),'historial muestra las palabras descubiertas');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'historial sin desborde horizontal');
      if(process.env.UI_SCREENSHOTS)await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'historial-sopa-'+viewport.width+'.png'),fullPage:true});
      await page.locator('.sf-historial summary').click();
      for(const word of words2){
        const letras=await page.locator('.sf-celda').allTextContents();
        await arrastrar(page,encontrarPalabra(letras,10,word));
      }
      await page.locator('.sf-panel h3').waitFor();
      await page.evaluate(()=>{SOPA_CONFIG.niveles[3].mudanza=1.2;SOPA_CONFIG.giroMs=220;});
      await page.locator('.sf-panel .sf-principal').click();
      const primera=await page.locator('.sf-celda').first().boundingBox();
      await page.mouse.move(primera.x+primera.width/2,primera.y+primera.height/2);
      await page.mouse.down();
      await page.waitForTimeout(1400);
      assert.match(await page.locator('#sfMudanzaTexto').textContent(),/en espera/);
      assert.equal(await page.locator('#sfGrid').getAttribute('class'),'sf-grid','la mudanza espera el arrastre');
      await page.evaluate(()=>{window.sfGiros=0;new MutationObserver(()=>{if(document.querySelector('#sfGrid')?.classList.contains('spin'))window.sfGiros++;}).observe(document.querySelector('#sfGrid'),{attributes:true,attributeFilter:['class']});});
      await page.mouse.up();
      await page.waitForFunction(()=>window.sfGiros>0);
      await page.waitForFunction(()=>!document.querySelector('#sfGrid').classList.contains('spin'));
      const palabra3=(await page.locator('.sf-chip').allTextContents())[0];
      assert(!words.includes(palabra3)&&!words2.includes(palabra3));
      const letras3=await page.locator('.sf-celda').allTextContents();
      await arrastrar(page,encontrarPalabra(letras3,10,palabra3).reverse());
      assert.equal(await page.locator('.sf-chip').first().getAttribute('class'),'sf-chip hecho','acepta lectura al revés desde nivel 3');
      const economiaDespues=await page.evaluate(()=>({monedas:meta.monedas,vidas:meta.vidas,tickets:meta.tickets}));
      assert.deepEqual(economiaDespues,economiaAntes);
      const ultimoMejor=await page.evaluate(()=>JSON.parse(localStorage.getItem('gya_sopa_fugaz')).mejor);
      await page.locator('#extAtras').click();
      assert.match(await page.locator('.ext-tarjeta').first().textContent(),new RegExp(String(ultimoMejor)));
      await page.locator('.ext-tarjeta').first().click();
      assert.equal(await page.locator('#sfHistorialTitulo').textContent(),'📖 Mis palabras encontradas (7)');
      await page.locator('.sf-panel .sf-principal').click();
      const wordsNuevas=await page.locator('.sf-chip').allTextContents();
      assert(wordsNuevas.every(w=>![...words,...words2,palabra3].includes(w)),'al volver a abrir no repite palabras resueltas');
      await page.locator('#extCerrar').click();
      await page.evaluate(()=>recAbrir());
      assert.match(await page.locator('#recLista').textContent(),/Sopa Fugaz/);
      if(viewport.width===360){
        await page.evaluate(()=>{
          $('capaRecords').classList.remove('ver');
          const todas=[...new Set([SOPA_DATOS.inicial,...SOPA_DATOS.categorias].flatMap(f=>f.palabras))];
          localStorage.setItem('gya_sopa_fugaz',JSON.stringify({mejor:0,palabrasTotal:0,nivelMax:1,palabras:[],descubiertas:todas.filter(w=>w!=='MATE'&&w!=='ASADO'),niveles:{}}));
          Extensiones.abrirJuego('sopa-fugaz');
        });
        await page.locator('.sf-panel .sf-principal').click();
        assert.deepEqual((await page.locator('.sf-chip').allTextContents()).sort(),['ASADO','MATE']);
        for(const word of ['ASADO','MATE']){const letras=await page.locator('.sf-celda').allTextContents();await arrastrar(page,encontrarPalabra(letras,10,word));}
        await page.locator('.sf-panel .sf-principal').click();
        assert.match(await page.locator('.sf-panel h3').textContent(),/Encontraste todas/);
        await page.locator('.sf-panel .sf-principal').click();
        assert.equal(await page.locator('.sf-chip').count(),3,'el repaso sólo comienza con elección explícita');
        await page.locator('#extCerrar').click();
      }
      assert.deepEqual(errors,[]);
      console.log('PASS Sopa Fugaz',viewport.width,'rondas, mudanza, arrastre, reverso, récord, economía, layout');
      await context.close();
    }
  }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
