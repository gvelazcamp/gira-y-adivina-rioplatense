/* Bomba: aparece una sílaba y hay que decir una palabra que la tenga,
   tocar "Pasar" y darle el celular al de al lado. La bomba explota en un
   momento secreto (entre 15 y 45 s): pierde quien la tenga en la mano.
   El tic-tac se acelera. Pantalla completa, sin apagarse y sin "atrás"
   (PantallaFija). Para cortar antes: mantener ✕. Récord en gya_bomba. */
const Bomba=(()=>{
  const CLAVE="gya_bomba";
  const SILABAS=["CA","CO","CU","MA","ME","MI","MO","PA","PE","PI","PO","LA","LO","LI","TA","TE","TO","RE","RO","SA","SE","SO","DE","DO","NA","NE","NO","BA","BO","BU","GA","GO","VA","VE","FA","FI","JA","JU","RA","RI","CHA","CHI","CHO","LLA","LLO","TRA","TRE","PRE","PRO","BRA","BLA","CLA","PLA","GRA","FRA","CRE","MEN","CON","TER","POR","SAL","MAR","CAN","TAR","PAN","SOL","DOR","ITO","ADA","ERO","OSO","ADO","ENTE","ANTE","ICO","ERA","ILLA","ÓN","EZ","AJE"];
  let raiz=null,rondas=0,jugando=false,explota=0,inicioT=0,tic=0,pasadas=0,ultima="",bloqueoToque=0;
  function cargar(){try{const d=JSON.parse(localStorage.getItem(CLAVE));if(d&&typeof d==="object")rondas=Number(d.rondas)||0;}catch(e){}}
  function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify({rondas}));}catch(e){}}
  cargar();
  const q=id=>raiz.querySelector("#"+id);
  function abrir(contenedor){
    salir();cargar();
    raiz=document.createElement("section");raiz.className="bb";
    contenedor.appendChild(raiz);inicio();
  }
  function inicio(){
    raiz.innerHTML=`<div class="mg-panel bb-panel"><div class="bb-icono">💣</div><h3>Bomba</h3>
      <p>Aparece una sílaba: decí una palabra que la tenga (al principio, al medio o al final), tocá <b>Pasar</b> y dale el celular al de al lado.</p>
      <p class="qns-nota">💥 La bomba explota en un momento secreto. Pierde el que la tiene en la mano. ¡Subí el volumen!</p>
      <button type="button" class="mg-principal" id="bbEmpezar">💣 Empezar</button>
      <button type="button" id="bbWpp">💬 Invitar por WhatsApp</button>
    </div>`;
    q("bbEmpezar").onclick=empezar;
    q("bbWpp").onclick=()=>PantallaFija.invitar("bomba","Bomba");
  }
  function silaba(){let s;do{s=SILABAS[Math.floor(Math.random()*SILABAS.length)];}while(s===ultima);ultima=s;return s;}
  function empezar(){
    raiz.innerHTML=`<div class="qns-pantalla bb-juego" id="bbJuego">
      <div class="qs-tope"><span>💣 Bomba</span><b id="bbPasadas">0</b><button type="button" class="qs-salir" id="bbSalir" aria-label="Mantené para salir">✕</button></div>
      <div class="bb-mecha" id="bbMecha">💣</div>
      <div class="bb-silaba" id="bbSilaba"></div>
      <button type="button" class="bb-pasar" id="bbPasar">Pasar ➜</button>
      <div class="qns-pie">Mantené ✕ para salir</div>
    </div>`;
    PantallaFija.activar();
    const juego=q("bbJuego");
    ["touchmove","contextmenu","dblclick"].forEach(t=>juego.addEventListener(t,e=>{if(e.cancelable)e.preventDefault();},{passive:false}));
    q("bbPasar").addEventListener("pointerdown",e=>{e.preventDefault();pasar();});
    PantallaFija.mantener(q("bbSalir"),1500,()=>{parar();PantallaFija.desactivar();if(raiz)inicio();});
    pasadas=0;jugando=true;inicioT=Date.now();explota=inicioT+15000+Math.random()*30000;
    q("bbSilaba").textContent=silaba();
    tictac();
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
    jugando=false;clearTimeout(tic);rondas++;guardar();
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
  function parar(){jugando=false;clearTimeout(tic);}
  function salir(){parar();if(raiz)PantallaFija.desactivar();if(raiz)raiz.remove();raiz=null;}
  return{abrir,salir,rondasJugadas:()=>{cargar();return rondas;}};
})();
window.Bomba=Bomba;
