/* Mímica rioplatense: dos equipos. El que actúa ve la frase y la hace sin
   hablar; su equipo adivina. ✔ suma 1 y pasa a otra; Pasar no suma.
   Gana el primer equipo que llega a la meta (al cerrar la vuelta, así los
   dos jugaron lo mismo). Pantalla fija (PantallaFija). Datos en gya_mimica. */
const Mimica=(()=>{
  const CLAVE="gya_mimica",TIEMPOS=[45,60],METAS=[10,15,20];
  let raiz=null,equipos=["",""],tiempo=60,meta=10,partidas=0;
  let pts=[0,0],turno=0,turnos=0,mazo=[],idx=0,hechas=[],fin=0,timer=0,cuenta=0,jugando=false,bloqueo=0;
  function cargar(){try{const d=JSON.parse(localStorage.getItem(CLAVE));if(d&&typeof d==="object"){if(Array.isArray(d.equipos))equipos=[String(d.equipos[0]||""),String(d.equipos[1]||"")];if(TIEMPOS.includes(d.tiempo))tiempo=d.tiempo;if(METAS.includes(d.meta))meta=d.meta;partidas=Number(d.partidas)||0;}}catch(e){}}
  function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify({equipos,tiempo,meta,partidas}));}catch(e){}}
  cargar();
  const q=id=>raiz.querySelector("#"+id);
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
  const nom=i=>(equipos[i]||"").trim()||"Equipo "+(i+1);
  const mezclar=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  function abrir(contenedor){salir();cargar();raiz=document.createElement("section");raiz.className="mim";contenedor.appendChild(raiz);PantallaFija.entrar();configurar();}
  function configurar(){
    parar();PantallaFija.desactivar();
    raiz.innerHTML=`<div class="mg-panel imp-panel"><h3>🎭 Mímica rioplatense</h3>
      <p>Dos equipos. El que actúa ve la frase y la hace <b>sin hablar</b>; su equipo tiene que adivinar.</p>
      <div class="qs-sub">👥 Equipos</div>
      <div class="imp-nombres"><input id="mimE0" maxlength="14" placeholder="Equipo 1" value="${esc(equipos[0])}"><input id="mimE1" maxlength="14" placeholder="Equipo 2" value="${esc(equipos[1])}"></div>
      <div class="qs-sub">⏱️ Tiempo por turno</div>
      <div class="qns-rangos imp-dos" id="mimT">${TIEMPOS.map(t=>`<button type="button" data-v="${t}">${t} s</button>`).join("")}</div>
      <div class="qs-sub">🏆 Gana el que llega a</div>
      <div class="qns-rangos" id="mimM">${METAS.map(m=>`<button type="button" data-v="${m}">${m} puntos</button>`).join("")}</div>
      <button type="button" class="mg-principal" id="mimEmpezar">🎭 Empezar</button>
      <button type="button" id="mimWpp">💬 Invitar por WhatsApp</button></div>`;
    const pintar=()=>{raiz.querySelectorAll("#mimT button").forEach(b=>b.classList.toggle("activo",Number(b.dataset.v)===tiempo));raiz.querySelectorAll("#mimM button").forEach(b=>b.classList.toggle("activo",Number(b.dataset.v)===meta));};pintar();
    [0,1].forEach(i=>q("mimE"+i).oninput=e=>{equipos[i]=e.target.value;guardar();});
    q("mimT").onclick=e=>{const b=e.target.closest("button[data-v]");if(b){tiempo=Number(b.dataset.v);guardar();pintar();}};
    q("mimM").onclick=e=>{const b=e.target.closest("button[data-v]");if(b){meta=Number(b.dataset.v);guardar();pintar();}};
    q("mimEmpezar").onclick=empezar;
    q("mimWpp").onclick=()=>PantallaFija.invitar("mimica","Mímica rioplatense");
  }
  function empezar(){
    const todas=window.MIMICA_FRASES||[];const libres=Vistas.filtrar("mimica",todas,x=>x);
    mazo=mezclar(libres).concat(mezclar(todas.filter(x=>!libres.includes(x))));idx=0;
    pts=[0,0];turno=0;turnos=0;PantallaFija.activar();previa();
  }
  function pantalla(html){raiz.innerHTML=`<div class="qns-pantalla imp-juego"><button type="button" class="pf-salir" id="mimSalir">✕ Salir</button>${html}</div>`;PantallaFija.confirmar(q("mimSalir"),configurar);}
  const marcador=()=>`<div class="mim-marcador">${[0,1].map(i=>`<div class="${i===turno?"activo":""}"><span>${esc(nom(i))}</span><b>${pts[i]}</b></div>`).join("")}</div>`;
  function previa(){
    pantalla(`<div class="imp-centro">${marcador()}<div class="imp-quien">🎭 Turno de</div><div class="imp-nombre">${esc(nom(turno))}</div>
      <p class="imp-ayuda">Pasale el celular al que actúa. Que su equipo <b>no mire</b> la pantalla.</p>
      <button type="button" class="bb-pasar" id="mimVer">👁 Ver la frase y empezar</button></div>`);
    q("mimVer").onclick=jugar;
  }
  function jugar(){
    hechas=[];jugando=true;bloqueo=0;
    pantalla(`<div class="qs-tope"><span>🎭 ${esc(nom(turno))}</span><b id="mimReloj">${tiempo}</b><span></span></div>
      <div class="imp-centro mim-centro"><small>Actuá sin hablar</small><div class="mim-frase" id="mimFrase"></div>
      <div class="mim-btns"><button type="button" class="bb-pasar imp-gris" id="mimPasar">Pasar</button><button type="button" class="bb-pasar mim-ok" id="mimOk">✔ ¡Adivinaron!</button></div></div>`);
    q("mimPasar").addEventListener("pointerdown",e=>{e.preventDefault();responder(false);});
    q("mimOk").addEventListener("pointerdown",e=>{e.preventDefault();responder(true);});
    fin=Date.now()+tiempo*1000;mostrar();reloj();
  }
  function mostrar(){const f=q("mimFrase");if(!f)return;const t=mazo[idx%mazo.length];f.textContent=t;f.style.fontSize=t.length>24?"min(8.5vw,2.2rem)":t.length>14?"min(10vw,2.7rem)":"min(13vw,3.3rem)";}
  function responder(ok){
    if(!jugando||Date.now()<bloqueo)return;bloqueo=Date.now()+400;
    const t=mazo[idx%mazo.length];hechas.push({t,ok});Vistas.marcar("mimica",t);idx++;
    if(ok){pts[turno]++;if(typeof bip==="function"){bip(660,.15,"sine",.06);bip(990,.22,"triangle",.04);}if(typeof vibrar==="function")vibrar(30);}
    else if(typeof vibrar==="function")vibrar(15);
    mostrar();
  }
  function reloj(){
    if(!raiz||!jugando)return;
    const r=Math.max(0,Math.ceil((fin-Date.now())/1000)),el=q("mimReloj");if(el){el.textContent=r;if(r<=5&&r>0&&el.dataset.u!==String(r)){el.dataset.u=String(r);if(typeof bip==="function")bip(880,.07);}}
    if(r<=0){finTurno();return;}
    timer=setTimeout(reloj,200);
  }
  function finTurno(){
    jugando=false;clearTimeout(timer);turnos++;
    if(typeof bip==="function"){bip(523,.12);setTimeout(()=>bip(392,.25),140);}
    const n=hechas.filter(h=>h.ok).length;
    const gano=turnos%2===0&&(pts[0]>=meta||pts[1]>=meta)&&pts[0]!==pts[1]?(pts[0]>pts[1]?0:1):-1;
    if(gano>=0){ganador(gano);return;}
    pantalla(`<div class="mg-panel imp-panel imp-fin"><h3>⏰ ¡Tiempo!</h3><p><b>${esc(nom(turno))}</b> sumó <b>${n}</b> ${n===1?"punto":"puntos"}.</p>
      <ul class="qs-lista">${hechas.map(h=>`<li class="${h.ok?"ok":"no"}">${h.ok?"✔":"✘"} ${esc(h.t)}</li>`).join("")}</ul>
      ${marcador()}<p class="imp-ayuda">Gana el primero que llega a ${meta}.</p>
      <button type="button" class="mg-principal" id="mimSig">▶ Turno de ${esc(nom(1-turno))}</button></div>`);
    q("mimSig").onclick=()=>{turno=1-turno;previa();};
  }
  function ganador(g){
    partidas++;guardar();
    if(typeof bip==="function")[523,659,784,1047].forEach((f,i)=>setTimeout(()=>bip(f,.22,"triangle",.05),i*140));
    pantalla(`<div class="mg-panel imp-panel imp-fin"><div class="bb-icono">🏆</div><h3>¡Ganó ${esc(nom(g))}!</h3>${marcador()}
      <button type="button" class="mg-principal" id="mimRevancha">🔄 Revancha</button><button type="button" id="mimCambiar">⚙️ Cambiar equipos</button></div>`);
    q("mimRevancha").onclick=empezar;q("mimCambiar").onclick=configurar;
  }
  function parar(){jugando=false;clearTimeout(timer);clearTimeout(cuenta);}
  function salir(){parar();if(raiz)PantallaFija.salir();if(raiz)raiz.remove();raiz=null;}
  return{abrir,salir,partidasJugadas:()=>{cargar();return partidas;}};
})();
window.Mimica=Mimica;
