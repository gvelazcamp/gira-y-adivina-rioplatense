# Cerebro del proyecto — Girá y Adiviná Rioplatense

Memoria técnica y funcional para Gonzalo, Codex y Claude Code.

**Fecha:** 05/10/2026. **Rama examinada:** `main`. **Referencia de origen:** `ed5b812e71917c4208a062a9cbe2fb191d433177`.

## Cómo usar esta memoria

Leer este archivo al comenzar un trabajo y después abrir los archivos fuente del área solicitada. Es una fotografía del repositorio en la referencia indicada; el código posterior puede cambiar. Este documento no se actualiza solo ni garantiza que un asistente lo recuerde sin leerlo.

Las cinco etapas propuestas por Gonzalo se usan como analogía para organizar conocimiento del proyecto. No se agrega inteligencia artificial, un sistema neuronal ni una función nueva al juego.

**Reglas del dueño:** no romper lo que funciona; agregar solo lo pedido; no eliminar ni reescribir código sin autorización; consultar las decisiones de alcance incierto. Conservar indentación, datos, estilos y comportamientos ajenos al pedido. No convertir ideas guardadas en tareas autorizadas.

**Jerarquía de evidencia:** instrucción actual de Gonzalo para decidir qué hacer; código de la revisión actual para determinar qué existe; resultados de pruebas para afirmar qué se comprobó; documentación para contexto; conversaciones anteriores como antecedentes que necesitan confirmación. Una función presente no demuestra que funciona en todos los celulares ni que un servicio externo está configurado.

## 1. Codificación: captar información y decidir qué merece atención

> Tus sentidos captan información y el cerebro decide qué parte merece atención.

En el proyecto, las entradas son el pedido de Gonzalo, el árbol del repositorio, el código, los recursos, los documentos y las pruebas. Registrar hechos con ruta, símbolo y referencia de Git; separar los hechos de las hipótesis.

### Identidad y arquitectura comprobadas

- Repositorio: https://github.com/gvelazcamp/gira-y-adivina-rioplatense
- Web referenciada por el proyecto: https://gvelazcamp.github.io/gira-y-adivina-rioplatense/
- Juego de ruleta y frases con cultura rioplatense, mapas, progreso, cosméticos, colecciones, eventos, torneos, opciones sociales y extensiones.
- Aplicación estática de HTML, CSS y JavaScript sin framework ni compilación de producción. El núcleo sigue en `index.html`, con estilos y lógica embebidos; las extensiones tienen módulos propios.
- PWA: `manifest.json`, `sw.js`, iconos y página principal. El manifiesto declara idioma `es-UY`, presentación `standalone`, orientación `portrait` y color `#160B24`.
- Android: `.well-known/assetlinks.json` vincula `io.github.gvelazcamp.twa`. El proyecto Android y sus permisos no están en este árbol; no afirmar que un cambio del empaquetado está resuelto aquí.
- Existe `package.json` para pruebas con Playwright. No implica un proceso de build del juego.

### Qué examinar ante un pedido

1. Identificar la pantalla, el modo y el dispositivo afectados.
2. Encontrar el código que controla el comportamiento y sus dependencias.
3. Revisar las claves de guardado, versiones de recursos y pruebas pertinentes.
4. Registrar el alcance exacto. Si es documental, no modificar reglas ni interfaz.
5. Guardar la fuente del hallazgo; no deducir implementación a partir del nombre de un asset.

## 2. Cambios en las conexiones: relacionar las partes del proyecto

> Algunas neuronas empiezan a comunicarse con mayor facilidad entre sí. Esto se llama plasticidad sináptica. Si una conexión se activa repetidamente, puede fortalecerse.

En esta memoria, reforzar una relación significa documentar qué piezas se necesitan mutuamente y confirmar esa relación en el código. No significa cambiar automáticamente la arquitectura.

### Mapa de dependencias

