# Extensión "Rueda de Letras" para Girá y Adiviná Rioplatense

## Contexto

Este repo es **Girá y Adiviná Rioplatense** (https://gvelazcamp.github.io/gira-y-adivina-rioplatense/), un juego estilo Ruleta de la Fortuna que ya está **en producción**. Es una app de un solo `index.html` con JS y CSS, sin build, con PWA y service worker. Lo que ya existe y hay que respetar: modos (Jugar ahora con Mapa de Uruguay, online, amigos, Sala TV, Eventos, Entrenamientos, Torneos), economía (monedas, vidas, tickets, poderes, colecciones por ciudad), logros, objetivos diarios y ranking de amigos. Estética: violeta oscuro (`#160B24`), español rioplatense, mobile first.

Esta es la **segunda extensión** del lobby "Extensiones Girá y Adiviná" (un catálogo de minijuegos de la franquicia, tipo Plato). La primera es **Sopa Fugaz**, que tiene su propio brief. Este documento es independiente: si el lobby y su botón ya están hechos, solo se suma una entrada a la lista `EXTENSIONES`; si no, se hacen siguiendo el brief de Sopa Fugaz.

Hay un prototipo funcionando que sirve de **referencia de mecánica** (no de estilo): `referencia/rueda-de-letras.html`. Leelo entero antes de diseñar nada.

## Qué quiero

**Rueda de Letras:** una rueda con 7 letras. El jugador arrastra el dedo de letra en letra para armar palabras, suelta para mandarla, y tiene que encontrar todas las palabras escondidas de la ronda antes de que se acabe el tiempo. Con el botón **Girar** la rueda da una vuelta y las letras se mezclan de lugar (para ver la palabra con ojos nuevos). Es el juego que más calza con el nombre "Girá y Adiviná".

## Mecánica (tomada del prototipo)

1. Cada ronda tiene una **palabra base** de 7 letras (por ejemplo DURAZNO). Las letras de la base, mezcladas, forman la rueda. La base misma es una palabra escondida y da bono ("pangrama").
2. Arriba se muestran las palabras escondidas como casilleros con puntitos (uno por letra, así el jugador sabe cuántas faltan y de qué largo). Al encontrarla, la palabra se revela.
3. El jugador arrastra sobre las letras (pointer events, `touch-action: none`). Cada letra se usa una sola vez por palabra. Volver hacia atrás sobre la letra anterior la quita. Se dibuja una línea que une las letras marcadas y se muestra la palabra que se va armando.
4. Al soltar: si la palabra está en la lista y no se había encontrado, suma. Si no, la rueda tiembla.
5. **Girar:** la rueda da una vuelta completa (≈ 0,75 s) y las letras quedan en otro orden. No cuesta nada. No puede usarse en medio de un arrastre.
6. Ronda con tiempo límite. Se gana encontrando todas las palabras; al ganar, las sobras de tiempo dan puntos y sigue otra rueda. Si se acaba el tiempo, se muestra cuántas faltaron.
7. Puntaje: 10 por letra de cada palabra, +100 por la palabra base, +3 por cada segundo que sobre. Guardar el mejor puntaje.

## Calibración de tiempos y dificultad

**Regla:** el tiempo de una ronda nunca es un número fijo. Sale de cuánto tardaría una **persona normal**, y después se achica por nivel.

```
tiempoPromedio = cantidadDePalabras × (5 s + 1 s × largo medio de las palabras)
tiempoRonda    = tiempoPromedio × margen(nivel)
```

| Nivel | Letras | Palabras escondidas | Largo | Margen sobre el promedio |
|---|---|---|---|---|
| 1 | 6 | 6 | 3 a 5 | 1,6 |
| 2 | 6 | 8 | 3 a 6 | 1,4 |
| 3 | 7 | 9 | 3 a 7 | 1,25 |
| 4 | 7 | 10 | 3 a 7 | 1,1 |
| 5 o más | 7 | 10 a 12 | 4 a 7 | 1,0 y baja 0,05 por nivel, piso 0,75 |

- Todos estos números viven en **un solo objeto de configuración** (`RUEDA_CONFIG`), no desparramados por el código.
- **Son estimaciones, no datos medidos.** Probar con 5 a 10 personas reales, anotar el tiempo por palabra y ajustar el margen, no la mecánica. Meta de partidas ganadas: nivel 1 ≈ 90%, nivel 3 ≈ 75%, nivel 5 ≈ 55%.
- Las palabras de los primeros niveles son cortas y conocidas; después, más largas o menos comunes.

## Contenido

- Palabras **rioplatenses y uruguayas**, sin tildes ni Ñ (DURAZNO, COLONIA, CAMPERA, CANDOMBE, etc.).
- Mejor todavía: **una palabra base por ciudad del Mapa de Uruguay**, con las mismas claves de ciudad que ya usa `COLECCIONES`.
- Cada palabra escondida tiene que poder armarse con las letras de la base, respetando las repeticiones (con DURAZNO no se puede armar una palabra con dos Z).
- Las rondas se guardan en un **archivo de datos aparte** (base + palabras), para ampliarlas sin tocar la lógica.
- **Tema abierto, hay que decidirlo:** el jugador va a probar palabras correctas que no están en la lista. Opciones: (a) solo cuentan las de la lista; (b) además hay un diccionario general del español y las palabras válidas fuera de la lista suman un puntito como "extra", sin ser obligatorias. La (b) se siente mejor pero necesita un diccionario; hay que ver de dónde sale y si su licencia lo permite.

## Dónde se engancha en la app

**Fase 1 (hacer esta primero):**
- Nueva tarjeta **"Rueda de Letras"** en el lobby de Extensiones, con su logo (`logo-rueda-de-letras.svg`), nombre y mejor puntaje. Sin costo de vidas ni monedas: sirve para practicar.

**Fase 2 (después de validar la 1):**
- **Rueda del día:** la misma rueda para todos ese día (semilla a partir del índice de día que ya usa la app, `ofertaDiaIdx()`), con resultado para compartir sin revelar las palabras.
- Un premio chico con tope diario, del mismo nivel que los premios de los eventos (nunca ítems premium).

**Fase 3 (opcional):**
- Sala TV: la tele muestra la rueda y las palabras, y cada celular manda palabras. Solo cuando la Sala TV esté estable.

## Integración con lo que ya existe (reutilizar, no reinventar)

- Usar las **funciones ya existentes** de logros, objetivos diarios, sonido, vibración y "Compartir resultado". No crear una economía paralela. En esta fase monedas, vidas y tickets no se tocan.
- Sumar 2 o 3 **logros** (por ejemplo, encontrar la palabra base en los primeros 10 segundos, o completar una rueda sin equivocarse) y **objetivos diarios** ("Jugá una Rueda de Letras", "Encontrá 15 palabras en la Rueda").
- Guardar el mejor puntaje en `localStorage` con prefijo `gya_`, así entra en el backup que ya se sincroniza.
- Mantener la estética de la app. El prototipo es solo referencia de funcionamiento.
- Respetar `safe-area`, `prefers-reduced-motion` y el layout mobile actual. Con movimiento reducido, el giro se reemplaza por un fundido.
- Reutilizar la animación o el sonido de giro de la Ruleta que ya existe.

## Reglas para trabajar

1. **Primero explorá el repo y mostrame un plan** (qué archivos vas a crear o tocar, cómo se registra una extensión nueva en el lobby, cómo se guardan puntajes) antes de escribir código. Esperá mi OK.
2. **No rompas lo que funciona.** Nada de tocar la Ruleta, salas, tienda ni mapa salvo en el punto mínimo de enganche.
3. Código en archivos propios (`rueda-de-letras.js` y `rueda-de-letras-datos.js`), no dentro del `index.html` gigante.
4. Detrás de un **feature flag** simple, para apagarlo si algo falla.
5. Si hay service worker, sumar los archivos nuevos a la lista y subir `CACHE_NAME`.
6. Cambios chicos y commits separados por fase.
7. Probar en celular (360 px de ancho) y en pantalla grande.

## Criterios de aceptación (Fase 1)

- Se puede jugar una ronda completa desde el lobby de Extensiones.
- Una palabra se arma bien con el dedo en touch, incluso con letras repetidas, y se puede corregir volviendo hacia atrás.
- "Girar" mezcla las letras y no rompe una partida en curso.
- El tiempo sale de la fórmula y la tabla, y todos los valores están en `RUEDA_CONFIG`.
- El mejor puntaje se guarda.
- No hay errores en consola, los otros modos siguen igual y la app sigue instalable como PWA.

## Preguntas que quiero que me hagas si algo no está claro

Antes de codear, si falta info (cómo se guardan los récords, cómo se registra una extensión en el lobby, qué diccionario usar), preguntame en una lista corta en vez de asumir.
