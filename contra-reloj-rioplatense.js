/* Contra Reloj Rioplatense: una tarjeta con 5 respuestas, 30 segundos
   para hacerlas adivinar sin decirlas. El dado (0, 1 o 2) se tira ANTES
   de cada ronda y se descuenta de las acertadas: max(0, acertadas - dado).
   Modos: Normal (se marca a mano), Árbitro (escucha el micrófono local y
   anula la respuesta que se dice) y Online por equipos (4+ jugadores,
   ver contra-reloj-rioplatense-online.js y -voz.js). */
const ContraRelojRioplatense=(()=>{
  const CSS=".crr{--noche:#160B24;--noche2:#241239;--noche3:#39204f;--oro:#F5B301;--oro2:#FFE39A;--magenta:#E5197C;--agua:#37D6C0;--crema:#F6EFE2;--muted:#CBB8DB;--error:#FF7186;--ok:#37D6C0;--panel:#2A183B;--safe-top:env(safe-area-inset-top,0px);--safe-bottom:env(safe-area-inset-bottom,0px);}\n.crr *{box-sizing:border-box}\n.crr{color:var(--crema);font-family:'Outfit',system-ui,sans-serif}\n.crr button,.crr input{font:inherit}\n.crr button{border:0;cursor:pointer}\n.crr button:disabled{opacity:.45;cursor:default}\n.crr button:focus-visible,.crr input:focus-visible{outline:3px solid var(--agua);outline-offset:2px}\n.crr [hidden]{display:none!important}\n.crr .crr-app{width:min(100%,680px);margin:auto}\n.crr .crr-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}\n.crr .crr-brand{display:flex;align-items:center;gap:9px}\n.crr .crr-brand .crr-mini{width:42px;height:42px;border-radius:13px;background:linear-gradient(145deg,#e5197c,#7e174f);display:grid;place-items:center;font-family:'Archivo Black',sans-serif;font-size:1.2rem;box-shadow:0 7px 18px #0006}\n.crr .crr-brand small{display:block;color:#bca9cb;font-size:.62rem;letter-spacing:.13em;font-weight:900}\n.crr .crr-brand b{font-family:'Archivo Black',sans-serif;font-size:.94rem;color:var(--oro)}\n.crr .crr-help{width:42px;height:42px;border-radius:50%;background:#2d1a3f;color:#fff;border:1px solid #ffffff20;font-weight:900}\n.crr .crr-shell{border-radius:28px;padding:20px 17px;background:linear-gradient(145deg,#382149,#21122e);border:1px solid #f5b3013e;box-shadow:0 22px 52px #0007,inset 0 1px #ffffff12}\n.crr .crr-logo{display:block;width:min(100%,480px);margin:0 auto 10px;border-radius:19px;filter:drop-shadow(0 12px 18px #0007)}\n.crr .crr-intro{text-align:center;color:#e4d9ea;line-height:1.45;font-size:.92rem;max-width:520px;margin:0 auto 16px}\n.crr .crr-mode-title{text-align:center;color:var(--oro);font-size:.7rem;letter-spacing:.14em;font-weight:900;margin:10px 0 9px}\n.crr .crr-mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}\n.crr .crr-mode{min-height:118px;border-radius:17px;padding:13px 9px;background:#1d1029;color:#fff;border:1px solid #ffffff1e;box-shadow:0 5px 0 #0c0612;text-align:center}\n.crr .crr-mode.crr-arb{background:linear-gradient(145deg,#411b38,#241238);border-color:#e5197c66}\n.crr .crr-mode.crr-online{grid-column:1/-1;min-height:95px;background:linear-gradient(135deg,#244a49,#203244);border-color:#37d6c055}\n.crr .crr-mode .crr-ico{font-size:1.8rem}\n.crr .crr-mode strong{display:block;font-family:'Archivo Black',sans-serif;font-size:.88rem;margin:5px 0 3px}\n.crr .crr-mode small{display:block;color:#cbb8db;font-size:.68rem;line-height:1.35}\n.crr .crr-mode:active{transform:translateY(3px);box-shadow:none}\n.crr .crr-primary,.crr .crr-secondary,.crr .crr-good,.crr .crr-bad,.crr .crr-gold{width:100%;min-height:48px;border-radius:13px;padding:10px 13px;font-weight:900}\n.crr .crr-primary,.crr .crr-gold{background:linear-gradient(115deg,#ffe18a,#f5b301);color:#32182f;box-shadow:0 5px 0 #996314}\n.crr .crr-secondary{background:#49305b;color:#fff;border:1px solid #ffffff1e}\n.crr .crr-good{background:#37d6c0;color:#073e38;box-shadow:0 5px 0 #19786d}\n.crr .crr-bad{background:#ff7e8b;color:#4d0d18;box-shadow:0 5px 0 #a43d4a}\n.crr .crr-primary:active,.crr .crr-secondary:active,.crr .crr-good:active,.crr .crr-bad:active,.crr .crr-gold:active{transform:translateY(2px);box-shadow:none}\n.crr .crr-note{text-align:center;color:#ab98bb;font-size:.67rem;margin:11px 0 0}\n.crr .crr-gamebox{border-radius:25px;padding:15px;background:linear-gradient(155deg,#2b183e,#1b0e29);border:1px solid #ffffff1a;box-shadow:0 18px 45px #0007}\n.crr .crr-hud{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:9px}\n.crr .crr-hud>div{background:#130a1e;border:1px solid #ffffff18;border-radius:12px;padding:7px;text-align:center}\n.crr .crr-hud small{display:block;color:#bdaacb;font-size:.58rem}\n.crr .crr-hud b{font-family:'Archivo Black',sans-serif;font-size:1rem}\n.crr .crr-hud .crr-time b{color:var(--oro)}\n.crr .crr-phase{text-align:center;font-size:.69rem;font-weight:900;letter-spacing:.12em;color:var(--oro);min-height:20px;margin:3px 0 7px}\n.crr .crr-rec{display:flex;justify-content:center;align-items:center;gap:7px;min-height:24px;color:#cdbdd8;font-size:.67rem;font-weight:900}\n.crr .crr-rec i{width:8px;height:8px;border-radius:50%;background:#766883}\n.crr .crr-rec.crr-on{color:#ffc1cf}\n.crr .crr-rec.crr-on i{background:#ff416c;box-shadow:0 0 10px #ff416c;animation:crrRecPulse 1s infinite}\n@keyframes crrRecPulse{50%{opacity:.3}}\n.crr .crr-card{position:relative;border-radius:24px;padding:18px 15px 17px;background:linear-gradient(145deg,#fff9e9,#ead6ad);color:#27132d;overflow:hidden;box-shadow:0 10px 0 #8b6733,0 20px 30px #0005}\n.crr .crr-card:before{content:\"\";position:absolute;inset:9px;border:2px solid #7d572a33;border-radius:18px;pointer-events:none}\n.crr .crr-cardhead{position:relative;z-index:1;display:flex;justify-content:center;margin-bottom:12px}\n.crr .crr-ribbon{background:#291632;color:#fff;border-radius:99px;padding:7px 15px;font-size:.67rem;font-weight:900;letter-spacing:.11em}\n.crr .crr-words{position:relative;z-index:1;display:grid;gap:9px;max-width:500px;margin:auto}\n.crr .crr-wordrow{display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:8px;min-height:52px;border-radius:14px;background:#2a1737;color:#fff;border:2px solid #e5197c55;padding:7px 9px;box-shadow:0 4px #150b1d}\n.crr .crr-wordrow .crr-n{width:31px;height:31px;border-radius:10px;background:#f5b301;color:#2a1737;display:grid;place-items:center;font-family:'Archivo Black',sans-serif;font-size:.82rem}\n.crr .crr-wordrow .crr-txt{font-family:'Archivo Black',sans-serif;font-size:clamp(.95rem,4.5vw,1.24rem);line-height:1.05}\n.crr .crr-wordrow .crr-state{font-size:.62rem;font-weight:900;color:#d7c6df}\n.crr .crr-wordrow.crr-correct{background:#17443f;border-color:#37d6c0}\n.crr .crr-wordrow.crr-correct .crr-n{background:#37d6c0}\n.crr .crr-wordrow.crr-correct .crr-state{color:#9ff4e7}\n.crr .crr-wordrow.crr-invalid{background:#57172d;border-color:#ff7186}\n.crr .crr-wordrow.crr-invalid .crr-n{background:#ff7186}\n.crr .crr-wordrow.crr-invalid .crr-state{color:#ffd0d8}\n.crr .crr-wordrow.crr-pending{cursor:pointer}\n.crr .crr-wordrow.crr-pending:hover{filter:brightness(1.07)}\n.crr .crr-blind,.crr .crr-preview{position:absolute;inset:0;z-index:6;display:grid;place-items:center;text-align:center;padding:22px;background:#170a25f3;backdrop-filter:blur(4px)}\n.crr .crr-blind{z-index:7;background:linear-gradient(145deg,#261436fb,#11081afb)}\n.crr .crr-blind .crr-big,.crr .crr-preview strong{display:block;font-family:'Archivo Black',sans-serif;font-size:1.55rem;color:var(--oro);margin-bottom:7px}\n.crr .crr-blind p,.crr .crr-preview span{margin:0;color:#e8deef;font-size:.88rem;line-height:1.45}\n.crr .crr-timerzone{display:grid;grid-template-columns:112px 1fr;gap:12px;align-items:center;margin:13px 0 7px}\n.crr .crr-hourglass{width:110px;height:140px;filter:drop-shadow(0 12px 15px #0007);justify-self:center;transform-origin:center}\n.crr .crr-hourglass.crr-urgent{animation:crrPulse .7s infinite}\n@keyframes crrPulse{50%{transform:scale(1.06)}}\n.crr .crr-timebig{font-family:'Archivo Black',sans-serif;font-size:2.6rem;line-height:1;color:var(--oro);text-shadow:0 4px #714308}\n.crr .crr-timelabel{font-size:.62rem;color:#bfafd0;letter-spacing:.12em;font-weight:900;margin-top:3px}\n.crr .crr-bar{height:11px;border-radius:99px;background:#0b0510;border:1px solid #ffffff1a;overflow:hidden;margin:10px 0}\n.crr .crr-bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#37d6c0,#f5b301,#e5197c);transition:width .15s linear}\n.crr .crr-status{min-height:22px;font-size:.72rem;color:#cdbcd8;font-weight:800}\n.crr .crr-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}\n.crr .crr-live-error{position:fixed;inset:0;z-index:70;background:#6e092aef;display:grid;place-items:center;text-align:center;padding:20px;animation:crrFlash .22s ease-out}\n@keyframes crrFlash{from{opacity:.2;transform:scale(1.08)}to{opacity:1;transform:none}}\n.crr .crr-live-error strong{display:block;font-family:'Archivo Black',sans-serif;font-size:clamp(2.2rem,11vw,4.5rem);color:#fff;text-shadow:0 6px #3a0617}\n.crr .crr-live-error b{display:block;color:#ffe087;font-size:1.25rem;margin-top:9px}\n.crr .crr-live-error small{display:block;margin-top:8px;color:#ffd8e1}\n.crr .crr-result{border-radius:23px;padding:19px;background:linear-gradient(145deg,#352047,#1c102a);border:1px solid #f5b30144;box-shadow:0 18px 45px #0006}\n.crr .crr-result h2{font-family:'Archivo Black',sans-serif;color:var(--oro);text-align:center;margin:0 0 12px}\n.crr .crr-roundsummary{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:13px}\n.crr .crr-stat{background:#160b24;border:1px solid #ffffff18;border-radius:12px;padding:9px;text-align:center}\n.crr .crr-stat small{display:block;color:#bfaed0;font-size:.58rem}\n.crr .crr-stat b{display:block;font-family:'Archivo Black',sans-serif;font-size:1.35rem;margin-top:2px}\n.crr .crr-diebox{display:grid;grid-template-columns:112px 1fr;gap:14px;align-items:center;background:#160b24;border:1px solid #ffffff18;border-radius:17px;padding:13px;margin:12px 0}\n.crr .crr-die{width:96px;height:96px;border-radius:20px;background:linear-gradient(145deg,#fff2bb,#f5b301 56%,#c77b16);display:grid;place-items:center;color:#2c1733;font-family:'Archivo Black',sans-serif;font-size:3rem;box-shadow:inset 0 4px #fff7d3,0 9px 0 #8f5713,0 14px 22px #0006;justify-self:center;transform-origin:center}\n.crr .crr-die.crr-roll{animation:crrDieRoll .75s ease-in-out}\n@keyframes crrDieRoll{0%{transform:rotate(0) scale(1)}25%{transform:rotate(16deg) scale(1.08)}50%{transform:rotate(-18deg) scale(.95)}75%{transform:rotate(12deg) scale(1.08)}100%{transform:rotate(0) scale(1)}}\n.crr .crr-calc{font-size:.85rem;color:#ded2e5;line-height:1.5}\n.crr .crr-calc strong{color:#37d6c0;font-family:'Archivo Black',sans-serif;font-size:1.15rem}\n.crr .crr-adjust-list{display:grid;gap:6px;margin:10px 0}\n.crr .crr-adjust{display:grid;grid-template-columns:1fr auto;align-items:center;gap:7px;background:#160b24;border:1px solid #ffffff18;border-radius:11px;padding:8px 10px}\n.crr .crr-adjust b{font-size:.77rem}\n.crr .crr-adjust button{border-radius:9px;background:#4b315c;color:#fff;padding:6px 8px;font-size:.65rem;font-weight:900}\n.crr .crr-online{border-radius:24px;padding:18px;background:linear-gradient(145deg,#2e1b40,#1b1028);border:1px solid #37d6c044;box-shadow:0 18px 45px #0006}\n.crr .crr-online h2{font-family:'Archivo Black',sans-serif;color:var(--oro);text-align:center;margin:0 0 4px}\n.crr .crr-sub{text-align:center;color:#cdbcd8;font-size:.77rem;margin:0 0 15px}\n.crr .crr-form{display:grid;gap:9px}\n.crr .crr-input{width:100%;background:#f6efe2;color:#20102a;border:2px solid #b6a6c4;border-radius:12px;padding:11px 12px;font-weight:800}\n.crr .crr-two{display:grid;grid-template-columns:1fr 1fr;gap:8px}\n.crr .crr-choice{min-height:47px;border-radius:12px;background:#342047;color:#fff;border:1px solid #ffffff20;font-weight:900}\n.crr .crr-choice.crr-sel{background:#37d6c0;color:#073e38;border-color:#8ff0df}\n.crr .crr-divider{display:flex;align-items:center;gap:8px;color:#9584a4;font-size:.68rem;margin:7px 0}\n.crr .crr-divider:before,.crr .crr-divider:after{content:\"\";height:1px;background:#ffffff1a;flex:1}\n.crr .crr-roomcode{font-family:'Archivo Black',sans-serif;text-align:center;font-size:2.5rem;letter-spacing:.16em;color:#37d6c0;background:#130a1e;border-radius:15px;padding:11px;margin:8px 0}\n.crr .crr-teams{display:grid;gap:9px;margin:12px 0}\n.crr .crr-team{border:1px solid #ffffff1a;border-radius:15px;padding:10px;background:#160b24}\n.crr .crr-team h3{margin:0 0 8px;font-family:'Archivo Black',sans-serif;font-size:.86rem;color:var(--oro);display:flex;justify-content:space-between}\n.crr .crr-player{display:flex;align-items:center;gap:7px;padding:6px 8px;border-radius:9px;background:#ffffff08;margin-top:5px;font-size:.76rem}\n.crr .crr-player.crr-host:after{content:\"HOST\";margin-left:auto;font-size:.55rem;color:#f5b301;font-weight:900}\n.crr .crr-player.crr-turn{outline:2px solid #37d6c0}\n.crr .crr-scoreboard{display:grid;gap:6px;margin:8px 0 12px}\n.crr .crr-scoreline{display:flex;justify-content:space-between;align-items:center;background:#160b24;border:1px solid #ffffff15;border-radius:11px;padding:8px 10px}\n.crr .crr-scoreline.crr-active{border-color:#37d6c088;box-shadow:0 0 18px #37d6c022}\n.crr .crr-scoreline b{color:#f5b301}\n.crr .crr-rolebox{text-align:center;border:1px solid #ffffff1a;background:#160b24;border-radius:12px;padding:9px;margin:8px 0;font-size:.75rem;color:#d8cbe0}\n.crr .crr-rolebox strong{color:#37d6c0}\n.crr .crr-conn{min-height:18px;text-align:center;color:#bdaacb;font-size:.68rem;margin-top:7px}\n.crr .crr-host-controls{display:grid;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid #ffffff18}\n.crr .crr-rival-flag{background:#7b1d3e;color:#fff;border-radius:10px;padding:7px 9px;font-size:.64rem;font-weight:900}\n.crr .crr-online-word-actions{display:flex;gap:5px;align-items:center}\n.crr .crr-modal{position:fixed;inset:0;z-index:80;background:#09030fea;display:grid;place-items:center;padding:18px;backdrop-filter:blur(5px)}\n.crr .crr-modal-card{width:min(100%,450px);max-height:90dvh;overflow:auto;background:#2b1a3f;border:1px solid #f5b30155;border-radius:21px;padding:20px;box-shadow:0 20px 55px #0009}\n.crr .crr-modal-card h2{font-family:'Archivo Black',sans-serif;color:#f5b301;margin:0 0 8px}\n.crr .crr-modal-card p,.crr .crr-modal-card li{font-size:.84rem;line-height:1.45;color:#e5dceb}\n.crr .crr-modal-card ul{padding-left:18px}\n.crr .crr-die{width:116px;height:116px;border-radius:0;background:none!important;box-shadow:none!important;display:grid;place-items:center;overflow:visible;transform-origin:50% 78%;}\n.crr .crr-die img{width:116px;height:116px;object-fit:contain;display:block;filter:drop-shadow(0 13px 10px #0007);user-select:none;-webkit-user-drag:none;pointer-events:none}\n.crr .crr-die.crr-die-question{border-radius:24px!important;background:radial-gradient(circle at 34% 25%,#fff2ae,#f5b301 45%,#a95f13 100%)!important;box-shadow:inset 0 3px #fff8cf,0 11px 0 #7e480e,0 18px 24px #0006!important;font-family:'Archivo Black',sans-serif;font-size:3.1rem;color:#2d1735}\n.crr .crr-die.crr-roll{animation:crrRealDiceBounce 1.05s cubic-bezier(.2,.75,.25,1)}\n.crr .crr-die.crr-roll img{animation:crrRealDiceSpin 1.05s cubic-bezier(.2,.75,.25,1)}\n@keyframes crrRealDiceBounce{0%{transform:translateY(0) scale(1)} 18%{transform:translateY(-42px) scale(1.04)} 34%{transform:translateY(4px) scale(.96,1.04)} 47%{transform:translateY(-24px) scale(1.02)} 61%{transform:translateY(2px) scale(.98,1.02)} 73%{transform:translateY(-11px) scale(1.01)} 84%{transform:translateY(1px)} 100%{transform:translateY(0) scale(1)}}\n@keyframes crrRealDiceSpin{0%{transform:rotate(-4deg) scale(.96)} 18%{transform:rotate(74deg) scale(1.08)} 34%{transform:rotate(156deg) scale(.98)} 47%{transform:rotate(245deg) scale(1.06)} 61%{transform:rotate(325deg) scale(.99)} 73%{transform:rotate(390deg) scale(1.03)} 84%{transform:rotate(352deg)} 100%{transform:rotate(360deg) scale(1)}}\n.crr .crr-die-idle{position:relative;background:none!important;box-shadow:none!important}\n.crr .crr-die-idle img{width:116px;height:116px;object-fit:contain;display:block;opacity:.78;filter:drop-shadow(0 13px 10px #0007) brightness(.82);user-select:none;-webkit-user-drag:none;pointer-events:none}\n.crr .crr-die-idle::after{content:\"?\";position:absolute;inset:0;display:grid;place-items:center;font-family:'Archivo Black',sans-serif;font-size:3rem;color:#fff7d9;text-shadow:0 4px 0 #5b2f0d,0 0 12px #000;pointer-events:none}\n.crr .crr-voice-panel{margin:10px 0 12px;padding:11px;border-radius:14px;background:#130A1E;border:1px solid #37D6C03A}\n.crr .crr-voice-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}\n.crr .crr-voice-head strong{font-size:.76rem;color:#37D6C0;letter-spacing:.08em}\n.crr .crr-voice-state{font-size:.64rem;color:#BFAFD0;text-align:right}\n.crr .crr-voice-users{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}\n.crr .crr-voice-user{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:999px;background:#251532;border:1px solid #FFFFFF15;font-size:.68rem;color:#E9DFEF}\n.crr .crr-voice-user i{width:8px;height:8px;border-radius:50%;background:#746680}\n.crr .crr-voice-user.crr-connected i{background:#37D6C0;box-shadow:0 0 8px #37D6C0}\n.crr .crr-voice-user.crr-me{border-color:#F5B30155}\n.crr .crr-voice-controls{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}\n.crr .crr-voice-btn{min-height:40px;border-radius:11px;font-weight:900;background:#432B54;color:#fff;border:1px solid #FFFFFF18}\n.crr .crr-voice-btn.crr-on{background:#37D6C0;color:#073E38}\n.crr .crr-voice-btn.crr-warn{background:#6A1738;color:#fff}\n.crr .crr-voice-help{margin-top:8px;padding:8px 9px;border-radius:10px;background:#FFFFFF08;color:#BFAFD0;font-size:.62rem;line-height:1.4}\n.crr .crr-voice-error{color:#FFB5C1!important}\n.crr .crr-remote-audio-bank{display:none}\n@media(max-width:460px){.crr .crr-mode-grid{grid-template-columns:1fr}\n.crr .crr-mode.crr-online{grid-column:auto}\n.crr .crr-timerzone,.crr .crr-diebox{grid-template-columns:1fr}\n.crr .crr-hourglass{width:96px;height:122px}\n.crr .crr-timebig,.crr .crr-timelabel,.crr .crr-status{text-align:center}\n}\n@media(prefers-reduced-motion:reduce){.crr *,.crr *:before,.crr *:after{animation:none!important;transition:none!important}\n}\n.crr .crr-review{display:block;width:100%;margin:8px 0}\n.crr{padding-bottom:8px}\n.crr .crr-logo{width:min(70%,300px)}\n\n.crr .crr-gamebox{padding:11px}.crr .crr-hud{margin-bottom:6px}.crr .crr-card{padding:12px 12px 13px}.crr .crr-cardhead{margin-bottom:8px}.crr .crr-words{gap:7px}.crr .crr-wordrow{min-height:44px;padding:5px 9px}.crr .crr-timerzone{grid-template-columns:76px 1fr;gap:10px;margin:10px 0 4px}.crr .crr-hourglass{width:70px;height:90px}.crr .crr-timebig{font-size:2.1rem;text-align:left}.crr .crr-timelabel,.crr .crr-status{text-align:left}.crr .crr-bar{margin:7px 0}.crr .crr-mode-grid{grid-template-columns:1fr 1fr}.crr .crr-mode.crr-online{grid-column:1/-1}.crr .crr-mode{min-height:96px}.crr .crr-logo{width:min(48%,210px)}.crr .crr-intro{font-size:.86rem;margin-bottom:10px}.crr .crr-shell{padding:16px 14px}.crr #crr-onlineGame{padding:10px}.crr .crr-scoreboard{grid-template-columns:repeat(auto-fit,minmax(0,1fr));margin:0 0 7px}.crr .crr-scoreline{padding:6px 10px}.crr .crr-voice-panel{margin:0 0 7px;padding:8px}.crr .crr-voice-head{margin-bottom:4px}.crr .crr-voice-users{margin:3px 0;gap:4px}.crr .crr-voice-user{padding:4px 7px}.crr .crr-voice-controls{margin-top:5px}.crr .crr-voice-btn{min-height:34px;font-size:.7rem}.crr #crr-voiceTurnHint{display:none}.crr .crr-rolebox{margin:0 0 7px;padding:7px}.crr #crr-oWords:empty{min-height:150px}.crr #crr-onlineGame{padding:10px}.crr .crr-scoreboard{grid-template-columns:repeat(auto-fit,minmax(0,1fr));margin:0 0 7px}.crr .crr-scoreline{padding:6px 10px}.crr .crr-voice-panel{margin:0 0 7px;padding:8px}.crr .crr-voice-head{margin-bottom:4px}.crr .crr-voice-users{margin:3px 0;gap:4px}.crr .crr-voice-user{padding:4px 7px}.crr .crr-voice-controls{margin-top:5px}.crr .crr-voice-btn{min-height:34px;font-size:.7rem}.crr #crr-voiceTurnHint{display:none}.crr .crr-rolebox{margin:0 0 7px;padding:7px}.crr #crr-oWords:empty{min-height:150px}.crr #crr-onlineGame .crr-gamebox{padding:9px}.crr #crr-onlineGame .crr-wordrow{min-height:40px;padding:4px 8px}.crr #crr-onlineGame .crr-words{gap:6px}.crr #crr-onlineGame .crr-timerzone{grid-template-columns:56px 1fr;margin:8px 0 2px}.crr #crr-onlineGame .crr-hourglass{width:52px;height:68px}.crr #crr-onlineGame .crr-timebig{font-size:1.8rem}.crr #crr-onlineGame .crr-hud>div{padding:5px}.crr #crr-onlineGame .crr-phase{margin:2px 0 5px;min-height:16px}.crr.crr-en-ronda>.ext-volver,.crr .crr-en-ronda .crr-host-controls,.crr .crr-en-ronda #crr-leaveGameBtn,.crr .crr-en-ronda .crr-voice-users,.crr .crr-en-ronda .crr-conn{display:none!important}.crr .crr-en-ronda .crr-voice-panel{padding:6px}.crr #crr-onlineGame .crr-rec{min-height:18px}.crr #crr-onlineGame .crr-cardhead{margin-bottom:6px}.crr #crr-onlineGame .crr-card{padding:10px 11px 11px}\n.crr #crr-localResult{padding:14px}.crr #crr-localResult h2{font-size:1.25rem;margin:0 0 8px}.crr .crr-roundsummary{margin-bottom:8px}.crr .crr-stat{padding:6px}.crr .crr-stat b{font-size:1.15rem}.crr .crr-adjust-list{gap:4px;margin:6px 0}.crr .crr-adjust{padding:5px 8px}.crr #crr-localResult .crr-diebox,.crr #crr-oRoundResult .crr-diebox{grid-template-columns:80px 1fr;padding:8px;margin:8px 0;gap:10px}.crr #crr-localResult .crr-die,.crr #crr-localResult .crr-die img,.crr #crr-oRoundResult .crr-die,.crr #crr-oRoundResult .crr-die img{width:76px;height:76px}.crr #crr-localResult .crr-calc,.crr #crr-oRoundResult .crr-calc{font-size:.8rem}.crr #crr-localResult .crr-calc strong,.crr #crr-oRoundResult .crr-calc strong{font-size:.95rem}.crr .crr-review{height:38px;margin:6px 0}.crr #crr-localResult .crr-primary,.crr #crr-localResult .crr-secondary{min-height:44px}.crr .crr-grupo-card{text-align:center}.crr .crr-grupo-card p{text-align:left}.crr .crr-grupo-badge{display:inline-block;background:#E5197C;color:#fff;border:3px solid #FFE39A;border-radius:99px;padding:6px 16px;font-family:'Archivo Black',sans-serif;font-size:1.5rem;margin-bottom:8px}";
  const HTML="<section id=\"crr-home\" class=\"crr-shell\"><img class=\"crr-logo\" src=\"logo-contra-reloj-rioplatense.svg\" alt=\"Contra Reloj Rioplatense\"><p class=\"crr-intro\">Una tarjeta trae <strong>5 palabras</strong>. Tenés <strong>30 segundos</strong> para lograr que tu equipo adivine la mayor cantidad posible sin decir ninguna de las respuestas.</p><div class=\"crr-mode-title\">👥 JUEGO EN GRUPO · 4+ JUGADORES</div><div class=\"crr-mode-grid\"><button class=\"crr-mode\" id=\"crr-normalBtn\"><span class=\"crr-ico\">▶</span><strong>NORMAL</strong><small>Juntos en un celular. Marcás las acertadas a mano.</small></button><button class=\"crr-mode crr-arb\" id=\"crr-arbBtn\"><span class=\"crr-ico\">🎙️</span><strong>ÁRBITRO</strong><small>Juntos en un celular. Anula la respuesta si la decís.</small></button><button class=\"crr-mode crr-online\" id=\"crr-onlineBtn\"><span class=\"crr-ico\">👥</span><strong>ONLINE DESDE CASA</strong><small>Cada uno en su celular con el audio prendido · 4+ jugadores · mínimo 2 por grupo.</small></button></div><button class=\"crr-secondary\" id=\"crr-rulesBtn\" style=\"margin-top:10px\">CÓMO SE JUEGA</button><p class=\"crr-note\"><strong>ONLINE: 4+ jugadores · mínimo 2 por grupo</strong><br>5 palabras · 30 segundos · <strong>el dado se tira ANTES</strong>: 0 / −1 / −2</p></section><section id=\"crr-localPreRound\" class=\"crr-result\" hidden><h2>Antes de empezar</h2><p class=\"crr-intro\" style=\"margin-bottom:10px\">Primero se tira el dado. El número que salga se descontará de las palabras acertadas en esta ronda.</p><div class=\"crr-diebox\"><div class=\"crr-die crr-die-idle\" id=\"crr-lPreDie\"></div><div class=\"crr-calc\" id=\"crr-lPreCalc\">Todavía no se tiró el dado.<br><strong>Posibles descuentos: 0, −1 o −2.</strong></div></div><button class=\"crr-gold\" id=\"crr-lPreRoll\">🎲 TIRAR DADO</button><button class=\"crr-primary\" id=\"crr-lPreStart\" hidden style=\"margin-top:9px\">VER TARJETA Y EMPEZAR</button><button class=\"crr-secondary\" id=\"crr-lPreHome\" style=\"margin-top:9px\">VOLVER AL INICIO</button></section><section id=\"crr-localGame\" hidden><div class=\"crr-gamebox\"><div class=\"crr-hud\"><div><small>RONDA</small><b id=\"crr-lRound\">1</b></div><div class=\"crr-time\"><small>TIEMPO</small><b id=\"crr-lHudTime\">30</b></div><div><small>ACERTADAS</small><b id=\"crr-lHits\">0/5</b></div><div><small>DADO</small><b id=\"crr-lPenalty\">−0</b></div></div><div class=\"crr-phase\" id=\"crr-lPhase\">MIRÁ LA TARJETA</div><div class=\"crr-rec\" id=\"crr-lRec\" hidden><i></i><span>ÁRBITRO LISTO</span></div><div class=\"crr-card\"><div class=\"crr-cardhead\"><div class=\"crr-ribbon\">5 PALABRAS</div></div><div class=\"crr-words\" id=\"crr-lWords\"></div><div class=\"crr-preview\" id=\"crr-lPreview\"><div><strong>MIRALA BIEN</strong><span id=\"crr-lPreviewTxt\">Empieza en 3…</span></div></div></div><div class=\"crr-timerzone\"><div class=\"crr-hourglass\" id=\"crr-lHourglass\"></div><div><div class=\"crr-timebig\" id=\"crr-lTimeBig\">30</div><div class=\"crr-timelabel\">SEGUNDOS RESTANTES</div><div class=\"crr-bar\"><i id=\"crr-lBar\"></i></div><div class=\"crr-status\" id=\"crr-lStatus\">Preparando ronda…</div></div></div><div class=\"crr-actions\"><button class=\"crr-good\" id=\"crr-lFinish\">TERMINAR RONDA</button><button class=\"crr-secondary\" id=\"crr-lExit\">SALIR</button></div></div></section><section id=\"crr-localResult\" class=\"crr-result\" hidden><h2>Resultado de la ronda</h2><div class=\"crr-roundsummary\"><div class=\"crr-stat\"><small>ACERTADAS</small><b id=\"crr-lrHits\">0</b></div><div class=\"crr-stat\"><small>DADO</small><b id=\"crr-lrDie\">—</b></div><div class=\"crr-stat\"><small>SUMA</small><b id=\"crr-lrPoints\">—</b></div></div><div class=\"crr-adjust-list\" id=\"crr-lrAdjust\"></div><div class=\"crr-diebox\"><div class=\"crr-die\" id=\"crr-lDie\"></div><div class=\"crr-calc\" id=\"crr-lCalc\">El dado de esta ronda ya se tiró antes de empezar.</div></div><audio class=\"crr-review\" id=\"crr-lReview\" controls hidden></audio><button class=\"crr-primary\" id=\"crr-lNext\" style=\"margin-top:9px\">SIGUIENTE RONDA</button><button class=\"crr-secondary\" id=\"crr-lResultHome\" style=\"margin-top:9px\">VOLVER AL INICIO</button></section><section id=\"crr-onlineSetup\" class=\"crr-online\" hidden><h2>Online por equipos</h2><p class=\"crr-sub\">Mínimo 4 jugadores. Cada grupo necesita al menos 2 personas para empezar.</p><div class=\"crr-form\" id=\"crr-onlineChoice\"><button class=\"crr-primary\" id=\"crr-createRoomBtn\">CREAR SALA</button><div class=\"crr-divider\">O</div><button class=\"crr-secondary\" id=\"crr-joinRoomBtn\">UNIRME CON CÓDIGO</button><button class=\"crr-secondary\" id=\"crr-setupBack\">VOLVER</button></div><div class=\"crr-form\" id=\"crr-createForm\" hidden><input class=\"crr-input\" id=\"crr-hostName\" maxlength=\"14\" placeholder=\"Tu nombre\"><div class=\"crr-mode-title\">CANTIDAD DE GRUPOS</div><div class=\"crr-two\"><button class=\"crr-choice crr-sel\" data-teams=\"2\">2 GRUPOS</button><button class=\"crr-choice\" data-teams=\"3\">3 GRUPOS</button></div><button class=\"crr-primary\" id=\"crr-confirmCreate\">CREAR SALA</button><button class=\"crr-secondary crr-backOnline\">ATRÁS</button></div><div class=\"crr-form\" id=\"crr-joinForm\" hidden><input class=\"crr-input\" id=\"crr-joinName\" maxlength=\"14\" placeholder=\"Tu nombre\"><input class=\"crr-input\" id=\"crr-joinCode\" maxlength=\"4\" placeholder=\"CÓDIGO DE SALA\" autocapitalize=\"characters\"><button class=\"crr-primary\" id=\"crr-confirmJoin\">ENTRAR</button><button class=\"crr-secondary crr-backOnline\">ATRÁS</button></div><div class=\"crr-conn\" id=\"crr-setupConn\"></div></section><section id=\"crr-onlineLobby\" class=\"crr-online\" hidden><h2>Sala</h2><p class=\"crr-sub\">Compartí este código. La partida requiere mínimo 2 jugadores por grupo.</p><div class=\"crr-roomcode\" id=\"crr-roomCode\">ABCD</div><div id=\"crr-teamPicker\" hidden><div class=\"crr-mode-title\">ELEGÍ TU GRUPO</div><div class=\"crr-two\" id=\"crr-teamPickerBtns\"></div></div><div class=\"crr-teams\" id=\"crr-lobbyTeams\"></div><div class=\"crr-voice-panel\" id=\"crr-voiceLobbyPanel\"><div class=\"crr-voice-head\"><strong>🎙 VOZ ONLINE</strong><span class=\"crr-voice-state\" id=\"crr-voiceLobbyState\">Todavía no conectada</span></div><div class=\"crr-voice-users\" id=\"crr-voiceLobbyUsers\"></div><div class=\"crr-voice-controls\"><button class=\"crr-voice-btn\" id=\"crr-voiceLobbyConnect\">ACTIVAR MICRÓFONO</button><button class=\"crr-voice-btn crr-warn\" id=\"crr-voiceLobbyMute\" disabled>SILENCIARME</button></div><div class=\"crr-voice-help\"> Cada jugador debe permitir el micrófono. La voz viaja por WebRTC; MQTT solo coordina la conexión. </div></div><div id=\"crr-hostLobbyActions\" hidden><button class=\"crr-primary\" id=\"crr-startMatchBtn\">EMPEZAR PARTIDA</button></div><button class=\"crr-secondary\" id=\"crr-leaveRoomBtn\" style=\"margin-top:8px\">SALIR DE LA SALA</button><div class=\"crr-conn\" id=\"crr-lobbyConn\"></div></section><section id=\"crr-onlineGame\" class=\"crr-online\" hidden><div class=\"crr-scoreboard\" id=\"crr-scoreboard\"></div><div class=\"crr-voice-panel\" id=\"crr-voiceGamePanel\"><div class=\"crr-voice-head\"><strong>🎧 SALA DE VOZ</strong><span class=\"crr-voice-state\" id=\"crr-voiceGameState\">Sin conectar</span></div><div class=\"crr-voice-users\" id=\"crr-voiceGameUsers\"></div><div class=\"crr-voice-controls\"><button class=\"crr-voice-btn\" id=\"crr-voiceGameConnect\">ACTIVAR / RECONECTAR VOZ</button><button class=\"crr-voice-btn crr-warn\" id=\"crr-voiceGameMute\">SILENCIARME</button></div><div class=\"crr-voice-help\" id=\"crr-voiceTurnHint\"> Todos los jugadores pueden escucharse. El árbitro automático analiza solamente el micrófono del descriptor. </div></div><div class=\"crr-rolebox\" id=\"crr-roleBox\"></div><div class=\"crr-gamebox\"><div class=\"crr-hud\"><div><small>GRUPO</small><b id=\"crr-oTeam\">G1</b></div><div class=\"crr-time\"><small>TIEMPO</small><b id=\"crr-oHudTime\">30</b></div><div><small>ACERTADAS</small><b id=\"crr-oHits\">0/5</b></div><div><small>DADO</small><b id=\"crr-oPenalty\">—</b></div></div><div class=\"crr-phase\" id=\"crr-oPhase\">ESPERANDO TURNO</div><div class=\"crr-rec\" id=\"crr-oRec\" hidden><i></i><span>MICRÓFONO</span></div><div class=\"crr-card\"><div class=\"crr-cardhead\"><div class=\"crr-ribbon\">5 PALABRAS</div></div><div class=\"crr-words\" id=\"crr-oWords\"></div><div class=\"crr-blind\" id=\"crr-oBlind\"><div><div class=\"crr-big\">ESPERÁ</div><p id=\"crr-oBlindText\">Todavía no empezó tu turno.</p></div></div><div class=\"crr-preview\" id=\"crr-oPreview\" hidden><div><strong>MIRALA BIEN</strong><span id=\"crr-oPreviewTxt\">Empieza en 3…</span></div></div></div><div class=\"crr-timerzone\"><div class=\"crr-hourglass\" id=\"crr-oHourglass\"></div><div><div class=\"crr-timebig\" id=\"crr-oTimeBig\">30</div><div class=\"crr-timelabel\">SEGUNDOS RESTANTES</div><div class=\"crr-bar\"><i id=\"crr-oBar\"></i></div><div class=\"crr-status\" id=\"crr-oStatus\">Esperando al anfitrión.</div></div></div><button class=\"crr-good\" id=\"crr-oFinish\" hidden>TERMINAR RONDA</button><div id=\"crr-oRoundResult\" hidden><div class=\"crr-roundsummary\" style=\"margin-top:11px\"><div class=\"crr-stat\"><small>ACERTADAS</small><b id=\"crr-orHits\">0</b></div><div class=\"crr-stat\"><small>DADO</small><b id=\"crr-orDie\">—</b></div><div class=\"crr-stat\"><small>PUNTOS</small><b id=\"crr-orPoints\">—</b></div></div><div class=\"crr-adjust-list\" id=\"crr-orAdjust\"></div><audio class=\"crr-review\" id=\"crr-oReview\" controls hidden></audio><div class=\"crr-diebox\"><div class=\"crr-die crr-die-idle\" id=\"crr-oDie\"></div><div class=\"crr-calc\" id=\"crr-oCalc\">El anfitrión revisa la ronda y tira el dado.</div></div></div><div class=\"crr-host-controls\" id=\"crr-hostControls\" hidden><button class=\"crr-primary\" id=\"crr-nextTurnBtn\">PREPARAR SIGUIENTE TURNO</button><button class=\"crr-gold\" id=\"crr-rollOnlineDie\" hidden>🎲 TIRAR DADO ANTES DE EMPEZAR</button><button class=\"crr-primary\" id=\"crr-startOnlineRoundBtn\" hidden>EMPEZAR RONDA</button><button class=\"crr-secondary\" id=\"crr-endMatchBtn\">TERMINAR PARTIDA</button></div></div><button class=\"crr-secondary\" id=\"crr-leaveGameBtn\" style=\"margin-top:9px\">SALIR DE LA SALA</button><div class=\"crr-conn\" id=\"crr-gameConn\"></div></section><div class=\"crr-remote-audio-bank\" id=\"crr-remoteAudioBank\"></div><div class=\"crr-live-error\" id=\"crr-liveError\" hidden><div><strong>¡RESPUESTA DICHA!</strong><b id=\"crr-liveErrorWord\">ROJO</b><small>Esa palabra queda anulada. La ronda continúa.</small></div></div><div class=\"crr-modal\" id=\"crr-rules\" hidden><div class=\"crr-modal-card\"><h2>Cómo se juega</h2><p>Cada tarjeta contiene <strong>5 palabras distintas</strong>. Tenés <strong>30 segundos</strong> para lograr que tu equipo adivine la mayor cantidad.</p><ul><li>Podés describir libremente, pero <strong>no podés decir ninguna de las respuestas</strong> que aparecen en la tarjeta.</li><li>Cuando tu equipo adivina una palabra, se marca como <strong>ACERTADA</strong>.</li><li>Si el descriptor dice una respuesta, esa palabra queda <strong>ANULADA</strong>, pero la ronda continúa con las demás.</li><li><strong>Antes de empezar cada ronda</strong> se tira el dado: <strong>0, 1 o 2</strong>. El equipo sabe desde el principio cuánto se le descontará.</li><li>Puntaje de la ronda: <strong>acertadas − dado</strong>, con mínimo 0.</li><li><strong>Online requiere mínimo 4 personas:</strong> 2 grupos como mínimo, con al menos 2 jugadores en cada grupo.</li><li>Si elegís 3 grupos, necesitás mínimo 6 personas: 2 por grupo.</li><li>En online, los compañeros del descriptor no ven la tarjeta. Los rivales sí la ven para controlar la jugada.</li></ul><button class=\"crr-primary\" id=\"crr-closeRules\">ENTENDÍ</button></div></div><div class=\"crr-modal\" id=\"crr-grupo\" hidden><div class=\"crr-modal-card crr-grupo-card\"><div class=\"crr-grupo-badge\">👥 4+</div><h2>Juego en grupo</h2><p>Contra Reloj se juega con <strong>4 o más personas</strong>: uno describe y su equipo adivina. No se puede jugar solo.</p><p>📱 <strong>Juntos en un celular</strong> (Normal o Árbitro): todos en el mismo lugar, el que describe tiene el celular.</p><p>🏠 <strong>Online desde casa</strong>: cada uno en su celular, entran a la misma sala con el código y juegan con el audio prendido.</p><button class=\"crr-primary\" id=\"crr-grupoOk\">¡DALE, SOMOS 4 O MÁS!</button></div></div><div class=\"crr-modal\" id=\"crr-aviso\" hidden><div class=\"crr-modal-card\"><h2>Contra Reloj</h2><p id=\"crr-avisoTxt\"></p><button class=\"crr-primary\" id=\"crr-avisoOk\">ENTENDÍ</button></div></div>";
  const SEG=30,PREVIA=3;
  const K_RECORD="gya_contra_reloj_record",K_PARTIDAS="gya_contra_reloj_partidas",K_ACIERTOS="gya_contra_reloj_aciertos";
  const PANTALLAS=["#home","#localPreRound","#localGame","#localResult","#onlineSetup","#onlineLobby","#onlineGame"];
  let raiz=null;
  const $=s=>raiz?raiz.querySelector(s.replace(/#([A-Za-z])/g,"#crr-$1")):null;
  function pantalla(id){PANTALLAS.forEach(s=>{const el=$(s);if(el)el.hidden=s!==id;});const sh=document.getElementById("extShell");if(sh)sh.scrollTop=0;}
  function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function norm(s){return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toUpperCase().replace(/[^A-Z0-9Ñ ]+/g," ").replace(/\s+/g," ").trim();}
  function contiene(texto,termino){
    const t=" "+norm(texto)+" ",w=norm(termino);if(!w)return false;
    return t.includes(" "+w+" ")||t.includes(" "+w+"S ")||t.includes(" "+w+"ES ")||t.includes(" "+w.replace(/ /g,"")+" ");
  }
  function tarjetas(){const t=window.CONTRA_RELOJ_TARJETAS;return Array.isArray(t)&&t.length?t:[["MATE","RAMBLA","TANGO","ASADO","MURGA"]];}
  function mezclar(lista){const a=[...lista];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  const puntaje=(h,d)=>Math.max(0,h-d);
  const tirarValor=()=>Math.floor(Math.random()*3);
  const contar=st=>st.filter(x=>x==="correct").length;
  function num(k){try{const v=Number(localStorage.getItem(k));return Number.isFinite(v)&&v>=0?v:0;}catch(e){return 0;}}
  function guardarNum(k,v){try{localStorage.setItem(k,String(v));}catch(e){}}
  function aviso(texto){
    const capa=$("#aviso");if(!capa)return;
    $("#avisoTxt").textContent=texto;capa.hidden=false;
  }

  /* DADO (PNG en assets/extensiones/contra-reloj/) */
  const dadoSrc=v=>"assets/extensiones/contra-reloj/dado-"+(v===1||v===2?v:0)+".png";
  function mostrarDado(el,v){
    if(!el)return;el.classList.remove("crr-die-question","crr-die-idle","crr-die-load-error");
    const img=new Image();img.alt="Dado "+v;img.src=dadoSrc(v);
    img.onerror=()=>{el.classList.add("crr-die-load-error");el.textContent=String(v);};
    el.replaceChildren(img);
  }
  function dadoPregunta(el){
    if(!el)return;el.classList.remove("crr-die-question","crr-die-load-error");el.classList.add("crr-die-idle");
    const img=new Image();img.alt="Dado listo para tirar";img.src=dadoSrc(0);
    img.onerror=()=>{el.classList.remove("crr-die-idle");el.classList.add("crr-die-question");el.textContent="?";};
    el.replaceChildren(img);
  }
  // El valor se decide ANTES de animar; la animación alterna caras y
  // termina siempre en ese valor.
  function animarDado(el,valor,listo){
    if(!el){listo&&listo();return;}
    el.classList.remove("crr-roll");void el.offsetWidth;el.classList.add("crr-roll");
    let t=0;const giro=setInterval(()=>{
      mostrarDado(el,t%3);
      if(++t>9){clearInterval(giro);mostrarDado(el,valor);setTimeout(()=>el.classList.remove("crr-roll"),220);listo&&listo();}
    },85);
    return giro;
  }

  /* SONIDOS CORTOS */
  function pitidoError(){
    try{const A=window.AudioContext||window.webkitAudioContext,c=new A(),o=c.createOscillator(),g=c.createGain();o.type="square";o.frequency.value=190;g.gain.value=.22;o.connect(g);g.connect(c.destination);o.start();o.frequency.exponentialRampToValueAtTime(95,c.currentTime+.26);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.31);o.stop(c.currentTime+.33);setTimeout(()=>c.close().catch(()=>{}),600);}catch(e){}
  }
  function pitidoFin(){
    try{const A=window.AudioContext||window.webkitAudioContext,c=new A(),n=c.currentTime;[0,.18,.36].forEach((d,i)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=i===2?430:650;o.type="square";g.gain.setValueAtTime(.001,n+d);g.gain.exponentialRampToValueAtTime(.18,n+d+.015);g.gain.exponentialRampToValueAtTime(.001,n+d+.14);o.connect(g);g.connect(c.destination);o.start(n+d);o.stop(n+d+.15);});setTimeout(()=>c.close().catch(()=>{}),900);}catch(e){}
  }

  /* RELOJ DE ARENA */
  function relojSVG(){
    return'<svg viewBox="0 0 140 180" aria-hidden="true"><ellipse cx="70" cy="171" rx="40" ry="6" fill="#0005"/><rect x="22" y="6" width="96" height="16" rx="8" fill="#F5B301" stroke="#FFF0BD" stroke-width="2"/><rect x="22" y="158" width="96" height="16" rx="8" fill="#F5B301" stroke="#FFF0BD" stroke-width="2"/><rect x="30" y="18" width="14" height="144" rx="7" fill="#9B5929"/><rect x="96" y="18" width="14" height="144" rx="7" fill="#9B5929"/><path d="M50 25h40c0 25-11 38-20 48-9-10-20-23-20-48z" fill="#EAF7FF22" stroke="#DDF5FF99" stroke-width="2.5"/><path d="M50 155h40c0-25-11-38-20-48-9 10-20 23-20 48z" fill="#EAF7FF22" stroke="#DDF5FF99" stroke-width="2.5"/><path class="sandTop" d="M58 31h24c-1 21-7 29-12 37-5-8-11-16-12-37z" fill="#F5B301"/><rect class="sandStream" x="69" y="69" width="2.5" height="38" rx="2" fill="#F7CE70"/><path class="sandBottom" d="M59 149h22c-1-12-5-20-11-29-6 9-10 17-11 29z" fill="#E5197C"/><path d="M57 29c-5 9-4 27 0 36M58 116c-4 8-4 22 1 31" fill="none" stroke="#FFFFFF88" stroke-width="3" stroke-linecap="round"/></svg>';
  }
  function reloj(pre,quedan){
    if(!raiz)return;
    const p=Math.max(0,quedan/SEG),n=Math.max(0,Math.ceil(quedan));
    $("#"+pre+"HudTime").textContent=n;$("#"+pre+"TimeBig").textContent=n;$("#"+pre+"Bar").style.width=(p*100)+"%";
    const h=$("#"+pre+"Hourglass"),arriba=h.querySelector(".sandTop"),abajo=h.querySelector(".sandBottom"),chorro=h.querySelector(".sandStream");
    if(!arriba)return;
    arriba.style.transform="scaleY("+Math.max(.08,p)+")";arriba.style.transformOrigin="50% 31px";
    abajo.style.transform="scaleY("+Math.max(.4,1.4-p)+")";abajo.style.transformOrigin="50% 149px";
    chorro.style.opacity=quedan>0?1:.1;h.classList.toggle("crr-urgent",quedan<=8&&quedan>0);
  }

  /* MICRÓFONO + ÁRBITRO (solo el micrófono LOCAL). La grabación queda en
     memoria para revisar una disputa: no se sube ni se guarda. */
  let mic=null,grabador=null,trozos=[],audioUrl="",voz=null,oido="",arbTarjeta=null,arbEstados=null,arbAlAcertar=null;
  async function micPreparar(){
    const vozOnline=window.ContraRelojVoz&&ContraRelojVoz.stream();
    if(vozOnline){mic=vozOnline;return mic;}
    if(!navigator.mediaDevices?.getUserMedia)throw new Error("Este navegador no permite usar el micrófono.");
    if(!mic||!mic.active)mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
    return mic;
  }
  function micCerrar(){
    const vozOnline=window.ContraRelojVoz&&ContraRelojVoz.stream();
    if(mic&&mic!==vozOnline)mic.getTracks().forEach(t=>t.stop());
    mic=null;
    if(voz){try{voz.onend=null;voz.stop();}catch(e){}voz=null;}
    if(grabador&&grabador.state!=="inactive"){try{grabador.stop();}catch(e){}}
    grabador=null;
  }
  // En Android el reconocedor de voz no puede usar el micrófono mientras
  // otro stream (getUserMedia/MediaRecorder) lo tiene tomado: ahí se le da
  // prioridad al árbitro y no se graba el clip de revisión.
  const ANDROID=/Android/i.test(navigator.userAgent||"");
  const SR_DISPONIBLE=()=>!!(window.SpeechRecognition||window.webkitSpeechRecognition);
  const necesitaMicPropio=()=>!(ANDROID&&SR_DISPONIBLE());
  function arbitroIniciar(tarjeta,estados,alDecir,alEstado){
    arbTarjeta=tarjeta;arbEstados=estados;arbAlAcertar=alDecir;oido="";trozos=[];
    const estado=t=>{try{alEstado&&alEstado(t);}catch(e){}};
    if(audioUrl){try{URL.revokeObjectURL(audioUrl);}catch(e){}audioUrl="";}
    if(mic&&!(ANDROID&&SR_DISPONIBLE())){try{grabador=new MediaRecorder(mic);grabador.ondataavailable=e=>{if(e.data?.size)trozos.push(e.data);};grabador.start();}catch(e){grabador=null;}}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return false;
    voz=new SR();voz.lang="es-UY";voz.continuous=true;voz.interimResults=true;voz.maxAlternatives=1;
    let fallos=0;
    voz.onstart=()=>estado("● ÁRBITRO ESCUCHANDO…");
    voz.onresult=e=>{
      fallos=0;
      let parcial="",final="";
      for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript||"";if(e.results[i].isFinal)final+=" "+t;else parcial+=" "+t;}
      if(final)oido+=" "+final;
      const escuchado=(oido+" "+parcial).trim();
      if(!arbTarjeta)return;
      const ultimo=norm(parcial||final).split(" ").slice(-4).join(" ");
      if(ultimo)estado("● ÁRBITRO OYÓ: «"+ultimo+"»");
      arbTarjeta.forEach((w,i)=>{if(arbEstados[i]==="pending"&&contiene(escuchado,w)){arbEstados[i]="invalid";errorEnVivo(w);if(arbAlAcertar)arbAlAcertar(i,w);}});
    };
    voz.onerror=e=>{
      const err=e&&e.error||"";
      if(err==="no-speech"||err==="aborted")return;
      fallos++;
      if(err==="not-allowed"||err==="service-not-allowed"){estado("ÁRBITRO SIN PERMISO DE MICRÓFONO");arbTarjeta=null;}
      else if(err==="audio-capture")estado("ÁRBITRO: EL MICRÓFONO ESTÁ OCUPADO");
      else if(err==="network")estado("ÁRBITRO: SIN INTERNET PARA ESCUCHAR");
      else if(err==="language-not-supported"&&voz){voz.lang="es-AR";}
      else estado("ÁRBITRO CON PROBLEMAS ("+err+")");
    };
    voz.onend=()=>{if(arbTarjeta&&voz&&fallos<6){setTimeout(()=>{if(arbTarjeta&&voz){try{voz.start();}catch(e){}}},fallos?400:60);}};
    try{voz.start();return true;}catch(e){return false;}
  }
  function arbitroDetener(){
    return new Promise(listo=>{
      arbTarjeta=null;arbAlAcertar=null;
      if(voz){try{voz.onend=null;voz.stop();}catch(e){}voz=null;}
      if(!grabador||grabador.state==="inactive"){listo();return;}
      const g=grabador;grabador=null;
      g.onstop=()=>{try{audioUrl=URL.createObjectURL(new Blob(trozos,{type:g.mimeType||"audio/webm"}));}catch(e){audioUrl="";}listo();};
      try{g.stop();}catch(e){listo();}
    });
  }
  function revision(id){
    const a=$(id);if(!a)return;
    if(audioUrl){a.src=audioUrl;a.hidden=false;}else{a.removeAttribute("src");a.hidden=true;}
  }
  function errorEnVivo(palabra){
    const capa=$("#liveError");if(!capa)return;
    $("#liveErrorWord").textContent=palabra;capa.hidden=false;pitidoError();
    setTimeout(()=>{if(raiz)capa.hidden=true;},1250);
  }

  /* FILAS DE PALABRAS */
  function filas(cont,tarjeta,estados,{editable=false,rival=false,alAcertar=null,alMarcar=null}={}){
    if(!cont)return;cont.innerHTML="";
    tarjeta.forEach((w,i)=>{
      const fila=document.createElement("div");fila.className="crr-wordrow crr-"+estados[i];
      const st=estados[i]==="correct"?"ACERTADA":estados[i]==="invalid"?"ANULADA":"PENDIENTE";
      fila.innerHTML='<span class="crr-n">'+(i+1)+'</span><span class="crr-txt">'+esc(w)+'</span><span class="crr-state">'+st+'</span>';
      if(editable&&estados[i]==="pending")fila.onclick=()=>alAcertar&&alAcertar(i);
      if(rival&&estados[i]==="pending"){
        const wrap=document.createElement("span");wrap.className="crr-online-word-actions";
        const b=document.createElement("button");b.type="button";b.className="crr-rival-flag";b.textContent="⚠ MARCAR";
        b.onclick=e=>{e.stopPropagation();alMarcar&&alMarcar(i,w);};
        wrap.appendChild(b);fila.lastElementChild.replaceWith(wrap);
      }
      cont.appendChild(fila);
    });
  }

  /* MODO LOCAL (Normal / Árbitro) */
  let modo="normal",mazo=[],ronda=0,tarjeta=[],estados=[],tReloj=null,tPrevia=null,tDado=null,activa=false,dado=null,total=0,rondaSinCerrar=false;
  function limpiarTimers(){clearInterval(tReloj);clearInterval(tPrevia);clearInterval(tDado);tReloj=tPrevia=tDado=null;}
  async function empezarLocal(m){
    modo=m;
    if(m==="arbitro"){
      if(!SR_DISPONIBLE())aviso("Este navegador no tiene árbitro automático (probá con Chrome). Se graba la ronda y marcás a mano.");
      if(necesitaMicPropio()){try{await micPreparar();}catch(e){aviso("El modo Árbitro necesita permiso de micrófono. "+(e.message||""));return;}}
    }
    mazo=mezclar(tarjetas());ronda=0;total=0;dado=null;rondaSinCerrar=false;
    guardarNum(K_PARTIDAS,num(K_PARTIDAS)+1);
    previaLocal();
  }
  function previaLocal(){
    limpiarTimers();activa=false;dado=null;pantalla("#localPreRound");
    dadoPregunta($("#lPreDie"));
    $("#lPreCalc").innerHTML="Ronda "+(ronda+1)+". Primero tirá el dado.<br><strong>El equipo sabrá el descuento antes de ver la tarjeta.</strong>";
    $("#lPreRoll").hidden=false;$("#lPreRoll").disabled=false;$("#lPreStart").hidden=true;
  }
  function tirarLocal(){
    if(dado!==null||tDado)return;
    const valor=tirarValor();$("#lPreRoll").disabled=true;
    tDado=animarDado($("#lPreDie"),valor,()=>{
      tDado=null;dado=valor;if(!raiz)return;
      $("#lPreCalc").innerHTML=valor===0?"Salió <strong>0</strong>. Esta ronda no descuenta ninguna palabra."
        :"Salió <strong>"+valor+"</strong>. Esta ronda descontará <strong>"+valor+"</strong> "+(valor===1?"palabra":"palabras")+" de las acertadas.";
      $("#lPreRoll").hidden=true;$("#lPreRoll").disabled=false;$("#lPreStart").hidden=false;
    });
  }
  function pintarLocal(){filas($("#lWords"),tarjeta,estados,{editable:activa,alAcertar:acertarLocal});$("#lHits").textContent=contar(estados)+"/5";}
  function rondaLocal(){
    limpiarTimers();activa=false;pantalla("#localGame");
    tarjeta=mazo[ronda%mazo.length];estados=Array(5).fill("pending");
    $("#lRound").textContent=ronda+1;$("#lHits").textContent="0/5";$("#lPenalty").textContent="−"+(dado??0);
    $("#lPhase").textContent="MIRÁ LA TARJETA";$("#lStatus").textContent="Tenés 3 segundos para verla.";
    $("#lRec").hidden=modo!=="arbitro";$("#lRec").classList.remove("crr-on");
    pintarLocal();$("#lPreview").hidden=false;reloj("l",SEG);
    let n=PREVIA;$("#lPreviewTxt").textContent="Empieza en "+n+"…";
    tPrevia=setInterval(()=>{n--;if(n>0)$("#lPreviewTxt").textContent="Empieza en "+n+"…";else{clearInterval(tPrevia);tPrevia=null;arrancarLocal();}},1000);
  }
  function arrancarLocal(){
    $("#lPreview").hidden=true;activa=true;
    $("#lPhase").textContent="¡DESCRIBÍ LAS 5!";
    $("#lStatus").textContent=(modo==="arbitro"?"Árbitro escuchando en vivo. ":"")+"Esta ronda descuenta "+(dado??0)+" al final.";
    pintarLocal();
    if(modo==="arbitro"){
      $("#lRec").classList.add("crr-on");$("#lRec span").textContent="● PREPARANDO ÁRBITRO…";
      if(!arbitroIniciar(tarjeta,estados,()=>{pintarLocal();chequearFinLocal();},t=>{const sp=$("#lRec span");if(sp&&activa)sp.textContent=t;}))$("#lRec span").textContent="● GRABANDO · SIN ÁRBITRO AUTOMÁTICO EN ESTE NAVEGADOR";
    }
    const inicio=Date.now();
    tReloj=setInterval(()=>{const q=SEG-(Date.now()-inicio)/1000;reloj("l",q);if(q<=0)terminarLocal();},120);
  }
  function acertarLocal(i){
    if(!activa||estados[i]!=="pending")return;
    estados[i]="correct";pintarLocal();chequearFinLocal();
  }
  function chequearFinLocal(){if(estados.every(s=>s!=="pending"))terminarLocal();}
  async function terminarLocal(){
    if(!activa)return;activa=false;limpiarTimers();
    if(modo==="arbitro"){await arbitroDetener();if(!raiz)return;$("#lRec").classList.remove("crr-on");}
    pitidoFin();resultadoLocal();
  }
  function resultadoLocal(){
    pantalla("#localResult");rondaSinCerrar=true;
    mostrarDado($("#lDie"),dado??0);
    ajustesLocal();calcLocal();revision("#lReview");
  }
  function ajustesLocal(){
    const c=$("#lrAdjust");c.innerHTML="";
    tarjeta.forEach((w,i)=>{
      const d=document.createElement("div");d.className="crr-adjust";
      d.innerHTML="<b>"+esc(w)+" · "+(estados[i]==="correct"?"ACERTADA":estados[i]==="invalid"?"ANULADA":"NO ACERTADA")+"</b>";
      const b=document.createElement("button");b.type="button";b.textContent="CAMBIAR";
      b.onclick=()=>{estados[i]=estados[i]==="correct"?"pending":"correct";ajustesLocal();calcLocal();};
      d.appendChild(b);c.appendChild(d);
    });
  }
  function calcLocal(){
    const h=contar(estados),d=dado??0,pts=puntaje(h,d);
    $("#lrHits").textContent=h;$("#lrDie").textContent="−"+d;$("#lrPoints").textContent=pts;
    $("#lCalc").innerHTML=h+" acertadas − "+d+" que salió <strong>antes de empezar</strong> = <strong>"+pts+" puntos</strong><br>Total de la partida: "+(total+pts);
  }
  // Suma la ronda a la partida y a las estadísticas (una sola vez).
  function cerrarRondaLocal(){
    if(!rondaSinCerrar)return;rondaSinCerrar=false;
    const h=contar(estados),pts=puntaje(h,dado??0);total+=pts;
    guardarNum(K_ACIERTOS,num(K_ACIERTOS)+h);
    if(total>num(K_RECORD))guardarNum(K_RECORD,total);
  }
  function aInicio(){limpiarTimers();activa=false;cerrarRondaLocal();arbitroDetener();micCerrar();pantalla("#home");}

  function abrir(contenedor){
    salir();
    if(!document.getElementById("crrEstilos")){const st=document.createElement("style");st.id="crrEstilos";st.textContent=CSS;document.head.appendChild(st);}
    raiz=document.createElement("div");raiz.className="crr";
    raiz.innerHTML='<button type="button" class="ext-volver" id="crr-volver">⟵ Extensiones</button><main class="crr-app">'+HTML+'</main>';
    contenedor.appendChild(raiz);
    $("#volver").onclick=()=>Extensiones.abrirLobby();
    $("#lHourglass").innerHTML=relojSVG();$("#oHourglass").innerHTML=relojSVG();
    $("#normalBtn").onclick=()=>empezarLocal("normal");
    $("#arbBtn").onclick=()=>empezarLocal("arbitro");
    $("#lPreRoll").onclick=tirarLocal;
    $("#lPreStart").onclick=rondaLocal;
    $("#lPreHome").onclick=aInicio;
    $("#lFinish").onclick=terminarLocal;
    $("#lExit").onclick=aInicio;
    $("#lNext").onclick=()=>{cerrarRondaLocal();ronda++;previaLocal();};
    $("#lResultHome").onclick=aInicio;
    $("#avisoOk").onclick=()=>{$("#aviso").hidden=true;};
    $("#rulesBtn").onclick=()=>{$("#rules").hidden=false;};
    $("#closeRules").onclick=()=>{$("#rules").hidden=true;};
    $("#rules").onclick=e=>{if(e.target===$("#rules"))$("#rules").hidden=true;};
    dadoPregunta($("#lPreDie"));dadoPregunta($("#oDie"));mostrarDado($("#lDie"),0);
    if(window.ContraRelojOnline)ContraRelojOnline.iniciar({
      $,raiz:()=>raiz,pantalla,esc,filas,reloj,mostrarDado,dadoPregunta,animarDado,tirarValor,puntaje,contar,tarjetas,
      micPreparar,necesitaMicPropio,arbitroIniciar,arbitroDetener,revision,pitidoFin,aviso,SEG,PREVIA,
      sumarAciertos:h=>guardarNum(K_ACIERTOS,num(K_ACIERTOS)+h),
      sumarPartida:()=>guardarNum(K_PARTIDAS,num(K_PARTIDAS)+1)
    });
    $("#grupoOk").onclick=()=>{$("#grupo").hidden=true;};
    pantalla("#home");
    $("#grupo").hidden=false;
  }
  function salir(){
    limpiarTimers();activa=false;
    if(raiz)cerrarRondaLocal();
    if(window.ContraRelojOnline)ContraRelojOnline.salir();
    arbitroDetener();micCerrar();
    if(audioUrl){try{URL.revokeObjectURL(audioUrl);}catch(e){}audioUrl="";}
    raiz=null;
  }
  addEventListener("pagehide",()=>{if(raiz)salir();});
  return{abrir,salir,mejorPuntaje:()=>num(K_RECORD),partidas:()=>num(K_PARTIDAS),aciertos:()=>num(K_ACIERTOS)};
})();
window.ContraRelojRioplatense=ContraRelojRioplatense;
