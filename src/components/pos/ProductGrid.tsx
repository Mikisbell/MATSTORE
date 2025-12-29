'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { WeightInputModal } from './WeightInputModal';

// Mock product with inventory_type for demo
interface MockProduct {
  id: string;
  name: string;
  price: number;
  inventory_type: 'discrete' | 'continuous' | 'service';
}

export function ProductGrid() {
  const addItem = useCartStore((state) => state.addItem);

  // State for weighted product modal
  const [pendingWeightProduct, setPendingWeightProduct] = useState<MockProduct | null>(null);

  // Generate mock products - some discrete, some continuous (weighted)
  const mockProducts: MockProduct[] = Array.from({ length: 20 }).map((_, i) => ({
    id: `sku-00${i}`,
    name: i % 5 === 0 ? `Fruta ${i + 1} (al peso)` : `Producto Ejemplo ${i + 1}`,
    price: 25.0 + i,
    // Every 5th product is "continuous" (weighted)
    inventory_type: i % 5 === 0 ? 'continuous' : 'discrete',
  }));

  const handleProductClick = (product: MockProduct) => {
    if (product.inventory_type === 'continuous') {
      // Open weight input modal
      setPendingWeightProduct(product);
    } else {
      // Add directly with quantity 1
      addItem({ id: product.id, name: product.name, price: product.price });
    }
  };

  const handleWeightConfirm = (weight: number) => {
    if (pendingWeightProduct) {
      addItem({
        id: pendingWeightProduct.id,
        name: pendingWeightProduct.name,
        price: pendingWeightProduct.price,
        quantity: weight,
      });
      setPendingWeightProduct(null);
    }
  };

  const handleWeightCancel = () => {
    setPendingWeightProduct(null);
  };

  return (
    <>
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto h-full content-start">
        {mockProducts.map((product, i) => (
          <button
            key={i}
            onClick={() => handleProductClick(product)}
            className={`aspect-square bg-[#252525] border rounded-xl p-4 flex flex-col items-start justify-between hover:bg-[#2a2a2a] transition-all group text-left active:scale-95 ${
              product.inventory_type === 'continuous'
                ? 'border-orange-500/30 hover:border-orange-500/60'
                : 'border-white/5 hover:border-blue-500/50'
            }`}
          >
            <div className="w-full">
              <div
                className={`w-12 h-12 rounded-lg mb-3 flex items-center justify-center text-lg ${
                  product.inventory_type === 'continuous'
                    ? 'bg-orange-600/20 text-orange-400'
                    : 'bg-[#333]'
                }`}
              >
                {product.inventory_type === 'continuous' ? '⚖️' : '📦'}
              </div>
              <h3 className="font-medium text-gray-200 line-clamp-2">{product.name}</h3>
              <p className="text-xs text-gray-500">SKU-00{i}</p>
            </div>
            <div className="w-full mt-2 flex items-center justify-between">
              <span
                className={`text-lg font-bold ${
                  product.inventory_type === 'continuous' ? 'text-orange-400' : 'text-blue-400'
                }`}
              >
                S/ {product.price.toFixed(2)}
              </span>
              {product.inventory_type === 'continuous' && (
                <span className="text-xs text-orange-400/70">/kg</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Weight Input Modal */}
      <WeightInputModal
        product={pendingWeightProduct}
        onConfirm={handleWeightConfirm}
        onCancel={handleWeightCancel}
      />
    </>
  );
}
