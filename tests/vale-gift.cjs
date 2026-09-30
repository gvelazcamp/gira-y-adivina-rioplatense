const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
for(const [,script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script);
const source=html.slice(html.indexOf('function cargarMeta(){'),html.indexOf('let meta=cargarMeta();'));
function profile(name,meta,rank=name,failWrite=false){
  const data=new Map([['gya_nombre',name],['gya_ranking_perfil',JSON.stringify({apodo:rank})]]);
  if(meta)data.set('gya_mundo_meta',JSON.stringify(meta));
  const ctx=vm.createContext({METAK:'gya_mundo_meta',VIDAS_MAX:5,localStorage:{
    getItem:k=>data.get(k)||null,setItem:(k,v)=>{if(failWrite)throw Error('storage unavailable');data.set(k,v);}
  }});
  vm.runInContext(source,ctx);
  return {load:()=>vm.runInContext('cargarMeta()',ctx),data};
}
const original={monedas:5741,monedasGanadasTotal:6491,vidas:3,mejorRachaVictorias:7};
const vale=profile('Vale',original);
let m=vale.load();
assert.equal(m.monedas,53741);assert.equal(m.monedasGanadasTotal,54491);
assert.equal(m.vidas,3);assert.equal(m.mejorRachaVictorias,7);
assert.equal(vale.load().monedas,53741,'reload must not pay twice');
m.monedas-=750;vale.data.set('gya_mundo_meta',JSON.stringify(m));
assert.equal(vale.load().monedas,52991,'spending must stay spent');
assert.equal(profile('Vale',m).load().monedas,52991,'restoring a credited backup must not pay twice');
assert.equal(profile('Gonzalo',original).load().monedas,5741,'other players unchanged');
assert.equal(profile('Vale',original,'Otro').load().monedas,5741,'ranking identity must match');
assert.equal(profile('Vale',null).load().monedas,500,'new profile is not the existing recipient');
assert.equal(profile('Vale',original,'Vale',true).load().monedas,5741,'no credit without persisted receipt');
const hidden=JSON.parse(html.match(/const RK_APODOS_OCULTOS=(\[[^;]+\]);/)[1]);
assert(!hidden.includes('vale'));assert(hidden.includes('testuser'));
console.log('PASS Vale visible; +48000 once; reload, spending, restore, identity and storage failure');
