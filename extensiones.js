/* Lectura en voz alta de las pistas/preguntas, compartida entre los
   juegos de palabras. Usa la voz nativa del celular (Web Speech API):
   no hay backend ni archivos de audio que mantener.

   Elegir "la voz masculina" no es 100% controlable: la Web Speech API no
   expone el género como dato, así que hay dos intentos (por nombre
   explícito tipo "Jorge"/"Diego", típico de voces de escritorio; y por el
   sufijo -B/-D de las voces de red de Google —Standard/Wavenet/Neural2—
   que en Android suele ser el motor detrás de Chrome, donde -A/-C son
   femeninas y -B/-D masculinas) y, además, se baja bastante el tono para
   que suene más grave de entrada, pase lo que pase con la voz que el
   celular tenga disponible. Si ningún celular del grupo tiene una voz
   realmente masculina instalada, no hay forma de forzarla desde acá. */
function obtenerVozMasculina(){
  if(!("speechSynthesis" in window))return null;
  const voces=speechSynthesis.getVoices();if(!voces.length)return null;
  const es=voces.filter(v=>/^es/i.test(v.lang));
  const pool=es.length?es:voces;
  const porNombre=pool.find(v=>/\b(male|hombre|var[oó]n|jorge|diego|carlos|pablo|juan|miguel|enrique|pedro|andr[eé]s|[aá]lvaro|ra[uú]l)\b/i.test(v.name));
  if(porNombre)return porNombre;
  const esSufijoMasculino=v=>/-(?:Standard|Wavenet|Neural2)-[BD]$/i.test(v.name)||/-(?:Standard|Wavenet|Neural2)-[BD]$/i.test(v.voiceURI||"");
  return pool.find(esSufijoMasculino)||null;
}
/* Si no se dejó elegir una voz masculina real, igual bajamos el tono para
   que no quede una voz aguda — no cambia el género percibido del todo,
   pero suena más grave que la voz por defecto del celular. */
let hablarToken=0;
/* audioExtra (opcional): la música propia del juego que llama a hablar(),
   además de la música de la rueda principal. Cada extensión con su propia
   pista de fondo (Sopa Fugaz, Rueda de Letras, etc.) la pasa acá para que
   también se pause mientras lee y se reanude cuando termina. */
