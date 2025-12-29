EXPEDIENTE TÉCNICO: PROYECTO "MATSTORE"

VOLUMEN II: PLANO ESTRUCTURAL - ARQUITECTURA DE DATOS

1. Estrategia de Persistencia "Local-First"

La arquitectura de datos no es cliente-servidor tradicional. Es un Sistema Distribuido.

Autoridad de Escritura: El cliente local (Tauri/Browser via IndexedDB).

Autoridad de Consistencia: La nube (Supabase PostgreSQL).

Protocolo de Sincronización:

Escritura: UI -> RxDB (Local). Éxito inmediato.

Replicación: RxDB -> Replication Stream -> Supabase.

Conflicto: Estrategia "Delta CRDT" para inventarios (sumar/restar valores en lugar de sobrescribir absolutos). Estrategia "Last-Write-Wins" para metadatos simples (nombres, descripciones).

2. Diagrama Entidad-Relación (ERD) - Núcleo

2.1. Gestión de Catálogo Polimórfico

Para soportar "Juguetes" y "Verduras" simultáneamente.

```sql
-- 1. TABLA MAESTRA DE DEFINICIONES (Global o Local)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id), -- Multi-tenant isolation
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    image_url TEXT,
    global_catalog_ref UUID, -- Link al catálogo maestro comunitario (Crowdsourcing)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VARIANTES (La unidad vendible real - SKU)
CREATE TABLE variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    sku TEXT, -- EAN-13 o generado internamente
    name TEXT, -- Ej: "Lata 400g", "Caja x 12", "A Granel"
    
    -- POLIMORFISMO DE INVENTARIO
    inventory_type TEXT CHECK (inventory_type IN ('discrete', 'continuous', 'service')),
    -- discrete: Juguetes (enteros)
    -- continuous: Verduras/Cables (decimales)
    -- service: Cortes de pelo/Recargas (sin stock)
    
    unit_measure TEXT DEFAULT 'NIU', -- NIU, KG, LTR, MT
    allow_decimal_sales BOOLEAN DEFAULT false, -- True para verduras
    
    base_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,4), -- Costo promedio ponderado
    
    low_stock_threshold DECIMAL(10,2) DEFAULT 5
);
```

2.2. Gestión de Inventario Real (Lotes y Caducidad)

```sql
CREATE TABLE inventory_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES variants(id),
    store_id UUID REFERENCES stores(id),
    
    batch_code TEXT, -- Lote proveedor
    expiration_date DATE, -- Crítico para perecederos
    
    quantity_on_hand DECIMAL(12,4) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Nota: El stock total visible es la SUMA(quantity_on_hand) agrupado por variant_id
```

2.3. Módulo Financiero y Créditos (Ledger Inmutable)

```sql
-- CABECERA DE VENTA
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id),
    client_id UUID REFERENCES clients(id), -- Null si es anónimo
    user_id UUID REFERENCES users(id), -- Cajero
    
    status TEXT CHECK (status IN ('completed', 'pending_sync', 'voided')),
    payment_method TEXT, -- cash, yape, plin, credit, mixed
    
    total_amount DECIMAL(10,2),
    tax_data JSONB, -- Snapshot de impuestos al momento de venta
    
    created_at TIMESTAMPTZ DEFAULT NOW(), -- Hora real de venta
    synced_at TIMESTAMPTZ -- Hora de llegada a la nube
);

-- LIBRO MAYOR DE CRÉDITOS (Audit Log)
CREATE TABLE credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    sale_id UUID REFERENCES sales(id), -- Null si es abono directo
    
    transaction_type TEXT CHECK (transaction_type IN ('debt_increase', 'payment', 'correction')),
    amount DECIMAL(10,2), -- Positivo (deuda sube) o Negativo (deuda baja)
    
    balance_snapshot DECIMAL(10,2), -- Saldo después de la operación (para validación rápida)
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. Integración con Catálogo Global (Crowdsourcing)

Tabla global_catalog_master: (Solo lectura para usuarios). Contiene millones de SKUs con datos limpios.

Lógica de Onboarding:

Usuario escanea SKU 7750000000000.

Busca en variants local. (Fallo).

Busca en global_catalog_master. (Éxito: "Leche Gloria Azul 400g").

Acción: Copia los datos del Master a las tablas products y variants del Tenant.

Usuario solo ingresa Precio Venta y Stock Inicial.
