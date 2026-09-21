# Configurar cobros reales en Play Console

Checklist para dejar listo Google Play Billing del lado de Play Console.
Esto lo hace Gonzalo (o la extensión de Claude en su navegador, con su
sesión ya logueada) — el código del juego (Claude Code) no tiene acceso
a esta cuenta y no puede hacer estos pasos.

Cuando esté todo tildado, avisar a Claude Code los **IDs de producto
finales usados** (si se cambió alguno de la tabla de abajo) para
conectar el código a estos productos reales.

## 1. Confirmar el perfil de pagos

- [ ] Entrar a [Play Console](https://play.google.com/console) → ☰ →
      **Configuración de la cuenta** → **Perfil de pagos**.
- [ ] Confirmar que el estado sea **Verificado** (no "Pendiente de
      revisión"). Si sigue pendiente, no hace falta esperar para el
      resto de los pasos — se puede seguir armando todo, pero las
      compras reales no van a funcionar hasta que Google lo apruebe.

## 2. Confirmar que la app existe en Play Console

- [ ] Buscar la app "Girá y Adiviná Rioplatense" (paquete
      `io.github.gvelazcamp.twa`) en el listado de apps.
- [ ] Confirmar que tenga **al menos una versión subida** a algún canal
      (Producción, Prueba cerrada o Prueba interna). Si nunca se subió
      nada, avisar — hace falta al menos una versión en algún canal
      para poder probar compras de verdad (Play Billing no funciona
      100% local).

## 3. Crear los 6 productos dentro de la app

Ir a la app → **Monetizar con Play** → **Productos** → **Productos
dentro de la app** → **Crear producto**.

⚠️ **El "ID de producto" es PERMANENTE** — una vez creado no se puede
cambiar ni reutilizar aunque se borre el producto. Copiar y pegar
exacto de esta tabla, sin espacios ni tildes:

| ID de producto (copiar tal cual) | Nombre | Descripción | Precio |
|---|---|---|---|
| `monedas_500` | 500 monedas | Paquete chico de monedas | $0.99 |
| `monedas_1350` | 1.350 monedas | 1.200 monedas + 150 de regalo | $1.99 |
| `monedas_3500` | 3.500 monedas | 3.000 monedas + 500 de regalo | $4.99 |
| `monedas_8500` | 8.500 monedas | 7.000 monedas + 1.500 de regalo | $9.99 |
| `vidas_llenas` | Vidas llenas al instante | Recargá tus 5 vidas ya | $0.99 |
| `vidas_infinitas_24h` | Vidas infinitas 24hs | Jugá sin límite de vidas por un día | $1.99 |

Para cada uno:
- [ ] `monedas_500` — creado y **Activado**
- [ ] `monedas_1350` — creado y **Activado**
- [ ] `monedas_3500` — creado y **Activado**
- [ ] `monedas_8500` — creado y **Activado**
- [ ] `vidas_llenas` — creado y **Activado**
- [ ] `vidas_infinitas_24h` — creado y **Activado**

No hay que elegir "consumible" en ningún lado de Play Console — eso lo
maneja el código del juego, no es una opción acá.

Si se usó un ID distinto al de la tabla para alguno, anotarlo:

```
(ejemplo) vidas_llenas → se creó como vida_recarga_instant
```

## 4. Agregar usuarios de prueba (para probar sin pagar de verdad)

Ir a la app → **Configuración** → **Prueba de licencias** (o **Setup**
→ **License testing** si está en inglés).

- [ ] Agregar el Gmail de Gonzalo a la lista de "Cuentas de prueba con
      licencia".
- [ ] Guardar.

Con esto, comprando desde esa cuenta de Google en el celular, Play
Billing simula la compra sin cobrar de verdad (aparece "Comprado
(prueba)").

## 5. Avisar cuando esté listo

Cuando los 6 productos estén creados y activados, y el usuario de
prueba agregado, avisar en el chat de Claude Code para conectar el
código del juego (Digital Goods API + Payment Request) a estos
productos reales y poder probar una compra de punta a punta.
