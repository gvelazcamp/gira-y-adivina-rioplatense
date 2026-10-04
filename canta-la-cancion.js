/* Canta la Canción (karaoke): aparece una palabra y el jugador de turno
   tiene que cantar un pedacito de una canción que la tenga antes de que se
   acabe el tiempo. Árbitro por voz (SpeechRecognition): si en lo que canta
   aparece la palabra dentro de una frase (MIN_PAL palabras o más; decir la
   palabra sola no vale), suena el acierto y suma 1 punto (los demás pueden
   anularlo con "No valió"); si se acaba el
   tiempo, suena el error. Sin voz (o si falla), los demás marcan a mano.
   Se juegan N vueltas y gana el que suma más. En Android, mientras el
   micrófono escucha, la página no hace sonidos (cortan la escucha): el
   tic-tac va con vibración. Pantalla fija (PantallaFija). Datos en gya_canta. */
const CantaLaCancion=(()=>{
  const CLAVE="gya_canta",TIEMPOS=[15,20,30],VUELTAS=[2,3,5],MIN_PAL=5;
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const ANDROID=/Android/i.test(navigator.userAgent||"");
  let raiz=null,est={cant:3,nombres:[]},tiempo=20,vueltas=3,conVoz=!!SR,partidas=0;
  let pts=[],turno=0,jugados=0,mazo=[],idx=0,palabra="",fin=0,timer=0,jugando=false,bloqueo=0,voz=null,oidoTxt="",porVoz=false;
  function cargar(){try{const d=JSON.parse(localStorage.getItem(CLAVE));if(d&&typeof d==="object"){est.cant=Math.min(12,Math.max(2,Number(d.cant)||3));est.nombres=Array.isArray(d.nombres)?d.nombres.map(String):[];if(TIEMPOS.includes(d.tiempo))tiempo=d.tiempo;if(VUELTAS.includes(d.vueltas))vueltas=d.vueltas;if(SR&&typeof d.voz==="boolean")conVoz=d.voz;partidas=Number(d.partidas)||0;}}catch(e){}}
  function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify({cant:est.cant,nombres:est.nombres,tiempo,vueltas,voz:conVoz,partidas}));}catch(e){}}
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
      <p>Sale una palabra y tenés que <b>cantar un pedacito de una canción</b> que la tenga. ${SR?"El celular te escucha: tenés que cantar <b>una frase entera</b> con la palabra (decirla sola no vale). Si alguien hace trampa, los demás la anulan.":"Los demás deciden si la cantaste."}</p>
      <div class="qs-sub">👥 Jugadores</div><div id="ctaJug"></div>
      <div class="qs-sub">⏱️ Tiempo para cantar</div>
      <div class="qns-rangos" id="ctaT">${TIEMPOS.map(t=>`<button type="button" data-v="${t}">${t} s</button>`).join("")}</div>
      <div class="qs-sub">🔁 Vueltas</div>
      <div class="qns-rangos" id="ctaV">${VUELTAS.map(t=>`<button type="button" data-v="${t}">${t} vueltas</button>`).join("")}</div>
      ${SR?`<button type="button" class="bb-voz" id="ctaVoz"></button>`:""}
      <button type="button" class="mg-principal" id="ctaEmpezar">🎤 Empezar</button>
      <button type="button" id="ctaWpp">💬 Invitar por WhatsApp</button></div>`;
    PantallaFija.editorJugadores(q("ctaJug"),est,{min:2,max:12,alCambiar:guardar});
    const pintar=()=>{
      raiz.querySelectorAll("#ctaT button").forEach(b=>b.classList.toggle("activo",Number(b.dataset.v)===tiempo));
      raiz.querySelectorAll("#ctaV button").forEach(b=>b.classList.toggle("activo",Number(b.dataset.v)===vueltas));
      const bv=raiz.querySelector("#ctaVoz");if(bv)bv.innerHTML=conVoz?"🎤 Árbitro por voz: <b>SÍ</b><small>El celular escucha y decide solo</small>":"🎤 Árbitro por voz: <b>NO</b><small>Los demás tocan si la cantó o no</small>";
    };pintar();
    q("ctaT").onclick=e=>{const b=e.target.closest("button[data-v]");if(b){tiempo=Number(b.dataset.v);guardar();pintar();}};
    q("ctaV").onclick=e=>{const b=e.target.closest("button[data-v]");if(b){vueltas=Number(b.dataset.v);guardar();pintar();}};
    const bv=raiz.querySelector("#ctaVoz");if(bv)bv.onclick=()=>{conVoz=!conVoz;guardar();pintar();};
    q("ctaEmpezar").onclick=empezar;
    q("ctaWpp").onclick=()=>PantallaFija.invitar("canta-la-cancion","Canta la Canción");
  }
  function empezar(){
    const todas=window.CANTA_PALABRAS||[];const libres=Vistas.filtrar("canta",todas,x=>x);
    mazo=mezclar(libres).concat(mezclar(todas.filter(x=>!libres.includes(x))));idx=0;
    pts=Array(est.cant).fill(0);turno=0;jugados=0;
    PantallaFija.activar();previa();
  }
  function pantalla(html,clase=""){raiz.innerHTML=`<div class="qns-pantalla kar-escena ${clase}"><button type="button" class="pf-salir" id="ctaSalir">✕ Salir</button>${html}</div>`;PantallaFija.confirmar(q("ctaSalir"),configurar);}
  const marcador=()=>`<div class="kar-marcador">${pts.map((_,i)=>ficha(i,i===turno?"activa":"")).join("")}</div>`;
  function previa(){
    const vuelta=Math.floor(jugados/est.cant)+1;
    pantalla(`<div class="kar-centro">
      <div class="kar-vuelta">Vuelta ${vuelta} de ${vueltas}</div>
      <div class="kar-turno" style="--c:${COLORES[turno%COLORES.length]}"><i>${esc(iniciales(turno))}</i></div>
      <div class="kar-le">Le toca cantar a</div><div class="kar-nombre">${esc(nom(turno))}</div>
      <p class="kar-ayuda">${conVoz?"Tocá el micrófono y cantá <b>una frase entera</b> de la canción: decir la palabra sola no vale.":"Tocá cuando estés listo."} Tenés <b>${tiempo} s</b>.</p>
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
      ${conVoz?`<div class="kar-eq" id="ctaEq"><i></i><i></i><i></i><i></i><i></i></div><div class="kar-oido" id="ctaOido">Escuchando… cantá la frase entera</div>`:""}
      <div class="kar-btns ${conVoz?"chicos":""}"><button type="button" class="bb-pasar imp-gris" id="ctaNo">✘ No pudo</button><button type="button" class="bb-pasar mim-ok" id="ctaSi">✔ La cantó</button></div></div>`,"cantando");
    porVoz=false;
    q("ctaNo").addEventListener("pointerdown",e=>{e.preventDefault();responder(false);});
    q("ctaSi").addEventListener("pointerdown",e=>{e.preventDefault();responder(true);});
    fin=Date.now()+tiempo*1000;
    if(conVoz)escuchar();
    reloj();
  }
  /* Árbitro por voz: es acierto si la palabra aparece y se cantó una frase
     (MIN_PAL palabras o más en lo escuchado). La palabra sola no alcanza. */
  function escuchar(){
    if(!SR||voz)return;
    try{voz=new SR();}catch(e){voz=null;return;}
    voz.lang="es-UY";voz.continuous=true;voz.interimResults=true;voz.maxAlternatives=3;
    const meta=N(palabra),metas=[meta,meta+"s",meta+"es"];
    voz.onresult=e=>{
      if(!jugando)return;
      let txt="";for(let i=0;i<e.results.length;i++){for(let a=0;a<e.results[i].length;a++)txt+=" "+e.results[i][a].transcript;}
      const n=" "+N(txt)+" ";
      let prin="";for(let i=0;i<e.results.length;i++)prin+=" "+e.results[i][0].transcript;
      const cant=N(prin).split(" ").filter(Boolean).length;
      const ult=N(e.results[e.results.length-1][0].transcript).split(" ").slice(-5).join(" ");
      const esta=metas.some(m=>n.includes(" "+m+" "));
      const o=raiz&&raiz.querySelector("#ctaOido");if(o&&ult)o.textContent=esta&&cant<MIN_PAL?"🎶 "+ult+" … ¡seguí cantando la frase!":"🎶 "+ult;
      if(esta&&cant>=MIN_PAL){porVoz=true;responder(true);}
    };
    voz.onerror=e=>{const err=e&&e.error||"";const o=raiz&&raiz.querySelector("#ctaOido");
      if(err==="not-allowed"||err==="service-not-allowed"){if(o)o.textContent="🎤 Sin permiso de micrófono: marquen a mano";pararVoz();}
      else if(err==="network"){if(o)o.textContent="🎤 Sin internet para escuchar: marquen a mano";}
      else if(err==="language-not-supported"&&voz)voz.lang=voz.lang==="es-UY"?"es-AR":"es-ES";};
    voz.onend=()=>{if(jugando&&voz)setTimeout(()=>{if(jugando&&voz)try{voz.start();}catch(e){}},250);};
    try{voz.start();}catch(e){voz=null;}
  }
  function pararVoz(){if(voz){try{voz.onend=null;voz.abort();}catch(e){}voz=null;}const eq=raiz&&raiz.querySelector("#ctaEq");if(eq)eq.classList.add("quieto");}
  function reloj(){
    if(!raiz||!jugando)return;
    const quedan=Math.max(0,fin-Date.now()),r=Math.ceil(quedan/1000),el=q("ctaReloj"),aro=q("ctaAro");
    if(aro){const C=2*Math.PI*54;aro.style.strokeDashoffset=String(C*(1-quedan/(tiempo*1000)));aro.classList.toggle("urgente",r<=5);}
    if(el&&el.textContent!==String(r)){el.textContent=r;if(r<=5&&r>0){if(voz&&ANDROID){if(typeof vibrar==="function")vibrar(20);}else sonar(880,.07);}}
    if(quedan<=0){responder(false,true);return;}
    timer=setTimeout(reloj,100);
  }
  function responder(ok,porTiempo){
    if(!jugando||(!porTiempo&&Date.now()<bloqueo))return;
    jugando=false;clearTimeout(timer);pararVoz();
    /* Un instante después de cortar el micrófono, para que el sonido se oiga (Android). */
    setTimeout(()=>{
      if(ok){sonar(660,.15,"sine",.07);sonar(990,.25,"triangle",.05);if(typeof vibrar==="function")vibrar(40);}
      else{if(typeof sonidoErrorExt==="function")sonidoErrorExt();if(typeof vibrar==="function")vibrar([60,40,60]);}
    },ANDROID?150:0);
    if(ok)pts[turno]++;
    jugados++;
    const ultimo=jugados>=est.cant*vueltas;
    pantalla(`<div class="kar-centro">
      <div class="kar-veredicto ${ok?"bien":"mal"}">${ok?"🎶 ¡La cantó!":porTiempo?"⏰ ¡Se acabó el tiempo!":"✘ No pudo"}</div>
      <div class="kar-le">La palabra era</div><div class="kar-cartel chico"><span>${esc(palabra)}</span></div>
      ${ok?`<p class="kar-ayuda" id="ctaSuma"><b>${esc(nom(turno))}</b> suma 1 punto.</p>`:""}
      ${ok&&porVoz?`<button type="button" class="kar-anular" id="ctaAnular">✘ No valió (no era una canción)</button>`:""}
      ${marcador()}
      <button type="button" class="bb-pasar" id="ctaSig">${ultimo?"🏆 Ver ganador":"Siguiente ➜"}</button></div>`,ok?"festeja":"");
    q("ctaSig").onclick=()=>{if(ultimo){ganador();return;}turno=(turno+1)%est.cant;previa();};
    const an=raiz.querySelector("#ctaAnular");
    if(an)an.onclick=()=>{pts[turno]=Math.max(0,pts[turno]-1);porVoz=false;if(typeof sonidoErrorExt==="function")sonidoErrorExt();if(typeof vibrar==="function")vibrar([60,40,60]);
      an.remove();const v=raiz.querySelector(".kar-veredicto");if(v){v.className="kar-veredicto mal";v.textContent="✘ No valió";}
      const su=q("ctaSuma");if(su)su.innerHTML="Los demás la anularon: <b>no suma</b>.";const m=raiz.querySelector(".kar-marcador");if(m)m.outerHTML=marcador();
      const esc_=raiz.querySelector(".kar-escena");if(esc_)esc_.classList.remove("festeja");};
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
  function parar(){jugando=false;clearTimeout(timer);pararVoz();}
  function salir(){parar();if(raiz)PantallaFija.salir();if(raiz)raiz.remove();raiz=null;}
  return{abrir,salir,partidasJugadas:()=>{cargar();return partidas;}};
})();
window.CantaLaCancion=CantaLaCancion;
