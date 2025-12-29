import { create, StateCreator } from 'zustand';

export interface CartItem {
  id: string; // SKU or UUID
  name: string;
  price: number;
  quantity: number;
  tax_rate: number; // 0.18 for IGV
}

interface CartState {
  items: CartItem[];
  addItem: (product: { id: string; name: string; price: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  getSummary: () => { subtotal: number; tax: number; total: number; count: number };
  checkout: () => Promise<void>;
}

const createCartSlice: StateCreator<CartState> = (set, get) => ({
  items: [],

  addItem: (product: { id: string; name: string; price: number }) => {
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { ...product, quantity: 1, tax_rate: 0.18 }, // Default IGV
        ],
      };
    });
  },

  removeItem: (id: string) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));
  },

  updateQuantity: (id: string, delta: number) => {
    set((state) => {
      const existing = state.items.find((i) => i.id === id);
      if (!existing) return state;

      const newQuantity = existing.quantity + delta;

      if (newQuantity <= 0) {
        return {
          items: state.items.filter((i) => i.id !== id),
        };
      }

      return {
        items: state.items.map((i) => (i.id === id ? { ...i, quantity: newQuantity } : i)),
      };
    });
  },

  clearCart: () => set({ items: [] }),

  getSummary: () => {
    const { items } = get();
    const subtotal = items.reduce(
      (acc: number, item: CartItem) => acc + item.price * item.quantity,
      0
    );
    const total = subtotal;
    const base = total / 1.18;
    const igv = total - base;

    return {
      subtotal: base,
      tax: igv,
      total,
      count: items.reduce((acc: number, item: CartItem) => acc + item.quantity, 0),
    };
  },

  checkout: async () => {
    const { items, getSummary, clearCart } = get();
    if (items.length === 0) return;

    try {
      // 1. Dynamic Import to avoid SSR issues with RxDB/IndexedDB
      const { getDatabase } = await import('@/lib/db');
      const db = await getDatabase();
      const summary = getSummary();
      const saleId = crypto.randomUUID();

      // 2. Create Sale Document
      const saleData = {
        id: saleId,
        tenant_id: 'tenant-default', // MVP: Placeholder
        store_id: 'store-default', // MVP: Placeholder
        user_id: 'user-default', // MVP: Placeholder
        client_id: 'client-default', // MVP: Placeholder
        status: 'pending_sync', // Sync Engine will pick this up
        payment_method: 'cash',
        total: summary.total,
        subtotal: summary.subtotal,
        tax: summary.tax,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        deleted: false,
      };

      // 3. Create Sale Item Documents
      const saleItemsData = items.map((item) => ({
        id: crypto.randomUUID(),
        sale_id: saleId,
        variant_id: item.id, // Assuming Item ID maps to Variant ID
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
        discount: 0,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        deleted: false,
      }));

      // 4. Persistence Transaction
      // RxDB doesn't have multi-collection transactions in the free version usually,
      // but we can execute sequentially. Failures inside might require cleanup.
      // For MVP Offline-First, we just insert.
      await db.sales.insert(saleData);

      // Bulk insert items
      await Promise.all(saleItemsData.map((item) => db.sale_items.insert(item)));

      // 4.5. Optimistic Inventory Update (Decrement Batch)
      await Promise.all(
        items.map(async (item) => {
          // Find batches for this variant, ordered by expiration (or creation)
          const batch = await db.inventory_batches
            .findOne({
              selector: {
                variant_id: item.id,
              },
              sort: [{ updated_at: 'asc' }], // Oldest batch first (FIFO ish)
            })
            .exec();

          if (batch) {
            const currentQty = batch.get('quantity') || 0;
            // RxDB Documents are immutable by default, use update/patch
            await batch.patch({
              quantity: currentQty - item.quantity,
              updated_at: new Date().toISOString(),
            });
          }
        })
      );

      // 5. Success
      clearCart();

      // Optional: Trigger Sync immediately?
      // const { syncAll } = await import('@/lib/db/sync');
      // syncAll();
    } catch (error) {
      console.error('Checkout Failed:', error);
      throw error; // Re-throw for UI to handle
    }
  },
});

export const useCartStore = create<CartState>(createCartSlice);
