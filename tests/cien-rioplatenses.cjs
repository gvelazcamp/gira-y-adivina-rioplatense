const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const {cats,questions}=vm.runInNewContext(fs.readFileSync(path.join(root,'cien-rioplatenses-datos.js'),'utf8')+';({cats:CIEN_CATEGORIAS,questions:CIEN_PREGUNTAS})');
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');
assert.equal(cats.length,12);assert.equal(questions.length,36);assert.equal(new Set(questions.map(q=>q.id)).size,36);
for(const c of cats)assert.equal(questions.filter(q=>q.categoria===c.id).length,3);
for(const q of questions){assert.equal(q.respuestas.length,6);assert.equal(q.respuestas.reduce((s,r)=>s+r.puntos,0),100);const seen=new Set();for(const r of q.respuestas){for(const a of new Set([r.texto,...r.alias].map(norm))){assert(!seen.has(a),'alias ambiguo '+q.id+' '+a);seen.add(a);}}}
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');for(const file of JSON.parse(sw.match(/const APP_SHELL = (\[[^;]+\]);/)[1]))assert(fs.existsSync(path.join(root,file.split('?')[0])),'PWA '+file);
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.json':'application/json'};
(async()=>{
  const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://local').pathname,file=path.join(root,pathname==='/'?'index.html':pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  async function ready(page){await page.waitForFunction(()=>document.querySelector('.cr-game')?.dataset.fase==='responder');}
  async function question(page){return page.evaluate(()=>CIEN_PREGUNTAS.find(q=>q.pregunta===document.querySelector('#crPregunta').textContent));}
  async function send(page,answer,enter=true){await page.locator('#crEntrada').fill(answer);if(enter)await page.locator('#crEntrada').press('Enter');else await page.locator('#crEnviar').click();}
  async function shot(page,name){if(process.env.UI_SCREENSHOTS){fs.mkdirSync(process.env.UI_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,name+'.png')});}}
  try{for(const [motor,tipo] of [['chromium',chromium],['webkit',webkit]]){
    const browser=await tipo.launch(motor==='chromium'?{headless:true,executablePath:process.env.BROWSER_EXECUTABLE}:{headless:true});
    try{for(const viewport of motor==='chromium'?[{width:360,height:780},{width:1280,height:900}]:[{width:360,height:780}]){
      const context=await browser.newContext({viewport,isMobile:viewport.width===360,hasTouch:viewport.width===360,serviceWorkers:'block'});
      const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.fulfill({status:200,body:''}));
      await page.addInitScript(()=>{localStorage.setItem('gya_nombre','Prueba');localStorage.setItem('gya_avatar','avatar-01');localStorage.setItem('gya_pais','uruguay');localStorage.setItem('gya_bienvenida_vista','1');const d=new Date();localStorage.setItem('gya_dia_alta',[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'));});
      await page.goto(base,{waitUntil:'load'});await page.evaluate(()=>{document.querySelector('#splash')?.remove();document.querySelectorAll('.capa.ver').forEach(e=>e.classList.remove('ver'));});
      const economia=await page.evaluate(()=>({monedas:meta.monedas,vidas:meta.vidas,tickets:meta.tickets}));
      await page.locator('#bExtensiones').click();await page.locator('.ext-tarjeta').filter({hasText:'100 Rioplatenses'}).click();
      assert.equal(await page.locator('.cr-gajo').count(),12);assert.match(await page.locator('.cr-nota').textContent(),/sin encuesta real/);
      assert(await page.locator('.cr-titulo img').evaluate(e=>e.complete&&e.naturalWidth>0));
      const overlaps=await page.locator('.cr-gajo>span').evaluateAll(els=>{const r=els.map(e=>e.getBoundingClientRect());return r.flatMap((a,i)=>r.slice(i+1).filter(b=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2));});
      await shot(page,`ruleta-${motor}-${viewport.width}`);
      assert.equal(overlaps.length,0,'los nombres de categorías no se superponen '+JSON.stringify(overlaps));
      await shot(page,`ruleta-${motor}-${viewport.width}`);
      await page.locator('#crJugar').click();await page.waitForFunction(()=>document.querySelector('.cr-game').dataset.fase==='seleccion');
      const posicion=await page.evaluate(()=>{const a=document.querySelector('.cr-gajo.elegida').getBoundingClientRect(),b=document.querySelector('#crDisco').getBoundingClientRect();return{dx:Math.abs(a.x+a.width/2-b.x-b.width/2),arriba:a.y+a.height/2<b.y+b.height/2};});
      assert(posicion.dx<3&&posicion.arriba,'la categoría elegida queda debajo del puntero');
      await ready(page);assert.equal(await page.evaluate(()=>document.activeElement.id),'crEntrada');
      await page.evaluate(()=>{CIEN_CONFIG.giroMs=80;CIEN_CONFIG.seleccionMs=30;});
      const q1=await question(page),alias=q1.respuestas[0].alias[0]||q1.respuestas[0].texto;
      await send(page,'¿'+alias.toUpperCase().replace(/A/g,'Á')+'?!');assert.equal(Number(await page.locator('#crPuntos').textContent()),q1.respuestas[0].puntos);
      await send(page,alias);assert.equal(await page.locator('#crFallos .usado').count(),0);assert.match(await page.locator('#crMensaje').textContent(),/ya está/);
      await send(page,'');assert.equal(await page.locator('#crFallos .usado').count(),0);
      await shot(page,`panel-${motor}-${viewport.width}`);
      if(viewport.width===360){await page.setViewportSize({width:360,height:430});await page.waitForTimeout(150);await page.locator('#crEntrada').focus();const b=await page.locator('#crEntrada').boundingBox(),q=await page.locator('#crPregunta').boundingBox();assert(b.y>=0&&b.y+b.height<=430);assert(q.y>=0&&q.y+q.height<=430);assert(await page.evaluate(()=>document.querySelector('.ext-shell').scrollWidth<=innerWidth));await shot(page,`teclado-${motor}`);await page.setViewportSize(viewport);}
      for(let i=0;i<3;i++)await send(page,'ZZZZ no aparece',i!==1);
      assert.equal(await page.locator('.cr-respuesta.pendiente').count(),5);assert.equal(await page.locator('#crFallos .usado').count(),3);
      await page.locator('#crSiguiente').click();await ready(page);const q2=await question(page);assert.notEqual(q2.id,q1.id);await page.locator('#crRendirse').click();
      assert.equal(await page.locator('.cr-respuesta.pendiente').count(),6);
      await page.locator('#crSiguiente').click();await ready(page);const q3=await question(page);assert(![q1.id,q2.id].includes(q3.id));
      for(const r of q3.respuestas)await send(page,r.texto,false);
      assert.equal(Number(await page.locator('#crPuntos').textContent()),q1.respuestas[0].puntos+300);
      await page.locator('#crSiguiente').click();assert.equal(await page.locator('#crResumen p').count(),3);
      assert.equal(await page.evaluate(()=>objObtenerHoy().cienRonda),3);assert(await page.evaluate(()=>logrosGanados.has('cienPanel')));
      const firstUsed=[q1.id,q2.id,q3.id];await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#crOtra').click();
      for(let i=0;i<3;i++){await ready(page);const q=await question(page);assert(!firstUsed.includes(q.id),'evita preguntas recientes');for(const r of q.respuestas)await send(page,r.texto);await page.locator('#crSiguiente').click();}
      assert.equal(await page.locator('#crResultadoPuntos').textContent(),'600');assert(await page.evaluate(()=>logrosGanados.has('cienPerfecta')));
      assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('gya_cien_rioplatenses')).mejor),600);
      await page.evaluate(()=>{window.shareCheck=null;csCompartirImagen=async(g,n,t)=>{const c=await g();window.shareCheck={width:c.width,text:t};};});await page.locator('#crCompartir').click();assert.equal(await page.evaluate(()=>shareCheck.width),720);
      await shot(page,`resultado-${motor}-${viewport.width}`);
      assert.deepEqual(await page.evaluate(()=>({monedas:meta.monedas,vidas:meta.vidas,tickets:meta.tickets})),economia);
      await page.locator('#extAtras').click();assert.match(await page.locator('.ext-tarjeta').filter({hasText:'100 Rioplatenses'}).textContent(),/600 puntos/);
      // Solo la categoría con preguntas pendientes puede salir. Al agotar el banco se renueva.
      await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('gya_cien_rioplatenses'));d.usadas=CIEN_PREGUNTAS.slice(1).map(p=>p.id);localStorage.setItem('gya_cien_rioplatenses',JSON.stringify(d));});
      await page.locator('.ext-tarjeta').filter({hasText:'100 Rioplatenses'}).click();assert.equal(await page.locator('.cr-gajo.agotada').count(),11);
      await page.locator('#crJugar').click();await ready(page);assert.equal((await question(page)).id,questions[0].id);await page.locator('#crRendirse').click();await page.locator('#crSiguiente').click();await ready(page);assert.notEqual((await question(page)).id,questions[0].id);
      await page.locator('#extAtras').click();await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>{CIEN_CONFIG.giroMs=600;});
      await page.locator('.ext-tarjeta').filter({hasText:'100 Rioplatenses'}).click();await page.locator('#crJugar').click();await page.locator('#extCerrar').click();await page.waitForTimeout(900);
      assert.equal(await page.locator('.ext-shell.cr-abierta').count(),0);assert.equal(await page.locator('#extShell').isVisible(),false);assert.deepEqual(errors,[]);
      await page.locator('#bExtensiones').click();assert.equal(await page.locator('.ext-tarjeta').count(),8);
      await page.locator('.ext-tarjeta').filter({hasText:'Silabario Rioplatense'}).click();assert(await page.locator('.sb-game').isVisible());await page.locator('#extAtras').click();
      await page.locator('.ext-tarjeta').filter({hasText:'El Rosco'}).click();assert(await page.locator('.rr-game').isVisible());await page.locator('#extCerrar').click();assert.deepEqual(errors,[]);
      console.log('PASS 100 Rioplatenses',motor,viewport.width,'ruleta, alias, errores, 3 rondas, x1/x2/x3, persistencia, agotamiento, economía y catálogo');await context.close();
    }}finally{await browser.close();}
  }}finally{server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
