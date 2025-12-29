import { createRxDatabase, RxDatabase, RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import {
  productSchema,
  variantSchema,
  saleSchema,
  saleItemSchema,
  tenantSchema,
  storeSchema,
  userSchema,
  clientSchema,
  globalCatalogSchema,
  categorySchema,
  inventoryBatchSchema,
  creditLedgerSchema,
} from './schema';

/**
 * Tipos de la Base de Datos
 */
export type MatStoreCollections = {
  products: RxCollection;
  variants: RxCollection;
  sales: RxCollection;
  sale_items: RxCollection;
  tenants: RxCollection;
  stores: RxCollection;
  users: RxCollection;
  clients: RxCollection;
  global_catalog: RxCollection;
  categories: RxCollection;
  inventory_batches: RxCollection;
  credit_ledger: RxCollection;
};

export type MatStoreDatabase = RxDatabase<MatStoreCollections>;

import { replicateSupabase } from './replication';

/**
 * Singleton de la Base de Datos
 * Evita recrear la DB en hot-reload (Next.js dev mode).
 */
let dbPromise: Promise<MatStoreDatabase> | null = null;

const createDB = async (): Promise<MatStoreDatabase> => {
  if (process.env.NODE_ENV === 'development') {
    // import('rxdb/plugins/dev-mode').then((module) => addRxPlugin(module.RxDBDevModePlugin));
  }

  const db = await createRxDatabase<MatStoreCollections>({
    name: 'matstore_local_db',
    storage: getRxStorageDexie(),
    multiInstance: true, // Permitir múltiples pestañas
    ignoreDuplicate: true, // Ignorar error si ya existe en dev
  });

  await db.addCollections({
    products: { schema: productSchema },
    variants: { schema: variantSchema },
    sales: { schema: saleSchema },
    sale_items: { schema: saleItemSchema },
    tenants: { schema: tenantSchema },
    stores: { schema: storeSchema },
    users: { schema: userSchema },
    clients: { schema: clientSchema },
    global_catalog: { schema: globalCatalogSchema },
    categories: { schema: categorySchema },
    inventory_batches: { schema: inventoryBatchSchema },
    credit_ledger: { schema: creditLedgerSchema },
  });

  // 🔄 Iniciar Replicación para todas las colecciones
  const collections = Object.keys(db.collections);

  for (const collectionName of collections) {
    // Replicar cada colección con su tabla homónima en Supabase
    const collection = db.collections[collectionName as keyof MatStoreCollections];
    await replicateSupabase(collection, collectionName);
  }

  return db;
};

export const getDatabase = () => {
  if (!dbPromise) {
    dbPromise = createDB();
  }
  return dbPromise;
};
