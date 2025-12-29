# EXPEDIENTE TÉCNICO: PROYECTO "MATSTORE"

## VOLUMEN I: MEMORIA DESCRIPTIVA Y ALCANCE

| Campo | Valor |
|-------|-------|
| **Versión** | 1.0 (Definitiva) |
| **Fecha** | Diciembre 2025 |
| **Clasificación** | Confidencial / Propiedad Intelectual |
| **Arquitectura** | SaaS Híbrido / Local-First |

---

## 1. Introducción y Propósito

El propósito de este documento es definir la arquitectura técnica, funcional y operativa para "MatStore", una plataforma SaaS de gestión minorista diseñada para el mercado latinoamericano (específicamente Perú).

El sistema aborda tres problemas críticos no resueltos por la competencia actual:

1. **Gestión Híbrida**: La incapacidad de gestionar eficientemente inventarios de naturaleza opuesta (Perecederos/Granel vs. Duraderos/Unitarios) en una misma interfaz.

2. **Fricción Operativa**: La complejidad de software contable tradicional que intimida al usuario promedio.

3. **Realidad Informal**: La falta de soporte para procesos críticos del comercio real: fiado, regateo, micro-créditos y pagos digitales informales (Yape/Plin).

---

## 2. Los 3 Pilares de Resiliencia (Filosofía de Diseño)

Todo el desarrollo debe someterse a estas tres leyes inquebrantables:

### 2.1. Resiliencia Cognitiva (La Ley del Niño de 10 Años)

- **Principio**: La carga cognitiva del usuario debe reducirse al mínimo absoluto.
- **Métrica**: Si una operación de venta requiere más de 3 toques o más de 5 segundos de decisión, el diseño debe descartarse.
- **Aplicación**: Uso de la Ley de Hick para interfaces de decisión y reconocimiento de patrones visuales sobre lectura de texto.

### 2.2. Resiliencia Técnica (Offline-First)

- **Principio**: La conectividad a internet es un lujo, no un requisito operativo crítico.
- **Métrica**: El 100% de las funciones de venta, inventario y cierre de caja deben funcionar con latencia < 50ms estando desconectado.
- **Aplicación**: Arquitectura de "Sincronización Eventual". La PC local es la autoridad inmediata; la nube es el respaldo.

### 2.3. Resiliencia de Contexto (Formalización de lo Informal)

- **Principio**: El software se adapta al negocio, no al revés.
- **Aplicación**: Integración nativa de deudas informales ("Fiado"), validación de billeteras digitales y manejo de unidades fraccionarias (venta de 1/4 de aceite, 100g de queso).

---

## 3. Alcance del Proyecto (Scope)

### 3.1. INCLUIDO (Fase 1 - MVP Comercial)

- **Punto de Venta (POS)**: Interfaz táctil de alta velocidad, integración con balanzas y lectores de código.
- **Gestión de Inventario Híbrido**: Lotes, fechas de vencimiento, mermas y conversión de unidades.
- **Onboarding "Zero-Friction"**: Carga automática de productos vía Catálogo Global Comunitario.
- **Módulo de Crédito**: Gestión de cuentas corrientes de clientes (Fiado).
- **Facturación Electrónica**: Emisión asíncrona (Background) con conexión a OSE/SUNAT.
- **Automatización**: Envío de comprobantes y estados de cuenta por WhatsApp (n8n).

### 3.2. EXCLUIDO (Fase 1)

- E-commerce / Tienda Online para el cliente final (B2C).
- Módulo de Planillas/RRHH complejo (solo control de asistencia básico).
- Contabilidad financiera profunda (Libros contables oficiales). El sistema exporta datos para el contador, pero no reemplaza al software contable.

---

## 4. Modelo de Negocio Soportado

| Aspecto | Detalle |
|---------|---------|
| **Target** | Bodegas, Minimarkets, Ferreterías, Veterinarias y Librerías |
| **Monetización** | SaaS (Suscripción mensual) + Comisiones por servicios financieros agregados (futuro) |
