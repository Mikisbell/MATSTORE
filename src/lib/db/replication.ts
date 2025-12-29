import { RxCollection, RxReplicationWriteToMasterRow } from 'rxdb';
import { RxReplicationState, replicateRxCollection } from 'rxdb/plugins/replication';
import { supabase } from '../supabase';

/**
 * Checkpoint de Replicación
 * RxDB usa esto para saber dónde se quedó.
 */
export type SupabaseCheckpoint = {
  updated_at: string;
  id: string; // Primario secundario para orden estable
};

const BATCH_SIZE = 50;

/**
 * Replicador Genérico RxDB <-> Supabase
 * @param collection La colección RxDB local
 * @param tableName El nombre de la tabla en Supabase (debe coincidir 1:1)
 */
export async function replicateSupabase<TDoc>(
  collection: RxCollection<TDoc>,
  tableName: string
): Promise<RxReplicationState<TDoc, SupabaseCheckpoint>> {
  return replicateRxCollection<TDoc, SupabaseCheckpoint>({
    collection,
    replicationIdentifier: `supabase-${tableName}`, // ID único para guardar estado
    live: true, // Sincronización en tiempo real (Polling por ahora)
    retryTime: 5000,
    waitForLeadership: true, // Solo una pestaña sincroniza
    autoStart: true,

    // ⬇️ PULL: Traer datos de Supabase hacia RxDB
    pull: {
      batchSize: BATCH_SIZE,
      modifier: (doc) => {
        // Transformar datos si fuera necesario (ej: parsear JSON strings)
        return doc;
      },
      handler: async (lastCheckpoint, batchSize) => {
        const minTimestamp = lastCheckpoint ? lastCheckpoint.updated_at : new Date(0).toISOString();

        // Query a Supabase
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .gt('updated_at', minTimestamp)
          .order('updated_at', { ascending: true })
          .limit(batchSize);

        if (error) {
          console.warn(
            `⚠️ Pull skipped for ${tableName} (offline or table not found):`,
            error.message || error
          );
          // Return empty - offline-first: don't block on sync errors
          return {
            documents: [],
            checkpoint: lastCheckpoint,
          };
        }

        if (data.length === 0) {
          return {
            documents: [],
            checkpoint: lastCheckpoint, // No hay cambios
          };
        }

        // El nuevo checkpoint es el último doc recibido
        const lastDoc = data[data.length - 1];
        const newCheckpoint: SupabaseCheckpoint = {
          updated_at: lastDoc.updated_at,
          id: lastDoc.id,
        };

        return {
          documents: data,
          checkpoint: newCheckpoint,
        };
      },
    },

    // ⬆️ PUSH: Enviar cambios locales a Supabase
    push: {
      batchSize: BATCH_SIZE,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: async (rows: RxReplicationWriteToMasterRow<any>[]) => {
        const docs = rows.map((r) => r.newDocumentState);

        // Upsert masivo a Supabase
        // Postgres maneja conflictos "Last Write Wins"
        const { error } = await supabase.from(tableName).upsert(docs, {
          onConflict: 'id',
          ignoreDuplicates: false, // Queremos sobreescribir
        });

        if (error) {
          console.warn(
            `⚠️ Push skipped for ${tableName} (offline or table not found):`,
            error.message || error
          );
          // Offline-first: don't block on sync errors, data is safe locally
          return [];
        }

        // Retornar Docs conflictivos (vacío porque confiamos en "Last Write Wins")
        return [];
      },
    },
  });
}
