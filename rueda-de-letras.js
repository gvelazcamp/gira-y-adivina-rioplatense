const RUEDA_CONFIG={
  segundosBase:5,segundosPorLetra:1,puntosPorLetra:10,puntosExtraPorLetra:5,bonoBase:100,puntosSegundo:3,giroMs:750,ticMs:100,
  niveles:{1:{letras:6,palabras:6,min:3,max:5,margen:1.6},2:{letras:6,palabras:8,min:3,max:6,margen:1.4},3:{letras:7,palabras:9,min:3,max:7,margen:1.25},4:{letras:7,palabras:10,min:3,max:7,margen:1.1}},
  avanzado:{letras:7,palabrasBase:10,palabrasMax:12,min:4,max:7,margenInicial:1,margenPaso:.05,margenPiso:.75}
};
const RuedaDeLetras=(()=>{
  const CLAVE="gya_rueda_de_letras",azar=n=>Math.floor(Math.random()*n);
  let datos=cargar(),raiz=null,nivel=1,puntos=0,ronda=null,letras=[],hechas=new Set(),extrasEncontradas=new Set(),encontradasRonda=[],camino=[],arrastrando=false,jugando=false,girando=false;
  let tiempoMs=0,duracionMs=0,ultimo=0,intervalo=null,giroTimer=null,errores=0,inicio=0,ocultoDesde=0,token=0;
  function cargar(){try{const d=JSON.parse(localStorage.getItem(CLAVE)||"null");if(d)return{mejor:Number(d.mejor)||0,nivelMax:Number(d.nivelMax)||1,completadas:Number(d.completadas)||0,tiempos:Array.isArray(d.tiempos)?d.tiempos:[],coleccion:[...new Set((Array.isArray(d.coleccion)?d.coleccion:[]).filter(w=>typeof w==="string"&&/^[A-Z]{3,7}$/.test(w)))]};}catch(e){}return{mejor:0,nivelMax:1,completadas:0,tiempos:[],coleccion:[]};}
  function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify(datos));}catch(e){}}
  function mejorPuntaje(){return datos.mejor;}
  function configNivel(n){if(RUEDA_CONFIG.niveles[n])return RUEDA_CONFIG.niveles[n];const a=RUEDA_CONFIG.avanzado,p=n-5;return{letras:a.letras,palabras:Math.min(a.palabrasMax,a.palabrasBase+Math.floor(Math.max(0,p)/2)),min:a.min,max:a.max,margen:Math.max(a.margenPiso,a.margenInicial-p*a.margenPaso)};}
  function mezclar(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=azar(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;}
  function elegir(n){const c=configNivel(n),fuentes=RUEDA_DATOS.filter(d=>d.base.length===c.letras),fuente=fuentes[azar(fuentes.length)];const candidatas=fuente.palabras.filter(w=>w!==fuente.base&&w.length>=c.min&&w.length<=c.max);if(candidatas.length<c.palabras-1)throw Error("Faltan palabras en "+fuente.base);return{base:fuente.base,ciudad:fuente.ciudad,palabras:[fuente.base,...candidatas.slice(0,c.palabras-1)]};}
  function tiempoRonda(palabras,n){const c=configNivel(n),largo=palabras.reduce((s,w)=>s+w.length,0)/palabras.length;return Math.round(palabras.length*(RUEDA_CONFIG.segundosBase+RUEDA_CONFIG.segundosPorLetra*largo)*c.margen*1000);}
  function sonido(){try{if(typeof sonarRuletaGiro==="function")sonarRuletaGiro();}catch(e){}}
  function feedback(){try{if(typeof vibrar==="function")vibrar(20);}catch(e){}}
  function pantalla(){raiz.innerHTML=`<div class="rl-game"><h2>Rueda de Letras</h2><p class="rl-sub">Encontrá las ocultas. Otras palabras válidas suman 5 puntos por letra.</p><div class="rl-hud"><div><small>Nivel</small><b id="rlNivel"></b></div><div><small>Puntos</small><b id="rlPuntos"></b></div><div><small>Mejor</small><b id="rlMejor"></b></div><div><small>Tiempo</small><b id="rlTiempo"></b></div></div><div class="sf-bar"><i id="rlBarra"></i></div><div class="rl-pistas" id="rlPistas"></div><details class="rl-cajon" id="rlCajon"><summary><span class="rl-cajon-icono" aria-hidden="true">📥</span><span class="rl-cajon-titulo"><b>Mi cajón · <span id="rlColeccionCount">0</span> <span id="rlColeccionUnidad">palabras</span></b><small id="rlUltimaGuardada">Las palabras que encuentres caen acá</small></span><span class="rl-cajon-ver">Ver</span></summary><div class="rl-cajon-cuerpo"><p>De esta rueda: <span id="rlRondaCount">0</span> · <span id="rlExtrasCount">0</span> extra</p><div class="rl-cajon-lista" id="rlRondaLista">Todavía no encontraste ninguna.</div><p>Guardadas para próximas partidas</p><div class="rl-cajon-lista" id="rlColeccionLista">Tu cajón está vacío.</div></div></details><div class="rl-actual" id="rlActual" aria-live="polite">Deslizá por la rueda</div><div class="rl-rueda" id="rlRueda"><svg class="rl-lineas" id="rlLineas" aria-hidden="true"></svg></div><div class="rl-acciones"><button id="rlGirar" type="button">🔄 Girar</button><button id="rlSalir" type="button">Salir</button></div><div class="sf-panel-capa" id="rlPanel"></div></div>`;raiz.querySelector("#rlGirar").onclick=girar;raiz.querySelector("#rlSalir").onclick=()=>Extensiones.abrirLobby();}
  function panel(titulo,mensaje,accion,funcion){const p=raiz.querySelector("#rlPanel");p.innerHTML='<div class="sf-panel"><h3></h3><p></p><div class="sf-acciones"><button class="sf-principal" type="button"></button></div></div>';p.querySelector("h3").textContent=titulo;p.querySelector("p").textContent=mensaje;p.querySelector("button").textContent=accion;p.querySelector("button").onclick=funcion;p.hidden=false;}
  function hud(){if(!raiz)return;raiz.querySelector("#rlNivel").textContent=nivel;raiz.querySelector("#rlPuntos").textContent=puntos;raiz.querySelector("#rlMejor").textContent=Math.max(datos.mejor,puntos);raiz.querySelector("#rlTiempo").textContent=Math.ceil(Math.max(0,tiempoMs)/1000);raiz.querySelector("#rlBarra").style.width=Math.max(0,tiempoMs/duracionMs*100)+"%";}
  function pistas(){const p=raiz.querySelector("#rlPistas");p.replaceChildren();ronda.palabras.forEach(w=>{const d=document.createElement("div");d.className="rl-pista"+(hechas.has(w)?" hecho":"");d.textContent=hechas.has(w)?w:"• ".repeat(w.length).trim();d.setAttribute("aria-label",hechas.has(w)?w:`Palabra de ${w.length} letras`);p.appendChild(d);});}
  function mostrarCajon(ultima=""){
    raiz.querySelector("#rlColeccionCount").textContent=datos.coleccion.length;
    raiz.querySelector("#rlColeccionUnidad").textContent=datos.coleccion.length===1?"palabra":"palabras";
    raiz.querySelector("#rlRondaCount").textContent=encontradasRonda.length;
    raiz.querySelector("#rlExtrasCount").textContent=extrasEncontradas.size;
    const dibujar=(id,palabras,vacio)=>{const lista=raiz.querySelector(id);lista.replaceChildren();if(!palabras.length){lista.textContent=vacio;return;}for(const w of palabras){const chip=document.createElement("span");chip.className="rl-palabra"+(extrasEncontradas.has(w)?" extra":"")+(w===ultima?" caer":"");chip.textContent=w;lista.appendChild(chip);}};
    dibujar("#rlRondaLista",encontradasRonda,"Todavía no encontraste ninguna.");
    dibujar("#rlColeccionLista",[...datos.coleccion].reverse(),"Tu cajón está vacío.");
    const etiqueta=raiz.querySelector("#rlUltimaGuardada");
    etiqueta.textContent=ultima?ultima+" cayó al cajón":"Las palabras que encuentres caen acá";
    etiqueta.classList.remove("caer");if(ultima){void etiqueta.offsetWidth;etiqueta.classList.add("caer");}
  }
  function guardarEnCajon(w){encontradasRonda.push(w);if(!datos.coleccion.includes(w)){datos.coleccion.push(w);guardar();}mostrarCajon(w);}
  function mensaje(texto){raiz.querySelector("#rlActual").textContent=texto;}
  function rueda(){const r=raiz.querySelector("#rlRueda");r.querySelectorAll(".rl-letra").forEach(x=>x.remove());letras.forEach((l,i)=>{const b=document.createElement("button");b.type="button";b.className="rl-letra";b.dataset.i=i;b.textContent=l;const ang=(i/letras.length)*Math.PI*2-Math.PI/2;b.style.left=(50+38*Math.cos(ang))+"%";b.style.top=(50+38*Math.sin(ang))+"%";b.onpointerdown=e=>{if(!jugando||girando)return;e.preventDefault();arrastrando=true;camino=[i];b.setPointerCapture(e.pointerId);pintar();};r.appendChild(b);});r.onpointermove=e=>{if(!arrastrando)return;const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest(".rl-letra");if(!hit||!r.contains(hit))return;const i=Number(hit.dataset.i);if(i===camino.at(-2))camino.pop();else if(!camino.includes(i))camino.push(i);pintar();};r.onpointerup=e=>{if(!arrastrando)return;arrastrando=false;entregar();};r.onpointercancel=()=>{arrastrando=false;camino=[];pintar();};}
  function pintar(){if(!raiz)return;raiz.querySelector("#rlActual").textContent=camino.length?camino.map(i=>letras[i]).join(""):"Deslizá por la rueda";raiz.querySelectorAll(".rl-letra").forEach((b,i)=>b.classList.toggle("sel",camino.includes(i)));const r=raiz.querySelector("#rlRueda"),svg=raiz.querySelector("#rlLineas"),box=r.getBoundingClientRect();svg.setAttribute("viewBox",`0 0 ${box.width} ${box.height}`);const points=camino.map(i=>{const b=r.querySelector(`.rl-letra[data-i="${i}"]`).getBoundingClientRect();return `${b.left+b.width/2-box.left},${b.top+b.height/2-box.top}`;}).join(" ");svg.innerHTML=points?`<polyline points="${points}" fill="none" stroke="#37D6C0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`:"";}
  function entregar(){
    const w=camino.map(i=>letras[i]).join("");camino=[];pintar();
    if(!jugando||w.length<3)return;
    if(hechas.has(w)||extrasEncontradas.has(w)){mensaje(w+" ya encontrada");return;}
    if(ronda.palabras.includes(w)){
      hechas.add(w);
      const ganados=w.length*RUEDA_CONFIG.puntosPorLetra+(w===ronda.base?RUEDA_CONFIG.bonoBase:0);
      puntos+=ganados;pistas();guardarEnCajon(w);hud();feedback();mensaje(w+" · +"+ganados+" puntos");
      if(typeof objSumar==="function")objSumar("ruedaPalabras",1);
      if(typeof logroDesbloquear==="function"){logroDesbloquear("ruedaPrimera");if(w===ronda.base&&performance.now()-inicio<10000)logroDesbloquear("ruedaBaseRapida");}
      if(hechas.size===ronda.palabras.length)terminar(true);
    }else if(RUEDA_DICCIONARIO.has(w)){
      extrasEncontradas.add(w);
      const ganados=w.length*RUEDA_CONFIG.puntosExtraPorLetra;
      puntos+=ganados;guardarEnCajon(w);hud();feedback();mensaje(w+" extra · +"+ganados+" puntos");
    }else{
      errores++;mensaje("Esa palabra no está en el diccionario");
      const r=raiz.querySelector("#rlRueda");r.classList.remove("error");void r.offsetWidth;r.classList.add("error");
    }
  }
  function girar(){if(!jugando||arrastrando||girando)return;girando=true;const r=raiz.querySelector("#rlRueda");r.classList.add("spin");sonido();const t=++token;giroTimer=setTimeout(()=>{if(t!==token)return;letras=mezclar(letras);rueda();r.classList.remove("spin");girando=false;giroTimer=null;},RUEDA_CONFIG.giroMs);}
  function tic(){if(!jugando||document.hidden)return;const ahora=performance.now();tiempoMs=Math.max(0,tiempoMs-(ahora-ultimo));ultimo=ahora;hud();if(!tiempoMs)terminar(false);}
  function visibilidad(){if(document.hidden){ocultoDesde=performance.now();}else if(jugando){ultimo=performance.now();ocultoDesde=0;}}
  function comenzar(){clearInterval(intervalo);clearTimeout(giroTimer);token++;ronda=elegir(nivel);letras=mezclar([...ronda.base]);hechas=new Set();extrasEncontradas=new Set();encontradasRonda=[];camino=[];arrastrando=false;girando=false;errores=0;duracionMs=tiempoRonda(ronda.palabras,nivel);tiempoMs=duracionMs;jugando=true;inicio=ultimo=performance.now();raiz.querySelector("#rlPanel").hidden=true;raiz.querySelector("#rlRueda").classList.remove("spin","error");raiz.querySelector("#rlCajon").open=false;mensaje("Deslizá por la rueda");pistas();mostrarCajon();rueda();hud();intervalo=setInterval(tic,RUEDA_CONFIG.ticMs);if(typeof objSumar==="function")objSumar("ruedaRonda",1);}
  function terminar(gano){if(!jugando)return;jugando=false;clearInterval(intervalo);intervalo=null;if(gano){puntos+=Math.ceil(tiempoMs/1000)*RUEDA_CONFIG.puntosSegundo;datos.completadas++;datos.nivelMax=Math.max(datos.nivelMax,nivel+1);if(errores===0&&typeof logroDesbloquear==="function")logroDesbloquear("ruedaPerfecta");}datos.mejor=Math.max(datos.mejor,puntos);datos.tiempos.push({nivel,base:ronda.base,segundos:Math.round((duracionMs-tiempoMs)/1000),ganada:gano});datos.tiempos=datos.tiempos.slice(-60);guardar();hud();panel(gano?"¡Rueda completada!":"Se acabó el tiempo",`${hechas.size}/${ronda.palabras.length} ocultas · ${extrasEncontradas.size} extra · ${puntos} puntos${gano?"":" · Faltaban: "+ronda.palabras.filter(w=>!hechas.has(w)).join(", ")}`,gano?"Siguiente rueda":"Volver a intentar",()=>{if(gano)nivel++;else{nivel=1;puntos=0;}comenzar();});}
  function abrir(contenedor){salir();datos=cargar();raiz=contenedor;pantalla();panel("Rueda de Letras","Arrastrá entre letras para formar palabras. Las ocultas completan la ronda; otras palabras válidas suman puntos extra. Todas las encontradas caen en tu cajón y quedan guardadas para otras partidas.","Empezar",()=>{nivel=1;puntos=0;comenzar();});document.addEventListener("visibilitychange",visibilidad);}
  function salir(){jugando=false;clearInterval(intervalo);clearTimeout(giroTimer);intervalo=null;giroTimer=null;token++;document.removeEventListener("visibilitychange",visibilidad);raiz=null;}
  return{abrir,salir,mejorPuntaje,configNivel,tiempoRonda,elegir};
})();
window.RuedaDeLetras=RuedaDeLetras;