| Área | Fuente y relación que debe conservarse |
|---|---|
| Partida principal | `index.html`: `S` es estado autoritativo del anfitrión; `publicar()` produce `V`; `pintar()` y `pintarTodo()` presentan la vista. |
| Modos | `modo`: `local`, `bot`, `host`, `guest`, `tvhost`, `tvguest`. Revisar todas las ramas afectadas por un cambio compartido. |
| Ruleta | `SEG`, `ETI`, `FONDO`, `TINTA` y lógica de giro en `index.html`. Hay 24 gajos, dos QUIEBRA y dos PIERDE TURNO. La selección tiene condiciones especiales; contar gajos no prueba la frecuencia efectiva de cada contexto. |
| Mapas | `MUNDO_URUGUAY`, `MUNDO_ARGENTINA`, `MUNDO`, `claveMundo()` y progreso. Uruguay y Argentina tienen 21 destinos cada uno. No confundir un id de destino con su nombre visible. |
| Tienda | Funciones `tn*`, confirmaciones, metadatos, propiedad/equipamiento y persistencia en `index.html`. Mantener los ids de productos y cosméticos. |
| Colecciones | `COLECCIONES`, sobres y arte en `assets/collectibles/`. La existencia de una ciudad en el mapa no confirma su colección o sus sellos. |
| Pasaporte | Recursos en `assets/passport/` y lógica correspondiente en `index.html`. Los sellos son distintos de los coleccionables. |
| Extensiones | `extensiones.js`: catálogo `EXTENSIONES`, lobby, apertura, cierre y teclas. `extensiones.css` aporta estilos; cada módulo implementa su juego. |
| Contenido compartido | `duelo-extensiones.js`: `Vistas` guarda contenido visto; `Duelo` maneja encuentros; `sonidoErrorExt` respeta el sonido del juego. |
| Salas de extensiones | `MultiBroker`: cuatro brokers MQTT en paralelo y Supabase Realtime, con descarte de mensajes duplicados. `GYA_VERSION_SALAS` identifica la versión de diagnóstico. |
| Sala principal y TV | `conectar()` en `index.html` usa transporte propio. `sala-tv.js`, `sala-tv.css` y `tv.html` completan la experiencia TV/celular. No aplicar cambios de MultiBroker suponiendo que todos los modos lo usan. |
| Contra Reloj online | `contra-reloj-rioplatense-online.js` sincroniza sala y roles; `contra-reloj-rioplatense-voz.js` transporta voz WebRTC; el módulo principal aporta reglas e interfaz. |
| Juegos de previa | `pantalla-fija.js`: pantalla completa, Wake Lock, confirmación de salida y herramientas comunes de jugadores/invitación. |
| Lectura de pistas | `hablar()` en `extensiones.js` usa Web Speech y coordina la pausa/reanudación de música. La voz disponible depende del dispositivo. |
| Guardado y social | `index.html`: localStorage, `capturarEstadoJuego()`, ranking, usuarios y sincronización Supabase. |
| Distribución | `index.html` carga scripts versionados; `sw.js` precachea el shell y decide cómo actualizar recursos. |

### Catálogo real del lobby

Los 18 juegos siguientes aparecen en `EXTENSIONES`. En esta revisión los flags del núcleo para el lobby, Rueda, Palabra, Rosco, Cien y Ahorcado están en `true`. Esto confirma disponibilidad declarada en código, no una prueba completa de cada juego.

| Juego | Archivo principal | Mecánica y ubicación |
|---|---|---|
| Sopa Fugaz | `sopa-fugaz.js` | Encontrar palabras antes de que cambien de lugar. |
| Rueda de Letras | `rueda-de-letras.js` | Unir letras contra el tiempo; datos y diccionario propios. |
| Palabra Secreta | `palabra-secreta.js` | Palabra de 5 letras en 6 intentos. |
| Frases en Giro | `frases-en-giro.js` | Ordenar frases entre giros y señuelos. |
| Memoria en Giro | `memoria-en-giro.js` | Encontrar pares antes de que giren. |
| El Rosco | `rosco-rioplatense.js` | Resolver palabras a partir de pistas. |
| Silabario Rioplatense | `silabario-rioplatense.js` | Construir respuestas con sílabas del tablero. |
| 100 Rioplatenses Dicen | `cien-rioplatenses.js` | Descubrir respuestas del panel según el tema. |
| Ahorcado Rioplatense | `ahorcado-rioplatense.js` | La ruleta selecciona categoría y se adivina la palabra. |
| Contra Reloj | `contra-reloj-rioplatense.js` | Previa, 4+ jugadores; describir 5 palabras; ronda de 30 s y previa de 3 s. Módulos separados para online y voz. |
| Impostor | `impostor.js` | Previa, 3+ jugadores; una persona no recibe la misma palabra. |
| Mímica rioplatense | `mimica.js` | Previa, 4+ jugadores; actuar para que el equipo adivine. Dificultades Fácil +1 / Media +2 / Difícil +3 elegidas en el menú (una o varias) y frases al azar de esas. |
| Canta la Canción | `canta-la-cancion.js` | Previa; cantar una canción que contenga la palabra. Se graba el canto y un jurado (los demás) vota 👍/👎; sin voz a texto. |
| Tutti Frutti | `tutti-frutti.js` | Previa con celulares y sala (hasta 10 jugadores, `MAXJ`); 3 rondas fijas, tiempos 60/90/120 s, categorías, validación de respuestas, objeciones con respuesta del autor, chat de la sala y música. |
| ¿Quién soy? | `quien-soy.js` | Previa; celular en la frente y adivinar la palabra. Tiempos 30/40/50 s; un toque en cualquier lado = acerté, dos toques = paso. |
| Bomba | `bomba.js` | Previa; decir una palabra y pasar el celular antes de la explosión. |
| ¿Qué número soy? | `que-numero-soy.js` | Previa; número grande con pantalla fija. |
| Moon Tap | `moon-tap.js` | Acierto por timing sobre un aro; está integrado al lobby. |

**Mahjong:** `mahjong-rioplatense.html` es una página independiente. El catálogo explica que está oculto del lobby porque su inicio necesita arreglos. Sus reglas se consultan en `mahjong-rioplatense.md`: pares por asociación, fichas apiladas y modos Espejo/Memoria/Hielo/Reloj. No extender su regla de interfaz sin texto a los demás juegos.

**Archivos alternativos:** `Moon_tap.html`, las páginas HTML individuales de varias extensiones, `assets/worlds/index.html` y `test-lodo.html` existen. No asumir que son la implementación cargada por el lobby; comprobar los `script src` y enlaces actuales antes de editar.

## 3. Consolidación: convertir hallazgos en memoria estable

> El hipocampo es especialmente importante para formar recuerdos nuevos. Con el tiempo, muchos recuerdos se van integrando en distintas zonas de la corteza cerebral.

