# Ideas a futuro

Borrador de cosas pensadas para más adelante — nada de esto está
empezado ni decidido en firme, es una lista para no perder la idea.
Cuando se decida hacer alguna, se saca de acá y se hace de verdad.

## Eventos por ciudad

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

Cosas a pensar cuando se encare:
- [ ] Qué dispara que aparezca cada evento de ciudad (¿rotación diaria
      tipo `ofertaDiaIdx()`, ciudad al azar, o siguiendo el orden del
      mapa?).
- [ ] De dónde salen las frases "relacionadas con la ciudad" — banco de
      frases nuevo por ciudad, o filtrar `FRASES` por categoría/tema
      ligado a esa ciudad.
- [ ] Qué da el sobre al completarlo — ¿monedas, algo para la
      colección de esa ciudad, o algo nuevo?
- [ ] Cómo se ve la sección "Eventos" en el home con los dos (Evento 1
      = partida diaria, Evento 2 = ciudad) sin que quede muy cargada
      junto a lo que ya hay (ofertas, ranking, etc.).
- [ ] Qué pasa si no tocás el evento de ciudad a tiempo — ¿se pierde
      o sigue disponible hasta que rote el siguiente?

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
- 🖼️ Marco de avatar (ya lo usa el Evento 1, prototipo actual)
- 🖼️ Marco de tablero / ficha (ya lo usa el Evento 2, prototipo actual)
- 🔍 Una Pista gratis (hoy cuesta 🪙150 en la partida — regalarla de
  vez en cuando se siente bien sin regalar nada caro)
- 🎁 Un coleccionable de alguna colección (lo mismo que ya da el modo
  Mundo normal al ganar una ronda)

## Otras cosas ya con base preparada pero sin terminar

- [ ] **Dinero real**: la UI de paquetes con dinero real ya está armada
      pero oculta (`PAUSA DE DINERO REAL` en el CSS) — falta integrar
      Google Play Billing de verdad.
- [ ] **Marcos exclusivos por ciudad**: cada ciudad en `COLECCIONES` ya
      tiene un `frameExclusivo` (`frame-durazno`, `frame-salto`, etc.)
      preparado en el código pero sin el arte subido a
      `assets/frames/` todavía — falta generar/subir esas 20 imágenes
      y activarlos.
