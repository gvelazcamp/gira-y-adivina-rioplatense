/* Trabalenguas contra reloj: un solo celular que se pasa. Al de turno le sale
   un trabalenguas y lo tiene que decir en voz alta, rápido y sin trabarse,
   antes de que se acabe el tiempo (o toca "Terminé"). Se graba para que el
   jurado (los demás) lo escuche de nuevo y vote 👍/👎: mayoría (empate vale).
   Si vale suma según el nivel (1, 2 o 3) y +1 si fue rapidísimo. Cada vuelta
   sube el nivel. Pantalla fija (PantallaFija). Datos en gya_trabalenguas. */
const Trabalenguas=(()=>{
  const CLAVE="gya_trabalenguas",VUELTAS=[2,3,5];
  const ANDROID=/Android/i.test(navigator.userAgent||"");
  const GRABA=!!(window.MediaRecorder&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);
  const COLORES=["#E5197C","#1F6FB2","#1E9B7A","#F5B301","#7B3FE4","#FF6B3D","#00A8B5","#C2185B","#5C6BC0","#43A047","#8D6E63","#EC407A"];
  let raiz=null,est={cant:3,nombres:[]},vueltas=3,partidas=0;
  let pts=[],turno=0,jugados=0,mazos={},actual=null,limite=10,inicio=0,dijo=0,fin=0,timer=0,jugando=false,bloqueo=0,votos={};
  let ronda=0,volMax=0,grab=null,flujo=null,audioURL="",audio=null,medidor=null;
  function cargar(){try{const d=JSON.parse(localStorage.getItem(CLAVE));if(d&&typeof d==="object"){est.cant=Math.min(12,Math.max(2,Number(d.cant)||3));est.nombres=Array.isArray(d.nombres)?d.nombres.map(String):[];if(VUELTAS.includes(d.vueltas))vueltas=d.vueltas;partidas=Number(d.partidas)||0;}}catch(e){}}
  function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify({cant:est.cant,nombres:est.nombres,vueltas,partidas}));}catch(e){}}
  cargar();
  const q=id=>raiz.querySelector("#"+id);
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
  const nom=i=>PantallaFija.nombreJugador(est,i);
  const mezclar=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const sonar=(f,d,t,v)=>{if(typeof bip==="function")bip(f,d,t,v);};
  const vib=p=>{if(typeof vibrar==="function")vibrar(p);};
  const iniciales=i=>nom(i).split(" ").map(x=>x[0]||"").join("").slice(0,2).toUpperCase();
  const ficha=(i,extra="")=>`<span class="kar-ficha ${extra}" style="--c:${COLORES[i%COLORES.length]}"><i>${esc(iniciales(i))}</i><b>${esc(nom(i))}</b><em>${pts[i]||0}</em></span>`;
  const marcador=()=>`<div class="kar-marcador">${pts.map((_,i)=>ficha(i,i===turno?"activa":"")).join("")}</div>`;
  const vuelta=()=>Math.floor(jugados/est.cant)+1;
  const nivel=()=>Math.min(3,1+Math.floor((vuelta()-1)*3/vueltas));
  const NIV=["","🙂 Nivel 1","😬 Nivel 2","🔥 Nivel 3"];
  const seg=ms=>(ms/1000).toFixed(1).replace(".",",");

  function abrir(contenedor){salir();cargar();raiz=document.createElement("section");raiz.className="tra";contenedor.appendChild(raiz);PantallaFija.entrar();configurar();}
  function configurar(){
    parar();PantallaFija.desactivar();
    raiz.innerHTML=`<div class="mg-panel imp-panel kar-panel"><h3>👅 Trabalenguas contra reloj</h3>
      <p>Te sale un trabalenguas y lo tenés que decir <b>en voz alta, rápido y sin trabarte</b> antes de que se acabe el tiempo. El jurado (los demás) vota si valió.${GRABA?" Se graba, así se escuchan de nuevo… y se ríen.":""}</p>
      <div class="qs-sub">👥 Jugadores</div><div id="traJug"></div>
      <div class="qs-sub">🔁 Vueltas (cada vuelta, más difícil)</div>
      <div class="qns-rangos" id="traV">${VUELTAS.map(t=>`<button type="button" data-v="${t}">${t} vueltas</button>`).join("")}</div>
      <p class="kar-ayuda">Vale <b>1, 2 o 3</b> puntos según el nivel, y <b>+1</b> si lo dijiste rapidísimo.</p>
      <button type="button" class="mg-principal" id="traEmpezar">👅 Empezar</button>
      <button type="button" id="traWpp">💬 Invitar por WhatsApp</button></div>`;
    PantallaFija.editorJugadores(q("traJug"),est,{min:2,max:12,alCambiar:guardar});
    const pintar=()=>raiz.querySelectorAll("#traV button").forEach(b=>b.classList.toggle("activo",Number(b.dataset.v)===vueltas));pintar();
    q("traV").onclick=e=>{const b=e.target.closest("button[data-v]");if(b){vueltas=Number(b.dataset.v);guardar();pintar();}};
    q("traEmpezar").onclick=empezar;
    q("traWpp").onclick=()=>PantallaFija.invitar("trabalenguas","Trabalenguas contra reloj");
  }
  function empezar(){
    const todas=window.TRABALENGUAS||[];mazos={};
    [1,2,3].forEach(n=>{const l=todas.filter(d=>d.n===n),libres=Vistas.filtrar("trabalenguas",l,d=>d.t);mazos[n]=mezclar(libres).concat(mezclar(l.filter(d=>!libres.includes(d))));});
    pts=Array(est.cant).fill(0);turno=0;jugados=0;PantallaFija.activar();previa();
  }
  function pantalla(html,clase=""){raiz.innerHTML=`<div class="qns-pantalla kar-escena tra-escena ${clase}"><button type="button" class="pf-salir" id="traSalir">✕ Salir</button>${html}</div>`;PantallaFija.confirmar(q("traSalir"),configurar);}
  function previa(){
    pantalla(`<div class="kar-centro">
      <div class="kar-vuelta">Vuelta ${vuelta()} de ${vueltas} · ${NIV[nivel()]}</div>
      <div class="kar-turno" style="--c:${COLORES[turno%COLORES.length]}"><i>${esc(iniciales(turno))}</i></div>
      <div class="kar-le">Le toca a</div><div class="kar-nombre">${esc(nom(turno))}</div>
      <p class="kar-ayuda">Cuando toques el botón aparece el trabalenguas y arranca el reloj. Decilo en voz alta, rápido y sin trabarte.</p>
      <button type="button" class="kar-mic" id="traListo" aria-label="Empezar"><span>👅</span></button>
      ${marcador()}</div>`);
    q("traListo").onclick=jugar;
  }
  function jugar(){
    const n=nivel(),m=mazos[n]||[];if(!m.length)return;
    actual=m.shift();m.push(actual);Vistas.marcar("trabalenguas",actual.t);
    const palabras=actual.t.split(/\s+/).length;limite=Math.ceil(palabras*0.6)+3;
    jugando=true;bloqueo=Date.now()+700;inicio=Date.now();fin=inicio+limite*1000;dijo=0;
    const C=2*Math.PI*54;
    pantalla(`<div class="kar-centro">
      <div class="kar-le">👅 ${esc(nom(turno))} · ${NIV[n]} · ¡en voz alta!</div>
      <div class="tra-texto">${esc(actual.t)}</div>
      <div class="kar-reloj"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" class="kar-aro"/><circle cx="60" cy="60" r="54" class="kar-avance" id="traAro" style="stroke-dasharray:${C};stroke-dashoffset:0"/></svg><b id="traReloj">${limite}</b></div>
      ${GRABA?`<div class="kar-oido">🔴 Grabando…</div>`:""}
      <button type="button" class="bb-pasar mim-ok kar-termine" id="traFin">✋ ¡Terminé!</button></div>`,"cantando");
    q("traFin").addEventListener("pointerdown",e=>{e.preventDefault();if(Date.now()>=bloqueo)terminar(false);});
    audioURL&&URL.revokeObjectURL(audioURL);audioURL="";ronda++;
    if(GRABA){prenderMedidor();grabarAudio();}
    reloj();
  }
  function reloj(){
    if(!raiz||!jugando)return;
    const quedan=Math.max(0,fin-Date.now()),r=Math.ceil(quedan/1000),el=q("traReloj"),aro=q("traAro");
    if(aro){const C=2*Math.PI*54;aro.style.strokeDashoffset=String(C*(1-quedan/(limite*1000)));aro.classList.toggle("urgente",r<=3);}
    if(el&&el.textContent!==String(r)){el.textContent=r;if(r<=3&&r>0)vib(20);}
    if(quedan<=0){terminar(true);return;}
    timer=setTimeout(reloj,100);
  }
  /* Grabación (igual que Canta la Canción): para escucharlo de nuevo. */
  function prenderMedidor(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!medidor)medidor=new AC();if(medidor.state==="suspended")medidor.resume();}catch(e){}}
  function grabarAudio(){
    const trozos=[],mia=ronda;
    navigator.mediaDevices.getUserMedia({audio:true}).then(st=>{
      if(!jugando||mia!==ronda){st.getTracks().forEach(t=>t.stop());return;}
      flujo=st;try{grab=new MediaRecorder(st);}catch(e){st.getTracks().forEach(t=>t.stop());flujo=null;return;}
      grab.ondataavailable=e=>{if(e.data&&e.data.size)trozos.push(e.data);};
      volMax=0;medirVolumen(st);
      grab.onstop=()=>{if(mia!==ronda||!(trozos.length&&volMax>=0.01))return;
        audioURL=URL.createObjectURL(new Blob(trozos,{type:trozos[0].type||"audio/webm"}));
        const b=raiz&&raiz.querySelector("#traOir");if(b)b.hidden=false;};
      grab.start();
    }).catch(()=>{});
  }
  function medirVolumen(st){
    try{if(!medidor||medidor.state!=="running"){volMax=1;return;}
      const fuente=medidor.createMediaStreamSource(st),an=medidor.createAnalyser();an.fftSize=1024;fuente.connect(an);
      const datos=new Float32Array(an.fftSize);
      const paso=()=>{if(!flujo){try{fuente.disconnect();}catch(e){}return;}an.getFloatTimeDomainData(datos);let m=0;for(const v of datos)m=Math.max(m,Math.abs(v));volMax=Math.max(volMax,m);setTimeout(paso,150);};paso();
    }catch(e){volMax=1;}
  }
  function pararGrabacion(){try{if(grab&&grab.state!=="inactive")grab.stop();}catch(e){}grab=null;if(flujo){flujo.getTracks().forEach(t=>t.stop());flujo=null;}}
  const botonOir=()=>`<button type="button" class="kar-oir" id="traOir" ${audioURL?"":"hidden"}>▶ Escuchar de nuevo</button>`;
  const activarOir=()=>{const b=raiz.querySelector("#traOir");if(b)b.onclick=()=>{if(!audioURL)return;if(audio)audio.pause();audio=new Audio(audioURL);audio.play().catch(()=>{});};};
  function terminar(porTiempo){
    if(!jugando)return;
    jugando=false;clearTimeout(timer);pararGrabacion();dijo=Date.now()-inicio;
    if(porTiempo){
      setTimeout(()=>{if(typeof sonidoErrorExt==="function")sonidoErrorExt();vib([60,40,60]);},ANDROID?150:0);
      resultado(false,`⏰ ¡Se le acabó el tiempo!`,"No llegó a decirlo en "+limite+" segundos.");return;
    }
    setTimeout(()=>{sonar(523,.12);setTimeout(()=>sonar(392,.2),140);},ANDROID?150:0);
    votos={};
    const jueces=pts.map((_,i)=>i).filter(i=>i!==turno);
    pantalla(`<div class="kar-centro">
      <div class="kar-vuelta">Vuelta ${vuelta()} de ${vueltas} · ${NIV[nivel()]}</div>
      <div class="kar-veredicto">🧑‍⚖️ ¿Vale?</div>
      <div class="kar-le">${esc(nom(turno))} lo dijo en <b>${seg(dijo)} s</b> (tenía ${limite})</div>
      <div class="tra-texto chico">${esc(actual.t)}</div>
      ${botonOir()}
      <div class="kar-le">Jurado: ¿lo dijo completo y sin trabarse?</div>
      <div class="kar-jurado">${jueces.map(i=>`<div class="kar-juez" data-i="${i}" style="--c:${COLORES[i%COLORES.length]}"><i>${esc(iniciales(i))}</i><b>${esc(nom(i))}</b><button type="button" data-v="1">👍</button><button type="button" data-v="0">👎</button></div>`).join("")}</div>
      <p class="kar-ayuda">Cada uno del jurado toca 👍 o 👎. Cuando votan todos, sigue el juego (gana la mayoría; empate vale).</p>
      ${marcador()}</div>`);
    activarOir();
    raiz.querySelectorAll(".kar-juez button").forEach(b=>b.onclick=()=>{
      const j=b.closest(".kar-juez"),i=Number(j.dataset.i);votos[i]=b.dataset.v==="1";
      j.querySelectorAll("button").forEach(x=>x.classList.toggle("activo",x===b));
      if(Object.keys(votos).length===jueces.length)setTimeout(()=>{if(raiz&&raiz.querySelector(".kar-jurado"))veredicto();},450);
    });
  }
  function veredicto(){
    const v=Object.values(votos),si=v.filter(Boolean).length,ok=si>=v.length-si;
    if(ok){const rapido=dijo<=limite*600;const p=nivel()+(rapido?1:0);pts[turno]+=p;
      sonar(660,.15,"sine",.07);sonar(990,.25,"triangle",.05);vib(40);
      resultado(true,"👅 ¡Vale!",`El jurado votó ${si} 👍 · ${v.length-si} 👎. <b>${esc(nom(turno))}</b> suma <b>${p}</b> ${p===1?"punto":"puntos"}${rapido?" (⚡ +1 por rapidísimo)":""}.`,true);}
    else{if(typeof sonidoErrorExt==="function")sonidoErrorExt();vib([60,40,60]);
      resultado(false,"✘ No vale",`El jurado votó ${si} 👍 · ${v.length-si} 👎. <b>${esc(nom(turno))}</b> no suma.`,true);}
  }
  function resultado(ok,titulo,texto,yaVoto){
    jugados++;
    const ultimo=jugados>=est.cant*vueltas;
    pantalla(`<div class="kar-centro">
      <div class="kar-veredicto ${ok?"bien":"mal"}">${titulo}</div>
      <div class="tra-texto chico">${esc(actual.t)}</div>
      <p class="kar-ayuda">${texto}</p>
      ${yaVoto?"":botonOir()}
      ${marcador()}
      <button type="button" class="bb-pasar" id="traSig">${ultimo?"🏆 Ver ganador":"Siguiente ➜"}</button></div>`,ok?"festeja":"");
    if(!yaVoto)activarOir();
    q("traSig").onclick=()=>{if(audio){audio.pause();audio=null;}if(ultimo){ganador();return;}turno=(turno+1)%est.cant;previa();};
  }
  function ganador(){
    partidas++;guardar();
    const orden=pts.map((p,i)=>[i,p]).sort((a,b)=>b[1]-a[1]);
    const top=orden[0][1],ganan=orden.filter(o=>o[1]===top).map(o=>nom(o[0]));
    [523,659,784,1047].forEach((f,i)=>setTimeout(()=>sonar(f,.22,"triangle",.05),i*140));
    pantalla(`<div class="kar-centro">
      <div class="kar-veredicto bien">🏆 ${ganan.length>1?"¡Empate!":"¡Ganó!"}</div>
      <div class="kar-nombre">${esc(ganan.join(" y "))}</div>
      <ol class="kar-podio">${orden.map(([i,p],k)=>`<li style="--c:${COLORES[i%COLORES.length]}"><span>${k+1}</span><i>${esc(iniciales(i))}</i><b>${esc(nom(i))}</b><em>${p} ${p===1?"punto":"puntos"}</em></li>`).join("")}</ol>
      <button type="button" class="bb-pasar" id="traRevancha">🔄 Revancha</button>
      <button type="button" class="bb-pasar imp-gris" id="traCambiar">⚙️ Cambiar jugadores</button></div>`,"festeja");
    q("traRevancha").onclick=empezar;q("traCambiar").onclick=configurar;
  }
  function parar(){jugando=false;clearTimeout(timer);pararGrabacion();if(audio){audio.pause();audio=null;}}
  function salir(){parar();if(raiz)PantallaFija.salir();if(raiz)raiz.remove();raiz=null;}
  return{abrir,salir,partidasJugadas:()=>{cargar();return partidas;}};
})();
window.Trabalenguas=Trabalenguas;
