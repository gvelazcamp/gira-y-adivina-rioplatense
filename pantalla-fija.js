/* PantallaFija: modo "previa" compartido por los juegos de grupo
   (¿Qué número soy?, ¿Quién soy?, Bomba). También invitar(id,nombre):
   link de WhatsApp que abre el juego directo (?ext=<id>). Mientras está activo:
   pantalla completa, la pantalla no se apaga (Screen Wake Lock, se vuelve
   a pedir al volver a la app) y el "atrás" del celular no saca del juego.
   mantener(el,ms,cb): botón que hay que dejar apretado ms para salir;
   pinta el avance en la variable CSS --p del botón (0 a 1). */
const PantallaFija=(()=>{
  let activo=false,wake=null,orientacion="";
  async function pedirWake(){try{if(activo&&"wakeLock" in navigator&&!wake&&document.visibilityState==="visible"){wake=await navigator.wakeLock.request("screen");wake.addEventListener("release",()=>{wake=null;});}}catch(e){wake=null;}}
  function soltarWake(){try{if(wake)wake.release();}catch(e){}wake=null;}
  function alVolver(){if(activo&&document.visibilityState==="visible")pedirWake();}
  function alAtras(){if(activo)try{history.pushState({fija:1},"");}catch(e){}}
  document.addEventListener("visibilitychange",alVolver);
  window.addEventListener("popstate",alAtras);
  function activar(opts={}){
    const yaEstaba=activo;activo=true;
    if(!yaEstaba)try{history.pushState({fija:1},"");}catch(e){}
    try{const el=document.documentElement;
      if(!document.fullscreenElement&&el.requestFullscreen){
        const p=el.requestFullscreen({navigationUI:"hide"});
        if(p&&p.then)p.then(()=>{if(opts.orientacion&&screen.orientation&&screen.orientation.lock){orientacion=opts.orientacion;screen.orientation.lock(opts.orientacion).catch(()=>{});}}).catch(()=>{});
      }}catch(e){}
    pedirWake();
  }
  function desactivar(){
    activo=false;soltarWake();
    try{if(orientacion&&screen.orientation&&screen.orientation.unlock)screen.orientation.unlock();}catch(e){}orientacion="";
    try{if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});}catch(e){}
  }
  function mantener(el,ms,cb){
    let t=0,raf=0,ini=0;
    const cortar=()=>{clearTimeout(t);cancelAnimationFrame(raf);el.style.setProperty("--p","0");};
    el.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();cortar();ini=performance.now();
      const anim=()=>{const p=Math.min(1,(performance.now()-ini)/ms);el.style.setProperty("--p",String(p));if(p<1)raf=requestAnimationFrame(anim);};
      raf=requestAnimationFrame(anim);t=setTimeout(()=>{cortar();cb();},ms);});
    ["pointerup","pointercancel","pointerleave"].forEach(n=>el.addEventListener(n,cortar));
    el.addEventListener("contextmenu",e=>e.preventDefault());
  }
  /* Invitación por WhatsApp a un juego de previa (link ?ext=<id>). */
  function invitar(id,nombre){
    let base="";try{base=location.origin+location.pathname;}catch(e){}
    const texto="¿Jugamos a "+nombre+" en Girá y Adiviná? Entrá acá: "+base+"?ext="+id;
    try{window.open("https://wa.me/?text="+encodeURIComponent(texto),"_blank");}catch(e){}
  }
  return{activar,desactivar,mantener,invitar,activo:()=>activo};
})();
window.PantallaFija=PantallaFija;
