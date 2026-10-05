/* Memoria en cadena: un solo celular que se pasa. Cada jugador repite la
   cadena tocando las palabras en orden (mezcladas con otras que distraen) y
   después suma una palabra nueva, que se dice en voz alta. Si se equivoca o
   se le acaba el tiempo, pierde una vida; sin vidas queda afuera. Gana el
   último que queda. Sugerencias de palabras: TUTTI_LISTAS (Tutti Frutti).
   Pantalla fija (PantallaFija). Datos en gya_cadena. */
const MemoriaCadena=(()=>{
  const CLAVE="gya_cadena",VIDAS=[1,2,3];
  const TEMAS=[
    {id:"mezcla",nombre:"Mezcla",emoji:"🎲",listas:["animal","comida","fruta","profesion","color"]},
    {id:"animal",nombre:"Animales",emoji:"🐾",listas:["animal"]},
    {id:"comida",nombre:"Comidas",emoji:"🍕",listas:["comida","fruta"]},
    {id:"profesion",nombre:"Profesiones",emoji:"👷",listas:["profesion"]},
    {id:"libre",nombre:"Libre",emoji:"✏️",listas:["animal","comida","fruta","profesion","color"]}];
  const COLORES=["#E5197C","#1F6FB2","#1E9B7A","#F5B301","#7B3FE4","#FF6B3D","#00A8B5","#C2185B","#5C6BC0","#43A047","#8D6E63","#EC407A"];
  let raiz=null,est={cant:3,nombres:[]},vidasIni=2,tema="mezcla",partidas=0,record=0;
  let cadena=[],vidas=[],afuera=[],turno=0,paso=0,fichas=[],fin=0,timer=0,jugando=false,bloqueo=0;
  function cargar(){try{const d=JSON.parse(localStorage.getItem(CLAVE));if(d&&typeof d==="object"){est.cant=Math.min(12,Math.max(2,Number(d.cant)||3));est.nombres=Array.isArray(d.nombres)?d.nombres.map(String):[];if(VIDAS.includes(d.vidas))vidasIni=d.vidas;if(TEMAS.some(t=>t.id===d.tema))tema=d.tema;partidas=Number(d.partidas)||0;record=Number(d.record)||0;}}catch(e){}}
  function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify({cant:est.cant,nombres:est.nombres,vidas:vidasIni,tema,partidas,record}));}catch(e){}}
  cargar();
  const q=id=>raiz.querySelector("#"+id);
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
  const nom=i=>PantallaFija.nombreJugador(est,i);
  const N=t=>String(t||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-zñ0-9 ]+/g," ").replace(/\s+/g," ").trim();
  const mezclar=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const sonar=(f,d,t,v)=>{if(typeof bip==="function")bip(f,d,t,v);};
  const vib=p=>{if(typeof vibrar==="function")vibrar(p);};
  const mayus=w=>String(w).toUpperCase();
  const iniciales=i=>nom(i).split(" ").map(x=>x[0]||"").join("").slice(0,2).toUpperCase();
  const temaAct=()=>TEMAS.find(t=>t.id===tema)||TEMAS[0];
  /* Palabras del tema (sin repetir y sin las que ya están en la cadena). */
  function banco(){
    const L=window.TUTTI_LISTAS||{},usadas=new Set(cadena.map(N)),vistas=new Set();
    const todas=[];temaAct().listas.forEach(k=>{const a=Array.isArray(L[k])?L[k]:String(L[k]||"").split(",");a.forEach(w=>{w=w.trim();const n=N(w);if(w&&!vistas.has(n)&&!usadas.has(n)&&w.length<=14){vistas.add(n);todas.push(w);}});});
    return mezclar(todas);
  }
  function abrir(contenedor){salir();cargar();raiz=document.createElement("section");raiz.className="cad";contenedor.appendChild(raiz);PantallaFija.entrar();configurar();}
  function configurar(){
    parar();PantallaFija.desactivar();
    raiz.innerHTML=`<div class="mg-panel imp-panel kar-panel"><h3>🧠 Memoria en cadena</h3>
      <p>El celular pasa de mano en mano. Cada uno <b>repite la cadena</b> tocando las palabras en orden y después <b>suma una nueva</b> que dice en voz alta. ¡La cadena crece y crece!</p>
      <div class="qs-sub">👥 Jugadores</div><div id="cadJug"></div>
      <div class="qs-sub">🗂️ Tema de las palabras</div>
      <div class="qns-rangos cad-temas" id="cadTema">${TEMAS.map(t=>`<button type="button" data-v="${t.id}">${t.emoji} ${t.nombre}</button>`).join("")}</div>
      <div class="qs-sub">❤️ Vidas por jugador</div>
      <div class="qns-rangos" id="cadVidas">${VIDAS.map(v=>`<button type="button" data-v="${v}">${"❤️".repeat(v)}</button>`).join("")}</div>
      <p class="kar-ayuda">${record?`🏆 Cadena más larga: <b>${record}</b> palabras`:"Si te equivocás, perdés una vida. Gana el último que queda."}</p>
      <button type="button" class="mg-principal" id="cadEmpezar">🧠 Empezar</button>
      <button type="button" id="cadWpp">💬 Invitar por WhatsApp</button></div>`;
    PantallaFija.editorJugadores(q("cadJug"),est,{min:2,max:12,alCambiar:guardar});
    const pintar=()=>{
      raiz.querySelectorAll("#cadTema button").forEach(b=>b.classList.toggle("activo",b.dataset.v===tema));
      raiz.querySelectorAll("#cadVidas button").forEach(b=>b.classList.toggle("activo",Number(b.dataset.v)===vidasIni));};pintar();
    q("cadTema").onclick=e=>{const b=e.target.closest("button[data-v]");if(b){tema=b.dataset.v;guardar();pintar();}};
    q("cadVidas").onclick=e=>{const b=e.target.closest("button[data-v]");if(b){vidasIni=Number(b.dataset.v);guardar();pintar();}};
    q("cadEmpezar").onclick=empezar;
    q("cadWpp").onclick=()=>PantallaFija.invitar("memoria-cadena","Memoria en cadena");
  }
  function empezar(){cadena=[];vidas=Array(est.cant).fill(vidasIni);afuera=[];turno=0;PantallaFija.activar();previa();}
  function pantalla(html,clase=""){raiz.innerHTML=`<div class="qns-pantalla kar-escena cad-escena ${clase}"><button type="button" class="pf-salir" id="cadSalir">✕ Salir</button>${html}</div>`;PantallaFija.confirmar(q("cadSalir"),configurar);}
  const vivos=()=>vidas.map((v,i)=>i).filter(i=>vidas[i]>0);
  const marcador=()=>`<div class="kar-marcador">${vidas.map((v,i)=>`<span class="kar-ficha ${i===turno?"activa":""} ${v<=0?"cad-fuera":""}" style="--c:${COLORES[i%COLORES.length]}"><i>${esc(iniciales(i))}</i><b>${esc(nom(i))}</b><em>${v>0?"❤️".repeat(v):"💀"}</em></span>`).join("")}</div>`;
  function previa(){
    pantalla(`<div class="kar-centro">
      <div class="kar-vuelta">🔗 Cadena de ${cadena.length} ${cadena.length===1?"palabra":"palabras"}</div>
      <div class="kar-turno" style="--c:${COLORES[turno%COLORES.length]}"><i>${esc(iniciales(turno))}</i></div>
      <div class="kar-le">Le toca a</div><div class="kar-nombre">${esc(nom(turno))}</div>
      <p class="kar-ayuda">${cadena.length?`Tocá las <b>${cadena.length}</b> palabras en el orden en que se dijeron y después sumá una nueva.`:"Arrancás vos: elegí la primera palabra de la cadena."}</p>
      <button type="button" class="bb-pasar" id="cadListo">🧠 ¡Listo!</button>
      ${marcador()}</div>`);
    q("cadListo").onclick=cadena.length?repetir:sumar;
  }
  /* Repetir: las palabras de la cadena mezcladas con algunas que distraen. */
  function repetir(){
    const n=cadena.length,extra=Math.min(6,2+Math.floor(n/2));
    fichas=mezclar(cadena.concat(banco().slice(0,extra)));paso=0;jugando=true;bloqueo=Date.now()+300;
    const tiempo=6+n*3;fin=Date.now()+tiempo*1000;
    pantalla(`<div class="kar-centro">
      <div class="kar-le">🧠 ${esc(nom(turno))} · tocá la cadena en orden</div>
      <div class="cad-tope"><span id="cadPaso">1 de ${n}</span><b id="cadReloj">${tiempo}</b></div>
      <div class="cad-fichas" id="cadFichas">${fichas.map((w,i)=>`<button type="button" data-i="${i}">${esc(mayus(w))}</button>`).join("")}</div></div>`,"cantando");
    q("cadFichas").addEventListener("pointerdown",e=>{const b=e.target.closest("button[data-i]");if(!b||b.disabled||!jugando||Date.now()<bloqueo)return;e.preventDefault();tocar(b);});
    reloj();
  }
  function tocar(b){
    const w=fichas[Number(b.dataset.i)];
    if(N(w)===N(cadena[paso])){
      paso++;b.disabled=true;b.classList.add("ok");b.dataset.n=paso;sonar(520+paso*40,.08,"sine",.05);vib(15);
      const p=q("cadPaso");if(p)p.textContent=Math.min(paso+1,cadena.length)+" de "+cadena.length;
      if(paso>=cadena.length){jugando=false;clearTimeout(timer);sonar(660,.15,"sine",.06);sonar(990,.22,"triangle",.04);setTimeout(()=>{if(raiz)sumar();},500);}
    }else{b.classList.add("mal");fallo(false);}
  }
  function reloj(){
    if(!raiz||!jugando)return;
    const r=Math.max(0,Math.ceil((fin-Date.now())/1000)),el=q("cadReloj");if(el&&el.textContent!==String(r)){el.textContent=r;if(r<=3&&r>0)sonar(880,.07);}
    if(r<=0){fallo(true);return;}
    timer=setTimeout(reloj,150);
  }
  function fallo(porTiempo){
    if(!jugando)return;jugando=false;clearTimeout(timer);
    if(typeof sonidoErrorExt==="function")sonidoErrorExt();vib([60,40,60]);
    vidas[turno]--;if(vidas[turno]<=0)afuera.push(turno);
    const quedan=vivos();
    pantalla(`<div class="kar-centro">
      <div class="kar-veredicto mal">${porTiempo?"⏰ ¡Se acabó el tiempo!":"✘ ¡Le erró!"}</div>
      <p class="kar-ayuda"><b>${esc(nom(turno))}</b> ${vidas[turno]>0?`pierde una vida (le ${vidas[turno]===1?"queda 1":"quedan "+vidas[turno]}).`:"queda <b>afuera</b> 💀"}</p>
      <div class="kar-le">La cadena era:</div>
      <ol class="cad-lista">${cadena.map((w,i)=>`<li class="${i<paso?"ok":i===paso?"mal":""}">${esc(mayus(w))}</li>`).join("")}</ol>
      ${marcador()}
      <button type="button" class="bb-pasar" id="cadSig">${quedan.length<=1?"🏆 Ver ganador":"▶ Le toca a "+esc(nom(siguiente()))}</button></div>`);
    q("cadSig").onclick=()=>{if(quedan.length<=1){ganador();return;}turno=siguiente();previa();};
  }
  function siguiente(){const n=vidas.length;for(let k=1;k<=n;k++){const i=(turno+k)%n;if(vidas[i]>0)return i;}return turno;}
  /* Sumar: elegir una sugerencia o escribir otra; después se anuncia en voz alta. */
  function sumar(){
    const sug=banco().slice(0,6);
    pantalla(`<div class="kar-centro">
      <div class="kar-veredicto bien">${cadena.length?"✔ ¡Perfecto!":"🔗 ¡Arranca la cadena!"}</div>
      <div class="kar-le">${esc(nom(turno))}, sumá una palabra (${temaAct().emoji} ${temaAct().nombre})</div>
      ${tema==="libre"?"":`<div class="cad-sug" id="cadSug">${sug.map(w=>`<button type="button">${esc(mayus(w))}</button>`).join("")}</div><div class="kar-le">o escribí otra:</div>`}
      <div class="cad-escribir"><input id="cadInput" maxlength="18" placeholder="Tu palabra" autocomplete="off"><button type="button" class="bb-pasar" id="cadOk">Sumar</button></div>
      <p class="kar-ayuda" id="cadMsg"></p></div>`);
    const elegir=w=>{w=String(w||"").trim().replace(/\s+/g," ");const m=q("cadMsg");
      if(!w){if(m)m.textContent="Escribí una palabra.";return;}
      if(cadena.some(x=>N(x)===N(w))){if(m)m.textContent="Esa ya está en la cadena: elegí otra.";return;}
      cadena.push(w.toLowerCase());if(cadena.length>record){record=cadena.length;guardar();}anunciar(w);};
    const s=raiz.querySelector("#cadSug");if(s)s.onclick=e=>{const b=e.target.closest("button");if(b)elegir(b.textContent);};
    q("cadOk").onclick=()=>elegir(q("cadInput").value);
    q("cadInput").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();elegir(q("cadInput").value);}};
  }
  function anunciar(w){
    sonar(784,.12,"triangle",.05);
    const sig=siguiente();
    pantalla(`<div class="kar-centro">
      <div class="kar-le">🔊 Decila en voz alta para todos:</div>
      <div class="kar-cartel"><span>${esc(mayus(w))}</span></div>
      <div class="kar-vuelta">🔗 La cadena ahora tiene ${cadena.length} ${cadena.length===1?"palabra":"palabras"}</div>
      <p class="kar-ayuda">Ahora pasale el celular a <b>${esc(nom(sig))}</b>.</p>
      <button type="button" class="bb-pasar" id="cadSig">▶ Le toca a ${esc(nom(sig))}</button></div>`,"festeja");
    q("cadSig").onclick=()=>{turno=sig;previa();};
  }
  function ganador(){
    partidas++;guardar();const g=vivos()[0];
    const orden=(g!=null?[g]:[]).concat(afuera.slice().reverse());
    [523,659,784,1047].forEach((f,i)=>setTimeout(()=>sonar(f,.22,"triangle",.05),i*140));
    pantalla(`<div class="kar-centro">
      <div class="kar-veredicto bien">🏆 ¡Ganó!</div><div class="kar-nombre">${esc(nom(g!=null?g:0))}</div>
      <div class="kar-vuelta">🔗 Cadena final: ${cadena.length} palabras${cadena.length>=record?" · ¡récord!":""}</div>
      <ol class="kar-podio">${orden.map((i,k)=>`<li style="--c:${COLORES[i%COLORES.length]}"><span>${k+1}</span><i>${esc(iniciales(i))}</i><b>${esc(nom(i))}</b><em>${k===0?"🏆":"💀"}</em></li>`).join("")}</ol>
      <button type="button" class="bb-pasar" id="cadRevancha">🔄 Revancha</button>
      <button type="button" class="bb-pasar imp-gris" id="cadCambiar">⚙️ Cambiar jugadores</button></div>`,"festeja");
    q("cadRevancha").onclick=empezar;q("cadCambiar").onclick=configurar;
  }
  function parar(){jugando=false;clearTimeout(timer);}
  function salir(){parar();if(raiz)PantallaFija.salir();if(raiz)raiz.remove();raiz=null;}
  return{abrir,salir,partidasJugadas:()=>{cargar();return partidas;},record:()=>{cargar();return record;}};
})();
window.MemoriaCadena=MemoriaCadena;