En el proyecto, consolidar consiste en pasar de un hallazgo puntual a una descripción verificable, con fecha, fuente y estado. Las ideas permanecen como ideas hasta que Gonzalo autorice implementarlas.

### Estado consolidado del juego

- **Progreso:** claves `gya_*` y `larueda_*`; `capturarEstadoJuego()` captura las claves admitidas y la presencia de mapa, respetando `ESTADO_JUEGO_EXCLUIR`. No borrar ni renombrar claves sin tratar la compatibilidad del progreso existente.
- **Supabase:** `gya_ranking` se usa para `global` y `usuarios`, con `estado_juego` y upsert por `grupo,apodo`. También hay inserción de reportes en `gya_reportes_frases`. Supabase Realtime participa en las salas de extensiones. El repositorio no demuestra por sí solo el esquema, las políticas o el estado operativo de la base.
- **Restauración:** existe el flujo `?restaurar_apodo=`. La identidad por nombre no equivale a una cuenta autenticada y no se debe cambiar sin evaluar la compatibilidad.
- **Billing:** `TN_PRODUCTOS_REALES` contiene `monedas_500`, `monedas_1350`, `monedas_3500`, `monedas_8500`, `vidas_llenas`, `vidas_infinitas_30min`, `vidas_infinitas_24h`, `sin_publicidad`. Hay integración Digital Goods API/PaymentRequest, otorgamiento de productos y restauración de sin publicidad. Las compras reales requieren prueba desde la app de Google Play; esta revisión no hizo transacciones.
- **Torneos:** `TORNEO_TICKETS_ENTRADA=5`, temporada definida por `TORNEO_TEMPORADA_MS=10*86400000`; hay premios y lógica de racha. No usar el precio en monedas de conversaciones antiguas como descripción actual.
- **Eventos y futuro:** `IDEAS.md` mezcla funcionalidades marcadas hechas con propuestas pendientes. Su plan de segunda app independiente exige autorización expresa antes de implementar. El popup automático de monedas después de Gift sigue indicado como pendiente y fuera de producción.
- **Caché:** revisión con `CACHE_NAME="gya-cache-v189"`. Assets y recursos externos usan caché primero; otros recursos, red primero con `cache:"no-store"` y fallback. Reemplazar bytes de un asset con el mismo nombre requiere revisar la versión de caché. Los cambios de JS requieren mantener coherentes las URLs versionadas del HTML y el shell.

### Contradicciones documentales detectadas

| Texto anterior | Evidencia actual y cómo recordarlo |
|---|---|
| `CLAUDE.md`: sin `package.json` ni pruebas | Existen `package.json` y 14 archivos de pruebas/auditoría en `tests/`. Consultarlos. |
| `CLAUDE.md`: compras reales todavía stub/pendientes | `index.html` implementa Billing; `IDEAS.md` lo marca conectado. No afirmar compra exitosa sin prueba Android. |
| `CLAUDE.md`: todo Supabase pasa por una tabla | También se usa `gya_reportes_frases` y Realtime. |
| `PLAY_BILLING_SETUP.md`: seis productos | El catálogo de código tiene ocho ids, incluidos 30 min y sin publicidad. Verificar Play Console aparte. |
| Comentarios con cantidades históricas | Verificar arrays y recursos; un comentario no es un inventario actualizado. |

No se corrigieron estos documentos en este trabajo: se registran las diferencias para no perder conocimiento ni ampliar el cambio autorizado.

### Pendientes que sí tienen fuente

| Pendiente | Fuente y límite |
|---|---|
| Voz online en redes difíciles | `CONTRA_RELOJ_VOZ_PENDIENTE.md`: TURN pendiente; existe enganche `window.GYA_TURN_SERVERS`. No publicar credenciales fijas en el cliente. |
| Micrófono en Android si falla | El mismo documento señala revisar `RECORD_AUDIO` en el proyecto Android externo. No se comprobó un fallo en esta revisión. |
| Sala TV en dispositivos reales | `SALA_TV_PRUEBA.md`: pruebas físicas de TV, mando, suspensión y redes pendientes; cierre del anfitrión no recupera partida. |
| Inicio de Mahjong | Comentario de `extensiones.js`: mantenerlo oculto hasta corregir el inicio. |
| Segunda app y popup promocional | `IDEAS.md`: propuestas que no deben activarse sin pedido y definición de Gonzalo. |
| Marcos de ciudad y Pack Pescera/Acuario | `IDEAS.md` los menciona como pendientes/futuros. Antes de actuar, volver a contrastar catálogo y assets actuales. |

## 4. Almacenamiento distribuido: conservar conocimiento donde corresponde

> Un recuerdo puede involucrar varias regiones. Por ejemplo, la imagen de una persona, su voz, su nombre y las emociones relacionadas pueden estar representados en circuitos diferentes.

Este archivo orienta; el código conserva la implementación, los datos conservan contenido, los recursos conservan arte/sonido y las pruebas conservan comprobaciones. Evitar copiar todo el código aquí: esas copias quedarían desactualizadas.

### Dónde vive cada memoria

