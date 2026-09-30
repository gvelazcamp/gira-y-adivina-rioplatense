# Extensión "Sopa Fugaz" para Girá y Adiviná Rioplatense

## Contexto

Este repo es **Girá y Adiviná Rioplatense** (https://gvelazcamp.github.io/gira-y-adivina-rioplatense/), un juego estilo Ruleta de la Fortuna que ya está **en producción**. Lo que ya existe y hay que respetar:

- Modos: Jugar ahora (vs máquina, Mapa de Uruguay con 21 ciudades y pasaporte de 5 sellos), Jugar online, Jugar con amigos (sala con código), Sala TV / Familia (la tele es el tablero, cada uno juega desde su celular), Eventos, Entrenamientos (Toss-Up y Ronda Bonus), Torneos.
- Economía: monedas, vidas, tickets de torneo, escudos, poderes (Hielo, Lodo, Escudo, Pista, Mate, Comodín), sobres y colecciones por ciudad, logros, objetivos diarios, ranking de amigos.
- Estética: paleta violeta oscuro (`#160B24` como theme-color), español rioplatense, mobile first, PWA instalable.

## Qué quiero

Agregar un **juego nuevo dentro de la misma app**: **Sopa Fugaz**, una sopa de letras contrarreloj donde **las letras desaparecen y reaparecen en otro lado**, y el jugador tiene pocos segundos para encontrar las palabras (estilo programa de TV).

Hay un prototipo funcionando que sirve de **referencia de mecánica** (no de estilo): `referencia/sopa-fugaz.html` (lo copio al repo antes de arrancar). Leelo entero antes de diseñar nada.

## Mecánica (tomada del prototipo)

1. Los primeros niveles usan grilla de 10x10 con 3 a 5 palabras escondidas (horizontal, vertical y diagonal; al leerlas se aceptan también al revés). **Después, según el nivel, la grilla crece y las palabras aumentan o cambian** (ver tabla de niveles). El tamaño de la grilla es una variable (`N`): el generador, el CSS y la detección de palabras no pueden tener el 10 escrito a mano. Las palabras a buscar se muestran arriba como chips.
2. El jugador arrastra el dedo sobre las letras para marcar una palabra (tiene que funcionar bien en touch: `touch-action: none`, pointer events).
3. **La mudanza:** cada X segundos todas las letras se desvanecen y reaparecen en otras posiciones (las palabras que faltan encontrar también cambian de lugar; las ya encontradas no vuelven). Una barra muestra cuánto falta para la próxima mudanza. **Si el jugador está arrastrando el dedo sobre una palabra cuando le toca la mudanza, la mudanza espera a que suelte**, para que nunca pierda una palabra por mala suerte. La espera tiene un tope (`graciaArrastre`, 2,5 s, en `SOPA_CONFIG`) para que nadie frene las letras dejando el dedo apoyado. El tiempo de la ronda sigue corriendo durante la espera. Pasado el tope, la mudanza ocurre igual y el arrastre se cancela.
4. Las letras de relleno se eligen en parte de las mismas letras de las palabras objetivo, para que haya señuelos.
5. Ronda con tiempo límite. Si se acaba el tiempo, se pierde la ronda y se muestran las palabras que faltaron.
6. Dificultad creciente por nivel (más palabras, más largas, menos tiempo y mudanzas más seguidas). Los valores salen de la sección **Calibración de tiempos y dificultad** y no van fijos en el código.
7. Puntaje: 100 por palabra + 5 por cada segundo que sobre al terminar la ronda. Guardar el mejor puntaje.

## Identidad: algo tiene que girar

El juego se llama **Girá y Adiviná**, así que las transiciones de Sopa Fugaz tienen que girar:
- **La mudanza:** mientras las letras se desvanecen y reaparecen, la grilla completa da una vuelta (360°, ≈ 1,1 s). El arrastre ya está bloqueado en ese momento.
- **Entre rondas (ronda superada / se acabó el tiempo):** la tarjeta entra girando y creciendo, como una ruleta que frena.
- Si se puede, reutilizar la animación o el sonido de giro de la Ruleta que ya existe en la app, en vez de crear uno nuevo.
- Con `prefers-reduced-motion` el giro se reemplaza por un fundido simple.

## Calibración de tiempos y dificultad

**Regla:** el tiempo de una ronda nunca es un número fijo. Siempre se calcula a partir de cuánto tardaría una **persona normal** en resolverla, y después se achica nivel por nivel.

**Promedio estimado de una persona normal** (sin práctica, celular, grilla 10x10 sin mudanzas, palabras a la vista):
- Por palabra: `4 s + 1,2 s por letra` (MATE ≈ 9 s, MURGA ≈ 10 s, CANDOMBE ≈ 14 s, PASCUALINA ≈ 16 s). Incluye buscarla con la vista y marcarla con el dedo.
- Las mudanzas hacen perder la orientación (≈ 2 s cada una), así que se multiplica por `1,15`.

```
tiempoPromedio = suma(4 + 1,2 × letras de cada palabra) × 1,15 × (N / 10)
tiempoRonda    = tiempoPromedio × margen(nivel)
```

`N` es el lado de la grilla: una grilla más grande tiene más letras para barrer con la vista, así que el tiempo crece en proporción (11x11 suma un 10%, 12x12 un 20%).

Ejemplo nivel 1 con MATE, MURGA y ASADO (grilla 10x10): promedio ≈ 33 s, con margen 1,6 la ronda dura ≈ 53 s.

**Tabla de niveles** (el margen baja hasta que solo llegan los jugadores rápidos):

| Nivel | Grilla | Palabras | Largo de palabras | Margen sobre el promedio | Mudanza cada |
|---|---|---|---|---|---|
| 1 | 10x10 | 3 | 4 a 6 letras | 1,6 (sobra tiempo) | 9 s |
| 2 | 10x10 | 3 | 4 a 6 letras | 1,4 | 8 s |
| 3 | 10x10 | 4 | 5 a 8 letras | 1,3 | 7 s |
| 4 | 10x10 | 5 | 5 a 8 letras | 1,15 | 6 s |
| 5 | 11x11 | 5 | 5 a 10 letras | 1,1 | 5 s |
| 6 | 11x11 | 5 | 5 a 10 letras | 1,0 (justo el promedio) | 4,5 s |
| 7 o más | 12x12 | 5 a 6 | 5 a 11 letras | 0,9 y baja 0,05 por nivel, piso 0,75 | 4 s y baja 0,5 por nivel, piso 3,5 s |

Otras reglas de dificultad:
- Grilla máxima: **12x12 en celular** (más grande deja las letras demasiado chicas para el dedo). Si más adelante se hace la Fase 2 en la Sala TV, ahí se puede llegar a 14x14.
- Las palabras nunca pueden ser más largas que el lado de la grilla.
- Las palabras **cambian de tipo según el nivel**: empezar con palabras cortas y conocidas (MATE, ASADO) y pasar a otras más largas, menos comunes o de una categoría nueva (ciudades, comidas, carnaval, fútbol, etc.). La categoría se puede mostrar como pista arriba de los chips.
- Niveles 1 y 2: solo horizontal y vertical, de izquierda a derecha o de arriba hacia abajo. Las diagonales y las palabras al revés aparecen desde el nivel 3.
- La mudanza nunca puede ser más corta que 3,5 s.
- Todos estos números viven en **un solo objeto de configuración** (por ejemplo `SOPA_CONFIG`), no desparramados por el código.

**Son estimaciones, no datos medidos.** Hay que calibrarlas jugando:
- Probar con 5 a 10 personas reales (familia, compañeros) y anotar el tiempo que tarda cada una por palabra.
- Guardar (con la misma persistencia que use el proyecto) el tiempo por palabra y el resultado por nivel, para ajustar la tabla después.
- Meta de partidas ganadas por nivel: nivel 1 ≈ 90%, nivel 3 ≈ 75%, nivel 5 ≈ 55%, nivel 7 o más ≈ 35 a 40%. Si un nivel queda muy lejos de esa meta, se corrige el margen y no la mecánica.

## Contenido

- Palabras **rioplatenses y uruguayas**, sin tildes ni Ñ en la grilla (MATE, ASADO, CANDOMBE, MURGA, CHIVITO, BIZCOCHO, etc.), nunca más largas que el lado de la grilla.
- Mejor todavía: **palabras por ciudad del Mapa de Uruguay** (Durazno, Colonia, Salto, Punta del Este, etc.) para que la extensión se sienta parte del mapa.
- Evitar que una palabra objetivo contenga a otra o esté contenida en otra dentro de la misma ronda.
- Poner las listas en un archivo de datos aparte para poder ampliarlas sin tocar la lógica.

## Dónde se engancha en la app

**Fase 1 (hacer esta primero):**
- Nuevo botón grande **"Extensiones Girá y Adiviná"** en la pantalla principal, **debajo de Torneos y Eventos**, del mismo tamaño y estilo que el botón "Jugar ahora" (mismo alto, ancho, tipografía y animación al tocar).
- **Concepto:** Extensiones es una **franquicia de minijuegos** dentro de la app, tipo Plato. Cada extensión es un juego distinto del universo Girá y Adiviná, con su propia mecánica, y no una variante de la Ruleta.
- Al tocar el botón se abre un **lobby de juegos**: una grilla de tarjetas, una por juego, con nombre, ícono y su mejor puntaje. **Sopa Fugaz** es la primera; las otras pueden aparecer como "Próximamente".
- Dejar el lobby **armado para crecer**: los juegos se registran en una lista (por ejemplo `EXTENSIONES`, con id, nombre, ícono, estado y función de arranque), de modo que sumar un juego nuevo sea agregar una entrada y no rehacer la pantalla.
- Jugar desde ahí no cuesta vidas ni monedas: sirve para practicar.

**Fase 2 (después de validar la 1):**
- Integración con **Sala TV / Familia**: la tele muestra la grilla y las letras que se mudan; cada celular elige la palabra que encontró (o se turnan). Reutilizar el sistema de salas y códigos que ya existe.

**Fase 3 (opcional):**
- Duelo online 1 contra 1 con la misma grilla para ambos.

## Integración con lo que ya existe (reutilizar, no reinventar)

- Usar las **funciones ya existentes** de logros, objetivos diarios, sonido, vibración y "Compartir resultado". No crear una economía paralela. En esta fase monedas, vidas y tickets no se tocan: Sopa Fugaz no los gasta ni los da.
- Sumar 2 o 3 **logros** nuevos (por ejemplo, terminar una ronda con 10 segundos de sobra). Se cargan en el sistema de logros que ya existe; el minijuego solo avisa cuando pasa el hecho.
- Sumar **objetivos diarios** en el sistema que ya existe. Ejemplos:
  - De participación: "Jugá una ronda de Sopa Fugaz" o "Probá una extensión" (empuja a entrar al botón Extensiones).
  - De desempeño: "Encontrá 10 palabras en Sopa Fugaz" (se suman entre rondas) o "Ganá 2 rondas seguidas".
  - General, que escala con más juegos: "Jugá 2 extensiones distintas hoy".
- Cada extensión futura suma sus propios logros y objetivos al mismo sistema.
- Mantener el mismo estilo visual de la app (paleta, tipografías, botones, modales y animaciones). El prototipo usa azul y amarillo solo como referencia de funcionamiento; hay que adaptarlo a la estética del juego.
- Respetar `safe-area`, `prefers-reduced-motion` y el layout mobile actual.

## Reglas para trabajar

1. **Primero explorá el repo y mostrame un plan** (dónde va el botón Extensiones en la pantalla principal, qué archivos vas a crear o tocar, cómo se registra un nuevo modo, cómo se guardan puntajes y progreso) antes de escribir código. Esperá mi OK.
2. **No rompas lo que funciona**: Ruleta, Toss-Up, Ronda Bonus, salas, online, tienda y mapa no se tocan salvo en el punto mínimo de enganche.
3. Detrás de un **feature flag** simple, para poder apagarlo si algo falla en producción.
4. Seguí las convenciones del proyecto (estructura de archivos, nombres, estilo de código, cómo se cargan los assets). Si hay service worker o caché de PWA, actualizá la versión de caché.
5. Cambios chicos y commits separados por fase. Nada de refactors grandes que no pida la extensión.
6. Probar en viewport de celular (360 px de ancho) y en pantalla grande.

## Criterios de aceptación (Fase 1)

- Se puede jugar una ronda completa de Sopa Fugaz desde el botón Extensiones.
- Las letras se mudan en el intervalo configurado, con la barra de aviso visible (y esperando si hay un arrastre en curso, hasta el tope), y una palabra marcada se reconoce bien (incluso al revés y en diagonal).
- Jugar desde Extensiones no gasta vidas ni monedas, ni gana tickets.
- El tiempo de cada ronda sale de la fórmula de calibración y de la tabla de niveles, y todos los valores están en un único objeto de configuración.
- El mejor puntaje se guarda y aparece en "Mis récords".
- No hay errores en consola y los otros modos funcionan igual que antes.
- La app sigue instalable como PWA y cargando rápido.

## Preguntas que quiero que me hagas si algo no está claro

Antes de codear, si falta info (por ejemplo, cómo se guardan los récords o cómo se arma la pantalla de Extensiones), preguntame en una lista corta en vez de asumir.
