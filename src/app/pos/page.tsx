import { ProductGrid } from '@/components/pos/ProductGrid';
import { TicketSidebar } from '@/components/pos/TicketSidebar';
import { TopBar } from '@/components/pos/TopBar';

export default function POSPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Row 1: Top Bar (Fijo) */}
      <TopBar />

      {/* Row 2: Content Area (Grid + Sidebar) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Col 1: Product Grid (Flexible) */}
        <main className="flex-1 relative bg-[#121212]">
          <ProductGrid />
        </main>

        {/* Col 2: Ticket Sidebar (Fijo 400px) */}
        <TicketSidebar />
      </div>
    </div>
  );
}
