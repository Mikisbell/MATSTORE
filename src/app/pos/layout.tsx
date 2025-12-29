import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MatStore POS',
  description: 'Punto de Venta Offline-First',
};

import { KeyboardManager } from '@/components/pos/KeyboardManager';

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardManager>
      <div className="h-screen w-screen overflow-hidden bg-[#121212] text-white">
        {/* Isolated Shell: No Global Nav, No Footer */}
        {children}
      </div>
    </KeyboardManager>
  );
}
