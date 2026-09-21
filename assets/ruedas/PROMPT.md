# Prompt para generar diseños de la Rueda (la de cada turno)

Este prompt sirve para pedirle a ChatGPT ruletas COMPLETAS (todos los
gajos pintados) para vender como "skins" alternativas de la ruleta
principal del juego — la que se gira cada turno para pedir una
consonante.

**Clave: cada ruleta tiene que tener exactamente 24 gajos (porciones)
iguales,** igual que la ruleta real del juego, para que después el
juego pueda escribir arriba de cada gajo el número o texto que
corresponda ($, QUIEBRA, PIERDE TURNO, COMODÍN, x2 PREMIO, etc. —
eso lo escribe el juego, no la imagen).

---

## Los 24 gajos reales del juego (en este orden, empezando arriba y
## girando en el sentido de las agujas del reloj)

Esto es lo que el juego escribe arriba de cada uno de los 24 gajos —
sirve para saber qué tan largo puede ser cada texto (los gajos son
finitos, "PIERDE TURNO" es el texto más largo que tiene que entrar).

| # | Texto exacto |
|---|---|
| 1 | $500 |
| 2 | $150 |
| 3 | $900 |
| 4 | COMODIN |
| 5 | $400 |
| 6 | PIERDE TURNO |
| 7 | $600 |
| 8 | $200 |
| 9 | $750 |
| 10 | $300 |
| 11 | QUIEBRA |
| 12 | $350 |
| 13 | $1000 |
| 14 | $250 |
| 15 | $450 |
| 16 | x2 PREMIO |
| 17 | PIERDE TURNO |
| 18 | $550 |
| 19 | $300 |
| 20 | $800 |
| 21 | $200 |
| 22 | QUIEBRA |
| 23 | $650 |
| 24 | $400 |

Resumen de cuántas veces aparece cada cosa (por si ChatGPT pregunta
qué tan repetido está cada color/símbolo):
- 18 gajos de dinero ($150 a $1000)
- 2 gajos "QUIEBRA"
- 2 gajos "PIERDE TURNO"
- 1 gajo "COMODIN"
- 1 gajo "x2 PREMIO"

---

## Prompt para pedir las 8 juntas (copiar y pegar tal cual)

```
Generá 8 ilustraciones de ruletas de casino completas, vistas desde
arriba, cada una en formato cuadrado 1:1 (1200x1200 px), con fondo
TRANSPARENTE (PNG con canal alfa, sin ningún color de fondo detrás
del círculo — nada de blanco ni negro fuera de la rueda). Cada una
de las 8 tiene que salir como una IMAGEN SEPARADA e independiente, en
su tamaño completo — NUNCA como una sola imagen combinada, grilla,
storyboard, hoja de contactos ni collage con las 8 juntas achicadas.
Si no podés generar las 8 imágenes completas por separado en esta
misma respuesta, generalas de a una por mensaje en vez de armar un
collage.

Cada una de las 8 ruletas tiene un tema distinto:
1. Fuego y lava, con llamas y brasas en el borde.
2. Hielo y cristales, con escarcha en el borde.
3. Oro y diamantes, estilo joyería de lujo.
4. Neón synthwave, con líneas de luz de colores.
5. Espacio y galaxia, con estrellas y planetas.
6. Selva y naturaleza, con hojas y enredaderas.
7. Dulces tipo candy, con caramelos y colores pastel.
8. Circo siniestro, con rayas y luces de carpa.

Reglas obligatorias para las 8:
1. Cada ruleta dividida en EXACTAMENTE 24 gajos (porciones) iguales
   — contalos: tienen que ser 24, ni 12 ni 20, como una torta
   cortada en 24 partes finitas e iguales.
2. Los 24 gajos de cada ruleta alternan colores bien distintos entre
   sí (uno sí, uno no, tipo ruleta de casino clásica), dentro de la
   paleta de su tema.
3. Sin texto, sin números, sin letras, sin logos, sin marcas de agua
   en ningún gajo (el juego escribe los números arriba, después).
4. Un borde/aro exterior decorado según el tema de cada una, con un
   círculo central chico (el "eje") también decorado.
5. Fondo TRANSPARENTE detrás del círculo en las 8 (sin relleno de
   ningún color fuera de la rueda — tiene que ser PNG con
   transparencia real, no blanco ni negro).
6. Estilo ilustración digital detallada y colorida, iluminación de
   premio/casino.
```

**Si igual te arma un collage:** contestale "no quiero un collage,
mandame las 8 como imágenes separadas, una por una".

**Si el fondo no sale transparente** (sale blanco o negro): contestale
"el fondo tiene que ser transparente de verdad, en PNG con canal
alfa, no blanco ni negro".

---

## Después de generarlas (proceso técnico, no hace falta pedírselo a ChatGPT)

1. Descargar cada imagen por separado (8 archivos, en formato PNG
   para no perder la transparencia).
2. Recortar/ajustar cada una a un cuadrado exacto (1200x1200 px) y
   convertir a `.webp` manteniendo la transparencia.
3. Guardar en una carpeta nueva `assets/ruedas/` con nombres
   descriptivos (ej. `rueda-fuego.webp`, `rueda-hielo.webp`, etc.).
4. Subir a `main` y avisar — de ahí se programa la sección nueva en
   la tienda para venderlas (todavía no existe, hay que crearla) y
   cómo el juego hace que la imagen gire junto con los números reales
   arriba, en vez de reemplazarlos.
