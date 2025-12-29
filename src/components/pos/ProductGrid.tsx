'use client';
import { useCartStore } from '@/store/cartStore';

export function ProductGrid() {
  const addItem = useCartStore((state) => state.addItem);

  const mockProduct = (i: number) => ({
    id: `sku-00${i}`,
    name: `Producto Ejemplo ${i + 1}`,
    price: 25.0 + i, // Variar precio
  });

  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto h-full content-start">
      {/* Placeholder Items */}
      {Array.from({ length: 20 }).map((_, i) => (
        <button
          key={i}
          onClick={() => addItem(mockProduct(i))}
          className="aspect-square bg-[#252525] border border-white/5 rounded-xl p-4 flex flex-col items-start justify-between hover:border-blue-500/50 hover:bg-[#2a2a2a] transition-all group text-left active:scale-95"
        >
          <div className="w-full">
            <div className="w-12 h-12 bg-[#333] rounded-lg mb-3" />
            <h3 className="font-medium text-gray-200 line-clamp-2">Producto Ejemplo {i + 1}</h3>
            <p className="text-xs text-gray-500">SKU-00{i}</p>
          </div>
          <div className="w-full mt-2">
            <span className="text-lg font-bold text-blue-400">
              S/ {mockProduct(i).price.toFixed(2)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
