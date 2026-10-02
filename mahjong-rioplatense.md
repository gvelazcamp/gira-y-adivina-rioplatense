# Mahjong Rioplatense — Universo Girá y Adiviná

Solitario tipo Mahjong (fichas apiladas, se juntan de a pares) con cultura rioplatense. Un solo archivo autocontenido: `mahjong-rioplatense.html` (HTML + CSS + JS, logo embebido en base64). Sin build, sin dependencias salvo Google Fonts. Se publica como página estática (GitHub Pages) y enlaza a https://gvelazcamp.github.io/gira-y-adivina-rioplatense/

## Reglas de trabajo (importante)
- Cambios **quirúrgicos**, no reescrituras completas.
- Respuestas mínimas: entregar el resultado, sin explicar pasos.
- **Cero texto en el juego**: fichas, reglas, ruleta, resultados y botones usan solo imágenes/emoji (el único texto permitido es el título y el enlace a Girá y Adiviná). Textos para accesibilidad solo en `aria-label`.
- **No debe ser fácil**: toda mejora tiene que mantener o subir la dificultad. Nada de "tocar y listo".
- Móvil primero (viewport ~390px, `safe-area-inset`, `prefers-reduced-motion`).
- No usar `localStorage` sin `try/catch` (ya envuelto en `LS`).

## Archivos
- `mahjong-rioplatense.html` — el juego.
- `logo-mahjong.png` (512), `logo-mahjong-192.png`, `logo-mahjong.webp` — ícono propio de esta extensión (cuadrado redondeado oscuro, fichas con mate y yerba, flechas magenta/turquesa, brillos dorados; mismo estilo que los íconos de los demás juegos de Girá y Adiviná). El .webp está embebido en el header del HTML.

## Imágenes de fichas
Ilustraciones de ChatGPT (estilo sticker, contorno oscuro, PNG transparente) en `img/` (512px) y embebidas en el HTML como webp 200px en el objeto `IMG`. En `C` se referencian con `@nombre`; lo que no tiene `@` sigue siendo emoji (fallback).
- Hechas: `yerba`, `asado`, `fuego`, `tambor`, `mascaras`, `camisa-penarol`, `pelota`, `camisa-nacional`, `arco`, `bondi`, `parada`, `mate`, `gaucho` (sombrero), `caballo`, `tango`, `bandoneon`, `flan`, y de UI: `espejo`, `cerebro`, `hielo`, `reloj`, `lupa`, `cruz`, `llama`, `trofeo`, `calavera` (helper `ic(nombre,clase)`).
- Faltan (hoy emoji): dulce de leche 🍯 (ficha) y el candado 🚫🧩 (pantalla de sin jugadas; sigue emoji). Los emoji restantes en la UI (🎡📅🎲✕, reglas) también son emoji.
- Para sumar una: copiar el png a `img/`, agregar su webp base64 a `IMG` y reemplazar el emoji por `@nombre` en `C`.

## Diseño del juego
- **Tablero:** 36 fichas, 3 capas (`POS`: capa 0 = 24 en grilla 6×4, capa 1 = 9, capa 2 = 3). Una ficha está libre si no tiene otra encima y tiene al menos un lado horizontal abierto (`geo`).
- **Fichas boca abajo:** solo se ven las libres.
- **Pares por asociación:** `C` define 9 conceptos `[A, B]` (cada lado es uno o dos emoji). Cada concepto aparece 2 veces → 4 fichas (2 A + 2 B). Un par válido = mismo `id` y distinto lado (`s`). Tocar dos fichas del mismo lado es error.
- **Trampa central:** como hay 2 A y 2 B por concepto, elegir mal el emparejamiento puede dejar el tablero sin salida. Sin jugadas posibles ⇒ pierde (`🚫🧩`).
- **Generación (`gen`)**: se arma sacando pares al azar en orden inverso (garantiza solución geométrica), luego un solver DFS con memo (`sv`, `mv`, presupuesto de 60.000 nodos) verifica que tenga solución **y** que exista al menos una jugada inicial trampa. Hasta 120 intentos. Determinista por semilla (reto del día = mismo tablero para todos: `DAY*7919+13`).
- **Dificultad:** 4 errores máximo (cada uno +10 s), 1 pista (+15 s, marca una jugada segura calculada con el solver), sin deshacer.
- **Ruleta (4 modos, `MODS`)**: 🪞 Espejo (tablero espejado + dibujos invertidos), 🧠 Memoria (las fichas se tapan tras 2 s; se revelan al tocar), ❄️ Hielo (4 fichas congeladas hasta 5 pares removidos), ⏱️ Reloj (3:30, `TL=210`).
- **Reto del día:** modo = `DAY%4`, racha en `localStorage` clave `mj_racha`. Resultado compartible solo con emoji.

## Estructura del JS
- Bloque `//CORE … //ENDCORE`: lógica pura sin DOM (`C`, `POS`, `R` PRNG, `geo`, `fr`, `mv`, `sv`, `gen`). Se puede testear en Node extrayendo ese bloque.
- Resto: UI (`build`, `paint`, `hud`, `pick`, `hint`, `peek`, `end`, `go`, `home`).
- Estado global: `T` (fichas), `sel`, `errs`, `secs`, `hints`, `mod`, `daily`, `pk` (modo Memoria visible).

## Verificación rápida
Test de solvabilidad (Node): extraer `//CORE…//ENDCORE`, para cada modo generar ~30 semillas y comprobar `sv(T)=true` y que haya jugada trampa. Última corrida: 0 irresolubles, 30/30 con trampa en los 4 modos.

## Pendiente / ideas
- Completar las ilustraciones que faltan (ver arriba) para que no se mezclen emoji con dibujos.
- Más conceptos rioplatenses (hoy 9) y rotar el set por día para que el reto no sea memorizable.
- Niveles de dificultad (fácil/normal/experto) subiendo capas, fichas o trampas.
- Sonidos y animación al juntar pares.
- Ranking/tabla compartida del reto del día.
- Que Gonzalo agregue el resto de las cosas que tenía para pedir sobre el juego.
