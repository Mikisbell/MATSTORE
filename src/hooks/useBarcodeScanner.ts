import { useEffect, useState } from 'react';

/**
 * Hook para detectar entrada de Lector de Código de Barras (HID)
 * Detecta ráfagas rápidas de teclas que terminan en Enter.
 */
export function useBarcodeScanner({
  onScan,
  minChars = 3,
  timeoutMs = 50,
}: {
  onScan: (barcode: string) => void;
  minChars?: number;
  timeoutMs?: number;
}) {
  const [buffer, setBuffer] = useState<string>('');
  const [lastKeyTime, setLastKeyTime] = useState<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      const isBurst = currentTime - lastKeyTime <= timeoutMs;

      // Si la tecla es Enter y tenemos un buffer válido, emitimos scan
      if (e.key === 'Enter') {
        if (buffer.length >= minChars && isBurst) {
          e.preventDefault(); // Evitar submit de form
          e.stopPropagation();
          onScan(buffer);
          setBuffer('');
        } else {
          // Enter manual o buffer corto, limpiamos
          setBuffer('');
        }
        return;
      }

      // Si no es un caracter imprimible simple, ignoramos (shift, ctrl, etc)
      if (e.key.length > 1) return;

      if (isBurst) {
        // Continuamos la ráfaga
        setBuffer((prev) => prev + e.key);
      } else {
        // Nueva ráfaga o tecleo manual lento: reiniciamos buffer con esta tecla
        setBuffer(e.key);
      }

      setLastKeyTime(currentTime);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buffer, lastKeyTime, onScan, minChars, timeoutMs]);
}
