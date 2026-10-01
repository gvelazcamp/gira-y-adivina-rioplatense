# Extensión "Ahorcado Rioplatense" para Girá y Adiviná Rioplatense

## Contexto

Repo **Girá y Adiviná Rioplatense** (https://gvelazcamp.github.io/gira-y-adivina-rioplatense/): juego **en producción**, un `index.html` con JS y CSS, sin build, PWA con service worker. Respetar modos, economía (monedas, vidas, tickets), logros, objetivos diarios y ranking de amigos. Estética violeta oscuro (`#160B24`), español rioplatense, mobile first.

Es una extensión más del lobby "Extensiones Girá y Adiviná" (como Sopa Fugaz, Rueda de Letras, El Rosco y 100 Rioplatenses Dicen). Si el lobby ya existe, solo se suma una entrada a `EXTENSIONES`. Prototipo de **mecánica** (no de estilo): `referencia/ahorcado-rioplatense.html`. Leelo entero antes de diseñar. Logo: `logo-ahorcado-rioplatense.svg`.

## Qué quiero

El **ahorcado clásico, con el muñeco**, y con un toque de Girá y Adiviná: antes de cada palabra gira una **ruleta de categorías** (Comida, Carnaval, Fútbol, Costumbres, Lunfardo, Ciudades) y **la categoría donde cae es la de la palabra** a adivinar. Diccionario rioplatense.

## Mecánica (del prototipo)

1. Cada palabra arranca con la ruleta girando (3 vueltas, desaceleración, textos siempre derechos). La categoría donde frena define la palabra: se elige al azar una no usada de esa categoría. Si una categoría se queda sin palabras, la ruleta no puede caer ahí. Mientras gira no se acepta ninguna letra.
2. Se muestra solo la categoría y la cantidad de letras. **Sin pistas ni definiciones**: lo único que orienta es la categoría que sacó la ruleta.
3. El jugador toca letras en un **teclado en pantalla** (A–Z sin Ñ, W ni X) o usa el teclado físico. No hace falta abrir el teclado del celular.
4. Acierto: la letra se pone verde y se revela en todos sus lugares. Error: la letra se pone roja y se dibuja una parte del muñeco en la horca (cabeza, cuerpo, brazo, brazo, pierna, pierna). **6 errores = palabra perdida**: el muñeco queda completo en rojo y se muestra cuál era. Letras repetidas no restan.
5. Ganar la palabra: todas las letras reveladas.
6. Partida de **5 palabras** sin repetir, **todas difíciles** (sin niveles ni dificultad creciente). La ruleta solo puede caer en categorías que tengan palabras sin usar. Puntaje: 150 por palabra + 20 por cada error que sobre (de los 6). Guardar el mejor en `localStorage` con prefijo `gya_`.
7. Entre palabras: botón "Siguiente palabra"; el muñeco se borra y la ruleta gira de nuevo.
8. Con `prefers-reduced-motion` la ruleta salta directo a la categoría.

## Contenido: el diccionario

Archivo aparte (`ahorcado-rioplatense-datos.js`), ampliable sin tocar la lógica. Cada entrada: `{ categoria, palabra, ciudad? }`.

- Palabras **rioplatenses y uruguayas**, mayúsculas, **sin tildes ni Ñ ni W ni X** (CHIVITO, MURGA, ROCHA, LABURO...). Categorías: comida, carnaval, fútbol, costumbres, lunfardo, ciudades.
- **No hay pistas ni definiciones**, así que no hay textos que redactar ni derechos de autor que cuidar: solo la lista de palabras. Cada palabra tiene que ser claramente de su categoría (si alguien la ve, tiene que poder decir "ah, claro, es de carnaval").
- El prototipo trae 31 palabras de muestra. La versión real necesita **mínimo 60 (10 por categoría)** y crece con el uso. Largo recomendado: 4 a 12 letras.
- **Sin niveles: todas las palabras son difíciles**: poco comunes, jerga, nombres propios o largas con letras raras (REPIQUE, YIRAR, TACUAREMBO, MARACANAZO). Nada de palabras cortas y comunes tipo MATE o ASADO. Meta: que se resuelvan más o menos una de cada tres veces, porque es para jugar contra otra persona. Son estimaciones: probar con 5 a 10 personas y ajustar el diccionario, no la mecánica.
- **Variante con el Mapa:** ronda temática por ciudad con las mismas claves de `COLECCIONES`.
- Todos los números en un solo objeto `AHORCADO_CONFIG` (palabras por partida, vidas, puntos).

## Dónde se engancha

**Fase 1 (primero):** tarjeta **"Ahorcado Rioplatense"** en el lobby de Extensiones con logo, nombre y mejor puntaje. Sin costo de vidas ni monedas.

**Fase 2:** palabra del día (misma para todos, semilla con `ofertaDiaIdx()`), resultado para compartir sin spoilers (casilleros de colores), premio chico con tope diario (nunca ítems premium).

**Duelo online (Fase 2 o 3):** dos jugadores reciben la misma palabra (semilla compartida) y gana quien la resuelve con menos errores. Por eso todo el diccionario es difícil: tiene que ser un desafío entre personas.

**Fase 3 (opcional):** duelo en Sala TV: un jugador elige la palabra y el resto adivina por turnos. Solo cuando la Sala TV esté estable.

## Integración (reutilizar, no reinventar)

- Funciones existentes de logros, objetivos diarios, sonido, vibración y "Compartir resultado". Sin economía paralela.
- 2 o 3 **logros** (ej.: palabra sin errores, partida completa sin perder ninguna) y un **objetivo diario** ("Resolvé 3 palabras del Ahorcado").
- Reutilizar sonido o animación de giro de la Ruleta que ya existe.
- Respetar `safe-area`, `prefers-reduced-motion` y el layout mobile (360 px); que el teclado en pantalla no tape la palabra.

## Reglas para trabajar

1. **Primero explorá el repo y mostrame un plan** (archivos a crear o tocar, cómo se registra una extensión, cómo se guardan puntajes). Esperá mi OK.
2. No rompas lo que funciona; no toques Ruleta, salas, tienda ni mapa salvo el enganche mínimo.
3. Archivos propios: `ahorcado-rioplatense.js` y `ahorcado-rioplatense-datos.js`.
4. Detrás de un **feature flag**.
5. Si hay service worker, sumar los archivos y subir `CACHE_NAME`.
6. Cambios chicos y commits separados por fase.
7. Probar en celular (360 px) y en pantalla grande.

## Criterios de aceptación (Fase 1)

- Se juegan las 5 palabras completas desde el lobby.
- Teclado en pantalla y físico funcionan; letras repetidas no restan vidas.
- La ruleta gira antes de cada palabra y la categoría donde cae es la de la palabra; cada error dibuja una parte del muñeco y con 6 se pierde la palabra y se muestra cuál era.
- Las palabras salen del archivo de datos y varían entre partidas; no se muestra ninguna pista.
- El mejor puntaje se guarda; sin errores en consola, los otros modos igual y la app instalable como PWA.

## Preguntas antes de codear

Si falta info (cómo se guardan los récords, cómo se registra una extensión, de dónde sale el diccionario completo), preguntame en una lista corta en vez de asumir.
