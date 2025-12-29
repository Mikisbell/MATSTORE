# Plan de Implementación: Fase 1.1 - Supabase Schema (Offline-Ready)

## Objetivo
Crear el esquema de base de datos inicial en Supabase para soportar la arquitectura "Local-First" de MatStore. Específicamente diseñado para sincronización con RxDB.

## User Review Required
> [!IMPORTANT]
> **Cambio Crítico: Soft Deletes**
> Se agrega la columna `deleted` (boolean) y `updated_at` (trigger) en todas las tablas sincronizables. Esto es obligatorio para que los clientes offline detecten eliminaciones.

> [!NOTE]
> **Global Catalog:**
> Se incluye la tabla `global_catalog` para el onboarding rápido (Crowdsourcing), según feedback del usuario.

## Proposed Changes

### Database (SQL)

#### [NEW] [20260101000000_initial_schema.sql](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/supabase/migrations/20260101000000_initial_schema.sql)
#### [NEW] [schema.ts](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/lib/db/schema.ts)
#### [NEW] [index.ts](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/lib/db/index.ts)

### Phase 2: POS User Interface

### POS Layout & Shell (Task 2.1)
Implementation of the main 3-column grid structure (Header/Search, Product Grid, Ticket Sidebar).

#### [NEW] [layout.tsx](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/app/pos/layout.tsx)
- Isolated layout with no hydration issues.
- `h-screen`, `w-screen`, `overflow-hidden`.

#### [NEW] [page.tsx](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/app/pos/page.tsx)
- Main container using CPU-friendly CSS Grid.
- Columns: `1fr 400px` (Product Grid | Ticket).
- Rows: `64px 1fr` (Header | Content).

#### [NEW] [TopBar.tsx](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/components/pos/TopBar.tsx)
- Search Bar placeholder.
- User/Store indicator.

#### [NEW] [ProductGrid.tsx](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/components/pos/ProductGrid.tsx)
- CSS Grid for product cards.
- Virtual Scroll preparation (future).

#### [NEW] [TicketSidebar.tsx](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/components/pos/TicketSidebar.tsx)
- Flex column for cart items.
- Summary footer.

### OmniSearch & Hardware Integration (Task 2.2)
Search component that handles both manual typing and HID Barcode Scanner input.

#### [NEW] [useBarcodeScanner.ts](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/hooks/useBarcodeScanner.ts)
- Listens for global `keydown`.
- Buffers characters within a threshold (e.g., 30ms).
- Detects 'Enter' (standard scanner suffix) to emit scan event.
- Prevents default behavior if scan is detected.

#### [NEW] [OmniSearch.tsx](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/components/pos/OmniSearch.tsx)
- Input field with `ref`.
- Integration with `useBarcodeScanner`.
- RxDB Query:
    - If Scan: `findOne().where('barcode').eq(scan)`
    - If Text: `find().where('name').regex(input)`
- Props: `onProductSelect`, `onFilterChange`.

#### [MODIFY] [TopBar.tsx](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/components/pos/TopBar.tsx)
- Replace static placeholder with `OmniSearch`.

#### [MODIFY] [TopBar.tsx](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/components/pos/TopBar.tsx)
- Replace static placeholder with `OmniSearch`.

### Cart Logic & State Management (Task 2.3)
Implementation of the client-side shopping cart using Zustand.

#### [NEW] [cartStore.ts](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/store/cartStore.ts)
- **State**: `items[]` (id, name, price, quantity, tax).
- **Actions**:
    - `addItem(product)`: Upsert logic (increment if exists).
    - `removeItem(id)`: Remove from array.
    - `updateQuantity(id, delta)`: Increment/Decrement/Remove if 0.
    - `clear()`: Reset.
- **Derived State**: Return `summary` object (subtotal, tax, total) calculated on the fly or via selector.

#### [MODIFY] [TicketSidebar.tsx](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/components/pos/TicketSidebar.tsx)
- Subscribe to `useCartStore`.
- Render `items` list dynamically.
- Render `totals` from store.

#### [MODIFY] [ProductGrid.tsx](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/components/pos/ProductGrid.tsx)
- Add onClick handler to cards -> `addItem`.

#### [MODIFY] [OmniSearch.tsx](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/components/pos/OmniSearch.tsx)
- On Scan/Select -> `addItem`.

### Sales Persistence (Task 2.4)
Saving the completed sale to the local Offline-First database.

#### [MODIFY] [cartStore.ts](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/store/cartStore.ts)
- Add `checkout` async action.
- Import `getDB` from `@/lib/db`.
- **Logic**:
    1. Validate `items.length > 0`.
    2. Generate UUIDs (Sale + Items).
    3. `db.sales.insert(...)` && `db.sale_items.bulkInsert(...)`.
    4. `clearCart()`.
    5. Return success/error.

#### [MODIFY] [TicketSidebar.tsx](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/components/pos/TicketSidebar.tsx)
- Call `checkout` on button click.
- Show `isProcessing` state.
- Handle Success/Error toasts (or basic alerts for now).

### Data Sync Engine (Task 1.4)
Implementation of the replication layer between Supabase and RxDB.

#### [NEW] [supabase.ts](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/lib/supabase.ts)
- Initialize Supabase client for replication use.

#### [NEW] [replication.ts](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/lib/db/replication.ts)
- `replicateFromSupabase`: Generic function to handle Pull/Push replication.
- Uses `updated_at` as checkpoint.
- Handles `deleted` flag for soft deletes.

#### [MODIFY] [index.ts](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/src/lib/db/index.ts)
- Integrate replication startup in `createDB`.

### Auth & RLS (Task 1.5)
Securing the application with robust Row Level Security policies.

#### [MODIFY] [20260101000000_initial_schema.sql](file:///mnt/e/FREECLOUD/FREECLOUD-IA/PROYECTOS/MATSTORE/supabase/migrations/20260101000000_initial_schema.sql)
- Replace MVP Policies with Production RLS.
- Enforce Tenant Isolation: `auth.uid() IN (SELECT user_id FROM tenants_users ...)`
- Add `tenants_users` junction table if missing or use `users.tenant_id`.
Schema Offline-Ready con Soft Deletes y RLS permisivo (MVP).

**Tablas Sincronizables (con `deleted` + `updated_at`):**
1.  **Estructurales:**
    -   `tenants`
    -   `stores`
    -   `users` (Profile)
    -   `clients`

2.  **Catálogo:**
    -   `categories`
    -   `products`
    -   `variants` (Polimórfico)
    -   `global_catalog` (Solo lectura para tenants)

3.  **Transaccionales:**
    -   `sales`
    -   `sale_items`
    -   `credit_ledger`
    -   `inventory_batches`

**Triggers:**
-   `handle_updated_at`: Actualiza automáticamente el timestamp `updated_at` en cada cambio.

## Verification Plan

### Manual Verification
1.  **Ejecución en Supabase:** Copiar/Pegar el script en el SQL Editor del usuario.
2.  **Verificación de Columnas:** Confirmar que `deleted` existe en todas las tablas clave.