function hablar(texto,audioExtra){
  try{
    if(!("speechSynthesis" in window)||!texto)return;
    const t=++hablarToken;
    /* cancel() dispara el onend/onerror de la lectura anterior (si había
       una en curso) de forma asincrónica, un instante después de este
       punto. Si esa lectura vieja reanudara la música sin más, taparía
       la nueva que estamos por empezar. Por eso cada lectura guarda su
       propio número de turno y solo reanuda la música si sigue siendo
       la más reciente cuando termina. */
    speechSynthesis.cancel();
    if(typeof detenerMusica==="function")detenerMusica();
    if(audioExtra&&!audioExtra.paused)audioExtra.pause();
    const u=new SpeechSynthesisUtterance(texto);
    u.lang="es-UY";u.rate=.97;
    const voz=obtenerVozMasculina();
    u.pitch=voz?.75:.6;
    if(voz)u.voice=voz;
    const reanudarMusica=()=>{
      if(t!==hablarToken)return;
      if(typeof sincronizarMusica==="function")sincronizarMusica();
      if(audioExtra&&typeof sonidoPermitido==="function"&&sonidoPermitido())audioExtra.play().catch(()=>{});
    };
    u.onend=reanudarMusica;u.onerror=reanudarMusica;
    speechSynthesis.speak(u);
  }catch(e){}
}
window.hablar=hablar;
/* Catálogo de minijuegos. Cada entrada habilitada aporta su función abrir. */
const EXTENSIONES=[
  {id:"sopa-fugaz",nombre:"Sopa Fugaz",descripcion:"Buscá las palabras antes de que se muden",icono:"logo-sopa-fugaz.svg",estado:"disponible",abrir:contenedor=>SopaFugaz.abrir(contenedor),record:()=>SopaFugaz.mejorPuntaje()+" puntos"},
  {id:"rueda-de-letras",nombre:"Rueda de Letras",descripcion:"Uní letras antes de que se acabe el tiempo",icono:"logo-rueda-de-letras.svg",estado:RUEDA_HABILITADA?"disponible":"proximamente",abrir:contenedor=>RuedaDeLetras.abrir(contenedor),record:()=>RuedaDeLetras.mejorPuntaje()+" puntos"},
  {id:"palabra-secreta",nombre:"Palabra Secreta",descripcion:"Adiviná la palabra de 5 letras en 6 intentos",icono:"logo-palabra-secreta.svg",estado:PALABRA_HABILITADA?"disponible":"proximamente",abrir:contenedor=>PalabraSecreta.abrir(contenedor),record:()=>"Racha: "+PalabraSecreta.rachaActual()+" días"},
  {id:"frases-en-giro",nombre:"Frases en Giro",descripcion:"Ordená frases entre giros y señuelos",icono:"logo-frases-en-giro.svg",estado:"disponible",abrir:contenedor=>FrasesEnGiro.abrir(contenedor),record:()=>FrasesEnGiro.mejorPuntaje()+" puntos"},
  {id:"memoria-en-giro",nombre:"Memoria en Giro",descripcion:"Encontrá los pares antes de que giren",icono:"logo-memoria-en-giro.svg",estado:"disponible",abrir:contenedor=>MemoriaEnGiro.abrir(contenedor),record:()=>MemoriaEnGiro.mejorPuntaje()+" puntos"},
  {id:"rosco-rioplatense",nombre:"El Rosco",descripcion:"Girá, leé la pista y descubrí la palabra",icono:"logo-rosco-rioplatense.svg",estado:ROSCO_HABILITADO?"disponible":"proximamente",abrir:contenedor=>RoscoRioplatense.abrir(contenedor),record:()=>RoscoRioplatense.mejorPuntaje()+" puntos"},
  {id:"silabario-rioplatense",nombre:"Silabario Rioplatense",descripcion:"Armá la respuesta con las sílabas del tablero que gira",icono:"logo-silabario-rioplatense.svg",estado:"disponible",abrir:contenedor=>SilabarioRioplatense.abrir(contenedor),record:()=>SilabarioRioplatense.mejorPuntaje()+" puntos"},
  {id:"cien-rioplatenses",nombre:"100 Rioplatenses Dicen",descripcion:"Girá por un tema y descubrí el panel",icono:"logo-cien-rioplatenses.svg",estado:CIEN_HABILITADO?"disponible":"proximamente",abrir:contenedor=>CienRioplatenses.abrir(contenedor),record:()=>CienRioplatenses.mejorPuntaje()+" puntos"},
  {id:"ahorcado-rioplatense",nombre:"Ahorcado Rioplatense",descripcion:"La ruleta elige la categoría, adiviná la palabra",icono:"logo-ahorcado-rioplatense.svg",estado:AHORCADO_HABILITADO?"disponible":"proximamente",abrir:contenedor=>AhorcadoRioplatense.abrir(contenedor),record:()=>AhorcadoRioplatense.mejorPuntaje()+" puntos"},
  {id:"contra-reloj-rioplatense",nombre:"Contra Reloj Rioplatense",descripcion:"Hasta 4 personas, muy pronto en Girá y Adiviná",icono:"logo-contra-reloj-rioplatense.svg",estado:"proximamente",abrir:()=>{},record:()=>""}
  /* Mahjong Rioplatense (mahjong-rioplatense.html) a propósito oculto del lobby:
     la pantalla de inicio no estaba lista para mostrarse a los jugadores.
     Sigue publicada y accesible por URL directa para que Gonzalo la pruebe;
     sumar de nuevo esta entrada cuando el inicio esté arreglado. */
];
window.EXTENSIONES=EXTENSIONES;
const Extensiones=(()=>{
  let shell=null,contenido=null,vista="";
  function asegurar(){
    if(shell)return;
    shell=document.createElement("section");shell.id="extShell";shell.className="ext-shell";shell.hidden=true;
    shell.innerHTML='<div class="ext-wrap"><header class="ext-header"><button class="ext-atras" id="extAtras" type="button" aria-label="Volver">‹</button><strong id="extTitulo">Extensiones</strong><button class="ext-cerrar" id="extCerrar" type="button" aria-label="Cerrar">✕</button></header><div id="extContenido"></div></div>';
    document.body.appendChild(shell);
    contenido=shell.querySelector("#extContenido");
    shell.querySelector("#extAtras").onclick=()=>vista==="lobby"?cerrar():abrirLobby();
    shell.querySelector("#extCerrar").onclick=cerrar;
    document.addEventListener("keydown",e=>{
      if(shell.hidden)return;
      if(e.key==="Escape"){e.preventDefault();e.stopImmediatePropagation();vista==="lobby"?cerrar():abrirLobby();return;}
      if(vista==="palabra-secreta"&&window.PalabraSecreta){if(e.key!=="Tab")e.preventDefault();PalabraSecreta.tecla(e.key);}
      if(vista==="ahorcado-rioplatense"&&window.AhorcadoRioplatense)AhorcadoRioplatense.tecla(e.key,e);
      if(vista==="rosco-rioplatense"&&e.key==="Enter"&&!e.isComposing&&e.target.id==="rrEntrada"){e.preventDefault();RoscoRioplatense.enviar();}
      if(vista==="cien-rioplatenses"&&e.key==="Enter"&&!e.isComposing&&e.target.id==="crEntrada"){e.preventDefault();CienRioplatenses.enviar();}
      if(e.key!=="Tab")e.stopImmediatePropagation();
    },true);
  }
  function mostrar(){asegurar();shell.hidden=false;document.body.classList.add("ext-abierta");if(typeof detenerMusica==="function")detenerMusica();}
  function abrirLobby(){
    if(!EXTENSIONES_HABILITADAS)return;
    salirJuego();
    mostrar();vista="lobby";
    shell.querySelector("#extTitulo").textContent="Extensiones Girá y Adiviná";
    contenido.innerHTML='<div class="ext-hero"><span>✦ MÁS JUEGOS, MÁS DESAFÍOS</span><h2>Extensiones</h2><p>Elegí un juego del universo Girá y Adiviná. Jugá gratis, sin gastar vidas ni monedas.</p></div><div class="ext-lista"></div>';
    const lista=contenido.querySelector(".ext-lista");
    EXTENSIONES.forEach(ext=>{
      const b=document.createElement("button");b.type="button";b.className="ext-tarjeta";
      b.disabled=ext.estado!=="disponible";
      const img=document.createElement("img");img.src=ext.icono;img.alt="";img.loading="lazy";
      const txt=document.createElement("span");txt.className="ext-tarjeta-texto";
      const nombre=document.createElement("b");nombre.textContent=ext.nombre;
      const desc=document.createElement("small");desc.textContent=ext.descripcion;
      const record=document.createElement("em");record.textContent=ext.estado==="disponible"?"Mejor: "+ext.record():"Próximamente";
      txt.append(nombre,desc,record);b.append(img,txt);
      if(!b.disabled)b.onclick=()=>abrirJuego(ext.id);
      lista.appendChild(b);
    });
    shell.scrollTop=0;
  }
  function abrirJuego(id){
    if(!EXTENSIONES_HABILITADAS)return;
    const ext=EXTENSIONES.find(x=>x.id===id&&x.estado==="disponible");if(!ext)return;
    mostrar();vista=id;contenido.replaceChildren();
    shell.querySelector("#extTitulo").textContent=ext.nombre;
    ext.abrir(contenido);shell.scrollTop=0;
  }
  function salirJuego(){for(const juego of [window.SopaFugaz,window.RuedaDeLetras,window.PalabraSecreta,window.FrasesEnGiro,window.MemoriaEnGiro,window.RoscoRioplatense,window.SilabarioRioplatense,window.CienRioplatenses,window.AhorcadoRioplatense])if(juego)juego.salir();}
  function cerrar(){if(!shell)return;salirJuego();shell.hidden=true;document.body.classList.remove("ext-abierta");vista="";if(typeof sincronizarMusica==="function")sincronizarMusica();}
  return{abrirLobby,abrirJuego,cerrar};
})();
window.Extensiones=Extensiones;
const botonExtensiones=document.getElementById("bExtensiones");
if(EXTENSIONES_HABILITADAS&&botonExtensiones){botonExtensiones.hidden=false;botonExtensiones.onclick=Extensiones.abrirLobby;}