| Tipo de conocimiento | Lugar de referencia |
|---|---|
| Resumen y navegación del proyecto | `CEREBRO_DEL_PROYECTO.md` |
| Instrucciones históricas de trabajo | `CLAUDE.md`, contrastado con código actual y pedido del dueño |
| Reglas y sistema principal | `index.html` |
| Catálogo, estilos y funciones de extensiones | `extensiones.js`, `extensiones.css`, módulos específicos |
| Palabras/pistas/respuestas | `*-datos.js`, diccionario de Rueda y `assets/diccionario/` |
| Pruebas y auditoría de contenido | `tests/`, `package.json`, `AUDITORIA_PALABRAS.md` |
| Ideas y decisiones de futuro | `IDEAS.md` |
| Voz, TV y pagos | Documentos específicos y sus implementaciones |
| Arte y sonidos | `assets/`, `img/`, logos e iconos de la raíz |
| Estilo para nuevos assets | `assets/**/PROMPT*.md` |
| Instalación, caché y vinculación Android | `manifest.json`, `sw.js`, `.well-known/assetlinks.json` |
| Licencias y privacidad | `THIRD_PARTY_NOTICES.md`, licencias de terceros y `privacidad.html` |

### Reglas de contenido y visuales

- `CLAUDE.md` exige que las respuestas únicas de Ahorcado, Contra Reloj, Impostor, Mímica, Quién soy, Rosco, Silabario y Sopa Fugaz no se repitan entre juegos ni dentro de ellos; también controla pistas/preguntas/frases. Las excepciones del auditor generan avisos para Cien, Canta, Palabra y Rueda.
- Prioridad documentada para conservar una respuesta: Rosco > Silabario > Ahorcado > Sopa Fugaz > Contra Reloj.
- Después de cambiar contenido: `node tests/auditar-palabras.cjs --md`; revisar el informe generado y corregir errores antes de subir.
- `Vistas` conserva el historial de contenido mostrado hasta agotar cada banco; no quitarlo al agregar niveles.
- Para arte, leer el PROMPT del tipo correspondiente. Preservar el exterior oscuro de los marcos de letra. Una imagen por objeto cuando Gonzalo pida assets separados. Distinguir marcos, fondos, sellos y coleccionables.
- No inventar lugares o elementos de una ciudad como si fueran reales; verificar referencias cuando se cree arte geográfico.
- Para audio, revisar referencias existentes antes de sustituir una pista. No borrar música o sonidos de otras extensiones por cambiar una sola.

## 5. Recuperación: encontrar y reactivar el contexto necesario

> Cuando recordás algo, el cerebro reactiva parte de ese patrón de neuronas.

En el proyecto, recuperar significa usar este índice para abrir el código y las decisiones relevantes, comprobar si siguen vigentes y trabajar solo en el alcance pedido.

### Índice de búsquedas rápidas

| Pedido | Empezar por |
|---|---|
| Cambiar giro, quiebra, letras o turnos | `SEG`, `publicar`, `pintar`, `S`, `V`, `modo` en `index.html` |
| Agregar una extensión | `EXTENSIONES`, flags en el núcleo, scripts del HTML, CSS y `APP_SHELL`; seguir el contrato `abrir`/`salir` existente |
| Cambiar una extensión | Su módulo, `*-datos.js`, estilos con prefijo propio, pruebas de ese juego |
| Fallo al entrar a una sala | Distinguir juego principal/TV, Contra Reloj o extensiones/Tutti; revisar su transporte específico |
| Problema de voz Contra Reloj | Archivos online/voz y documento de TURN; permisos del dispositivo |
| Compra, cosmético o inventario | `tnPuedeComprar`, `tnEjecutarCompra`, confirmaciones, helpers de propiedad y claves de equipamiento |
| Dinero real | `TN_PRODUCTOS_REALES`, `tnInicializarBilling`, `tnComprarReal`, `tnOtorgarProductoReal`, `tnRestaurarCompras` |
| Progreso, ranking o recuperar usuario | `capturarEstadoJuego`, `ESTADO_JUEGO_EXCLUIR`, `empujarUsuario`, `empujarRanking`, `restaurar_apodo` |
| Ciudad o colección faltante | Comparar mundo, `COLECCIONES`, pasaporte y recursos; no deducir uno a partir de otro |
| Teléfono muestra versión vieja | URLs `?v=`, `APP_SHELL`, `CACHE_NAME`, estrategia del service worker |
| Propuesta nueva | `IDEAS.md` y autorización actual; no implementar planes futuros por iniciativa propia |

### Verificación que corresponde a cada cambio

Hay scripts npm `test:tv`, `test:mobile`, `test:background`, `test:escudos`, `test:sopa`, `test:rueda`, `test:palabra`, `test:frases`, `test:memoria`, `test:social`. Otros tests existentes se invocan directamente con Node. Leer sus requisitos antes de ejecutarlos; Playwright necesita navegador disponible. No asumir que todos los archivos tienen un script npm.

Para UI, verificar el modo afectado y el tamaño móvil; para funciones compartidas, cubrir los consumidores afectados. Para voz, compras y TV física, una prueba simulada no reemplaza el dispositivo real.

### Cómo actualizar el cerebro después de un cambio

1. Registrar el pedido y los archivos afectados.
2. Confirmar el comportamiento final en código y con la comprobación pertinente.
3. Actualizar la sección correspondiente; eliminar o marcar como histórico un hecho reemplazado.
4. Añadir fecha, referencia del cambio, decisión, motivo, validación y pendiente real.
5. No declarar resuelto un pendiente externo porque exista una función preparada.

