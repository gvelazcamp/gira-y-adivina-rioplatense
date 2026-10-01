/* Silabario Rioplatense: práctica gratuita. Leé la pista y tocá las sílabas
   del tablero en orden para armar la respuesta. El tablero gira entre
   palabra y palabra para que no te acostumbres a dónde está cada sílaba. */
const SILABARIO_CONFIG={
  segundosPorPalabra:16,puntosAcierto:100,bonoSegundo:2,
  spinMs:650,pausaMs:900,ticMs:50,proporcionAvance:.7,
  margenMinimo:.75,descensoMargen:.05,
  niveles:{1:{palabras:8,decoys:3,margen:1.6},2:{palabras:10,decoys:4,margen:1.4},3:{palabras:12,decoys:5,margen:1.2}}
};
const SilabarioRioplatense=(()=>{
  const CLAVE="gya_silabario_rioplatense";
  let datos=cargar(),raiz=null,items=[],estados=[],elegidas=[],actual=-1,volteado=false;
  let nivel=1,config=null,fase="inicio",tiempo=0,espera=0,ultimo=0,intervalo=null;
  const $=s=>raiz?.querySelector(s);
  const numero=(v,base=0)=>Number.isFinite(v)&&v>=0?v:base;
  function cargar(){
    try{const d=JSON.parse(localStorage.getItem(CLAVE));if(d&&typeof d==="object")return{
      mejor:numero(d.mejor),nivelMax:Math.max(1,Math.floor(numero(d.nivelMax,1)))
    };}catch(e){}
    return{mejor:0,nivelMax:1};
  }
  function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify(datos));}catch(e){}}
  function configNivel(n){
    const c=SILABARIO_CONFIG.niveles[n]||{palabras:12,decoys:5,margen:Math.max(SILABARIO_CONFIG.margenMinimo,1-(n-3)*SILABARIO_CONFIG.descensoMargen)};
    return{...c,segundos:Math.round(c.palabras*SILABARIO_CONFIG.segundosPorPalabra*c.margen)};
  }
  function mezclar(lista){const a=[...lista];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function armarRonda(){
    const preferidas=SILABARIO_DATOS.filter(d=>nivel<3?d.nivel<=2:d.nivel>=2);
    const base=preferidas.length?preferidas:SILABARIO_DATOS;
    return mezclar(base).slice(0,config.palabras);
  }
  function pendientes(){return estados.map((s,i)=>s==="pendiente"?i:-1).filter(i=>i>=0);}
  function conteo(s){return estados.filter(x=>x===s).length;}
  function hud(){
    $("#sbNivel").textContent=nivel;$("#sbAciertos").textContent=conteo("acierto")+"/"+items.length;
    $("#sbErrores").textContent=conteo("error");$("#sbTiempo").textContent=Math.max(0,Math.ceil(tiempo/1000));
    $("#sbBarra").style.width=Math.max(0,tiempo/(config.segundos*1000)*100)+"%";
    $("#sbBorrar").disabled=fase!=="jugando"||!elegidas.length;
    $("#sbPasar").disabled=fase!=="jugando";
  }
  function mensaje(texto,tipo=""){const el=$("#sbMensaje");el.textContent=texto;el.className="sb-mensaje "+tipo;}
  function sonido(acierto){
    if(typeof bip!=="function")return;
    if(acierto){bip(660,.2,"sine",.065);bip(990,.3,"triangle",.04);}
    else{bip(180,.24,"sawtooth",.035);bip(135,.3,"triangle",.05);}
    if(typeof vibrar==="function")vibrar(acierto?25:[45,40,45]);
  }
  function silabasDecoy(cantidad,propias){
    const pool=[...new Set(SILABARIO_DATOS.flatMap(d=>d.silabas))].filter(s=>!propias.includes(s));
    return mezclar(pool).slice(0,cantidad);
  }
  function renderRespuesta(item){
    const cont=$("#sbRespuesta");cont.replaceChildren();
    item.silabas.forEach((_,i)=>{
      const slot=document.createElement("span");slot.className="sb-slot"+(i<elegidas.length?" lleno":"");
      slot.textContent=i<elegidas.length?elegidas[i].texto:"";
      cont.appendChild(slot);
    });
  }
  function armarTablero(item){
    elegidas=[];
    const decoys=silabasDecoy(config.decoys,item.silabas);
    const fichas=mezclar([...item.silabas,...decoys]);
    const tablero=$("#sbTablero");tablero.replaceChildren();
    fichas.forEach(texto=>{
      const b=document.createElement("button");b.type="button";b.className="sb-ficha";b.textContent=texto;
      b.onclick=()=>tocarFicha(b,texto);
      tablero.appendChild(b);
    });
    $("#sbPista").textContent=item.pista;
    $("#sbSilabasCant").textContent="("+item.silabas.length+(item.silabas.length===1?" sílaba)":" sílabas)");
    renderRespuesta(item);
  }
  function tocarFicha(el,texto){
    if(fase!=="jugando"||el.disabled)return;
    el.disabled=true;el.classList.add("usada");
    elegidas.push({el,texto});
    renderRespuesta(items[actual]);
    if(elegidas.length===items[actual].silabas.length)verificar();
  }
  function borrar(){
    if(fase!=="jugando"||!elegidas.length)return;
    const ultima=elegidas.pop();
    ultima.el.disabled=false;ultima.el.classList.remove("usada");
    renderRespuesta(items[actual]);
  }
  function verificar(){
    const item=items[actual],texto=elegidas.map(e=>e.texto).join(""),ok=texto===item.respuesta;
    estados[actual]=ok?"acierto":"error";fase="respuesta";espera=SILABARIO_CONFIG.pausaMs;
    sonido(ok);
    mensaje(ok?"¡Bien! +100 puntos · "+item.respuesta:"Era "+item.respuesta,ok?"acierto":"error");
    raiz.querySelectorAll(".sb-ficha.usada").forEach(el=>el.classList.add(ok?"ok":"no"));
    hud();
  }
  function pasar(){if(fase==="jugando")siguiente();}
  function voltear(){
    volteado=true;armarTablero(items[actual]);
    $("#sbTablero").classList.remove("girando");
  }
  function activarJuego(){fase="jugando";hud();}
  function siguiente(){
    const p=pendientes();if(!p.length){terminar();return;}
    const opciones=p.length>1?p.filter(i=>i!==actual):p;
    actual=opciones[Math.floor(Math.random()*opciones.length)];
    fase="armando";volteado=false;mensaje("");
    $("#sbPista").textContent="El tablero está girando…";$("#sbSilabasCant").textContent="";
    $("#sbRespuesta").replaceChildren();
    const reducido=matchMedia("(prefers-reduced-motion: reduce)").matches;
    espera=reducido?0:SILABARIO_CONFIG.spinMs;
    $("#sbTablero").classList.toggle("girando",!reducido);
    hud();
    if(reducido)voltear();
  }
  function iniciar(){
    config=configNivel(nivel);items=armarRonda();estados=items.map(()=>"pendiente");
    actual=-1;tiempo=config.segundos*1000;ultimo=performance.now();
    $("#sbPanel").hidden=true;$("#sbJuego").hidden=false;
    siguiente();
  }
  function panel(titulo,detalle,acciones){
    const p=$("#sbPanel");p.innerHTML='<div class="sf-panel"><h3></h3><p></p><div class="sf-acciones"></div></div>';
    p.querySelector("h3").textContent=titulo;p.querySelector("p").textContent=detalle;
    const cont=p.querySelector(".sf-acciones");
    acciones.forEach(([texto,accion],i)=>{const b=document.createElement("button");b.type="button";b.textContent=texto;if(i===0)b.className="sf-principal";b.onclick=()=>accion(b);cont.appendChild(b);});
    p.hidden=false;
  }
  function terminar(){
    if(fase==="fin")return;fase="fin";
    const aciertos=conteo("acierto"),errores=conteo("error"),faltan=pendientes().length;
    const bonus=faltan===0?Math.max(0,Math.ceil(tiempo/1000))*SILABARIO_CONFIG.bonoSegundo:0;
    const puntos=aciertos*SILABARIO_CONFIG.puntosAcierto+bonus;
    const avanzar=faltan===0&&aciertos>=Math.ceil(items.length*SILABARIO_CONFIG.proporcionAvance);
    datos.mejor=Math.max(datos.mejor,puntos);if(avanzar)datos.nivelMax=Math.max(datos.nivelMax,nivel+1);guardar();
    hud();
    const acciones=[];
    if(avanzar)acciones.push(["Siguiente nivel",()=>{nivel++;iniciar();}]);
    acciones.push(["Otra ronda · nivel "+nivel,iniciar]);
    panel(faltan?"¡Se terminó el tiempo!":errores?"Tablero terminado":"¡Tablero perfecto!",
      aciertos+" aciertos · "+errores+" errores · "+faltan+" sin responder. "+puntos+" puntos"+(bonus?" ("+bonus+" por tiempo)":"")+". Récord: "+datos.mejor+"."+(avanzar?" ¡Desbloqueaste el nivel "+(nivel+1)+"!":" Acertá al menos "+Math.ceil(items.length*SILABARIO_CONFIG.proporcionAvance)+" y respondé todas para avanzar."),acciones);
  }
  function tic(){
    const ahora=performance.now(),dt=Math.max(0,ahora-ultimo);ultimo=ahora;
    if(!raiz||document.hidden||fase==="inicio"||fase==="fin")return;
    if(fase==="jugando"||fase==="respuesta"){
      tiempo=Math.max(0,tiempo-dt);if(tiempo===0){terminar();return;}
    }
    if(fase==="armando"){
      espera-=dt;if(!volteado&&espera<=SILABARIO_CONFIG.spinMs/2)voltear();
      if(espera<=0)activarJuego();
    }else if(fase==="respuesta"){espera-=dt;if(espera<=0)siguiente();}
    hud();
  }
  function visibilidad(){ultimo=performance.now();}
  function abrir(contenedor){
    salir();datos=cargar();nivel=datos.nivelMax;config=configNivel(nivel);fase="inicio";
    raiz=document.createElement("div");raiz.className="sb-game";
    raiz.innerHTML='<div class="sb-titulo"><img src="logo-silabario-rioplatense.svg" alt=""><div><h2>Silabario Rioplatense</h2><p>Armá la respuesta con las sílabas del tablero.</p></div></div><div id="sbJuego" hidden><div class="sf-hud"><div><small>Nivel</small><b id="sbNivel"></b></div><div><small>Aciertos</small><b id="sbAciertos"></b></div><div><small>Errores</small><b id="sbErrores"></b></div><div><small>Tiempo</small><b id="sbTiempo"></b></div></div><div class="sf-bar"><i id="sbBarra"></i></div><div class="sb-pista" role="status" aria-live="polite"><p id="sbPista"></p><small id="sbSilabasCant"></small></div><div class="sb-respuesta" id="sbRespuesta"></div><p id="sbMensaje" class="sb-mensaje" role="status"></p><div class="sb-tablero" id="sbTablero"></div><div class="sf-acciones"><button type="button" id="sbBorrar">⌫ Borrar</button><button type="button" id="sbPasar">Pasar ↻</button></div></div><div class="sf-panel-capa" id="sbPanel" hidden></div>';
    contenedor.appendChild(raiz);
    $("#sbBorrar").onclick=borrar;$("#sbPasar").onclick=pasar;
    document.addEventListener("visibilitychange",visibilidad);ultimo=performance.now();intervalo=setInterval(tic,SILABARIO_CONFIG.ticMs);
    const acciones=[["Jugar nivel "+nivel,iniciar]];if(nivel>1)acciones.push(["Practicar desde el nivel 1",()=>{nivel=1;iniciar();}]);
    panel("Silabario Rioplatense",config.palabras+" palabras y "+config.segundos+" segundos. Mirá la pista y tocá las sílabas del tablero en orden para armar la respuesta. El tablero gira y las sílabas cambian en cada palabra. Si no sabés, tocá Pasar. Acertá al menos "+Math.ceil(config.palabras*SILABARIO_CONFIG.proporcionAvance)+" y respondé todas para avanzar. Jugás gratis, sin gastar vidas ni monedas. Mejor: "+datos.mejor+" puntos.",acciones);
  }
  function salir(){
    clearInterval(intervalo);intervalo=null;document.removeEventListener("visibilitychange",visibilidad);
    raiz=null;fase="inicio";items=[];estados=[];elegidas=[];
  }
  return{abrir,salir,configNivel,mejorPuntaje:()=>cargar().mejor};
})();
window.SilabarioRioplatense=SilabarioRioplatense;
