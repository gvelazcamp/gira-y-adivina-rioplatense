/* Catálogo de minijuegos. Cada entrada habilitada aporta su función abrir. */
const EXTENSIONES=[
  {id:"sopa-fugaz",nombre:"Sopa Fugaz",descripcion:"Buscá las palabras antes de que se muden",icono:"logo-sopa-fugaz.svg",estado:"disponible",abrir:contenedor=>SopaFugaz.abrir(contenedor),record:()=>SopaFugaz.mejorPuntaje()+" puntos"},
  {id:"rueda-de-letras",nombre:"Rueda de Letras",descripcion:"Uní letras antes de que se acabe el tiempo",icono:"logo-rueda-de-letras.svg",estado:RUEDA_HABILITADA?"disponible":"proximamente",abrir:contenedor=>RuedaDeLetras.abrir(contenedor),record:()=>RuedaDeLetras.mejorPuntaje()+" puntos"},
  {id:"palabra-secreta",nombre:"Palabra Secreta",descripcion:"Una palabra nueva cada día",icono:"logo-palabra-secreta.svg",estado:PALABRA_HABILITADA?"disponible":"proximamente",abrir:contenedor=>PalabraSecreta.abrir(contenedor),record:()=>"Racha: "+PalabraSecreta.rachaActual()+" días"},
  {id:"frases-en-giro",nombre:"Frases en Giro",descripcion:"Ordená frases entre giros y señuelos",icono:"logo-frases-en-giro.svg",estado:"disponible",abrir:contenedor=>FrasesEnGiro.abrir(contenedor),record:()=>FrasesEnGiro.mejorPuntaje()+" puntos"}
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
      if(e.key!=="Tab")e.stopImmediatePropagation();
    },true);
  }
  function mostrar(){asegurar();shell.hidden=false;document.body.classList.add("ext-abierta");}
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
  function salirJuego(){for(const juego of [window.SopaFugaz,window.RuedaDeLetras,window.PalabraSecreta,window.FrasesEnGiro])if(juego)juego.salir();}
  function cerrar(){if(!shell)return;salirJuego();shell.hidden=true;document.body.classList.remove("ext-abierta");vista="";}
  return{abrirLobby,abrirJuego,cerrar};
})();
window.Extensiones=Extensiones;
const botonExtensiones=document.getElementById("bExtensiones");
if(EXTENSIONES_HABILITADAS&&botonExtensiones){botonExtensiones.hidden=false;botonExtensiones.onclick=Extensiones.abrirLobby;}
