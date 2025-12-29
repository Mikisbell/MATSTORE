import { RxJsonSchema } from 'rxdb';

/**
 * MatStore Local Database Schemas (RxDB)
 * =======================================
 * Debe coincidir con Supabase 1:1 para facilitar la replicación.
 */

// Interfaces
export interface ProductDoc {
  id: string;
  tenant_id?: string;
  name: string;
  description?: string;
  category_id?: string;
  image_url?: string;
  global_ref_id?: string;
  updated_at: string;
  created_at?: string;
  is_deleted?: boolean;
}

export interface VariantDoc {
  id: string;
  product_id?: string;
  tenant_id?: string;
  sku?: string;
  barcode?: string;
  name?: string;
  inventory_type?: 'discrete' | 'continuous' | 'service';
  unit_measure?: string;
  allow_decimal_sales?: boolean;
  price: number;
  cost?: number;
  is_taxed?: boolean;
  updated_at: string;
  created_at?: string;
  is_deleted?: boolean;
}

export interface SaleDoc {
  id: string;
  tenant_id?: string;
  store_id?: string;
  client_id?: string;
  user_id?: string;
  status: 'completed' | 'pending_sync' | 'voided' | 'draft';
  payment_method?: string;
  total: number;
  subtotal?: number;
  tax?: number;
  synced_at?: string;
  updated_at: string;
  created_at?: string;
  is_deleted?: boolean;
}

export interface SaleItemDoc {
  id: string;
  sale_id: string;
  variant_id: string;
  quantity: number;
  unit_price?: number;
  subtotal: number;
  discount?: number;
  updated_at?: string;
  created_at?: string;
  is_deleted?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                  PRODUCTS                                  */
/* -------------------------------------------------------------------------- */
export const productSchema: RxJsonSchema<ProductDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 36,
    },
    tenant_id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    category_id: {
      type: 'string',
    },
    image_url: {
      type: 'string',
    },
    global_ref_id: {
      type: 'string',
    },
    updated_at: {
      type: 'string', // ISO Date
    },
    created_at: {
      type: 'string', // ISO Date
    },
    is_deleted: {
      type: 'boolean',
    },
  },
  required: ['id', 'name', 'updated_at'],
};

/* -------------------------------------------------------------------------- */
/*                                  VARIANTS                                  */
/* -------------------------------------------------------------------------- */
export const variantSchema: RxJsonSchema<VariantDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 36,
    },
    product_id: {
      type: 'string',
    },
    tenant_id: {
      type: 'string',
    },
    sku: {
      type: 'string',
    },
    barcode: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    inventory_type: {
      type: 'string',
      enum: ['discrete', 'continuous', 'service'],
    },
    unit_measure: {
      type: 'string',
    },
    allow_decimal_sales: {
      type: 'boolean',
    },
    price: {
      type: 'number',
    },
    cost: {
      type: 'number',
    },
    is_taxed: {
      type: 'boolean',
    },
    updated_at: {
      type: 'string',
    },
    created_at: {
      type: 'string',
    },
    is_deleted: {
      type: 'boolean',
    },
  },
  required: ['id', 'price', 'updated_at'],
};

/* -------------------------------------------------------------------------- */
/*                                   SALES                                    */
/* -------------------------------------------------------------------------- */
export const saleSchema: RxJsonSchema<SaleDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 36,
    },
    tenant_id: {
      type: 'string',
    },
    store_id: {
      type: 'string',
    },
    client_id: {
      type: 'string',
    },
    user_id: {
      type: 'string',
    },
    status: {
      type: 'string',
      enum: ['completed', 'pending_sync', 'voided', 'draft'],
    },
    payment_method: {
      type: 'string',
    },
    total: {
      type: 'number',
    },
    subtotal: {
      type: 'number',
    },
    tax: {
      type: 'number',
    },
    synced_at: {
      type: 'string',
    },
    updated_at: {
      type: 'string',
    },
    created_at: {
      type: 'string',
    },
    is_deleted: {
      type: 'boolean',
    },
  },
  required: ['id', 'total', 'status', 'updated_at'],
};

/* -------------------------------------------------------------------------- */
/*                                 SALE ITEMS                                 */
/* -------------------------------------------------------------------------- */
export const saleItemSchema: RxJsonSchema<SaleItemDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 36,
    },
    sale_id: {
      type: 'string',
    },
    variant_id: {
      type: 'string',
    },
    quantity: {
      type: 'number',
    },
    unit_price: {
      type: 'number',
    },
    subtotal: {
      type: 'number',
    },
    discount: {
      type: 'number',
    },
    updated_at: {
      type: 'string',
    },
    created_at: {
      type: 'string',
    },
    is_deleted: {
      type: 'boolean',
    },
  },
  required: ['id', 'sale_id', 'variant_id', 'quantity', 'subtotal'],
};
/* -------------------------------------------------------------------------- */
/*                                   TENANTS                                  */
/* -------------------------------------------------------------------------- */
export interface TenantDoc {
  id: string;
  name: string;
  plan_type?: string;
  updated_at: string;
  created_at?: string;
  is_deleted?: boolean;
}
export const tenantSchema: RxJsonSchema<TenantDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    name: { type: 'string' },
    plan_type: { type: 'string' },
    updated_at: { type: 'string' },
    created_at: { type: 'string' },
    is_deleted: { type: 'boolean' },
  },
  required: ['id', 'name', 'updated_at'],
};

