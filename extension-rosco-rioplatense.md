# Extensión "El Rosco Rioplatense" para Girá y Adiviná Rioplatense

## Contexto

Este repo es **Girá y Adiviná Rioplatense** (https://gvelazcamp.github.io/gira-y-adivina-rioplatense/), un juego estilo Ruleta de la Fortuna **en producción**: app de un solo `index.html` con JS y CSS, sin build, con PWA y service worker. Hay que respetar sus modos, su economía (monedas, vidas, tickets, colecciones por ciudad), logros, objetivos diarios y ranking de amigos. Estética: violeta oscuro (`#160B24`), español rioplatense, mobile first.

Esta es una extensión más del lobby "Extensiones Girá y Adiviná" (catálogo de minijuegos de la franquicia, tipo Plato), como Sopa Fugaz, Rueda de Letras, Palabra Secreta y Cebá el Mate, cada una con su propio brief. Este documento es independiente: si el lobby ya existe, solo se suma una entrada a la lista `EXTENSIONES`.

Hay un prototipo funcionando que sirve de **referencia de mecánica** (no de estilo): `referencia/rosco-rioplatense.html`. Leelo entero antes de diseñar nada.

## Qué quiero

**El Rosco Rioplatense:** un círculo con las letras del abecedario, estilo programa de TV. Para cada letra hay una definición ("Empieza con M: infusión de yerba que se toma con bombilla") y el jugador escribe la palabra. Tiene un tiempo total para resolver todo el rosco. Es el juego que más calza con el nombre "Girá y Adiviná": **la ruleta de letras gira y cae en una letra al azar**.

## Mecánica (tomada del prototipo)

El jugador está **siempre en modo resolver**: escribe, envía, la rueda gira a otra letra, escribe, envía. No hay pantallas intermedias ni menús entre letra y letra, para que el juego tenga ritmo.

1. **La rueda de letras.** 24 letras en círculo (A a Z sin Ñ, W ni X). Un marcador fijo arriba. Al empezar y después de cada respuesta, **la rueda gira y frena en una letra pendiente elegida al azar** (puede caer en la Z de entrada). Mientras gira, el tiempo se pausa.
2. **La definición.** Cuando la rueda frena, la letra elegida queda resaltada, se muestra en grande en el centro y aparece debajo "Empieza con X" con la definición. El campo de texto queda **enfocado con el teclado abierto** para escribir de inmediato.
3. **Enviar.** Se envía con el botón o con Enter. Acierto: la letra se pone verde. Error: se pone roja y se muestra cuál era la palabra. **Un solo intento por letra.** La comparación ignora mayúsculas, tildes y espacios.
4. **Girar sola.** Tras una breve pausa (≈ 0,8 s), la rueda gira sola a la próxima letra pendiente. Nunca repite la que acaba de salir, salvo que sea la última.
5. **Cambiar letra.** Botón para pasar: no cuenta como error, la letra queda pendiente para más tarde y la rueda gira a otra.
6. **Fin.** La ronda termina cuando no quedan letras pendientes o se acaba el tiempo. Se muestran aciertos, errores y letras sin responder.
7. **Puntaje:** 100 por acierto, más 2 por cada segundo que sobre si se resolvió todo el rosco. Guardar el mejor puntaje.
8. **Animación de giro:** la rueda da 3 vueltas y frena con desaceleración, con las letras siempre derechas. Con `prefers-reduced-motion` la rueda salta directo a la letra elegida.

## Contenido: el diccionario

Las palabras salen de un **diccionario en un archivo de datos aparte** (por ejemplo `rosco-rioplatense-datos.js`), que se amplía sin tocar la lógica. Cada entrada:

```
{ letra, palabra, definicion, categoria, nivel, ciudad? }
```

- **Al armar cada ronda, se elige al azar una entrada por letra.** Con 3 o más entradas por letra, no hay dos roscos iguales.
- Palabras **rioplatenses y uruguayas**, sin tildes ni Ñ (ASADO, MURGA, ROCHA...). Categorías posibles: comida, carnaval, ciudades, fútbol, costumbres, lunfardo.
- **Las definiciones se escriben originales**, cortas (una frase) y sin nombrar la palabra ni sus derivadas. No se copian de un diccionario existente (RAE, etc.) por derechos de autor. Se pueden redactar con ayuda de una IA y revisar a mano.
- Para letras difíciles, la definición puede decir "Contiene la X" en vez de "Empieza con X".
- **Variante con el Mapa:** una ronda temática por ciudad, usando las mismas claves de ciudad que `COLECCIONES`.
- **Tema abierto, hay que decidirlo:** el prototipo trae unas 40 entradas de muestra. La versión real necesita **al menos 3 entradas por letra (72 o más)** para empezar, y más a medida que se juegue.

## Calibración de tiempos y dificultad

El tiempo no es un número fijo: sale de cuánto tardaría una **persona normal**.

```
tiempoPromedio = cantidadDeLetras × 6 s     (leer, pensar y escribir)
tiempoRonda    = tiempoPromedio × margen(nivel)
```

| Nivel | Letras | Margen sobre el promedio |
|---|---|---|
| 1 | 12 | 1,6 |
| 2 | 16 | 1,4 |
| 3 | 20 | 1,2 |
| 4 | 24 | 1,0 |
| 5 o más | 24 | baja 0,05 por nivel, piso 0,75 |

- Los niveles altos usan palabras menos comunes (campo `nivel` de cada entrada).
- Todos los números viven en **un solo objeto de configuración** (`ROSCO_CONFIG`).
- **Son estimaciones, no datos medidos.** Probar con 5 a 10 personas y ajustar el margen, no la mecánica. Meta de rosco completo: nivel 1 ≈ 80%, nivel 4 ≈ 40%.

## Dónde se engancha en la app

**Fase 1 (hacer esta primero):**
- Nueva tarjeta **"El Rosco"** en el lobby de Extensiones, con su logo (`logo-rosco-rioplatense.svg`), nombre y mejor puntaje. Sin costo de vidas ni monedas: sirve para practicar.

**Fase 2 (después de validar la 1):**
- **Rosco del día:** el mismo rosco para todos ese día (semilla a partir del índice de día que ya usa la app, `ofertaDiaIdx()`), con resultado para compartir sin spoilers.
- Premio chico con tope diario, del mismo nivel que los premios de eventos (nunca ítems premium).

**Fase 3 (opcional):**
- Sala TV: la tele muestra el rosco y los celulares responden por turnos. Solo cuando la Sala TV esté estable.

## Integración con lo que ya existe (reutilizar, no reinventar)

- Usar las **funciones ya existentes** de logros, objetivos diarios, sonido, vibración y "Compartir resultado". No crear una economía paralela. En esta fase monedas, vidas y tickets no se tocan.
- Sumar 2 o 3 **logros** (por ejemplo, completar el rosco sin errores o con más de 30 segundos de sobra) y un **objetivo diario** ("Respondé 10 letras del Rosco").
- Guardar el mejor puntaje en `localStorage` con prefijo `gya_`, así entra en el backup que ya se sincroniza.
- Reutilizar la animación o el sonido de giro de la Ruleta que ya existe.
- Mantener la estética de la app. El prototipo es solo referencia de funcionamiento.
- Respetar `safe-area`, `prefers-reduced-motion` y el layout mobile actual. Cuidar que el teclado del celular no tape la definición ni el campo de texto.

## Reglas para trabajar

1. **Primero explorá el repo y mostrame un plan** (qué archivos vas a crear o tocar, cómo se registra una extensión en el lobby, cómo se guardan puntajes) antes de escribir código. Esperá mi OK.
2. **No rompas lo que funciona.** Nada de tocar la Ruleta, salas, tienda ni mapa salvo en el punto mínimo de enganche.
3. Código en archivos propios (`rosco-rioplatense.js` y `rosco-rioplatense-datos.js`), no dentro del `index.html` gigante.
4. Detrás de un **feature flag** simple, para apagarlo si algo falla.
5. Si hay service worker, sumar los archivos nuevos a la lista y subir `CACHE_NAME`.
6. Cambios chicos y commits separados por fase.
7. Probar en celular (360 px de ancho, con el teclado abierto) y en pantalla grande.

## Criterios de aceptación (Fase 1)

- Se puede jugar un rosco completo desde el lobby de Extensiones.
- La rueda gira, frena en una letra al azar pendiente y la resalta; el teclado queda listo para escribir sin tocar nada más.
- Enviar con botón y con Enter funciona; los aciertos y errores se pintan bien y se acepta la respuesta sin tildes.
- "Cambiar letra" deja la letra pendiente y no cuenta como error.
- Las palabras salen del archivo de datos y varían entre partidas.
- El tiempo sale de la fórmula y la tabla, y todos los valores están en `ROSCO_CONFIG`.
- El mejor puntaje se guarda. No hay errores en consola, los otros modos siguen igual y la app sigue instalable como PWA.

## Preguntas que quiero que me hagas si algo no está claro

Antes de codear, si falta info (cómo se guardan los récords, cómo se registra una extensión en el lobby, de dónde sale el diccionario completo), preguntame en una lista corta en vez de asumir.
