const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');

(async()=>{
 const server=http.createServer((req,res)=>{
  const file=path.join(root,new URL(req.url,'http://local').pathname.replace(/^\/$/,'/index.html'));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  const ext=path.extname(file);
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp'})[ext]||'application/octet-stream');
  res.end(fs.readFileSync(file));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});
 try{
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.fulfill({status:200,body:''}));
  await page.goto(base);
  await page.evaluate(()=>{
   localStorage.clear();perfil={nombre:'Tester',avatar:null,pais:'UY'};
   $('splash')?.remove();$('setup').style.display='none';$('juego').style.display='block';
   modo='bot';miJug=0;arranca=0;destino=0;enTorneo=false;vinoDeJugarOnline=false;esEventoCiudad=false;
   armarTeclado();iniciarPartida('Tester','Rival');
   S.turno=miJug;S.fase='girar';S.jug[0].ronda=700;
  });

  await page.evaluate(()=>{
   meta.monedas=2000;meta.escudosPierde=0;meta.escudosQuiebra=0;guardarMeta();
   if(!quierePreguntarEscudo('pierde'))throw Error('emergency buy should be offered');
   mostrarConfirmEscudo('pierde');
  });
  assert.match(await page.locator('#confirmEscudoTxt').textContent(),/salvarte ahora.*750/s);
  await page.locator('#confirmEscudoSi').click();
  await page.waitForFunction(()=>!document.querySelector('#confirmEscudo').style.display.includes('flex'));
  assert.equal(await page.evaluate(()=>meta.monedas),1250);
  assert.equal(await page.evaluate(()=>S.fase),'girar');

  await page.evaluate(()=>{
   escudoTiendaUsadoEnPartida=false;meta.monedas=100;meta.escudosQuiebra=1;guardarMeta();
   S.turno=miJug;S.fase='girar';S.jug[0].ronda=900;mostrarConfirmEscudo('quiebra');
  });
  await page.locator('#confirmEscudoSi').click();
  await page.waitForFunction(()=>!document.querySelector('#confirmEscudo').style.display.includes('flex'));
  assert.equal(await page.evaluate(()=>meta.monedas),100);
  assert.equal(await page.evaluate(()=>meta.escudosQuiebra),0);
  assert.equal(await page.evaluate(()=>S.jug[0].ronda),900);

  await page.evaluate(()=>{
   escudoTiendaUsadoEnPartida=false;meta.monedas=100;meta.escudosQuiebra=0;guardarMeta();
   mostrarConfirmEscudo('quiebra');
  });
  assert.equal(await page.locator('#confirmEscudoSi').isDisabled(),true);
  assert.deepEqual(errors,[]);
  console.log('PASS emergency shield prompt');
 }finally{
  await browser.close();
  await new Promise(r=>server.close(r));
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
