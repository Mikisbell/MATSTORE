import Link from 'next/link';
/**
 * MatStore POS - Página Principal
 * ================================
 * Sistema Operativo de Retail Offline-First (v0.1.0)
 *
 * Diseño: "Claridad Industrial" (Volumen V)
 * - Verde Neón (#00E676) para acciones
 * - Fondo OLED Negro
 * - Tipografía Inter + Roboto Mono
 */

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <main className="flex flex-col items-center gap-8 text-center max-w-4xl">
        {/* Logo / Título */}
        <div className="space-y-2">
          <h1
            className="text-6xl font-bold tracking-tight"
            style={{ color: 'var(--color-action)' }}
          >
            MatStore POS
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-xl">
            Sistema Operativo Retail Offline-First (v0.1.0)
          </p>
        </div>

        {/* Indicadores de diseño - Pilares */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <div className="surface p-6 min-w-[140px]">
            <span
              className="block text-4xl font-bold price-text"
              style={{ color: 'var(--color-action)' }}
            >
              0%
            </span>
            <span
              className="text-xs uppercase tracking-wider mt-2 block"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Carga Cognitiva
            </span>
          </div>
          <div className="surface p-6 min-w-[140px]">
            <span
              className="block text-4xl font-bold price-text"
              style={{ color: 'var(--color-action)' }}
            >
              100%
            </span>
            <span
              className="text-xs uppercase tracking-wider mt-2 block"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Local First
            </span>
          </div>
          <div className="surface p-6 min-w-[140px]">
            <span
              className="block text-4xl font-bold price-text"
              style={{ color: 'var(--color-action)' }}
            >
              ∞
            </span>
            <span
              className="text-xs uppercase tracking-wider mt-2 block"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Offline Ready
            </span>
          </div>
        </div>

        {/* Demo de botones del sistema de diseño */}
        <div className="flex gap-4 mt-8">
          <Link href="/pos" className="btn-action no-underline flex items-center justify-center">
            INGRESAR AL POS
          </Link>
          <button
            type="button"
            className="surface-interactive px-6 py-3 font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Buscar Producto
          </button>
        </div>

        {/* Estado del proyecto */}
        <div className="surface mt-8 p-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <p>Fase 0: Fundaciones • Progreso: 33%</p>
          <p className="text-xs mt-1">Sistema de Diseño: Claridad Industrial ✓</p>
        </div>
      </main>
    </div>
  );
}
