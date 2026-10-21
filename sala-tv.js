/* Sala TV test access. Same game/state engine; TV displays, phones answer. */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const host = params.get('tvhost') === '1';
  const guest = !!params.get('tv');
  if (!host && !guest) return;
  document.body.classList.add(host ? 'tv-screen' : 'tv-phone');
  $('codigoInput').maxLength=6;
  // TV sessions do not enroll the display/guest in onboarding or shop promotions.
  tutChequearBienvenida = () => {};
  ptChequearAutoPopup = () => {};
  mostrarPromptIOS = () => {};
  const cleanText = (value, max) => String(value || '').replace(/[<>&"']/g, '').slice(0, max);
  let lastSeen = Date.now(), joined = false, rejected = false;
  const status = document.createElement('div');
  status.id = 'tvConnection'; status.setAttribute('role', 'status');
  document.body.appendChild(status);
  const oldHost = recibirTVHost;
  recibirTVHost = function (d) {
    if (!d || typeof d !== 'object' || typeof d.pid !== 'string' || !/^p[a-z0-9]{1,40}$/i.test(d.pid)) return;
    const known = familiaJugadores.some(j => j.id === d.pid);
    if (d.a === 'tv_hola') {
      if (!known && (tvPartidaIniciada || familiaJugadores.length >= 6)) {
        enviar({tipo:'tv_rechazo', pid:d.pid, mensaje:tvPartidaIniciada ? 'La partida ya empezó. Esperá una nueva sala.' : 'La sala está completa (6 jugadores).'});
        return;
      }
      d = {...d, n:cleanText(d.n, 12) || 'Jugador',
        av:/^[a-z0-9_-]+$/i.test(d.av || '') ? d.av : null,
        frame:/^[a-z0-9_-]+$/i.test(d.frame || '') ? d.frame : null};
      if (known) {
        // Recovery snapshot without re-rendering TV or restarting its clocks/animations.
        emitirTVLobby();
        if (S) enviar({tipo:'estado', v:V});
        return;
      }
    } else if (!known) return;
    if (d.a === 'resolver') {
      if (typeof d.txt !== 'string') return;
      d = {...d, txt:cleanText(d.txt, 160)};
      if (!d.txt.trim()) return;
    }
    if (d.a === 'letra' && (typeof d.l !== 'string' || !LETRAS.includes(d.l))) return;
    if (d.a === 'reaccion' && !['👏','😱','🤣','🔥'].includes(d.e)) return;
    oldHost(d);
  };
  const oldGuest = recibirTVGuest;
  recibirTVGuest = function (d) {
    if (!d || typeof d !== 'object') return;
    if (d.tipo === 'tv_rechazo' && d.pid === tvId) {
      rejected = true;
      clearInterval(holaTimer); holaTimer = null;
      $('estado').textContent = d.mensaje;
      status.textContent = d.mensaje;
      if(mq)mq.end(true);
      return;
    }
    if (d.tipo === 'estado' && (!d.v || !Array.isArray(d.v.jug) || !d.v.jug.some(j => j.id === tvId))) return;
    lastSeen = Date.now(); joined = true; status.textContent = '';
    oldGuest(d);
    if (d.tipo === 'estado') {
      const canAnswer = V.fase === 'bonus_resolver' ? !(V.bonusListos || [])[tvMiIndex]
        : V.fase === 'tossup' ? V.tossPausado && V.tossRespondedor === tvMiIndex
        : ['girar','consonante','vocal'].includes(V.fase) && V.turno === tvMiIndex;
      if (!canAnswer) $('tvcRespuestaWrap').classList.remove('ver');
      $('tvcEnviarResp').disabled = !canAnswer;
      if (V.fase === 'tv_resultado') {
        $('tvcEstado').textContent = 'Mirá el resultado en la tele…';
        $('tvcResolver').disabled = true;
      }
    }
  };
  window.gyaTVReconnect = () => {
    if (modo === 'tvguest') enviar({a:'tv_hola', n:$('miNombre').value.trim() || 'Jugador', av:perfil.avatar || null, frame:frameEquipado || null});
    else if(modo === 'tvhost') { emitirTVLobby(); if(S)enviar({tipo:'estado',v:V}); }
  };
  const oldLobby = renderTVLobby;
  renderTVLobby = function () {
    oldLobby();
    let link = document.getElementById('tvJoinAddress');
    if (!link) {
      link = document.createElement('p'); link.id = 'tvJoinAddress';
      $('tvCodigo').before(link);
    }
    link.textContent = 'En tu celular abrí: ' + new URL('tv.html', location.href).href;
  };
  // Keep navigation within the frontmost visible modal. Focus cannot escape behind it.
  function buttons() {
    const modal = [...document.querySelectorAll('.ver')].filter(e =>
      getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().width > 0)
      .sort((a,b) => (Number(getComputedStyle(b).zIndex)||0) - (Number(getComputedStyle(a).zIndex)||0))[0];
    const root = modal || document;
    return [...root.querySelectorAll('button, a[href], input')].filter(e => {
      const r = e.getBoundingClientRect();
      return !e.disabled && r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden';
    });
  }
  window.gyaTVRemote = direction => {
    if (!host) return;
    const all = buttons(); if (!all.length) return;
    const current = document.activeElement;
    if (!all.includes(current)) { all[0].focus(); return; }
    if (direction === 'select') { current.click(); return; }
    const r = current.getBoundingClientRect(), x = r.x+r.width/2, y = r.y+r.height/2;
    const candidates = all.filter(e=>e!==current).map(e=> {
      const t=e.getBoundingClientRect(), dx=t.x+t.width/2-x, dy=t.y+t.height/2-y;
      const primary=direction==='down'?dy:direction==='up'?-dy:direction==='right'?dx:-dx;
      const secondary=direction==='down'||direction==='up'?Math.abs(dx):Math.abs(dy);
      return {e,primary,score:primary+secondary*2};
    }).filter(t=>t.primary>2).sort((a,b)=>a.score-b.score);
    if(candidates.length)candidates[0].e.focus();
  };
  document.addEventListener('keydown', e => {
    if (!host) return;
    const dir = {ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Enter:'select'}[e.key];
    if (dir) { e.preventDefault(); window.gyaTVRemote(dir); }
  });
  window.addEventListener('DOMContentLoaded', () => {
    if (host) {
      $('bBienvenidaTVJugar').textContent = 'Mostrar código de sala';
      $('bBienvenidaTVNo').textContent = 'Volver';
      $('bAnuncioTVSortear').textContent = 'Sortear quién empieza';
      $('salioGiroTVBtn').textContent = 'Empezar partida';
      $('bTVSalir').textContent = 'Crear otra sala';
      $('bTVSalir').onclick = () => { if(confirm('¿Cerrar esta sala y crear otra?'))location.href='?tvhost=1'; };
      $('bBienvenidaTVNo').onclick = () => { $('capaBienvenidaTV').classList.remove('ver'); $('tvLobby').style.display='block'; renderTVLobby(); };
      $('rtvSalir').onclick = () => { location.href='?tvhost=1'; };
    } else {
      const name = cleanText(params.get('tvname') || $('miNombre').value, 12);
      if (name) { $('miNombre').value=name; unirseTV(params.get('tv').toUpperCase()); }
      else location.replace(new URL('tv.html?codigo='+encodeURIComponent(params.get('tv')),location.href).href);
    }
    // Leave query parameters intact on phone reload for recovery with the same session ID.
    const exit=document.createElement('button'); exit.id='tvTestExit';
    exit.textContent=host?'Nueva sala':'Salir de Sala TV';
    exit.onclick=()=>{if(confirm(host?'¿Cerrar la partida y crear una sala nueva?':'¿Salir de esta sala?'))location.href=host?'?tvhost=1':'tv.html';};
    document.body.appendChild(exit);
    setInterval(()=>{
      if(rejected)return;
      if (!mq || !mq.connected) status.textContent='Sin conexión. Intentando reconectar…';
      else if (guest && Date.now()-lastSeen>14000) status.textContent=joined?'No responde la tele. Mantenela abierta o volvé a entrar con un código nuevo.':'No encontramos la sala. Revisá el código y que la tele esté conectada.';
      else status.textContent='';
      if(host && !buttons().includes(document.activeElement)) { const first=buttons()[0]; if(first)first.focus(); }
    },1000);
  });
})();
