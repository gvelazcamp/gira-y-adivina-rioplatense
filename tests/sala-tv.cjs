const {chromium}=require('playwright');
const fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
let mock=`window.__mqttClients=[];window.mqtt={connect(url,opts){const handlers={},topics=new Set();const c={url,options:opts,connected:false,on(t,f){(handlers[t]??=[]).push(f);return c},subscribe(t,cb){topics.add(t);if(cb)setTimeout(cb,0)},publish(t,p){window.__busSend({url,t,p})},end(){c.connected=false;topics.clear()},emit(t,...a){(handlers[t]||[]).forEach(f=>f(...a))},receive(t,p){if(c.connected&&topics.has(t))c.emit('message',t,{toString:()=>p})}};window.__mqttClients.push(c);setTimeout(()=>{c.connected=true;c.emit('connect')},30);return c}};`;
(async()=>{
 if(process.env.REAL_MQTT){const response=await fetch('https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js');if(!response.ok)throw new Error('No se pudo cargar MQTT');mock=await response.text();}
 const server=http.createServer((req,res)=>{let file=path.join(root,new URL(req.url,'http://local').pathname);if(file===root+path.sep)file=path.join(root,'index.html');if(!file.startsWith(root)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE,headless:true});
 const pages=[],errors=[];
 async function page(url){const ctx=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});const p=await ctx.newPage();pages.push(p);p.on('pageerror',e=>errors.push(e.message));await p.exposeBinding('__busSend',async(_,m)=>{await Promise.all(pages.map(x=>x.evaluate(m=>{for(const c of window.__mqttClients||[])if(c.url===m.url)c.receive(m.t,m.p)},m).catch(()=>{})))});await p.route('**/*',route=>{const u=route.request().url();if(u.includes('mqtt.min.js'))return route.fulfill({contentType:'application/javascript',body:mock});if(!u.startsWith(base)||u.includes('/assets/'))return route.fulfill({status:200,body:''});return route.continue()});await p.goto(base+url);await p.waitForTimeout(250);return p;}
 try {
  const host=await page('/index.html?tvhost=1');await host.waitForFunction(()=>typeof sala==='string'&&sala.length===6);const code=await host.evaluate(()=>sala);console.log('ROOM',code);
  await host.evaluate(()=>$('bBienvenidaTVJugar').click());
  const a=await page('/index.html?tv='+code+'&tvname=Ana');const b=await page('/index.html?tv='+code+'&tvname=Beto');
  await host.waitForFunction(()=>familiaJugadores.length===2);assert.deepEqual(await host.evaluate(()=>familiaJugadores.map(j=>j.n)),['Ana','Beto']);console.log('PASS join two phones');
  await host.evaluate(()=>tvComenzarPartidaConArranque(0));await a.waitForFunction(()=>V&&V.jug&&V.jug.length===2);
  console.log('STATE',await host.evaluate(()=>({fase:S.fase,turno:S.turno}))); 
  // Normal round deterministic state, real phone response routing and duplicate protection.
  await host.evaluate(()=>{limpiarToss();limpiarBonus();S.fase='girar';S.turno=0;S.frase='HOLA MUNDO';S.cat='Prueba';S.abiertas=new Set();S.usadas=new Set();S.jug[0].ronda=500;publicar('Prueba');});
  await a.waitForFunction(()=>V.fase==='girar');
  await b.evaluate(()=>enviar({a:'resolver',txt:'HOLA MUNDO'}));await b.waitForTimeout(100);assert.equal(await host.evaluate(()=>S.jug[1].tot),0);console.log('PASS rejects other player turn');
  await a.evaluate(()=>{enviar({a:'resolver',txt:'HOLA MUNDO'});enviar({a:'resolver',txt:'HOLA MUNDO'});});await host.waitForFunction(()=>S.jug[0].tot===500);await host.waitForTimeout(100);assert.equal(await host.evaluate(()=>S.jug[0].tot),500);console.log('PASS phone answers and duplicate scoring blocked');
  const id=await a.evaluate(()=>tvId);await a.reload();await a.waitForFunction(()=>typeof tvMiIndex!=='undefined'&&tvMiIndex===0);assert.equal(await a.evaluate(()=>tvId),id);assert.equal(await host.evaluate(()=>familiaJugadores.length),2);console.log('PASS phone reload recovers same player');
  if(!process.env.REAL_MQTT){await a.evaluate(()=>{const c=window.__mqttClients[0];c.emit('connect');c.emit('connect')});await a.waitForTimeout(100);assert.equal(await host.evaluate(()=>familiaJugadores.length),2);console.log('PASS repeated reconnect');}
  const c=await page('/index.html?tv='+code+'&tvname=Tarde');await c.waitForFunction(()=>document.getElementById('estado').textContent.includes('ya empezó'));console.log('PASS late player rejected with message');
  await host.evaluate(()=>{limpiarToss();limpiarBonus();S.fase='bonus_resolver';S.frase='BUEN DIA';S.bonusListos=[false,false];S.bonusGanadores=[];S.bonusFin=Date.now()+20000;publicar('Bonus');});
  await b.waitForFunction(()=>V.fase==='bonus_resolver');await b.evaluate(()=>enviar({a:'resolver',txt:'BUEN DIA'}));await host.waitForFunction(()=>S.bonusListos[1]);console.log('PASS bonus answer from second phone');
  await host.evaluate(()=>{document.querySelectorAll('.ver').forEach(e=>e.classList.remove('ver'));$('juego').style.display='none';$('tvLobby').style.display='block';gyaTVRemote('down')});
  assert(await host.evaluate(()=>document.activeElement.tagName==='BUTTON'));console.log('PASS TV remote focus');

  const full=await page('/index.html?tvhost=1');await full.waitForFunction(()=>sala.length===6);const code2=await full.evaluate(()=>sala);
  const p1=await page('/index.html?tv='+code2+'&tvname=Uno'),p2=await page('/index.html?tv='+code2+'&tvname=Dos');
  await full.waitForFunction(()=>familiaJugadores.length===2);await full.evaluate(()=>tvComenzarPartidaConArranque(0));
  const sent=new Set(),deadline=Date.now()+100000;
  while(Date.now()<deadline){
    const state=await full.evaluate(()=>({fase:S.fase,ronda:S.ronda,turno:S.turno,frase:S.frase,id:S.poderRondaId,fin:$('capaResultadosTV').classList.contains('ver')}));
    if(state.fin)break;
    const key=state.ronda+':'+state.id+':'+state.fase;
    if(state.fase==='girar'&&!sent.has(key)){sent.add(key);await [p1,p2][state.turno].evaluate(t=>enviar({a:'resolver',txt:t}),state.frase);}
    if(state.fase==='tossup'&&!sent.has(key)){sent.add(key);await p1.evaluate(()=>enviar({a:'toss_pausa'}));await p1.waitForFunction(()=>V.tossPausado&&V.tossRespondedor===tvMiIndex);await p1.evaluate(t=>enviar({a:'resolver',txt:t}),state.frase);}
    if(state.fase==='bonus_resolver'&&!sent.has(key)){sent.add(key);for(const phone of [p1,p2])await phone.evaluate(t=>enviar({a:'resolver',txt:t}),state.frase);}
    await full.waitForTimeout(300);
  }
  assert(await full.evaluate(()=>$('capaResultadosTV').classList.contains('ver')));console.log('PASS complete match through results');
  await full.evaluate(()=>$('rtvRevancha').click());await p1.waitForFunction(()=>V.fase==='girar');assert.equal(await full.evaluate(()=>S.ronda),1);console.log('PASS rematch same phones');
  console.log('ERRORS',JSON.stringify(errors));assert.equal(errors.length,0);
 } finally {await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
