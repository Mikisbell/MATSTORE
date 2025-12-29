import { OmniSearch } from './OmniSearch';

export function TopBar() {
  return (
    <header className="h-16 border-b border-white/10 bg-[#1a1a1a] px-4 flex items-center justify-between">
      {/* OmniSearch Component */}
      <OmniSearch />

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-white">Cajero Principal</p>
          <p className="text-xs text-gray-500">Tienda Central</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          CP
        </div>
      </div>
    </header>
  );
}
