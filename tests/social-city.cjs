const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};

(async()=>{
  const server=http.createServer((req,res)=>{
    const pathname=new URL(req.url,'http://local').pathname;
    const file=path.join(root,pathname==='/'?'index.html':pathname);
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});
  try{
    for(const viewport of [{width:360,height:780},{width:1280,height:900}]){
      const ctx=await browser.newContext({viewport,isMobile:viewport.width===360,hasTouch:viewport.width===360,serviceWorkers:'block'});
      const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.fulfill({status:200,body:''}));
      await page.addInitScript(()=>{
        localStorage.setItem('gya_bienvenida_vista','1');
        localStorage.setItem('gya_nombre','Gonzalo');localStorage.setItem('gya_avatar','avatar-01');localStorage.setItem('gya_pais','uruguay');
        localStorage.setItem('gya_ranking_perfil',JSON.stringify({apodo:'Gonzalo'}));
        window.__rows=[
          {grupo:'global',apodo:'Ana',monedas_totales:900,ciudades_ganadas:2,mejor_racha:3,logros:1,estado_juego:{localStorage:{gya_ciudad:'Salto',gya_pais:'uruguay'}}},
          {grupo:'usuarios',apodo:'Vale',monedas_totales:800,ciudades_ganadas:1,mejor_racha:2,logros:1,estado_juego:{localStorage:{gya_ciudad:'Buenos Aires',gya_pais:'argentina'}}},
          {grupo:'global',apodo:'Antiguo',monedas_totales:700,ciudades_ganadas:0,mejor_racha:0,logros:0,estado_juego:{localStorage:{}}},
          {grupo:'usuarios',apodo:'Prueba',monedas_totales:650,ciudades_ganadas:0,mejor_racha:0,logros:0,estado_juego:{localStorage:{gya_ciudad:'<img src=x>'}}},
          {grupo:'global',apodo:'Gonzalo',monedas_totales:600,ciudades_ganadas:1,mejor_racha:1,logros:0,estado_juego:{localStorage:{gya_pais:'uruguay'}}}
        ];
        window.__upserts=[];
        window.supabase={createClient:()=>({from:()=>({
          upsert(row){window.__upserts.push(row);const i=window.__rows.findIndex(x=>x.grupo===row.grupo&&x.apodo===row.apodo);if(i<0)window.__rows.push(row);else window.__rows[i]={...window.__rows[i],...row};return Promise.resolve({data:null,error:null});},
          select(){const filters=[];let order=null;const chain={
            eq(k,v){filters.push(x=>x[k]===v);return this;},
            in(k,values){filters.push(x=>values.includes(x[k]));return this;},
            ilike(k,v){filters.push(x=>String(x[k]).toLowerCase()===String(v).toLowerCase());return this;},
            limit(){return this;},
            order(k,options){order={k,options};return this;},
            then(resolve,reject){let data=window.__rows.filter(x=>filters.every(fn=>fn(x)));if(order)data.sort((a,b)=>order.options&&order.options.ascending===false?Number(b[order.k]||0)-Number(a[order.k]||0):String(a[order.k]).localeCompare(String(b[order.k])));return Promise.resolve({data,error:null}).then(resolve,reject);}
          };return chain;}
        })})};
      });
      await page.goto(base);
      await page.evaluate(()=>{document.querySelector('#splash')?.remove();document.querySelectorAll('.capa.ver').forEach(el=>el.classList.remove('ver'));});
      await page.locator('#bSocialGrande').click();
      assert.match(await page.locator('#socialCiudadInfo').textContent(),/Ciudad no indicada/);
      assert(await page.locator('#socialContinuar').isVisible(),'Social abierto para todos');
      await page.locator('#socialEditarCiudad').click();
      await page.locator('#perfilCiudad').fill('  Montevideo  ');
      if(process.env.UI_SCREENSHOTS){fs.mkdirSync(process.env.UI_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'perfil-ciudad-'+viewport.width+'.png')});}
      await page.locator('#perfilContinuar').click();
      assert.equal(await page.evaluate(()=>localStorage.getItem('gya_ciudad')),'Montevideo');
      assert(await page.evaluate(()=>window.__upserts.some(row=>row.grupo==='usuarios'&&row.estado_juego?.localStorage?.gya_ciudad==='Montevideo')),'la ciudad se sincroniza con el perfil');
      await page.locator('#bSocialGrande').click();
      assert.match(await page.locator('#socialCiudadInfo').textContent(),/Montevideo/);
      await page.locator('#socialContinuar').click();
      await page.locator('#usrLista .rk-fila').filter({hasText:'Ana'}).locator('.rk-ciudad').waitFor();
      assert.match(await page.locator('#usrLista .rk-fila').filter({hasText:'Ana'}).locator('.rk-ciudad').textContent(),/Salto/);
      assert.match(await page.locator('#usrLista .rk-fila').filter({hasText:'Vale'}).locator('.rk-ciudad').textContent(),/Buenos Aires/);
      assert.match(await page.locator('#usrLista .rk-fila').filter({hasText:'Antiguo'}).locator('.rk-ciudad').textContent(),/Ciudad no indicada/);
      assert.equal(await page.locator('#usrLista .rk-fila').filter({hasText:'Prueba'}).locator('.rk-ciudad img').count(),0,'la ciudad no inserta HTML de otro jugador');
      if(process.env.UI_SCREENSHOTS)await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'social-ciudades-'+viewport.width+'.png')});
      await page.locator('#usrCerrar').click();
      await page.locator('#bRanking').click();
      await page.locator('#rkLista .rk-fila').filter({hasText:'Ana'}).locator('.rk-ciudad').waitFor();
      assert.match(await page.locator('#rkLista .rk-fila').filter({hasText:'Ana'}).locator('.rk-ciudad').textContent(),/Salto/);
      assert.match(await page.locator('#rkLista .rk-fila.yo .rk-ciudad').textContent(),/Montevideo/);
      assert.match(await page.locator('#rkGrupoTxt').textContent(),/Montevideo/);
      if(process.env.UI_SCREENSHOTS)await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,'ranking-ciudades-'+viewport.width+'.png')});
      await page.locator('#rkEditarCiudad').click();
      await page.locator('#perfilCiudad').fill('Colonia');
      await page.locator('#perfilContinuar').click();
      assert.equal(await page.evaluate(()=>localStorage.getItem('gya_ciudad')),'Colonia');
      assert.equal(errors.length,0,errors.join('\n'));
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'sin desborde horizontal');
      await ctx.close();
    }
    console.log('Ciudad en Social y ranking: OK');
  }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
