/* Memoria en Giro: pares contra reloj, sin gastar monedas ni vidas. */
const MEMORIA_GIRO_SIMBOLOS=["🌟","🦋","🍓","🐚","🌈","🎈","🍋","🐝","🪁","🌻","🐬","🍀","🧩","🦊","🍄","🪐","🐸","🎸","⚓","🍒"];
const MEMORIA_GIRO_NIVELES={
  1:{pares:3,columnas:3,segundos:45,vista:3.5,giro:18},
  2:{pares:4,columnas:4,segundos:50,vista:3.8,giro:16},
  3:{pares:6,columnas:4,segundos:65,vista:4.5,giro:15},
  4:{pares:8,columnas:4,segundos:80,vista:5,giro:14}
};
const MemoriaEnGiro=(()=>{
  const CLAVE="gya_memoria_en_giro";
  const azar=n=>Math.floor(Math.random()*n);
  let datos=cargar(),raiz=null,cartas=[],config=null,nivel=1,puntos=0,pares=0,racha=0,fallos=0,giros=0;
  let fase="inicio",primera=null,segunda=null,tiempoMs=0,vistaMs=0,falloMs=0,giroMs=0,animacionMs=0;
  let intervalo=null,ultimoTic=0,mensaje="";

  function cargar(){
    try{const d=JSON.parse(localStorage.getItem(CLAVE)||"null");if(d&&typeof d==="object")return{
      mejor:Math.max(0,Number(d.mejor)||0),nivelMax:Math.max(1,Number(d.nivelMax)||1),
      ganadas:Math.max(0,Number(d.ganadas)||0)
    };}catch(e){}
    return{mejor:0,nivelMax:1,ganadas:0};
  }
  function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify(datos));}catch(e){}}
  function mejorPuntaje(){return datos.mejor;}
  function configNivel(n){
    if(MEMORIA_GIRO_NIVELES[n])return MEMORIA_GIRO_NIVELES[n];
    const paso=n-4;
    return{pares:8,columnas:4,segundos:Math.max(55,80-paso*3),vista:Math.max(3.5,5-paso*.2),giro:Math.max(9,14-paso)};
  }
  function mezclar(lista){
    const copia=[...lista];for(let i=copia.length-1;i>0;i--){const j=azar(i+1);[copia[i],copia[j]]=[copia[j],copia[i]];}return copia;
  }
  function nuevasCartas(){
    const elegidos=mezclar(MEMORIA_GIRO_SIMBOLOS).slice(0,config.pares);
    cartas=mezclar(elegidos.flatMap((simbolo,par)=>[
      {id:par*2,simbolo,par,encontrada:false},{id:par*2+1,simbolo,par,encontrada:false}
    ]));
  }
  function sonar(f,d=.1,vol=.06){if(typeof bip==="function")bip(f,d,"sine",vol);}
  function sonarPar(){sonar(590,.1,.07);setTimeout(()=>{if(raiz)sonar(790,.16,.07);},100);}
  function avisar(texto){mensaje=texto;if(raiz)raiz.querySelector("#mgMensaje").textContent=texto;}
  function actualizarHud(){
    if(!raiz||!config)return;
    raiz.querySelector("#mgNivel").textContent=nivel;
    raiz.querySelector("#mgPares").textContent=pares+"/"+config.pares;
    raiz.querySelector("#mgPuntos").textContent=puntos;
    raiz.querySelector("#mgTiempo").textContent=Math.max(0,Math.ceil(tiempoMs/1000));
    raiz.querySelector("#mgTiempoBarra").style.width=Math.max(0,tiempoMs/(config.segundos*1000)*100)+"%";
    raiz.querySelector("#mgFallas").textContent="Fallos: "+fallos+" · giros: "+giros+(racha>1?" · 🔥 "+racha+" pares seguidos":"");
    const giroTexto=raiz.querySelector("#mgGiroTexto");
    if(fase==="vista")giroTexto.textContent="Memorizá: las cartas se tapan en "+Math.max(1,Math.ceil(vistaMs/1000))+" s";
    else if(fase==="giro")giroTexto.textContent="¡Giran las cartas que faltan!";
    else if(fase==="juego"||fase==="fallo")giroTexto.textContent="Próximo giro en "+Math.max(0,Math.ceil(giroMs/1000))+" s";
    else giroTexto.textContent="Encontrá todos los pares";
    raiz.querySelector("#mgGiroBarra").style.width=(fase==="juego"||fase==="fallo"?Math.max(0,giroMs/(config.giro*1000)*100):100)+"%";
  }
  function pintarCartas(){
    if(!raiz)return;
    [...raiz.querySelectorAll("#mgTablero .mg-carta")].forEach((boton,i)=>{
      const carta=cartas[i],abierta=fase==="vista"||carta.encontrada||i===primera||i===segunda;
      boton.classList.toggle("abierta",abierta);
      boton.classList.toggle("encontrada",carta.encontrada);
      boton.disabled=fase!=="juego"||carta.encontrada||i===primera;
      boton.setAttribute("aria-label",carta.encontrada?"Pareja encontrada: "+carta.simbolo:abierta?"Carta "+(i+1)+": "+carta.simbolo:"Carta "+(i+1)+" tapada");
    });
    actualizarHud();
  }
  function dibujarTablero(){
    const tablero=raiz.querySelector("#mgTablero");tablero.replaceChildren();
    tablero.style.setProperty("--mg-columnas",config.columnas);
    cartas.forEach((carta,i)=>{
      const boton=document.createElement("button");boton.type="button";boton.className="mg-carta";
      boton.dataset.id=String(carta.id);
      const interior=document.createElement("span");interior.className="mg-carta-interior";
      const dorso=document.createElement("span");dorso.className="mg-carta-dorso";dorso.textContent="✦";dorso.setAttribute("aria-hidden","true");
      const cara=document.createElement("span");cara.className="mg-carta-cara";cara.textContent=carta.simbolo;cara.setAttribute("aria-hidden","true");
      interior.append(dorso,cara);boton.appendChild(interior);boton.onclick=()=>elegir(i);tablero.appendChild(boton);
    });
    pintarCartas();
  }
  function panel(titulo,detalle,botonTexto,accion,alternativa){
    const capa=raiz.querySelector("#mgPanel");capa.replaceChildren();capa.hidden=false;
    const tarjeta=document.createElement("div");tarjeta.className="mg-panel";
    const h=document.createElement("h3");h.textContent=titulo;
    const p=document.createElement("p");p.textContent=detalle;
    const b=document.createElement("button");b.type="button";b.className="mg-principal";b.textContent=botonTexto;b.onclick=accion;
    tarjeta.append(h,p,b);
    if(alternativa){const otro=document.createElement("button");otro.type="button";otro.textContent=alternativa.texto;otro.onclick=alternativa.accion;tarjeta.appendChild(otro);}
    capa.appendChild(tarjeta);
  }
  function comenzar(){
    config=configNivel(nivel);nuevasCartas();pares=0;racha=0;fallos=0;giros=0;
    primera=null;segunda=null;tiempoMs=config.segundos*1000;vistaMs=config.vista*1000;
    falloMs=0;giroMs=config.giro*1000;animacionMs=0;fase="vista";ultimoTic=performance.now();
    raiz.querySelector("#mgPanel").hidden=true;
    raiz.querySelector("#mgTablero").classList.remove("girando");
    raiz.closest(".ext-shell")?.scrollTo(0,0);
    avisar("Mirá bien dónde está cada símbolo. El reloj empieza cuando se tapen.");
    dibujarTablero();
  }
  function terminar(gano){
    if(fase==="ganado"||fase==="perdido")return;
    const puntosPrevios=puntos;fase=gano?"ganado":"perdido";primera=null;segunda=null;
    if(gano){
      const bonus=Math.ceil(tiempoMs/1000)*4;puntos+=bonus;
      datos.mejor=Math.max(datos.mejor,puntos);datos.nivelMax=Math.max(datos.nivelMax,nivel+1);datos.ganadas++;guardar();
      if(typeof sonarSFX==="function")sonarSFX("festejo");else sonar(1000,.25);
      if(typeof vibrar==="function")vibrar([35,45,60]);
      pintarCartas();nivel++;
      panel("¡Todos los pares!","+"+bonus+" puntos por el tiempo que sobró. Total: "+puntos+" · mejor marca: "+datos.mejor+". Las cartas que encontraste quedaron a salvo en los giros.","Siguiente nivel",comenzar);
    }else{
      puntos=0;racha=0;sonar(260,.25);if(typeof vibrar==="function")vibrar(85);
      pintarCartas();
      panel("Se terminó el tiempo","Encontraste "+pares+" de "+config.pares+" pares. Se cortó la racha"+(puntosPrevios?" y perdiste "+puntosPrevios+" puntos de esta partida":"")+". Mejor marca: "+datos.mejor+".","Otra ronda del nivel "+nivel,comenzar);
    }
  }
  function elegir(i){
    if(fase!=="juego"||cartas[i].encontrada||i===primera)return;
    if(primera===null){primera=i;sonar(450,.06,.04);pintarCartas();return;}
    segunda=i;pintarCartas();
    if(cartas[primera].par===cartas[segunda].par){
      cartas[primera].encontrada=true;cartas[segunda].encontrada=true;
      pares++;racha++;const premio=60+racha*15;puntos+=premio;
      primera=null;segunda=null;sonarPar();
      avisar("¡Par encontrado! +"+premio+" puntos"+(racha>1?" · racha de "+racha:""));
      if(pares===config.pares){terminar(true);return;}
      pintarCartas();
    }else{
      fase="fallo";fallos++;racha=0;falloMs=850;tiempoMs=Math.max(0,tiempoMs-3000);
      sonar(290,.17,.06);if(typeof vibrar==="function")vibrar(60);
      avisar("No son iguales. −3 segundos. Mirá bien antes del próximo giro.");
      pintarCartas();
    }
  }
  function iniciarGiro(){
    const pendientes=cartas.filter(c=>!c.encontrada);
    if(pendientes.length<4){giroMs=config.giro*1000;return;}
    fase="giro";primera=null;segunda=null;animacionMs=850;
    raiz.querySelector("#mgTablero").classList.add("girando");
    avisar("¡Giro! Las parejas ya encontradas no se mueven.");
    pintarCartas();sonar(500,.12,.05);
  }
  function terminarGiro(){
    const indices=cartas.map((c,i)=>c.encontrada?-1:i).filter(i=>i>=0);
    const anteriores=indices.map(i=>cartas[i]);let nuevas=mezclar(anteriores);
    if(nuevas.length>1&&nuevas.every((c,i)=>c.id===anteriores[i].id))nuevas.push(nuevas.shift());
    indices.forEach((i,j)=>{cartas[i]=nuevas[j];});
    giros++;giroMs=config.giro*1000;fase="juego";
    raiz.querySelector("#mgTablero").classList.remove("girando");
    avisar("Las cartas tapadas cambiaron de lugar. ¡A buscar!");
    dibujarTablero();
  }
  function tic(){
    const ahora=performance.now(),paso=Math.max(0,ahora-ultimoTic);ultimoTic=ahora;
    if(!raiz||document.hidden)return;
    if(fase==="vista"){
      vistaMs-=paso;
      if(vistaMs<=0){vistaMs=0;fase="juego";avisar("Encontrá 2 cartas iguales. Las parejas encontradas quedan fijas.");pintarCartas();}
    }else if(fase==="juego"||fase==="fallo"){
      tiempoMs=Math.max(0,tiempoMs-paso);giroMs-=paso;
      if(fase==="fallo"){
        falloMs-=paso;
        if(falloMs<=0){primera=null;segunda=null;fase="juego";pintarCartas();}
      }
      if(tiempoMs<=0){terminar(false);return;}
      if(fase==="juego"&&giroMs<=0)iniciarGiro();
    }else if(fase==="giro"){
      animacionMs-=paso;if(animacionMs<=0)terminarGiro();
    }
    actualizarHud();
  }
  function visibilidad(){ultimoTic=performance.now();}
  function abrir(contenedor){
    salir();datos=cargar();nivel=datos.nivelMax;puntos=0;
    raiz=document.createElement("div");raiz.className="mg-game";
    raiz.innerHTML='<div class="mg-titulo"><img src="logo-memoria-en-giro.svg" alt=""><div><h2>Memoria en Giro</h2><p>Recordá los símbolos y encontrá sus parejas.</p></div></div><div class="mg-hud"><div><small>Nivel</small><b id="mgNivel">1</b></div><div><small>Pares</small><b id="mgPares">0/3</b></div><div><small>Puntos</small><b id="mgPuntos">0</b></div><div><small>Tiempo</small><b id="mgTiempo">45</b></div></div><div class="mg-bar"><i id="mgTiempoBarra"></i></div><p class="mg-fallas" id="mgFallas"></p><div class="mg-tablero" id="mgTablero" aria-label="Tablero de cartas"></div><p class="mg-mensaje" id="mgMensaje" role="status" aria-live="polite"></p><p class="mg-giro-texto" id="mgGiroTexto"></p><div class="mg-bar giro"><i id="mgGiroBarra"></i></div><div class="mg-panel-capa" id="mgPanel"></div>';
    contenedor.appendChild(raiz);ultimoTic=performance.now();intervalo=setInterval(tic,50);document.addEventListener("visibilitychange",visibilidad);
    panel("Memoria en Giro","Primero ves todas las cartas. Cuando se tapen, encontrá los pares antes de que termine el tiempo. Cada tanto giran las cartas que faltan; los pares encontrados quedan fijos. Una pareja equivocada te quita 3 segundos. No gastás monedas ni vidas.","Jugar nivel "+nivel,comenzar,
      nivel>1?{texto:"Empezar desde el nivel 1",accion:()=>{nivel=1;puntos=0;comenzar();}}:null);
  }
  function salir(){
    clearInterval(intervalo);intervalo=null;document.removeEventListener("visibilitychange",visibilidad);raiz=null;cartas=[];config=null;fase="inicio";
  }
  return{abrir,salir,mejorPuntaje,configNivel};
})();
window.MemoriaEnGiro=MemoriaEnGiro;
