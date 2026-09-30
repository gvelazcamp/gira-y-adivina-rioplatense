const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
async function arrastrar(page,palabra){
  const indices=await page.locator('.rl-letra').evaluateAll((els,w)=>{const usadas=new Set();return [...w].map(l=>{const i=els.findIndex((e,k)=>!usadas.has(k)&&e.textContent===l);if(i<0)throw Error(w);usadas.add(i);return i;});},palabra);
  const p=await page.locator('.rl-letra').evaluateAll((els,ks)=>ks.map(k=>{const b=els[k].getBoundingClientRect();return{x:b.x+b.width/2,y:b.y+b.height/2};}),indices);
  await page.mouse.move(p[0].x,p[0].y);await page.mouse.down();for(const q of p.slice(1))await page.mouse.move(q.x,q.y,{steps:2});await page.mouse.up();
}
async function arrastrarTouch(page,palabra){
  const indices=await page.locator('.rl-letra').evaluateAll((els,w)=>{const usadas=new Set();return [...w].map(l=>{const i=els.findIndex((e,k)=>!usadas.has(k)&&e.textContent===l);if(i<0)throw Error(w);usadas.add(i);return i;});},palabra);
  const p=await page.locator('.rl-letra').evaluateAll((els,ks)=>ks.map(k=>{const b=els[k].getBoundingClientRect();return{x:b.x+b.width/2,y:b.y+b.height/2};}),indices);
  const cdp=await page.context().newCDPSession(page),point=q=>[{x:q.x,y:q.y,id:1}];
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:point(p[0])});
  for(const q of [p[1],p[2],p[1],...p.slice(2)])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:point(q)});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await cdp.detach();
}
(async()=>{
  const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://local').pathname;const f=path.join(root,pathname==='/'?'index.html':pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});
  try{for(const viewport of [{width:360,height:780},{width:1280,height:900}]){
    const ctx=await browser.newContext({viewport,isMobile:viewport.width===360,hasTouch:viewport.width===360,serviceWorkers:'block'}),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.fulfill({status:200,body:''}));
    await page.addInitScript(()=>{localStorage.setItem('gya_bienvenida_vista','1');localStorage.setItem('gya_nombre','Prueba');localStorage.setItem('gya_rueda_de_letras',JSON.stringify({mejor:160,nivelMax:2,completadas:1,tiempos:[]}));});
    await page.goto(base);await page.evaluate(()=>{document.querySelector('#splash')?.remove();document.querySelectorAll('.capa.ver').forEach(e=>e.classList.remove('ver'));});
    const economia=await page.evaluate(()=>({monedas:meta.monedas,vidas:meta.vidas,tickets:meta.tickets}));
    await page.locator('#bExtensiones').click();await page.locator('.ext-tarjeta').nth(1).click();await page.locator('#rlPanel button').click();
    const c=await page.evaluate(()=>({ronda:RuedaDeLetras.elegir(1),ms:RuedaDeLetras.tiempoRonda(RuedaDeLetras.elegir(1).palabras,1)}));assert(c.ms>0);
    const datosValidos=await page.evaluate(()=>{for(let n=1;n<=24;n++){const c=RuedaDeLetras.configNivel(n),r=RuedaDeLetras.elegir(n);if(r.palabras.length!==c.palabras)return n;for(const w of r.palabras){const letras=[...r.base];for(const l of w){const i=letras.indexOf(l);if(i<0)return n;letras.splice(i,1);}}}return 0;});assert.equal(datosValidos,0,'nivel con datos inválidos');
    const diccionarioValido=await page.evaluate(()=>{if(RUEDA_DICCIONARIO.size<1000||!RUEDA_DICCIONARIO.has('OBRA')||RUEDA_DICCIONARIO.has('TBM'))return false;for(const word of RUEDA_DICCIONARIO){if(!/^[A-Z]{3,7}$/.test(word)||!RUEDA_DATOS.some(({base})=>{const letters=[...base];for(const letter of word){const index=letters.indexOf(letter);if(index<0)return false;letters.splice(index,1);}return true;}))return false;}return true;});assert(diccionarioValido,'diccionario inválido');
    assert.equal(await page.locator('.rl-letra').count(),6);
    assert.equal(await page.locator('#rlMejor').textContent(),'160','se conserva el récord anterior al cajón');
    assert.equal(await page.locator('#rlColeccionCount').textContent(),'0','los datos anteriores comienzan con el cajón vacío');
    await page.locator('#rlGirar').click();await page.waitForTimeout(800);
    if(process.env.UI_SCREENSHOTS){fs.mkdirSync(process.env.UI_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'rueda-'+viewport.width+'.png')});}
    assert(!c.ronda.palabras.includes('OBRA'));
    await arrastrar(page,'OBRA');
    assert.equal(await page.locator('#rlPuntos').textContent(),'20');
    assert.equal(await page.locator('#rlColeccionCount').textContent(),'1');
    assert.equal(await page.locator('#rlColeccionUnidad').textContent(),'palabra');
    assert.equal(await page.locator('#rlExtrasCount').textContent(),'1');
    assert.match(await page.locator('#rlUltimaGuardada').textContent(),/OBRA cayó/);
    assert((await page.evaluate(()=>JSON.parse(localStorage.getItem('gya_rueda_de_letras')).coleccion)).includes('OBRA'),'la palabra se guarda al encontrarla');
    await page.locator('.rl-cajon summary').click();
    assert.equal(await page.locator('#rlRondaLista .rl-palabra.extra').textContent(),'OBRA');
    assert.equal(await page.locator('#rlColeccionLista .rl-palabra').textContent(),'OBRA');
    assert.equal(await page.locator('.rl-pista.hecho').count(),0,'la extra no completa palabras ocultas');
    if(process.env.UI_SCREENSHOTS){await page.waitForTimeout(650);await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'rueda-extra-'+viewport.width+'.png'),fullPage:true});}
    await page.locator('.rl-cajon summary').click();
    await arrastrar(page,'OBRA');
    assert.equal(await page.locator('#rlPuntos').textContent(),'20','la extra repetida no suma');
    assert.equal(await page.locator('#rlColeccionCount').textContent(),'1','la palabra repetida no duplica la colección');
    await arrastrar(page,'TBM');
    assert.equal(await page.locator('#rlPuntos').textContent(),'20','la palabra inválida no suma');
    for(const word of c.ronda.palabras)await arrastrar(page,word);
    await page.locator('#rlPanel h3').waitFor();assert.match(await page.locator('#rlPanel h3').textContent(),/completada/);
    assert.equal(await page.evaluate(()=>objObtenerHoy().ruedaRonda),1);
    assert.equal(await page.evaluate(()=>objObtenerHoy().ruedaPalabras),6);
    assert.equal(await page.locator('#rlColeccionCount').textContent(),'7','las ocultas también caen al cajón');
    await page.locator('#rlPanel button').click();assert.equal(await page.locator('.rl-letra').count(),6);
    assert.equal(await page.locator('#rlExtrasCount').textContent(),'0','las extras se reinician en la nueva ronda');
    assert.equal(await page.locator('#rlColeccionCount').textContent(),'7','el cajón se conserva al cambiar de ronda');
    await arrastrarTouch(page,'SALADO');assert.equal(await page.locator('.rl-pista.hecho').count(),1,'touch con letra repetida y corrección');
    assert.equal(await page.locator('#rlColeccionCount').textContent(),'8');
    await page.locator('#extAtras').click();await page.locator('.ext-tarjeta').nth(1).click();await page.locator('#rlPanel button').click();
    assert.equal(await page.locator('#rlColeccionCount').textContent(),'8','el cajón se conserva entre partidas');
    assert.equal(await page.locator('#rlRondaCount').textContent(),'0','la ronda nueva comienza vacía');
    assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('gya_rueda_de_letras')).mejor)>0);
    assert.deepEqual(await page.evaluate(()=>({monedas:meta.monedas,vidas:meta.vidas,tickets:meta.tickets})),economia);
    assert.equal(errors.length,0,errors.join('\n'));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await ctx.close();
  }console.log('Rueda de Letras: OK');}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
