/* Bomba: aparece una sílaba y hay que decir una palabra que la tenga,
   tocar "Pasar" y darle el celular al de al lado. La bomba explota en un
   momento secreto (entre 15 y 45 s): pierde quien la tenga en la mano.
   El tic-tac se acelera. Con "árbitro por voz" (SpeechRecognition) no hace
   falta tocar Pasar: si la palabra que se dice tiene la sílaba (y no se
   repitió en la ronda), suena el acierto y pasa sola; si no cuenta, suena
   el error. Pantalla completa, sin apagarse y sin "atrás"
   (PantallaFija). Para cortar antes: ✕ Salir y confirmar. Récord en gya_bomba. */
const Bomba=(()=>{
  const CLAVE="gya_bomba";
  const SILABAS=["CA","CO","CU","MA","ME","MI","MO","PA","PE","PI","PO","LA","LO","LI","TA","TE","TO","RE","RO","SA","SE","SO","DE","DO","NA","NE","NO","BA","BO","BU","GA","GO","VA","VE","FA","FI","JA","JU","RA","RI","CHA","CHI","CHO","LLA","LLO","TRA","TRE","PRE","PRO","BRA","BLA","CLA","PLA","GRA","FRA","CRE","MEN","CON","TER","POR","SAL","MAR","CAN","TAR","PAN","SOL","DOR","ITO","ADA","ERO","OSO","ADO","ENTE","ANTE","ICO","ERA","ILLA","ÓN","EZ","AJE"];
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  let silencioError=0,voz=null,conVoz=!!SR,usadas=new Set(),consumido={},fallosVoz=0;
  let raiz=null,rondas=0,jugando=false,explota=0,inicioT=0,tic=0,pasadas=0,ultima="",bloqueoToque=0;
  function cargar(){try{const d=JSON.parse(localStorage.getItem(CLAVE));if(d&&typeof d==="object"){rondas=Number(d.rondas)||0;if(SR&&typeof d.voz==="boolean")conVoz=d.voz;}}catch(e){}}
  function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify({rondas,voz:conVoz}));}catch(e){}}
  cargar();
  const q=id=>raiz.querySelector("#"+id);
  function abrir(contenedor){
    salir();cargar();
    raiz=document.createElement("section");raiz.className="bb";
    contenedor.appendChild(raiz);PantallaFija.entrar();inicio();
  }
  function inicio(){
    raiz.innerHTML=`<div class="mg-panel bb-panel"><div class="bb-icono">💣</div><h3>Bomba</h3>
      <p>Aparece una sílaba: decí una palabra que la tenga (al principio, al medio o al final), tocá <b>Pasar</b> y dale el celular al de al lado.</p>
      <p class="qns-nota">💥 La bomba explota en un momento secreto. Pierde el que la tiene en la mano. ¡Subí el volumen!</p>
      ${SR?`<button type="button" class="bb-voz" id="bbVoz"></button>`:""}
      <button type="button" class="mg-principal" id="bbEmpezar">💣 Empezar</button>
      <button type="button" id="bbWpp">💬 Invitar por WhatsApp</button>
    </div>`;
    q("bbEmpezar").onclick=empezar;
    const bv=raiz.querySelector("#bbVoz");
    const pintarVoz=()=>{if(bv)bv.innerHTML=conVoz?"🎤 Árbitro por voz: <b>SÍ</b><small>Si la palabra está bien, suena y pasa sola</small>":"🎤 Árbitro por voz: <b>NO</b><small>Se pasa tocando el botón</small>";};
    if(bv){pintarVoz();bv.onclick=()=>{conVoz=!conVoz;guardar();pintarVoz();};}
    q("bbWpp").onclick=()=>PantallaFija.invitar("bomba","Bomba");
  }
  function silaba(){let s;do{s=SILABAS[Math.floor(Math.random()*SILABAS.length)];}while(s===ultima);ultima=s;return s;}
  function empezar(){
    raiz.innerHTML=`<div class="qns-pantalla bb-juego" id="bbJuego">
      <div class="qs-tope"><span>💣 Bomba</span><b id="bbPasadas">0</b><button type="button" class="pf-salir" id="bbSalir">✕ Salir</button></div>
      <div class="bb-mecha" id="bbMecha">💣</div>
      <div class="bb-silaba" id="bbSilaba"></div>
      <div class="bb-oido" id="bbOido"></div>
      <button type="button" class="bb-pasar" id="bbPasar">Pasar ➜</button>
    </div>`;
    PantallaFija.activar();
    const juego=q("bbJuego");
    ["touchmove","contextmenu","dblclick"].forEach(t=>juego.addEventListener(t,e=>{if(e.cancelable)e.preventDefault();},{passive:false}));
    q("bbPasar").addEventListener("pointerdown",e=>{e.preventDefault();pasar();});
    PantallaFija.confirmar(q("bbSalir"),()=>{parar();PantallaFija.desactivar();if(raiz)inicio();});
    pasadas=0;jugando=true;inicioT=Date.now();explota=inicioT+15000+Math.random()*30000;
    q("bbSilaba").textContent=silaba();usadas=new Set();
    if(conVoz)escuchar();
    tictac();
  }
  const norm=t=>String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/[^A-ZÑ ]+/g," ").replace(/\s+/g," ").trim();
  /* Árbitro por voz: escucha todo el tiempo; cada palabra nueva que tenga
     la sílaba (y sea más larga que la sílaba sola) cuenta como acierto. */
  function escuchar(){
    if(!SR||voz)return;
    try{voz=new SR();}catch(e){voz=null;return;}
    voz.lang="es-UY";voz.continuous=true;voz.interimResults=true;voz.maxAlternatives=1;consumido={};fallosVoz=0;
    voz.onstart=()=>oido("🎤 Escuchando…");
    voz.onresult=e=>{
      if(!jugando)return;fallosVoz=0;
      const sil=norm(ultima);
      for(let i=e.resultIndex;i<e.results.length;i++){
        const ps=norm(e.results[i][0].transcript).split(" ").filter(Boolean);
        for(let k=consumido[i]||0;k<ps.length;k++){
          const w=ps[k];
          if(w.length>sil.length&&w.includes(sil)&&!usadas.has(w)){
            /* Lo ya oído no cuenta para la sílaba que viene. */
            for(let j=0;j<e.results.length;j++)consumido[j]=norm(e.results[j][0].transcript).split(" ").filter(Boolean).length;
            usadas.add(w);acierto(w);return;
          }
        }
        /* Frase terminada sin palabra válida: sonido de error (sílaba sola,
           repetida o sin la sílaba). Solo con el resultado final, no con
           los parciales, para no sonar mientras la persona sigue hablando. */
        if(e.results[i].isFinal&&ps.length>(consumido[i]||0)){
          const nuevas=ps.slice(consumido[i]||0);consumido[i]=ps.length;
          const w=nuevas[nuevas.length-1];
          oido("✘ "+w.toLowerCase()+(usadas.has(w)?" (ya la dijeron)":w===sil?" (solo la sílaba)":" (no cuenta)"));
          if(Date.now()>silencioError){silencioError=Date.now()+1200;if(typeof sonidoErrorExt==="function")sonidoErrorExt();if(typeof cruzErrorExt==="function")cruzErrorExt();}
          if(typeof vibrar==="function")vibrar([40,40,40]);
          continue;
        }
        if(ps.length)oido("🎤 "+ps.slice(-2).join(" ").toLowerCase());
      }
    };
    voz.onerror=e=>{const err=e&&e.error||"";if(err==="no-speech"||err==="aborted")return;fallosVoz++;
      if(err==="not-allowed"||err==="service-not-allowed"){oido("🎤 Sin permiso de micrófono: usá el botón");pararVoz();}
      else if(err==="network")oido("🎤 Sin internet para escuchar: usá el botón");
      else if(err==="language-not-supported"&&voz)voz.lang="es-AR";};
    voz.onend=()=>{consumido={};if(jugando&&voz&&fallosVoz<6)setTimeout(()=>{if(jugando&&voz)try{voz.start();}catch(e){}},fallosVoz?400:60);};
    try{voz.start();}catch(e){voz=null;}
  }
  function pararVoz(){if(voz){try{voz.onend=null;voz.abort();}catch(e){}voz=null;}}
  function oido(t){if(raiz){const o=raiz.querySelector("#bbOido");if(o)o.textContent=t;}}
  function acierto(w){
    if(typeof bip==="function"){bip(660,.15,"sine",.07);bip(990,.25,"triangle",.05);}
    oido("✔ "+w.toLowerCase());
    const s=q("bbSilaba");s.classList.remove("ok");void s.offsetWidth;s.classList.add("ok");
    bloqueoToque=0;pasar();
  }
  function pasar(){
    if(!jugando||Date.now()<bloqueoToque)return;
    bloqueoToque=Date.now()+350;pasadas++;q("bbPasadas").textContent=pasadas;
    const s=q("bbSilaba");s.textContent=silaba();s.classList.remove("nueva");void s.offsetWidth;s.classList.add("nueva");
    if(typeof vibrar==="function")vibrar(20);
  }
  /* El tic-tac arranca lento y se acelera a medida que se acerca la explosión. */
  function tictac(){
    if(!raiz||!jugando)return;
    const ahora=Date.now();
    if(ahora>=explota){boom();return;}
    const avance=Math.min(1,(ahora-inicioT)/(explota-inicioT));
    const intervalo=Math.max(110,700-avance*590);
    if(typeof bip==="function")bip(avance>.75?1200:950,.04,"square",.035);
    const m=q("bbMecha");m.classList.remove("late");void m.offsetWidth;m.classList.add("late");
    tic=setTimeout(tictac,intervalo);
  }
  function explosion(){
    try{if(typeof sonidoPermitido==="function"&&!sonidoPermitido())return;
      const ac=new (window.AudioContext||window.webkitAudioContext)(),dur=1.3;
      const buf=ac.createBuffer(1,ac.sampleRate*dur,ac.sampleRate),d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2.2);
      const src=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
      src.buffer=buf;f.type="lowpass";f.frequency.value=900;g.gain.value=.9;
      src.connect(f);f.connect(g);g.connect(ac.destination);src.start();
      setTimeout(()=>{try{ac.close();}catch(e){}},dur*1000+300);
    }catch(e){}
  }
  function boom(){
    jugando=false;clearTimeout(tic);pararVoz();rondas++;guardar();
    explosion();if(typeof vibrar==="function")vibrar([400,80,300]);
    raiz.innerHTML=`<div class="qns-pantalla bb-boom" id="bbBoom"><div class="mg-panel bb-panel">
      <div class="bb-icono bb-icono-boom">💥</div><h3>¡BOOM!</h3>
      <p>Perdió el que tiene el celular en la mano.<br>La bomba pasó <b>${pasadas}</b> ${pasadas===1?"vez":"veces"}.</p>
      <button type="button" class="mg-principal" id="bbOtra">💣 Otra ronda</button>
      <button type="button" id="bbTerminar">Terminar</button>
    </div></div>`;
    /* La pantalla sigue prendida hasta que tocan "Terminar". */
    q("bbOtra").onclick=empezar;
    q("bbTerminar").onclick=()=>{PantallaFija.desactivar();inicio();};
  }
  function parar(){jugando=false;clearTimeout(tic);pararVoz();}
  function salir(){parar();if(raiz)PantallaFija.salir();if(raiz)raiz.remove();raiz=null;}
  return{abrir,salir,rondasJugadas:()=>{cargar();return rondas;}};
})();
window.Bomba=Bomba;
