/* Tirame una Birra (Cervecería Durazno): el juego vive entero en cerveceria.html
   (escena de 1600x900 con sus propias variables), así que acá solo se abre en un
   iframe a pantalla completa, igual que el Puzzle. Su "‹" vuelve al lobby.
   Por ahora solo lo ven Gonzalo y Vale (soloUsuarios en extensiones.js). */
const Cerveceria=(()=>{
  let marco=null;
  function abrir(contenedor){
    salir();
    marco=document.createElement("iframe");marco.src="cerveceria.html?v=6";marco.title="Tirame una Birra";
    /* width:1px + min-width:100% (y lo mismo en alto): truco para que el iPhone no agrande el iframe al tamaño de la escena */
    marco.setAttribute("scrolling","no");
    marco.style.cssText="position:fixed;left:0;top:env(safe-area-inset-top,0px);width:1px;min-width:100%;height:1px;min-height:calc(100% - env(safe-area-inset-top,0px));border:0;z-index:60;background:#160B24";
    contenedor.appendChild(marco);
  }
  function salir(){if(marco){marco.remove();marco=null;}}
  function estrellas(){try{const e=JSON.parse(localStorage.getItem("gya_birra_estrellas")||"{}");return Object.values(e).reduce((a,b)=>a+(+b||0),0);}catch(e){return 0;}}
  return{abrir,salir,estrellas};
})();
window.Cerveceria=Cerveceria;
