/* Contra Reloj Rioplatense — voz online por WebRTC.
   MQTT solo coordina (offer / answer / ICE / voice_hello / voice_bye);
   el audio viaja por WebRTC directo entre jugadores. Para redes con NAT
   estricto se puede definir window.GYA_TURN_SERVERS con credenciales
   TEMPORALES pedidas a un endpoint (nunca usuario/clave fijos acá). */
const ContraRelojVoz=(()=>{
  const ICE_BASE=[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun1.l.google.com:19302"}];
  const PID_OK=/^p[a-z0-9]{4,12}$/;
  let ctx=null,stream=null,silenciado=false,activa=false;
  const peers=new Map(),audios=new Map(),iceEnEspera=new Map(),estados=new Map(),ofertando=new Set();
  function iceServers(){const extra=Array.isArray(window.GYA_TURN_SERVERS)?window.GYA_TURN_SERVERS:[];return[...ICE_BASE,...extra];}
  function $(s){return ctx?ctx.$(s):null;}
  function estado(texto,error=false){for(const id of["#voiceLobbyState","#voiceGameState"]){const el=$(id);if(el){el.textContent=texto;el.classList.toggle("crr-voice-error",!!error);}}}
  function render(){
    if(!ctx)return;
    const jugadores=ctx.jugadores(),yo=ctx.pid();
    for(const id of["#voiceLobbyUsers","#voiceGameUsers"]){
      const box=$(id);if(!box)continue;box.innerHTML="";
      jugadores.forEach(p=>{
        const conectado=p.pid===yo?activa:estados.get(p.pid)==="connected";
        const d=document.createElement("span");d.className="crr-voice-user"+(conectado?" crr-connected":"")+(p.pid===yo?" crr-me":"");
        d.innerHTML="<i></i><span>"+ctx.esc(p.name||"Jugador")+(p.pid===yo?" (vos)":"")+"</span>";box.appendChild(d);
      });
    }
  }
  function botones(){
    for(const id of["#voiceLobbyMute","#voiceGameMute"]){const b=$(id);if(!b)continue;b.disabled=!activa;b.textContent=silenciado?"ACTIVAR MI VOZ":"SILENCIARME";b.classList.toggle("crr-on",silenciado);}
    for(const id of["#voiceLobbyConnect","#voiceGameConnect"]){const b=$(id);if(b)b.textContent=activa?"RECONECTAR VOZ":"ACTIVAR MICRÓFONO";}
  }
  async function asegurarStream(){
    if(stream?.active)return stream;
    if(!navigator.mediaDevices?.getUserMedia)throw new Error("Este navegador no permite usar el micrófono.");
    stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
    silenciado=false;activa=true;stream.getAudioTracks().forEach(t=>t.enabled=true);
    botones();estado("Micrófono activo");render();return stream;
  }
  function alternarSilencio(){
    if(!stream)return;silenciado=!silenciado;stream.getAudioTracks().forEach(t=>t.enabled=!silenciado);
    botones();estado(silenciado?"Tu micrófono está silenciado":"Micrófono activo");
  }
  function audioDe(remoto){
    if(audios.has(remoto))return audios.get(remoto);
    const a=document.createElement("audio");a.autoplay=true;a.playsInline=true;
    ($("#remoteAudioBank")||document.body).appendChild(a);audios.set(remoto,a);return a;
  }
  const inicioYo=remoto=>String(ctx.pid())<String(remoto);
  function enviar(destino,datos){
    const mq=ctx?.mq();if(!mq?.connected||!ctx.sala()||!destino)return;
    try{mq.publish(ctx.base()+"/rtc/"+destino,JSON.stringify({from:ctx.pid(),to:destino,...datos}));}catch(e){}
  }
  async function asegurarPeer(remoto){
    if(!ctx||!PID_OK.test(remoto)||remoto===ctx.pid())return null;
    if(peers.has(remoto))return peers.get(remoto);
    const pc=new RTCPeerConnection({iceServers:iceServers()});
    peers.set(remoto,pc);estados.set(remoto,"new");
    if(stream)stream.getTracks().forEach(t=>pc.addTrack(t,stream));
    pc.ontrack=e=>{
      const a=audioDe(remoto);
      if(e.streams?.[0])a.srcObject=e.streams[0];
      else{const ms=a.srcObject instanceof MediaStream?a.srcObject:new MediaStream();ms.addTrack(e.track);a.srcObject=ms;}
      a.play().catch(()=>estado("Tocá RECONECTAR VOZ para habilitar el audio."));
    };
    pc.onicecandidate=e=>{if(e.candidate)enviar(remoto,{type:"ice",candidate:e.candidate});};
    pc.onconnectionstatechange=()=>{
      const st=pc.connectionState||"";estados.set(remoto,st);render();
      if(st==="failed"){estado("Una conexión de voz falló. Reintentando…",true);reiniciarPeer(remoto);}
      else if(st==="connected")estado("Voz conectada");
    };
    pc.oniceconnectionstatechange=()=>{if(pc.iceConnectionState==="failed"){try{pc.restartIce();}catch(e){}}};
    const cola=iceEnEspera.get(remoto)||[];iceEnEspera.delete(remoto);
    for(const c of cola){try{await pc.addIceCandidate(c);}catch(e){}}
    return pc;
  }
  async function ofertar(remoto){
    if(ofertando.has(remoto))return;ofertando.add(remoto);
    try{
      const pc=await asegurarPeer(remoto);if(!pc||pc.signalingState!=="stable")return;
      await pc.setLocalDescription(await pc.createOffer({offerToReceiveAudio:true}));
      enviar(remoto,{type:"offer",sdp:pc.localDescription});
    }catch(e){estado("No se pudo iniciar voz con un jugador.",true);}
    finally{ofertando.delete(remoto);}
  }
  function sdpValido(sdp){
    try{return!!sdp&&typeof sdp.sdp==="string"&&(sdp.type==="offer"||sdp.type==="answer")&&sdp.sdp.length<20000;}catch(e){return false;}
  }
  function iceValido(c){try{return!!c&&typeof c==="object"&&JSON.stringify(c).length<2000;}catch(e){return false;}}
  async function senal(m){
    if(!ctx||!m||typeof m!=="object")return;
    const yo=ctx.pid(),remoto=m.from;
    if(!PID_OK.test(String(remoto||""))||remoto===yo)return;
    if(!ctx.jugadores().some(p=>p.pid===remoto)&&m.type!=="voice_bye")return;
    if(m.to==="all"){
      if(m.type==="voice_hello"){if(!activa)return;await asegurarPeer(remoto);if(inicioYo(remoto))ofertar(remoto);}
      else if(m.type==="voice_bye")cerrarPeer(remoto);
      return;
    }
    if(m.to!==yo)return;
    if(m.type==="offer"&&sdpValido(m.sdp)){
      const pc=await asegurarPeer(remoto);if(!pc)return;
      try{
        if(pc.signalingState!=="stable")await pc.setLocalDescription({type:"rollback"}).catch(()=>{});
        await pc.setRemoteDescription(m.sdp);
        await pc.setLocalDescription(await pc.createAnswer());
        enviar(remoto,{type:"answer",sdp:pc.localDescription});
        const cola=iceEnEspera.get(remoto)||[];iceEnEspera.delete(remoto);
        for(const c of cola){try{await pc.addIceCandidate(c);}catch(e){}}
      }catch(e){estado("Error negociando el audio.",true);}
    }else if(m.type==="answer"&&sdpValido(m.sdp)){
      const pc=peers.get(remoto);
      try{if(pc?.signalingState==="have-local-offer")await pc.setRemoteDescription(m.sdp);}catch(e){}
    }else if(m.type==="ice"&&iceValido(m.candidate)){
      const pc=peers.get(remoto);
      if(pc?.remoteDescription){try{await pc.addIceCandidate(m.candidate);}catch(e){}}
      else{const q=iceEnEspera.get(remoto)||[];if(q.length<60)q.push(m.candidate);iceEnEspera.set(remoto,q);}
    }else if(m.type==="voice_hello"){if(activa){await asegurarPeer(remoto);if(inicioYo(remoto))ofertar(remoto);}}
    else if(m.type==="voice_bye")cerrarPeer(remoto);
  }
  function cerrarPeer(remoto){
    const pc=peers.get(remoto);if(pc){try{pc.close();}catch(e){}peers.delete(remoto);}
    const a=audios.get(remoto);if(a){try{a.pause();}catch(e){}a.remove();audios.delete(remoto);}
    estados.delete(remoto);iceEnEspera.delete(remoto);render();
  }
  function cerrarTodos(){[...peers.keys()].forEach(cerrarPeer);}
  async function reiniciarPeer(remoto){
    cerrarPeer(remoto);await new Promise(r=>setTimeout(r,500));
    if(!activa)return;await asegurarPeer(remoto);if(inicioYo(remoto))ofertar(remoto);
  }
  function saludar(){
    const mq=ctx?.mq();if(!activa||!mq?.connected)return;
    try{mq.publish(ctx.base()+"/rtc/all",JSON.stringify({from:ctx.pid(),to:"all",type:"voice_hello"}));}catch(e){}
  }
  async function unirse(){
    if(!ctx)return;
    try{
      await asegurarStream();
      if(typeof ctx.alActivar==="function")ctx.alActivar();
      // Reconectar = avisar baja, cerrar y renegociar con todos desde cero.
      const mq=ctx.mq();
      if(peers.size&&mq?.connected){try{mq.publish(ctx.base()+"/rtc/all",JSON.stringify({from:ctx.pid(),to:"all",type:"voice_bye"}));}catch(e){}}
      cerrarTodos();saludar();
      for(const p of ctx.jugadores())if(p.pid!==ctx.pid()){await asegurarPeer(p.pid);if(inicioYo(p.pid))ofertar(p.pid);}
      ctx.marcarListo(true);estado("Conectando voz…");render();
    }catch(e){estado(e.message||"No se pudo activar el micrófono.",true);ctx.aviso("No se pudo activar la voz online. "+(e.message||""));}
  }
  function sincronizar(){
    if(!ctx)return;render();
    if(!activa)return;
    const validos=new Set(ctx.jugadores().map(p=>p.pid).filter(x=>x!==ctx.pid()));
    for(const r of[...peers.keys()])if(!validos.has(r))cerrarPeer(r);
    for(const r of validos)if(!peers.has(r))asegurarPeer(r).then(()=>{if(inicioYo(r))ofertar(r);});
  }
  function salir(){
    const mq=ctx?.mq();
    if(mq?.connected&&ctx.sala()){try{mq.publish(ctx.base()+"/rtc/all",JSON.stringify({from:ctx.pid(),to:"all",type:"voice_bye"}));}catch(e){}}
    cerrarTodos();
    if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}
    activa=false;silenciado=false;botones();
  }
  function iniciar(c){ctx=c;botones();render();}
  function desvincular(){salir();ctx=null;}
  return{iniciar,desvincular,unirse,salir,alternarSilencio,senal,sincronizar,saludar,render,activa:()=>activa,stream:()=>stream?.active?stream:null};
})();
window.ContraRelojVoz=ContraRelojVoz;
