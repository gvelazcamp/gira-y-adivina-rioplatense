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

## Otras cosas ya con base preparada pero sin terminar

- [ ] **Dinero real**: la UI de paquetes con dinero real ya está armada
      pero oculta (`PAUSA DE DINERO REAL` en el CSS) — falta integrar
      Google Play Billing de verdad.
- [ ] **Marcos exclusivos por ciudad**: cada ciudad en `COLECCIONES` ya
      tiene un `frameExclusivo` (`frame-durazno`, `frame-salto`, etc.)
      preparado en el código pero sin el arte subido a
      `assets/frames/` todavía — falta generar/subir esas 20 imágenes
      y activarlos.
