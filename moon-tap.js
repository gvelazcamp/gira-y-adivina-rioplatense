/* Moon Tap (ex "Tap al Punto · Lunar Rings"): tocá en el momento justo
   para que la pelota llegue a la zona dorada del aro cuando pasa el punto.
   15 niveles que se van complicando (zona saltarina, móvil, objetivos
   dobles, distractores, cambios de sentido…). Récord en gya_moon_tap. */
const MoonTap=(()=>{
  const CLAVE="gya_moon_tap";
  let raiz=null,raf=0,ro=null;
  let mejor=0,nivelMax=1;
  function cargar(){try{const d=JSON.parse(localStorage.getItem(CLAVE));if(d&&typeof d==="object"){mejor=Number(d.mejor)||0;nivelMax=Number(d.nivelMax)||1;}}catch(e){}}
  function guardarRecord(){try{localStorage.setItem(CLAVE,JSON.stringify({mejor,nivelMax}));}catch(e){}}
  cargar();
  const q=id=>raiz.querySelector("#"+id);
  function sonido(color){
    if(typeof bip!=="function")return;
    if(color==="#ffd85b"){bip(880,.16,"triangle",.05);bip(1320,.22,"sine",.035);}
    else if(color==="#67f2ac")bip(660,.16,"sine",.05);
    else if(color==="#ff6786")bip(180,.2,"sawtooth",.03);
  }
  let api={launch(){},reset(){}};
  /* Duelo 1 vs 1: cada uno tira 15 veces en su celular; se ve en vivo
     cuántos puntos y aciertos lleva el otro. Gana el de más puntos. */
  const TIROS_DUELO=15;
  let duelo=false,tiros=0,aciertos=0;
  function alTiro(acierto){
    if(!duelo)return;
    tiros++;if(acierto)aciertos++;
    const pts=api.puntos();
    Duelo.enviarProgreso({puntos:pts,aciertos,tiros});
    const pista=q("mtPista");pista.style.opacity="1";pista.textContent="👥 Duelo · tiro "+tiros+"/"+TIROS_DUELO+" · aciertos "+aciertos;
    if(tiros>=TIROS_DUELO){
      api.bloquear(true);
      Duelo.enviarFinal({valor:pts});
      setTimeout(()=>{if(!raiz)return;Duelo.mostrarResultado({valor:pts},{etiqueta:"puntos en "+TIROS_DUELO+" tiros",onVolver:()=>{duelo=false;const padre=raiz&&raiz.parentElement;if(padre)abrir(padre);}});},900);
    }
  }
  function iniciarDuelo(){
    if(typeof Duelo==="undefined")return;
    Duelo.mostrarLobby("Moon Tap","moon",{detalle:"Cada uno tira <b>15 veces</b> en su celular y ves en vivo los puntos y aciertos del otro. Gana el que suma <b>más puntos</b>.",onListo:soyHost=>{
      const arrancar=()=>{duelo=true;tiros=0;aciertos=0;Duelo.mostrarBadge();Duelo.actualizarBadge("0 pts");q("mtPanel").hidden=true;api.reset();api.bloquear(false);q("mtReiniciar").disabled=true;const pista=q("mtPista");pista.style.opacity="1";pista.textContent="👥 Duelo · 15 tiros · ¡dale!";};
      Duelo.onProgresoRival(p=>Duelo.actualizarBadge((Number(p.puntos)||0)+" pts · "+(Number(p.aciertos)||0)+"/"+(Number(p.tiros)||0)));
      if(soyHost){Duelo.enviarRonda({tiros:TIROS_DUELO});arrancar();}else Duelo.onRondaRecibida(()=>arrancar());
    }});
  }
  function iniciarJuego(){
  const mejorEl=q('mtMejor');
  const canvas = q('mtCanvas');
  const ctx = canvas.getContext('2d');

  const levelNumEl = q('mtNivelNum');
  const scoreEl = q('mtPuntos');
  const comboEl = q('mtRacha');
  const hitsTextEl = q('mtAciertos');
  const progressBarEl = q('mtBarra');
  const levelTitleEl = q('mtNivelTitulo');
  const levelDescEl = q('mtNivelDesc');
  const resultEl = q('mtResultado');
  const levelUpEl = q('mtSubida');
  const levelUpTitleEl = q('mtSubidaTitulo');
  const levelUpDescEl = q('mtSubidaDesc');
  const hintEl = q('mtPista');
  const tapBtn = q('mtLanzar');
  const resetBtn = q('mtReiniciar');
  const stageWrap = q('mtEscenario');

  const TAU = Math.PI * 2;

  const LEVELS = [
    { name:'Calentamiento', desc:'1 objetivo, zona fija y grande.', hits:4, targetCount:1, fakeCount:0, speed:1.55, zoneHalfDeg:22, zoneMode:'fixed', blink:false, reverse:false, variableSpeed:false },
    { name:'Más rápido', desc:'El objetivo acelera. La zona sigue fija.', hits:4, targetCount:1, fakeCount:0, speed:1.75, zoneHalfDeg:20, zoneMode:'fixed', blink:false, reverse:false, variableSpeed:false },
    { name:'Precisión', desc:'La zona de impacto se achica.', hits:5, targetCount:1, fakeCount:0, speed:1.80, zoneHalfDeg:14, zoneMode:'fixed', blink:false, reverse:false, variableSpeed:false },
    { name:'Zona saltarina', desc:'Después de cada tiro la zona cambia de lugar.', hits:5, targetCount:1, fakeCount:0, speed:1.85, zoneHalfDeg:15, zoneMode:'jump', blink:false, reverse:false, variableSpeed:false },
    { name:'Zona en movimiento', desc:'La zona también gira lentamente.', hits:5, targetCount:1, fakeCount:0, speed:1.95, zoneHalfDeg:15, zoneMode:'move', zoneSpeed:.55, blink:false, reverse:false, variableSpeed:false },
    { name:'Doble objetivo', desc:'Hay 2 puntos válidos girando separados.', hits:6, targetCount:2, fakeCount:0, speed:2.00, zoneHalfDeg:13, zoneMode:'fixed', blink:false, reverse:false, variableSpeed:false },
    { name:'Memoria', desc:'El objetivo aparece y desaparece mientras gira.', hits:6, targetCount:1, fakeCount:0, speed:2.05, zoneHalfDeg:14, zoneMode:'jump', blink:true, blinkPeriod:1.15, reverse:false, variableSpeed:false },
    { name:'Cambio de sentido', desc:'El giro invierte dirección durante la ronda.', hits:6, targetCount:1, fakeCount:1, speed:2.10, zoneHalfDeg:13, zoneMode:'fixed', blink:false, reverse:true, reverseEvery:2.5, variableSpeed:false },
    { name:'Tres en pista', desc:'3 objetivos válidos y una zona móvil pequeña.', hits:7, targetCount:3, fakeCount:0, speed:2.25, zoneHalfDeg:11, zoneMode:'move', zoneSpeed:.75, blink:false, reverse:false, variableSpeed:false },
    { name:'Caos controlado', desc:'Velocidad variable, zona móvil y objetivo intermitente.', hits:7, targetCount:1, fakeCount:2, speed:2.35, zoneHalfDeg:10, zoneMode:'move', zoneSpeed:.80, blink:true, blinkPeriod:.95, reverse:true, reverseEvery:2.35, variableSpeed:true },
    { name:'Doble móvil', desc:'2 objetivos válidos y la zona cambia de sentido.', hits:7, targetCount:2, fakeCount:1, speed:2.45, zoneHalfDeg:10, zoneMode:'moveReverse', zoneSpeed:.92, blink:false, reverse:true, reverseEvery:2.15, variableSpeed:true },
    { name:'Fantasma', desc:'El objetivo se oculta más tiempo y reaparece de golpe.', hits:8, targetCount:1, fakeCount:2, speed:2.50, zoneHalfDeg:10, zoneMode:'jump', blink:true, blinkPeriod:1.35, blinkVisible:.42, reverse:true, reverseEvery:2.0, variableSpeed:true },
    { name:'Triple precisión', desc:'3 objetivos, zona diminuta y velocidad alta.', hits:8, targetCount:3, fakeCount:0, speed:2.70, zoneHalfDeg:8, zoneMode:'fixed', blink:false, reverse:false, variableSpeed:true },
    { name:'Zona fantasma', desc:'La zona desaparece por momentos: memorizá su posición.', hits:8, targetCount:2, fakeCount:1, speed:2.70, zoneHalfDeg:9, zoneMode:'move', zoneSpeed:1.05, blink:false, zoneBlink:true, zoneBlinkPeriod:1.4, reverse:true, reverseEvery:1.9, variableSpeed:true },
    { name:'Maestro del aro', desc:'Todo junto: 3 objetivos, distractores, zona móvil y cambios.', hits:10, targetCount:3, fakeCount:2, speed:2.95, zoneHalfDeg:8, zoneMode:'moveReverse', zoneSpeed:1.15, blink:true, blinkPeriod:1.05, blinkVisible:.55, zoneBlink:true, zoneBlinkPeriod:1.25, reverse:true, reverseEvery:1.7, variableSpeed:true }
  ];

  let W = 360, H = 560, dpr = 1;
  let last = performance.now();
  let elapsed = 0;
  let levelIndex = 0;
  let score = 0;
  let combo = 0;
  let hitsThisLevel = 0;

  let targetAngles = [0];
  let fakeAngles = [];
  let direction = 1;
  let zoneDirection = 1;
  let zoneAngle = Math.PI / 2;
  let reverseTimer = 0;
  let zoneReverseTimer = 0;
  let shots = [];
  let particles = [];
  let flash = 0;
  let resultTimer = 0;
  let levelUpTimer = 0;
  let lockInput = false;

  let starField = [];
  let asteroidField = [];
  let craterField = [];

  function cfg(){ return LEVELS[levelIndex]; }

  function resize(){
    const rect = canvas.getBoundingClientRect();
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    buildScenery();
  }

  ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  function buildScenery(){
    starField = [];
    asteroidField = [];
    craterField = [];

    for(let i=0;i<95;i++){
      starField.push({
        x: Math.random()*W,
        y: Math.random()*H*0.72,
        r: Math.random()*1.8 + 0.3,
        a: Math.random()*0.75 + 0.2,
        hue: Math.random() > 0.82 ? 'cyan' : (Math.random() > 0.74 ? 'gold' : 'white')
      });
    }
    for(let i=0;i<18;i++){
      asteroidField.push({
        x: Math.random()*W,
        y: Math.random()*H*0.78,
        r: 3 + Math.random()*10,
        tilt: Math.random()*Math.PI
      });
    }
    for(let i=0;i<26;i++){
      craterField.push({
        x: Math.random()*W,
        y: H*0.77 + Math.random()*H*0.22,
        r: 7 + Math.random()*24,
        squish: .65 + Math.random()*.5
      });
    }
  }

  function geom(){
    const ringR = Math.min(W * .285, H * .175);
    const ringX = W * .52;
    const ringY = H * .305;
    const startX = W * .57;
    const startY = H * .79;
    return {ringR, ringX, ringY, startX, startY};
  }

  function normAngle(a){
    a %= TAU;
    return a < 0 ? a + TAU : a;
  }

  function angleDiff(a,b){
    let d = Math.abs(normAngle(a)-normAngle(b));
    return Math.min(d, TAU-d);
  }

  function currentBaseSpeed(){
    const c = cfg();
    if(!c.variableSpeed) return c.speed;
    return c.speed * (0.72 + 0.34 * (1 + Math.sin(elapsed * 2.35)) / 2);
  }

  function targetVisible(){
    const c = cfg();
    if(!c.blink) return true;
    const period = c.blinkPeriod || 1.1;
    const visibleFraction = c.blinkVisible ?? .62;
    const phase = (elapsed % period) / period;
    return phase < visibleFraction;
  }

  function zoneVisible(){
    const c = cfg();
    if(!c.zoneBlink) return true;
    const period = c.zoneBlinkPeriod || 1.3;
    const phase = (elapsed % period) / period;
    return phase < .58;
  }

  function resetAngles(){
    const c = cfg();
    targetAngles = [];
    fakeAngles = [];
    for(let i=0;i<c.targetCount;i++){
      targetAngles.push(normAngle(i * TAU / c.targetCount + .15));
    }
    for(let i=0;i<c.fakeCount;i++){
      fakeAngles.push(normAngle((i+.5) * TAU / Math.max(1,c.fakeCount) + 1.05));
    }
    direction = 1;
    zoneDirection = 1;
    reverseTimer = 0;
    zoneReverseTimer = 0;
    zoneAngle = c.zoneMode === 'jump' ? randomZoneAngle() : Math.PI / 2;
  }

  function randomZoneAngle(){
    const options = [Math.PI/2, Math.PI, 0, Math.PI*1.5, Math.PI*.25, Math.PI*.75, Math.PI*1.25, Math.PI*1.75];
    let next = options[Math.floor(Math.random()*options.length)];
    if(angleDiff(next,zoneAngle) < .35){
      next = options[(options.indexOf(next)+3)%options.length];
    }
    return next;
  }

  function updateHUD(){
    const c = cfg();
    levelNumEl.textContent = levelIndex + 1;
    scoreEl.textContent = score;
    if(score>mejor){mejor=score;guardarRecord();}
    if(levelIndex+1>nivelMax){nivelMax=levelIndex+1;guardarRecord();}
    mejorEl.textContent = mejor;
    comboEl.textContent = combo;
    hitsTextEl.textContent = `${hitsThisLevel}/${c.hits}`;
    progressBarEl.style.width = `${Math.min(100, hitsThisLevel/c.hits*100)}%`;
    levelTitleEl.textContent = `Nivel ${levelIndex+1} · ${c.name}`;
    levelDescEl.textContent = c.desc;
  }

  function showResult(text,color){
    resultEl.textContent = text;
    resultEl.style.color = color;
    resultEl.classList.add('show');
    clearTimeout(resultTimer);
    resultTimer = setTimeout(()=>resultEl.classList.remove('show'),650);
    sonido(color);
  }

  function showLevelUp(){
    const c = cfg();
    levelUpTitleEl.textContent = `NIVEL ${levelIndex+1}`;
    levelUpDescEl.textContent = `${c.name}: ${c.desc}`;
    levelUpEl.classList.add('show');
    clearTimeout(levelUpTimer);
    levelUpTimer = setTimeout(()=>{
      levelUpEl.classList.remove('show');
      lockInput = false;
    },1250);
  }

  function burst(x,y,color,count=18){
    for(let i=0;i<count;i++){
      const a = Math.random()*TAU;
      const sp = 55 + Math.random()*130;
      particles.push({
        x,y,
        vx:Math.cos(a)*sp,
        vy:Math.sin(a)*sp,
        life:.5+Math.random()*.42,
        age:0,
        color
      });
    }
  }

  function launch(){
    if(lockInput) return;
    if(shots.some(s=>!s.done)) return;
    hintEl.style.opacity = '0';

    const g = geom();
    const ex = g.ringX + Math.cos(zoneAngle)*g.ringR;
    const ey = g.ringY + Math.sin(zoneAngle)*g.ringR;

    shots.push({
      t:0,
      duration:.56,
      sx:g.startX,
      sy:g.startY,
      ex, ey,
      targetZoneAngle:zoneAngle,
      done:false
    });
  }

  function resolveShot(shot){
    const c = cfg();
    const zoneAtLaunch = shot.targetZoneAngle;
    let best = Infinity;
    for(const a of targetAngles){
      best = Math.min(best, angleDiff(a,zoneAtLaunch));
    }

    const perfect = Math.max(4, c.zoneHalfDeg * .42) * Math.PI/180;
    const good = c.zoneHalfDeg * Math.PI/180;

    const g = geom();
    const impactX = g.ringX + Math.cos(zoneAtLaunch)*g.ringR;
    const impactY = g.ringY + Math.sin(zoneAtLaunch)*g.ringR;

    if(best <= perfect){
      combo++;
      hitsThisLevel++;
      score += 125 + combo*28 + levelIndex*12;
      showResult('¡PERFECTO!','#ffd85b');
      burst(impactX,impactY,'#ffd85b',28);
      flash = .16;
      afterSuccessfulShot();
    }else if(best <= good){
      combo++;
      hitsThisLevel++;
      score += 65 + combo*14 + levelIndex*8;
      showResult('¡LE PEGASTE!','#67f2ac');
      burst(impactX,impactY,'#67f2ac',18);
      flash = .08;
      afterSuccessfulShot();
    }else{
      combo = 0;
      showResult('CERCA…','#ff6786');
      burst(impactX,impactY,'#ff6786',10);
      afterShot();
    }

    updateHUD();
    alTiro(best <= good);
    if(hitsThisLevel >= c.hits){
      levelUp();
    }
  }

  function afterSuccessfulShot(){
    afterShot();
  }

  function afterShot(){
    const c = cfg();
    if(c.zoneMode === 'jump'){
      zoneAngle = randomZoneAngle();
    }
  }

  function levelUp(){
    lockInput = true;
    hitsThisLevel = 0;
    if(levelIndex < LEVELS.length - 1){
      levelIndex++;
      resetAngles();
      updateHUD();
      showLevelUp();
    }else{
      score += 1000;
      combo += 3;
      showResult('¡MODO MAESTRO!','#ffd85b');
      hitsThisLevel = 0;
      updateHUD();
      lockInput = false;
    }
  }

  function reset(){
    levelIndex = 0;
    score = 0;
    combo = 0;
    hitsThisLevel = 0;
    elapsed = 0;
    shots = [];
    particles = [];
    lockInput = false;
    zoneAngle = Math.PI/2;
    resetAngles();
    updateHUD();
    hintEl.style.opacity = '1';
    showResult('LISTO','#ffffff');
  }

  function roundRect(x,y,w,h,r){
    const rr = Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr,y);
    ctx.arcTo(x+w,y,x+w,y+h,rr);
    ctx.arcTo(x+w,y+h,x,y+h,rr);
    ctx.arcTo(x,y+h,x,y,rr);
    ctx.arcTo(x,y,x+w,y,rr);
    ctx.closePath();
  }

  function drawBackground(){
    const grad = ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0,'#0f0a22');
    grad.addColorStop(.5,'#120d28');
    grad.addColorStop(1,'#090713');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);

    // nebulae
    const neb1 = ctx.createRadialGradient(W*.18,H*.14,5,W*.18,H*.14,W*.22);
    neb1.addColorStop(0,'rgba(255,170,240,.30)');
    neb1.addColorStop(.25,'rgba(152,116,255,.25)');
    neb1.addColorStop(1,'rgba(152,116,255,0)');
    ctx.fillStyle = neb1;
    ctx.fillRect(0,0,W,H);

    const neb2 = ctx.createRadialGradient(W*.75,H*.38,5,W*.75,H*.38,W*.30);
    neb2.addColorStop(0,'rgba(76,186,255,.16)');
    neb2.addColorStop(.35,'rgba(120,100,255,.14)');
    neb2.addColorStop(1,'rgba(76,186,255,0)');
    ctx.fillStyle = neb2;
    ctx.fillRect(0,0,W,H);

    // stars
    for(const s of starField){
      ctx.globalAlpha = s.a;
      ctx.fillStyle = s.hue === 'cyan' ? '#7ce8ff' : (s.hue === 'gold' ? '#ffe596' : '#ffffff');
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.r,0,TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // distant planets
    drawPlanet(W*.12,H*.58,W*.08,'#3d415d','#8994dc',.7);
    drawPlanet(W*.80,H*.64,W*.06,'#31385e','#7a89d0',.8);
    drawPlanet(W*.93,H*.26,W*.042,'#2e3757','#8493d1',.7);

    // earth-like curve
    const earthGrad = ctx.createRadialGradient(W*.92,H*1.02,10,W*.92,H*1.02,W*.42);
    earthGrad.addColorStop(0,'rgba(43,79,165,1)');
    earthGrad.addColorStop(.38,'rgba(57,106,210,.95)');
    earthGrad.addColorStop(.78,'rgba(22,31,76,.92)');
    earthGrad.addColorStop(1,'rgba(22,31,76,0)');
    ctx.fillStyle = earthGrad;
    ctx.beginPath();
    ctx.arc(W*.92,H*1.02,W*.40,0,TAU);
    ctx.fill();

    // glow rim earth
    ctx.strokeStyle = 'rgba(151,224,255,.78)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(W*.92,H*1.02,W*.40,Math.PI*1.02,Math.PI*1.62);
    ctx.stroke();

    // asteroids
    ctx.save();
    ctx.fillStyle = '#292838';
    ctx.strokeStyle = 'rgba(255,255,255,.06)';
    ctx.lineWidth = 1;
    for(const a of asteroidField){
      ctx.save();
      ctx.translate(a.x,a.y);
      ctx.rotate(a.tilt);
      ctx.beginPath();
      ctx.moveTo(-a.r*.8,-a.r*.2);
      ctx.lineTo(-a.r*.2,-a.r*.9);
      ctx.lineTo(a.r*.75,-a.r*.35);
      ctx.lineTo(a.r*.6,a.r*.7);
      ctx.lineTo(-a.r*.45,a.r*.72);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawPlanet(x,y,r,c1,c2,alpha=1){
    ctx.save();
    ctx.globalAlpha = alpha;
    const g = ctx.createRadialGradient(x-r*.25,y-r*.3,2,x,y,r);
    g.addColorStop(0,c2);
    g.addColorStop(.46,c1);
    g.addColorStop(1,'#10101c');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x,y,r,0,TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawTargetPlanet(){
    const g = geom();
    const c = cfg();

    // orbital streaks
    ctx.save();
    ctx.translate(g.ringX,g.ringY);
    ctx.rotate(Math.sin(elapsed*.35)*.18);
    ctx.strokeStyle = 'rgba(186,208,255,.22)';
    ctx.lineWidth = g.ringR*.15;
    ctx.beginPath();
    ctx.ellipse(0,0,g.ringR*1.55,g.ringR*1.02,.18,0,TAU);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,218,138,.16)';
    ctx.lineWidth = g.ringR*.08;
    ctx.beginPath();
    ctx.ellipse(0,0,g.ringR*1.76,g.ringR*1.16,.18,0,TAU);
    ctx.stroke();
    ctx.restore();

    // support line / guide
    const zx = g.ringX + Math.cos(zoneAngle)*g.ringR;
    const zy = g.ringY + Math.sin(zoneAngle)*g.ringR;

    ctx.save();
    ctx.setLineDash([6,8]);
    ctx.strokeStyle = 'rgba(255,255,255,.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(zx,zy);
    ctx.lineTo(g.startX,g.startY);
    ctx.stroke();
    ctx.restore();

    // main dark crater planet
    const pg = ctx.createRadialGradient(g.ringX-g.ringR*.28,g.ringY-g.ringR*.34,3,g.ringX,g.ringY,g.ringR*.95);
    pg.addColorStop(0,'#404b77');
    pg.addColorStop(.32,'#24305d');
    pg.addColorStop(.72,'#111932');
    pg.addColorStop(1,'#080d1c');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(g.ringX,g.ringY,g.ringR*.93,0,TAU);
    ctx.fill();

    // craters on target planet
    ctx.save();
    ctx.globalAlpha = .42;
    const craters = [
      [-.35,-.16,.16], [.24,-.28,.12], [.18,.18,.18], [-.1,.32,.1], [-.28,.28,.08], [.42,.04,.09], [.02,-.02,.13]
    ];
    for(const [ox,oy,rr] of craters){
      const x = g.ringX + ox*g.ringR;
      const y = g.ringY + oy*g.ringR;
      const r = rr*g.ringR;
      ctx.fillStyle = 'rgba(0,0,0,.28)';
      ctx.beginPath();
      ctx.ellipse(x,y,r*1.15,r*.92,-.35,0,TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(160,180,255,.10)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // ring halo
    ctx.strokeStyle = 'rgba(91,223,255,.25)';
    ctx.lineWidth = g.ringR*.17;
    ctx.beginPath();
    ctx.arc(g.ringX,g.ringY,g.ringR,0,TAU);
    ctx.stroke();

    // ring main
    const ringGrad = ctx.createLinearGradient(g.ringX-g.ringR,g.ringY,g.ringX+g.ringR,g.ringY);
    ringGrad.addColorStop(0,'#7be6ff');
    ringGrad.addColorStop(.5,'#63bfff');
    ringGrad.addColorStop(1,'#96dcff');
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = g.ringR*.072;
    ctx.beginPath();
    ctx.arc(g.ringX,g.ringY,g.ringR,0,TAU);
    ctx.stroke();

    // moving impact zone
    if(zoneVisible()){
      const z = c.zoneHalfDeg*Math.PI/180;
      ctx.strokeStyle = '#ffd85b';
      ctx.lineWidth = g.ringR*.16;
      ctx.beginPath();
      ctx.arc(g.ringX,g.ringY,g.ringR,zoneAngle-z,zoneAngle+z);
      ctx.stroke();

      // zone sparks
      const zx2 = g.ringX + Math.cos(zoneAngle)*g.ringR;
      const zy2 = g.ringY + Math.sin(zoneAngle)*g.ringR;
      ctx.save();
      ctx.fillStyle = '#fff2b5';
      ctx.shadowColor = '#ffd85b';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(zx2,zy2,4.5,0,TAU);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = '#ffd85b';
      ctx.translate(zx2,zy2);
      ctx.rotate(zoneAngle + Math.PI/2);
      ctx.beginPath();
      ctx.moveTo(0,-8);
      ctx.lineTo(10,0);
      ctx.lineTo(0,8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // targets
    if(targetVisible()){
      targetAngles.forEach(a=>{
        const x = g.ringX + Math.cos(a)*g.ringR;
        const y = g.ringY + Math.sin(a)*g.ringR;
        ctx.save();
        ctx.shadowColor = '#ffd85b';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffd85b';
        ctx.beginPath();
        ctx.arc(x,y,Math.max(8,g.ringR*.098),0,TAU);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#453300';
        ctx.beginPath();
        ctx.arc(x,y,Math.max(2.5,g.ringR*.026),0,TAU);
        ctx.fill();
      });
    }

    // fake points
    fakeAngles.forEach(a=>{
      const x = g.ringX + Math.cos(a)*g.ringR;
      const y = g.ringY + Math.sin(a)*g.ringR;
      ctx.save();
      ctx.globalAlpha = .9;
      ctx.shadowColor = '#63deff';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#63deff';
      ctx.beginPath();
      ctx.arc(x,y,Math.max(7,g.ringR*.085),0,TAU);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#173247';
      ctx.beginPath();
      ctx.arc(x,y,Math.max(2.2,g.ringR*.023),0,TAU);
      ctx.fill();
    });

    // title over planet
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,.82)';
    ctx.font = `800 ${Math.max(11,W*.031)}px system-ui`;
    let mode = 'ÓRBITA FIJA';
    if(c.zoneMode === 'jump') mode = 'ÓRBITA SALTARINA';
    if(c.zoneMode === 'move') mode = 'ÓRBITA MÓVIL';
    if(c.zoneMode === 'moveReverse') mode = 'ÓRBITA MÓVIL + INVERSIÓN';
    ctx.fillText(mode,g.ringX,g.ringY-g.ringR-28);
  }

  function drawMoonGround(){
    const y0 = H*.73;

    // terrain
    const terrain = ctx.createLinearGradient(0,y0,0,H);
    terrain.addColorStop(0,'#7d808f');
    terrain.addColorStop(.2,'#696c7b');
    terrain.addColorStop(.55,'#515463');
    terrain.addColorStop(1,'#393b48');
    ctx.fillStyle = terrain;

    ctx.beginPath();
    ctx.moveTo(0,y0);
    ctx.quadraticCurveTo(W*.12,y0-14,W*.24,y0-6);
    ctx.quadraticCurveTo(W*.38,y0+6,W*.5,y0-2);
    ctx.quadraticCurveTo(W*.66,y0-16,W*.8,y0+2);
    ctx.quadraticCurveTo(W*.92,y0+8,W,H*.75);
    ctx.lineTo(W,H);
    ctx.lineTo(0,H);
    ctx.closePath();
    ctx.fill();

    // craters
    ctx.save();
    for(const c of craterField){
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      ctx.beginPath();
      ctx.ellipse(c.x,c.y,c.r,c.r*c.squish,-.15,0,TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.07)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // little rocks
    ctx.fillStyle = '#464957';
    for(let i=0;i<24;i++){
      const x = (i*73 % 100)/100 * W;
      const y = y0 + 15 + ((i*91)%100)/100 * (H-y0-20);
      const r = 1.5 + (i%5);
      ctx.beginPath();
      ctx.arc(x,y,r,0,TAU);
      ctx.fill();
    }

    // moon base / dish
    ctx.save();
    ctx.translate(W*.9,H*.83);
    ctx.fillStyle = '#5d6379';
    roundRect(-44,18,88,20,4);
    ctx.fill();

    ctx.strokeStyle = '#a7afc8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0,18);
    ctx.lineTo(0,-18);
    ctx.stroke();

    ctx.fillStyle = '#8f97b5';
    ctx.beginPath();
    ctx.ellipse(0,-26,22,12,-.35,0,TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.stroke();
    ctx.restore();
  }

  function drawPlayer(){
    const x = W*.26;
    const y = H*.79;
    const activeShot = shots.find(s=>!s.done);
    const swing = activeShot ? Math.sin(Math.min(1,activeShot.t/.18)*Math.PI) : 0;

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.beginPath();
    ctx.ellipse(x+12,y+76,W*.145,12,0,0,TAU);
    ctx.fill();

    // legs
    ctx.strokeStyle = '#d6d9e8';
    ctx.lineWidth = Math.max(8,W*.018);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x,y+28); ctx.lineTo(x-18,y+70);
    ctx.moveTo(x+10,y+28); ctx.lineTo(x+32,y+69);
    ctx.stroke();

    // boots
    ctx.strokeStyle = '#171b2b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x-18,y+70); ctx.lineTo(x-8,y+73);
    ctx.moveTo(x+32,y+69); ctx.lineTo(x+44,y+72);
    ctx.stroke();

    // body suit
    const suit = ctx.createLinearGradient(x-26,y-24,x+34,y+40);
    suit.addColorStop(0,'#f5f8ff');
    suit.addColorStop(.52,'#d9dceb');
    suit.addColorStop(1,'#8f9ab9');
    ctx.fillStyle = suit;
    roundRect(x-24,y-34,58,66,20);
    ctx.fill();

    // dark side pieces
    ctx.fillStyle = '#242a44';
    roundRect(x-24,y-10,18,40,8);
    ctx.fill();
    roundRect(x+16,y-8,18,38,8);
    ctx.fill();

    // head / helmet
    const helmet = ctx.createRadialGradient(x+2,y-57,3,x+2,y-57,23);
    helmet.addColorStop(0,'#dff7ff');
    helmet.addColorStop(.52,'#8ab6d8');
    helmet.addColorStop(1,'#33506c');
    ctx.fillStyle = helmet;
    ctx.beginPath();
    ctx.arc(x+2,y-57,21,0,TAU);
    ctx.fill();

    // visor reflection
    ctx.fillStyle = 'rgba(255,255,255,.28)';
    ctx.beginPath();
    ctx.ellipse(x-2,y-63,8,4,-.45,0,TAU);
    ctx.fill();

    // arm
    ctx.strokeStyle = '#e2e7f4';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x+22,y-14);
    ctx.lineTo(x+42,y+2-swing*18);
    ctx.stroke();

    // bat / launcher
    const batX1 = x+40;
    const batY1 = y+2-swing*18;
    const batX2 = x+74+swing*22;
    const batY2 = y-22-swing*22;

    ctx.strokeStyle = '#8ea5c6';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(batX1,batY1);
    ctx.lineTo(batX2,batY2);
    ctx.stroke();

    ctx.strokeStyle = '#63deff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(batX1,batY1);
    ctx.lineTo(batX2,batY2);
    ctx.stroke();

    ctx.fillStyle = '#c8f7ff';
    ctx.beginPath();
    ctx.ellipse(batX2,batY2,9,17,-.75,0,TAU);
    ctx.fill();

    ctx.strokeStyle = '#63deff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // backpack light
    ctx.save();
    ctx.shadowColor = '#63deff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#63deff';
    ctx.beginPath();
    ctx.arc(x-8,y-6,4,0,TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawShots(dt){
    for(const s of shots){
      if(s.done) continue;
      s.t += dt;
      const p = Math.min(1,s.t/s.duration);
      const eased = 1 - Math.pow(1-p,2);
      const x = s.sx + (s.ex-s.sx)*eased + Math.sin(p*Math.PI)*W*.035;
      const y = s.sy + (s.ey-s.sy)*eased - Math.sin(p*Math.PI)*H*.055;

      // trail
      ctx.save();
      ctx.globalAlpha = .8;
      const trail = ctx.createLinearGradient(s.sx,s.sy,x,y);
      trail.addColorStop(0,'rgba(255,216,91,0)');
      trail.addColorStop(1,'rgba(255,216,91,.95)');
      ctx.strokeStyle = trail;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(s.sx,s.sy);
      ctx.lineTo(x,y);
      ctx.stroke();
      ctx.restore();

      // ball
      ctx.save();
      ctx.shadowColor = '#fff2b5';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#fff3bc';
      ctx.beginPath();
      ctx.arc(x,y,Math.max(8,W*.024),0,TAU);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = '#ffd85b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x,y,Math.max(4,W*.012),0,TAU);
      ctx.stroke();

      if(p >= 1){
        s.done = true;
        resolveShot(s);
      }
    }
    if(shots.length > 12) shots = shots.slice(-12);
  }

  function drawParticles(dt){
    for(const p of particles){
      p.age += dt;
      p.vy += 180*dt;
      p.x += p.vx*dt;
      p.y += p.vy*dt;
      const a = Math.max(0,1-p.age/p.life);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x,p.y,3.4,0,TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    particles = particles.filter(p=>p.age<p.life);
  }

  function updateMotion(dt){
    const c = cfg();
    const sp = currentBaseSpeed();

    targetAngles = targetAngles.map(a => normAngle(a + sp*direction*dt));
    fakeAngles = fakeAngles.map((a,i)=>{
      const mult = i%2===0 ? .78 : 1.18;
      const dir = i%2===0 ? -direction : direction;
      return normAngle(a + sp*mult*dir*dt);
    });

    if(c.reverse){
      reverseTimer += dt;
      if(reverseTimer >= (c.reverseEvery || 2.5)){
        reverseTimer = 0;
        direction *= -1;
      }
    }

    if(c.zoneMode === 'move' || c.zoneMode === 'moveReverse'){
      zoneAngle = normAngle(zoneAngle + (c.zoneSpeed || .6)*zoneDirection*dt);
    }

    if(c.zoneMode === 'moveReverse'){
      zoneReverseTimer += dt;
      if(zoneReverseTimer >= 1.75){
        zoneReverseTimer = 0;
        zoneDirection *= -1;
      }
    }
  }

  function loop(now){
    const dt = Math.min(.035,(now-last)/1000 || .016);
    last = now;
    elapsed += dt;

    updateMotion(dt);
    drawBackground();
    drawTargetPlanet();
    drawMoonGround();
    drawPlayer();
    drawShots(dt);
    drawParticles(dt);

    if(flash > 0){
      flash -= dt;
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0,flash)*1.25})`;
      ctx.fillRect(0,0,W,H);
    }

    if(raiz)raf=requestAnimationFrame(loop);
  }

  tapBtn.addEventListener('click', ()=>launch());
  resetBtn.addEventListener('click', ()=>reset());
  stageWrap.addEventListener('pointerdown', (e)=>{
    if(e.target.closest('button')) return;
    launch();
  });
  resetAngles();
  updateHUD();
  lockInput = true;
  raf=requestAnimationFrame(loop);
  api={launch,reset:()=>{reset();},bloquear:v=>{lockInput=v;},puntos:()=>score};
  }
  function panel(titulo,detalle,acciones){
    const p=q("mtPanel");p.innerHTML='<div class="sf-panel"><h3></h3><p></p><div class="sf-acciones"></div></div>';
    p.querySelector("h3").textContent=titulo;p.querySelector("p").textContent=detalle;
    const cont=p.querySelector(".sf-acciones");
    acciones.forEach(([t,f],i)=>{const b=document.createElement("button");b.type="button";b.textContent=t;if(i===0)b.className="sf-principal";b.onclick=f;cont.appendChild(b);});
    p.hidden=false;
  }
  function jugar(){q("mtPanel").hidden=true;api.reset();api.bloquear(false);}
  function abrir(contenedor){
    salir();cargar();
    raiz=document.createElement("div");raiz.className="mt-game";
    raiz.innerHTML='<button type="button" class="ext-volver" id="mtVolver">⟵ Extensiones</button>'
      +'<div class="mt-top"><div class="mt-nivel"><b id="mtNivelTitulo">Nivel 1</b><small id="mtNivelDesc"></small></div>'
      +'<div class="mt-pill">Nivel<strong id="mtNivelNum">1</strong></div><div class="mt-pill">Puntos<strong id="mtPuntos">0</strong></div><div class="mt-pill">Racha<strong id="mtRacha">0</strong></div><div class="mt-pill">Récord<strong id="mtMejor">0</strong></div></div>'
      +'<div class="mt-progreso"><span id="mtBarra"></span><em id="mtAciertos">0/4</em></div>'
      +'<section class="mt-escenario" id="mtEscenario"><canvas id="mtCanvas"></canvas><div class="mt-resultado" id="mtResultado" aria-live="polite"></div>'
      +'<div class="mt-subida" id="mtSubida"><div><small>NUEVO DESAFÍO</small><strong id="mtSubidaTitulo">NIVEL 2</strong><span id="mtSubidaDesc"></span></div></div>'
      +'<div class="mt-pista" id="mtPista">Tocá antes: la pelota tarda en llegar al aro</div></section>'
      +'<div class="mt-controles"><button id="mtLanzar" type="button">🚀 LANZAR</button><button id="mtReiniciar" type="button">Reiniciar</button></div>'
      +'<div class="sf-panel-capa" id="mtPanel" hidden></div>';
    contenedor.appendChild(raiz);
    q("mtVolver").onclick=()=>Extensiones.abrirLobby();
    iniciarJuego();
    panel("Moon Tap","Tocá la pantalla (o LANZAR) para tirar la pelota. Tiene que llegar a la zona dorada del aro justo cuando pasa el punto amarillo. Ojo con los puntos celestes: son trampa. 15 niveles. Récord: "+mejor+" puntos.",[["Jugar",jugar],["👥 Jugar con un amigo",iniciarDuelo]]);
  }
  function salir(){
    if(raf)cancelAnimationFrame(raf);raf=0;
    if(ro){try{ro.disconnect();}catch(e){}ro=null;}
    if(duelo&&typeof Duelo!=="undefined")Duelo.salir();duelo=false;
    api={launch(){},reset(){}};raiz=null;
  }
  function tecla(key,e){
    if(!raiz||(key!==" "&&key!=="Enter"))return;
    if(!q("mtPanel").hidden)return;
    if(e)e.preventDefault();api.launch();
  }
  return{abrir,salir,tecla,mejorPuntaje:()=>{cargar();return mejor;}};
})();
window.MoonTap=MoonTap;
