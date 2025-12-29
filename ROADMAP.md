ROADMAP DE INGENIERÍA 2026: MATSTORE

Estado: En Progreso
Meta: MVP Local-First Funcional

═══════════════════════════════════════════════════════════════════════════════
FASE 0: FUNDACIONES (Cimientos)
═══════════════════════════════════════════════════════════════════════════════

[x] 0.1a. Verificación de Entorno: Confirmar Rust, Cargo y dependencias de sistema (GTK/WebKit).
    Pre-requisito: Ver docs/PREREQUISITES.md
    Verificación: cargo --version && pkg-config --libs webkit2gtk-4.0
    ✅ COMPLETADO: 2025-12-28 - Rust 1.92.0, WebKit2GTK instalados

[x] 0.1b. Inicialización Next.js: Crear estructura base con TypeScript y Tailwind.
    Pre-requisito: 0.1a completado ✅
    Comando: npx create-next-app@latest . --typescript --tailwind --app --src-dir
    ✅ COMPLETADO: 2025-12-28 - Next.js 16.1.1, React 19.2.3, Tailwind 4

[x] 0.1c. Inicialización Tauri: Instalar CLI y crear estructura src-tauri/.
    Pre-requisito: 0.1b completado ✅
    Comando: npm install @tauri-apps/cli && npx tauri init
    ✅ COMPLETADO: 2025-12-28 - Tauri v2 CLI, src-tauri/ creado

[x] 0.1d. Configuración SSG: Ajustar next.config.ts para output estático (Tauri-compatible).
    Pre-requisito: 0.1c completado ✅
    Archivo: next.config.ts con output: 'export'
    ✅ COMPLETADO: 2025-12-28 - SSG configurado, out/ generado

[x] 0.2. Configuración de Linter/Formatter: ESLint + Prettier con reglas estrictas.
    Pre-requisito: 0.1d completado ✅
    ✅ COMPLETADO: 2025-12-28 - ESLint strict (no-any, no-console), Prettier integrado

[x] 0.3. Sistema de Diseño Base: Configurar Tailwind con paleta "Industrial Dark".
    Pre-requisito: 0.2 completado ✅
    ✅ COMPLETADO: 2025-12-28 - Paleta OLED, fuentes personalizadas y componentes base.

═══════════════════════════════════════════════════════════════════════════════
FASE 1: MOTOR DE DATOS (Estructura)
═══════════════════════════════════════════════════════════════════════════════

[x] 1.1. Supabase Schema: Crear script SQL inicial para tablas products, variants, inventory.
    Pre-requisito: Fase 0 completada
    ✅ COMPLETADO: 2025-12-28 - Schema Offline-First (Soft Deletes, Global Catalog) creado.

[x] 1.2. Configuración RxDB: Instalar RxDB y configurar el cliente local en Next.js.
    ✅ COMPLETADO: 2025-12-28 - RxDB instalado, `src/lib/db/index.ts` creado con singleton.

[x] 1.3. Esquemas Locales: Definir esquemas JSON para RxDB que coincidan con Supabase.
    ✅ COMPLETADO: 2025-12-28 - 12 Schemas definidos con Tipado TS estricto en schema.ts.

[x] 1.4. Motor de Sincronización: Implementar plugin de replicación RxDB <-> Supabase.
    ✅ COMPLETADO: 2025-12-28 - Replicación PULL/PUSH implementada con checkpointing y manejo de 'deleted'.

═══════════════════════════════════════════════════════════════════════════════
FASE 2: MÓDULO POS (Instalaciones)
═══════════════════════════════════════════════════════════════════════════════

[x] 2.1. Layout Principal: Estructura de 3 columnas (Grid Productos, Buscador, Ticket).
    ✅ COMPLETADO: 2025-12-29 - Layout aislado (`/pos`), Grid responsive y Sidebar fijo creados.

[x] 2.2. Buscador OmniSearch: Componente que acepta texto y código de barras.
    ✅ COMPLETADO: 2025-12-29 - Hook `useBarcodeScanner` (HID) y componente `OmniSearch` integrados.

[x] 2.3. Lógica de Carrito: Store Zustand para items, totales e impuestos.
    ✅ COMPLETADO: 2025-12-29 - `cartStore.ts` con acciones (Upsert, Remove), totales calculados (IGV) y persistencia en UI.

[x] 2.4. Persistencia de Venta: Guardar en RxDB (offline) al cobrar.
    ✅ COMPLETADO: 2025-12-29 - Checkout guarda venta e items, decrementa inventario (Optimista) y vacía carrito. Sync Engine se encarga del resto.

═══════════════════════════════════════════════════════════════════════════════
FASE 3: FUNCIONALIDAD HÍBRIDA (Diferenciadores)
═══════════════════════════════════════════════════════════════════════════════

[ ] 3.1. Polimorfismo UI: Pedir peso si is_weighted = true.

[ ] 3.2. Módulo de Fiado: Botón checkout para asignar venta a cliente.

═══════════════════════════════════════════════════════════════════════════════
FASE 4: INTEGRACIÓN Y DESPLIEGUE
═══════════════════════════════════════════════════════════════════════════════

[ ] 4.1. CI/CD Pipeline: GitHub Actions para build de Tauri.

[ ] 4.2. Auditoría Final: Revisión de fugas de memoria y rendimiento.
