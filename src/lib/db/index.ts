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
 * Database singleton using window object for browser persistence
 * Works with Turbopack HMR
 */
let dbInstance: MatStoreDatabase | null = null;
let dbPromise: Promise<MatStoreDatabase> | null = null;

// Use window for browser-side persistence across HMR
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  if (win.__MATSTORE_DB__) {
    dbInstance = win.__MATSTORE_DB__;
  }
  if (win.__MATSTORE_DB_PROMISE__) {
    dbPromise = win.__MATSTORE_DB_PROMISE__;
  }
}

const createDB = async (): Promise<MatStoreDatabase> => {
  // Return existing instance if available
  if (dbInstance) {
    return dbInstance;
  }

  // Browser-side check
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (win.__MATSTORE_DB__) {
      dbInstance = win.__MATSTORE_DB__;
      return dbInstance!;
    }
  }

  try {
    const db = await createRxDatabase<MatStoreCollections>({
      name: DB_NAME,
      storage,
      multiInstance: true,
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

    // Initialize replication
    const collections = Object.keys(db.collections);
    for (const collectionName of collections) {
      const collection = db.collections[collectionName as keyof MatStoreCollections];
      await replicateSupabase(collection, collectionName);
    }

    // Store in both module and window scope
    dbInstance = db;
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__MATSTORE_DB__ = db;
    }

    return db;
  } catch (error) {
    // If DB8 (already exists) or DB9 error, try to remove and recreate
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rxError = error as any;
    if (rxError.code === 'DB8' || rxError.code === 'DB9') {
      await removeRxDatabase(DB_NAME, storage);
      // Recursive call after cleanup
      return createDB();
    }
    throw error;
  }
};

export const getDatabase = async (): Promise<MatStoreDatabase> => {
  // Quick return if we have an instance
  if (dbInstance) {
    return dbInstance;
  }

  // Check window for existing instance (HMR recovery)
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (win.__MATSTORE_DB__) {
      dbInstance = win.__MATSTORE_DB__;
      return dbInstance!;
    }
  }

  // Use promise to prevent race conditions
  if (!dbPromise) {
    dbPromise = createDB();
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__MATSTORE_DB_PROMISE__ = dbPromise;
    }
  }

  return dbPromise;
};
