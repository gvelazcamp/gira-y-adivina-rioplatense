# Prompt para generar coleccionables (miniaturas redondas) — Argentina

Mismo sistema que los coleccionables de Uruguay: cada ciudad tiene un set
de **4 items**, cada uno una miniatura/diorama 3D apoyada sobre una base
dorada circular (tipo moneda), con el fondo transparente para poder
recortarla en el juego. Esto es solo para los **coleccionables redondos**
(no los sobres/paquetes — eso es otro sistema aparte).

**Formato:** `.webp` con fondo transparente, cuadrado, 700x700 px (o
más), estilo miniatura semi-realista y colorida.

---

## Estilo obligatorio (no puede cambiar)

- Una **miniatura/diorama 3D** del tema (lugar, comida, personaje o
  actividad), vista en perspectiva 3/4, muy detallada y colorida —
  nunca plana, nunca vector, nunca foto real, nunca un simple ícono.
- Apoyada sobre una **base circular dorada** (como una moneda o
  pedestal), vista desde un ángulo que muestre el espesor/borde
  dorado abajo.
- La escena puede sobresalir levemente de los bordes de la base
  (árboles, personas, objetos) para dar sensación de profundidad, pero
  la base dorada circular siempre tiene que verse abajo.
- **Fondo completamente blanco/transparente**, sin paisaje ni nada
  alrededor de la miniatura — solo la miniatura y su base, para poder
  recortarla en el juego.
- Puede incluir personas/personajes en la escena (bailando, cocinando,
  caminando) si el tema lo pide, no tiene que ser siempre un paisaje
  vacío.
- Sin texto, sin logos, sin marca de agua. Una sola imagen por
  coleccionable.

---

## Prompt base (copiar y pegar, cambiando lo que está entre [ ])

```
Creá una ilustración de una miniatura/diorama 3D muy detallada de
[TEMA], en [CIUDAD], Argentina, apoyada sobre una base circular dorada
tipo moneda o pedestal, vista en perspectiva 3/4.

Reglas obligatorias:
- La escena es una miniatura semi-realista y colorida (nunca plana,
  nunca vector, nunca foto), con mucho detalle y volumen.
- Apoyada sobre una base dorada circular (como una moneda gruesa),
  mostrando el borde/espesor dorado en la parte de abajo.
- La escena puede sobresalir un poco de los bordes de la base
  (árboles, personas, objetos) para dar sensación de profundidad, pero
  la base dorada circular siempre tiene que verse.
- Fondo: blanco puro, sin paisaje ni nada alrededor de la miniatura
  (solo la miniatura y su base), para poder recortar el fondo después.
- Formato cuadrado, alta resolución.
- Sin texto, sin logos, sin marca de agua. Una sola imagen.
```

---

## Ejemplo ya usado (Montevideo — "Las Llamadas", para referencia visual)

Comparsa de candombe bailando sobre los adoquines, tambores rayados
azul/amarillo, plumas rojas/blancas/azules, un farol y un balcón con
bandera uruguaya de fondo, confeti volando — todo apoyado sobre la base
dorada circular, fondo blanco.

---

## Los 2 sets a pedir (4 coleccionables cada uno)

### Bariloche

1. **La Catedral de Bariloche** — la catedral de piedra neogótica junto
   al lago, con sus torres puntiagudas.
2. **Isla Victoria** — la isla del lago Nahuel Huapi con su bosque de
   arrayanes y un muelle chico.
3. **El Chocolate Artesanal** — una exhibición de bombones y tabletas
   de chocolate bien presentada, estilo vidriera de chocolatería.
4. **Cerro Otto** — el cerro con el teleférico/aerosilla subiendo y el
   confitería giratoria arriba.

### El Calafate

1. **El Glaciar Perito Moreno** — la pared de hielo azulado
   desprendiendo un bloque de hielo al agua, en miniatura.
2. **Laguna Nimez** — la reserva de aves con flamencos y cisnes de
   cuello negro entre los juncos.
3. **El Cordero Patagónico** — un cordero al asador (a la cruz),
   típico de la Patagonia, con el fuego de fondo.
4. **Paseo entre Témpanos** — un barco turístico navegando el Lago
   Argentino entre témpanos de hielo flotando.

---

## Después de generarlos (proceso técnico, no hace falta pedírselo a ChatGPT)

1. Descargar la imagen que devuelva ChatGPT.
2. Si no viene con fondo transparente, quitarle el fondo blanco y
   recortarla a cuadrado, después convertirla a `.webp`.
3. Guardarla en `assets/collectibles/bariloche/` (o
   `assets/collectibles/el-calafate/`) con el nombre
   `coleccion-bariloche-catedral.webp` (mismo patrón que las de
   Uruguay: `coleccion-<ciudad>-<item>.webp`).
4. Avisame cuando tengas las imágenes y me encargo de conectarlas en el
   juego (eso ya es la parte de programación).
