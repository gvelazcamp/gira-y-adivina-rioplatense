const {chromium, webkit} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script);
for (const file of ['ui-icons.js', 'sw.js', 'sala-tv.js']) new vm.Script(fs.readFileSync(path.join(root, file), 'utf8'));

(async () => {
  const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.json':'application/json'};
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://local').pathname;
    const file = path.join(root, pathname === '/' ? 'index.html' : pathname);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;
  try {
    for (const engine of [chromium, webkit]) {
      const browser = await engine.launch({headless: true, executablePath:engine===chromium ? process.env.BROWSER_EXECUTABLE : undefined});
      try {
        for (const spec of [
          {name:'iphone', width:393, height:852, top:59, bottom:34, side:0},
          {name:'android', width:393, height:852, top:0, bottom:0, side:0},
          {name:'small-phone', width:320, height:568, top:20, bottom:0, side:0},
          {name:'landscape', width:852, height:393, top:0, bottom:21, side:59}
        ]) {
          const context = await browser.newContext({viewport:{width:spec.width, height:spec.height}, isMobile:true, hasTouch:true, serviceWorkers:'block'});
          const page = await context.newPage();
          page.setDefaultTimeout(12000);
          const errors = [];
          page.on('pageerror', e => errors.push(e.message));
          await page.route('**/*', r => r.request().url().startsWith(base) ? r.continue() : r.fulfill({status:200, body:''}));
          await page.addInitScript(() => {localStorage.setItem('gya_nombre','Prueba');localStorage.setItem('gya_avatar','mate');localStorage.setItem('gya_pais','UY');});
          await page.goto(base, {waitUntil:'load'});
          // Desktop WebKit does not emulate hardware safe areas: inject the
          // reported iPhone insets to exercise the actual responsive rules.
          await page.evaluate(s => {
            const style = document.documentElement.style;
            style.setProperty('--safe-top', s.top + 'px');style.setProperty('--safe-bottom', s.bottom + 'px');
            style.setProperty('--safe-left', s.side + 'px');style.setProperty('--safe-right', s.side + 'px');
            document.querySelector('#splash')?.remove();
            document.querySelectorAll('.capa.ver').forEach(el => el.classList.remove('ver'));
            $('setup').style.display='none';$('juego').style.display='block';
            modo='bot';miJug=0;arranca=0;meta.pistasGratis=0;enTutorial=false;armarTeclado();iniciarPartida('Vale','Margarita');
            S.frase='EL JUEGO RIOPLATENSE';S.cat='Montevideo · Ronda 1 de 3 · Viaje';publicar('Le toca a Vale. Girá para pedir una consonante.');
          }, spec);
          await page.waitForFunction(() => document.querySelector('#bPista .game-icon-coin'));
          const layout = await page.evaluate(() => {
            const r=$('juego').getBoundingClientRect(), m=$('marcador').getBoundingClientRect();
            return {top:r.top, scoreTop:m.top, left:r.left, right:r.right, width:innerWidth, overflow:document.documentElement.scrollWidth>innerWidth};
          });
          assert(layout.top >= spec.top + 10, JSON.stringify(layout));
          assert(layout.scoreTop >= spec.top + 10);
          assert(Math.abs(layout.left - (layout.width-layout.right)) < 2, 'game centered horizontally');
          assert(!layout.overflow, 'no horizontal overflow');
          if (process.env.UI_SCREENSHOTS && spec.name==='iphone') await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,engine.name()+'-game.png')});

          await page.evaluate(() => {detenerPartidaAnterior();meta.monedas=5000;$('bTienda').click();});
          const buy=page.locator('button[data-tipo="escudo_pierde"]');
          await buy.scrollIntoViewIfNeeded();
          assert.equal(await page.locator('.tn-card:has(button[data-tipo^="escudo_"]) .tn-card-img .game-icon-shield').count(), 4);
          assert.equal(await buy.locator('.game-icon-coin').count(), 1);
          const modal = await page.evaluate(() => {
            const r=document.querySelector('#capaTienda .caja').getBoundingClientRect(), x=$('xGlobalCerrar').getBoundingClientRect();
            return {top:r.top,bottom:r.bottom,xTop:x.top,xRight:x.right,height:innerHeight,width:innerWidth};
          });
          assert(modal.top>=spec.top, JSON.stringify(modal));
          assert(modal.bottom<=spec.height-spec.bottom+1, JSON.stringify(modal));
          assert(modal.xTop>=spec.top+14 && modal.xRight<=spec.width-spec.side, 'close button in safe area');
          if (process.env.UI_SCREENSHOTS && spec.name==='iphone') await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,engine.name()+'-shop.png')});
          await buy.click();
          await page.waitForFunction(() => document.querySelector('#confirmCompraTxt .game-icon-coin'));
          assert.match(await page.locator('#confirmCompraTxt').textContent(), /Escudo Pierde Turno.*🪙 750/);

          await page.evaluate(() => {
            const probe=document.createElement('div');probe.id='iconProbe';
            probe.innerHTML='<button>🪙 10</button><textarea>🪙</textarea><div contenteditable="true">🛡️</div>';
            probe.firstChild.onclick=()=>probe.dataset.clicked='yes';document.body.append(probe);
          });
          await page.waitForFunction(() => document.querySelector('#iconProbe button .game-icon-coin'));
          await page.evaluate(() => {const b=$('iconProbe').firstChild;b.click();b.textContent='🛡️ 🪙 20';});
          await page.waitForFunction(() => document.querySelectorAll('#iconProbe button .game-icon').length===2);
          assert.equal(await page.locator('#iconProbe button').textContent(),'🛡️ 🪙 20');
          assert.equal(await page.locator('#iconProbe').getAttribute('data-clicked'),'yes');
          assert.equal(await page.locator('#iconProbe textarea .game-icon,#iconProbe [contenteditable] .game-icon').count(),0);
          assert.equal(await page.locator('.game-icon .game-icon').count(),0,'no nested icons');
          await page.evaluate(() => $('iconProbe').remove());
          await page.evaluate(() => {document.querySelectorAll('.capa.ver').forEach(el=>el.classList.remove('ver'));abrirRuleta();});
          await page.waitForFunction(() => rwMonedaImagen.complete && rwMonedaImagen.naturalWidth>0);
          assert.deepEqual(errors, [], engine.name()+' '+spec.name);
          console.log('PASS',engine.name(),spec.name,'safe areas, centered game, shop, dynamic icons, purchase and canvas');
          await context.close();
        }
      } finally {await browser.close();}
    }
  } finally {await new Promise(r => server.close(r));}
})().catch(e => {console.error(e);process.exitCode=1;});