Plantilla para futuras entradas:

```text
Fecha:
Pedido de Gonzalo:
Referencia/commit del cambio:
Archivos y símbolos:
Comportamiento final:
Decisión y motivo:
Comprobación realizada y resultado:
Pendiente o limitación:
```

### Prompt para retomar con otro asistente

```text
Trabajá en gvelazcamp/gira-y-adivina-rioplatense.
Leé CEREBRO_DEL_PROYECTO.md y las instrucciones aplicables.
Después abrí el código actual del área que voy a pedir.
Confirmá las diferencias respecto de la referencia documentada.
No romper lo que funciona. Solo agregar lo pedido.
No elimines código ni implementes ideas pendientes sin autorización.
Actualizá esta memoria con los cambios confirmados y sus pruebas.
Mi pedido es: [describir el cambio].
```

## Registro de esta revisión

- Inventario completo del árbol Git, sin truncamiento: 967 entradas entre archivos y directorios.
- Se obtuvieron 94 archivos propios de código, configuración, documentación y pruebas para inspección textual y búsqueda de relaciones. Las bibliotecas vendorizadas, diccionarios extensos, binarios y ZIP se inventariaron; no se revisaron visualmente todas las imágenes ni se escucharon todos los audios.
- Revisión dirigida de arquitectura, catálogo, dependencias, persistencia, Billing, mapas, salas, caché y documentación. No es una auditoría exhaustiva de errores línea por línea ni una prueba integral de todas las partidas.
- Se ejecutó `node tests/auditar-palabras.cjs`: código de salida 0, cero errores; avisos permitidos de coincidencias en Cien, Canta, Palabra y Rueda.
- No se ejecutaron pruebas de navegador, compras reales, voz en redes difíciles ni TV física: el cambio entregado es documental.
- Este trabajo agrega únicamente `CEREBRO_DEL_PROYECTO.md` al repositorio.

## Anexo: inventario para localizar fuentes

### Archivos propios inspeccionados textualmente

- `.well-known/assetlinks.json`
- `AUDITORIA_PALABRAS.md`
- `CLAUDE.md`
- `CONTRA_RELOJ_VOZ_PENDIENTE.md`
- `IDEAS.md`
- `Moon_tap.html`
- `PLAY_BILLING_SETUP.md`
- `SALA_TV_PRUEBA.md`
- `THIRD_PARTY_NOTICES.md`
- `ahorcado-rioplatense-datos.js`
- `ahorcado-rioplatense.html`
- `ahorcado-rioplatense.js`
- `assets/collectibles/PROMPT-argentina.md`
- `assets/passport/PROMPT-argentina.md`
- `assets/passport/PROMPT.md`
- `assets/punteros/PROMPT.md`
- `assets/ruedas/PROMPT.md`
- `assets/tableros/PROMPT.md`
- `assets/worlds/PROMPT.md`
- `assets/worlds/index.html`
- `bomba.js`
- `canta-la-cancion-datos.js`
- `canta-la-cancion.js`
- `cien-rioplatenses-datos.js`
- `cien-rioplatenses-dicen.html`
- `cien-rioplatenses.js`
- `contra-reloj-rioplatense-datos.js`
- `contra-reloj-rioplatense-online.js`
- `contra-reloj-rioplatense-voz.js`
- `contra-reloj-rioplatense.js`
- `duelo-extensiones.js`
- `extension-ahorcado-rioplatense.md`
- `extension-cien-rioplatenses-dicen.md`
- `extension-palabra-secreta.md`
- `extension-rosco-rioplatense.md`
- `extension-rueda-de-letras.md`
- `extension-sopa-fugaz.md`
- `extensiones.css`
- `extensiones.js`
- `frases-en-giro-datos.js`
- `frases-en-giro.js`
- `impostor-datos.js`
- `impostor.js`
- `index.html`
- `mahjong-rioplatense.html`
- `mahjong-rioplatense.md`
- `manifest.json`
- `memoria-en-giro.js`
- `mimica-datos.js`
- `mimica.js`
- `moon-tap.js`
- `package.json`
- `palabra-secreta-datos.js`
- `palabra-secreta.html`
- `palabra-secreta.js`
- `pantalla-fija.js`
- `privacidad.html`
- `que-numero-soy.js`
- `quien-soy-datos.js`
- `quien-soy.js`
- `rosco-rioplatense-datos.js`
- `rosco-rioplatense.html`
- `rosco-rioplatense.js`
- `rueda-de-letras-datos.js`
- `rueda-de-letras-diccionario.js`
- `rueda-de-letras.html`
- `rueda-de-letras.js`
- `sala-tv.css`
- `sala-tv.js`
- `silabario-rioplatense-datos.js`
- `silabario-rioplatense.js`
- `sopa-fugaz-datos.js`
- `sopa-fugaz.html`
- `sopa-fugaz.js`
- `sw.js`
- `test-lodo.html`
- `tests/auditar-palabras.cjs`
- `tests/background.cjs`
- `tests/cien-rioplatenses.cjs`
- `tests/emergency-shields.cjs`
- `tests/frases-en-giro.cjs`
- `tests/memoria-en-giro.cjs`
- `tests/mobile-ui.cjs`
- `tests/palabra-secreta.cjs`
- `tests/rosco-rioplatense.cjs`
- `tests/rueda-de-letras.cjs`
- `tests/sala-tv.cjs`
- `tests/social-city.cjs`
- `tests/sopa-fugaz.cjs`
- `tests/vale-gift.cjs`
- `tutti-frutti-datos.js`
- `tutti-frutti.js`
- `tv.html`
- `ui-icons.js`

