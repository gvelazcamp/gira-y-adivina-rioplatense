/* Tutti Frutti (Basta). Dos modos:
   - Sala (cada uno con su celular, MQTT "gyatutti/<SALA>", el anfitrión
     manda): a todos les sale la misma letra; completan las categorías una
     por una (tiene que empezar con la letra) y el primero que completa todo
     canta BASTA y gana la ronda. Después se ven las respuestas de todos.
     Invitación: ?tutti=<SALA>&de=<nombre>.
   - Papel y lápiz (un celular): sortea la letra, ¡BASTA! da 10 s más y se
     anotan los puntos (10 única, 5 repetida, 0 vacía).
   Pantalla fija (PantallaFija). Datos en gya_tutti. */
const TuttiFrutti=(()=>{
  const CLAVE="gya_tutti",TIEMPOS=[60,90,120];
  const CATEGORIAS=["Nombre","Apellido","País o ciudad","Comida","Animal","Color","Marca","Fruta o verdura","Cosa","Profesión","Famoso","Película o serie"];
  const LETRAS="ABCDEFGHIJLMNOPRSTUV".split("");
  let raiz=null,est={cant:3,nombres:[]},tiempo=90,cats=["Nombre","Apellido","País o ciudad","Comida","Animal","Cosa"],partidas=0;
  let total=[],ronda=[],usadas=[],letra="",fin=0,timer=0,jugando=false,basta=false;
  function cargar(){try{const d=JSON.parse(localStorage.getItem(CLAVE));if(d&&typeof d==="object"){est.cant=Math.min(12,Math.max(1,Number(d.cant)||3));est.nombres=Array.isArray(d.nombres)?d.nombres.map(String):[];if(TIEMPOS.includes(d.tiempo))tiempo=d.tiempo;if(Array.isArray(d.cats)&&d.cats.length)cats=d.cats.filter(c=>CATEGORIAS.includes(c));partidas=Number(d.partidas)||0;}}catch(e){}}
  function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify({cant:est.cant,nombres:est.nombres,tiempo,cats,partidas}));}catch(e){}}
  cargar();
  const q=id=>raiz.querySelector("#"+id);
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
  const nom=i=>PantallaFija.nombreJugador(est,i);
  function abrir(contenedor){salir();cargar();raiz=document.createElement("section");raiz.className="tf";contenedor.appendChild(raiz);PantallaFija.entrar();configurar();}
  const ajustesHtml=()=>`<div class="qs-sub">🗂️ Categorías (tocá para elegir)</div>
      <div class="qs-cats imp-cats tf-catsel" id="tfCats">${CATEGORIAS.map(c=>`<button type="button" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div>
      <div class="qs-sub">⏱️ Tiempo máximo por letra</div>
      <div class="qns-rangos" id="tfT">${TIEMPOS.map(t=>`<button type="button" data-v="${t}">${t} s</button>`).join("")}</div>`;
  function ajustesEventos(){
    const pintar=()=>{raiz.querySelectorAll("#tfT button").forEach(b=>b.classList.toggle("activo",Number(b.dataset.v)===tiempo));raiz.querySelectorAll("#tfCats button").forEach(b=>b.classList.toggle("tf-on",cats.includes(b.dataset.c)));};pintar();
    const avisar=()=>{if(on&&on.host){on.cats=cats.slice();on.tiempo=tiempo;difundirSala();}};
    q("tfT").onclick=e=>{const b=e.target.closest("button[data-v]");if(b){tiempo=Number(b.dataset.v);guardar();pintar();avisar();}};
    q("tfCats").onclick=e=>{const b=e.target.closest("button[data-c]");if(!b)return;const c=b.dataset.c;if(cats.includes(c)){if(cats.length>3)cats=cats.filter(x=>x!==c);}else cats=CATEGORIAS.filter(x=>x===c||cats.includes(x));guardar();pintar();avisar();};
  }
  function configurar(){
    parar();cerrarSala();PantallaFija.desactivar();
    raiz.innerHTML=`<div class="mg-panel imp-panel"><h3>🍓 Tutti Frutti</h3>
      <p>Se juegan <b>3 rondas</b> y gana el mejor de 3. El primero que completa todo canta <b>BASTA</b>. Puntos: <b>10</b> única, <b>5</b> repetida, <b>20</b> si sos el único.</p>
      ${ajustesHtml()}
      <div id="tfZona"><button type="button" class="mg-principal" id="tfCrear">📱 Crear sala (cada uno con su celular)</button>
      <div class="tf-unirse"><input id="tfCodigo" maxlength="4" placeholder="CÓDIGO" autocomplete="off" autocapitalize="characters"><button type="button" id="tfUnirse">🔑 Unirme</button></div>
      <button type="button" id="tfPapel">📝 Papel y lápiz (un solo celular)</button>
      <p class="imp-ayuda" id="tfEstado" role="status"></p></div></div>`;
    ajustesEventos();
    q("tfCrear").onclick=crearSala;
    q("tfUnirse").onclick=()=>{const c=(q("tfCodigo").value||"").toUpperCase().trim();if(/^[A-HJ-NP-Z2-9]{4}$/.test(c))unirse(c);else estado("Escribí el código de 4 letras que te pasaron.");};
    q("tfPapel").onclick=papel;
  }
  function estado(t){const e=raiz&&raiz.querySelector("#tfEstado");if(e)e.textContent=t;}
  function papel(){
    raiz.innerHTML=`<div class="mg-panel imp-panel"><h3>📝 Papel y lápiz</h3>
      <p>Cada uno con <b>papel y lápiz</b>. El celular sortea la letra y el primero que completa todo toca <b>¡BASTA!</b></p>
      <div class="qs-sub">👥 Jugadores (para anotar los puntos)</div><div id="tfJug"></div>
      <button type="button" class="mg-principal" id="tfEmpezar">🍓 Empezar</button>
      <button type="button" id="tfAtras">⟵ Atrás</button></div>`;
    PantallaFija.editorJugadores(q("tfJug"),est,{min:1,max:12,alCambiar:guardar});
    q("tfEmpezar").onclick=()=>{total=Array(est.cant).fill(0);usadas=[];PantallaFija.activar();sortear();};
    q("tfAtras").onclick=configurar;
  }
  function pantalla(html){raiz.innerHTML=`<div class="qns-pantalla imp-juego"><button type="button" class="pf-salir" id="tfSalir">✕ Salir</button>${html}</div>`;PantallaFija.confirmar(q("tfSalir"),configurar);}
  function sortear(){
    let libres=LETRAS.filter(l=>!usadas.includes(l));if(!libres.length){usadas=[];libres=LETRAS.slice();}
    letra=libres[Math.floor(Math.random()*libres.length)];usadas.push(letra);
    pantalla(`<div class="imp-centro"><div class="imp-quien">🎲 Sorteando la letra…</div><div class="tf-letra" id="tfLetra">?</div></div>`);
    let n=0;const giro=()=>{if(!raiz)return;const el=q("tfLetra");if(!el)return;
      if(n<14){el.textContent=LETRAS[Math.floor(Math.random()*LETRAS.length)];if(typeof bip==="function")bip(600+n*25,.04,"square",.03);n++;setTimeout(giro,60+n*8);return;}
      el.textContent=letra;el.classList.add("tf-final");if(typeof bip==="function"){bip(784,.15);setTimeout(()=>bip(1047,.25),120);}setTimeout(jugar,900);};
    giro();
  }
  function jugar(){
    jugando=true;basta=false;fin=Date.now()+tiempo*1000;
    pantalla(`<div class="qs-tope"><span>🍓 Letra ${letra}</span><b id="tfReloj">${tiempo}</b><span></span></div>
      <div class="imp-centro"><div class="tf-letra tf-final">${letra}</div>
      <ul class="tf-cats">${cats.map(c=>`<li>${esc(c)}</li>`).join("")}</ul>
      <p class="imp-ayuda" id="tfAviso">Escriban en su papel. El primero que completa todo toca ¡BASTA!</p>
      <button type="button" class="bb-pasar" id="tfBasta">✋ ¡BASTA!</button></div>`);
    q("tfBasta").addEventListener("pointerdown",e=>{e.preventDefault();gritarBasta();});
    reloj();
  }
  function gritarBasta(){
    if(!jugando||basta)return;basta=true;fin=Math.min(fin,Date.now()+10000);
    if(typeof sonidoErrorExt==="function")sonidoErrorExt();if(typeof vibrar==="function")vibrar([80,50,80]);
    const b=q("tfBasta");if(b){b.disabled=true;b.textContent="✋ ¡BASTA!";}
    const a=q("tfAviso");if(a)a.innerHTML="<b>¡BASTA!</b> Los demás tienen 10 segundos para terminar la palabra que están escribiendo.";
  }
  function reloj(){
    if(!raiz||!jugando)return;
    const r=Math.max(0,Math.ceil((fin-Date.now())/1000)),el=q("tfReloj");
    if(el){el.textContent=r;if(r<=5&&r>0&&el.dataset.u!==String(r)){el.dataset.u=String(r);if(typeof bip==="function")bip(880,.07);}}
    if(r<=0){jugando=false;puntos();return;}
    timer=setTimeout(reloj,200);
  }
  function puntos(){
    if(typeof bip==="function"){bip(523,.12);setTimeout(()=>bip(392,.25),140);}
    ronda=Array(est.cant).fill(0);
    pantalla(`<div class="mg-panel imp-panel tf-puntos"><h3>✏️ ¡Lápices arriba!</h3>
      <p class="imp-ayuda">Lean en voz alta. Por cada categoría: <b>10</b> si nadie más la puso, <b>5</b> si se repitió, <b>0</b> si quedó vacía o no vale.</p>
      <ul class="tf-filas" id="tfFilas"></ul>
      <button type="button" class="mg-principal" id="tfSig">🎲 Siguiente letra</button>
      <button type="button" id="tfTerminar">🏁 Terminar y ver ganador</button></div>`);
    const pintar=()=>{q("tfFilas").innerHTML=ronda.map((p,i)=>`<li><span>${esc(nom(i))}<small>Total ${total[i]+p}</small></span><button type="button" data-i="${i}" data-d="-5">−5</button><b>${p}</b><button type="button" data-i="${i}" data-d="5">+5</button><button type="button" data-i="${i}" data-d="10">+10</button></li>`).join("");};
    pintar();
    q("tfFilas").onclick=e=>{const b=e.target.closest("button[data-i]");if(!b)return;const i=Number(b.dataset.i);ronda[i]=Math.max(0,ronda[i]+Number(b.dataset.d));pintar();};
    const cerrar=()=>{ronda.forEach((p,i)=>total[i]+=p);};
    q("tfSig").onclick=()=>{cerrar();sortear();};
    q("tfTerminar").onclick=()=>{cerrar();ganador();};
  }
  function ganador(){
    partidas++;guardar();
    const orden=total.map((p,i)=>[i,p]).sort((a,b)=>b[1]-a[1]);
    const top=orden[0]?orden[0][1]:0,ganan=orden.filter(o=>o[1]===top).map(o=>nom(o[0]));
    if(typeof bip==="function")[523,659,784,1047].forEach((f,i)=>setTimeout(()=>bip(f,.22,"triangle",.05),i*140));
    pantalla(`<div class="mg-panel imp-panel imp-fin"><div class="bb-icono">🏆</div><h3>¡${ganan.length>1?"Empate: "+esc(ganan.join(" y ")):"Ganó "+esc(ganan[0]||"")}!</h3>
      <ul class="imp-tabla">${orden.map(([i,p])=>`<li><span>${esc(nom(i))}</span><b>${p}</b></li>`).join("")}</ul>
      <button type="button" class="mg-principal" id="tfRevancha">🔄 Revancha</button><button type="button" id="tfCambiar">⚙️ Cambiar jugadores o categorías</button></div>`);
    q("tfRevancha").onclick=()=>{total=Array(est.cant).fill(0);usadas=[];PantallaFija.activar();sortear();};q("tfCambiar").onclick=configurar;
  }
  function parar(){jugando=false;clearTimeout(timer);}
  function salir(){parar();cerrarSala();if(raiz)PantallaFija.salir();if(raiz)raiz.remove();raiz=null;}
  /* ===== Control de respuestas =====
     Listas propias (tutti-frutti-datos.js) para Nombre, Apellido, Lugar, Animal,
     Color, Fruta, Comida y Profesión; Wikipedia para Famoso, Marca y Película;
     diccionario por letra (assets/diccionario/es-<l>.txt) para Cosa y como
     respaldo. Nunca rechaza: marca ✓ o ⚠️ y al final se vota. */
  /* Sin tildes ni diéresis y con la ñ como n: "Rodríguez" = "Rodriguez",
     "Niño" = "Nino". Así los acentos nunca hacen perder una respuesta. */
  const NORM=t=>String(t||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim();
  const CLAVE_CAT={"Nombre":"nombre","Apellido":"apellido","País o ciudad":"lugar","Animal":"animal","Color":"color","Fruta o verdura":"fruta","Comida":"comida","Profesión":"profesion","Famoso":"wiki","Película o serie":"wiki","Marca":"wiki","Cosa":"dic"};
  const sets={},dics={},cacheWiki=new Map();
  function setDe(k){if(!sets[k]){const t=(window.TUTTI_LISTAS||{})[k]||"";sets[k]=new Set(t.split(",").map(NORM).filter(Boolean));}return sets[k];}
  const variantes=v=>{const sinArt=v.replace(/^(el|la|los|las|un|una) /,"");const out=new Set([v,sinArt]);[v,sinArt].forEach(x=>{if(x.endsWith("es"))out.add(x.slice(0,-2));if(x.endsWith("s"))out.add(x.slice(0,-1));out.add(x.split(" ")[0]);});[...out].forEach(x=>{/* femenino → masculino: abogada→abogado, doctora→doctor, gata→gato */if(x.endsWith("a")){out.add(x.slice(0,-1)+"o");out.add(x.slice(0,-1));}});return[...out].filter(Boolean);};
  function cargarDic(l){
    l=NORM(l)[0];if(!l)return Promise.resolve(null);
    if(dics[l])return dics[l];
    dics[l]=fetch("assets/diccionario/es-"+l+".txt").then(r=>r.ok?r.text():"").then(t=>new Set(t.split("\n").map(NORM))).catch(()=>null);
    return dics[l];
  }
  async function enDiccionario(v){const d=await cargarDic(v);if(!d||!d.size)return null;return variantes(v).some(x=>d.has(x))||v.split(" ").every(w=>w.length<3||d.has(w));}
  async function enWikipedia(v,estricto){
    const ck=(estricto?"!":"")+v;if(cacheWiki.has(ck))return cacheWiki.get(ck);
    const pr=(async()=>{try{
      const ctrl=typeof AbortController!=="undefined"?new AbortController():null;const t=setTimeout(()=>ctrl&&ctrl.abort(),4500);
      const r=await fetch("https://es.wikipedia.org/w/api.php?action=opensearch&limit=8&namespace=0&format=json&origin=*&search="+encodeURIComponent(v),ctrl?{signal:ctrl.signal}:{});
      clearTimeout(t);const d=await r.json();const titulos=(d&&d[1])||[];
      return titulos.some(x=>{const n=NORM(x);return n===v||n.startsWith(v+" ")||(!estricto&&n.startsWith(v));});
    }catch(e){return null;}})();
    cacheWiki.set(ck,pr);return pr;
  }
  /* Devuelve true (✓), false (⚠️) o null (no se pudo revisar). */
  async function revisar(cat,valor){
    const v=NORM(valor);if(!v)return null;
    const k=CLAVE_CAT[cat];
    if(k==="wiki")return enWikipedia(v);
    if(k==="dic")return enDiccionario(v);
    if(k&&variantes(v).some(x=>setDe(k).has(x)))return true;
    /* Comida también acepta frutas y verduras (palta, papa, banana…). */
    if(k==="comida"&&variantes(v).some(x=>setDe("fruta").has(x)))return true;
    /* No está en la lista: antes de marcarla mal, se busca afuera.
       Nombres, apellidos y lugares → Wikipedia (título igual o que empiece
       con la palabra, ej. "Oriana", "Esquivel (apellido)", "Orlando").
       Comidas, animales, colores, frutas y profesiones → el diccionario. */
    if(k==="nombre"||k==="apellido"||k==="lugar"){const w=await enWikipedia(v,true);return w===null?true:w;}
    if(k){const d=await enDiccionario(v);return d===null?false:d;}
    return false;
  }
  const NOM_CAT={"Nombre":"nombre","Apellido":"apellido","País o ciudad":"país o ciudad","Animal":"animal","Color":"color","Fruta o verdura":"fruta o verdura","Comida":"comida","Profesión":"profesión","Famoso":"famoso","Película o serie":"película o serie","Marca":"marca","Cosa":"cosa"};

  /* ======================= SALA (cada uno con su celular) ======================= */
  const CHARS="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",MAXJ=10,RONDAS=3;
  const N=t=>String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().trim();
  let on=null;/* {cli,sala,host,pid,jug:[{pid,nombre}],ganadas:{},usadas:[],n,letra,cats,tiempo,fase,resps:{},ganador,timers} */
  const yo=()=>((typeof perfil!=="undefined"&&perfil&&perfil.nombre)||"Jugador").slice(0,14);
  function tema(){return "gyatutti/"+on.sala;}
  function mandar(m){m.pid=on.pid;try{on.cli&&on.cli.connected&&on.cli.publish(tema(),JSON.stringify(m));}catch(e){}manejar(m);}
  function nuevaSala(host,sala){
    cerrarSala();
    on={cli:null,sala,host,pid:Math.random().toString(36).slice(2,10),jug:[],ganadas:{},usadas:[],n:0,letra:"",cats:cats.slice(),tiempo,fase:"lobby",resps:{},ganador:null,basta:null,timers:[]};
    if(host)on.jug=[{pid:on.pid,nombre:yo()}];
  }
  function conectarSala(listo){
    const mio=on;if(!mio)return;
    const reintentar=v=>{const b=raiz&&raiz.querySelector("#tfReintentar");if(b)b.hidden=!v;};
    reintentar(false);estado("Conectando…");
    MultiBroker.conectar(()=>{
      if(on!==mio){try{mio.cli&&mio.cli.end(true);}catch(e){}return;}
      mio.cli.subscribe(tema());
      mio.cli.on("message",(t,pl)=>{if(on!==mio||t!==tema())return;let m;try{m=JSON.parse(pl.toString());}catch(e){return;}if(m.pid===mio.pid)return;manejar(m);});
      estado("");listo();
    },()=>{if(on!==mio)return;estado("No se pudo conectar ("+(window.gyaFalloConexion||"sin respuesta")+"). Probá con datos del celular o tocá Reintentar.");reintentar(true);},
    cl=>{if(on===mio)mio.cli=cl;else try{cl.end(true);}catch(e){}});
    mio.reconectar=()=>conectarSala(listo);
  }
  function crearSala(){
    nuevaSala(true,Array.from({length:4},()=>CHARS[Math.floor(Math.random()*CHARS.length)]).join(""));
    zonaAnfitrion();
    conectarSala(()=>{on.timers.push(setInterval(()=>{if(on&&on.host&&on.fase!=="jugando")difundirSala();},3000));difundirSala();});
  }
  function unirse(sala,de){
    nuevaSala(false,sala);
    lobby(de);
    conectarSala(()=>{const hola=()=>{if(on&&!on.jug.some(j=>j.pid===on.pid))mandar({t:"hola",nombre:yo()});};hola();on.timers.push(setInterval(hola,2000));});
  }
  function cerrarSala(){
    if(!on)return;on.reconectar=null;
    try{if(on.cli&&on.cli.connected)on.cli.publish(tema(),JSON.stringify({t:"chau",pid:on.pid}));}catch(e){}
    on.timers.forEach(t=>{clearInterval(t);clearTimeout(t);});
    const c=on.cli;on=null;if(c)setTimeout(()=>{try{c.end(true);}catch(e){}},300);
  }
  function difundirSala(){mandar({t:"sala",jug:on.jug,ganadas:on.ganadas,rg:on.rg||{},cats:on.cats,tiempo:on.tiempo,fase:on.fase});}
  function textoInvitacion(){return "¡Juguemos Tutti Frutti en Girá y Adiviná! 🍓 Tocá para unirte: "+linkInvitacion()+" (código "+on.sala+")";}
  function copiarInvitacion(){
    const t=textoInvitacion(),ok=()=>estado("✅ Invitación copiada. Pegala en el chat.");
    try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(ok,()=>{try{window.prompt("Copiá la invitación:",t);}catch(e){}});return;}}catch(e){}
    try{window.prompt("Copiá la invitación:",t);}catch(e){}
  }
  function linkInvitacion(){let base="";try{base=location.origin+location.pathname;}catch(e){}return base+"?tutti="+on.sala+"&de="+encodeURIComponent(yo());}
  /* Anfitrión: el código, la invitación y los que van entrando aparecen en
     la misma pantalla de las categorías (se pueden seguir cambiando). */
  function zonaAnfitrion(){
    const z=raiz&&raiz.querySelector("#tfZona");if(!z){lobby();return;}
    z.innerHTML=`<div class="qs-sub">🔑 Código de la sala</div><div class="dl-codigo tf-cod">${on.sala}</div>
      <button type="button" id="tfWpp">📲 Invitar por WhatsApp</button>
      <button type="button" id="tfCopiar">📋 Copiar invitación</button>
      <div class="qs-sub">👥 En la sala</div><ul class="imp-tabla" id="tfJugs"></ul>
      <button type="button" class="mg-principal" id="tfArrancar">🎲 Empezar</button>
      <p class="imp-ayuda" id="tfEstado" role="status"></p><button type="button" id="tfReintentar" hidden>🔄 Reintentar</button>
      <button type="button" id="tfCancelar">✖ Cerrar la sala</button>`;
    pintarJugadores();eventosAnfitrion();
    q("tfReintentar").onclick=()=>{if(on&&on.reconectar)on.reconectar();};
    q("tfCancelar").onclick=configurar;
  }
  function eventosAnfitrion(){
    q("tfWpp").onclick=()=>{try{window.open("https://wa.me/?text="+encodeURIComponent(textoInvitacion()),"_blank");}catch(e){}};
    const cp=raiz.querySelector("#tfCopiar");if(cp)cp.onclick=copiarInvitacion;
    q("tfArrancar").onclick=()=>{if(!on.cli||!on.cli.connected){estado("Todavía conectando… esperá un segundo.");return;}if(on.jug.length<2){estado("Falta que se una al menos un jugador más.");return;}nuevaRonda();};
  }
  function lobby(de){
    if(!raiz||!on)return;
    PantallaFija.activar();
    pantalla(`<div class="mg-panel imp-panel"><h3>🍓 Sala de Tutti Frutti</h3>
      ${on.host?`<p>Pasales el código o invitalos por WhatsApp. Cuando estén todos, tocá <b>Empezar</b>.</p>
        <div class="dl-codigo tf-cod">${on.sala}</div>
        <button type="button" id="tfWpp">📲 Invitar por WhatsApp</button><button type="button" id="tfCopiar">📋 Copiar invitación</button>`
      :`<p>${de?"Sala de <b>"+esc(de)+"</b>. ":""}Esperando que el anfitrión empiece…</p><div class="dl-codigo tf-cod">${on.sala}</div>`}
      <div class="qs-sub">👥 En la sala</div><ul class="imp-tabla" id="tfJugs"></ul>
      ${on.host?`<button type="button" class="mg-principal" id="tfArrancar">🎲 Empezar</button>`:""}
      <p class="imp-ayuda" id="tfEstado" role="status"></p><button type="button" id="tfReintentar" hidden>🔄 Reintentar</button></div>`);
    pintarJugadores();
    q("tfReintentar").onclick=()=>{if(on&&on.reconectar)on.reconectar();};
    if(on.host)eventosAnfitrion();
  }
  function pintarJugadores(){
    const ul=raiz&&raiz.querySelector("#tfJugs");if(!ul||!on)return;
    ul.innerHTML=on.jug.map(j=>`<li><span>${esc(j.nombre)}${j.pid===on.pid?" (vos)":""}</span><b>${on.ganadas[j.pid]?on.ganadas[j.pid]+" pts":""}</b></li>`).join("");
  }
  function nuevaRonda(){
    let libres=LETRAS.filter(l=>!on.usadas.includes(l));if(!libres.length){on.usadas=[];libres=LETRAS.slice();}
    const l=libres[Math.floor(Math.random()*libres.length)];on.usadas.push(l);
    on.rj=(on.rj||0)+1;on.tot=on.tot||RONDAS;
    mandar({t:"ronda",n:on.n+1,rj:on.rj,tot:on.tot,letra:l,cats:on.cats,tiempo:on.tiempo});
  }
  function manejar(m){
    if(!on)return;
    if(m.t==="hola"&&on.host){
      if(!on.jug.some(j=>j.pid===m.pid)){if(on.jug.length>=MAXJ)return;on.jug.push({pid:m.pid,nombre:String(m.nombre||"Jugador").slice(0,14)});}
      difundirSala();pintarJugadores();
    }else if(m.t==="sala"&&!on.host){
      on.jug=Array.isArray(m.jug)?m.jug:[];on.ganadas=m.ganadas||{};on.rg=m.rg||{};on.cats=m.cats||on.cats;on.tiempo=m.tiempo||on.tiempo;pintarJugadores();
    }else if(m.t==="chau"){
      const eraHost=!on.host&&on.jug[0]&&on.jug[0].pid===m.pid;
      on.jug=on.jug.filter(j=>j.pid!==m.pid);
      if(eraHost){cerrarSala();if(raiz){configurar();estado("El anfitrión cerró la sala.");}return;}
      if(on.host)difundirSala();pintarJugadores();
    }else if(m.t==="ronda"){
      on.n=m.n;on.rj=m.rj||on.rj;on.tot=m.tot||on.tot||RONDAS;on.letra=m.letra;on.cats=m.cats;on.tiempo=m.tiempo;on.fase="jugando";on.resps={};on.votos={};on.ganador=null;on.basta=null;on.mias=Array(on.cats.length).fill("");on.envie=false;
      jugarOnline();
    }else if(m.t==="basta"&&m.n===on.n){
      if(!on.basta){on.basta=m.pid;if(on.host)on.ganador=m.pid;}
      cortarRonda(m.pid);
    }else if(m.t==="resp"&&m.n===on.n){
      on.resps[m.pid]=Array.isArray(m.r)?m.r.map(x=>String(x||"").slice(0,30)):[];
      if(on.host&&on.jug.every(j=>on.resps[j.pid]))publicarResultado();
    }else if(m.t==="voto"&&m.n===on.n){
      const k=m.a+"|"+m.i;on.votos=on.votos||{};const st=on.votos[k]=on.votos[k]||new Set();
      if(m.v)st.add(m.pid);else st.delete(m.pid);
      pintarVotos();
    }else if(m.t==="final"){
      on.ganadas=m.ganadas||on.ganadas;on.rg=m.rg||{};on.jug=m.jug||on.jug;on.tot=m.tot||on.tot;mostrarFinal();
    }else if(m.t==="resultado"&&m.n===on.n&&!on.host){
      on.resps=m.resps||{};on.ganador=m.ganador;on.ganadas=m.ganadas||on.ganadas;on.jug=m.jug||on.jug;on.marcas=m.marcas||{};mostrarResultado();
    }
  }
  /* Ronda: animación de la letra y después una categoría por vez. */
  function jugarOnline(){
    PantallaFija.activar();
    pantalla(`<div class="imp-centro"><div class="imp-quien">🎲 Ronda ${on.rj||1} de ${on.tot||RONDAS} · sorteando la letra…</div><div class="tf-letra" id="tfLetra">?</div></div>`);
    let k=0;const giro=()=>{if(!raiz||!on)return;const el=q("tfLetra");if(!el)return;
      if(k<12){el.textContent=LETRAS[Math.floor(Math.random()*LETRAS.length)];if(typeof bip==="function")bip(600+k*25,.04,"square",.03);k++;setTimeout(giro,60+k*8);return;}
      el.textContent=on.letra;el.classList.add("tf-final");if(typeof bip==="function"){bip(784,.15);setTimeout(()=>bip(1047,.25),120);}setTimeout(campos,800);};
    giro();
  }
  function campos(){
    if(!raiz||!on||on.fase!=="jugando"||on.basta)return;
    on.fin=Date.now()+on.tiempo*1000;on.pend=on.cats.map((_,i)=>i);
    pantalla(`<div class="qs-tope"><span>🍓 Letra ${on.letra}</span><b id="tfReloj">${on.tiempo}</b><span></span></div>
      <div class="imp-centro tf-campo"><div class="tf-letra tf-final tf-chica">${on.letra}</div>
      <div class="tf-prog" id="tfProg"></div>
      <div class="imp-quien" id="tfCat"></div>
      <input id="tfInput" autocomplete="off" autocapitalize="words" enterkeyhint="next">
      <p class="imp-ayuda" id="tfMsg"></p>
      <div class="mim-btns"><button type="button" class="bb-pasar imp-gris" id="tfSaltar">Después</button><button type="button" class="bb-pasar mim-ok" id="tfSig">Siguiente ➜</button></div></div>`);
    const inp=q("tfInput");
    q("tfSig").onclick=confirmarCampo;
    q("tfSaltar").onclick=()=>{guardarCampo(false);if(on.pend.length>1){on.pend.push(on.pend.shift());}pintarCampo();};
    inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();confirmarCampo();}});
    pintarCampo();relojOnline();
  }
  function pintarCampo(){
    if(!raiz||!on||!on.pend)return;const i=on.pend[0];
    q("tfCat").textContent=on.cats[i];
    const inp=q("tfInput");inp.value=on.mias[i]||"";inp.placeholder="Empieza con "+on.letra+"…";try{inp.focus();}catch(e){}
    q("tfProg").innerHTML=on.cats.map((c,j)=>`<i class="${on.mias[j]?"ok":""}${j===i?" act":""}"></i>`).join("");
    q("tfMsg").textContent="";
  }
  function guardarCampo(){const i=on.pend[0];on.mias[i]=(q("tfInput").value||"").trim().slice(0,30);}
  function confirmarCampo(){
    if(!on||on.fase!=="jugando"||on.basta)return;
    const v=(q("tfInput").value||"").trim();
    if(v.length<2||N(v)[0]!==on.letra){
      q("tfMsg").textContent=v?"Tiene que empezar con "+on.letra:"Escribí una palabra con "+on.letra;
      if(v&&typeof sonidoErrorExt==="function")sonidoErrorExt();
      const inp=q("tfInput");inp.classList.remove("tf-mal");void inp.offsetWidth;inp.classList.add("tf-mal");return;
    }
    const cat=on.cats[on.pend[0]];
    guardarCampo();on.pend.shift();
    if(typeof bip==="function")bip(880,.06,"sine",.04);
    if(!on.pend.length){mandar({t:"basta",n:on.n});return;}
    pintarCampo();
    revisar(cat,v).then(ok=>{if(ok===false&&on&&on.fase==="jugando"){const m=raiz&&raiz.querySelector("#tfMsg");if(m&&!m.textContent)m.textContent="⚠️ «"+v+"» no la encontré como "+NOM_CAT[cat]+". Al final la pueden votar.";}});
  }
  function relojOnline(){
    if(!raiz||!on||on.fase!=="jugando")return;
    const r=Math.max(0,Math.ceil((on.fin-Date.now())/1000)),el=q("tfReloj");
    if(el){el.textContent=r;if(r<=5&&r>0&&el.dataset.u!==String(r)){el.dataset.u=String(r);if(typeof bip==="function")bip(880,.07);}}
    if(r<=0){cortarRonda(null);return;}
    on.timers.push(setTimeout(relojOnline,250));
  }
  /* BASTA (o tiempo): todos mandan lo que tienen; el anfitrión junta y publica. */
  function cortarRonda(quien){
    if(!on||on.fase!=="jugando")return;
    if(on.pend&&q("tfInput")){const v=(q("tfInput").value||"").trim();if(v.length>=2&&N(v)[0]===on.letra)guardarCampo();}
    on.fase="cortada";
    const nombre=(on.jug.find(j=>j.pid===quien)||{}).nombre;
    if(typeof sonidoErrorExt==="function"&&quien&&quien!==on.pid)sonidoErrorExt();
    if(typeof vibrar==="function")vibrar([80,50,80]);
    pantalla(`<div class="imp-centro"><div class="imp-rol">${quien?"✋ ¡BASTA!":"⏰ ¡Tiempo!"}</div>
      <p class="imp-ayuda">${quien?(quien===on.pid?"¡Completaste todo primero!":"<b>"+esc(nombre||"Alguien")+"</b> completó todo primero."):"Nadie llegó a completar todo."}</p>
      <p class="imp-ayuda">Juntando las respuestas…</p></div>`);
    if(!on.envie){on.envie=true;mandar({t:"resp",n:on.n,r:on.mias});}
    if(on.host)on.timers.push(setTimeout(()=>{if(on&&on.fase==="cortada")publicarResultado();},3500));
  }
  /* Puntos como el Tutti Frutti de verdad, por categoría: 10 si nadie más
     puso lo mismo, 5 si se repite, 20 si sos el único que la completó, 0 si
     está vacía, no vale o la anularon. El anfitrión revisa las respuestas
     (✓/⚠️) y manda las marcas a todos, así todos calculan igual. Votos:
     a una ✓ se la vota ❌ para anularla; a una ⚠️ (mal escrita o que no
     encontré) se la vota ✔ para salvarla. Alcanza la mayoría de los demás. */
  async function publicarResultado(){
    if(!on||!on.host||on.fase==="resultado"||on.calculando)return;
    on.calculando=true;
    const marcas={};
    await Promise.all(on.jug.map(async j=>{const r=on.resps[j.pid]||[];marcas[j.pid]=await Promise.all(on.cats.map((c,i)=>r[i]?revisar(c,r[i]).then(x=>x===null?true:x).catch(()=>true):Promise.resolve(false)));}));
    on.calculando=false;if(!on||on.fase==="resultado")return;
    on.fase="resultado";on.marcas=marcas;
    mandar({t:"resultado",n:on.n,resps:on.resps,ganador:on.ganador,ganadas:on.ganadas,jug:on.jug,marcas});
    mostrarResultado();
  }
  const necesarios=()=>Math.max(1,Math.floor((on.jug.length-1)/2)+1);
  const votosDe=(a,i)=>{const st=on.votos&&on.votos[a+"|"+i];return st?st.size:0;};
  const marca=(a,i)=>!!(on.marcas&&on.marcas[a]&&on.marcas[a][i]);
  /* ¿La respuesta vale? ✓ y no anulada, o ⚠️ pero salvada por votos. */
  function vale(a,i){const r=(on.resps[a]||[])[i];if(!r)return false;return marca(a,i)?votosDe(a,i)<necesarios():votosDe(a,i)>=necesarios();}
  function puntosRonda(){
    const pts={};on.jug.forEach(j=>pts[j.pid]=Array(on.cats.length).fill(0));
    on.cats.forEach((c,i)=>{
      const validos=on.jug.filter(j=>vale(j.pid,i));
      validos.forEach(j=>{
        const n=NORM(on.resps[j.pid][i]);
        const iguales=validos.filter(o=>o.pid!==j.pid&&NORM(on.resps[o.pid][i])===n).length;
        pts[j.pid][i]=validos.length===1?20:iguales?5:10;
      });
    });
    return pts;
  }
  const sumar=a=>a.reduce((x,y)=>x+y,0);
  function mostrarResultado(){
    if(!raiz||!on)return;on.fase="resultado";on.votos=on.votos||{};on.marcas=on.marcas||{};
    const g=on.ganador;
    const filas=on.jug.map(j=>{const r=on.resps[j.pid]||[];return`<li class="tf-jug${j.pid===g?" tf-gano":""}"><div class="tf-jug-cab"><b>${esc(j.nombre)}${j.pid===on.pid?" (vos)":""}</b>${j.pid===g?`<span class="tf-basta">🏁 BASTA</span>`:""}<span class="tf-sub" data-sub="${j.pid}"></span></div>
      <div class="tf-tabla"><div class="tf-fila tf-titulos"><span>Categoría</span><span>Palabra</span><span>Pts</span><span></span></div>${on.cats.map((c,i)=>{const v=r[i]||"";const ok=marca(j.pid,i);return`<div class="tf-fila" data-a="${j.pid}" data-i="${i}"><span class="tf-cat">${esc(c)}</span><span class="tf-pal${v&&!ok?" tf-mal":""}" ${v&&!ok?`data-ver="1"`:""}>${esc(v||"—")}${v?(ok?" <i class=\"tf-marca ok\">✓</i>":" <i class=\"tf-marca mal\">⚠️</i>"):""}</span><b class="tf-pts"></b>${v&&j.pid!==on.pid?`<button type="button" class="tf-votar" aria-label="Votar"></button>`:"<span></span>"}</div>`;}).join("")}</div></li>`;}).join("");
    pantalla(`<div class="mg-panel imp-panel imp-fin"><h3 id="tfTitulo"></h3>
      <p class="imp-ayuda">Letra <b>${on.letra}</b> · <b>10</b> única · <b>5</b> repetida · <b>20</b> si sos el único · <b>0</b> si no vale.<br>⚠️ = mal escrita (vale 0): tocala para ver lo correcto. Con el botón de la derecha votás: ❌ anula, ✔ perdona.</p>
      <ul class="tf-resps">${filas}</ul>
      <div class="qs-sub">🏆 Puntos (con esta ronda)</div><ul class="imp-tabla" id="tfTabla"></ul>
      ${on.host?((on.rj||1)>=(on.tot||RONDAS)?`<button type="button" class="mg-principal" id="tfMas">🎲 Una ronda más</button><button type="button" id="tfOtra">🏆 Terminar y ver ganador</button>`:`<button type="button" class="mg-principal" id="tfOtra">🎲 Siguiente ronda (${(on.rj||1)+1} de ${on.tot||RONDAS})</button>`):`<p class="imp-ayuda">Esperando al anfitrión…</p>`}</div>`);
    raiz.querySelector(".tf-resps").onclick=e=>{
      const f=e.target.closest(".tf-fila");if(!f||!f.dataset.a)return;const a=f.dataset.a,i=Number(f.dataset.i);
      if(e.target.closest(".tf-votar")){const st=on.votos[a+"|"+i];const ya=!!(st&&st.has(on.pid));mandar({t:"voto",n:on.n,a,i,v:!ya});return;}
      if(e.target.closest("[data-ver]"))explicar(on.cats[i],(on.resps[a]||[])[i]);
    };
    if(on.ganador===on.pid&&typeof bip==="function")[523,659,784].forEach((f,i)=>setTimeout(()=>bip(f,.2,"triangle",.05),i*130));
    pintarVotos();
    if(on.host){
      const cerrar=()=>{
        const pr=puntosRonda();on.rg=on.rg||{};
        on.jug.forEach(j=>on.ganadas[j.pid]=(on.ganadas[j.pid]||0)+sumar(pr[j.pid]));
        /* La ronda la gana el que más sumó (si empatan, se la llevan los dos). */
        const max=Math.max(...on.jug.map(j=>sumar(pr[j.pid])));
        if(max>0)on.jug.forEach(j=>{if(sumar(pr[j.pid])===max)on.rg[j.pid]=(on.rg[j.pid]||0)+1;});
        difundirSala();
      };
      q("tfOtra").onclick=()=>{cerrar();if((on.rj||1)>=(on.tot||RONDAS)){mandar({t:"final",n:on.n,ganadas:on.ganadas,rg:on.rg,jug:on.jug,tot:on.tot||RONDAS});return;}nuevaRonda();};
      const mas=raiz.querySelector("#tfMas");if(mas)mas.onclick=()=>{cerrar();on.tot=(on.tot||RONDAS)+1;nuevaRonda();};
    }
  }
  /* Mini popup: por qué está mal y cuál es la forma correcta (solo informa). */
  const lev=(a,b)=>{const m=a.length,n=b.length;if(Math.abs(m-n)>3)return 99;let prev=Array.from({length:n+1},(_,k)=>k);for(let x=1;x<=m;x++){const cur=[x];for(let y=1;y<=n;y++)cur[y]=Math.min(prev[y]+1,cur[y-1]+1,prev[y-1]+(a[x-1]===b[y-1]?0:1));prev=cur;}return prev[n];};
  const lindo=t=>t.replace(/\b\w/g,c=>c.toUpperCase());
  async function sugerir(cat,valor){
    const v=NORM(valor),k=CLAVE_CAT[cat];if(!v)return null;
    if(k==="wiki"){
      try{const r=await fetch("https://es.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&srinfo=suggestion&format=json&origin=*&srsearch="+encodeURIComponent(valor));const d=await r.json();
        const t=d&&d.query&&d.query.search&&d.query.search[0]&&d.query.search[0].title;if(t)return t.replace(/\s*\(.*?\)\s*$/,"");
        const sg=d&&d.query&&d.query.searchinfo&&d.query.searchinfo.suggestion;return sg?lindo(sg):null;}catch(e){return null;}
    }
    let cand=[];
    if(k&&k!=="dic")cand=[...setDe(k)].concat(k==="comida"?[...setDe("fruta")]:[]);
    else{
      /* También la letra que "suena igual": Girafa → Jirafa, Vaca/Baca, Zapato/Sapato… */
      const ALT={g:["j"],j:["g"],b:["v"],v:["b"],s:["c","z"],c:["s","z","k"],z:["s","c"],y:["l"],l:["y"],h:[v[1]||""],k:["c","q"],q:["c","k"]};
      for(const l of [v[0]].concat(ALT[v[0]]||[]).filter(Boolean)){const d=await cargarDic(l);if(d)cand=cand.concat([...d]);}
    }
    /* Distancia "como suena" (ll=y, v=b, z/ce/ci=s, h muda, c/qu=k, ge/gi=j)
       y desempate por letras: Martiyo → Martillo, Milaneza → Milanesa. */
    const fon=t=>t.replace(/h/g,"").replace(/ll/g,"y").replace(/v/g,"b").replace(/z/g,"s").replace(/c([ei])/g,"s$1").replace(/qu/g,"k").replace(/c/g,"k").replace(/g([ei])/g,"j$1").replace(/x/g,"ks").replace(/(.)\1+/g,"$1");
    const fv=fon(v),tope=v.length<=4?1:v.length<=8?2:3;
    let mejor=null,puntaje=1e9;
    for(const c of cand){if(c===v||Math.abs(c.length-v.length)>tope+1)continue;const df=lev(fv,fon(c));if(df>tope)continue;const p=df*10+lev(v,c);if(p<puntaje){puntaje=p;mejor=c;if(p<=1)break;}}
    return mejor?lindo(mejor):null;
  }
  function explicar(cat,valor){
    if(!valor)return;
    const viejo=document.querySelector(".tf-pop");if(viejo)viejo.remove();
    const p=document.createElement("div");p.className="tf-pop";
    p.innerHTML=`<div class="tf-pop-caja"><div class="tf-pop-cab">⚠️ ${esc(cat)}</div><div class="tf-pop-mal">«${esc(valor)}»</div><div class="tf-pop-txt" id="tfPopTxt">Buscando la forma correcta…</div><button type="button" class="tf-pop-ok">Entendido</button></div>`;
    p.onclick=e=>{if(e.target===p||e.target.closest(".tf-pop-ok"))p.remove();};
    document.body.appendChild(p);
    sugerir(cat,valor).then(sg=>{const t=p.querySelector("#tfPopTxt");if(!t)return;
      t.innerHTML=sg?`Lo correcto es <b>${esc(sg)}</b>.<br><small>Por eso vale 0: estaba mal escrita.</small>`:`No la encontré como ${esc(NOM_CAT[cat]||cat)} y no hay una parecida.<br><small>Por eso vale 0.</small>`;});
  }
  function pintarVotos(){
    if(!raiz||!on||on.fase!=="resultado")return;
    const pr=puntosRonda();
    raiz.querySelectorAll(".tf-fila[data-a]").forEach(b=>{const a=b.dataset.a,i=Number(b.dataset.i),k=a+"|"+i,st=on.votos[k],n=st?st.size:0,ok=marca(a,i),v=(on.resps[a]||[])[i],mio=!!(st&&st.has(on.pid));
      b.querySelector(".tf-pts").textContent=v?"+"+pr[a][i]:"0";
      const bt=b.querySelector(".tf-votar");if(bt)bt.textContent=(ok?"❌":"✔")+(n?" "+n:"");
      if(bt)bt.classList.toggle("activo",mio);
      b.classList.toggle("tf-anulada",!!v&&!vale(a,i));});
    raiz.querySelectorAll("[data-sub]").forEach(el=>{el.textContent="  +"+sumar(pr[el.dataset.sub]||[])+" pts";});
    const orden=on.jug.map(j=>[j,sumar(pr[j.pid]),(on.ganadas[j.pid]||0)+sumar(pr[j.pid])]).sort((a,b)=>b[2]-a[2]);
    const mejor=on.jug.map(j=>[j,sumar(pr[j.pid])]).sort((a,b)=>b[1]-a[1]);
    const t=raiz.querySelector("#tfTitulo");
    if(t){const empate=mejor.length>1&&mejor[0][1]===mejor[1][1];const nr="Ronda "+(on.rj||1)+" de "+(on.tot||RONDAS)+": ";t.textContent=nr+(empate?"empate 🤝":mejor[0][0].nombre+" (+"+mejor[0][1]+") 🏆");}
    const tabla=raiz.querySelector("#tfTabla");
    if(tabla)tabla.innerHTML=orden.map(([j,r,tot])=>`<li><span>${esc(j.nombre)}</span><b>${tot} <small>(+${r})</small></b></li>`).join("");
  }
  /* Final del mejor de 3: gana el que ganó más rondas; si empatan, el de más puntos. */
  function mostrarFinal(){
    if(!raiz||!on)return;on.fase="final";
    const orden=on.jug.map(j=>[j,on.rg[j.pid]||0,on.ganadas[j.pid]||0]).sort((a,b)=>b[1]-a[1]||b[2]-a[2]);
    const top=orden[0],ganan=orden.filter(o=>o[1]===top[1]&&o[2]===top[2]).map(o=>o[0].nombre);
    if(ganan.includes(yo())||orden[0][0].pid===on.pid){if(typeof bip==="function")[523,659,784,1047].forEach((f,i)=>setTimeout(()=>bip(f,.22,"triangle",.05),i*140));}
    if(on.host){partidas++;guardar();}
    pantalla(`<div class="mg-panel imp-panel imp-fin"><div class="bb-icono">🏆</div><h3>${ganan.length>1?"¡Empate entre "+esc(ganan.join(" y "))+"!":"¡Ganó "+esc(ganan[0])+"!"}</h3>
      <p class="imp-ayuda">${on.tot||RONDAS} rondas: gana el que ganó más rondas (si empatan, el de más puntos).</p>
      <ol class="kar-podio">${orden.map(([j,rg,p],k)=>`<li style="--c:#E5197C"><span>${k+1}</span><i>${esc((j.nombre||"?")[0].toUpperCase())}</i><b>${esc(j.nombre)}${j.pid===on.pid?" (vos)":""}</b><em>${rg} ${rg===1?"ronda":"rondas"} · ${p} pts</em></li>`).join("")}</ol>
      ${on.host?`<button type="button" class="mg-principal" id="tfRevancha">🔄 Revancha</button>`:`<p class="imp-ayuda">Esperando que el anfitrión arranque la revancha…</p>`}</div>`);
    if(on.host)q("tfRevancha").onclick=()=>{on.ganadas={};on.rg={};on.rj=0;on.tot=RONDAS;on.usadas=[];difundirSala();nuevaRonda();};
  }
  /* Link ?tutti=<SALA>&de=<nombre>: abre el juego y se une solo. */
  function abrirInvitacion(sala,de){
    if(typeof Extensiones==="undefined")return;
    Extensiones.abrirJuego("tutti-frutti");
    setTimeout(()=>{if(raiz)unirse(sala,de);},300);
  }
  return{abrir,salir,abrirInvitacion,_revisar:(c,v)=>revisar(c,v),_sugerir:(c,v)=>sugerir(c,v),enter:()=>{try{confirmarCampo();}catch(e){}},partidasJugadas:()=>{cargar();return partidas;}};
})();
window.TuttiFrutti=TuttiFrutti;
