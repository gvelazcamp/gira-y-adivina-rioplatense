/* PantallaFija: modo "previa" compartido por los juegos de grupo
   (¿Qué número soy?, ¿Quién soy?, Bomba). También invitar(id,nombre):
   link de WhatsApp que abre el juego directo (?ext=<id>). Mientras está activo:
   pantalla completa, la pantalla no se apaga (Screen Wake Lock, se vuelve
   a pedir al volver a la app) y el "atrás" del celular no saca del juego.
   confirmar(el,cb): el botón ✕ Salir pregunta "¿Terminar la partida?" Sí/No. */
const PantallaFija=(()=>{
  let activo=false,siempre=false,wake=null,orientacion="";
  async function pedirWake(){try{if((activo||siempre)&&"wakeLock" in navigator&&!wake&&document.visibilityState==="visible"){wake=await navigator.wakeLock.request("screen");wake.addEventListener("release",()=>{wake=null;});}}catch(e){wake=null;}}
  function soltarWake(){try{if(wake)wake.release();}catch(e){}wake=null;}
  function alVolver(){if((activo||siempre)&&document.visibilityState==="visible")pedirWake();}
  function alAtras(){if(activo)try{history.pushState({fija:1},"");}catch(e){}}
  document.addEventListener("visibilitychange",alVolver);
  window.addEventListener("popstate",alAtras);
  /* Pantalla completa apenas se abre el juego (todavía con el toque del
     usuario): así el aviso de Chrome "Para salir de la pantalla completa…"
     sale en la pantalla de inicio y no tapa el número/palabra al jugar.
     Se queda en pantalla completa entre rondas; solo sale con salir(). */
  function entrar(){
    try{const el=document.documentElement;
      if(!document.fullscreenElement&&el.requestFullscreen)return el.requestFullscreen({navigationUI:"hide"}).catch(()=>{});}catch(e){}
    return Promise.resolve();
  }
  function bloquearOrientacion(o){try{if(o&&screen.orientation&&screen.orientation.lock){orientacion=o;screen.orientation.lock(o).catch(()=>{});}}catch(e){}}
  function desbloquearOrientacion(){try{if(orientacion&&screen.orientation&&screen.orientation.unlock)screen.orientation.unlock();}catch(e){}orientacion="";}
  function activar(opts={}){
    const yaEstaba=activo;activo=true;document.body.classList.add("pf-activo");
    if(!yaEstaba)try{history.pushState({fija:1},"");}catch(e){}
    const p=entrar();
    if(opts.orientacion)(p&&p.then?p:Promise.resolve()).then(()=>{if(activo)bloquearOrientacion(opts.orientacion);});
    pedirWake();
  }
  /* Fin de la ronda: la pantalla ya se puede apagar y "atrás" vuelve a andar,
     pero sigue en pantalla completa para la próxima ronda. */
  function desactivar(){activo=false;document.body.classList.remove("pf-activo");if(!siempre)soltarWake();desbloquearOrientacion();}
  /* Solo "no apagar la pantalla" mientras el juego está abierto (Contra Reloj),
     sin bloquear el "atrás". Se corta con salir(). */
  function prender(){siempre=true;pedirWake();}
  function salir(){
    siempre=false;desactivar();soltarWake();
    try{if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});}catch(e){}
  }
  /* Botón ✕ Salir: pregunta "¿Terminar la partida?" con Sí / No. */
  function confirmar(el,cb,texto="¿Terminar la partida?"){
    el.addEventListener("click",e=>{
      e.preventDefault();e.stopPropagation();
      if(document.querySelector(".pf-confirmar"))return;
      const c=document.createElement("div");c.className="pf-confirmar";
      c.innerHTML='<div class="mg-panel pf-caja"><h3></h3><button type="button" class="mg-principal" data-r="si">Sí, terminar</button><button type="button" data-r="no">No, seguir jugando</button></div>';
      c.querySelector("h3").textContent=texto;
      ["pointerdown","touchstart"].forEach(t=>c.addEventListener(t,ev=>ev.stopPropagation()));
      c.addEventListener("click",ev=>{ev.stopPropagation();const r=ev.target.closest("button[data-r]");if(!r&&ev.target!==c)return;c.remove();if(r&&r.dataset.r==="si")cb();});
      document.body.appendChild(c);
    });
  }
  /* Invitación por WhatsApp a un juego de previa (link ?ext=<id>). */
  function invitar(id,nombre){
    let base="";try{base=location.origin+location.pathname;}catch(e){}
    const texto="¿Jugamos a "+nombre+" en Girá y Adiviná? Entrá acá: "+base+"?ext="+id;
    try{window.open("https://wa.me/?text="+encodeURIComponent(texto),"_blank");}catch(e){}
  }
  return{entrar,activar,desactivar,prender,salir,confirmar,invitar,activo:()=>activo};
})();
window.PantallaFija=PantallaFija;
