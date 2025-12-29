'use client';
import { useCartStore } from '@/store/cartStore';

export function TicketSidebar() {
  const { items, removeItem, getSummary, checkout } = useCartStore();
  const summary = getSummary();

  // Formatter consts
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

  return (
    <aside className="w-[400px] h-full bg-[#1e1e1e] border-l border-white/10 flex flex-col">
      {/* Ticket Header */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-4">
        <h2 className="font-bold text-white">Ticket Actual</h2>
        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
          {summary.count} items
        </span>
      </div>

      {/* Cart Items (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-2">
            <span className="text-4xl">🛒</span>
            <p>Carrito vacío</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-[#252525] rounded border border-white/5 flex justify-between group relative overflow-hidden"
            >
              <div className="flex-1">
                <p className="text-sm text-white font-medium">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                    x{item.quantity}
                  </span>
                  <p className="text-xs text-gray-500">{formatCurrency(item.price)}</p>
                </div>
              </div>
              <div className="text-right flex flex-col justify-between">
                <p className="text-sm font-bold text-white">
                  {formatCurrency(item.price * item.quantity)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals Section */}
      <div className="bg-[#1a1a1a] p-4 border-t border-white/10 space-y-3">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Subtotal (Base)</span>
          <span>{formatCurrency(summary.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>IGV (18%)</span>
          <span>{formatCurrency(summary.tax)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-white/10">
          <span>Total</span>
          <span>{formatCurrency(summary.total)}</span>
        </div>

        <button
          onClick={async () => {
            const btn = document.activeElement as HTMLButtonElement;
            if (btn) btn.disabled = true; // Simple manual disable
            try {
              await checkout();
              // Success Feedback
              // alert('Venta guardada!'); // Replaced by simple visual cue or toast later
            } catch (e) {
              console.error(e);
              alert('Error al guardar venta');
            } finally {
              if (btn) btn.disabled = false;
            }
          }}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={items.length === 0}
        >
          {items.length === 0 ? 'SIN ITEMS' : 'COBRAR (Space)'}
        </button>
      </div>
    </aside>
  );
}
