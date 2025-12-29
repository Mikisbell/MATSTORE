/*
 * MATSTORE INITIAL SCHEMA (v1.0)
 * ==============================
 * Arquitectura Offline-First (RxDB <-> Supabase)
 * 
 * CARACTERÍSTICAS CRÍTICAS:
 * 1. Soft Deletes: Todos los registros tienen 'deleted' BOOLEAN para sincronización.
 * 2. Timestamps: 'updated_at' gestionado automáticamente por trigger.
 * 3. RLS: Habilitado pero permisivo (anon key) para MVP.
 * 4. Tipos: TEXT para IDs (UUIDs generados por cliente o servidor).
 */

-- ═══════════════════════════════════════════════════════════════════════════════
-- 0. CONFIGURACIÓN BASE & UTILIDADES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigger function para actualizar 'updated_at' automáticamente
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. ESTRUCTURA ORGANIZACIONAL (Tenants)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Empresas / Negocios
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    plan_type TEXT DEFAULT 'free',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

-- Sucursales
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    name TEXT NOT NULL,
    address TEXT,
    is_warehouse BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

-- Usuarios (Perfiles extendidos de auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id), -- Link directo a Supabase Auth
    tenant_id UUID REFERENCES tenants(id),
    store_id UUID REFERENCES stores(id), -- Tienda asignada por defecto
    full_name TEXT,
    role TEXT DEFAULT 'cashier', -- owner, manager, cashier
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

-- Clientes Finales
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    name TEXT NOT NULL,
    tax_id TEXT, -- DNI/RUC
    email TEXT,
    phone TEXT,
    credit_limit DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. CATÁLOGO GLOBAL Y LOCAL
-- ═══════════════════════════════════════════════════════════════════════════════

-- Catálogo Maestro Global (Crowdsourcing) - Solo Lectura para Tenants
CREATE TABLE global_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ean TEXT UNIQUE, -- Barcode
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category_name TEXT,
    brand TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

-- Categorías Locales
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    name TEXT NOT NULL,
    color TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

-- Productos (Definición abastracta)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    image_url TEXT,
    global_ref_id UUID REFERENCES global_catalog(id), -- Link al maestro
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

-- Variantes / SKUs (La unidad vendible real)
CREATE TABLE variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    tenant_id UUID REFERENCES tenants(id), -- Redundancia útil para RLS
    
    sku TEXT,
    barcode TEXT,
    name TEXT, -- "Caja x 12", "Unidad"
    
    -- Polimorfismo
    inventory_type TEXT CHECK (inventory_type IN ('discrete', 'continuous', 'service')),
    unit_measure TEXT DEFAULT 'NIU',
    allow_decimal_sales BOOLEAN DEFAULT false,
    
    -- Precios
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    cost DECIMAL(10,4) DEFAULT 0,
    is_taxed BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. INVENTARIO
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE inventory_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID REFERENCES variants(id),
    store_id UUID REFERENCES stores(id),
    tenant_id UUID REFERENCES tenants(id),
    
    batch_code TEXT,
    expiration_date DATE,
    quantity DECIMAL(12,4) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. VENTAS Y FINANZAS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    store_id UUID REFERENCES stores(id),
    client_id UUID REFERENCES clients(id),
    user_id UUID REFERENCES users(id),
    
    status TEXT CHECK (status IN ('completed', 'pending_sync', 'voided', 'draft')),
    payment_method TEXT,
    total DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    
    synced_at TIMESTAMPTZ, -- Confirmación de nube
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id),
    variant_id UUID REFERENCES variants(id),
    
    quantity DECIMAL(12,4) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

CREATE TABLE credit_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    client_id UUID REFERENCES clients(id),
    sale_id UUID REFERENCES sales(id),
    
    type TEXT CHECK (type IN ('charge', 'payment', 'adjustment')),
    amount DECIMAL(10,2) NOT NULL, -- + aumenta deuda, - reduce deuda
    balance_after DECIMAL(10,2),
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. SEGURIDAD (Row Level Security) - OPEN MVP
-- ═══════════════════════════════════════════════════════════════════════════════

-- Habilitar RLS en todas las tablas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

-- 6. HELPERS DE SEGURIDAD
-- ═══════════════════════════════════════════════════════════════════════════════

