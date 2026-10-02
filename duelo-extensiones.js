/* Duelo: 1 vs 1 en vivo para las extensiones (Rosco, Silabario, etc.), reutilizando
   el mismo mqtt/BROKERS que ya usa Girá y Adiviná para la sala host/guest, pero con
   su propio canal y su propio cliente para no pisar una partida de la rueda principal.
   Cada juego solo necesita: abrir el lobby, mandar la ronda (el host) o recibirla
   (el guest), avisar el progreso propio y mandar el resultado final. El badge flotante
   y la pantalla de resultado final las dibuja este archivo, iguales para cualquier juego. */
const Duelo=(()=>{
  const CHARS="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let cliente=null,juego=null,sala=null,soyHost=false,rival=null,activo=false;
  /* Invitación por link: ?duelo=<juego>&sala=XXXX&de=<nombre> abre ese juego
     con el lobby en "Unirme" y el código ya cargado. */
  const DUELO_EXT={ahorcado:"ahorcado-rioplatense",cien:"cien-rioplatenses",frases:"frases-en-giro",memoria:"memoria-en-giro",rosco:"rosco-rioplatense",rueda:"rueda-de-letras",silabario:"silabario-rioplatense",sopa:"sopa-fugaz"};
  let invitacion=null;
  try{
    const q=new URLSearchParams(location.search),j=q.get("duelo"),s=(q.get("sala")||"").toUpperCase();
    if(DUELO_EXT[j]&&/^[A-HJ-NP-Z2-9]{4}$/.test(s))invitacion={juego:j,sala:s,de:(q.get("de")||"").replace(/[^\p{L}\p{N} ]/gu,"").trim().slice(0,14)};
  }catch(e){}
  function linkInvitacion(){
    let base="";try{base=location.origin+location.pathname;}catch(e){}
    return base+"?duelo="+juego+"&sala="+sala+"&de="+encodeURIComponent((perfil&&perfil.nombre)||"");
  }
  function limpiarUrl(){try{history.replaceState(null,"",location.pathname);}catch(e){}}
  function abrirInvitacion(){
    if(!invitacion||typeof Extensiones==="undefined")return;
    Extensiones.abrirJuego(DUELO_EXT[invitacion.juego]);
    let n=0;const t=setInterval(()=>{
      const b=[...document.querySelectorAll("#extContenido button")].find(x=>/con un amigo|👥/i.test(x.textContent)&&x.offsetParent);
      if(b){clearInterval(t);b.click();}else if(++n>24)clearInterval(t);
    },250);
  }
  let cbRivalListo=null,cbRonda=null,cbProgreso=null,cbFinal=null,finalRival=null,holaTimer=null,capa=null;
  function codigoNuevo(){return Array.from({length:4},()=>CHARS[Math.floor(Math.random()*CHARS.length)]).join("");}
  function temaOut(){return "gyaduelo/"+juego+"/"+sala+"/"+(soyHost?"host":"guest");}
  function temaIn(){return "gyaduelo/"+juego+"/"+sala+"/"+(soyHost?"guest":"host");}
  function mandar(msg){try{cliente&&cliente.connected&&cliente.publish(temaOut(),JSON.stringify(msg));}catch(e){}}
  function avatarHtml(av,frame){
    return '<span class="dl-avatar"><img src="assets/avatars/'+(av||"avatar-01")+'.webp" alt="">'+
      (frame?'<img class="dl-marco" src="assets/frames/frame-'+frame+'.png" alt="">':"")+'</span>';
  }
  function recibir(t,pl){
    if(t!==temaIn())return;
    let m;try{m=JSON.parse(pl.toString());}catch(e){return;}
    if(m.tipo==="hola"){
      rival={nombre:m.nombre,avatar:m.avatar,frame:m.frame};
      if(soyHost)mandar({tipo:"hola",nombre:(perfil&&perfil.nombre)||"Jugador",avatar:(perfil&&perfil.avatar)||null,frame:(typeof frameEquipado!=="undefined"?frameEquipado:null)});
      if(cbRivalListo){const f=cbRivalListo;cbRivalListo=null;f(rival);}
    }else if(m.tipo==="ronda"&&cbRonda){cbRonda(m.datos);}
    else if(m.tipo==="progreso"&&cbProgreso){cbProgreso(m.datos);}
    else if(m.tipo==="final"){finalRival=m.datos;if(cbFinal)cbFinal(m.datos);}
  }
  function cerrarCliente(){
    if(holaTimer){clearInterval(holaTimer);holaTimer=null;}
    if(cliente){try{cliente.end(true);}catch(e){}cliente=null;}
  }
  function activaCapa(){
    if(capa)return capa;
    capa=document.createElement("div");capa.className="dl-capa";document.body.appendChild(capa);
    return capa;
  }
  function cerrarCapa(){if(capa){capa.remove();capa=null;}}
  /* --- Lobby: elegir crear o unirse, mostrar código, esperar rival --- */
  function mostrarLobby(nombreJuego,idJuego,{onListo,onCancelar,detalle}){
    juego=idJuego;activo=false;rival=null;finalRival=null;
    const c=activaCapa();
    c.innerHTML='<div class="dl-tarjeta"><h3>Jugar con un amigo</h3><p class="dl-sub">'+nombreJuego+' · 1 vs 1</p>'+(detalle?'<p class="dl-detalle">'+detalle+'</p>':'')+
      '<div id="dlElegir" class="dl-fila"><button type="button" id="dlCrear" class="dl-principal">Crear sala</button><button type="button" id="dlUnirse">Unirme con código</button></div>'+
      '<div id="dlCodigoZona" hidden><button type="button" id="dlWpp" class="dl-wpp">📲 Invitar por WhatsApp</button><p>o pasale este código:</p><div class="dl-codigo" id="dlCodigo"></div>'+
      '<div class="dl-fila"><button type="button" id="dlCopiar">Copiar invitación</button></div></div>'+
      '<div id="dlEntrarZona" hidden><label class="dl-sr" for="dlInput">Código</label><input id="dlInput" maxlength="4" placeholder="CÓDIGO" autocomplete="off" autocapitalize="characters"><button type="button" id="dlEntrar" class="dl-principal">Unirme</button></div>'+
      '<p id="dlEstado" class="dl-estado" role="status"></p>'+
      '<button type="button" id="dlCancelar" class="dl-cerrar">Cancelar</button></div>';
    const estado=t=>{c.querySelector("#dlEstado").textContent=t;};
    const salirLobby=()=>{cerrarCliente();cerrarCapa();if(onCancelar)onCancelar();};
    c.querySelector("#dlCancelar").onclick=salirLobby;
    c.querySelector("#dlCrear").onclick=()=>{
      soyHost=true;sala=codigoNuevo();c.querySelector("#dlElegir").hidden=true;c.querySelector("#dlCodigoZona").hidden=false;
      c.querySelector("#dlCodigo").textContent=sala;estado("Conectando…");
      conectar(()=>{
        cliente.subscribe(temaIn());cliente.on("message",recibir);estado("Sala lista. Esperando al otro jugador…");
        cbRivalListo=r=>{estado("");cerrarCapa();if(onListo)onListo(true,r);};
      },()=>estado("No se pudo conectar. Probá con otra red (datos del celular)."),cl=>{cliente=cl;});
      const quien=(perfil&&perfil.nombre)||"Un amigo";
      const texto="¡"+quien+" te desafía a "+nombreJuego+" en Girá y Adiviná! 👥 Tocá el link y apretá UNIRME: "+linkInvitacion()+" (código "+sala+")";
      c.querySelector("#dlWpp").onclick=()=>window.open("https://wa.me/?text="+encodeURIComponent(texto),"_blank");
      c.querySelector("#dlCopiar").onclick=async()=>{
        try{await navigator.clipboard.writeText(texto);}catch(e){}
        const b=c.querySelector("#dlCopiar");b.textContent="¡Copiada!";setTimeout(()=>b.textContent="Copiar invitación",1500);
      };
    };
    c.querySelector("#dlUnirse").onclick=()=>{
      c.querySelector("#dlElegir").hidden=true;c.querySelector("#dlEntrarZona").hidden=false;c.querySelector("#dlInput").focus();
    };
    const entrar=()=>{
      const cod=c.querySelector("#dlInput").value.trim().toUpperCase();
      if(cod.length<4){estado("El código tiene 4 caracteres.");return;}
      soyHost=false;sala=cod;estado("Conectando…");
      conectar(()=>{
        cliente.subscribe(temaIn());cliente.on("message",recibir);estado("Buscando la sala "+sala+"…");
        cbRivalListo=r=>{estado("");cerrarCapa();if(onListo)onListo(false,r);};
        const hola=()=>mandar({tipo:"hola",nombre:(perfil&&perfil.nombre)||"Jugador",avatar:(perfil&&perfil.avatar)||null,frame:(typeof frameEquipado!=="undefined"?frameEquipado:null)});
        hola();holaTimer=setInterval(hola,2000);
      },()=>estado("No se pudo conectar. Probá con otra red (datos del celular)."),cl=>{cliente=cl;});
    };
    c.querySelector("#dlEntrar").onclick=entrar;
    c.querySelector("#dlInput").onkeydown=e=>{if(e.key==="Enter")entrar();};
    if(invitacion&&invitacion.juego===idJuego){
      const inv=invitacion;invitacion=null;limpiarUrl();
      c.querySelector("#dlElegir").hidden=true;c.querySelector("#dlEntrarZona").hidden=false;
      c.querySelector("#dlInput").value=inv.sala;
      estado((inv.de?inv.de+" te invitó":"Te invitaron")+" a la sala "+inv.sala+". Tocá UNIRME.");
    }
  }
  /* --- Durante la partida: progreso propio/rival y badge flotante --- */
  function enviarRonda(datos){mandar({tipo:"ronda",datos});}
  function onRondaRecibida(cb){cbRonda=cb;}
  function enviarProgreso(datos){mandar({tipo:"progreso",datos});}
  function onProgresoRival(cb){cbProgreso=cb;}
  let badgeEl=null;
  function mostrarBadge(){
    if(badgeEl)return badgeEl;
    badgeEl=document.createElement("div");badgeEl.className="dl-badge";
    badgeEl.innerHTML=avatarHtml(rival&&rival.avatar,rival&&rival.frame)+'<span><small>'+((rival&&rival.nombre)||"Rival")+'</small><b id="dlBadgeValor">0</b></span>';
    document.body.appendChild(badgeEl);activo=true;return badgeEl;
  }
  function actualizarBadge(texto){if(badgeEl)badgeEl.querySelector("#dlBadgeValor").textContent=texto;}
  function quitarBadge(){if(badgeEl){badgeEl.remove();badgeEl=null;}}
  /* --- Final: mandar mi resultado y mostrar la comparación --- */
  function enviarFinal(datos){mandar({tipo:"final",datos});}
  function mostrarResultado(miResultado,{etiqueta="aciertos",onVolver}={}){
    quitarBadge();
    const c=activaCapa();
    const pintar=()=>{
      const gano=finalRival?(miResultado.valor>finalRival.valor?"vos":miResultado.valor<finalRival.valor?"rival":"empate"):null;
      c.innerHTML='<div class="dl-tarjeta dl-resultado"><h3>'+(finalRival?(gano==="empate"?"¡Empataron!":gano==="vos"?"¡Ganaste!":"Ganó "+(rival&&rival.nombre||"tu rival")):"Esperando a tu rival…")+'</h3>'+
        '<div class="dl-vs">'+
        '<div class="dl-vsjugador'+(gano==="vos"?" dl-gano":"")+'">'+avatarHtml(perfil&&perfil.avatar,typeof frameEquipado!=="undefined"?frameEquipado:null)+'<small>Vos</small><b>'+miResultado.valor+'</b></div>'+
        '<span class="dl-vsversus">VS</span>'+
        '<div class="dl-vsjugador'+(gano==="rival"?" dl-gano":"")+'">'+avatarHtml(rival&&rival.avatar,rival&&rival.frame)+'<small>'+((rival&&rival.nombre)||"Rival")+'</small><b>'+(finalRival?finalRival.valor:"…")+'</b></div>'+
        '</div><p class="dl-sub">'+etiqueta+(finalRival?"":" · todavía está jugando")+'</p>'+
        '<button type="button" id="dlVolver" class="dl-principal">Volver</button></div>';
      c.querySelector("#dlVolver").onclick=()=>{cerrarCliente();cerrarCapa();activo=false;if(onVolver)onVolver();};
    };
    pintar();
    if(!finalRival)cbFinal=()=>pintar();
  }
  function estaActivo(){return activo;}
  function rivalActual(){return rival;}
  function salir(){cerrarCliente();cerrarCapa();quitarBadge();activo=false;rival=null;finalRival=null;cbRivalListo=null;cbRonda=null;cbProgreso=null;cbFinal=null;}
  return{abrirInvitacion,hayInvitacion:()=>!!invitacion,mostrarLobby,enviarRonda,onRondaRecibida,enviarProgreso,onProgresoRival,mostrarBadge,actualizarBadge,enviarFinal,mostrarResultado,estaActivo,rivalActual,salir};
})();
window.Duelo=Duelo;
