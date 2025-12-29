# MatStore: Retail OS (2026)

Sistema Operativo de Retail Híbrido, Offline-First y Local-First para LATAM.

---

## 🚀 Inicio Rápido para el Agente IA

Si eres un Agente de IA (Cursor, Windsurf, Antigravity, Devin), sigue este protocolo:

1. **Carga el Contexto:** Lee `PROMPT_PRINCIPAL.md`
2. **Revisa las Reglas:** Internaliza `AGENT_RULES.md`
3. **Ejecuta Auditoría:** `npm run docs:audit`
4. **Si pasa:** Ejecuta la tarea indicada en `ROADMAP.md`
5. **Si falla:** DETENTE y reporta al usuario

> ⚠️ **IMPORTANTE:** Nunca ejecutes tareas si `docs:audit` falla. El script te dará instrucciones de instalación.

---

## 🏗 Arquitectura

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15 + Tauri v2 (Escritorio) |
| Local DB | RxDB (IndexedDB) |
| Sincronización | Replicación hacia Supabase |
| Backend | Supabase (PostgreSQL) + Edge Functions |

---

## 📂 Estructura del Proyecto

```
MATSTORE/
├── PROMPT_PRINCIPAL.md      # Instrucciones maestras para el Agente
├── ROADMAP.md               # Plan de ejecución (tareas atómicas)
├── AGENT_RULES.md           # Dogmas de comportamiento
├── README.md                # Este archivo
├── package.json             # Scripts npm
│
├── docs/
│   ├── 01_vision.md         # Vol I - Filosofía y Alcance
│   ├── 02_datos.md          # Vol II - ERD y Esquemas
│   ├── 03_funcional.md      # Vol III - Requerimientos Funcionales
│   ├── 04_EspecificacionesTecnicas.md  # Vol IV - Stack
│   ├── 05_Acabados-UX-UI.md # Vol V - UX/UI y Gamificación
│   ├── PREREQUISITES.md     # Prerrequisitos del sistema
│   └── CURRENT_STATE.md     # Estado actual del proyecto
│
└── scripts/
    └── docs-audit.js        # "El Capataz" - Verificador de integridad
```

---

## 🛠 Comandos Disponibles

```bash
npm run docs:audit   # Verificar integridad y prerrequisitos
npm run dev          # Iniciar servidor de desarrollo
npm run tauri dev    # Iniciar modo escritorio (requiere Rust)
```

---

## 📋 Estado del Proyecto

- **Fase Actual:** 0 - Fundaciones
- **Progreso:** Ver `npm run docs:audit` para detalles
- **Próximo paso:** Instalar Rust y dependencias GTK (ver `docs/PREREQUISITES.md`)
