# Ideas a futuro

Borrador de cosas pensadas para más adelante — nada de esto está
empezado ni decidido en firme, es una lista para no perder la idea.
Cuando se decida hacer alguna, se saca de acá y se hace de verdad.

## Eventos por ciudad

Un botón nuevo en la pantalla principal (tipo "🎉 Nuevo evento:
Durazno") que va apareciendo de tanto en tanto, ciudad por ciudad,
avisando que hay un evento especial ahí. Al tocarlo arranca una
partida cuyas frases son todas relacionadas con esa ciudad puntual
(no categorías genéricas al azar como ahora).

Cosas a pensar cuando se encare:
- [ ] Qué dispara que aparezca un evento (¿rotación diaria tipo
      `ofertaDiaIdx()`, ciudad al azar, o siguiendo el orden del mapa?).
- [ ] De dónde salen las frases "relacionadas con la ciudad" — banco de
      frases nuevo por ciudad, o filtrar `FRASES` por categoría/tema
      ligado a esa ciudad.
- [ ] Si da algún premio/recompensa extra por jugarlo, o es solo
      temático.
- [ ] Dónde vive el botón (¿home, junto a "Partida Diaria"?) y qué pasa
      si no lo tocás — ¿se pierde ese evento o sigue disponible?

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
