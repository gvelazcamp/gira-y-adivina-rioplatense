/* Voz a texto dentro del celular (Whisper con transformers.js, sin servidor).
   La librería está guardada en lib/transformers (Apache-2.0, v3.7.6); el
   modelo (Xenova/whisper-tiny, ~40 MB) se baja de Hugging Face la primera vez
   y queda en la caché del navegador. Lo usa Canta la Canción para pasar a
   texto lo grabado (en Android la grabación y el reconocimiento de voz del
   sistema no pueden usar el micrófono a la vez). */
const VozATexto=(()=>{
  const MODELO="Xenova/whisper-tiny";
  /* Frases que Whisper inventa con silencio o ruido. */
  const INVENTOS=/amara\.org|suscr[ií]bete|subt[ií]tulos|gracias por ver/i;
  let carga=null,avance=null;
  function precargar(alAvanzar){
    if(alAvanzar)avance=alAvanzar;
    if(!carga)carga=(async()=>{
      const T=await import(new URL("lib/transformers/transformers.min.js",location.href).href);
      T.env.allowLocalModels=false;
      T.env.backends.onnx.wasm.wasmPaths=new URL("lib/transformers/",location.href).href;
      const bajado={};
      return T.pipeline("automatic-speech-recognition",MODELO,{dtype:"q8",progress_callback:p=>{
        if(!p||p.status!=="progress"||!p.total)return;bajado[p.file]=[p.loaded,p.total];
        let a=0,t=0;for(const k in bajado){a+=bajado[k][0];t+=bajado[k][1];}
        if(avance)try{avance(Math.round(a/t*100));}catch(e){}
      }});
    })().catch(e=>{carga=null;throw e;});
    return carga;
  }
  /* Audio grabado (Blob) → Float32Array mono a 16 kHz, como lo pide Whisper. */
  async function a16k(blob){
    const AC=window.AudioContext||window.webkitAudioContext,ctx=new AC();
    try{
      const buf=await new Promise((ok,mal)=>blob.arrayBuffer().then(b=>ctx.decodeAudioData(b,ok,mal)).catch(mal));
      const OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext,n=Math.max(1,Math.ceil(buf.duration*16000));
      const off=new OAC(1,n,16000),src=off.createBufferSource();src.buffer=buf;src.connect(off.destination);src.start();
      const r=await off.startRendering();return r.getChannelData(0);
    }finally{try{ctx.close();}catch(e){}}
  }
  async function transcribir(blob,alAvanzar){
    const asr=await precargar(alAvanzar);
    const audio=await a16k(blob);
    const r=await asr(audio,{language:"spanish",task:"transcribe",chunk_length_s:30});
    const t=String(r&&r.text||"").replace(/\s+/g," ").trim();
    return INVENTOS.test(t)?"":t;
  }
  const disponible=()=>!!(window.WebAssembly&&(window.AudioContext||window.webkitAudioContext)&&(window.OfflineAudioContext||window.webkitOfflineAudioContext));
  return{precargar,transcribir,disponible};
})();
window.VozATexto=VozATexto;
