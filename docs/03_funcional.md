EXPEDIENTE TÉCNICO: PROYECTO "MATSTORE"

VOLUMEN III: PLANO DE INSTALACIONES - REQUERIMIENTOS FUNCIONALES

MÓDULO 1: PUNTO DE VENTA (POS) - "SPEED & FLOW"

RF-1.1: Búsqueda Unificada (OmniSearch)

Descripción: Una única barra de entrada que acepta:

Input de Pistola de Código de Barras (detecta terminador CR/LF).

Input de Texto (Búsqueda difusa/fuzzy: "leche glor" -> "Leche Gloria").

Input de Voz (Web Speech API): "Dos kilos de papa amarilla".

Comportamiento: Si hay una coincidencia única (ej. código de barras), se agrega al carrito inmediatamente sin preguntar. Si hay múltiples, muestra lista de selección navegable con flechas.

RF-1.2: Integración Directa de Balanza

Descripción: El sistema escucha el puerto Serial/USB.

Flujo:

Cajero selecciona producto "Tomate" (marcado como is_weighted).

Sistema muestra modal: "Esperando peso...".

Cajero pone producto en balanza.

Sistema lee el stream de datos, estabiliza la lectura y captura el peso automáticamente.

Calcula Precio = Peso * PrecioUnitario y agrega al carrito.

RF-1.3: Validación Automatizada de Pagos (Yape/Plin)

Componente: App Android "MatStore Companion" instalada en el celular del negocio.

Flujo:

En POS, Cajero selecciona "Pagar con Yape". Muestra QR en pantalla.

Cliente paga.

App Companion detecta notificación entrante ("Yape! recibiste...").

App Companion envía señal vía WebSocket a Supabase -> POS.

POS se pone verde: "PAGO CONFIRMADO" y cierra la venta solo.

MÓDULO 2: GESTIÓN DE INVENTARIO INTELIGENTE

RF-2.1: Onboarding con Catálogo Global

Descripción: Mecanismo para evitar el "estado vacío" inicial.

Flujo: Al instalar, el usuario no carga productos. Simplemente empieza a escanear. El sistema descarga la metadata del producto bajo demanda desde el servidor central (Global Catalog) y crea el registro local.

RF-2.2: Algoritmo de Rescate de Mermas (Newsstand Model)

Lógica:

Cada noche, el sistema revisa inventory_batches.

Identifica lotes que vencen en X días.

Calcula elasticidad precio (si bajo precio, ¿cuánto más vendo?).

Acción: Sugiere "Promoción Flash" en el POS o envía mensaje WhatsApp a clientes frecuentes: "Oferta: Yogurt a 50% por vencimiento próximo".

MÓDULO 3: GESTIÓN DE CRÉDITO ("FIADO")

RF-3.1: Perfilamiento de Riesgo

Permite asignar un credit_limit (Límite de Crédito) a cada cliente.

Semáforo en el POS:

Verde: Tiene saldo disponible.

Amarillo: Cerca del límite.

Rojo: Límite excedido (Requiere huella/clave de gerente para autorizar sobregiro).

RF-3.2: Cobranza por WhatsApp

Botón "Enviar Estado de Cuenta".

Genera un PDF simple con el detalle de consumos y un Link de Pago (opcional) o QR de Yape.

Se envía vía API de WhatsApp (n8n).

MÓDULO 4: FACTURACIÓN Y FISCALIDAD (PERÚ)

RF-4.1: Cola de Emisión Asíncrona

El POS nunca espera a la SUNAT.

El POS genera el XML, lo firma (si el certificado está local) o lo envía a n8n para firma.

Si n8n/SUNAT no responde en 3 segundos, el ticket se imprime como "Comprobante Provisional / Nota de Venta" (Configurable).

El sistema reintenta el envío fiscal en background hasta obtener el CDR (Constancia de Recepción).

RF-4.2: Contingencia Offline

Capacidad de emitir series de contingencia o guardar la venta para numeración posterior cuando regrese la red.
