'use client';

import React, { useState, useEffect, useRef } from 'react';

interface WeightInputModalProps {
  product: { id: string; name: string; price: number } | null;
  onConfirm: (weight: number) => void;
  onCancel: () => void;
}

export function WeightInputModal({ product, onConfirm, onCancel }: WeightInputModalProps) {
  const [weight, setWeight] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (product && inputRef.current) {
      inputRef.current.focus();
      // Reset weight when opening modal by replacing input value via ref
      inputRef.current.value = '';
    }
  }, [product]);

  if (!product) return null;

  const handleConfirm = () => {
    const parsedWeight = parseFloat(weight);
    if (parsedWeight > 0) {
      onConfirm(parsedWeight);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const subtotal = parseFloat(weight) * product.price || 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">{product.name}</h2>
          <p className="text-gray-400 text-sm">S/ {product.price.toFixed(2)} / kg</p>
        </div>

        {/* Weight Input */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Ingrese el peso (kg)</label>
          <input
            ref={inputRef}
            type="number"
            step="0.001"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#252525] border border-white/10 rounded-xl px-4 py-3 text-2xl font-mono text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.000"
          />
        </div>

        {/* Subtotal Preview */}
        <div className="mb-6 p-4 bg-[#252525] rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Subtotal:</span>
            <span className="text-2xl font-bold text-blue-400">S/ {subtotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-[#333] text-gray-300 rounded-xl font-medium hover:bg-[#444] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!parseFloat(weight) || parseFloat(weight) <= 0}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
