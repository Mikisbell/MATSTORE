'use client';

import React, { useState, useEffect, useRef } from 'react';

// Mock clients for MVP (would come from RxDB in production)
const MOCK_CLIENTS = [
  { id: 'client-001', name: 'Juan Pérez', credit_limit: 500 },
  { id: 'client-002', name: 'María García', credit_limit: 1000 },
  { id: 'client-003', name: 'Carlos Rodríguez', credit_limit: 750 },
  { id: 'client-004', name: 'Ana López', credit_limit: 300 },
  { id: 'client-005', name: 'Pedro Sánchez', credit_limit: 1500 },
];

interface ClientSelectorModalProps {
  isOpen: boolean;
  onConfirm: (clientId: string, clientName: string) => void;
  onCancel: () => void;
  amount: number;
}

export function ClientSelectorModal({
  isOpen,
  onConfirm,
  onCancel,
  amount,
}: ClientSelectorModalProps) {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search on open and reset via callbacks in parent
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // Clear input via ref instead of setState
      inputRef.current.value = '';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredClients = MOCK_CLIENTS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    const client = MOCK_CLIENTS.find((c) => c.id === selectedClient);
    if (client) {
      onConfirm(client.id, client.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && selectedClient) {
      handleConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">Seleccionar Cliente</h2>
          <p className="text-gray-400 text-sm">
            Monto a fiar: <span className="text-orange-400 font-bold">S/ {amount.toFixed(2)}</span>
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full bg-[#252525] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Client List */}
        <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
          {filteredClients.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No se encontraron clientes</p>
          ) : (
            filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client.id)}
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  selectedClient === client.id
                    ? 'bg-orange-600/20 border-orange-500 border'
                    : 'bg-[#252525] border border-white/5 hover:border-white/20'
                }`}
              >
                <p className="font-medium text-white">{client.name}</p>
                <p className="text-xs text-gray-400">Límite: S/ {client.credit_limit.toFixed(2)}</p>
              </button>
            ))
          )}
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
            disabled={!selectedClient}
            className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Fiado
          </button>
        </div>
      </div>
    </div>
  );
}
