# Prompt para generar sellos de pasaporte — Argentina (ChatGPT / imágenes)

Mismo sistema que el pasaporte de Uruguay (`assets/passport/PROMPT.md`),
adaptado para las ciudades nuevas de Argentina. Cada ciudad tiene un
pasaporte con **5 sellos**: 4 numerados (hitos/lugares de la ciudad) + 1
final marcado con **"R"**, que es el personaje rival de esa ciudad (un
retrato de él/ella).

**Ciudades a generar ahora:** Bariloche, El Calafate.

---

## Estilo obligatorio (idéntico al de Uruguay, no puede cambiar)

- Forma de **estampilla postal vertical**, con el borde perforado/dentado
  típico de un sello, proporción aprox. 9:16 (ej. 720x1280 px).
- Fondo general color **crema/hueso** (papel viejo), no blanco puro.
- Panel interior con la ilustración, enmarcado por un **doble borde fino
  del color de la categoría** (ver abajo), esquinas redondeadas.
- Insignia circular arriba al centro con el **número (1-4) o "R"**, del
  mismo color que el borde, y al lado unas **líneas onduladas tipo
  matasellos de correo** (el sello de cancelación postal).
- Un **ícono chico simple** (pictograma, relleno, un solo color) debajo
  de la ilustración, que represente el tema puntual de ese sello.
- Abajo, una **cinta/banner** del mismo color de categoría con:
  - Título corto en mayúsculas (ej. "EL GLACIAR")
  - Nombre de la ciudad en mayúsculas debajo
  - "— ARGENTINA —" en mayúsculas, más chico (acá es la única diferencia
    real con los de Uruguay: dice ARGENTINA en vez de URUGUAY)
- Ilustración **pintada semi-realista y colorida**, estilo póster de viaje
  vintage — nunca foto, nunca plano/vector, nunca en un solo color
  (monocromo), nunca circular/medallón.
- Colores de borde según el número (igual que en Uruguay, para que el
  pasaporte se vea consistente entre países):
  - **1 y 2 → azul**
  - **3 → marrón/sepia**
  - **4 → verde**
  - **R (rival) → rojo/bordó, con una corona dorada arriba del círculo
    y otra chica abajo cerca de la cinta**
- El sello "R" es un **retrato de un personaje** (persona de cuerpo
  entero o medio cuerpo, expresión simpática/graciosa, con algo que lo
  identifique con la ciudad), no un paisaje.
- Sin texto adicional, sin logos, sin marcas de agua, una sola imagen
  por sello (no grillas ni variantes).

---

## Prompt base (copiar y pegar, cambiando lo que está entre [ ])

```
Creá una ilustración estilo estampilla postal vintage, en formato
vertical (proporción 9:16), fondo color crema/hueso con el borde
perforado típico de un sello de correo.

Tema de la ilustración: [TEMA / LUGAR / PERSONAJE], en [CIUDAD], Argentina.

Reglas obligatorias de composición:
- El panel interior con la ilustración va enmarcado por un doble borde
  fino de color [COLOR: azul / marrón / verde / rojo y dorado].
- Arriba al centro, una insignia circular del mismo color con el
  número "[NÚMERO]" (o la letra "R" si es un retrato de personaje)
  adentro, y al lado unas líneas onduladas tipo matasellos postal.
- Debajo de la ilustración, un ícono chico simple de un solo color que
  represente el tema (ej: un copo de nieve, una montaña, una taza,
  lo que corresponda).
- Abajo de todo, una cinta del mismo color con el texto "[TÍTULO]" en
  mayúsculas grande, "[CIUDAD]" en mayúsculas debajo, y "— ARGENTINA —"
  en mayúsculas más chico.
- Si es el sello "R" (personaje): agregar una corona dorada arriba de
  la insignia circular y otra chica cerca de la cinta de abajo. Es un
  retrato de una persona (medio cuerpo o cuerpo entero), no un paisaje.
- Estilo de ilustración: pintura digital semi-realista, colorida, tipo
  póster de viaje antiguo. Nada de foto, nada de vector plano, nada de
  un solo color, nada de forma circular/medallón.
- Sin texto adicional, sin logos, sin marca de agua. Una sola imagen.
```

---

## Los 2 sets a pedir

### Bariloche

1. **(azul)** "El Centro Cívico" — el conjunto de piedra con la torre del
   reloj y la plaza, estilo alpino. Ícono: una torre.
2. **(azul)** "Lago Nahuel Huapi" — el lago con muelle, veleros y las
   islas de fondo, montañas nevadas detrás. Ícono: una ola.
3. **(marrón)** "Cerro Catedral" — las montañas nevadas con un
   teleférico o esquiadores a lo lejos. Ícono: una montaña.
4. **(verde)** "La Chocolatería" — una vidriera de chocolatería típica
   de Bariloche, con bombones y una taza de chocolate caliente. Ícono:
   una taza.
5. **R (rojo + corona)** "El Andinista" — señor/señora con ropa de
   montaña, bastones de trekking, poncho patagónico, con un mate en la
   mano y de fondo un cerro nevado.

### El Calafate

1. **(azul)** "El Glaciar Perito Moreno" — la pared de hielo azulado
   del glaciar cayendo al agua, con las pasarelas de madera con gente
   mirando. Ícono: un copo de nieve.
2. **(azul)** "Lago Argentino" — el lago con témpanos flotando y un
   barco turístico navegando entre ellos. Ícono: una ola.
3. **(marrón)** "Las Pasarelas" — las pasarelas y miradores de madera
   sobre la costa rocosa frente al glaciar. Ícono: un puente/escalera.
4. **(verde)** "La Estepa Patagónica" — guanacos pastando en la estepa
   con el viento y el paisaje árido de fondo. Ícono: una silueta de
   guanaco.
5. **R (rojo + corona)** "El Guía de Hielo" — señor/señora con ropa de
   frío, grampones y piolet, sonriendo frente al glaciar de fondo.

---

## Después de generarlos (proceso técnico, no hace falta pedírselo a ChatGPT)

1. Descargar la imagen que devuelva ChatGPT.
2. Recortarla/ajustarla a formato vertical parejo (ej. 720x1280 px) y
   convertirla a `.webp`.
3. Guardarla en `assets/passport/` con el nombre
   `bariloche-sello-1.webp` ... `bariloche-sello-4.webp`,
   `bariloche-sello-rival.webp` (mismo patrón para `el-calafate-sello-*`)
   — igual que los nombres que ya usan las ciudades de Uruguay.
4. Avisame cuando tengas las imágenes y me encargo de conectarlas en el
   juego (eso ya es la parte de programación).
