/* Rondas propias de Rueda de Letras. La base siempre integra la lista.
   Solo palabras comunes (las que cualquiera piensa jugando): las raras
   (TOTEM, MOTA, ARDUO…) no van en el crucigrama. */
const RUEDA_DATOS=[
  {base:"TAMBOR",ciudad:"durazno",palabras:["TAMBOR","AMOR","BOTA","BROMA","MORA","OBRA","OTRA","RAMO","RATO","ROBA","ROTA","TOMA","TOMAR","BOTAR","BROTA","RABO","TRAMO","MAR","BAR"]},
  {base:"SALADO",ciudad:"montevideo",palabras:["SALADO","SALA","LADO","SALDO","SOLA","ASADO","ALADO","SODA","LOSA","OSADA","ALAS","SAL","SOL","OLA"]},
  {base:"DURAZNO",ciudad:"durazno",palabras:["DURAZNO","DURO","DURA","NUDO","ZONA","RONDA","RAZON","DONAR","NADO","ONDA","DUNA","ZURDO","ZURDA","RUDO","URNA","DAR","UNO","AUN"]},
  {base:"CAMPERA",ciudad:"tacuarembo",palabras:["CAMPERA","CAMA","MAPA","CAPA","CARPA","CREMA","PERA","CARA","MAREA","ARPA","ARCA","AREA","ARMA","CERA","PARA","RAMA","MARCA","CAER","RAMPA","PECA","PECAR","MAR","PAR"]},
  {base:"MILONGA",ciudad:"montevideo",palabras:["MILONGA","AMIGO","GOMA","LONA","MANGO","LIGA","LIMON","MAGO","MALO","MANI","MIGA","LAGO","LIMA","MANO","MONA","MINA","LOMA","ALGO","IMAN","ANIMO","GALON","NOGAL","GOMINA","LINO","AGIL","MIL","MAL","GOL"]},
  {base:"CARMELO",ciudad:"colonia",palabras:["CARMELO","CALOR","COLA","CAER","CERO","COMER","CREMA","MALO","REMO","AMOR","ARCO","CLARO","CARO","COMA","COME","REAL","MORAL","CORAL","MORA","LOMA","ROCA","MARCO","MOLER","LAMER","CREO","MAREO","RECLAMO","ACERO","ALERO","MAR"]},
  {base:"COLONIA",ciudad:"colonia",palabras:["COLONIA","COLA","LONA","LINO","COLINA","LOCION","LOCO","LOCA","CLON","CLAN","COLON","ICONO","OCIO","NACI","LAICO","CONO","CON"]},
  {base:"PESCADO",ciudad:"piriapolis",palabras:["PESCADO","PESCA","PESO","PASEO","PASE","COPA","SECO","SECA","CASO","PASO","SAPO","POSE","PECA","SOPA","SEDA","SACO","COSA","PECADO","PESADO","SECADO","PODA","SODA","DOCE","PECOSA","EPOCA","ASCO"]},
  {base:"COMARCA",ciudad:"tacuarembo",palabras:["COMARCA","MARCA","MARCO","ARCO","CARA","CAMA","AMOR","RAMO","COMA","ROCA","CARO","ARMA","AROMA","COCA","RAMA","MORA","CACAO","MAR"]},
  {base:"COSTERA",ciudad:"punta",palabras:["COSTERA","COSTA","COSTAR","CORTA","CORTE","CERO","CERA","ROCA","ROSA","ROSCA","SACO","SECO","TACO","ARTE","RESTO","RESTA","ESTAR","ACERO","ACTOR","CASTOR","CESTA","CESTO","RECTA","TOSER","TOCAR","SECTOR","TERCO","CREO","OTRA","ROTA","RATO","TRES","ESTO","ESTA","CASO","COSA","CARO","SECAR","CASERO","COSER","CRESTA"]},
  {base:"PAISANO",ciudad:"salto",palabras:["PAISANO","PASA","PASAN","PISO","PISA","PISAN","PINO","SOPA","PIANO","SANO","SANA","SAPO","PASO","ASNO","ANIS","APIO","OPINA","PASION","ANSIA","PAN"]},
  {base:"CASERO",ciudad:"rivera",palabras:["CASERO","ARCO","ROSCA","CARO","SECO","SECA","CERO","ACERO","CASO","COSA","CERA","ROCA","ROSA","SACO","CREO","CAER","COSER","SECAR","ASCO"]},
  {base:"CARETA",ciudad:"montevideo",palabras:["CARETA","CARA","RATA","CARTA","AREA","ACTA","ARTE","CERA","TAREA","CAER","CATRE","RECTA","TERCA","ACERA","ARCA"]},
  {base:"PALOMA",ciudad:"colonia",palabras:["PALOMA","PALO","MAPA","PALA","LOMA","MALO","MALA","ALMA","PALMA","ALAMO","MOLA"]},
  {base:"PLANTA",ciudad:"salto",palabras:["PLANTA","PLATA","PATA","TAPA","LATA","NATA","PLAN","ALTA","LANA","PALA","PALTA","PANAL","PLANA","NATAL","PAN"]},
  {base:"ASADOR",ciudad:"piriapolis",palabras:["ASADOR","ROSA","SODA","ASADO","ASAR","OSAR","ADORA","ARADO","ROSADA","SORDA","OSADA","RASO","DAR"]},
  {base:"CANTOR",ciudad:"tacuarembo",palabras:["CANTOR","CARO","CANTO","ROCA","RATO","CORTA","CORTAN","TOCAR","TOCAN","CONTAR","CONTRA","CARTON","RATON","NOTA","NOTAR","TACO","TACON","ACTOR","ARCO","ROTA","OTRA","RONCA"]},
  {base:"TOMATE",ciudad:"punta",palabras:["TOMATE","MATE","TEMA","META","TOMA","MATO","TEMO","METO"]},
  {base:"BANDERA",ciudad:"artigas",palabras:["BANDERA","NADA","BANDA","RANA","ARENA","ANDAR","NADAR","ARDE","ANDA","ABRE","AREA","BAR","DAR"]},
  {base:"MOCHILA",ciudad:"rivera",palabras:["MOCHILA","COLA","HOLA","LIMA","MALO","MACHO","CLIMA","LOCA","HILO","CIMA","COMA","LOMA","CALMO","LACIO","HALO","CHAL","MIL","MAL"]},
  {base:"ALFAJOR",ciudad:"maldonado",palabras:["ALFAJOR","FAJA","RAJA","FLOR","FAROL","FAROLA","FLOJA","ROJA","FARO","OJAL","FORJA","FLORA","AFLOJA","AFLORA","ALOJAR","JALAR","LORA"]},
  {base:"CAMINOS",ciudad:"durazno",palabras:["CAMINOS","CAMINO","CAMION","CASINO","CAMISON","MOCASIN","MANO","SANO","MISA","MONA","CASI","MINA","COSA","MOSCA","SOCIA","MANSO","MANCO","CIMA","CASO","SACO","ANIMO"]},
  {base:"MERCADO",ciudad:"montevideo",palabras:["MERCADO","CARO","MORA","ARCO","ROCA","CEDRO","RAMO","CERDO","MODA","CARDO","MADRE","MADERO","CREMA","COMER","MARCO","CREADO","RECADO","DEMORA","ACORDE","DOMAR","COMADRE","AMOR","CERO","CREO","MAREO","ACERO"]},
  {base:"CANTINA",ciudad:"colonia",palabras:["CANTINA","CANA","NATA","TINA","CITA","CANTA","CANTAN","CINTA","CANINA","NANA","ACTA","TIA"]}
];
