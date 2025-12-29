'use client';

import { useState, useRef } from 'react';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

interface OmniSearchProps {
  onSearch?: (term: string) => void;
  onScan?: (barcode: string) => void;
  isLoading?: boolean;
}

export function OmniSearch({ onSearch, onScan, isLoading }: OmniSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Integración Hardware: Scanner
  useBarcodeScanner({
    onScan: (barcode) => {
      if (onScan) {
        onScan(barcode);
      } else {
        // Si no hay handler externo, intentamos simular un add directo (esto cambiará cuando conectemos RxDB)
        // Por ahora solo feedback visual en consola
      }
      setSearchTerm('');
    },
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (onSearch) onSearch(term);
  };

  return (
    <div className="flex items-center gap-4 w-full max-w-xl">
      <div className="flex-1 h-10 bg-[#252525] rounded-lg border border-white/5 flex items-center px-4 focus-within:border-blue-500/50 focus-within:bg-[#2a2a2a] transition-all">
        <span className="text-gray-500 mr-2">{isLoading ? '⏳' : '🔍'}</span>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInput}
          placeholder="Buscar producto o escanear (F1)..."
          className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-600 font-medium"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              if (onSearch) onSearch('');
              inputRef.current?.focus();
            }}
            className="text-gray-500 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>
      {/* Indicador de modo Hardware (oculto visualmente si no es relevante, o un icono pequeño) */}
    </div>
  );
}