### Recursos y archivos por grupo del árbol

Cantidades de archivos, sin contar directorios. Inventario de presencia, no verificación de cada contenido multimedia.

| Grupo | Archivos |
|---|---:|
| `.well-known` | 1 |
| `assets/audio` | 18 |
| `assets/avatars` | 53 |
| `assets/collectibles` | 197 |
| `assets/compartir` | 6 |
| `assets/decor` | 5 |
| `assets/diccionario` | 25 |
| `assets/eventos` | 4 |
| `assets/expansion` | 6 |
| `assets/extensiones` | 4 |
| `assets/festejos` | 40 |
| `assets/fichas` | 29 |
| `assets/frames` | 10 |
| `assets/logo.webp` | 1 |
| `assets/passport` | 214 |
| `assets/powers` | 7 |
| `assets/punteros` | 9 |
| `assets/ruedas` | 25 |
| `assets/salatv-arranca-jugador.webp` | 1 |
| `assets/salatv-bienvenida.webp` | 1 |
| `assets/salatv-resultados-costura-1.webp` | 1 |
| `assets/salatv-resultados-costura-2.webp` | 1 |
| `assets/salatv-resultados-costura-3.webp` | 1 |
| `assets/salatv-resultados-fondo.webp` | 1 |
| `assets/salatv-ruleta-marco.webp` | 1 |
| `assets/salatv-sorteo.webp` | 1 |
| `assets/shop` | 15 |
| `assets/social` | 8 |
| `assets/splash-tv.webp` | 1 |
| `assets/splash.webp` | 1 |
| `assets/tableros` | 35 |
| `assets/tutorial` | 1 |
| `assets/ui` | 2 |
| `assets/worlds` | 58 |
| `lib` | 2 |
| `raíz` | 105 |
| `store-screenshots` | 5 |
| `tests` | 14 |


## Registro de cambios

```text
Fecha: 04-05/10/2026 (sesión Claude Code, PRs #825–#843)
Pedido de Gonzalo: mejorar juegos de previa.
Cambios confirmados (mergeados en main):
- Mímica (#825–#827): diseño de teatro, equipos con color, metas 10/20/30, dificultades Fácil/Media/Difícil
  (MIMICA_FRASES / MIMICA_MEDIA / MIMICA_DIFICIL en mimica-datos.js) elegidas en el menú; frases al azar.
  Difícil = cosas concretas que se adivinan pero cuesta actuar (Gonzalo rechazó situaciones largas/abstractas).
- Canta la Canción (#828–#836): se canta hasta el final o "Terminé"; jurado vota 👍/👎 (mayoría, empate vale);
  se graba el canto para "Escuchar de nuevo". Se probó voz a texto (SpeechRecognition y Whisper en el
  navegador) y se descartó: en Android grabación y reconocimiento no comparten el micrófono y Whisper tiny
  entendía mal el canto. Decisión de Gonzalo: solo audio.
- Tutti Frutti: partida termina en la 3ª ronda sin "ronda más" (#837); música assets/audio/tutti-frutti-musica.mp3
  (Denis Pavlov Music, Pixabay) mientras se escribe (#840); Wikipedia con control de tipo para marca, famoso,
  película, animal, comida, color y profesión + apellidos raros (#841); objeción: el autor elige "Sí, no vale" o
  "No, la defiendo" (defendida necesita mayoría de TODOS para anularse; botón "👍 Acepto") (#842);
  chat de la sala fuera de la ronda (#843).
- ¿Quién soy? (#838–#839): 1 toque = acerté, 2 toques = paso; tiempos 30/40/50 s.
Comprobación: Playwright con MQTT/micrófono/Wikipedia simulados; auditor de palabras 0 errores.
Pendiente o limitación: validación de Wikipedia no probada contra la Wikipedia real (sin acceso desde el entorno).
```

```text
Guardado sin publicar (Gonzalo: "dejalo guardado en git para después, no lo publiques")
Rama: claude/guardado-cadena-trabalenguas
Contenido: dos juegos de previa terminados — Memoria en cadena (memoria-cadena.js) y Trabalenguas contra reloj
(trabalenguas.js + trabalenguas-datos.js, con grabación y jurado). Memoria en cadena probado; Trabalenguas sin probar.
Publicar solo si Gonzalo lo pide.
```

```text
Aprendizajes de trabajo
- Los scripts de Playwright deben guardar capturas con ruta absoluta en el scratchpad: con ruta relativa
  quedaban en la raíz del repo y se colaron en commits (se borraron en #836 y #840).
- Gonzalo no quiere insignias "Nuevo" en el lobby.
- Juegos de un solo celular: sin sonido al pasar; sonido de error (sonidoErrorExt) solo cuando hace falta.
```

```text
Fecha: 07/10/2026
Pedido de Gonzalo: archivo para la API key de Ideogram (generar imágenes desde Python en su PC).
Archivos: .env.example (plantilla sin key) y .gitignore (agrega .env).
Decisión: la key real va solo en ".env" en la PC de Gonzalo; nunca en el repo ni en el juego (GitHub Pages es público).
```

