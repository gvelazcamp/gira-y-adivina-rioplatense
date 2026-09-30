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
(async()=>{
  const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://local').pathname;const f=path.join(root,pathname==='/'?'index.html':pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});
  try{for(const viewport of [{width:360,height:780},{width:1280,height:900}]){
    const ctx=await browser.newContext({viewport,serviceWorkers:'block'}),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.fulfill({status:200,body:''}));
    await page.addInitScript(()=>{localStorage.setItem('gya_bienvenida_vista','1');localStorage.setItem('gya_nombre','Prueba');});
    await page.goto(base);await page.evaluate(()=>{document.querySelector('#splash')?.remove();document.querySelectorAll('.capa.ver').forEach(e=>e.classList.remove('ver'));});
    const economia=await page.evaluate(()=>({monedas:meta.monedas,vidas:meta.vidas,tickets:meta.tickets}));
    await page.locator('#bExtensiones').click();await page.locator('.ext-tarjeta').nth(1).click();await page.locator('#rlPanel button').click();
    const c=await page.evaluate(()=>({ronda:RuedaDeLetras.elegir(1),ms:RuedaDeLetras.tiempoRonda(RuedaDeLetras.elegir(1).palabras,1)}));assert(c.ms>0);
    assert.equal(await page.locator('.rl-letra').count(),6);
    await page.locator('#rlGirar').click();await page.waitForTimeout(800);
    for(const word of c.ronda.palabras)await arrastrar(page,word);
    await page.locator('#rlPanel h3').waitFor();assert.match(await page.locator('#rlPanel h3').textContent(),/completada/);
    assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('gya_rueda_de_letras')).mejor)>0);
    assert.deepEqual(await page.evaluate(()=>({monedas:meta.monedas,vidas:meta.vidas,tickets:meta.tickets})),economia);
    assert.equal(errors.length,0,errors.join('\n'));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await ctx.close();
  }console.log('Rueda de Letras: OK');}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
