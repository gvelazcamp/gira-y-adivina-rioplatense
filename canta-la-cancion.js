/* Canta la Canción: aparece una palabra y el jugador de turno tiene que
   cantar un pedacito de una canción que la tenga antes de que se acabe el
   tiempo. Los demás deciden: ✔ la cantó / ✘ no pudo (o se acaba el tiempo).
   Cada error cuesta una vida; el último que queda con vidas gana.
   Pantalla fija (PantallaFija). Datos en gya_canta. */
const CantaLaCancion=(()=>{
  const CLAVE="gya_canta",TIEMPOS=[10,15,20],VIDAS=3;
  let raiz=null,est={cant:3,nombres:[]},tiempo=15,partidas=0;
  let vidas=[],turno=0,mazo=[],idx=0,fin=0,timer=0,jugando=false,bloqueo=0;
  function cargar(){try{const d=JSON.parse(localStorage.getItem(CLAVE));if(d&&typeof d==="object"){est.cant=Math.min(12,Math.max(2,Number(d.cant)||3));est.nombres=Array.isArray(d.nombres)?d.nombres.map(String):[];if(TIEMPOS.includes(d.tiempo))tiempo=d.tiempo;partidas=Number(d.partidas)||0;}}catch(e){}}
  function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify({cant:est.cant,nombres:est.nombres,tiempo,partidas}));}catch(e){}}
  cargar();
  const q=id=>raiz.querySelector("#"+id);
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
  const nom=i=>PantallaFija.nombreJugador(est,i);
  const mezclar=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const corazones=i=>"❤️".repeat(vidas[i])+"🖤".repeat(VIDAS-vidas[i]);
  function abrir(contenedor){salir();cargar();raiz=document.createElement("section");raiz.className="cta";contenedor.appendChild(raiz);PantallaFija.entrar();configurar();}
  function configurar(){
    parar();PantallaFija.desactivar();
    raiz.innerHTML=`<div class="mg-panel imp-panel"><h3>🎤 Canta la Canción</h3>
      <p>Sale una palabra y tenés que <b>cantar un pedacito de una canción</b> que la tenga antes de que se acabe el tiempo. Cada error cuesta una vida ❤️.</p>
      <div class="qs-sub">👥 Jugadores</div><div id="ctaJug"></div>
      <div class="qs-sub">⏱️ Tiempo para cantar</div>
      <div class="qns-rangos" id="ctaT">${TIEMPOS.map(t=>`<button type="button" data-v="${t}">${t} s</button>`).join("")}</div>
      <button type="button" class="mg-principal" id="ctaEmpezar">🎤 Empezar</button>
      <button type="button" id="ctaWpp">💬 Invitar por WhatsApp</button></div>`;
    PantallaFija.editorJugadores(q("ctaJug"),est,{min:2,max:12,alCambiar:guardar});
    const pintar=()=>raiz.querySelectorAll("#ctaT button").forEach(b=>b.classList.toggle("activo",Number(b.dataset.v)===tiempo));pintar();
    q("ctaT").onclick=e=>{const b=e.target.closest("button[data-v]");if(b){tiempo=Number(b.dataset.v);guardar();pintar();}};
    q("ctaEmpezar").onclick=empezar;
    q("ctaWpp").onclick=()=>PantallaFija.invitar("canta-la-cancion","Canta la Canción");
  }
  function empezar(){
    const todas=window.CANTA_PALABRAS||[];const libres=Vistas.filtrar("canta",todas,x=>x);
    mazo=mezclar(libres).concat(mezclar(todas.filter(x=>!libres.includes(x))));idx=0;
    vidas=Array(est.cant).fill(VIDAS);turno=Math.floor(Math.random()*est.cant);
    PantallaFija.activar();previa();
  }
  function pantalla(html){raiz.innerHTML=`<div class="qns-pantalla imp-juego"><button type="button" class="pf-salir" id="ctaSalir">✕ Salir</button>${html}</div>`;PantallaFija.confirmar(q("ctaSalir"),configurar);}
  function previa(){
    pantalla(`<div class="imp-centro"><div class="imp-quien">🎤 Le toca a</div><div class="imp-nombre">${esc(nom(turno))}</div><div class="cta-vidas">${corazones(turno)}</div>
      <p class="imp-ayuda">Cuando estés listo, tocá y aparece la palabra. Tenés <b>${tiempo} segundos</b>.</p>
      <button type="button" class="bb-pasar" id="ctaListo">¡Listo!</button></div>`);
    q("ctaListo").onclick=jugar;
  }
  function jugar(){
    const w=mazo[idx%mazo.length];idx++;Vistas.marcar("canta",w);jugando=true;bloqueo=Date.now()+600;
    pantalla(`<div class="qs-tope"><span>🎤 ${esc(nom(turno))}</span><b id="ctaReloj">${tiempo}</b><span></span></div>
      <div class="imp-centro mim-centro"><small>Cantá una canción que diga</small><div class="mim-frase cta-palabra">${esc(w)}</div>
      <div class="mim-btns"><button type="button" class="bb-pasar imp-gris" id="ctaNo">✘ No pudo</button><button type="button" class="bb-pasar mim-ok" id="ctaSi">✔ ¡La cantó!</button></div></div>`);
    q("ctaNo").addEventListener("pointerdown",e=>{e.preventDefault();responder(false);});
    q("ctaSi").addEventListener("pointerdown",e=>{e.preventDefault();responder(true);});
    fin=Date.now()+tiempo*1000;reloj();
  }
  function reloj(){
    if(!raiz||!jugando)return;
    const r=Math.max(0,Math.ceil((fin-Date.now())/1000)),el=q("ctaReloj");
    if(el){el.textContent=r;if(r<=5&&r>0&&el.dataset.u!==String(r)){el.dataset.u=String(r);if(typeof bip==="function")bip(880,.07);}}
    if(r<=0){responder(false,true);return;}
    timer=setTimeout(reloj,200);
  }
  function responder(ok,porTiempo){
    if(!jugando||(!porTiempo&&Date.now()<bloqueo))return;
    jugando=false;clearTimeout(timer);
    if(ok){if(typeof bip==="function"){bip(660,.15,"sine",.06);bip(990,.22,"triangle",.04);}if(typeof vibrar==="function")vibrar(30);}
    else{vidas[turno]--;if(typeof sonidoErrorExt==="function")sonidoErrorExt();if(typeof vibrar==="function")vibrar([60,40,60]);}
    const vivos=vidas.map((v,i)=>v>0?i:-1).filter(i=>i>=0);
    if(vivos.length<=1){ganador(vivos[0]);return;}
    const fuera=!ok&&vidas[turno]===0;
    pantalla(`<div class="imp-centro"><div class="imp-rol ${ok?"imp-ok":""}">${ok?"🎶 ¡Bien cantado!":porTiempo?"⏰ ¡Se acabó el tiempo!":"✘ No pudo"}</div>
      ${fuera?`<p class="imp-ayuda">💀 <b>${esc(nom(turno))}</b> quedó afuera.</p>`:`<div class="cta-vidas">${corazones(turno)}</div>`}
      <ul class="imp-tabla cta-tabla">${vidas.map((v,i)=>`<li class="${v?"":"fuera"}"><span>${esc(nom(i))}</span><b>${v?"❤️".repeat(v):"💀"}</b></li>`).join("")}</ul>
      <button type="button" class="bb-pasar" id="ctaSig">Siguiente ➜</button></div>`);
    q("ctaSig").onclick=()=>{do{turno=(turno+1)%est.cant;}while(vidas[turno]<=0);previa();};
  }
  function ganador(g){
    partidas++;guardar();
    if(typeof bip==="function")[523,659,784,1047].forEach((f,i)=>setTimeout(()=>bip(f,.22,"triangle",.05),i*140));
    pantalla(`<div class="mg-panel imp-panel imp-fin"><div class="bb-icono">🏆</div><h3>¡Ganó ${esc(g>=0?nom(g):"nadie")}!</h3><p>Fue el último que quedó cantando.</p>
      <button type="button" class="mg-principal" id="ctaRevancha">🔄 Revancha</button><button type="button" id="ctaCambiar">👥 Cambiar jugadores</button></div>`);
    q("ctaRevancha").onclick=empezar;q("ctaCambiar").onclick=configurar;
  }
  function parar(){jugando=false;clearTimeout(timer);}
  function salir(){parar();if(raiz)PantallaFija.salir();if(raiz)raiz.remove();raiz=null;}
  return{abrir,salir,partidasJugadas:()=>{cargar();return partidas;}};
})();
window.CantaLaCancion=CantaLaCancion;