/* -------------------------------------------------------------------------- */
/*                                    STORES                                  */
/* -------------------------------------------------------------------------- */
export interface StoreDoc {
  id: string;
  tenant_id?: string;
  name: string;
  address?: string;
  is_warehouse?: boolean;
  updated_at: string;
  created_at?: string;
  is_deleted?: boolean;
}
export const storeSchema: RxJsonSchema<StoreDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    tenant_id: { type: 'string' },
    name: { type: 'string' },
    address: { type: 'string' },
    is_warehouse: { type: 'boolean' },
    updated_at: { type: 'string' },
    created_at: { type: 'string' },
    is_deleted: { type: 'boolean' },
  },
  required: ['id', 'name', 'updated_at'],
};

/* -------------------------------------------------------------------------- */
/*                                    USERS                                   */
/* -------------------------------------------------------------------------- */
export interface UserDoc {
  id: string;
  tenant_id?: string;
  store_id?: string;
  full_name?: string;
  role?: 'owner' | 'manager' | 'cashier';
  updated_at: string;
  created_at?: string;
  is_deleted?: boolean;
}
export const userSchema: RxJsonSchema<UserDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    tenant_id: { type: 'string' },
    store_id: { type: 'string' },
    full_name: { type: 'string' },
    role: { type: 'string' },
    updated_at: { type: 'string' },
    created_at: { type: 'string' },
    is_deleted: { type: 'boolean' },
  },
  required: ['id', 'updated_at'],
};

/* -------------------------------------------------------------------------- */
/*                                   CLIENTS                                  */
/* -------------------------------------------------------------------------- */
export interface ClientDoc {
  id: string;
  tenant_id?: string;
  name: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  credit_limit?: number;
  updated_at: string;
  created_at?: string;
  is_deleted?: boolean;
}
export const clientSchema: RxJsonSchema<ClientDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    tenant_id: { type: 'string' },
    name: { type: 'string' },
    tax_id: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    credit_limit: { type: 'number' },
    updated_at: { type: 'string' },
    created_at: { type: 'string' },
    is_deleted: { type: 'boolean' },
  },
  required: ['id', 'name', 'updated_at'],
};

/* -------------------------------------------------------------------------- */
/*                                GLOBAL CATALOG                              */
/* -------------------------------------------------------------------------- */
export interface GlobalCatalogDoc {
  id: string;
  ean?: string;
  name: string;
  description?: string;
  image_url?: string;
  category_name?: string;
  brand?: string;
  updated_at: string;
  created_at?: string;
  is_deleted?: boolean;
}
export const globalCatalogSchema: RxJsonSchema<GlobalCatalogDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    ean: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    image_url: { type: 'string' },
    category_name: { type: 'string' },
    brand: { type: 'string' },
    updated_at: { type: 'string' },
    created_at: { type: 'string' },
    is_deleted: { type: 'boolean' },
  },
  required: ['id', 'name', 'updated_at'],
};

/* -------------------------------------------------------------------------- */
/*                                  CATEGORIES                                */
/* -------------------------------------------------------------------------- */
export interface CategoryDoc {
  id: string;
  tenant_id?: string;
  name: string;
  color?: string;
  updated_at: string;
  created_at?: string;
  is_deleted?: boolean;
}
export const categorySchema: RxJsonSchema<CategoryDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    tenant_id: { type: 'string' },
    name: { type: 'string' },
    color: { type: 'string' },
    updated_at: { type: 'string' },
    created_at: { type: 'string' },
    is_deleted: { type: 'boolean' },
  },
  required: ['id', 'name', 'updated_at'],
};

/* -------------------------------------------------------------------------- */
/*                               INVENTORY BATCHES                            */
/* -------------------------------------------------------------------------- */
export interface InventoryBatchDoc {
  id: string;
  variant_id?: string;
  store_id?: string;
  tenant_id?: string;
  batch_code?: string;
  expiration_date?: string;
  quantity?: number;
  updated_at: string;
  created_at?: string;
  is_deleted?: boolean;
}
export const inventoryBatchSchema: RxJsonSchema<InventoryBatchDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    variant_id: { type: 'string' },
    store_id: { type: 'string' },
    tenant_id: { type: 'string' },
    batch_code: { type: 'string' },
    expiration_date: { type: 'string' }, // YYYY-MM-DD
    quantity: { type: 'number' },
    updated_at: { type: 'string' },
    created_at: { type: 'string' },
    is_deleted: { type: 'boolean' },
  },
  required: ['id', 'updated_at'],
};

/* -------------------------------------------------------------------------- */
/*                                CREDIT LEDGER                               */
/* -------------------------------------------------------------------------- */
export interface CreditLedgerDoc {
  id: string;
  tenant_id?: string;
  client_id?: string;
  sale_id?: string;
  type?: 'charge' | 'payment' | 'adjustment';
  amount: number;
  balance_after?: number;
  notes?: string;
  updated_at: string;
  created_at?: string;
  is_deleted?: boolean;
}
export const creditLedgerSchema: RxJsonSchema<CreditLedgerDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    tenant_id: { type: 'string' },
    client_id: { type: 'string' },
    sale_id: { type: 'string' },
    type: { type: 'string' },
    amount: { type: 'number' },
    balance_after: { type: 'number' },
    notes: { type: 'string' },
    updated_at: { type: 'string' },
    created_at: { type: 'string' },
    is_deleted: { type: 'boolean' },
  },
  required: ['id', 'amount', 'updated_at'],
};
