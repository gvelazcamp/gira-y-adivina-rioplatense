/* ¿Quién soy?: el clásico de la frente (tipo Heads Up). Se elige una
   categoría y el celular muestra una palabra gigante; los demás la
   describen y el que tiene el celular en la frente adivina. Tocar la
   mitad derecha = ¡Acerté!, la izquierda = Paso. Pantalla completa, sin
   apagarse y sin "atrás" (PantallaFija). Para cortar antes: mantener ✕.
   Récord en gya_quien_soy; Vistas evita repetir palabras entre días. */
const QuienSoy=(()=>{
  const CLAVE="gya_quien_soy",TIEMPOS=[60,90,120];
  let raiz=null,cat=null,tiempo=60,mejor=0,partidas=0,jugando=false,palabras=[],idx=0,resultados=[],fin=0,timer=0,cuenta=0,bloqueoToque=0;
  function cargar(){try{const d=JSON.parse(localStorage.getItem(CLAVE));if(d&&typeof d==="object"){mejor=Number(d.mejor)||0;partidas=Number(d.partidas)||0;if(TIEMPOS.includes(d.tiempo))tiempo=d.tiempo;}}catch(e){}}
  function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify({mejor,partidas,tiempo}));}catch(e){}}
  cargar();
  const q=id=>raiz.querySelector("#"+id);
  const mezclar=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
  function abrir(contenedor){
    salir();cargar();
    raiz=document.createElement("section");raiz.className="qs";
    contenedor.appendChild(raiz);PantallaFija.entrar();inicio();
  }
  function inicio(){
    const cats=window.QUIEN_SOY_CATEGORIAS||[];
    raiz.innerHTML=`<div class="mg-panel qs-panel"><h3>¿Quién soy?</h3>
      <p>Ponete el celular en la frente. Los demás te describen la palabra sin decirla y vos adiviná.</p>
      <p class="qns-nota">👉 Tocá la <b>derecha</b> si acertaste y la <b>izquierda</b> para pasar.</p>
      <div class="qs-sub">⏱️ Tiempo</div>
      <div class="qns-rangos" id="qsTiempos">${TIEMPOS.map(t=>`<button type="button" data-t="${t}">${t} s</button>`).join("")}</div>
      <div class="qs-sub">Elegí la categoría para empezar</div>
      <div class="qs-cats">${cats.map(c=>`<button type="button" data-cat="${c.id}">${c.emoji} ${esc(c.nombre)}</button>`).join("")}<button type="button" data-cat="mezcla">🎲 Mezcla</button></div>
      <button type="button" id="qsWpp">💬 Invitar por WhatsApp</button>
    </div>`;
    const pintarT=()=>raiz.querySelectorAll("#qsTiempos button").forEach(b=>b.classList.toggle("activo",Number(b.dataset.t)===tiempo));pintarT();
    q("qsTiempos").onclick=e=>{const b=e.target.closest("button[data-t]");if(!b)return;tiempo=Number(b.dataset.t);guardar();pintarT();};
    raiz.querySelector(".qs-cats").onclick=e=>{const b=e.target.closest("button[data-cat]");if(b)empezar(b.dataset.cat);};
    q("qsWpp").onclick=()=>PantallaFija.invitar("quien-soy","¿Quién soy?");
  }
  function elegirPalabras(id){
    const cats=window.QUIEN_SOY_CATEGORIAS||[];
    const lista=id==="mezcla"?cats.flatMap(c=>c.palabras):(cats.find(c=>c.id===id)||cats[0]).palabras;
    const libres=Vistas.filtrar("quien_soy_"+id,lista,x=>x);
    /* Primero las que no salieron; si no alcanzan, se completan con el resto. */
    return mezclar(libres).concat(mezclar(lista.filter(x=>!libres.includes(x))));
  }
  function empezar(id){
    const cats=window.QUIEN_SOY_CATEGORIAS||[];
    cat=id==="mezcla"?{id:"mezcla",nombre:"Mezcla",emoji:"🎲"}:cats.find(c=>c.id===id);if(!cat)return;
    palabras=elegirPalabras(id);idx=0;resultados=[];
    raiz.innerHTML=`<div class="qns-pantalla qs-juego" id="qsJuego">
      <div class="qs-tope"><span id="qsCat">${cat.emoji} ${esc(cat.nombre)}</span><b id="qsReloj">${tiempo}</b><button type="button" class="qs-salir" id="qsSalir" aria-label="Mantené para salir">✕</button></div>
      <div class="qs-zona qs-paso" data-z="paso"><span>⟵ Paso</span></div><div class="qs-zona qs-ok" data-z="ok"><span>¡Acerté! ⟶</span></div>
      <div class="qs-palabra" id="qsPalabra"></div>
      <div class="qns-pie" id="qsPie">Mantené ✕ para salir</div>
    </div>`;
    PantallaFija.activar({orientacion:"landscape"});
    const juego=q("qsJuego");
    ["touchstart","touchmove","contextmenu","dblclick"].forEach(t=>juego.addEventListener(t,e=>{if(e.cancelable)e.preventDefault();},{passive:false}));
    raiz.querySelectorAll(".qs-zona").forEach(z=>z.addEventListener("pointerdown",e=>{e.preventDefault();responder(z.dataset.z==="ok");}));
    PantallaFija.mantener(q("qsSalir"),1500,terminar);
    /* Cuenta regresiva para llegar a ponérselo en la frente. */
    let n=3;jugando=false;const pal=q("qsPalabra");pal.classList.add("qns-cuenta");q("qsPie").textContent="Ponete el celular en la frente";
    const paso=()=>{if(!raiz)return;if(n>0){pal.textContent=n;if(typeof bip==="function")bip(520,.08);n--;cuenta=setTimeout(paso,1000);return;}
      pal.classList.remove("qns-cuenta");q("qsPie").textContent="Mantené ✕ para salir";jugando=true;fin=Date.now()+tiempo*1000;mostrar();reloj();};
    paso();
  }
  function mostrar(){
    if(idx>=palabras.length){terminar();return;}
    const pal=q("qsPalabra"),w=palabras[idx];pal.textContent=w;
    pal.style.fontSize=w.length>14?"min(13vw,17vh)":w.length>9?"min(16vw,22vh)":"min(20vw,28vh)";
  }
  function reloj(){
    if(!raiz||!jugando)return;
    const r=Math.max(0,Math.ceil((fin-Date.now())/1000));q("qsReloj").textContent=r;
    if(r<=5&&r>0&&typeof bip==="function"&&q("qsReloj").dataset.u!==String(r)){q("qsReloj").dataset.u=String(r);bip(880,.07);}
    if(r<=0){terminar();return;}
    timer=setTimeout(reloj,200);
  }
  function responder(ok){
    if(!jugando||Date.now()<bloqueoToque)return;
    bloqueoToque=Date.now()+450;
    resultados.push({w:palabras[idx],ok});Vistas.marcar("quien_soy_"+cat.id,palabras[idx]);idx++;
    const j=q("qsJuego");j.classList.remove("flash-ok","flash-paso");void j.offsetWidth;j.classList.add(ok?"flash-ok":"flash-paso");
    if(typeof bip==="function"){if(ok){bip(660,.15,"sine",.06);bip(990,.22,"triangle",.04);}else bip(330,.12,"sine",.04);}
    if(typeof vibrar==="function")vibrar(ok?30:15);
    mostrar();
  }
  function terminar(){
    clearTimeout(timer);clearTimeout(cuenta);
    const habiaJugado=jugando||resultados.length;jugando=false;PantallaFija.desactivar();
    if(!raiz)return;
    if(!habiaJugado){inicio();return;}
    const aciertos=resultados.filter(r=>r.ok).length;partidas++;
    const record=aciertos>mejor;if(record)mejor=aciertos;guardar();
    raiz.innerHTML=`<div class="mg-panel qs-panel"><h3>${record&&aciertos?"🏆 ¡Récord!":"⏰ ¡Tiempo!"}</h3>
      <div class="qs-total"><b>${aciertos}</b> acierto${aciertos===1?"":"s"}</div>
      <ul class="qs-lista">${resultados.map(r=>`<li class="${r.ok?"ok":"no"}">${r.ok?"✔":"✘"} ${esc(r.w)}</li>`).join("")}</ul>
      <button type="button" class="mg-principal" id="qsOtra">🔄 Otra ronda</button>
      <button type="button" id="qsCambiar">Cambiar categoría</button>
    </div>`;
    q("qsOtra").onclick=()=>empezar(cat.id);q("qsCambiar").onclick=inicio;
    if(typeof bip==="function"){bip(523,.15);setTimeout(()=>bip(784,.25),160);}
  }
  function salir(){clearTimeout(timer);clearTimeout(cuenta);if(raiz||jugando)PantallaFija.salir();jugando=false;if(raiz)raiz.remove();raiz=null;}
  return{abrir,salir,mejorPuntaje:()=>{cargar();return mejor;}};
})();
window.QuienSoy=QuienSoy;
