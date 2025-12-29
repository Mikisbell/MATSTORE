REGLAS DE COMPORTAMIENTO DEL AGENTE (DOGMAS)

═══════════════════════════════════════════════════════════════════════════════
1. DOGMA DEL CÓDIGO
═══════════════════════════════════════════════════════════════════════════════

No Placeholder: Nunca escribas // TODO: Implement logic here. Si no puedes 
implementarlo completo, detente y pide aclaración.

Types First: Nunca uses any. Define interfaces en src/types/ antes de escribir 
componentes.

No Spanglish: Comentarios en Español (para Mikis). Código (Variables/Funciones) 
en Inglés descriptivo.

═══════════════════════════════════════════════════════════════════════════════
2. DOGMA DE ARQUITECTURA (OFFLINE-FIRST)
═══════════════════════════════════════════════════════════════════════════════

Prohibido: useEffect(() => { fetch('/api/products') }, []) en componentes de UI.

Permitido: const { data } = useRxQuery(productsQuery).

Explicación: La UI solo habla con la base de datos local. La base de datos local 
habla con la nube en background.

═══════════════════════════════════════════════════════════════════════════════
3. DOGMA DE UX (LEY DE HICK)
═══════════════════════════════════════════════════════════════════════════════

Cada vez que crees una pantalla, pregúntate: "¿Puede un niño de 10 años usar 
esto sin leer?".

Si hay más de 3 botones primarios en una vista, rechaza tu propio diseño y 
simplifica.

═══════════════════════════════════════════════════════════════════════════════
4. DOGMA DE LA INTEGRIDAD
═══════════════════════════════════════════════════════════════════════════════

Si modificas el esquema de base de datos, DEBES actualizar 
docs/02_datos.md inmediatamente.

El código es efímero; la documentación es la verdad.

═══════════════════════════════════════════════════════════════════════════════
5. DEFINITION OF DONE (CUÁNDO PUEDES MARCAR [x])
═══════════════════════════════════════════════════════════════════════════════

Una tarea NO está "hecha" hasta que pase su Quality Gate.

Cada tarea tiene un test automático definido en scripts/docs-audit.mjs.
Si la tarea está marcada [x] pero su test falla → EL SISTEMA SE BLOQUEA.

Ejemplos:
- 0.1b [x] requiere: npx tsc --noEmit → Éxito
- 0.1c [x] requiere: tauri.conf.json existe y es JSON válido
- 0.2  [x] requiere: npm run lint → Éxito

EL CHECKBOX NO ES UN ACTO DE FE, ES UNA PROMESA VERIFICABLE.

═══════════════════════════════════════════════════════════════════════════════
6. REGLA DE NO ATAJOS
═══════════════════════════════════════════════════════════════════════════════

PROHIBIDO:
- Agregar archivos a eslint ignores para evitar errores
- Usar @ts-ignore, eslint-disable, o any
- Comentar código problemático en lugar de arreglarlo
- Reducir severidad de reglas de linting
- Marcar [x] sin que el Quality Gate pase

Si hay un error → CORREGIR EL CÓDIGO, no ocultar el error.
