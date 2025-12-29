import { createRxDatabase, RxDatabase, RxCollection, removeRxDatabase } from 'rxdb';
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

const DB_NAME = 'matstore_local_db';
const storage = getRxStorageDexie();

/**
 * Singleton de la Base de Datos usando globalThis
 * Evita recrear la DB en hot-reload (Next.js dev mode).
 */
declare global {
  var _matStoreDb: MatStoreDatabase | undefined;
  var _matStoreDbPromise: Promise<MatStoreDatabase> | undefined;
}

const createDB = async (): Promise<MatStoreDatabase> => {
  // If we already have a DB instance, return it
  if (globalThis._matStoreDb) {
    return globalThis._matStoreDb;
  }

  const db = await createRxDatabase<MatStoreCollections>({
    name: DB_NAME,
    storage,
    multiInstance: true,
    // Don't use ignoreDuplicate - it throws DB9 in prod builds
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
    const collection = db.collections[collectionName as keyof MatStoreCollections];
    await replicateSupabase(collection, collectionName);
  }

  // Store the instance
  globalThis._matStoreDb = db;

  return db;
};

export const getDatabase = async (): Promise<MatStoreDatabase> => {
  // Quick check for existing instance
  if (globalThis._matStoreDb) {
    return globalThis._matStoreDb;
  }

  // Use promise singleton to prevent race conditions
  if (!globalThis._matStoreDbPromise) {
    globalThis._matStoreDbPromise = createDB().catch(async (error) => {
      // If DB8 error (db already exists), try to get the existing one
      if (error.code === 'DB8') {
        // Remove and recreate
        await removeRxDatabase(DB_NAME, storage);
        return createDB();
      }
      throw error;
    });
  }

  return globalThis._matStoreDbPromise;
};
