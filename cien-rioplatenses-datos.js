/* Edición de práctica: preguntas originales y puntajes de juego, no encuestas reales.
   Cada panel suma 100. Reemplazar puntos por resultados medidos al incorporar encuestas. */
const CIEN_CATEGORIAS=[
  {id:"comida",nombre:"Comida",corto:"Comida",icono:"🍖",color:"#BE2865"},
  {id:"carnaval",nombre:"Carnaval",corto:"Carnaval",icono:"🥁",color:"#7044BD"},
  {id:"futbol",nombre:"Fútbol",corto:"Fútbol",icono:"⚽",color:"#087F70"},
  {id:"costumbres",nombre:"Costumbres",corto:"Hábitos",icono:"🧉",color:"#AF5B20"},
  {id:"lunfardo",nombre:"Lunfardo",corto:"Lunfardo",icono:"💬",color:"#2859AC"},
  {id:"ciudades",nombre:"Ciudades",corto:"Ciudades",icono:"🏙️",color:"#997218"},
  {id:"playa",nombre:"Playa",corto:"Playa",icono:"🏖️",color:"#087F96"},
  {id:"musica",nombre:"Música",corto:"Música",icono:"🎸",color:"#AE356E"},
  {id:"viajes",nombre:"Viajes",corto:"Viajes",icono:"🧳",color:"#5152AC"},
  {id:"casa",nombre:"Casa",corto:"Casa",icono:"🏠",color:"#A54735"},
  {id:"animales",nombre:"Animales",corto:"Animales",icono:"🐾",color:"#337844"},
  {id:"escuela",nombre:"Escuela",corto:"Escuela",icono:"🎒",color:"#815096"}
];
// id | categoría | pregunta | respuesta:puntos:alias separados por coma; ...
const CIEN_PREGUNTAS=`asado|comida|Algo que ponés en la mesa cuando hay asado|Pan:30:pancito,panes;Ensalada:24:ensaladas;Chorizo:18:chori,chorizos;Vino:12:vinos;Chimichurri:9:chimi;Sal:7:salero
panaderia|comida|Algo que comprás en una panadería|Pan:32:panes,pancito;Bizcochos:23:bizcocho,factura,facturas;Medialunas:17:medialuna;Tortas:12:torta;Galletas:9:galleta,galletitas,galletita;Alfajores:7:alfajor
merienda|comida|Algo dulce para acompañar la merienda|Alfajor:30:alfajores;Galletitas:24:galletita,galletas,galleta;Torta:18:tortas,bizcochuelo;Medialuna:12:medialunas;Chocolate:9:chocolates;Churros:7:churro
desfile|carnaval|Algo que ves en un desfile de Carnaval|Disfraces:30:disfraz;Tambores:24:tambor,tamboril,tamboriles;Bailarines:18:bailarin,bailarina,bailarinas;Carrozas:12:carroza;Plumas:9:pluma;Banderas:7:bandera
disfraz|carnaval|Algo que usás para disfrazarte|Máscara:32:mascaras,careta,caretas;Peluca:23:pelucas;Sombrero:17:sombreros;Maquillaje:12:pintura facial,pintura;Capa:9:capas;Antifaz:7:antifaces
tablado|carnaval|Algo que encontrás en un tablado|Murga:30:murgas;Escenario:24:escenarios;Público:18:gente,espectadores;Micrófonos:12:microfono;Luces:9:luz,iluminacion;Sillas:7:silla,asientos
cancha|futbol|Algo que llevás a la cancha para alentar|Camiseta:32:camisetas,remera;Bandera:23:banderas;Bufanda:17:bufandas;Gorro:12:gorra,gorros,gorras;Tambor:9:bombo,tambores;Papel picado:7:papelitos,confeti
partido|futbol|Algo que puede cobrar el árbitro|Falta:30:faltas;Penal:24:penales,penalty;Fuera de juego:18:offside,orsai,posicion adelantada;Mano:12:manos;Tiro de esquina:9:corner,saque de esquina;Saque de banda:7:lateral,saque lateral
equipo|futbol|Un club de fútbol del Río de la Plata|Boca:30:boca juniors;River:24:river plate;Peñarol:18;Nacional:12;Racing:9:racing club;Independiente:7
mate|costumbres|Algo que necesitás para preparar mate|Yerba:32:yerba mate;Agua:23:agua caliente;Bombilla:17:bombillas;Mate:12:calabaza;Termo:9:termos;Caldera:7:pava,pava electrica,hervidor
domingo|costumbres|Un plan para un domingo en familia|Asado:30:hacer asado,comer asado;Paseo:24:pasear,caminar,salir a pasear;Almuerzo:18:almorzar,comer juntos;Película:12:peliculas,cine,ver una pelicula;Fútbol:9:ver futbol,jugar al futbol;Juegos de mesa:7:juego de mesa,cartas
lluvia|costumbres|Algo que hacés en casa un día de lluvia|Mirar una película:30:ver una pelicula,pelicula,peliculas,ver television,mirar tele,television;Dormir:24:siesta,dormir la siesta;Tomar mate:18:mate,matear;Leer:12:leer un libro,lectura;Cocinar:9:cocina;Jugar:7:videojuegos,juegos de mesa
dinero|lunfardo|Una forma popular de decir dinero|Plata:32;Guita:23;Mangos:17:mango;Billetes:12:billete;Lucas:9:luca;Pesos:7:peso
trabajo|lunfardo|Una palabra informal que podés escuchar hablando del trabajo|Laburo:30:laburar;Guita:24;Jefe:18:jefa;Changa:12:changas;Bondi:9;Fiaca:7
charla|lunfardo|Una palabra bien rioplatense en una charla entre amigos|Che:30;Bo:24;Dale:18;Ta:12;Bárbaro:9;Copado:7:copada
uruguay|ciudades|Una ciudad uruguaya que podrías visitar|Montevideo:32;Colonia:23:colonia del sacramento;Punta del Este:17:punta;Salto:12;Piriápolis:9;Maldonado:7
argentina|ciudades|Una ciudad argentina conocida para ir de paseo|Buenos Aires:30:capital federal,caba;Córdoba:24;Rosario:18;Mendoza:12;Bariloche:9:san carlos de bariloche;Mar del Plata:7:mardel
plaza|ciudades|Algo que encontrás en una plaza|Bancos:32:banco,banquitos;Árboles:23:arbol;Juegos:17:hamaca,hamacas,tobogan,juegos infantiles;Fuente:12:fuentes;Monumento:9:monumentos,estatua;Palomas:7:paloma
bolsoplaya|playa|Algo que guardás en el bolso para ir a la playa|Toalla:30:toallas,toallon;Protector solar:24:protector,bloqueador,bloqueador solar;Malla:18:traje de bano,bikini,short de bano;Agua:12:botella de agua;Lentes de sol:9:lentes,anteojos,anteojos de sol;Libro:7:libros
arena|playa|Algo que hacés en la arena|Tomar sol:32:broncearse,tomar el sol;Castillos:23:castillo,hacer castillos,castillos de arena;Jugar a la pelota:17:pelota,futbol,jugar al futbol;Caminar:12:pasear;Dormir:9:siesta;Tejo:7:jugar al tejo
costaplaya|playa|Algo que ves mirando hacia el mar|Olas:30:ola;Barcos:24:barco,velero,veleros;Gaviotas:18:gaviota;Bañistas:12:gente,personas,nadadores;Surfistas:9:surfista,surf;Horizonte:7
instrumentos|musica|Un instrumento para armar una banda|Guitarra:32:guitarras,guitarra electrica;Batería:23:bateria acustica;Bajo:17:bajo electrico;Teclado:12:teclados,piano;Saxofón:9:saxo;Trompeta:7:trompetas
fiesta|musica|Un ritmo que puede sonar en una fiesta rioplatense|Cumbia:30;Cuarteto:24;Reguetón:18:reggaeton;Rock:12;Salsa:9;Merengue:7
recital|musica|Algo que ves en un recital|Escenario:32;Luces:23:luz,iluminacion;Público:17:gente,espectadores;Cantante:12:cantantes;Parlantes:9:parlante,altavoces;Pantallas:7:pantalla
valija|viajes|Algo que metés en la valija|Ropa:30:remeras,pantalones;Calzado:24:zapatos,zapatillas;Cepillo de dientes:18:cepillo;Cargador:12:cargador de celular;Documentos:9:documento,pasaporte,cedula,dni;Perfume:7:perfumes
transporte|viajes|Un transporte que podés usar para viajar|Auto:32:coche,automovil;Ómnibus:23:omnibus,colectivo,bus,micro;Avión:17:aviones;Tren:12:trenes;Barco:9:ferry,buque;Moto:7:motocicleta
rutaparada|viajes|Un motivo para parar durante un viaje en ruta|Ir al baño:30:bano,banio;Cargar combustible:24:nafta,combustible,cargar nafta,gasolina;Comer:18:almorzar,merendar;Descansar:12:descanso,dormir;Comprar agua:9:agua,bebida,bebidas;Sacar fotos:7:fotos,fotografiar
cocina|casa|Algo que encontrás en una cocina|Heladera:32:refrigerador;Cocina:23:horno,estufa;Olla:17:ollas;Platos:12:plato;Cubiertos:9:tenedor,cuchillo,cuchara;Microondas:7
perdido|casa|Algo que buscás por toda la casa|Llaves:30:llave;Celular:24:telefono,movil;Control remoto:18:control,mando;Lentes:12:anteojos,gafas;Billetera:9:cartera,monedero;Medias:7:media,calcetines
limpieza|casa|Algo que usás para limpiar la casa|Escoba:32:escobas;Trapo:23:trapos,pano;Detergente:17:jabon;Balde:12:cubo;Aspiradora:9;Lampazo:7:mopa,fregona
mascotas|animales|Una mascota que alguien puede tener en casa|Perro:32:perros,perrito;Gato:23:gatos,gatito;Pez:17:peces,pecera;Hámster:12:hamsters;Conejo:9:conejos;Tortuga:7:tortugas
campo|animales|Un animal que podés ver en el campo rioplatense|Vaca:30:vacas,ternero,toro;Caballo:24:caballos,yegua;Oveja:18:ovejas,cordero;Gallina:12:gallinas,gallo;Cerdo:9:chancho,chanchos;Carpincho:7:carpinchos,capibara
paseoperro|animales|Algo que llevás cuando sacás a pasear al perro|Correa:32:correas;Bolsitas:23:bolsa,bolsas,bolsita;Agua:17:botella de agua;Collar:12:arnes;Pelota:9:pelotita,juguete;Premios:7:galletitas,snacks,comida
mochila|escuela|Algo que llevás en la mochila para ir a clase|Cuaderno:30:cuadernos;Lápiz:24:lapices,lapicera,boligrafo;Libro:18:libros;Goma:12:goma de borrar,borrador;Regla:9:reglas;Merienda:7:comida,colacion
recreo|escuela|Algo que hacés durante el recreo|Jugar:32:juegos;Comer:23:merendar,tomar la merienda;Charlar:17:hablar,conversar;Correr:12:carrera;Ir al baño:9:bano,banio;Tomar agua:7:agua,beber agua
materias|escuela|Una materia que se estudia en la escuela|Matemática:30:matematicas;Lengua:24:idioma espanol,lenguaje;Historia:18;Geografía:12;Ciencias:9:ciencias naturales;Educación física:7:gimnasia,deporte,deportes`
.split("\n").map(linea=>{
  const [id,categoria,pregunta,panel]=linea.split("|");
  return{id,categoria,pregunta,respuestas:panel.split(";").map(entrada=>{
    const [texto,puntos,alias=""]=entrada.split(":");return{texto,puntos:Number(puntos),alias:alias?alias.split(","):[]};
  })};
});