```text
Fecha: 07/10/2026
Pedido de Gonzalo: completar las colecciones de Argentina que faltaban, mismo sistema que Uruguay (4 por ciudad).
Cambios: 11 colecciones nuevas en COLECCIONES (la-plata, rosario, jujuy, ushuaia, puerto-madryn, villa-carlos-paz,
posadas, santa-fe, purmamarca, san-miguel-de-tucuman, corrientes). Temas = los 4 sellos del pasaporte de cada ciudad
(como Buenos Aires). Imágenes generadas con la API de Ideogram v3 (generate-transparent, QUALITY, prompt de
assets/collectibles/PROMPT-argentina.md + 3 coleccionables existentes como style_reference), recortadas a 700x700 webp.
Gonzalo aprobó el estilo ("seguí así"), aunque es más limpio que el de ChatGPT.
Ideogram: key como "secreto de red" del entorno (header Api-Key para api.ideogram.ai) y dominio ideogram.ai permitido
para bajar las imágenes. Nunca en el repo.
Actualización (mismo día, +3 USD de saldo, modo DEFAULT ≈ 6 centavos por imagen; QUALITY ≈ 9-10 centavos):
se completaron Puerto Iguazú, Gualeguaychú y San Martín de los Andes (14 colecciones de Argentina nuevas en total,
todas las ciudades del mapa argentino tienen colección); se rehicieron rosario/parana, rosario/puente,
puerto-madryn/muelle y ushuaia/tren (nevado, Gonzalo lo aprobó aunque la base no es dorada).
Limitación: varias tienen letras inventadas grabadas en el borde dorado; el muelle de Madryn sigue con un pie raro.
Avisar el costo a Gonzalo antes de generar en lote.
```

```text
Fecha: 07/10/2026
Pedido de Gonzalo: Tutti Frutti "Jugar online" contra bots, como el Jugar online de la rueda.
Cambios: botón "🌐 Jugar online" en tutti-frutti.js. Simula una sala sin red (on.bots=true, on.cli=null):
matchmaking falso con NOMBRES_ONLINE/AVATARES_* de index.html, 2 o 3 bots con habilidad (completa cada
categoría con prob .75-.97) y velocidad (cuándo canta BASTA). Palabras: TUTTI_LISTAS y TUTTI_BOTS (nuevo, en
tutti-frutti-datos.js: famoso, marca, película, cosa). Al cortar, cada bot entrega lo que llegó a escribir;
6% de error de tipeo. Contra bots alcanza el voto del jugador para anular (necesarios()=1); chat oculto.
Comprobación: Playwright, 3 rondas + final, BASTA de un bot y corte por tiempo, sin errores.
```

```text
Fecha: 07/10/2026 — Tutti Frutti online: popup con 3 tipos de rivales (MODOS_BOT): Normal 8-12 s por
categoría, Difícil 5-7 s, Persona mayor 15-25 s (nombres de BOT_MAYORES). +40% en categorías difíciles
(Famoso, Marca, Película, Cosa, Profesión) y letras U/I/J/V. Cada bot escribe categoría por categoría; al cortar
entrega solo las que terminó. Error de tipeo 5% y solo en palabras de más de 6 letras.
```

```text
Fecha: 07/10/2026 — Tutti Frutti: "ver error" sugería cualquier cosa en Marca/Famoso/Película (tomaba el primer
resultado de Wikipedia: Rebook → "Somos calentura"). Ahora sugiere de listas propias (TUTTI_MARCAS nuevo, ~170
marcas, y TUTTI_BOTS) y de Wikipedia solo si el título se parece de verdad (misma distancia fonética que el resto).
TUTTI_MARCAS también acepta directo en Marca.
```

```text
Fecha: 08/10/2026 — Tutti Frutti, correcciones por partida real: (1) el cartel amarillo (mostrarToast) con texto
largo quedaba asomado arriba para siempre (top:-120px fijo); ahora se esconde con translate(-50%,-100% - 50px).
(2) ⚠️ salvada con ✔ se ve en verde "salvada con ✔" (clase tf-salvada; antes seguía ⚠️ aunque sumaba).
(3) +~235 marcas en TUTTI_MARCAS (Panavox, Enxuta, OCA, Columbia, supermercados, bancos, bebidas uruguayas…).
(4) Película/Famoso: plurales sueltos no hacen perder ("Domingos en familia"); nombre y apellido con página de
desambiguación de personas vale ("Carlos Núñez"). (5) "ver error" ya no sugiere algo de otra categoría
(todo terreno → Todoterreno era un auto). Wikipedia no se pudo probar desde la nube (bloqueada).
```

```text
Fecha: 08/10/2026 — Tutti Frutti: las ✓/⚠️ las calcula el anfitrión; si su celular tenía la versión vieja,
marcas uruguayas nuevas (Enxuta, Columbia, Sisi) salían ⚠️ igual. Ahora cada celular, al recibir el resultado,
pasa a ✓ lo que está en sus listas propias (reforzarMarcas/enListaPropia). +~90 marcas uruguayas más.
```

```text
Fecha: 08/10/2026 — Tutti Frutti: TUTTI_PELICULAS nuevo (~250 películas/series, incluye ET, rioplatenses) que vale
directo en "Película o serie" y se usa para sugerir. OCA e Indian ya valen como Marca (desde #853).
```

