import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * CRITICAL FOR TAURI:
   * Tauri no ejecuta un servidor Node.js. Necesitamos un export estático (HTML/CSS/JS).
   * Esto genera la carpeta 'out/' que Tauri sirve como frontend.
   */
  output: 'export',

  /**
   * OPTIMIZACIÓN DE IMÁGENES:
   * El componente <Image /> de Next.js requiere un servidor para redimensionar imágenes.
   * En Tauri no tenemos eso. Desactivamos la optimización.
   */
  images: {
    unoptimized: true,
  },

  /**
   * REACT STRICT MODE:
   * Mantenemos true para detectar bugs de renderizado doble en desarrollo.
   */
  reactStrictMode: true,

  /**
   * TRAILING SLASH:
   * Útil para rutas estáticas en Tauri.
   */
  trailingSlash: true,
};

export default nextConfig;
