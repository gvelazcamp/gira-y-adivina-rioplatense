/* Canta la Canción (karaoke): aparece una palabra y el jugador de turno
   canta un pedacito de una canción que la tenga hasta que se acaba el
   tiempo (o toca "Terminé"). Después el jurado (los demás) vota 👍/👎:
   mayoría (empate vale) suma 1 punto. Para ayudar al jurado se graba el canto
   (MediaRecorder) para escucharlo de nuevo o se muestra lo que entendió el
   reconocimiento de voz (se elige en el menú: en Android no andan las dos a
   la vez). Si la grabación sale muda (se mide el volumen) no se ofrece. Mientras se canta no
   hay sonidos (cortan el micrófono en Android): el tic-tac va con vibración.
   Se juegan N vueltas y gana el que suma más. Pantalla fija (PantallaFija). Datos en gya_canta. */
const CantaLaCancion=(()=>{
  const CLAVE="gya_canta",TIEMPOS=[15,20,30],VUELTAS=[2,3,5];
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const ANDROID=/Android/i.test(navigator.userAgent||"");
  const GRABA=!!(window.MediaRecorder&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);
  let raiz=null,est={cant:3,nombres:[]},tiempo=20,vueltas=3,jurado="audio",partidas=0;
  let pts=[],turno=0,jugados=0,mazo=[],idx=0,palabra="",fin=0,timer=0,jugando=false,bloqueo=0,voz=null,oidoTxt="",ronda=0,txtAudio="",estTxt="",pctTxt=0,oyendo=false,errVoz="",volMax=0,votos={},grab=null,flujo=null,audioURL="",audio=null,medidor=null;
  function cargar(){try{const d=JSON.parse(localStorage.getItem(CLAVE));if(d&&typeof d==="object"){est.cant=Math.min(12,Math.max(2,Number(d.cant)||3));est.nombres=Array.isArray(d.nombres)?d.nombres.map(String):[];if(TIEMPOS.includes(d.tiempo))tiempo=d.tiempo;if(VUELTAS.includes(d.vueltas))vueltas=d.vueltas;if(d.jurado2==="audio"||d.jurado2==="texto")jurado=d.jurado2;partidas=Number(d.partidas)||0;}}catch(e){}}
  function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify({cant:est.cant,nombres:est.nombres,tiempo,vueltas,jurado2:jurado,partidas}));}catch(e){}}
  cargar();
  const q=id=>raiz.querySelector("#"+id);
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
  const nom=i=>PantallaFija.nombreJugador(est,i);
  const N=t=>String(t||"").toLowerCase().replace(/ñ/g,"\u0001").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\u0001/g,"ñ").replace(/[^a-zñ0-9 ]+/g," ").replace(/\s+/g," ").trim();
  const mezclar=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const sonar=(f,d,t,v)=>{if(typeof bip==="function")bip(f,d,t,v);};
  const iniciales=i=>nom(i).split(" ").map(x=>x[0]||"").join("").slice(0,2).toUpperCase();
  const COLORES=["#E5197C","#1F6FB2","#1E9B7A","#F5B301","#7B3FE4","#FF6B3D","#00A8B5","#C2185B","#5C6BC0","#43A047","#8D6E63","#EC407A"];
  const ficha=(i,extra="")=>`<span class="kar-ficha ${extra}" style="--c:${COLORES[i%COLORES.length]}"><i>${esc(iniciales(i))}</i><b>${esc(nom(i))}</b><em>${pts[i]||0}</em></span>`;

  function abrir(contenedor){salir();cargar();raiz=document.createElement("section");raiz.className="kar";contenedor.appendChild(raiz);PantallaFija.entrar();configurar();}
  function configurar(){
    parar();PantallaFija.desactivar();
    raiz.innerHTML=`<div class="mg-panel imp-panel kar-panel"><h3>🎤 Canta la Canción</h3>
      <p>Sale una palabra y tenés que <b>cantar un pedacito de una canción</b> que la tenga. Cuando termina el tiempo, <b>el jurado</b> (los demás) vota si valió.</p>
      <div class="qs-sub">👥 Jugadores</div><div id="ctaJug"></div>
      <div class="qs-sub">⏱️ Tiempo para cantar</div>
      <div class="qns-rangos" id="ctaT">${TIEMPOS.map(t=>`<button type="button" data-v="${t}">${t} s</button>`).join("")}</div>
      <div class="qs-sub">🔁 Vueltas</div>
      <div class="qns-rangos" id="ctaV">${VUELTAS.map(t=>`<button type="button" data-v="${t}">${t} vueltas</button>`).join("")}</div>
      ${GRABA&&SR?`<div class="qs-sub">🧑‍⚖️ Qué ve el jurado</div>
      <div class="qns-rangos imp-dos" id="ctaJur"><button type="button" data-v="audio">🎙️ Audio + texto</button><button type="button" data-v="texto">📝 Solo texto</button></div>
      <p class="kar-ayuda" id="ctaJurTxt"></p>`:""}
      <button type="button" class="mg-principal" id="ctaEmpezar">🎤 Empezar</button>
      <button type="button" id="ctaWpp">💬 Invitar por WhatsApp</button></div>`;
    PantallaFija.editorJugadores(q("ctaJug"),est,{min:2,max:12,alCambiar:guardar});
    const pintar=()=>{
      raiz.querySelectorAll("#ctaT button").forEach(b=>b.classList.toggle("activo",Number(b.dataset.v)===tiempo));
      raiz.querySelectorAll("#ctaV button").forEach(b=>b.classList.toggle("activo",Number(b.dataset.v)===vueltas));
      raiz.querySelectorAll("#ctaJur button").forEach(b=>b.classList.toggle("activo",b.dataset.v===jurado));
      const jt=raiz.querySelector("#ctaJurTxt");if(jt)jt.textContent=jurado==="texto"?"El jurado lee lo que entendió el celular (al instante).":"Se graba: el jurado lo escucha de nuevo y, en unos segundos, lo lee. La primera vez baja unos 40 MB (mejor con wifi).";
    };pintar();
    q("ctaT").onclick=e=>{const b=e.target.closest("button[data-v]");if(b){tiempo=Number(b.dataset.v);guardar();pintar();}};
    q("ctaV").onclick=e=>{const b=e.target.closest("button[data-v]");if(b){vueltas=Number(b.dataset.v);guardar();pintar();}};
    const bj=raiz.querySelector("#ctaJur");if(bj)bj.onclick=e=>{const b=e.target.closest("button[data-v]");if(b){jurado=b.dataset.v;guardar();pintar();}};
    q("ctaEmpezar").onclick=empezar;
    q("ctaWpp").onclick=()=>PantallaFija.invitar("canta-la-cancion","Canta la Canción");
  }
  function empezar(){
    const todas=window.CANTA_PALABRAS||[];const libres=Vistas.filtrar("canta",todas,x=>x);
    mazo=mezclar(libres).concat(mezclar(todas.filter(x=>!libres.includes(x))));idx=0;
    pts=Array(est.cant).fill(0);turno=0;jugados=0;
    PantallaFija.activar();previa();
    if(conWhisper())VozATexto.precargar().catch(()=>{});
  }
  function pantalla(html,clase=""){raiz.innerHTML=`<div class="qns-pantalla kar-escena ${clase}"><button type="button" class="pf-salir" id="ctaSalir">✕ Salir</button>${html}</div>`;PantallaFija.confirmar(q("ctaSalir"),configurar);}
  const marcador=()=>`<div class="kar-marcador">${pts.map((_,i)=>ficha(i,i===turno?"activa":"")).join("")}</div>`;
  function previa(){
    const vuelta=Math.floor(jugados/est.cant)+1;
    pantalla(`<div class="kar-centro">
      <div class="kar-vuelta">Vuelta ${vuelta} de ${vueltas}</div>
      <div class="kar-turno" style="--c:${COLORES[turno%COLORES.length]}"><i>${esc(iniciales(turno))}</i></div>
      <div class="kar-le">Le toca cantar a</div><div class="kar-nombre">${esc(nom(turno))}</div>
      <p class="kar-ayuda">Tocá el micrófono y cantá un pedacito de una canción con la palabra. Tenés <b>${tiempo} s</b>; si terminás antes, tocá <b>Terminé</b>.</p>
      <button type="button" class="kar-mic" id="ctaListo" aria-label="Empezar a cantar"><span>🎤</span></button>
      ${marcador()}</div>`);
    q("ctaListo").onclick=jugar;
  }
  function jugar(){
    palabra=mazo[idx%mazo.length];idx++;Vistas.marcar("canta",palabra);jugando=true;bloqueo=Date.now()+700;oidoTxt="";
    const C=2*Math.PI*54;
    pantalla(`<div class="kar-centro">
      <div class="kar-le">🎤 ${esc(nom(turno))} · cantá una canción con</div>
      <div class="kar-cartel"><span>${esc(palabra)}</span></div>
      <div class="kar-reloj"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" class="kar-aro"/><circle cx="60" cy="60" r="54" class="kar-avance" id="ctaAro" style="stroke-dasharray:${C};stroke-dashoffset:0"/></svg><b id="ctaReloj">${tiempo}</b></div>
      <div class="kar-eq" id="ctaEq"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="kar-oido" id="ctaOido">${usaAudio()?"🔴 Grabando… cantá tranquilo hasta el final":"Cantá tranquilo hasta el final"}</div>
      <button type="button" class="bb-pasar imp-gris kar-termine" id="ctaFin">✋ Terminé</button></div>`,"cantando");
    q("ctaFin").addEventListener("pointerdown",e=>{e.preventDefault();if(Date.now()>=bloqueo)terminar();});
    fin=Date.now()+tiempo*1000;
    /* Audio o texto, no los dos: en Android la grabación deja sorda a la voz a texto. */
    oyendo=false;errVoz="";audioURL&&URL.revokeObjectURL(audioURL);audioURL="";ronda++;txtAudio="";pctTxt=0;estTxt=conWhisper()?"espera":"";
    if(usaAudio())grabarAudio();else if(SR)escuchar();
    reloj();
  }
  const usaAudio=()=>GRABA&&(jurado==="audio"||!SR);
  const conWhisper=()=>usaAudio()&&window.VozATexto&&VozATexto.disponible();
  /* Grabación del canto para que el jurado lo escuche de nuevo. */
  function grabarAudio(){
    audioURL&&URL.revokeObjectURL(audioURL);audioURL="";const trozos=[];
    navigator.mediaDevices.getUserMedia({audio:true}).then(st=>{
      if(!jugando){st.getTracks().forEach(t=>t.stop());return;}
      flujo=st;try{grab=new MediaRecorder(st);}catch(e){st.getTracks().forEach(t=>t.stop());flujo=null;return;}
      grab.ondataavailable=e=>{if(e.data&&e.data.size)trozos.push(e.data);};
      volMax=0;medirVolumen(st);
      const mia=ronda;
      grab.onstop=()=>{if(mia!==ronda)return;
        if(!(trozos.length&&volMax>=0.01)){estTxt=estTxt==="espera"?"vacio":estTxt;pintarLetra();return;}
        const blob=new Blob(trozos,{type:trozos[0].type||"audio/webm"});
        audioURL=URL.createObjectURL(blob);const b=raiz&&raiz.querySelector("#ctaOir");if(b)b.hidden=false;
        if(!conWhisper())return;
        estTxt="pasando";pintarLetra();
        VozATexto.transcribir(blob,p=>{if(mia===ronda){pctTxt=p;if(estTxt==="pasando"&&p<100){estTxt="bajando";}else if(p>=100&&estTxt==="bajando")estTxt="pasando";pintarLetra();}})
          .then(t=>{if(mia!==ronda)return;txtAudio=sinRepetir(t);estTxt=t?"listo":"nada";pintarLetra();})
          .catch(()=>{if(mia!==ronda)return;estTxt="error";pintarLetra();});
      };
      grab.start();
    }).catch(()=>{const o=raiz&&raiz.querySelector("#ctaOido");if(o)o.textContent="🎤 Sin permiso de micrófono: el jurado decide igual";});
  }
  /* Si otro (el reconocimiento de voz) se quedó con el micrófono, la grabación
     sale muda: se mide el volumen para no ofrecer un audio vacío. */
  function medirVolumen(st){
    try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC){volMax=1;return;}
      if(!medidor)medidor=new AC();if(medidor.state==="suspended")medidor.resume();
      const fuente=medidor.createMediaStreamSource(st),an=medidor.createAnalyser();an.fftSize=1024;fuente.connect(an);
      const datos=new Float32Array(an.fftSize);
      const paso=()=>{if(!flujo){try{fuente.disconnect();}catch(e){}return;}an.getFloatTimeDomainData(datos);let m=0;for(const v of datos)m=Math.max(m,Math.abs(v));volMax=Math.max(volMax,m);setTimeout(paso,150);};paso();
    }catch(e){volMax=1;}
  }
  function pararGrabacion(){try{if(grab&&grab.state!=="inactive")grab.stop();}catch(e){}grab=null;if(flujo){flujo.getTracks().forEach(t=>t.stop());flujo=null;}}
  /* Lo que el celular entiende se muestra al jurado (no decide nada). */
  function escuchar(){
    if(!SR||voz)return;
    try{voz=new SR();}catch(e){voz=null;return;}
    voz.lang="es-UY";voz.continuous=true;voz.interimResults=true;
    /* Android repite: cada resultado trae la frase entera hasta ahí
       ("recordar", "recordar todo", "recordar todo lo"…). Si un pedazo
       empieza con el anterior lo reemplaza; si ya estaba incluido, se saltea. */
    let previos=[];
    const unir=(lista,seg)=>{seg=seg.trim();if(!seg)return lista;const n=N(seg),u=lista.length?N(lista[lista.length-1]):"";
      if(u&&n.startsWith(u))lista[lista.length-1]=seg;else if(!(u&&u.startsWith(n)))lista.push(seg);return lista;};
    voz.onresult=e=>{
      if(!jugando)return;
      const segs=previos.slice();for(let i=0;i<e.results.length;i++)unir(segs,e.results[i][0].transcript);
      oidoTxt=sinRepetir(segs.join(" "));voz._segs=segs;
      const o=raiz&&raiz.querySelector("#ctaOido");if(o&&oidoTxt)o.textContent="🎶 "+oidoTxt.split(" ").slice(-6).join(" ");
    };
    voz.onerror=e=>{const err=e&&e.error||"";if(err&&err!=="no-speech")errVoz=err;if(err==="language-not-supported"&&voz)voz.lang=voz.lang==="es-UY"?"es-AR":"es-ES";else if(err==="not-allowed"||err==="service-not-allowed")pararVoz();};
    voz.onend=()=>{if(voz&&voz._segs)previos=voz._segs.slice();if(jugando&&voz)setTimeout(()=>{if(jugando&&voz)try{voz.start();}catch(e){}},250);};
    try{voz.start();oyendo=true;}catch(e){voz=null;errVoz="start";}
  }
  function pararVoz(){if(voz){try{voz.onend=null;voz.abort();}catch(e){}voz=null;}const eq=raiz&&raiz.querySelector("#ctaEq");if(eq)eq.classList.add("quieto");}
  function reloj(){
    if(!raiz||!jugando)return;
    const quedan=Math.max(0,fin-Date.now()),r=Math.ceil(quedan/1000),el=q("ctaReloj"),aro=q("ctaAro");
    if(aro){const C=2*Math.PI*54;aro.style.strokeDashoffset=String(C*(1-quedan/(tiempo*1000)));aro.classList.toggle("urgente",r<=5);}
    if(el&&el.textContent!==String(r)){el.textContent=r;if(r<=5&&r>0&&typeof vibrar==="function")vibrar(20);}
    if(quedan<=0){terminar();return;}
    timer=setTimeout(reloj,100);
  }
  /* Saca repeticiones de más (Whisper y Android a veces repiten en loop):
     una palabra o frase corta no puede aparecer más de 2 veces seguidas. */
  const sinRepetir=t=>{let w=String(t||"").replace(/\s+/g," ").trim().split(" ").filter(Boolean);
    for(let k=1;k<=4;k++){const r=[];let i=0;
      while(i<w.length){const g=w.slice(i,i+k).map(N).join(" ");let veces=1;
        while(i+k*(veces+1)<=w.length&&w.slice(i+k*veces,i+k*(veces+1)).map(N).join(" ")===g)veces++;
        if(veces>1){for(let v=0;v<Math.min(veces,2);v++)r.push(...w.slice(i+k*v,i+k*(v+1)));i+=k*veces;}
        else{r.push(w[i]);i++;}}
      w=r;}
    return w.join(" ");};
  const resaltar=t=>{const pal=N(palabra).split(" ").map(w=>w.replace(/[^a-zñ0-9]/g,"")).filter(Boolean);
    return esc(t).split(/(\s+)/).map(w=>pal.some(p=>N(w).startsWith(p)&&N(w).length<=p.length+2)?`<mark>${w}</mark>`:w).join("");};
  /* Caja "El celular escuchó" del jurado (texto en vivo o el de la grabación). */
  function pintarLetra(){
    const el=raiz&&raiz.querySelector("#ctaLetra");if(!el)return;
    let h;
    if(conWhisper())h=estTxt==="listo"?`“${resaltar(txtAudio)}”`:estTxt==="bajando"?`⏳ Bajando el traductor de voz… ${pctTxt}%<br><small>Solo la primera vez</small>`:estTxt==="pasando"||estTxt==="espera"?"⏳ Pasando a texto…":estTxt==="vacio"?"(no se grabó sonido)":estTxt==="error"?"(no se pudo pasar a texto: escuchen el audio)":"(no se entendió la letra: escuchen el audio)";
    else if(usaAudio()){el.hidden=true;return;}
    else h=oidoTxt?`“${resaltar(oidoTxt)}”`:!SR?"(este celular no permite pasar la voz a texto)":errVoz==="network"?"(sin internet para pasar la voz a texto)":errVoz==="not-allowed"||errVoz==="service-not-allowed"?"(sin permiso para pasar la voz a texto)":"(no llegó a entender la letra)";
    el.hidden=false;el.innerHTML=`<small>El celular escuchó:</small>${h}`;
  }
  /* Fin del canto: el jurado (los demás) vota si vale. */
  function terminar(){
    if(!jugando)return;
    jugando=false;clearTimeout(timer);pararVoz();pararGrabacion();
    setTimeout(()=>{sonar(523,.12);setTimeout(()=>sonar(392,.2),140);},ANDROID?150:0);
    votos={};
    const jueces=pts.map((_,i)=>i).filter(i=>i!==turno);
    pantalla(`<div class="kar-centro">
      <div class="kar-veredicto">🧑‍⚖️ ¿Vale?</div>
      <div class="kar-le">${esc(nom(turno))} tenía que cantar</div><div class="kar-cartel chico"><span>${esc(palabra)}</span></div>
      <button type="button" class="kar-oir" id="ctaOir" ${audioURL?"":"hidden"}>▶ Escuchar de nuevo</button>
      <div class="kar-letra" id="ctaLetra"></div>
      <div class="kar-le">Jurado: ¿era una canción con la palabra?</div>
      <div class="kar-jurado">${jueces.map(i=>`<div class="kar-juez" data-i="${i}" style="--c:${COLORES[i%COLORES.length]}"><i>${esc(iniciales(i))}</i><b>${esc(nom(i))}</b><button type="button" data-v="1">👍</button><button type="button" data-v="0">👎</button></div>`).join("")}</div>
      <p class="kar-ayuda">Gana la mayoría. Si hay empate, vale.</p></div>`);
    pintarLetra();
    q("ctaOir").onclick=()=>{if(!audioURL)return;if(audio){audio.pause();}audio=new Audio(audioURL);audio.play().catch(()=>{});};
    raiz.querySelectorAll(".kar-juez button").forEach(b=>b.onclick=()=>{
      const j=b.closest(".kar-juez"),i=Number(j.dataset.i);votos[i]=b.dataset.v==="1";
      j.querySelectorAll("button").forEach(x=>x.classList.toggle("activo",x===b));
      if(Object.keys(votos).length===jueces.length)setTimeout(()=>{if(raiz&&raiz.querySelector(".kar-jurado"))veredicto();},450);
    });
  }
  function veredicto(){
    if(audio){audio.pause();audio=null;}
    const v=Object.values(votos),si=v.filter(Boolean).length,ok=si>=v.length-si;
    if(ok){sonar(660,.15,"sine",.07);sonar(990,.25,"triangle",.05);if(typeof vibrar==="function")vibrar(40);pts[turno]++;}
    else{if(typeof sonidoErrorExt==="function")sonidoErrorExt();if(typeof vibrar==="function")vibrar([60,40,60]);}
    jugados++;
    const ultimo=jugados>=est.cant*vueltas;
    pantalla(`<div class="kar-centro">
      <div class="kar-veredicto ${ok?"bien":"mal"}">${ok?"🎶 ¡Vale!":"✘ No vale"}</div>
      <div class="kar-le">El jurado votó ${si} 👍 · ${v.length-si} 👎</div><div class="kar-cartel chico"><span>${esc(palabra)}</span></div>
      <p class="kar-ayuda"><b>${esc(nom(turno))}</b> ${ok?"suma 1 punto.":"no suma."}</p>
      ${marcador()}
      <button type="button" class="bb-pasar" id="ctaSig">${ultimo?"🏆 Ver ganador":"Siguiente ➜"}</button></div>`,ok?"festeja":"");
    q("ctaSig").onclick=()=>{if(ultimo){ganador();return;}turno=(turno+1)%est.cant;previa();};
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
      <button type="button" class="bb-pasar" id="ctaRevancha">🔄 Revancha</button>
      <button type="button" class="bb-pasar imp-gris" id="ctaCambiar">⚙️ Cambiar jugadores</button></div>`,"festeja");
    q("ctaRevancha").onclick=empezar;q("ctaCambiar").onclick=configurar;
  }
  function parar(){jugando=false;clearTimeout(timer);pararVoz();pararGrabacion();if(audio){audio.pause();audio=null;}}
  function salir(){parar();if(raiz)PantallaFija.salir();if(raiz)raiz.remove();raiz=null;}
  return{abrir,salir,partidasJugadas:()=>{cargar();return partidas;}};
})();
window.CantaLaCancion=CantaLaCancion;