```text
Fecha: 08/10/2026 — Tutti Frutti: Wikipedia se buscaba con la palabra sin ñ ni tildes ("carlos nunez") y el
buscador no encontraba "Carlos Núñez". Ahora busca con lo escrito tal cual (q en enWikiTipo/enWikipedia/
apellidoEnWiki). TUTTI_FAMOSOS nuevo (~300, muchos uruguayos; vale también el apellido solo) acepta directo.
```

```text
Fecha: 08/10/2026 — Tutti Frutti: iPlace agregada a TUTTI_MARCAS.
```

```text
Fecha: 08/10/2026 — Tutti Frutti: ~100 marcas más sacadas del listado de empresas uruguayas (MEF, SGA 2024) que pasó Gonzalo (Acodike, Mosca, Cementos Artigas, Fanapel, Geocom, Perceli, Sadia, Saceem…).
```

```text
Fecha: 08/10/2026 — Tutti Frutti: +169 jugadores de la selección uruguaya en TUTTI_FAMOSOS (lista que pasó Gonzalo, por partidos jugados).
```

```text
Fecha: 08/10/2026 — Tutti Frutti, Famoso: se probó exigir nombre y apellido para apellidos comunes (#860/#861) y Gonzalo pidió volver atrás: cualquier apellido de un famoso vale solo (González, Rodríguez…). (Corrección: era un malentendido, quedó como en #861).
```

```text
Fecha: 08/10/2026 — Tutti Frutti, regla FINAL confirmada por Gonzalo: en Famoso los apellidos comunes (COMUNES) van con nombre y apellido ("González" solo no, "Brian Rodríguez" sí); Suárez solo vale (Luis Suárez); apellidos raros solos valen (Cavani). En la categoría Apellido valen todos.
```

```text
Fecha: 08/10/2026 — Tutti Frutti con bots: Difícil era lento (con letra difícil cantaban BASTA a los ~64 s y una persona rápida les ganaba sola). Ahora Difícil 3-4,5 s por categoría, Normal 6-9 s, extra por categoría/letra difícil 25% (antes 40%): BASTA ~25-35 s. Los bots responden Famoso/Marca/Película también desde TUTTI_FAMOSOS/MARCAS/PELICULAS (más variedad).
```

```text
Fecha: 08/10/2026 — Tutti Frutti: sumador de puntos en las ⚠️ dudosas (− 0 +, de 5 en 5 hasta 20) en lugar del ✔. Lo usan los demás jugadores (contra bots, vos en todas, incluida la tuya). Mensaje {t:"extra"}; on.extra[a|i] pisa los puntos de esa casilla y la pinta en verde "vale". Pedido de Gonzalo "hasta que solucionemos todas las palabras".
```

```text
Fecha: 08/10/2026 — Tutti Frutti: historial de palabras en amarillo. El anfitrión anota cada ⚠️ de jugadores (no bots) en Supabase gya_ranking grupo "tutti_dudas" (apodo "Categoría|palabra", estado_juego {cat,palabra,veces,jugador,ultima}). Gonzalo lo ve en Más → Pruebas → "Tutti Frutti · palabras en amarillo" (TuttiFrutti.verDudas) con botón Copiar lista. Probado con Supabase simulado; falta confirmar con el real.
```

```text
Fecha: 08/10/2026 — Tutti Frutti: +310 animales en TUTTI_LISTAS.animal (ahora ~560). La página a-z-animals.com que pasó Gonzalo no se pudo abrir desde la nube y está en inglés: se armó la lista en español.
```

```text
Fecha: 08/10/2026 — Tutti Frutti: los 194 países que pasó Gonzalo + nombres comunes (Holanda, Inglaterra, Sudáfrica, Qatar, Myanmar…) en lugar (+62 nuevos). +99 colores (Wikipedia "Anexo:Colores" no se pudo abrir desde la nube; se cargaron de memoria). Colores ~220.
```

```text
Fecha: 08/10/2026 — Tutti Frutti: una ⚠️ con puntos del sumador (extra>0) cuenta como respondida para los demás en puntosRonda (antes el rival seguía con 20 "único"). Palabras del historial aprobadas por Gonzalo: Jaguar, Sussex (servilletas), Nappo (electrodomésticos UY), isla de las tentaciones, inspector de tránsito. Propuesto y no confirmado: ignorar letra suelta al final ("Indian a").
```

```text
Fecha: 09/10/2026 — Tutti Frutti: categorías elegidas en verde con ✓ y las no elegidas apagadas (punteadas). Antes era al revés (amarillo = elegida, verde = no) y confundía.
```

```text
Fecha: 09/10/2026 — Tutti Frutti: NORM ignora apóstrofos ("Greys Anatomy" = "Grey's Anatomy"). Agregadas: Trapiche, H y M/HyM (marcas), Grey's Anatomy / Anatomía de Grey (series).
```

```text
Fecha: 09/10/2026 — Tutti Frutti: +252 famosos (actores 1-250 de la lista IMDb que pasó Gonzalo, quedan 251-1000) y +220 películas/series (las de esos actores, títulos en español).
```

```text
Fecha: 09/10/2026 — Tutti Frutti: +252 famosos (IMDb 251-500) y +222 películas/series. Quedan IMDb 501-1000.
```
