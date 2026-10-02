/* Contra Reloj Rioplatense — online por equipos (MQTT, host autoritativo).
   Mínimo 4 personas: 2 o 3 grupos, mínimo 2 por grupo (3 grupos = 6+).
   El canal público (/out) nunca lleva las palabras de la tarjeta: el host
   las manda por el tópico privado de cada jugador (/p/{pid}) solo al
   descriptor y a los rivales; los compañeros del descriptor no la ven. */
const ContraRelojOnline=(()=>{
  const LETRAS="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const BROKERS=["wss://broker.emqx.io:8084/mqtt","wss://broker.hivemq.com:8884/mqtt"];
  const PID_OK=/^p[a-z0-9]{4,12}$/,SALA_OK=/^[A-HJ-NP-Z2-9]{4}$/,ESTADOS_OK=["pending","correct","invalid"],MAX_JUG=18;
  let c=null,mq=null,sala="",pid="",miNombre="",soyHost=false,grupos=2,estadoSala=null,privado=null,tTurno=null,micOnline=false,listoConexion=false;
  let meta=15,jugados={},ganadorG=0,ultimoFestejo="",jug={},puntos={},empezada=false,grupoActivo=1,turno=null,rotacion={},tHost=null,mazo=[],idxMazo=-1,tDadoHost=null;
  const $=s=>c?c.$(s):null;
  const nuevoPid=()=>"p"+Math.random().toString(36).slice(2,10);
  const nuevoCodigo=()=>Array.from({length:4},()=>LETRAS[Math.floor(Math.random()*LETRAS.length)]).join("");
  const base=()=>"gyacontrareloj/v1/"+sala;
  const tIn=()=>base()+"/in",tOut=()=>base()+"/out",tYo=()=>base()+"/p/"+pid;
  function limpiarNombre(n,def){return String(n||"").replace(/[\u0000-\u001f<>]/g,"").trim().slice(0,14)||def;}
  const entero=(v,min,max)=>{const n=Number(v);return Number.isInteger(n)&&n>=min&&n<=max?n:null;};
  function publicar(t,o){if(mq?.connected){try{mq.publish(t,JSON.stringify(o));}catch(e){}}}
  function enviarIn(o){if(soyHost){recibirHost({...o,pid});return;}publicar(tIn(),{...o,pid});}
  const hostOut=o=>publicar(tOut(),o);
  function hostA(id,o){if(id===pid){recibirPrivado(o);return;}publicar(base()+"/p/"+id,o);}
  function conexion(t){for(const id of["#setupConn","#lobbyConn","#gameConn"]){const el=$(id);if(el)el.textContent=t;}}
  function jugadores(){return estadoSala?.players||Object.values(jug);}

  /* CONEXIÓN (reusa el mqtt.js que ya carga el juego) */
  function conectar(alListo){
    if(typeof mqtt==="undefined"){conexion("No se pudo cargar la conexión online. Revisá internet y probá de nuevo.");return;}
    let i=0;listoConexion=false;
    const intento=()=>{
      try{
        const cli=mqtt.connect(BROKERS[i],{clientId:"gya_cr_"+nuevoPid(),clean:true,connectTimeout:5000,reconnectPeriod:1800});
        mq=cli;let ok=false;
        cli.on("connect",()=>{
          if(mq!==cli)return;
          suscribir();
          if(!ok){ok=true;listoConexion=true;conexion("");alListo();return;}
          // Reconexión: re-anunciarse y pedir/mandar foto del estado.
          conexion("");
          if(soyHost)difundir();else enviarIn({type:"hello",name:miNombre});
          if(window.ContraRelojVoz)ContraRelojVoz.saludar();
        });
        cli.on("message",alMensaje);
        cli.on("reconnect",()=>{if(mq===cli&&listoConexion)conexion("Reconectando…");});
        cli.on("offline",()=>{if(mq===cli&&listoConexion)conexion("Sin conexión. Reintentando…");});
        cli.on("error",()=>{if(ok||mq!==cli)return;try{cli.end(true);}catch(e){}i++;if(i<BROKERS.length)intento();else conexion("No se pudo conectar a la sala.");});
      }catch(e){conexion("No se pudo abrir la conexión.");}
    };
    intento();
  }
  function suscribir(){
    if(!mq?.connected)return;
    const t=[tYo(),base()+"/rtc/"+pid,base()+"/rtc/all"];
    t.push(soyHost?tIn():tOut());
    try{mq.subscribe(t);}catch(e){}
  }
  function desconectar(){
    clearInterval(tTurno);clearTimeout(tHost);clearInterval(tDadoHost);tTurno=tDadoHost=null;
    if(soyHost&&mq?.connected)hostOut({type:"closed"});
    else if(mq?.connected&&sala)publicar(tIn(),{type:"bye",pid});
    detenerMicOnline();
    if(window.ContraRelojVoz)ContraRelojVoz.desvincular();
    const viejo=mq;mq=null;
    if(viejo){setTimeout(()=>{try{viejo.end(true);}catch(e){}},150);}
    estadoSala=null;jug={};turno=null;privado=null;empezada=false;sala="";soyHost=false;listoConexion=false;
  }
  function alMensaje(topic,payload){
    let m;try{const s=payload.toString();if(s.length>40000)return;m=JSON.parse(s);}catch(e){return;}
    if(!m||typeof m!=="object"||!sala)return;
    if(topic===base()+"/rtc/"+pid||topic===base()+"/rtc/all"){if(window.ContraRelojVoz)ContraRelojVoz.senal(m);return;}
    if(soyHost&&topic===tIn()){recibirHost(m);return;}
    if(!soyHost&&topic===tOut()){recibirCliente(m);return;}
    if(topic===tYo())recibirPrivado(m);
  }

  /* HOST */
  function turnoPublico(){
    if(!turno)return null;
    return{id:turno.id,team:turno.team,describer:turno.describer,startAt:turno.startAt,endAt:turno.endAt,status:turno.status,statuses:turno.statuses,die:turno.die,points:turno.points};
  }
  function estadoHost(){return{type:"state",room:sala,teamCount:grupos,players:Object.values(jug),scores:puntos,started:empezada,activeTeam:grupoActivo,turn:turnoPublico(),meta,winner:ganadorG};}
  function difundir(){estadoSala=estadoHost();hostOut(estadoSala);pintar();}
  function mandarTarjeta(p){
    if(!turno||turno.status!=="active")return;
    const t={id:turno.id,team:turno.team,describer:turno.describer,startAt:turno.startAt,endAt:turno.endAt,die:turno.die,sent:Date.now()};
    if(p.pid===turno.describer||(p.team&&p.team!==turno.team))hostA(p.pid,{type:"card",card:turno.card,statuses:turno.statuses,role:p.pid===turno.describer?"describer":"opponent",turn:t});
    else hostA(p.pid,{type:"blind",statuses:turno.statuses,role:"teammate",turn:t});
  }
  function actualizarPalabra(i,st){
    hostOut({type:"word_update",index:i,status:st});
    aplicarPalabra(i,st);
  }
  function recibirHost(m){
    const id=String(m.pid||"");if(!PID_OK.test(id))return;
    if(m.type==="hello"){
      if(!jug[id]){if(Object.keys(jug).length>=MAX_JUG)return;jug[id]={pid:id,name:limpiarNombre(m.name,"Jugador"),team:0,host:false,voiceReady:false};}
      hostA(id,{type:"welcome",teamCount:grupos,started:empezada,team:jug[id].team});
      difundir();mandarTarjeta(jug[id]);
    }else if(!jug[id])return;
    else if(m.type==="bye"&&id!==pid){
      const eraDescriptor=turno&&turno.describer===id&&turno.status==="active";
      delete jug[id];if(eraDescriptor)terminarRondaHost();else difundir();
    }else if(m.type==="voice_ready"){jug[id].voiceReady=!!m.ready;difundir();}
    else if(m.type==="choose_team"){
      const t=entero(m.team,1,grupos);
      if(t&&(!empezada||!jug[id].team)){jug[id].team=t;difundir();}
    }else if(m.type==="word_correct"&&turno?.status==="active"&&id===turno.describer){
      const i=entero(m.index,0,4);
      if(i!==null&&turno.statuses[i]==="pending"&&Date.now()>=turno.startAt){turno.statuses[i]="correct";actualizarPalabra(i,"correct");difundir();chequearResueltas();}
    }else if(m.type==="word_invalid"&&turno?.status==="active"){
      const i=entero(m.index,0,4),p=jug[id];
      if(i!==null&&turno.statuses[i]==="pending"&&(id===turno.describer||(p.team&&p.team!==turno.team))){turno.statuses[i]="invalid";actualizarPalabra(i,"invalid");difundir();chequearResueltas();}
    }else if(m.type==="finish_round"&&turno?.status==="active"&&id===turno.describer)terminarRondaHost();
  }
  function crearSala(){
    miNombre=limpiarNombre($("#hostName").value,"Anfitrión");
    grupos=Number(c.raiz().querySelector(".crr-choice.crr-sel[data-teams]")?.dataset.teams||2)===3?3:2;
    const mt=Number(c.raiz().querySelector(".crr-choice.crr-sel[data-meta]")?.dataset.meta);meta=[10,15,20].includes(mt)?mt:15;
    sala=nuevoCodigo();pid=nuevoPid();soyHost=true;
    jug={[pid]:{pid,name:miNombre,team:1,host:true,voiceReady:false}};
    puntos={};for(let i=1;i<=grupos;i++)puntos[i]=0;
    empezada=false;turno=null;rotacion={};mazo=[...c.tarjetas()].sort(()=>Math.random()-.5);idxMazo=-1;
    vincularVoz();
    conexion("Conectando…");
    conectar(()=>{$("#roomCode").textContent=sala;c.pantalla("#onlineLobby");$("#hostLobbyActions").hidden=false;$("#teamPicker").hidden=true;difundir();});
  }
  function unirse(){
    miNombre=limpiarNombre($("#joinName").value,"Jugador");
    const cod=String($("#joinCode").value||"").trim().toUpperCase();
    if(!SALA_OK.test(cod)){conexion("El código tiene 4 caracteres (letras y números).");return;}
    sala=cod;pid=nuevoPid();soyHost=false;estadoSala=null;
    vincularVoz();
    conexion("Conectando…");
    conectar(()=>{$("#roomCode").textContent=sala;c.pantalla("#onlineLobby");$("#hostLobbyActions").hidden=true;enviarIn({type:"hello",name:miNombre});conexion("Esperando al anfitrión…");});
  }
  function vincularVoz(){
    if(!window.ContraRelojVoz)return;
    ContraRelojVoz.iniciar({$:c.$,esc:c.esc,mq:()=>mq,sala:()=>sala,pid:()=>pid,base,jugadores,
      marcarListo:v=>{if(soyHost&&jug[pid]){jug[pid].voiceReady=v;difundir();}else enviarIn({type:"voice_ready",ready:v});},
      aviso:c.aviso});
  }
  function empezarPartida(){
    const lista=Object.values(jug).filter(p=>p.team>=1&&p.team<=grupos);
    if(lista.length<4){c.aviso("Contra Reloj necesita mínimo 4 jugadores.");return;}
    const faltan=[];
    for(let t=1;t<=grupos;t++){const n=lista.filter(p=>p.team===t).length;if(n<2)faltan.push("Grupo "+t+" ("+n+"/2)");}
    if(faltan.length){c.aviso("Cada grupo necesita mínimo 2 jugadores. Falta completar: "+faltan.join(", "));return;}
    const sinVoz=lista.filter(p=>!p.voiceReady);
    if(sinVoz.length){c.aviso("Antes de empezar, todos tienen que activar el micrófono. Falta: "+sinVoz.map(p=>p.name).join(", "));return;}
    const sinGrupo=Object.values(jug).filter(p=>!p.team);
    if(sinGrupo.length){c.aviso("Falta que elijan grupo: "+sinGrupo.map(p=>p.name).join(", "));return;}
    empezada=true;reiniciarMarcador();c.sumarPartida();difundir();
  }
  function gruposConGente(){const a=[];for(let t=1;t<=grupos;t++)if(Object.values(jug).some(p=>p.team===t))a.push(t);return a;}
  function siguienteGrupo(act){const a=gruposConGente();if(!a.length)return 1;const i=a.indexOf(act);return a[(i+1+a.length)%a.length];}
  function elegirDescriptor(g){const ps=Object.values(jug).filter(p=>p.team===g);if(!ps.length)return null;const k=rotacion[g]||0;rotacion[g]=(k+1)%ps.length;return ps[k%ps.length].pid;}
  function prepararTurno(){
    if(!soyHost||!empezada||(turno&&["awaiting_die","ready","active"].includes(turno.status)))return;
    if(!gruposConGente().includes(grupoActivo))grupoActivo=siguienteGrupo(grupoActivo);
    const desc=elegirDescriptor(grupoActivo);if(!desc)return;
    idxMazo=(idxMazo+1)%mazo.length;
    turno={id:Math.random().toString(36).slice(2,9),team:grupoActivo,describer:desc,startAt:null,endAt:null,status:"awaiting_die",statuses:Array(5).fill("pending"),card:mazo[idxMazo],die:null,points:null};
    privado=null;difundir();
  }
  function tirarDadoHost(){
    if(!soyHost||turno?.status!=="awaiting_die"||tDadoHost)return;
    const valor=c.tirarValor();$("#rollOnlineDie").disabled=true;
    tDadoHost=c.animarDado($("#oDie"),valor,()=>{
      tDadoHost=null;if(!turno||turno.status!=="awaiting_die")return;
      turno.die=valor;turno.status="ready";$("#rollOnlineDie").disabled=false;difundir();
    });
  }
  function empezarRondaHost(){
    if(!soyHost||turno?.status!=="ready"||turno.die==null)return;
    const ahora=Date.now();turno.startAt=ahora+c.PREVIA*1000;turno.endAt=turno.startAt+c.SEG*1000;turno.status="active";
    Object.values(jug).forEach(mandarTarjeta);
    difundir();clearTimeout(tHost);tHost=setTimeout(terminarRondaHost,(c.PREVIA+c.SEG)*1000+180);
  }
  function chequearResueltas(){if(turno?.statuses.every(s=>s!=="pending"))terminarRondaHost();}
  function terminarRondaHost(){
    if(!turno||turno.status!=="active")return;
    clearTimeout(tHost);
    const h=c.contar(turno.statuses),d=turno.die??0;
    turno.points=c.puntaje(h,d);turno.status="done";
    puntos[turno.team]=(puntos[turno.team]||0)+turno.points;
    jugados[turno.team]=(jugados[turno.team]||0)+1;
    Object.values(jug).forEach(p=>hostA(p.pid,{type:"turn_stop"}));
    grupoActivo=siguienteGrupo(turno.team);
    c.pitidoFin();difundir();
  }
  function ajustarHost(i){
    if(!soyHost||turno?.status!=="done")return;
    const antes=turno.points??0;
    turno.statuses[i]=turno.statuses[i]==="correct"?"pending":"correct";
    turno.points=c.puntaje(c.contar(turno.statuses),turno.die??0);
    puntos[turno.team]=(puntos[turno.team]||0)+(turno.points-antes);
    actualizarPalabra(i,turno.statuses[i]);difundir();
  }
  function reiniciarMarcador(){puntos={};for(let i=1;i<=grupos;i++)puntos[i]=0;jugados={};ganadorG=0;grupoActivo=1;turno=null;privado=null;}
  // Una vuelta está completa cuando todos los grupos jugaron la misma cantidad de turnos.
  function vueltaCompleta(){const gs=gruposConGente();return gs.length>1&&gs.every(g=>(jugados[g]||0)===(jugados[gs[0]]||0))&&(jugados[gs[0]]||0)>0;}
  function ganadorAhora(){return turno?.status==="done"?c.ganador(puntos,grupos,meta,vueltaCompleta()):0;}
  function siguienteOGanador(){
    if(!soyHost)return;
    const g=ganadorAhora();
    if(g){ganadorG=g;difundir();}else prepararTurno();
  }
  function revancha(){if(!soyHost)return;clearTimeout(tHost);reiniciarMarcador();difundir();}
  function terminarPartida(){if(!soyHost)return;ganadorG=0;empezada=false;turno=null;privado=null;clearTimeout(tHost);difundir();c.pantalla("#onlineLobby");}

  /* CLIENTE */
  function estadoValido(m){
    if(m.room!==sala||!Array.isArray(m.players)||m.players.length>MAX_JUG)return false;
    if(m.teamCount!==2&&m.teamCount!==3)return false;
    if(!m.players.every(p=>p&&PID_OK.test(String(p.pid))&&typeof p.name==="string"))return false;
    const t=m.turn;
    if(t&&(!Array.isArray(t.statuses)||t.statuses.length!==5||!t.statuses.every(s=>ESTADOS_OK.includes(s))))return false;
    return true;
  }
  function recibirCliente(m){
    if(m.type==="state"&&estadoValido(m)){
      m.players.forEach(p=>{p.name=limpiarNombre(p.name,"Jugador");});
      estadoSala=m;grupos=m.teamCount;
      if(!m.players.some(p=>p.pid===pid)&&listoConexion)enviarIn({type:"hello",name:miNombre});
      pintar();
    }else if(m.type==="word_update"){const i=entero(m.index,0,4);if(i!==null&&ESTADOS_OK.includes(m.status))aplicarPalabra(i,m.status);}
    else if(m.type==="closed"){c.aviso("El anfitrión cerró la sala.");salirSala();}
  }
  function aplicarPalabra(i,st){if(privado?.statuses){privado.statuses[i]=st;pintarPalabras();}}
  function recibirPrivado(m){
    if(m.type==="welcome"){
      grupos=m.teamCount===3?3:2;
      if(!soyHost&&!entero(m.team,1,3))mostrarSelectorGrupo();
      return;
    }
    // Los tiempos vienen en el reloj del host: se pasan al reloj local.
    let t=m.turn;
    if(t&&typeof t==="object"&&Number.isFinite(t.startAt)&&Number.isFinite(t.endAt)){
      const off=Number.isFinite(t.sent)&&Math.abs(Date.now()-t.sent)<600000?Date.now()-t.sent:0;
      t={...t,startAt:t.startAt+off,endAt:t.endAt+off};
    }
    const tarjetaOk=Array.isArray(m.card)&&m.card.length===5&&m.card.every(w=>typeof w==="string"&&w.length<40);
    const estOk=Array.isArray(m.statuses)&&m.statuses.length===5&&m.statuses.every(s=>ESTADOS_OK.includes(s));
    const turnoOk=t&&Number.isFinite(t.startAt)&&Number.isFinite(t.endAt)&&t.endAt-t.startAt<=60000;
    if(m.type==="card"&&tarjetaOk&&estOk&&turnoOk){
      if(privado?.turn?.id===t.id&&privado.kind==="card")return;
      privado={kind:"card",card:[...m.card],statuses:[...m.statuses],role:m.role==="describer"?"describer":"opponent",turn:t};aplicarTurno();
    }else if(m.type==="blind"&&estOk&&turnoOk){
      if(privado?.turn?.id===t.id)return;
      privado={kind:"blind",statuses:[...m.statuses],role:"teammate",turn:t};aplicarTurno();
    }else if(m.type==="turn_stop"){detenerMicOnline();clearInterval(tTurno);tTurno=null;}
  }
  function mostrarSelectorGrupo(){
    const caja=$("#teamPickerBtns");if(!caja)return;
    $("#teamPicker").hidden=false;caja.innerHTML="";
    for(let i=1;i<=grupos;i++){
      const b=document.createElement("button");b.type="button";b.className="crr-choice";b.textContent="GRUPO "+i;
      b.onclick=()=>{enviarIn({type:"choose_team",team:i});$("#teamPicker").hidden=true;};
      caja.appendChild(b);
    }
  }

  /* RENDER */
  function pintarEquipos(cont){
    if(!estadoSala||!cont)return;cont.innerHTML="";
    for(let t=1;t<=estadoSala.teamCount;t++){
      const ps=estadoSala.players.filter(p=>p.team===t),d=document.createElement("div");d.className="crr-team";
      d.innerHTML="<h3><span>GRUPO "+t+"</span><span>"+(ps.length>=2?"✓ LISTO":ps.length+"/2 MÍN.")+"</span></h3>"
        +(ps.length?ps.map(p=>'<div class="crr-player'+(p.host?" crr-host":"")+(estadoSala.turn?.describer===p.pid?" crr-turn":"")+'">'+c.esc(p.name)+(p.voiceReady?" · 🎙 listo":" · 🎙 pendiente")+"</div>").join(""):'<div class="crr-player">Faltan 2 jugadores</div>');
      cont.appendChild(d);
    }
    const sin=estadoSala.players.filter(p=>!p.team);
    if(sin.length){const d=document.createElement("div");d.className="crr-team";d.innerHTML="<h3><span>SIN GRUPO</span><span></span></h3>"+sin.map(p=>'<div class="crr-player">'+c.esc(p.name)+"</div>").join("");cont.appendChild(d);}
  }
  function pintar(){
    if(!estadoSala||!c?.raiz())return;
    conexion("");
    if(window.ContraRelojVoz)ContraRelojVoz.sincronizar();
    const yo=estadoSala.players.find(p=>p.pid===pid);
    if(!estadoSala.started){
      c.raiz().classList.remove("crr-en-ronda");$("#onlineGame").classList.remove("crr-en-ronda");
      if(!$("#onlineLobby").hidden||!$("#onlineGame").hidden||!$("#onlineWinner").hidden){c.pantalla("#onlineLobby");pintarEquipos($("#lobbyTeams"));}
      if(!soyHost&&yo&&yo.team)$("#teamPicker").hidden=true;
      return;
    }
    if(!soyHost&&yo&&!yo.team){c.pantalla("#onlineLobby");pintarEquipos($("#lobbyTeams"));mostrarSelectorGrupo();return;}
    const gan=Number(estadoSala.winner)||0;
    if(gan>=1&&gan<=estadoSala.teamCount){pintarGanador(gan);return;}
    ultimoFestejo="";
    if($("#onlineGame").hidden)c.pantalla("#onlineGame");
    // Durante la ronda se esconde lo accesorio para que entre en una pantalla.
    const enRonda=estadoSala.turn?.status==="active";
    $("#onlineGame").classList.toggle("crr-en-ronda",enRonda);c.raiz().classList.toggle("crr-en-ronda",enRonda);
    pintarMarcador();pintarRol();pintarResultado();
  }
  function pintarGanador(g){
    c.raiz().classList.remove("crr-en-ronda");$("#onlineGame").classList.remove("crr-en-ronda");
    clearInterval(tTurno);tTurno=null;
    if($("#onlineWinner").hidden)c.pantalla("#onlineWinner");
    const nombres=estadoSala.players.filter(p=>p.team===g).map(p=>p.name);
    const yo=estadoSala.players.find(p=>p.pid===pid);
    $("#owTitulo").textContent=yo?.team===g?"¡Ganaron ustedes!":"¡Ganó el Grupo "+g+"!";
    $("#owSub").textContent=(yo?.team===g?"Grupo "+g+": ":"")+nombres.join(", ");
    c.marcador($("#owScores"),estadoSala.scores||{},estadoSala.teamCount,g,0);
    $("#owHost").hidden=!soyHost;$("#owEspera").hidden=soyHost;
    const clave=sala+":"+g+":"+JSON.stringify(estadoSala.scores);
    if(ultimoFestejo!==clave){ultimoFestejo=clave;c.fanfarria();}
  }
  function pintarMarcador(){
    c.marcador($("#scoreboard"),estadoSala.scores||{},estadoSala.teamCount,estadoSala.activeTeam,Number(estadoSala.meta)||0);
    const st=estadoSala.turn?.status||"";
    if(soyHost)$("#nextTurnBtn").textContent=ganadorAhora()?"🏆 VER GANADOR":"PREPARAR SIGUIENTE TURNO";
    $("#hostControls").hidden=!soyHost;
    $("#nextTurnBtn").hidden=!soyHost||["awaiting_die","ready","active"].includes(st);
    $("#rollOnlineDie").hidden=!soyHost||st!=="awaiting_die";
    $("#startOnlineRoundBtn").hidden=!soyHost||st!=="ready";
  }
  function pintarRol(){
    const t=estadoSala.turn,rol=$("#roleBox"),pista=$("#voiceTurnHint");
    if(!t){rol.innerHTML="Esperando que el anfitrión prepare el próximo turno.";$("#oPhase").textContent="ESPERANDO TURNO";return;}
    const yo=estadoSala.players.find(p=>p.pid===pid),desc=estadoSala.players.find(p=>p.pid===t.describer);
    if(pid===t.describer){rol.innerHTML="<strong>TE TOCA DESCRIBIR.</strong> Todos te escuchan. Tocá cada palabra cuando tu equipo la adivine.";pista.textContent="Tu voz se transmite a la sala y el árbitro analiza únicamente tu micrófono.";}
    else if(yo?.team===t.team){rol.innerHTML="<strong>ADIVINÁ.</strong> Escuchá a "+c.esc(desc?.name||"tu compañero")+". Vos no ves la tarjeta.";pista.textContent="Escuchá al descriptor y respondé por voz. Tu micrófono también está en la sala.";}
    else{rol.innerHTML="<strong>CONTROLÁS LA JUGADA.</strong> Escuchás al descriptor y ves las 5 respuestas del Grupo "+t.team+".";pista.textContent="Si el descriptor dice una respuesta y el árbitro no la toma, podés marcarla.";}
    $("#oTeam").textContent="G"+t.team;$("#oHits").textContent=c.contar(t.statuses)+"/5";$("#oPenalty").textContent=t.die==null?"—":"−"+t.die;
    if(t.status!=="active"&&!tTurno){c.reloj("o",c.SEG);$("#oFinish").hidden=true;$("#oPreview").hidden=true;}
    if(t.status==="awaiting_die"||t.status==="ready"){
      privado=null;$("#oWords").innerHTML="";$("#oBlind").hidden=false;
      $("#oBlindText").textContent=t.status==="awaiting_die"?"Se tira el dado antes de empezar.":"Dado listo. En instantes empieza la ronda.";
      $("#oPhase").textContent="ANTES DE EMPEZAR";$("#oStatus").textContent="";
    }else if(t.status==="done"){
      $("#oBlind").hidden=true;$("#oPhase").textContent="RONDA TERMINADA";$("#oStatus").textContent="Grupo "+t.team+": "+t.points+" puntos.";
      if(!privado||privado.kind!=="card")$("#oWords").innerHTML="";
      else{privado.statuses=[...t.statuses];pintarPalabras();}
    }
  }
  function pintarResultado(){
    const t=estadoSala.turn,caja=$("#oRoundResult");
    if(!t||!["awaiting_die","ready","done"].includes(t.status)){caja.hidden=true;return;}
    caja.hidden=false;
    $("#orHits").textContent=c.contar(t.statuses);$("#orDie").textContent=t.die==null?"—":"−"+t.die;$("#orPoints").textContent=t.status==="done"?t.points:"—";
    if(!tDadoHost){if(t.die==null)c.dadoPregunta($("#oDie"));else c.mostrarDado($("#oDie"),t.die);}
    const calc=$("#oCalc");
    if(t.status==="awaiting_die")calc.innerHTML="<strong>ANTES DE EMPEZAR:</strong> el anfitrión tiene que tirar el dado.";
    else if(t.status==="ready")calc.innerHTML=t.die===0?"Salió <strong>0</strong>. Esta ronda no descuenta.":"Salió <strong>"+t.die+"</strong>. Esta ronda descontará <strong>"+t.die+"</strong> "+(t.die===1?"palabra":"palabras")+". Todos lo saben antes de empezar.";
    else calc.innerHTML=c.contar(t.statuses)+" acertadas − "+t.die+" que salió antes de empezar = <strong>"+t.points+" puntos</strong>";
    const adj=$("#orAdjust");adj.innerHTML="";
    if(soyHost&&t.status==="done"&&turno){
      turno.card.forEach((w,i)=>{
        const d=document.createElement("div");d.className="crr-adjust";
        d.innerHTML="<b>"+c.esc(w)+" · "+(t.statuses[i]==="correct"?"ACERTADA":t.statuses[i]==="invalid"?"ANULADA":"NO ACERTADA")+"</b>";
        const b=document.createElement("button");b.type="button";b.textContent="CAMBIAR";b.onclick=()=>ajustarHost(i);
        d.appendChild(b);adj.appendChild(d);
      });
    }
    if(t.status!=="done"||t.describer!==pid){const a=$("#oReview");if(a)a.hidden=true;}
  }
  function pintarPalabras(){
    if(!privado||privado.kind!=="card")return;
    const activo=estadoSala?.turn?.status==="active";
    if(privado.role==="describer")c.filas($("#oWords"),privado.card,privado.statuses,{editable:activo,alAcertar:i=>enviarIn({type:"word_correct",index:i})});
    else c.filas($("#oWords"),privado.card,privado.statuses,{rival:activo,alMarcar:i=>enviarIn({type:"word_invalid",index:i})});
    $("#oHits").textContent=c.contar(privado.statuses)+"/5";
  }
  function aplicarTurno(){
    clearInterval(tTurno);
    $("#oRoundResult").hidden=true;$("#oFinish").hidden=true;$("#oPreview").hidden=true;$("#oRec").hidden=true;
    const p=privado,t=p.turn;
    if(p.kind==="blind"){
      $("#oBlind").hidden=false;$("#oBlindText").textContent="Tu compañero está describiendo. Vos solo tenés que adivinar.";
      $("#oPhase").textContent="TU EQUIPO ADIVINA";$("#oWords").innerHTML="";
    }else if(p.role==="describer"){
      $("#oBlind").hidden=true;$("#oPreview").hidden=false;$("#oPreviewTxt").textContent="Empieza en 3…";$("#oPhase").textContent="MIRÁ LA TARJETA";pintarPalabras();
    }else{
      $("#oBlind").hidden=true;$("#oPhase").textContent="CONTROLÁ LA JUGADA";pintarPalabras();
    }
    tTurno=setInterval(()=>tick(t,p),100);
  }
  function tick(t,p){
    if(!c?.raiz()){clearInterval(tTurno);return;}
    const ahora=Date.now();
    if(ahora<t.startAt){const n=Math.max(1,Math.ceil((t.startAt-ahora)/1000));if(p.role==="describer")$("#oPreviewTxt").textContent="Empieza en "+n+"…";c.reloj("o",c.SEG);return;}
    const q=(t.endAt-ahora)/1000;c.reloj("o",q);
    if(p.kind==="blind")$("#oStatus").textContent="Escuchá y adiviná.";
    else if(p.role==="describer"){
      if(!$("#oPreview").hidden){$("#oPreview").hidden=true;pintarPalabras();}
      $("#oFinish").hidden=false;$("#oPhase").textContent="¡DESCRIBÍ LAS 5!";$("#oStatus").textContent="Dado: −"+(t.die??0)+". Tocá una palabra cuando la adivinen.";
      if(!micOnline)iniciarMicOnline(p);
    }else $("#oStatus").textContent="Dado: −"+(t.die??0)+". Si dice una respuesta, marcá esa palabra.";
    if(q<=0){clearInterval(tTurno);tTurno=null;$("#oFinish").hidden=true;detenerMicOnline();}
  }
  async function iniciarMicOnline(p){
    micOnline=true;
    try{
      if(c.necesitaMicPropio()||(window.ContraRelojVoz&&ContraRelojVoz.stream()))await c.micPreparar();
      $("#oRec").hidden=false;$("#oRec").classList.add("crr-on");$("#oRec span").textContent="● PREPARANDO ÁRBITRO…";
      const ok=c.arbitroIniciar(p.card,p.statuses,i=>{enviarIn({type:"word_invalid",index:i});pintarPalabras();},t=>{const sp=$("#oRec span");if(sp&&micOnline)sp.textContent=t;});
      if(!ok)$("#oRec span").textContent="● GRABANDO · SIN ÁRBITRO AUTOMÁTICO";
    }catch(e){$("#oRec").hidden=false;$("#oRec").classList.remove("crr-on");$("#oRec span").textContent="SIN MICRÓFONO";}
  }
  async function detenerMicOnline(){
    if(!micOnline)return;micOnline=false;
    const p=privado;await c.arbitroDetener();
    if(!c?.raiz())return;
    $("#oRec").classList.remove("crr-on");$("#oRec span").textContent="GRABACIÓN FINALIZADA";
    if(p?.role==="describer"){c.sumarAciertos(c.contar(p.statuses));c.revision("#oReview");}
  }
  function salirSala(){desconectar();if(c?.raiz())c.pantalla("#home");}

  function iniciar(ctx){
    c=ctx;
    $("#onlineBtn").onclick=()=>{c.pantalla("#onlineSetup");$("#onlineChoice").hidden=false;$("#createForm").hidden=$("#joinForm").hidden=true;conexion("");
      const n=(typeof perfil!=="undefined"&&perfil&&perfil.nombre)||"";if(n){$("#hostName").value=$("#hostName").value||n.slice(0,14);$("#joinName").value=$("#joinName").value||n.slice(0,14);}};
    $("#setupBack").onclick=()=>c.pantalla("#home");
    $("#createRoomBtn").onclick=()=>{$("#onlineChoice").hidden=true;$("#createForm").hidden=false;};
    $("#joinRoomBtn").onclick=()=>{$("#onlineChoice").hidden=true;$("#joinForm").hidden=false;};
    c.raiz().querySelectorAll(".crr-backOnline").forEach(b=>b.onclick=()=>{$("#onlineChoice").hidden=false;$("#createForm").hidden=$("#joinForm").hidden=true;});
    const elegir=c.raiz().querySelectorAll(".crr-choice[data-teams]");
    elegir.forEach(b=>b.onclick=()=>{elegir.forEach(x=>x.classList.remove("crr-sel"));b.classList.add("crr-sel");});
    $("#confirmCreate").onclick=crearSala;$("#confirmJoin").onclick=unirse;
    $("#startMatchBtn").onclick=empezarPartida;$("#nextTurnBtn").onclick=siguienteOGanador;
    $("#owRevancha").onclick=revancha;$("#owSala").onclick=terminarPartida;$("#owSalir").onclick=salirSala;
    $("#invitarBtn").onclick=invitar;$("#rollOnlineDie").onclick=tirarDadoHost;
    $("#startOnlineRoundBtn").onclick=empezarRondaHost;$("#endMatchBtn").onclick=terminarPartida;
    $("#oFinish").onclick=()=>enviarIn({type:"finish_round"});
    $("#leaveRoomBtn").onclick=salirSala;$("#leaveGameBtn").onclick=salirSala;
    for(const id of["#voiceLobbyConnect","#voiceGameConnect"])$(id).onclick=()=>window.ContraRelojVoz&&ContraRelojVoz.unirse();
    for(const id of["#voiceLobbyMute","#voiceGameMute"])$(id).onclick=()=>window.ContraRelojVoz&&ContraRelojVoz.alternarSilencio();
    if(window.ContraRelojVoz)ContraRelojVoz.iniciar({$:c.$,esc:c.esc,mq:()=>null,sala:()=>"",pid:()=>"",base,jugadores:()=>[],marcarListo:()=>{},aviso:c.aviso});
  }
  function invitar(){
    if(!sala)return;
    let base="";try{base=location.origin+location.pathname;}catch(e){}
    const link=base+"?contrareloj=1&sala="+sala+"&de="+encodeURIComponent(miNombre);
    const texto="¡"+miNombre+" te invita a Contra Reloj en Girá y Adiviná! ⏱👥 Somos 4 o más, cada uno desde su casa con el audio prendido. Tocá el link y apretá UNIRME: "+link+" (sala "+sala+")";
    try{window.open("https://wa.me/?text="+encodeURIComponent(texto),"_blank");}catch(e){}
  }
  // Abierto desde un link de invitación: deja listo el formulario para entrar.
  function irAUnirse(cod,de){
    if(!c||!SALA_OK.test(cod))return;
    $("#onlineBtn").onclick();
    $("#onlineChoice").hidden=true;$("#joinForm").hidden=false;$("#joinCode").value=cod;
    conexion((de?de+" te invitó":"Te invitaron")+" a la sala "+cod+". Poné tu nombre y tocá UNIRME.");
    try{history.replaceState(null,"",location.pathname+"?contrareloj=1");}catch(e){}
  }
  function salir(){if(mq||sala)desconectar();else if(window.ContraRelojVoz)ContraRelojVoz.desvincular();c=null;}
  return{iniciar,salir,irAUnirse};
})();
window.ContraRelojOnline=ContraRelojOnline;
