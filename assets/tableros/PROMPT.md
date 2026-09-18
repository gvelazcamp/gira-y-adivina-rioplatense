# Prompt para generar marcos de tablero (ChatGPT / imágenes)

Este prompt sirve para pedirle a ChatGPT una nueva imagen de fondo para el
tablero del juego (la ilustración decorativa que rodea las fichas de
letras). El tema puede ser **cualquier cosa** — no tiene que ser Uruguay,
mate, banderas, etc. Puede ser un tema completamente distinto, raro,
"freak", de cualquier estilo: espacial, terror, fantasía, deportivo,
lo que se te ocurra.

Lo único que **no** puede cambiar es la parte técnica (tamaño, zona vacía
en el centro, sin texto), porque ahí es donde se ven las fichas de letras
del juego. Si esa parte se rompe, las letras quedan tapadas por el dibujo.

---

## Prompt base (copiar y pegar, cambiando [TEMA])

```
Creá una ilustración de fondo decorativa para el marco de un tablero de
juego de mesa, en formato horizontal, proporción 16:9 (1400x788 px o
similar), estilo ilustración digital detallada y colorida, semi-realista.

Tema: [TEMA]

Reglas obligatorias de composición:
- Todo el centro de la imagen (aproximadamente el 75-80% central, tanto
  en ancho como en alto) tiene que quedar prácticamente vacío, con un
  color de fondo sólido u oscuro y uniforme (sin objetos, sin texto, sin
  personajes), porque ahí van a ir superpuestas fichas de letras.
- Toda la decoración e ilustración del tema tiene que estar concentrada
  en los cuatro bordes y las cuatro esquinas de la imagen, dejando el
  centro limpio.
- Se puede usar una franja fina decorativa arriba y otra abajo (por
  ejemplo una línea dorada o un horizonte), pero sin que invada el centro
  vertical de la imagen.
- Sin texto, sin letras, sin logos, sin marcas de agua.
- Iluminación cálida y colores vivos, buen contraste con fichas claras
  encima.
- Una sola imagen completa (no varias versiones ni grilla de opciones).
```

---

## Ejemplos ya usados (para referencia de estilo, no hay que copiarlos)

**Ejemplo 1 — "Rambla de noche" (temática Uruguay):**
> Tema: Rambla de Montevideo de noche, con el sol de la bandera uruguaya
> en una esquina, una bandera de Uruguay enrollada como cinta decorativa
> bordeando el marco, un mate con bombilla en la esquina inferior
> izquierda, un tambor de candombe en la esquina inferior derecha, flores
> silvestres, faroles encendidos y el horizonte de la ciudad de fondo.

**Ejemplo 2 — "Estadio al atardecer" (temática fútbol uruguayo):**
> Tema: Vista panorámica de una cancha de fútbol de barrio al atardecer,
> con las tribunas vacías a los costados, reflectores encendidos, cielo
> naranja y violeta, flores blancas y amarillas y una cinta con los
> colores de Uruguay bordeando todo el marco.

**Ejemplos de temas nuevos posibles (totalmente libres):**
- Una nave espacial vista desde adentro, con planetas y estrellas en las
  esquinas y el centro como el vacío del espacio.
- Un bosque embrujado de noche con calabazas, murciélagos y niebla en los
  bordes.
- Un arrecife de coral bajo el agua con peces y burbujas en las esquinas.
- Un ring de lucha libre con luces de neón.
- Cualquier otra idea "freak" o fuera de lo común — no hay límite temático.

---

## Después de generarla (proceso técnico, no hace falta pedírselo a ChatGPT)

1. Descargar la imagen que devuelva ChatGPT.
2. Se recorta/ajusta a 1400x788 px exactos y se convierte a `.webp`.
3. Se guarda en `assets/tableros/` con un nombre descriptivo (ej.
   `fondo-espacio-1.webp`, `fondo-bosque-1.webp`).
4. Se agrega como nueva opción en el selector de marcos del tablero en
   `index.html`.
