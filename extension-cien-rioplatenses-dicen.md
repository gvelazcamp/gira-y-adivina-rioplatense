# Extensión "100 Rioplatenses Dicen" para Girá y Adiviná Rioplatense

## Contexto

Repo **Girá y Adiviná Rioplatense** (https://gvelazcamp.github.io/gira-y-adivina-rioplatense/): juego **en producción**, un `index.html` con JS y CSS, sin build, PWA con service worker. Respetar modos, economía (monedas, vidas, tickets), logros, objetivos diarios y ranking de amigos. Estética violeta oscuro (`#160B24`), español rioplatense, mobile first.

Es una extensión más del lobby "Extensiones Girá y Adiviná" (como Sopa Fugaz, Rueda de Letras y El Rosco). Si el lobby ya existe, solo se suma una entrada a `EXTENSIONES`. Prototipo de referencia de **mecánica** (no de estilo): `referencia/cien-rioplatenses-dicen.html`. Leelo entero antes de diseñar. Logo: `logo-cien-rioplatenses.svg`.

## Qué quiero

Un juego estilo "100 argentinos/uruguayos dicen": se le preguntó a 100 rioplatenses algo ("Algo que se lleva a la playa") y hay que adivinar las respuestas más dichas. **Lo giratorio es la ruleta de temas**: al empezar cada ronda gira y cae en una categoría (Comida, Carnaval, Fútbol, Costumbres, Lunfardo, Ciudades).

## Mecánica (del prototipo)

1. La ronda arranca con la ruleta girando (3 vueltas, desaceleración, textos siempre derechos). Cae en una categoría y se elige al azar una pregunta no usada de esa categoría.
2. Se muestra la pregunta y el panel con 5 o 6 casilleros ocultos, ordenados de más a menos dicha.
3. El jugador escribe y manda (botón o Enter). Si está en el panel, el casillero se da vuelta y suma sus puntos. Si no, es un error (✖). Con **3 errores** termina la ronda.
4. La comparación ignora mayúsculas, tildes, espacios y signos. Cada respuesta acepta **alias** (plural, sinónimo, forma corta).
5. Respuesta repetida: aviso, sin castigo. "Me rindo" muestra el panel y cierra la ronda.
6. Son **3 rondas** con multiplicador x1, x2, x3. Al terminar el panel o los errores, aparece "Girar la ruleta" para la próxima.
7. Puntaje final = suma de puntos de las respuestas × multiplicador. Guardar el mejor en `localStorage` con prefijo `gya_`.
8. Con `prefers-reduced-motion` la ruleta salta directo a la categoría.

## Contenido y datos

Archivo aparte (`cien-rioplatenses-datos.js`), ampliable sin tocar la lógica. Formato por pregunta: categoría, pregunta, y de 5 a 6 respuestas con `texto`, `puntos` y `alias`.

- **Los puntos del prototipo son inventados, solo de muestra.** Para la versión real conviene hacer una **encuesta de verdad** (un formulario con la pregunta abierta a 100 o más personas) y usar el porcentaje de cada respuesta como puntos. Agrupar variantes como alias.
- Mínimo para empezar: **3 preguntas por categoría (18 en total)**; crece con el uso.
- Preguntas cortas, sin ofender ni apuntar a personas reales. Respuestas rioplatenses y uruguayas.
- Si una categoría no tiene preguntas sin usar, la ruleta no debe caer ahí.
- **Variante con el Mapa:** ronda por ciudad con las mismas claves de `COLECCIONES`.

## Dónde se engancha

**Fase 1 (primero):** tarjeta **"100 Rioplatenses Dicen"** en el lobby de Extensiones con su logo, nombre y mejor puntaje. Sin costo de vidas ni monedas.

**Fase 2:** pregunta del día (misma para todos, semilla con `ofertaDiaIdx()`), resultado para compartir sin spoilers, premio chico con tope diario (nunca ítems premium).

**Fase 3 (opcional):** modo Sala TV: la tele muestra el panel y los celulares responden por turnos, con equipos. Solo cuando la Sala TV esté estable.

## Integración (reutilizar, no reinventar)

- Funciones existentes de logros, objetivos diarios, sonido, vibración y "Compartir resultado". Sin economía paralela.
- 2 o 3 **logros** (ej.: panel completo sin errores) y un **objetivo diario** ("Jugá una ronda de 100 Rioplatenses").
- Reutilizar sonido o animación de giro de la Ruleta que ya existe.
- Respetar `safe-area`, `prefers-reduced-motion`, layout mobile y que el teclado no tape el panel ni el campo de texto.

## Reglas para trabajar

1. **Primero explorá el repo y mostrame un plan** (archivos a crear o tocar, cómo se registra una extensión, cómo se guardan puntajes). Esperá mi OK.
2. No rompas lo que funciona; no toques Ruleta, salas, tienda ni mapa salvo el enganche mínimo.
3. Archivos propios: `cien-rioplatenses.js` y `cien-rioplatenses-datos.js`.
4. Detrás de un **feature flag**.
5. Si hay service worker, sumar los archivos y subir `CACHE_NAME`.
6. Cambios chicos y commits separados por fase.
7. Probar en celular (360 px, teclado abierto) y en pantalla grande.

## Criterios de aceptación (Fase 1)

- Se juegan las 3 rondas completas desde el lobby.
- La ruleta gira y cae en una categoría con pregunta disponible.
- Aciertos (con tildes o alias), errores, repetidas y "me rindo" funcionan; el multiplicador se aplica.
- Preguntas y alias salen del archivo de datos y varían entre partidas.
- El mejor puntaje se guarda; sin errores en consola, los otros modos igual y la app instalable como PWA.

## Preguntas antes de codear

Si falta info (cómo se guardan los récords, cómo se registra una extensión, de dónde sale la encuesta), preguntame en una lista corta en vez de asumir.
