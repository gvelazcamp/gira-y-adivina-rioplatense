# Extensión "Palabra Secreta" para Girá y Adiviná Rioplatense

## Contexto

Este repo es **Girá y Adiviná Rioplatense** (https://gvelazcamp.github.io/gira-y-adivina-rioplatense/), un juego estilo Ruleta de la Fortuna **en producción**: app de un solo `index.html` con JS y CSS, sin build, con PWA y service worker. Hay que respetar sus modos, su economía (monedas, vidas, tickets, colecciones por ciudad), logros, objetivos diarios y ranking de amigos. Estética: violeta oscuro (`#160B24`), español rioplatense, mobile first.

Esta es la **tercera extensión** del lobby "Extensiones Girá y Adiviná" (catálogo de minijuegos de la franquicia, tipo Plato), junto a **Sopa Fugaz** y **Rueda de Letras**, cada una con su propio brief. Este documento es independiente: si el lobby ya existe, solo se suma una entrada a la lista `EXTENSIONES`.

Hay un prototipo funcionando que sirve de **referencia de mecánica** (no de estilo): `referencia/palabra-secreta.html`. Leelo entero antes de diseñar nada.

## Qué quiero

**Palabra Secreta:** un juego de adivinar una palabra rioplatense de 5 letras, con pistas, en **una partida por día, igual para todos**. Es el más tranquilo de las extensiones (sin contrarreloj) y el que más razones da para volver todos los días.

## Mecánica (tomada del prototipo)

1. La app elige **una palabra de 5 letras por día** (la misma para todos los jugadores ese día) y no la muestra. Tiene 6 intentos.
2. El jugador escribe una palabra de 5 letras con el teclado de la pantalla y toca ENVIAR.
3. Cada letra de esa palabra se pinta: **verde** (está y en el lugar correcto), **amarillo** (está, pero en otro lugar), **gris** (no está). Con letras repetidas, cada letra de la palabra secreta solo se puede "gastar" una vez (primero se marcan los verdes y después los amarillos).
4. El teclado también se pinta con lo que se va descubriendo.
5. Se gana adivinando la palabra en 6 intentos o menos. Si no, se muestra cuál era.
6. Al terminar se muestra un **resultado para compartir**, sin revelar la palabra, por ejemplo:

```
Palabra Secreta 30/9 3/6
⬛🟨⬛⬛🟨
🟨🟨⬛⬛🟨
🟩🟩🟩🟩🟩
```

7. **Animación de giro:** al enviar, cada casillero gira (media vuelta) antes de mostrar su color, uno tras otro, por el "Girá" del nombre del juego. Con `prefers-reduced-motion`, el color se muestra directo.
8. La partida del día se guarda, así que recargar la página no permite volver a empezar. Después de terminar, un botón "Jugar otra (práctica)" da una palabra al azar que no cuenta para nada.
9. La primera vez que se abre, se muestra una pantalla "¿Cómo se juega?" con un ejemplo; después queda accesible desde un botón.

## Puntaje y progreso

No hay puntos por tiempo. Lo que se guarda:
- Racha de días seguidos ganados y mejor racha.
- Partidas ganadas y distribución de intentos (cuántas en 1, 2, ... 6).
- Todo con la misma persistencia del proyecto (`localStorage` con prefijo `gya_`, que ya entra en el backup a Supabase).

## Contenido

- **Lista de palabras (palabra secreta):** palabras **rioplatenses y uruguayas de exactamente 5 letras**, sin tildes ni Ñ (ASADO, TANGO, MURGA, PLAYA, ROCHA, SALTO...), conocidas por la mayoría. Evitar las que solo conoce una zona. Archivo de datos aparte. La lista tiene que alcanzar para **al menos un año** sin repetir, o usar un orden mezclado fijo.
- **La palabra del día** sale de un índice de día, el mismo que ya usa la app (`ofertaDiaIdx()`), para que todos los dispositivos la calculen igual sin servidor. Cuidado con la zona horaria: definir a qué hora cambia (idealmente a medianoche de Uruguay).
- **Variante con el Mapa:** una palabra por ciudad del mapa, cada tanto, con las mismas claves de ciudad que `COLECCIONES`.
- **Tema abierto, hay que decidirlo:** qué palabras deja enviar el jugador. El prototipo acepta cualquier combinación de 5 letras. En la versión real conviene aceptar solo **palabras válidas del español**, y eso necesita un diccionario de 5 letras (¿de dónde sale y con qué licencia?). Sin eso el jugador puede "descubrir" letras tirando combinaciones sin sentido.

## Dónde se engancha en la app

**Fase 1 (hacer esta primero):**
- Nueva tarjeta **"Palabra Secreta"** en el lobby de Extensiones, con su logo (`logo-palabra-secreta.svg`), nombre y la racha actual. Sin costo de vidas ni monedas.

**Fase 2 (después de validar la 1):**
- Premio chico con tope diario por ganar la palabra del día, del mismo nivel que los premios de eventos (nunca ítems premium).
- Indicador en la tarjeta: "Ya jugaste hoy" o "Te espera la palabra de hoy", y cuenta regresiva hasta la próxima.

**Fase 3 (opcional):**
- Duelo con un amigo: los dos intentan la misma palabra y gana quien la saca en menos intentos.
- Comparar la racha en el ranking de amigos.

## Integración con lo que ya existe (reutilizar, no reinventar)

- Usar las **funciones ya existentes** de logros, objetivos diarios, sonido, vibración y "Compartir resultado". No crear una economía paralela. En esta fase monedas, vidas y tickets no se tocan.
- Sumar 2 o 3 **logros** (por ejemplo, ganar en 2 intentos, o una racha de 7 días) y un **objetivo diario** ("Resolvé la Palabra Secreta de hoy").
- Mantener la estética de la app. El prototipo es solo referencia de funcionamiento.
- Respetar `safe-area`, `prefers-reduced-motion` y el layout mobile actual. Soportar teclado físico además del de pantalla.

## Reglas para trabajar

1. **Primero explorá el repo y mostrame un plan** (qué archivos vas a crear o tocar, cómo se registra una extensión en el lobby, cómo se guardan racha y progreso) antes de escribir código. Esperá mi OK.
2. **No rompas lo que funciona.** Nada de tocar la Ruleta, salas, tienda ni mapa salvo en el punto mínimo de enganche.
3. Código en archivos propios (`palabra-secreta.js` y `palabra-secreta-datos.js`), no dentro del `index.html` gigante.
4. Detrás de un **feature flag** simple, para apagarlo si algo falla.
5. Si hay service worker, sumar los archivos nuevos a la lista y subir `CACHE_NAME`.
6. Cambios chicos y commits separados por fase.
7. Probar en celular (360 px de ancho) y en pantalla grande.

## Criterios de aceptación (Fase 1)

- Se puede jugar la palabra del día completa desde el lobby de Extensiones, con teclado de pantalla y físico.
- Los colores son correctos, incluso con letras repetidas (por ejemplo, adivinar con SALSA contra ASADO).
- Dos dispositivos distintos el mismo día reciben la misma palabra.
- Recargar la página el mismo día no reinicia la partida.
- La racha y las estadísticas se guardan.
- El resultado se puede copiar y no revela la palabra.
- No hay errores en consola, los otros modos siguen igual y la app sigue instalable como PWA.

## Preguntas que quiero que me hagas si algo no está claro

Antes de codear, si falta info (cómo se guardan los récords, cómo se registra una extensión en el lobby, qué diccionario usar, a qué hora cambia el día), preguntame en una lista corta en vez de asumir.
