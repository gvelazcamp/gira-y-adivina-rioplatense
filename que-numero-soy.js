/* ¿Qué número soy?: el celular muestra un número gigante en pantalla
   completa (se lo ponen en la frente o lo muestran al grupo). Mientras
   dura la ronda (PantallaFija) la pantalla no se apaga, los toques no
   hacen nada y el botón "atrás" no saca del juego: para terminar hay que
   mantener apretado 3 segundos. Récord en gya_que_numero_soy. */
const QueNumeroSoy=(()=>{
  const CLAVE="gya_que_numero_soy",RANGOS=[10,50,100];
  const MANTENER_MS=3000;
  let raiz=null,capa=null,max=100,numero=0,rondas=0,cuenta=0,bloqueado=false,timerMantener=0,inicioMantener=0,rafMantener=0;
  function cargar(){try{const d=JSON.parse(localStorage.getItem(CLAVE));if(d&&typeof d==="object"){if(RANGOS.includes(d.max))max=d.max;rondas=Number(d.rondas)||0;}}catch(e){}}
  function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify({max,rondas}));}catch(e){}}
  cargar();
  const q=id=>raiz.querySelector("#"+id);

  /* Pantalla completa, sin apagarse y sin "atrás": PantallaFija (pantalla-fija.js). */
  function frenar(e){if(!bloqueado)return;if(e.cancelable)e.preventDefault();e.stopPropagation();}

  function abrir(contenedor){
    salir();cargar();
    raiz=document.createElement("section");raiz.className="qns";
    raiz.innerHTML=`<div class="mg-panel qns-panel"><h3>¿Qué número soy?</h3>
      <p>El celular muestra un número gigante. Ponételo en la frente: los demás te dan pistas y vos adiviná tu número.</p>
      <p class="qns-nota">🔒 Mientras juegan la pantalla no se apaga y los toques no hacen nada. Para terminar, <b>mantené apretado 3 segundos</b>.</p>
      <div class="qns-rangos" id="qnsRangos">${RANGOS.map(r=>`<button type="button" data-max="${r}">1 a ${r}</button>`).join("")}</div>
      <button type="button" class="mg-principal" id="qnsEmpezar">▶ Empezar</button>
      <button type="button" id="qnsWpp">💬 Invitar por WhatsApp</button>
    </div>
    <div class="qns-pantalla" id="qnsPantalla" hidden>
      <div class="qns-num" id="qnsNum"></div>
      <div class="qns-pie" id="qnsPie">🔒 Dejá apretado 3 segundos para terminar la partida</div>
      <div class="qns-barra"><i id="qnsBarra"></i></div>
    </div>
    <div class="qns-pantalla qns-fin" id="qnsFin" hidden>
      <div class="mg-panel qns-panel"><h3>Tu número era</h3><div class="qns-num qns-num-chico" id="qnsEra"></div>
        <button type="button" class="mg-principal" id="qnsOtro">🔄 Otro número</button>
        <button type="button" id="qnsTerminar">Terminar</button>
      </div>
    </div>`;
    contenedor.appendChild(raiz);PantallaFija.entrar();
    pintarRangos();
    q("qnsRangos").onclick=e=>{const b=e.target.closest("button[data-max]");if(!b)return;max=Number(b.dataset.max);guardar();pintarRangos();};
    q("qnsEmpezar").onclick=empezar;
    q("qnsOtro").onclick=empezar;
    q("qnsTerminar").onclick=terminar;
    q("qnsWpp").onclick=()=>PantallaFija.invitar("que-numero-soy","¿Qué número soy?");
    capa=q("qnsPantalla");
    capa.addEventListener("pointerdown",empezarMantener);
    ["pointerup","pointercancel","pointerleave"].forEach(t=>capa.addEventListener(t,cortarMantener));
    ["touchstart","touchmove","touchend","contextmenu","dblclick","wheel"].forEach(t=>capa.addEventListener(t,frenar,{passive:false}));
  }
  function pintarRangos(){raiz.querySelectorAll("#qnsRangos button").forEach(b=>b.classList.toggle("activo",Number(b.dataset.max)===max));}
  function empezar(){
    if(!raiz)return;
    numero=1+Math.floor(Math.random()*max);
    bloqueado=true;
    PantallaFija.activar();
    q("qnsFin").hidden=true;capa.hidden=false;document.body.classList.add("qns-bloqueado");
    /* Cuenta regresiva para que llegue a ponérselo en la frente sin verlo. */
    let n=3;const num=q("qnsNum"),pie=q("qnsPie");
    num.classList.add("qns-cuenta");pie.textContent="Ponete el celular en la frente";
    const paso=()=>{
      if(!raiz||!bloqueado)return;
      if(n>0){num.textContent=n;n--;cuenta=setTimeout(paso,1000);return;}
      num.classList.remove("qns-cuenta");num.textContent=numero;
      pie.textContent="🔒 Dejá apretado 3 segundos para terminar la partida";
      if(typeof vibrar==="function")vibrar(40);
    };
    clearTimeout(cuenta);paso();
  }
  function empezarMantener(e){
    frenar(e);if(!bloqueado)return;
    cortarMantener();inicioMantener=performance.now();
    const barra=q("qnsBarra");
    const anim=()=>{const p=Math.min(1,(performance.now()-inicioMantener)/MANTENER_MS);barra.style.width=p*100+"%";if(p<1)rafMantener=requestAnimationFrame(anim);};
    rafMantener=requestAnimationFrame(anim);
    timerMantener=setTimeout(desbloquear,MANTENER_MS);
  }
  function cortarMantener(){clearTimeout(timerMantener);cancelAnimationFrame(rafMantener);timerMantener=0;if(raiz){const b=q("qnsBarra");if(b)b.style.width="0";}}
  function desbloquear(){
    cortarMantener();clearTimeout(cuenta);
    bloqueado=false;capa.hidden=true;document.body.classList.remove("qns-bloqueado");
    rondas++;guardar();
    q("qnsEra").textContent=numero;q("qnsFin").hidden=false;
    if(typeof vibrar==="function")vibrar([30,40,30]);
    /* La pantalla sigue prendida hasta que tocan "Terminar". */
  }
  function terminar(){bloqueado=false;PantallaFija.desactivar();if(raiz){q("qnsFin").hidden=true;capa.hidden=true;}document.body.classList.remove("qns-bloqueado");}
  function salir(){
    clearTimeout(cuenta);cortarMantener();
    if(bloqueado||raiz)PantallaFija.salir();bloqueado=false;document.body.classList.remove("qns-bloqueado");
    if(raiz)raiz.remove();raiz=null;capa=null;
  }
  return{abrir,salir,tecla:(k,e)=>{if(bloqueado&&e){e.preventDefault();}},bloqueado:()=>bloqueado,rondasJugadas:()=>{cargar();return rondas;}};
})();
window.QueNumeroSoy=QueNumeroSoy;
