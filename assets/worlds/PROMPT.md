# Prompt para generar el fondo de una ciudad/región (Mapa)

Cada nodo del mapa (hoy Uruguay, 21 ciudades — `durazno.webp`,
`montevideo.webp`, etc.) usa una imagen de fondo vertical con un estilo
fijo: diorama nocturno iluminado, vista aérea en perspectiva, un camino
que serpentea de arriba abajo, y el nombre de la ciudad en letras 3D
iluminadas cerca del agua. Este prompt sirve para generar los fondos de
las nuevas regiones de Argentina siguiendo exactamente ese mismo estilo
(la primera a probar: **Bariloche**).

**Formato del archivo:** `.webp`, vertical, proporción ≈ 941×1672 (9:16
aprox, un poco más alta), mismo tamaño que las imágenes de Uruguay.

---

## Estilo obligatorio (no puede cambiar)

- Vista **aérea/isométrica en diorama**, como una miniatura iluminada de
  noche — nunca un mapa plano ni una foto real.
- **Ambientación nocturna**: cielo azul oscuro/violeta, toda la escena
  iluminada por faroles cálidos, luces de edificios, reflejos en el
  agua. Iluminación cálida (ámbar/dorado) contra el fondo frío del
  cielo.
- Un **camino sinuoso** (con línea de guía punteada en el medio) que
  atraviesa la escena de arriba abajo, conectando los distintos puntos
  de interés del lugar.
- Vegetación y detalles **pintados semi-realistas, coloridos**, estilo
  ilustración digital de alta calidad (no vector plano, no low-poly).
  Si el lugar tiene un árbol o planta icónica (ej. jacarandás en
  Uruguay), incluirla como toque de color.
- El **nombre del lugar** aparece en letras grandes en 3D con luz propia
  (como un cartel/letrero iluminado), ubicado cerca de un cuerpo de
  agua (lago, río, mar) en la parte inferior de la imagen — igual que
  "DURAZNO" en el ejemplo.
- **2 a 4 hitos/lugares reconocibles** del sitio, distribuidos a lo
  largo del camino (plazas, monumentos, edificios icónicos, actividades
  típicas de la zona), con gente/detalle de vida cotidiana en escala
  miniatura (mesas de café, bancos, juegos, embarcaciones, etc.).
- Sin texto adicional aparte del nombre del lugar, sin logos, sin marcas
  de agua, una sola imagen (no grillas ni variantes).

---

## Prompt base (copiar y pegar, cambiando lo que está entre [ ])

```
Creá una ilustración digital de un diorama nocturno en perspectiva
aérea/isométrica de [LUGAR], Argentina, en formato vertical (proporción
aprox. 941x1672, más alta que ancha).

Estilo obligatorio:
- Vista aérea en diorama iluminado de noche: cielo azul oscuro/violeta
  con estrellas, toda la escena bañada en luz cálida (faroles,
  ventanas, reflejos dorados en el agua). Nada de mapa plano, nada de
  foto real, nada de vector low-poly.
- Un camino peatonal sinuoso con línea de guía punteada en el medio,
  recorriendo la imagen de arriba abajo y conectando los puntos de
  interés.
- Vegetación y elementos pintados semi-realistas y coloridos, estilo
  ilustración digital detallada (no plano).
- 2 a 4 hitos reconocibles de [LUGAR]: [LISTA DE LUGARES/ELEMENTOS
  TÍPICOS, ej: el Centro Cívico, el lago, cerros nevados, una casa de
  chocolate, un refugio de montaña], con detalle de vida cotidiana en
  miniatura (gente caminando, mesas de café, embarcaciones, lo que
  corresponda).
- El nombre "[LUGAR]" en letras grandes en 3D con luz propia, tipo
  cartel iluminado, ubicado cerca del agua en la parte de abajo de la
  imagen.
- Sin texto adicional, sin logos, sin marca de agua. Una sola imagen.
```

---

## Ejemplo ya usado (Durazno — para referencia visual, no hay que copiarlo)

- Camino costero serpenteante con línea punteada, de noche.
- Hitos: Parque de la Hispanidad con escenario, la Intendencia, un
  obelisco/columna central, una escultura tipo huevo de mosaico, una
  plaza con juegos, mesas de café con sombrillas.
- Jacarandás en flor (violeta) como toque de color.
- Playa y muelle con un barco, puente iluminado de fondo.
- "DURAZNO" en letras blancas iluminadas, pegado a la costa/agua abajo
  a la derecha.

## Primer intento en Argentina: Bariloche

Usando el prompt base de arriba con:

- **[LUGAR]** → Bariloche
- **[LISTA DE LUGARES/ELEMENTOS TÍPICOS]** → el Centro Cívico (torreones
  de piedra), el Lago Nahuel Huapi con muelle y algún kayak/velero,
  cerros y montañas nevadas de fondo, una casa/refugio de chocolate con
  vidriera, cabañas de piedra y madera estilo alpino, bosques de
  pinos/arrayanes, algún detalle de cerro con teleférico o el Cerro
  Catedral a lo lejos.

---

## Después de generarlo (proceso técnico, no hace falta pedírselo a ChatGPT)

1. Descargar la imagen que devuelva ChatGPT.
2. Recortarla/ajustarla a 941x1672 px y convertirla a `.webp`.
3. Guardarla en `assets/worlds/` como `bariloche.webp` (o el nombre de
   ciudad que corresponda, en minúsculas y sin tildes).
4. Avisar para sumar el nodo en el código (nombre, posición en el mapa,
   rival, etc.) — eso ya es la parte de programación.