-- Función helper: ¿El usuario actual pertenece al tenant solicitado?
CREATE OR REPLACE FUNCTION auth.user_has_access_to_tenant(target_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- 1. Si es Super Admin (rol de servicio), permitir todo (opcional, pero útil para scripts)
  -- IF auth.jwt() ->> 'role' = 'service_role' THEN RETURN TRUE; END IF;

  -- 2. Verificar si el usuario actual (auth.uid) tiene una entrada en 'users' 
  --    que coincida con el target_tenant_id
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() 
      AND tenant_id = target_tenant_id
      AND deleted = false -- No permitir acceso a usuarios borrados soft
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLÍTICAS DE AISLAMIENTO (TENANT ISOLATION)
-- Regla de Oro: Solo puedes ver/editar filas donde tenant_id coincide con tu usuario.

-- 1. Tenants (Solo ver el propio)
DROP POLICY IF EXISTS "MVP_ALL_ACCESS" ON tenants;
CREATE POLICY "Tenant Isolation" ON tenants
    FOR ALL USING (id IN (
        SELECT tenant_id FROM public.users WHERE id = auth.uid() AND deleted = false
    ));

-- 2. Users (Ver compañeros del mismo tenant, y a sí mismo)
DROP POLICY IF EXISTS "MVP_ALL_ACCESS" ON users;
CREATE POLICY "Tenant Isolation" ON users
    FOR ALL USING (tenant_id IN (
        SELECT tenant_id FROM public.users WHERE id = auth.uid() AND deleted = false
    ));
-- Política especial para insertar el primer usuario (Onboarding) - Omitida por ahora, se asume creación server-side o función RPC.

-- 3. Stores, Clients, Categories, Products, Variants, Batches, Sales, Items, Ledger...
--    Todas siguen el patrón: tenant_id debe coincidir.

DROP POLICY IF EXISTS "MVP_ALL_ACCESS" ON stores;
CREATE POLICY "Tenant Isolation" ON stores
    FOR ALL USING (auth.user_has_access_to_tenant(tenant_id));

DROP POLICY IF EXISTS "MVP_ALL_ACCESS" ON clients;
CREATE POLICY "Tenant Isolation" ON clients
    FOR ALL USING (auth.user_has_access_to_tenant(tenant_id));

DROP POLICY IF EXISTS "MVP_ALL_ACCESS" ON categories;
CREATE POLICY "Tenant Isolation" ON categories
    FOR ALL USING (auth.user_has_access_to_tenant(tenant_id));

DROP POLICY IF EXISTS "MVP_ALL_ACCESS" ON products;
CREATE POLICY "Tenant Isolation" ON products
    FOR ALL USING (auth.user_has_access_to_tenant(tenant_id));

DROP POLICY IF EXISTS "MVP_ALL_ACCESS" ON variants;
CREATE POLICY "Tenant Isolation" ON variants
    FOR ALL USING (auth.user_has_access_to_tenant(tenant_id));

DROP POLICY IF EXISTS "MVP_ALL_ACCESS" ON inventory_batches;
CREATE POLICY "Tenant Isolation" ON inventory_batches
    FOR ALL USING (auth.user_has_access_to_tenant(tenant_id));

DROP POLICY IF EXISTS "MVP_ALL_ACCESS" ON sales;
CREATE POLICY "Tenant Isolation" ON sales
    FOR ALL USING (auth.user_has_access_to_tenant(tenant_id));

DROP POLICY IF EXISTS "MVP_ALL_ACCESS" ON sale_items;
CREATE POLICY "Tenant Isolation" ON sale_items
     -- Sale items no tienen tenant_id directo en este schema (o sí? revisemos create table above). 
     -- Sale items references sales. Sales has tenant_id.
     -- Optimization: Add tenant_id to sale_items or join sales. The schema above showed only variant_id.
     -- Let's check schema lines 199-211. 
     -- sale_items table: id, sale_id, variant_id... NO tenant_id.
     -- JOIN required.
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM sales s
            WHERE s.id = sale_items.sale_id
            AND auth.user_has_access_to_tenant(s.tenant_id)
        )
    );

DROP POLICY IF EXISTS "MVP_ALL_ACCESS" ON credit_ledger;
CREATE POLICY "Tenant Isolation" ON credit_ledger
    FOR ALL USING (auth.user_has_access_to_tenant(tenant_id));

-- 4. Global Catalog (Lectura para todos los autenticados, Escritura restringida)
DROP POLICY IF EXISTS "MVP_ALL_ACCESS" ON global_catalog;
CREATE POLICY "Global Read" ON global_catalog
    FOR SELECT USING (auth.role() = 'authenticated');
-- Write policy omitted (Admin only / Server side)

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. TRIGGERS AUTOMÁTICOS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON global_catalog FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON variants FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON inventory_batches FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON sale_items FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON credit_ledger FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
