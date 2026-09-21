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

## Otras cosas ya con base preparada pero sin terminar

- [ ] **Dinero real**: la UI de paquetes con dinero real ya está armada
      pero oculta (`PAUSA DE DINERO REAL` en el CSS) — falta integrar
      Google Play Billing de verdad.
- [ ] **Marcos exclusivos por ciudad**: cada ciudad en `COLECCIONES` ya
      tiene un `frameExclusivo` (`frame-durazno`, `frame-salto`, etc.)
      preparado en el código pero sin el arte subido a
      `assets/frames/` todavía — falta generar/subir esas 20 imágenes
      y activarlos.
