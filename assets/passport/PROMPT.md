# Prompt para generar sellos de pasaporte (ChatGPT / imágenes)

Cada ciudad del Mapa de Uruguay tiene un pasaporte con **5 sellos**: 4
numerados (hitos/lugares de la ciudad) + 1 final marcado con **"R"**, que
es el personaje rival de esa ciudad (un retrato de él/ella).

Hoy los 21 sets no son 100% consistentes: 13 ciudades ya tienen el estilo
correcto (estampilla vertical vintage, ilustración a color) y 8 quedaron
con un estilo distinto (medallón dorado redondo) que hay que rehacer.
Este prompt sirve para generar esos 8 sets con el estilo correcto.

**Ciudades a rehacer:** Centenario, Colonia, Montevideo, Piriápolis,
Polonio, Punta del Este, Salto, Tacuarembó.

---

## Estilo obligatorio (no puede cambiar)

- Forma de **estampilla postal vertical**, con el borde perforado/dentado
  típico de un sello, proporción aprox. 9:16 (ej. 720x1280 px).
- Fondo general color **crema/hueso** (papel viejo), no blanco puro.
- Panel interior con la ilustración, enmarcado por un **doble borde fino
  del color de la categoría** (ver abajo), esquinas redondeadas.
- Insignia circular arriba al centro con el **número (1-4) o "R"**, del
  mismo color que el borde, y al lado unas **líneas onduladas tipo
  matasellos de correo** (el sello de cancelación postal).
- Un **ícono chico simple** (pictograma, relleno, un solo color) debajo
  de la ilustración, que represente el tema puntual de ese sello
  (ej. una ola para algo de agua, un sombrero para un personaje, una
  copa para vino, etc. — se elige según el tema, no es siempre el mismo).
- Abajo, una **cinta/banner** del mismo color de categoría con:
  - Título corto en mayúsculas (ej. "LA PLAZA")
  - Nombre de la ciudad en mayúsculas debajo
  - "— URUGUAY —" en mayúsculas, más chico
- Ilustración **pintada semi-realista y colorida**, estilo póster de viaje
  vintage — nunca foto, nunca plano/vector, nunca en un solo color
  (monocromo), nunca circular/medallón.
- Colores de borde según el número (así quedan igual a los que ya están
  bien hechos):
  - **1 y 2 → azul**
  - **3 → marrón/sepia**
  - **4 → verde**
  - **R (rival) → rojo/bordó, con una corona dorada arriba del círculo
    y otra chica abajo cerca de la cinta** (el personaje siempre lleva
    una coronita porque es el "rival" de esa ciudad)
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

Tema de la ilustración: [TEMA / LUGAR / PERSONAJE], en [CIUDAD], Uruguay.

Reglas obligatorias de composición:
- El panel interior con la ilustración va enmarcado por un doble borde
  fino de color [COLOR: azul / marrón / verde / rojo y dorado].
- Arriba al centro, una insignia circular del mismo color con el
  número "[NÚMERO]" (o la letra "R" si es un retrato de personaje)
  adentro, y al lado unas líneas onduladas tipo matasellos postal.
- Debajo de la ilustración, un ícono chico simple de un solo color que
  represente el tema (ej: una ola, un sombrero, una copa, lo que
  corresponda).
- Abajo de todo, una cinta del mismo color con el texto "[TÍTULO]" en
  mayúsculas grande, "[CIUDAD]" en mayúsculas debajo, y "— URUGUAY —"
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

## Ejemplo ya usado (Durazno — para referencia visual, no hay que copiarlo)

- **Sello 1 (azul):** Tema "La Plaza" — plaza principal con el
  monumento/obelisco y la torre de la iglesia de fondo, palmera al
  costado. Ícono: una hoja/planta.
- **Sello 2 (azul):** Tema "El Río" — puente sobre el Río Yí con
  vegetación en las orillas. Ícono: ondas de agua.
- **Sello 3 (marrón):** Tema "La Historia" — iglesia/edificio histórico
  con un cañón antiguo al frente. Ícono: un libro.
- **Sello 4 (verde):** Tema "La Gente" — dos gauchos a caballo yendo
  hacia un cartel con el nombre de la ciudad, arreando ganado. Ícono:
  grupo de personas.
- **Sello R (rojo + corona):** Personaje "El Tío del Asado" — señor con
  boina, delantal que dice "BUEN ASADO BUENA GENTE", haciendo un asado,
  con corona arriba y abajo.

(Las imágenes de este set completo ya te las mandé antes en el chat.)

---

## Los 8 sets a pedir (mismo título de siempre, solo cambia el dibujo)

Los títulos de cada sello **ya están definidos en el juego** — no hay
que inventarlos, solo ilustrarlos con el estilo de arriba.

**Montevideo:** 1) Rambla · 2) Ciudad Vieja · 3) Estadio Centenario ·
4) Mercado del Puerto · R) La Vecina Curiosa

**Piriápolis:** 1) La Rambla · 2) Cerro San Antonio · 3) Castillo de
Piria · 4) El Puerto · R) El Guardavidas

**Punta del Este:** 1) La Mano · 2) El Puerto · 3) La Peatonal ·
4) Playa Brava · R) La Turista

**Salto:** 1) Las Termas · 2) La Costanera · 3) La Catedral · 4) Salto
Grande · R) El Parrillero

**Colonia:** 1) El Faro · 2) Calle de los Suspiros · 3) El Portón ·
4) La Basílica · R) El Cinéfilo

**Tacuarembó:** 1) Laguna de las Lavanderas · 2) Plaza 19 de Abril ·
3) Carlos Gardel · 4) Las Cuchillas · R) El Gaucho

**Cabo Polonio:** 1) Las Dunas · 2) Isla de Lobos · 3) El Pueblo ·
4) Cielo de Estrellas · R) El Farolero

**Estadio Centenario:** 1) La Fachada · 2) Torre de los Homenajes ·
3) Noche de Gala · 4) Aquí Nace el Fútbol · R) La Campeona

---

## Después de generarlos (proceso técnico, no hace falta pedírselo a ChatGPT)

1. Descargar la imagen que devuelva ChatGPT.
2. Recortarla/ajustarla a formato vertical parejo (ej. 720x1280 px) y
   convertirla a `.webp`.
3. Guardarla en `assets/passport/` pisando el archivo que ya existe con
   el mismo nombre (ej. `montevideo-sello-1.webp`).
4. **Importante:** como esos nombres de archivo ya existen hoy, el
   celular los tiene guardados en caché — avisame cuando tengas las
   nuevas imágenes y yo me encargo de subirlas y de refrescar la caché
   del juego para que se vean en todos los celulares.
