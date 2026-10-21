const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{
  const file=path.join(root,new URL(req.url,'http://local').pathname.replace(/^\/$/,'/index.html'));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  const ext=path.extname(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.svg':'image/svg+xml','.css':'text/css'})[ext]||'application/octet-stream');res.end(fs.readFileSync(file));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{for(const engine of [chromium,webkit]){
  const browser=await engine.launch({headless:true,executablePath:engine===chromium?process.env.BROWSER_EXECUTABLE:undefined});
  try{
   const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.fulfill({status:200,body:''}));
   await page.goto(base);
   await page.evaluate(()=>{
    window.testVisibility='visible';Object.defineProperty(document,'visibilityState',{get:()=>window.testVisibility,configurable:true});
    window.hideGame=()=>{window.testVisibility='hidden';document.dispatchEvent(new Event('visibilitychange'));};
    window.showGame=()=>{window.testVisibility='visible';document.dispatchEvent(new Event('visibilitychange'));};
    $('splash')?.remove();modo='bot';miJug=0;arranca=0;enTutorial=false;
    $('setup').style.display='none';$('juego').style.display='block';armarTeclado();iniciarPartida('Prueba','Máquina');
    S.tFin=ahoraPartida()+600;hideGame();window.remaining=S.tFin-ahoraPartida();
    window.calls=0;esperarPartida(()=>window.calls++,300);
   });
   await page.waitForTimeout(1000);
   assert.equal(await page.evaluate(()=>S.tFin-ahoraPartida()),await page.evaluate(()=>window.remaining));
   assert.equal(await page.evaluate(()=>window.calls),0);
   await page.evaluate(()=>showGame());await page.waitForTimeout(350);
   assert.equal(await page.evaluate(()=>window.calls),1);
   assert.equal(await page.evaluate(()=>S.turno),0);
   console.log('PASS',engine.name(),'normal clock and delayed actions pause/resume');

   await page.evaluate(()=>{detenerPartidaAnterior();modo='bot';arranca=1;iniciarPartida('Prueba','Máquina');hideGame();});
   const bot=await page.evaluate(()=>JSON.stringify({s:S,angle:giroActual}));await page.waitForTimeout(2900);
   assert.equal(await page.evaluate(()=>JSON.stringify({s:S,angle:giroActual})),bot,'bot cannot play hidden');
   await page.evaluate(()=>{showGame();detenerPartidaAnterior();modo='local';arranca=0;iniciarPartida('A','B');animarRueda(1800,()=>window.spinDone=true);});
   await page.waitForTimeout(200);await page.evaluate(()=>hideGame());const angle=await page.evaluate(()=>giroActual);
   await page.waitForTimeout(800);assert.equal(await page.evaluate(()=>giroActual),angle,'wheel frozen');
   await page.evaluate(()=>showGame());await page.waitForFunction(()=>window.spinDone,{},{timeout:8000});
   console.log('PASS',engine.name(),'bot and wheel pause/resume');

   await page.evaluate(()=>{detenerPartidaAnterior();modo='local';arranca=0;iniciarPartida('A','B');iniciarTossUp({c:'Prueba'});hideGame();});
   const toss=await page.evaluate(()=>({remaining:S.tossFin-ahoraPartida(),letters:S.tossPos.size}));await page.waitForTimeout(1000);
   assert.deepEqual(await page.evaluate(()=>({remaining:S.tossFin-ahoraPartida(),letters:S.tossPos.size})),toss);
   await page.evaluate(()=>{showGame();pausarToss(0);hideGame();});
   const response=await page.evaluate(()=>S.tossRespuestaFin-ahoraPartida());await page.waitForTimeout(300);
   assert.equal(await page.evaluate(()=>S.tossRespuestaFin-ahoraPartida()),response);
   await page.evaluate(()=>{showGame();limpiarToss();iniciarBonus(0,{});['B','C','D','A'].forEach(hostLetraBonus);hideGame();});
   const bonus=await page.evaluate(()=>S.bonusFin-ahoraPartida());await page.waitForTimeout(300);
   assert.equal(await page.evaluate(()=>S.bonusFin-ahoraPartida()),bonus);
   console.log('PASS',engine.name(),'toss, answer deadline and bonus pause');

   const network=await page.evaluate(()=>{
    showGame();detenerPartidaAnterior();modo='host';arranca=0;iniciarPartida('A','B');
    window.sent=[];sala='TEST';mq={connected:true,subscribe:(t,cb)=>{if(cb)cb();},publish:(t,p)=>window.sent.push(JSON.parse(p))};
    hideGame();const paused=tiempoPartida.pausa;showGame();modo='guest';recuperarSala();
    return {paused,request:window.sent.some(d=>d.a==='sincronizar')};
   });assert.equal(network.paused,null);assert(network.request);
   console.log('PASS',engine.name(),'rooms keep running and request current state');

   const sound=await page.evaluate(()=>{
    let plays=0,pauses=0,cancels=0,osc=0;const fake=()=>({paused:false,ended:false,currentTime:2,play(){plays++;return Promise.resolve();},pause(){this.paused=true;pauses++;}});
    audioRuletaGiro=fake();audioSFX.aplausos=fake();audioMusica=fake();
    ac={state:'running',close(){return Promise.resolve();},createOscillator(){osc++;throw Error('should not play');}};
    musicaOn=true;$('btnMusica').click();sonarRuletaGiro();sonarSFX('aplausos');bip(500,.1);hablarLetra('A',1);
    const muted={plays,pauses,osc,closed:ac===null,stored:localStorage.getItem('gya_musica')};
    musicaOn=true;hideGame();sonarRuletaGiro();sonarSFX('aplausos');bip(500,.1);
    return {muted,hiddenPlays:plays};
   });assert.equal(sound.muted.plays,0);assert.equal(sound.muted.osc,0);assert(sound.muted.pauses>=3);assert.equal(sound.muted.stored,'off');assert.equal(sound.hiddenPlays,0);
   assert.deepEqual(errors,[]);console.log('PASS',engine.name(),'mute stops music, wheel, effects and blocks hidden audio');
  }finally{await browser.close();}
 }}finally{await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
