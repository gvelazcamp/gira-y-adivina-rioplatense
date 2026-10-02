/* Ahorcado Rioplatense: el clásico del muñeco, con una ruleta de categorías
   que gira antes de cada palabra. Partida de 5 palabras sin repetir, todas
   difíciles (sin niveles): la categoría donde frena la ruleta es la única
   pista. 6 errores = se pierde esa palabra y se dibuja el muñeco completo. */
const AHORCADO_CONFIG={palabras:5,vidas:6,ptsPalabra:150,ptsVida:20,giroMs:1800,pausaMs:900};
const AHORCADO_LETRAS="ABCDEFGHIJKLMNOPQRSTUVYZ";
const AhorcadoRioplatense=(()=>{
  const CLAVE="gya_ahorcado_rioplatense";
  const $=s=>raiz?.querySelector(s);
  let raiz=null,fase="inicio",datos=cargar(),duelo=false,palabrasDuelo=null;
  let palabra=null,usadas=[],adivinadas=new Set(),errores=0,puntos=0,n=0,W=0,etiquetas=[],intervalo=null;
  let audioMusica=null;
  function iniciarMusicaJuego(){
    try{
      if(typeof sonidoPermitido==="function"&&!sonidoPermitido())return;
      if(!audioMusica){audioMusica=new Audio("assets/audio/ahorcado-rioplatense-musica.mp3");audioMusica.loop=true;audioMusica.volume=.28;}
      if(audioMusica.paused)audioMusica.play().catch(()=>{});
    }catch(e){}
  }
  function detenerMusicaJuego(){try{if(audioMusica&&!audioMusica.paused)audioMusica.pause();}catch(e){}}
  function visibilidad(){if(document.hidden)detenerMusicaJuego();else iniciarMusicaJuego();}
  function numero(v,base=0){return Number.isFinite(v)&&v>=0?v:base;}
  function cargar(){
    try{const d=JSON.parse(localStorage.getItem(CLAVE));if(d&&typeof d==="object")return{mejor:numero(d.mejor)};}catch(e){}
    return{mejor:0};
  }
  function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify(datos));}catch(e){}}
  function mezclar(lista){const a=[...lista];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function panel(titulo,detalle,acciones){
    const p=$("#ahPanel");p.innerHTML='<div class="sf-panel"><h3></h3><p></p><div class="sf-acciones"></div></div>';
    p.querySelector("h3").textContent=titulo;p.querySelector("p").textContent=detalle;
    const cont=p.querySelector(".sf-acciones");
    acciones.forEach(([texto,accion],i)=>{const b=document.createElement("button");b.type="button";b.textContent=texto;if(i===0)b.className="sf-principal";b.onclick=()=>accion(b);cont.appendChild(b);});
    p.hidden=false;
  }
  function posicionarRueda(){
    const wrap=$("#ahRuedaWrap");if(!wrap)return;
    const N=AHORCADO_CATEGORIAS.length,R=wrap.clientWidth*.31;
    etiquetas.forEach((d,i)=>{const a=i*360/N+180/N;d.style.transform=`translate(-50%,-50%) rotate(${a}deg) translateY(${-R}px) rotate(${-a}deg) rotate(${-W}deg)`});
    $("#ahRueda").style.transform=`rotate(${W}deg)`;
  }
  function construirRueda(){
    const N=AHORCADO_CATEGORIAS.length,rueda=$("#ahRueda");
    rueda.style.background="conic-gradient("+AHORCADO_CATEGORIAS.map((c,i)=>`${c.color} ${i*360/N}deg ${(i+1)*360/N}deg`).join(",")+")";
    rueda.replaceChildren();etiquetas=[];
    AHORCADO_CATEGORIAS.forEach(c=>{const d=document.createElement("div");d.className="ah-cat";d.innerHTML=c.emoji+"<br>"+c.nombre;rueda.appendChild(d);etiquetas.push(d);});
    posicionarRueda();
  }
  function girarA(indice,cb){
    const N=AHORCADO_CATEGORIAS.length,reducido=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const a=indice*360/N+180/N,falta=((-a-W)%360+360)%360;
    W+=reducido?falta:1080+falta;posicionarRueda();
    setTimeout(cb,reducido?30:AHORCADO_CONFIG.giroMs);
  }
  function elegirPalabra(excluir){
    const libres=AHORCADO_DATOS.filter(d=>!excluir.some(u=>u.palabra===d.palabra));
    const cats=[...new Set(libres.map(d=>d.categoria))];
    const catId=cats[Math.floor(Math.random()*cats.length)];
    const opciones=libres.filter(d=>d.categoria===catId);
    return opciones[Math.floor(Math.random()*opciones.length)];
  }
  function dibujarPalabra(revelar){
    $("#ahPalabra").innerHTML=palabra.palabra.split("").map(c=>{
      const vista=adivinadas.has(c);
      return `<div class="ah-letra${!vista&&revelar?" x":""}">${vista||revelar?c:""}</div>`;
    }).join("");
  }
  function hud(){$("#ahN").textContent=n+"/"+AHORCADO_CONFIG.palabras;$("#ahPt").textContent=puntos;$("#ahMejor").textContent=datos.mejor;}
  function construirTeclado(){
    $("#ahTeclado").innerHTML=AHORCADO_LETRAS.split("").map(c=>`<button type="button" data-l="${c}">${c}</button>`).join("");
  }
  function resetTeclado(){document.querySelectorAll("#ahTeclado button").forEach(b=>{b.className="";b.disabled=false;});}
  function siguientePalabra(){
    n++;errores=0;adivinadas=new Set();fase="girando";$("#ahSiguiente").hidden=true;$("#ahFeedback").textContent="";
    document.querySelectorAll(".ah-figura g>*").forEach(e=>e.classList.remove("on"));$("#ahFigura").classList.remove("perdida");
    resetTeclado();$("#ahPalabra").innerHTML="";$("#ahPregunta").innerHTML="<small>Girando…</small>";hud();
    if(duelo){palabra=palabrasDuelo[n-1];}else{palabra=elegirPalabra(usadas);usadas.push(palabra);}
    const indice=AHORCADO_CATEGORIAS.findIndex(c=>c.id===palabra.categoria);
    girarA(indice,()=>{
      const cat=AHORCADO_CATEGORIAS[indice];
      $("#ahPregunta").innerHTML=`<small>Categoría</small>${cat.emoji} ${cat.nombre} · ${palabra.palabra.length} letras`;
      dibujarPalabra(false);fase="jugando";
    });
  }
  function sonido(acierto){
    if(typeof bip==="function"){
      if(acierto){bip(660,.2,"sine",.065);bip(990,.3,"triangle",.04);}
      else{bip(180,.24,"sawtooth",.035);bip(135,.3,"triangle",.05);}
    }
    if(typeof vibrar==="function")vibrar(acierto?25:[45,40,45]);
  }
  function marcarError(){
    $("#p"+errores)?.classList.add("on");errores++;
    if(errores>=AHORCADO_CONFIG.vidas)terminarPalabra(false);
  }
  function tocarLetra(L){
    if(fase!=="jugando"||adivinadas.has(L))return;
    adivinadas.add(L);
    const b=$(`#ahTeclado [data-l="${L}"]`);if(b)b.disabled=true;
    if(palabra.palabra.includes(L)){
      if(b)b.className="ok";sonido(true);dibujarPalabra(false);
      if(palabra.palabra.split("").every(c=>adivinadas.has(c)))terminarPalabra(true);
    }else{if(b)b.className="no";sonido(false);marcarError();}
  }
  function terminarPalabra(gano){
    if(fase!=="jugando")return;
    fase="resultado";const f=$("#ahFeedback");
    if(gano){
      const p=AHORCADO_CONFIG.ptsPalabra+AHORCADO_CONFIG.ptsVida*(AHORCADO_CONFIG.vidas-errores);
      puntos+=p;f.textContent="¡Bien! +"+p+" 🧉";f.style.color="#37D6C0";
    }else{
      $("#ahFigura").classList.add("perdida");dibujarPalabra(true);
      f.textContent="Era "+palabra.palabra;f.style.color="#FF9DA7";
    }
    hud();
    if(duelo)Duelo.enviarProgreso({puntos,n});
    if(n<AHORCADO_CONFIG.palabras)setTimeout(()=>{$("#ahSiguiente").hidden=false;},AHORCADO_CONFIG.pausaMs);
    else setTimeout(terminar,1200);
  }
  function iniciar(){duelo=false;palabrasDuelo=null;n=0;puntos=0;usadas=[];fase="girando";$("#ahPanel").hidden=true;siguientePalabra();}
  function iniciarDuelo(){
    if(typeof Duelo==="undefined")return;
    Duelo.mostrarLobby("Ahorcado Rioplatense","ahorcado",{onListo:(soyHost)=>{
      duelo=true;Duelo.mostrarBadge();Duelo.actualizarBadge("0");
      Duelo.onProgresoRival(p=>Duelo.actualizarBadge(String(p.puntos)));
      if(soyHost){
        const lista=[];for(let i=0;i<AHORCADO_CONFIG.palabras;i++)lista.push(elegirPalabra(lista));
        palabrasDuelo=lista;Duelo.enviarRonda({palabras:lista});n=0;puntos=0;usadas=[];fase="girando";$("#ahPanel").hidden=true;siguientePalabra();
      }else Duelo.onRondaRecibida(d=>{palabrasDuelo=d.palabras;n=0;puntos=0;usadas=[];fase="girando";$("#ahPanel").hidden=true;siguientePalabra();});
    }});
  }
  function terminar(){
    if(duelo){
      datos.mejor=Math.max(datos.mejor,puntos);guardar();hud();
      Duelo.enviarFinal({valor:puntos});
      Duelo.mostrarResultado({valor:puntos},{etiqueta:"puntos de la partida",onVolver:()=>{duelo=false;abrir(raiz.parentElement);}});
      return;
    }
    fase="fin";datos.mejor=Math.max(datos.mejor,puntos);guardar();hud();
    panel("¡Se terminó!","Puntos: "+puntos+". Mejor: "+datos.mejor+".",[["Jugar de nuevo",iniciar],["Jugar con un amigo 👥",iniciarDuelo]]);
  }
  function quitarTildes(s){return s.normalize("NFD").split("").filter(ch=>{const n=ch.charCodeAt(0);return n<0x300||n>0x36f;}).join("");}
  function tecla(key,evento){
    if(!raiz||document.hidden||fase!=="jugando")return;
    if(evento&&(evento.ctrlKey||evento.metaKey||evento.altKey))return;
    const c=quitarTildes(key).toUpperCase();
    if(c.length===1&&AHORCADO_LETRAS.includes(c))tocarLetra(c);
  }
  function abrir(contenedor){
    salir();fase="inicio";
    raiz=document.createElement("div");raiz.className="ah-game";
    raiz.innerHTML='<button type="button" class="ext-volver" id="ahVolver">⟵ Extensiones</button>'
      +'<div class="ah-titulo"><img src="logo-ahorcado-rioplatense.svg" alt=""><div><h2>Ahorcado Rioplatense</h2><p>La ruleta elige la categoría, vos adiviná la palabra.</p></div></div>'
      +'<div class="sf-hud"><div><small>Palabra</small><b id="ahN">0/'+AHORCADO_CONFIG.palabras+'</b></div><div><small>Puntos</small><b id="ahPt">0</b></div><div><small>Mejor</small><b id="ahMejor">'+datos.mejor+'</b></div></div>'
      +'<div class="ah-top"><div class="ah-rueda-wrap" id="ahRuedaWrap"><div class="ah-rueda" id="ahRueda"></div><div class="ah-hub"></div></div>'
      +'<svg class="ah-figura" id="ahFigura" viewBox="0 0 120 130" aria-label="Muñeco del ahorcado"><path d="M10 122H80M30 122V10H85V26" stroke="#F6EFE2" stroke-width="4" stroke-linecap="round" fill="none"/><g stroke="#F5B301" stroke-width="4" stroke-linecap="round" fill="none"><circle id="p0" cx="85" cy="36" r="10"/><path id="p1" d="M85 46V80"/><path id="p2" d="M85 54L68 68"/><path id="p3" d="M85 54L102 68"/><path id="p4" d="M85 80L70 102"/><path id="p5" d="M85 80L100 102"/></g></svg></div>'
      +'<div class="ah-pregunta" id="ahPregunta"></div>'
      +'<div class="ah-palabra" id="ahPalabra"></div>'
      +'<div class="ah-feedback" id="ahFeedback"></div>'
      +'<div class="ah-teclado" id="ahTeclado"></div>'
      +'<button type="button" class="ah-siguiente" id="ahSiguiente" hidden>Siguiente palabra ▶</button>'
      +'<div class="sf-panel-capa" id="ahPanel" hidden></div>';
    contenedor.appendChild(raiz);
    $("#ahVolver").onclick=()=>Extensiones.abrirLobby();
    construirRueda();construirTeclado();
    $("#ahTeclado").addEventListener("click",e=>{const l=e.target?.dataset?.l;if(l)tocarLetra(l);});
    $("#ahSiguiente").addEventListener("click",siguientePalabra);
    addEventListener("resize",posicionarRueda);
    document.addEventListener("visibilitychange",visibilidad);iniciarMusicaJuego();
    hud();
    panel("Ahorcado Rioplatense","El clásico del muñeco con un giro rioplatense: antes de cada palabra, la ruleta elige la categoría (Comida, Carnaval, Fútbol, Costumbres, Lunfardo o Ciudades) y esa es tu única pista. Son 5 palabras difíciles, sin repetir. Cada error dibuja una parte del muñeco: con 6 errores, perdés esa palabra. Jugás gratis, sin gastar vidas ni monedas. Mejor: "+datos.mejor+" puntos.",
      [["Jugar",iniciar],["Jugar con un amigo 👥",iniciarDuelo]]);
  }
  function salir(){
    removeEventListener("resize",posicionarRueda);
    document.removeEventListener("visibilitychange",visibilidad);detenerMusicaJuego();
    if(typeof Duelo!=="undefined")Duelo.salir();
    duelo=false;palabrasDuelo=null;raiz=null;fase="inicio";
  }
  return{abrir,salir,tecla,mejorPuntaje:()=>cargar().mejor};
})();
window.AhorcadoRioplatense=AhorcadoRioplatense;
