/* El Rosco: práctica gratuita. Usa el audio, logros y objetivos de la app. */
const ROSCO_CONFIG={
  letras:"ABCDEFGHIJKLMNOPQRSTUVYZ",segundosPorLetra:6,puntosAcierto:100,bonoSegundo:2,
  giroMs:1500,vueltas:3,pausaMs:1000,ticMs:50,proporcionAvance:.7,
  margenMinimo:.75,descensoMargen:.05,
  niveles:{1:{letras:12,margen:1.6},2:{letras:16,margen:1.4},3:{letras:20,margen:1.2},4:{letras:24,margen:1}}
};
const RoscoRioplatense=(()=>{
  const CLAVE="gya_rosco_rioplatense";
  let datos=cargar(),raiz=null,shell=null,items=[],estados=[],actual=-1,destino=-1,angulo=0;
  let nivel=1,config=null,fase="inicio",tiempo=0,espera=0,ultimo=0,intervalo=null,ultimoTac=0;
  const $=s=>raiz?.querySelector(s);
  const normalizar=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/\s+/g,"");
  const numero=(v,base=0)=>Number.isFinite(v)&&v>=0?v:base;
  function cargar(){
    try{const d=JSON.parse(localStorage.getItem(CLAVE));if(d&&typeof d==="object")return{
      mejor:numero(d.mejor),nivelMax:Math.max(1,Math.floor(numero(d.nivelMax,1))),
      ultimas:d.ultimas&&typeof d.ultimas==="object"?d.ultimas:{}
    };}catch(e){}
    return{mejor:0,nivelMax:1,ultimas:{}};
  }
  function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify(datos));}catch(e){}}
  function configNivel(n){
    const c=ROSCO_CONFIG.niveles[n]||{letras:24,margen:Math.max(ROSCO_CONFIG.margenMinimo,1-(n-4)*ROSCO_CONFIG.descensoMargen)};
    return{...c,segundos:Math.round(c.letras*ROSCO_CONFIG.segundosPorLetra*c.margen)};
  }
  function mezclar(lista){const a=[...lista];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function armarRonda(){
    const letras=mezclar([...ROSCO_CONFIG.letras]).slice(0,config.letras).sort();
    return letras.map(letra=>{
      const banco=ROSCO_DATOS.filter(d=>d.letra===letra);
      const preferidas=banco.filter(d=>nivel<3?d.nivel<=2:d.nivel>=2);
      const opciones=preferidas.length?preferidas:banco;
      const nuevas=opciones.filter(d=>d.palabra!==datos.ultimas[letra]);
      const elegida=mezclar(nuevas.length?nuevas:opciones)[0];
      datos.ultimas[letra]=elegida.palabra;return elegida;
    });
  }
  function pendientes(){return estados.map((s,i)=>s==="pendiente"?i:-1).filter(i=>i>=0);}
  function conteo(s){return estados.filter(x=>x===s).length;}
  function hud(){
    $("#rrNivel").textContent=nivel;$("#rrAciertos").textContent=conteo("acierto")+"/"+items.length;
    $("#rrErrores").textContent=conteo("error");$("#rrTiempo").textContent=Math.max(0,Math.ceil(tiempo/1000));
    $("#rrBarra").style.width=Math.max(0,tiempo/(config.segundos*1000)*100)+"%";
    $("#rrEnviar").disabled=fase!=="resolver";$("#rrPasar").disabled=fase!=="resolver";
    raiz.dataset.fase=fase;
    raiz.querySelectorAll(".rr-letra").forEach((el,i)=>{
      el.className="rr-letra "+estados[i]+(i===actual?" actual":"");
      el.setAttribute("aria-label",items[i].letra+": "+(i===actual?"actual, ":"")+estados[i]);
    });
  }
  function mensaje(texto,tipo=""){const el=$("#rrMensaje");el.textContent=texto;el.className="rr-mensaje "+tipo;}
  function sonido(acierto){
    if(typeof bip!=="function")return;
    // Acorde luminoso para acertar; tono grave y áspero para fallar.
    if(acierto){bip(660,.2,"sine",.065);bip(990,.3,"triangle",.04);}
    else{bip(180,.24,"sawtooth",.035);bip(135,.3,"triangle",.05);}
    if(typeof vibrar==="function")vibrar(acierto?25:[45,40,45]);
  }
  function enfocar(){if(raiz&&!document.hidden){$("#rrEntrada").focus({preventScroll:true});ajustarPantalla();}}
  function ajustarPantalla(){
    if(!raiz||!shell)return;
    const v=window.visualViewport,alto=v?v.height:innerHeight;
    shell.style.setProperty("--rr-alto",alto+"px");shell.style.setProperty("--rr-arriba",(v?v.offsetTop:0)+"px");
    raiz.classList.toggle("rr-compacto",alto<600&&innerWidth<600);
    if(document.activeElement===$("#rrEntrada"))$("#rrForm").scrollIntoView({block:"nearest"});
  }
  function siguiente(){
    const p=pendientes();if(!p.length){terminar();return;}
    const opciones=p.length>1?p.filter(i=>i!==actual):p;
    destino=opciones[Math.floor(Math.random()*opciones.length)];actual=-1;fase="giro";
    $("#rrGrande").textContent="✦";$("#rrRegla").textContent="La rueda está girando";
    $("#rrDefinicion").textContent="El reloj está en pausa. Prepará tu próxima respuesta.";mensaje("");
    const reducido=matchMedia("(prefers-reduced-motion: reduce)").matches;
    espera=reducido?0:ROSCO_CONFIG.giroMs;
    const ajuste=((-destino*360/items.length-angulo)%360+360)%360;
    angulo+=(reducido?0:ROSCO_CONFIG.vueltas*360)+ajuste;
    $("#rrDisco").style.setProperty("--rr-giro-ms",espera+"ms");
    $("#rrDisco").style.transform="rotate("+angulo+"deg)";
    raiz.querySelectorAll(".rr-letra span").forEach(el=>el.style.transform="rotate("+(-angulo)+"deg)");
    ultimoTac=0;hud();if(reducido)detenerGiro();
  }
  function detenerGiro(){
    actual=destino;fase="resolver";const d=items[actual];
    $("#rrGrande").textContent=d.letra;$("#rrRegla").textContent=(d.contiene?"Contiene la ":"Empieza con ")+d.letra;
    $("#rrDefinicion").textContent=d.definicion;hud();enfocar();
  }
  function iniciar(){
    config=configNivel(nivel);items=armarRonda();guardar();estados=items.map(()=>"pendiente");
    actual=-1;destino=-1;angulo=0;tiempo=config.segundos*1000;ultimo=performance.now();
    $("#rrPanel").hidden=true;$("#rrEntrada").value="";$("#rrJuego").hidden=false;
    const disco=$("#rrDisco");disco.replaceChildren();disco.style.transition="none";disco.style.transform="rotate(0deg)";
    items.forEach((d,i)=>{
      const el=document.createElement("div"),span=document.createElement("span"),a=i*2*Math.PI/items.length;
      el.className="rr-letra";el.style.left=(50+42*Math.sin(a))+"%";el.style.top=(50-42*Math.cos(a))+"%";
      span.textContent=d.letra;el.appendChild(span);disco.appendChild(el);
    });
    void disco.offsetWidth;disco.style.transition="";enfocar();siguiente();
  }
  function enviar(){
    if(!raiz||fase!=="resolver"||document.hidden)return;
    tic();if(fase!=="resolver")return;
    const valor=normalizar($("#rrEntrada").value);if(!valor){mensaje("Escribí una palabra o tocá Pasapalabra.");enfocar();return;}
    const d=items[actual],ok=[d.palabra,...(d.alternativas||[])].some(p=>normalizar(p)===valor);
    estados[actual]=ok?"acierto":"error";fase="respuesta";espera=ROSCO_CONFIG.pausaMs;
    $("#rrEntrada").value="";sonido(ok);mensaje(ok?"¡Bien! +100 puntos · "+d.palabra:"Era "+d.palabra,ok?"acierto":"error");
    if(typeof objSumar==="function")objSumar("roscoLetras",1);
    if(ok&&typeof logroDesbloquear==="function")logroDesbloquear("roscoPrimera");
    hud();enfocar();
  }
  function pasar(){
    if(!raiz||fase!=="resolver"||document.hidden)return;
    tic();if(fase!=="resolver")return;
    $("#rrEntrada").value="";enfocar();siguiente();
  }
  function panel(titulo,detalle,acciones){
    const capa=$("#rrPanel");capa.hidden=false;capa.replaceChildren();
    const tarjeta=document.createElement("div");tarjeta.className="rr-panel";
    const h=document.createElement("h3"),p=document.createElement("p");h.textContent=titulo;p.textContent=detalle;tarjeta.append(h,p);
    acciones.forEach(([texto,accion],i)=>{const b=document.createElement("button");b.type="button";b.textContent=texto;b.className=i===0?"rr-principal":"";b.onclick=()=>accion(b);tarjeta.appendChild(b);});
    capa.appendChild(tarjeta);
  }
  function terminar(){
    if(fase==="fin")return;fase="fin";actual=-1;$("#rrEntrada").blur();
    const aciertos=conteo("acierto"),errores=conteo("error"),faltan=pendientes().length;
    const bonus=faltan===0?Math.max(0,Math.ceil(tiempo/1000))*ROSCO_CONFIG.bonoSegundo:0;
    const puntos=aciertos*ROSCO_CONFIG.puntosAcierto+bonus;
    const avanzar=faltan===0&&aciertos>=Math.ceil(items.length*ROSCO_CONFIG.proporcionAvance);
    datos.mejor=Math.max(datos.mejor,puntos);if(avanzar)datos.nivelMax=Math.max(datos.nivelMax,nivel+1);guardar();
    if(aciertos===items.length&&typeof logroDesbloquear==="function"){
      logroDesbloquear("roscoPerfecto");if(tiempo>30000)logroDesbloquear("roscoVeloz");
    }
    hud();
    const acciones=[];
    if(avanzar)acciones.push(["Siguiente nivel",()=>{nivel++;iniciar();}]);
    acciones.push(["Otra ronda · nivel "+nivel,iniciar]);
    acciones.push(["Compartir resultado",b=>compartir(b,puntos,aciertos,errores,faltan)]);
    panel(faltan?"¡Se terminó el tiempo!":errores?"Rosco terminado":"¡Rosco perfecto!",
      aciertos+" aciertos · "+errores+" errores · "+faltan+" sin responder. "+puntos+" puntos"+(bonus?" ("+bonus+" por tiempo)":"")+". Récord: "+datos.mejor+"."+(avanzar?" ¡Desbloqueaste el nivel "+(nivel+1)+"!":" Acertá al menos "+Math.ceil(items.length*ROSCO_CONFIG.proporcionAvance)+" y terminá la vuelta para avanzar."),acciones);
    const revision=document.createElement("details"),sum=document.createElement("summary");sum.textContent="Repasar las respuestas";revision.appendChild(sum);
    items.forEach((d,i)=>{const p=document.createElement("p");p.textContent=(estados[i]==="acierto"?"✓ ":estados[i]==="error"?"✕ ":"· ")+d.letra+" · "+d.palabra+" — "+d.definicion;revision.appendChild(p);});
    $(".rr-panel").appendChild(revision);$(".rr-principal").focus({preventScroll:true});
  }
  function compartir(b,puntos,aciertos,errores,faltan){
    const texto="🎡 El Rosco · nivel "+nivel+" · "+puntos+" puntos\n✓ "+aciertos+" · ✕ "+errores+" · pendientes "+faltan+"\nGirá y Adiviná: "+location.origin+location.pathname;
    const imagen=()=>{
      const cv=document.createElement("canvas");cv.width=720;cv.height=900;const c=cv.getContext("2d");
      c.fillStyle="#160B24";c.fillRect(0,0,720,900);c.textAlign="center";c.fillStyle="#F5B301";c.font="bold 44px sans-serif";c.fillText("EL ROSCO",360,85);
      c.fillStyle="#F6EFE2";c.font="24px sans-serif";c.fillText("Girá y Adiviná · Nivel "+nivel,360,130);
      items.forEach((d,i)=>{const a=i*2*Math.PI/items.length,x=360+225*Math.sin(a),y=405-225*Math.cos(a);c.beginPath();c.arc(x,y,24,0,2*Math.PI);c.fillStyle=estados[i]==="acierto"?"#37D6C0":estados[i]==="error"?"#FF7E8B":"#D7C8E5";c.fill();c.fillStyle="#160B24";c.font="bold 23px sans-serif";c.fillText(d.letra,x,y+8);});
      c.fillStyle="#F5B301";c.font="bold 60px sans-serif";c.fillText(puntos,360,414);c.font="22px sans-serif";c.fillText("PUNTOS",360,455);
      c.fillStyle="#F6EFE2";c.font="26px sans-serif";c.fillText(aciertos+" aciertos · "+errores+" errores",360,735);c.fillText(faltan+" sin responder",360,780);c.font="20px sans-serif";c.fillText("¿Te animás a completar la vuelta?",360,850);return cv;
    };
    if(typeof csCompartirImagen==="function")csCompartirImagen(imagen,"el-rosco.png",texto,texto,b);
  }
  function tic(){
    const ahora=performance.now(),dt=Math.max(0,ahora-ultimo);ultimo=ahora;
    if(!raiz||document.hidden||fase==="inicio"||fase==="fin")return;
    if(fase==="resolver"||fase==="respuesta"){
      tiempo=Math.max(0,tiempo-dt);if(tiempo===0){terminar();return;}
    }
    if(fase==="giro"){
      espera-=dt;ultimoTac+=dt;
      if(ultimoTac>110+(1-Math.max(0,espera)/ROSCO_CONFIG.giroMs)*230){if(typeof tac==="function")tac();ultimoTac=0;}
      if(espera<=0)detenerGiro();
    }else if(fase==="respuesta"){espera-=dt;if(espera<=0)siguiente();}
    hud();
  }
  function visibilidad(){ultimo=performance.now();}
  function abrir(contenedor){
    salir();datos=cargar();nivel=datos.nivelMax;config=configNivel(nivel);fase="inicio";
    raiz=document.createElement("div");raiz.className="rr-game";
    raiz.innerHTML='<div class="rr-titulo"><img src="logo-rosco-rioplatense.svg" alt=""><div><h2>El Rosco</h2><p>Una vuelta, muchas palabras nuestras.</p></div></div><div id="rrJuego" hidden><div class="sf-hud"><div><small>Nivel</small><b id="rrNivel"></b></div><div><small>Aciertos</small><b id="rrAciertos"></b></div><div><small>Errores</small><b id="rrErrores"></b></div><div><small>Tiempo</small><b id="rrTiempo"></b></div></div><div class="sf-bar"><i id="rrBarra"></i></div><div class="rr-rueda"><div id="rrDisco"></div><b id="rrGrande"></b></div><div class="rr-pista" role="status" aria-live="polite"><small id="rrRegla"></small><p id="rrDefinicion"></p></div><p id="rrMensaje" class="rr-mensaje" role="status"></p><form id="rrForm" autocomplete="off"><label class="rr-sr" for="rrEntrada">Tu respuesta</label><div class="rr-fila"><input id="rrEntrada" placeholder="Escribí la palabra" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" enterkeyhint="send" maxlength="60"><button id="rrEnviar" type="submit">Enviar</button></div><button id="rrPasar" type="button">Pasapalabra ↻</button></form></div><div id="rrPanel" class="rr-panel-capa"></div>';
    contenedor.appendChild(raiz);shell=raiz.closest(".ext-shell");shell?.classList.add("rr-abierta");
    $("#rrForm").onsubmit=e=>{e.preventDefault();enviar();};$("#rrPasar").onclick=pasar;
    for(const b of raiz.querySelectorAll("#rrForm button"))b.onpointerdown=e=>e.preventDefault();
    $("#rrEntrada").onbeforeinput=e=>{if(fase!=="resolver")e.preventDefault();};
    window.visualViewport?.addEventListener("resize",ajustarPantalla);window.visualViewport?.addEventListener("scroll",ajustarPantalla);window.addEventListener("resize",ajustarPantalla);
    document.addEventListener("visibilitychange",visibilidad);ultimo=performance.now();intervalo=setInterval(tic,ROSCO_CONFIG.ticMs);
    const acciones=[["Jugar nivel "+nivel,iniciar]];if(nivel>1)acciones.push(["Practicar desde el nivel 1",()=>{nivel=1;iniciar();}]);
    panel("El Rosco Rioplatense",config.letras+" letras y "+config.segundos+" segundos. Leé cada pista y escribí la palabra: tenés un intento por letra. Pasapalabra la deja para después. El reloj se pausa al girar. Acertá al menos "+Math.ceil(config.letras*ROSCO_CONFIG.proporcionAvance)+" y respondé todas para avanzar. Jugás gratis, sin gastar vidas ni monedas. Mejor: "+datos.mejor+" puntos.",acciones);ajustarPantalla();
  }
  function salir(){
    clearInterval(intervalo);intervalo=null;document.removeEventListener("visibilitychange",visibilidad);
    window.visualViewport?.removeEventListener("resize",ajustarPantalla);window.visualViewport?.removeEventListener("scroll",ajustarPantalla);window.removeEventListener("resize",ajustarPantalla);
    shell?.classList.remove("rr-abierta");shell?.style.removeProperty("--rr-alto");shell?.style.removeProperty("--rr-arriba");
    raiz=null;shell=null;fase="inicio";items=[];estados=[];
  }
  return{abrir,salir,enviar,configNivel,mejorPuntaje:()=>cargar().mejor};
})();
window.RoscoRioplatense=RoscoRioplatense;
