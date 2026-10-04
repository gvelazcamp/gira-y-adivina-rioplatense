/* Tutti Frutti (Basta): el celular sortea la letra y muestra las
   categorías; cada uno escribe en su papel. El primero que termina grita
   ¡BASTA! (botón) y los demás tienen 10 segundos más. Después se anotan
   los puntos de la ronda (10 única, 5 repetida, 0 vacía) y sigue otra
   letra sin repetir. Pantalla fija (PantallaFija). Datos en gya_tutti. */
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
  function configurar(){
    parar();PantallaFija.desactivar();
    raiz.innerHTML=`<div class="mg-panel imp-panel"><h3>🍓 Tutti Frutti</h3>
      <p>Cada uno con <b>papel y lápiz</b>. El celular sortea la letra y el primero que completa todo toca <b>¡BASTA!</b></p>
      <div class="qs-sub">👥 Jugadores (para anotar los puntos)</div><div id="tfJug"></div>
      <div class="qs-sub">🗂️ Categorías (tocá para elegir)</div>
      <div class="qs-cats imp-cats tf-catsel" id="tfCats">${CATEGORIAS.map(c=>`<button type="button" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div>
      <div class="qs-sub">⏱️ Tiempo máximo por letra</div>
      <div class="qns-rangos" id="tfT">${TIEMPOS.map(t=>`<button type="button" data-v="${t}">${t} s</button>`).join("")}</div>
      <button type="button" class="mg-principal" id="tfEmpezar">🍓 Empezar</button>
      <button type="button" id="tfWpp">💬 Invitar por WhatsApp</button></div>`;
    PantallaFija.editorJugadores(q("tfJug"),est,{min:1,max:12,alCambiar:guardar});
    const pintar=()=>{raiz.querySelectorAll("#tfT button").forEach(b=>b.classList.toggle("activo",Number(b.dataset.v)===tiempo));raiz.querySelectorAll("#tfCats button").forEach(b=>b.classList.toggle("tf-on",cats.includes(b.dataset.c)));};pintar();
    q("tfT").onclick=e=>{const b=e.target.closest("button[data-v]");if(b){tiempo=Number(b.dataset.v);guardar();pintar();}};
    q("tfCats").onclick=e=>{const b=e.target.closest("button[data-c]");if(!b)return;const c=b.dataset.c;if(cats.includes(c)){if(cats.length>3)cats=cats.filter(x=>x!==c);}else cats=CATEGORIAS.filter(x=>x===c||cats.includes(x));guardar();pintar();};
    q("tfEmpezar").onclick=()=>{total=Array(est.cant).fill(0);usadas=[];PantallaFija.activar();sortear();};
    q("tfWpp").onclick=()=>PantallaFija.invitar("tutti-frutti","Tutti Frutti");
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
  function salir(){parar();if(raiz)PantallaFija.salir();if(raiz)raiz.remove();raiz=null;}
  return{abrir,salir,partidasJugadas:()=>{cargar();return partidas;}};
})();
window.TuttiFrutti=TuttiFrutti;
