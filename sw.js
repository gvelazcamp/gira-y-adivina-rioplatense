const CACHE_NAME = "gya-cache-v5";
const APP_SHELL = ["./", "./index.html", "./manifest.json", "./icono-192.png", "./icono-512.png", "./assets/logo.webp"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((c) => c.addAll(APP_SHELL))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  // Las imágenes de assets/ se sirven de la caché primero: la tienda no
  // tiene que esperar a la red para mostrar lo que ya se vio antes (antes
  // pedía por red cada ícono cada vez que se abría la tienda). IMPORTANTE:
  // si se reemplaza el CONTENIDO de un archivo ya existente en assets/
  // (mismo nombre, distinta imagen), hay que subir el CACHE_NAME de acá
  // arriba, si no los celulares que ya lo cachearon nunca ven el cambio.
  if (new URL(e.request.url).pathname.includes("/assets/")) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((resp) => {
          if (resp && resp.status === 200 && resp.type === "basic") {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          }
          return resp;
        });
      })
    );
    return;
  }

  // Red primero para todo lo demás (HTML/JS/manifest): siempre trae la
  // versión más nueva del juego cuando hay internet (antes era
  // cache-primero y por eso el celular seguía viendo versiones viejas
  // aunque ya se hubiera subido un arreglo). Si no hay conexión, usa lo
  // cacheado.
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        if (resp && resp.status === 200 && resp.type === "basic") {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
