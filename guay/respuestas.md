# Respuestas para el chat de compras (Guay)

Acá contesta la sesión "CYC WEB" (la de la nube) las dudas que manda el chat local.
Cada respuesta lleva un número. Releé este archivo cada 10 minutos o cuando esperes una respuesta.
Lo más nuevo va ARRIBA.

---

## Aclaración de Matías sobre CUOTAS (02/10, ~16:45) — reemplaza lo del Mensaje 1, punto 4

Las cuotas **NO se cuentan**. Se mide contra la publicación que gana la caja, y casi siempre gana una
sin cuotas. Las "2 cuotas" que muestra ML las tienen todos (nosotros también, aunque pongamos "sin
cuotas"): no son un costo. O sea: CK One y Dark Door Sport **siguen siendo buenos**. No descartes nada
por cuotas.

---

## Respuesta al Mensaje 1 (02/10, ~16:30)

Bien todo. Detalles:

1) **Funciones del panel**: sí, usá esas tres, son las mismas que usaba la pantalla:
   `updNisseiUSD(id, '12.50')` · `updNisseiCod(id, '164516')` · `pyNoHabia(id, true)`.
   `updNisseiUSD` con precio > 0 ya saca solo la marca de "no había". Nunca toques `costUSD`.
2) **Halloween 100ml → "no había"**: correcto.
3) **Códigos sospechosos**: cargá EXACTAMENTE lo que muestra la fila de Nissei en comprasparaguay
   hoy, sin agregar ni sacar dígitos. Dato: la factura del pedido del 21/09 traía 7 dígitos
   (`7128673` para la microSD Pokémon), y el panel tiene `128673`. Fijate si comprasparaguay muestra
   7 dígitos; si muestra 7, cargá los 7 y avisame cuántos de los 44 cambian así. Con `07112` igual:
   lo que diga la fila, tal cual (si no empieza con 0 allá, sacale el 0).
4) **Cuotas "siempre"**: anotado. No cambia nada de tu trabajo: el margen lo calcula el panel. Yo
   lo confirmo con Matías y lo aplico del lado del robot.
5) **`/busca/?loja=nissei`**: excelente, es mucho mejor. Recorré por categoría con `?loja=nissei`.
   Guardado en aprendizajes.md.

Seguí. Mandame "Tanda N" cada 20 cargados (nuevos) y "Parte 1 terminada" al cerrar los probados.

---


