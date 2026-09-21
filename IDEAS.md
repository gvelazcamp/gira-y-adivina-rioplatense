# Ideas a futuro

Borrador de cosas pensadas para más adelante — nada de esto está
empezado ni decidido en firme, es una lista para no perder la idea.
Cuando se decida hacer alguna, se saca de acá y se hace de verdad.

## ~~Eventos por ciudad~~ ✅ HECHO — en producción para todos

Idea de Gonzalo: agrupar todo bajo una sección nueva "Eventos" en vez
de tener "Partida Diaria" suelta como está hoy.

- La **Partida Diaria actual pasa a ser el Evento 1**: el botón se
  renombra a algo tipo "🎉 Nuevo evento" y adentro sigue siendo la
  misma partida diaria de siempre (no cambia la mecánica, cambia el
  marco/nombre).
- Se agrega un **Evento 2, el "de ciudad"**: cambia cada 24hs, ciudad
  por ciudad (tipo "🎉 Nuevo evento: Durazno"), con frases
  relacionadas a esa ciudad puntual (no categorías al azar como
  ahora). Al terminarlo se abre un **sobre** que da algo (igual que
  los sobres de colección que ya existen).

Cosas a pensar cuando se encare (resueltas):
- [x] Qué dispara que aparezca cada evento de ciudad — rotación diaria
      simple por índice de día (`eventoCiudadDeHoyIdx()`), mismo
      criterio que `ofertaDiaIdx()`.
- [x] De dónde salen las frases "relacionadas con la ciudad" — quedó
      sin resolver del todo: el Evento 2 usa el modo Mundo normal
      (`empezarDestino`), que elige categorías al azar (`categoriasAlAzar`),
      no frases específicas de esa ciudad puntual.
- [x] Qué da el sobre al completarlo — monedas + vida + un premio
      extra que rota por día (ver pool más abajo).
- [x] Cómo se ve la sección "Eventos" en el home — botón celeste
      propio (`bMenuEventosPrueba`), lleva a una pantalla completa
      nueva (`#eventos`), no un popup.
- [x] Qué pasa si no tocás el evento a tiempo — no se pierde, sigue
      disponible con el mismo premio hasta que rote al otro día.

### Referencia: cómo lo hace Pocket Champs (juego de carreras)

Gonzalo lo tiene instalado y mirando la app en vivo ve esto (no sale
así de claro buscando en internet, los blogs oficiales solo hablan de
eventos más grandes tipo "Squad Training" cada 4 semanas o "Gadget
Ascent" cada 2 semanas):

- Cada 24hs hay **Carrera diaria** (da un sobre) + al menos 2
  "Eventos especiales" nuevos corriendo en paralelo, cada uno con su
  propia duración (ej. "Concurso de correr" dura 24hs, y ya se ve
  "Maravillas selváticas" anunciado para arrancar en 24hs más).
- Da la sensación de que hay que completar uno para que se habilite
  otro (progresión/desbloqueo encadenado), no que todos estén sueltos
  a la vez — a confirmar jugando más para entender bien la regla.
- O sea la cadencia real que se siente jugando es mucho más seguida
  (diaria, con overlap) que lo que cuentan las notas de actualización
  oficiales, que solo anuncian los eventos "grandes".
- Gonzalo mandó capturas de la pantalla real de "Eventos" de Pocket
  Champs — la organizan en 3 niveles, de arriba a abajo:
  1. **Eventos en directo**: lo que está pasando/rotando ahora mismo
     (Carrera Diaria, Campo de Entrenamiento) + un próximo evento
     grande con cuenta regresiva para cuando arranca (ej. "Gadget
     Ascent — Empieza en 10d 19h").
  2. **Eventos especiales**: el activo ahora ("Concurso de Correr",
     23h34min restantes, con una barra de progreso de recompensas
     tipo pase de batalla) + el siguiente ya anunciado con cuenta
     regresiva ("Maravillas Selváticas — Empieza en 23h34min").
  3. **Eventos permanentes**: cosas que no rotan, tipo "Rueda de la
     Fortuna" (ganás la carrera y girás para premios) — acá calzaría
     bien meter nuestra ruleta de skins ya calibrada si algún día se
     retoma ese feature.
- Idea/decisión de Gonzalo sobre las recompensas: que lo que se gana
  en estos eventos sea **de bajo valor** — puede ser un avatar o un
  marco (de tablero o de avatar), pero **nunca algo de la gama
  premium** (los ítems de 8000-9500 monedas de la Tienda). La
  recompensa del evento tiene que quedar claramente por debajo de lo
  que se compra con monedas, para no romper la razón de comprar.

Para arrancar (fase 1, sin copiar los 3 niveles todavía): Evento 1
(partida diaria) + Evento 2 (ciudad, con sobre de recompensa barata).
El nivel "permanente" y el de "próximo evento con cuenta regresiva"
quedan para más adelante si esto funciona bien.

**Decidido:** van 2 eventos (fase 1, arriba). Para el arte de los
botones/banners de evento en el home, se reutiliza el marco azul que
ya existe sin usar en `assets/shop/pack-marco-vacio.webp` (mismo
estilo que el Pack Racha pero en blanco) — no hace falta generar arte
nuevo, solo poner ícono + texto de cada evento arriba de ese marco.

### Pool de recompensas para ir variando

Para que la recompensa de los eventos no sea siempre lo mismo,
armamos un pool de premios de bajo valor (nunca nada premium) y de
ahí se va rotando/combinando cuál toca cada vez — referencia: Pocket
Champs varía entre monedas, gemas, tickets, boosts y skins
cosméticas, siempre bajo valor.

Pool para este juego (decidido con Gonzalo):
- 🪙 Monedas (cantidad variable, ej. 100-300)
- ❤️ Vida
- 🖼️ Marco de avatar
- 🖼️ Marco de tablero / ficha
- 🔍 Una Pista gratis (hoy cuesta 🪙150 en la partida — regalarla de
  vez en cuando se siente bien sin regalar nada caro)
- 🎁 Un coleccionable de alguna colección (lo mismo que ya da el modo
  Mundo normal al ganar una ronda)

**Implementado y en producción:** vida+monedas quedan fijas en los dos
eventos, y el premio extra rota por día entre los 4 últimos ítems del
pool (`EVENTO_PREMIOS_ROTAN`), con offset distinto entre Evento 1 y
Evento 2 para que nunca coincidan el mismo día. El coleccionable
siempre es el de la "ciudad del día". Se agregó `meta.pistasGratis`
para que el premio de pista se pueda gastar de verdad en `hostPista()`.

## Otras cosas ya con base preparada pero sin terminar

- [ ] **Dinero real**: la UI de paquetes con dinero real ya está armada
      pero oculta (`PAUSA DE DINERO REAL` en el CSS) — falta integrar
      Google Play Billing de verdad.
- [ ] **Marcos exclusivos por ciudad**: cada ciudad en `COLECCIONES` ya
      tiene un `frameExclusivo` (`frame-durazno`, `frame-salto`, etc.)
      preparado en el código pero sin el arte subido a
      `assets/frames/` todavía — falta generar/subir esas 20 imágenes
      y activarlos.
