EXPEDIENTE TÉCNICO: PROYECTO "MATSTORE"

VOLUMEN IV: ESPECIFICACIONES TÉCNICAS Y DESPLIEGUE

1. Stack Tecnológico (The 2026 Retail Stack)

A. Frontend (Cliente POS)

Framework: Next.js 15 (App Router).

Empaquetado Desktop: Tauri v2 (Rust). Permite binarios ligeros (<10MB) y acceso nativo a puertos Serial/USB.

Estado & Persistencia: TanStack Query + RxDB (o PouchDB). Motor NoSQL local que sincroniza con CouchDB/Postgres.

Estilos: Tailwind CSS (Utilidad primero para rapidez).

B. Backend & Cloud

Base de Datos Maestra: Supabase (PostgreSQL).

Auth: Supabase Auth (Magic Links + PIN de acceso rápido para cajeros).

API Logic: Next.js Server Actions (para lógica transaccional segura) + Edge Functions.

Almacenamiento de Archivos: Supabase Storage (Fotos de productos).

C. Automatización & Integraciones

Orquestador: n8n (Self-Hosted en VPS Docker).

Funciones:

Generación de XML/UBL 2.1 (Facturación).

Envío de WhatsApp (vía API oficial o Waha).

Reportes de Cierre de Día por Email.

2. Infraestructura de Hardware (Requisitos Mínimos)

Para garantizar la experiencia fluida, el software requiere:

Cliente: PC/Laptop con 4GB RAM mínimo, o Tablet Android gama media.

Impresoras: Soporte nativo para protocolo ESC/POS (Epson TM series, Star Micronics, o genéricas Xprinter con driver USB raw).

Lectores: Cualquier lector HID (emulación teclado).

3. Estrategia CI/CD (Despliegue Continuo)

El mayor riesgo de aplicaciones de escritorio es la actualización.

Repositorio: GitHub.

Pipeline (GitHub Actions):

Push a rama main.

Ejecución de Tests Unitarios (Vitest).

Build de Next.js.

Build de Tauri (Windows .msi / Linux .deb).

Upload de binarios y firma digital.

Updater Server: El cliente Tauri consulta al inicio si hay nueva versión. Descarga diferencial y aplica parche al reiniciar.

4. Seguridad y Auditoría

RLS (Row Level Security): Configuración estricta en PostgreSQL.

auth.uid() == tenant_id: Un usuario solo ve datos de su tienda.

Logs Inmutables: La tabla audit_log es Append-Only (Solo inserción). Ni el administrador de la tienda puede borrar registros de acciones sospechosas.
