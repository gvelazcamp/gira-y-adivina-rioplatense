# Contra Reloj — pendiente: voz online en redes difíciles (TURN)

Estado: **pendiente, a propósito**. Lo dejamos para cuando los jugadores lo
prueben y veamos si les pasa de verdad.

## El problema

En el modo **Online desde casa** la voz viaja directo de celular a celular
(WebRTC). Para encontrarse, los celulares usan servidores **STUN** gratuitos
de Google (ya configurados en `contra-reloj-rioplatense-voz.js`).

Eso alcanza en la mayoría de los wifis de casa, pero **puede fallar** cuando
alguno está en:

- datos móviles de algunas compañías (NAT de operador / CGNAT),
- wifis de oficina, facultad, hotel o redes con firewall,
- algunas VPN.

En esos casos el celular no logra la conexión directa y hace falta un
servidor intermedio que "rebote" el audio: un servidor **TURN**.

## Cómo darse cuenta de que es esto

- En el panel **🎧 SALA DE VOZ** el puntito de ese jugador no se pone verde.
- Aparece "Una conexión de voz falló. Reintentando…" y no se arregla con
  **RECONECTAR VOZ**.
- Típicamente: entre dos wifis de casa anda, pero falla cuando uno está con
  datos del celular o en la oficina.

La partida (tarjetas, dado, puntos) sigue funcionando igual porque viaja por
MQTT; lo único que falla es escucharse.

## La solución

Agregar un servidor **TURN**. El código ya tiene el punto de enganche:

```js
// contra-reloj-rioplatense-voz.js
function iceServers(){
  const extra=Array.isArray(window.GYA_TURN_SERVERS)?window.GYA_TURN_SERVERS:[];
  return[...ICE_BASE,...extra];
}
```

Si antes de crear/entrar a la sala existe `window.GYA_TURN_SERVERS`, se usa
automáticamente. Formato:

```js
window.GYA_TURN_SERVERS=[
  {urls:"turn:turn.ejemplo.com:3478",username:"…",credential:"…"},
  {urls:"turns:turn.ejemplo.com:5349",username:"…",credential:"…"}
];
```

### Importante: NO poner usuario/clave fijos en el juego

El juego es público (GitHub Pages): cualquiera puede ver el código. Si se
ponen credenciales TURN fijas, cualquiera las puede copiar y usar el
servidor (y nos cobran a nosotros). Lo correcto es pedir **credenciales
temporales** (duran unas horas) a un servicio nuestro.

### Pasos recomendados

1. **Crear cuenta en un proveedor TURN** (cualquiera sirve):
   - Cloudflare Realtime TURN (tiene capa gratuita generosa).
   - Metered.ca (plan gratis chico, fácil de probar).
   - Twilio Network Traversal (pago por uso).
2. **Crear una Supabase Edge Function** (ya usamos Supabase para el
   Ranking) que, con la clave secreta del proveedor guardada en los
   *secrets* de Supabase, pida credenciales temporales y las devuelva.
   La clave secreta queda solo en Supabase, nunca en el juego.
3. **En el juego**, al tocar CREAR SALA / UNIRME en Contra Reloj, llamar a
   esa función y guardar el resultado en `window.GYA_TURN_SERVERS`
   (con `try/catch`: si falla, se sigue con STUN como hoy).
4. Subir versión de `contra-reloj-rioplatense-online.js` y `CACHE_NAME`
   en `sw.js`.

### Costo aproximado

Solo se paga el audio que pasa por el TURN (las conexiones que funcionan
directo no lo usan). Audio de voz ≈ 30–50 kbps por persona: una partida de
4 personas de 30 minutos que use TURN completo ronda los 100–200 MB. Con la
capa gratuita de Cloudflare o Metered alcanza de sobra para probar.

## Cómo probarlo cuando esté hecho

- [ ] 4 jugadores: 2 en wifi de casa y 2 con **datos del celular** (sin wifi).
- [ ] Todos activan el micrófono y los 4 puntitos se ponen verdes.
- [ ] Se escuchan todos con todos durante una ronda completa.
- [ ] Probar desde un wifi de oficina o facultad si hay alguno a mano.
- [ ] Si la función de credenciales falla (sin internet, etc.), la voz sigue
      intentando con STUN y el juego no se traba.

## Otro pendiente relacionado: permiso de micrófono en la app Android

La app de Play Store (TWA, paquete `io.github.gvelazcamp.twa`) abre el juego
en Chrome. Si en algún celular el micrófono no funciona dentro de la app
(Árbitro o voz online) pero sí desde Chrome normal, revisar que el proyecto
Android declare el permiso `RECORD_AUDIO`
(`<uses-permission android:name="android.permission.RECORD_AUDIO"/>` en el
`AndroidManifest.xml`) y volver a generar el APK/AAB. El proyecto Android no
está en este repositorio, así que eso se hace donde se arma la app.
