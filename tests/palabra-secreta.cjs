const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
async function abrir(page,base){await page.goto(base);await page.evaluate(()=>{document.querySelector('#splash')?.remove();document.querySelectorAll('.capa.ver').forEach(e=>e.classList.remove('ver'));});await page.locator('#bExtensiones').click();await page.locator('.ext-tarjeta').nth(2).click();if(await page.locator('#psAyudaPanel').isVisible())await page.locator('#psAyudaPanel button').click();}
(async()=>{
 const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://local').pathname,f=path.join(root,p==='/'?'index.html':p);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});
 try{for(const viewport of [{width:360,height:780},{width:1280,height:900}]){
  const context=await browser.newContext({viewport,serviceWorkers:'block',permissions:['clipboard-read','clipboard-write']}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.fulfill({status:200,body:''}));
  await page.addInitScript(()=>{localStorage.setItem('gya_bienvenida_vista','1');localStorage.setItem('gya_nombre','Prueba');});
  await abrir(page,base);
  if(process.env.UI_SCREENSHOTS){fs.mkdirSync(process.env.UI_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'palabra-'+viewport.width+'.png')});}
  const datos=await page.evaluate(()=>({secret:PalabraSecreta.palabraDia(),dia:PalabraSecreta.indiceDia(),len:PALABRA_SECRETAS.length,eval:PalabraSecreta.evaluar('SALSA','ASADO'),antes:PalabraSecreta.indiceDia(new Date('2026-09-30T02:59:00Z')),despues:PalabraSecreta.indiceDia(new Date('2026-09-30T03:00:00Z'))}));
  assert(datos.len>=365);assert.deepEqual(datos.eval,['presente','presente','ausente','ausente','presente']);
  assert.equal(datos.despues,datos.antes+1,'cambia a medianoche de Uruguay');
  if(viewport.width===360){const otro=await browser.newContext({timezoneId:'America/Los_Angeles',serviceWorkers:'block'}),p2=await otro.newPage();await p2.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.fulfill({status:200,body:''}));await p2.goto(base);assert.equal(await p2.evaluate(()=>PalabraSecreta.palabraDia()),datos.secret);await otro.close();}
  const economia=await page.evaluate(()=>({monedas:meta.monedas,vidas:meta.vidas,tickets:meta.tickets}));
  await page.keyboard.type('AAAAA');await page.keyboard.press('Enter');assert.match(await page.locator('#psMensaje').textContent(),/diccionario/);
  await page.keyboard.press('Backspace');await page.keyboard.press('Backspace');await page.keyboard.press('Backspace');await page.keyboard.press('Backspace');await page.keyboard.press('Backspace');
  const intento=datos.secret==='ASADO'?'TANGO':'ASADO';await page.keyboard.type(intento);await page.keyboard.press('Enter');assert.equal(await page.locator('.ps-fila').first().locator('.ps-celda').allTextContents().then(x=>x.join('')),intento);
  await page.reload();await page.evaluate(()=>{document.querySelector('#splash')?.remove();document.querySelectorAll('.capa.ver').forEach(e=>e.classList.remove('ver'));});await page.locator('#bExtensiones').click();await page.locator('.ext-tarjeta').nth(2).click();assert.equal(await page.locator('.ps-fila').first().locator('.ps-celda').allTextContents().then(x=>x.join('')),intento);
  await page.keyboard.type(datos.secret);await page.keyboard.press('Enter');assert.match(await page.locator('#psFinal').textContent(),/Compartir resultado/);
  const progreso=await page.evaluate(()=>JSON.parse(localStorage.getItem('gya_palabra_secreta')));assert.equal(progreso.ganadas,1);assert.equal(progreso.diaria.dia,datos.dia);
  assert.equal(await page.evaluate(()=>objObtenerHoy().palabraDiaria),1);
  assert.equal(progreso.distribucion[1],1);
  await page.reload();await page.evaluate(()=>{document.querySelector('#splash')?.remove();document.querySelectorAll('.capa.ver').forEach(e=>e.classList.remove('ver'));});await page.locator('#bExtensiones').click();await page.locator('.ext-tarjeta').nth(2).click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('gya_palabra_secreta')).ganadas),1);
  await page.locator('#psFinal button').first().click();const copia=await page.evaluate(()=>navigator.clipboard.readText());assert(!copia.includes(datos.secret));assert.match(copia,/🟩🟩🟩🟩🟩/);
  await page.locator('#psFinal button').nth(1).click();assert.match(await page.locator('#psMensaje').textContent(),/práctica/);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('gya_palabra_secreta')).ganadas),1);
  assert.deepEqual(await page.evaluate(()=>({monedas:meta.monedas,vidas:meta.vidas,tickets:meta.tickets})),economia);
  assert.equal(errors.length,0,errors.join('\n'));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await context.close();
 }console.log('Palabra Secreta: OK');}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
