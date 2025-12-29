#!/usr/bin/env node
/**
 * MATSTORE Quality Keeper v4.1 - "El Capataz con Visión de Infraestructura"
 * =========================================================================
 *
 * MEJORAS v4.1:
 * - Infrastructure Aware: Verifica credenciales de Supabase para Fase 1
 * - Quality Gates: Pruebas de regresión para tareas completadas
 * - Just-In-Time Prerequisites: Solo verifica lo que necesita la siguiente tarea
 *
 * FILOSOFÍA: No confiar en checkboxes. Verificar que el trabajo funciona.
 *            No dejar que el agente toque datos sin las llaves del reino.
 *
 * Uso: npm run docs:audit
 */

/* eslint-disable no-console */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// ══════════════════════════════════════════════════════════════════════
// COLORES
// ══════════════════════════════════════════════════════════════════════

const C = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

const log = {
  error: (msg) => console.log(`${C.red}❌ ${msg}${C.reset}`),
  ok: (msg) => console.log(`${C.green}✅ ${msg}${C.reset}`),
  warn: (msg) => console.log(`${C.yellow}⚠️  ${msg}${C.reset}`),
  info: (msg) => console.log(`${C.cyan}ℹ️  ${msg}${C.reset}`),
  header: (msg) => console.log(`\n${C.yellow}═══ ${msg} ═══${C.reset}\n`),
  block: (msg) => console.log(`${C.red}${C.bold}⛔ BLOQUEADO: ${msg}${C.reset}`),
};

// ══════════════════════════════════════════════════════════════════════
// QUALITY GATES - Pruebas para validar tareas completadas
// ══════════════════════════════════════════════════════════════════════

const QUALITY_GATES = {
  '0.1a': {
    name: 'Rust & GTK Environment',
    command: 'cargo --version && pkg-config --libs webkit2gtk-4.0',
    errorMsg: 'Rust o WebKit2GTK no están instalados correctamente.',
  },
  '0.1b': {
    name: 'Next.js Build Integrity',
    command: 'npx tsc --noEmit',
    errorMsg: 'El proyecto Next.js tiene errores de TypeScript.',
  },
  '0.1c': {
    name: 'Tauri Configuration',
    customCheck: () => {
      try {
        const confPath = path.join(process.cwd(), 'src-tauri', 'tauri.conf.json');
        if (!fs.existsSync(confPath)) return false;
        JSON.parse(fs.readFileSync(confPath, 'utf-8'));
        return true;
      } catch {
        return false;
      }
    },
    errorMsg: 'tauri.conf.json no existe o está corrupto.',
  },
  '0.1d': {
    name: 'SSG Configuration',
    customCheck: () => {
      try {
        const configPath = path.join(process.cwd(), 'next.config.ts');
        if (!fs.existsSync(configPath)) return false;
        const content = fs.readFileSync(configPath, 'utf-8');
        return content.includes("output: 'export'") || content.includes('output: "export"');
      } catch {
        return false;
      }
    },
    errorMsg: 'next.config.ts no tiene output: "export" configurado.',
  },
  0.2: {
    name: 'ESLint Rules',
    command: 'npm run lint',
    errorMsg: 'El código viola las reglas de ESLint.',
  },
  1.1: {
    name: 'Supabase Schema',
    customCheck: () => {
      // Verificar que exista el archivo de migración SQL
      const sqlPath = path.join(process.cwd(), 'supabase', 'migrations');
      return fs.existsSync(sqlPath);
    },
    errorMsg: 'No existe carpeta supabase/migrations con esquemas SQL.',
  },
};

// ══════════════════════════════════════════════════════════════════════
// PREREQUISITOS por FASE (Just-In-Time)
// ══════════════════════════════════════════════════════════════════════

const PHASE_PREREQUISITES = {
  // FASE 0: Fundaciones (Rust, Node)
  0: {
    name: 'Fase 0 - Fundaciones',
    checks: [
      {
        name: 'Rust (Cargo)',
        command: 'cargo --version',
        install: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh",
      },
      {
        name: 'Node.js',
        command: 'node --version',
      },
      {
        name: 'WebKit2GTK (Linux)',
        command: 'pkg-config --libs webkit2gtk-4.0',
        install: 'sudo apt-get install -y libwebkit2gtk-4.0-dev',
      },
    ],
  },
  // FASE 1: Motor de Datos (Supabase)
  1: {
    name: 'Fase 1 - Motor de Datos',
    checks: [
      {
        name: 'Archivo .env.local',
        customCheck: () => fs.existsSync('.env.local'),
        install: 'Crear archivo .env.local en la raíz del proyecto',
      },
      {
        name: 'NEXT_PUBLIC_SUPABASE_URL',
        customCheck: () => {
          if (!fs.existsSync('.env.local')) return false;
          const content = fs.readFileSync('.env.local', 'utf-8');
          return content.includes('NEXT_PUBLIC_SUPABASE_URL=');
        },
        install: 'Agregar NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co a .env.local',
      },
      {
        name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        customCheck: () => {
          if (!fs.existsSync('.env.local')) return false;
          const content = fs.readFileSync('.env.local', 'utf-8');
          return content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
        },
        install: 'Agregar NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... a .env.local',
      },
    ],
  },
};

// ══════════════════════════════════════════════════════════════════════
// DOCUMENTOS REQUERIDOS
// ══════════════════════════════════════════════════════════════════════

const REQUIRED_DOCS = [
  'docs/01_vision.md',
  'docs/02_datos.md',
  'docs/03_funcional.md',
  'docs/04_EspecificacionesTecnicas.md',
  'docs/05_Acabados-UX-UI.md',
  'docs/CURRENT_STATE.md',
  'docs/PREREQUISITES.md',
  'PROMPT_PRINCIPAL.md',
  'ROADMAP.md',
  'AGENT_RULES.md',
];

// ══════════════════════════════════════════════════════════════════════
// UTILIDADES
// ══════════════════════════════════════════════════════════════════════

function runCommand(command) {
  try {
    execSync(command, { stdio: 'pipe', shell: true });
    return true;
  } catch {
    return false;
  }
}

function getCommandOutput(command) {
  try {
    return execSync(command, { stdio: 'pipe', shell: true }).toString().trim();
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════════════════════════════════
// 1. AUDITORÍA DOCUMENTAL
// ══════════════════════════════════════════════════════════════════════

function auditDocumentation() {
  log.header('1. INTEGRIDAD DOCUMENTAL');

  const missing = REQUIRED_DOCS.filter((doc) => !fs.existsSync(doc));

  if (missing.length > 0) {
    log.error('Faltan documentos estructurales:');
    missing.forEach((d) => console.log(`   ${C.red}- ${d}${C.reset}`));
    return false;
  }

  log.ok(`Documentación completa (${REQUIRED_DOCS.length} archivos)`);
  return true;
}

// ══════════════════════════════════════════════════════════════════════
// 2. LECTURA DEL ROADMAP
// ══════════════════════════════════════════════════════════════════════

function parseRoadmap() {
  const content = fs.readFileSync('ROADMAP.md', 'utf-8');
  const lines = content.split('\n');

  const completedTasks = [];
  let nextTask = null;
  let nextTaskId = null;
  let pending = 0,
    completed = 0,
    inProgress = 0;

  for (const line of lines) {
    const taskMatch = line.match(/\[([ x/])\]\s*(\d+\.\d+[a-z]?)\.?\s*(.*)/);

    if (taskMatch) {
      const [, status, taskId, description] = taskMatch;

      if (status === 'x') {
        completed++;
        completedTasks.push({ id: taskId, name: description.trim() });
      } else if (status === '/') {
        inProgress++;
      } else {
        pending++;
        if (!nextTask) {
          nextTask = description.trim();
          nextTaskId = taskId;
        }
      }
    }
  }

  return { completedTasks, nextTask, nextTaskId, pending, completed, inProgress };
}

function displayRoadmapStatus(data) {
  log.header('2. ESTADO DEL ROADMAP');

  const { pending, completed, inProgress, nextTask, nextTaskId } = data;
  const total = pending + completed + inProgress;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  console.log(`   📋 Pendientes:   ${pending}`);
  console.log(`   🔄 En progreso:  ${inProgress}`);
  console.log(`   ✅ Completadas:  ${completed}`);
  console.log(`   📊 Progreso:     ${progress}%\n`);

  if (nextTask) {
    log.info(`SIGUIENTE TAREA: [${nextTaskId}]`);
    console.log(`${C.green}   👉 ${nextTask}${C.reset}`);
  } else if (completed === total && total > 0) {
    console.log(`${C.green}🎉 ¡PROYECTO COMPLETADO!${C.reset}`);
  }
}

// ══════════════════════════════════════════════════════════════════════
// 3. REGRESSION TESTS - Quality Gates para tareas completadas
// ══════════════════════════════════════════════════════════════════════

function runRegressionTests(completedTasks) {
  log.header('3. PRUEBAS DE REGRESIÓN (Quality Gates)');

  if (completedTasks.length === 0) {
    console.log(`   ${C.dim}(No hay tareas completadas para verificar)${C.reset}`);
    return true;
  }

  console.log(`   ${C.dim}Verificando estabilidad del trabajo previo...${C.reset}\n`);

  let allPassed = true;
  const failures = [];

  for (const task of completedTasks) {
    const gateKey = Object.keys(QUALITY_GATES).find((k) => task.id.startsWith(k) || task.id === k);

    if (!gateKey) {
      console.log(`   ${C.dim}${task.id}: Sin test definido (skip)${C.reset}`);
      continue;
    }

    const gate = QUALITY_GATES[gateKey];
    process.stdout.write(`   ${task.id} (${gate.name})... `);

    let passed = false;
    try {
      if (gate.customCheck) {
        passed = gate.customCheck();
      } else if (gate.command) {
        passed = runCommand(gate.command);
      }
    } catch {
      passed = false;
    }

    if (passed) {
      console.log(`${C.green}OK${C.reset}`);
    } else {
      console.log(`${C.red}FALLÓ${C.reset}`);
      failures.push({ task, gate });
      allPassed = false;
    }
  }

  if (!allPassed) {
    console.log(
      `\n${C.red}${C.bold}══════════════════════════════════════════════════════════${C.reset}`
    );
    log.block('CÓDIGO BASE INESTABLE');
    console.log(
      `${C.red}${C.bold}══════════════════════════════════════════════════════════${C.reset}\n`
    );

    for (const { task, gate } of failures) {
      console.log(`${C.red}   • [${task.id}] ${gate.name}${C.reset}`);
      console.log(`${C.dim}     Motivo: ${gate.errorMsg}${C.reset}\n`);
    }
  }

  return allPassed;
}

// ══════════════════════════════════════════════════════════════════════
// 4. VERIFICACIÓN DE INFRAESTRUCTURA (Just-In-Time por Fase)
// ══════════════════════════════════════════════════════════════════════

function checkInfrastructure(nextTaskId) {
  log.header('4. VERIFICACIÓN DE INFRAESTRUCTURA');

  if (!nextTaskId) {
    console.log(`   ${C.dim}(No hay tarea pendiente)${C.reset}`);
    return true;
  }

  // Determinar la fase de la siguiente tarea
  const phase = nextTaskId.split('.')[0]; // "0.1a" → "0", "1.2" → "1"
  const prereqs = PHASE_PREREQUISITES[phase];

  if (!prereqs) {
    log.ok(`Fase ${phase} no requiere verificación de infraestructura`);
    return true;
  }

  console.log(`   ${C.cyan}⚡ Verificando entorno para ${prereqs.name}...${C.reset}\n`);

  let allPassed = true;
  const failures = [];

  for (const check of prereqs.checks) {
    let passed = false;

    if (check.customCheck) {
      passed = check.customCheck();
    } else if (check.command) {
      passed = runCommand(check.command);
    }

    if (passed) {
      if (check.command) {
        const output = getCommandOutput(check.command);
        log.ok(`${check.name}: ${output || 'OK'}`);
      } else {
        log.ok(`${check.name}: OK`);
      }
    } else {
      log.error(`${check.name}: NO ENCONTRADO`);
      allPassed = false;
      failures.push(check);
    }
  }

  if (!allPassed) {
    console.log(`\n${C.yellow}Para resolver:${C.reset}\n`);
    for (const check of failures) {
      console.log(`${C.cyan}# ${check.name}:${C.reset}`);
      console.log(`   ${check.install}\n`);
    }
  }

  return allPassed;
}

// ══════════════════════════════════════════════════════════════════════
// 5. AUDITORÍA OFFLINE-FIRST
// ══════════════════════════════════════════════════════════════════════

function auditOfflineFirst() {
  const srcPath = path.join(process.cwd(), 'src');

  log.header('5. AUDITORÍA OFFLINE-FIRST');

  if (!fs.existsSync(srcPath)) {
    console.log(`   ${C.dim}(Omitida - src/ no existe aún)${C.reset}`);
    return true;
  }

  const forbiddenPatterns = [
    { regex: /fetch\s*\(\s*['"`]\/api/g, msg: 'fetch() directo a API' },
    { regex: /axios\.(get|post|put|delete)/g, msg: 'axios directo' },
  ];

  const violations = [];

  function scanFile(filePath) {
    const ext = path.extname(filePath);
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);

    for (const pattern of forbiddenPatterns) {
      if (pattern.regex.test(content)) {
        violations.push({ file: relativePath, reason: pattern.msg });
        pattern.regex.lastIndex = 0;
      }
    }
  }

  function scanDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item.startsWith('.') || item === 'node_modules') continue;
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) scanDir(fullPath);
      else scanFile(fullPath);
    }
  }

  scanDir(srcPath);

  if (violations.length === 0) {
    log.ok('Sin violaciones Offline-First');
    return true;
  }

  log.error(`${violations.length} VIOLACIONES DETECTADAS:`);
  violations.forEach((v) => console.log(`   ${C.red}• ${v.file}: ${v.reason}${C.reset}`));
  return false;
}

// ══════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════

function main() {
  console.log(`\n${C.blue}${C.bold}🛡️  MATSTORE QUALITY KEEPER v4.1${C.reset}`);
  console.log(`${C.dim}   "El Capataz con Visión de Infraestructura"${C.reset}`);
  console.log(`${C.dim}   Directorio: ${process.cwd()}${C.reset}`);

  // 1. Verificar documentación
  const docsOk = auditDocumentation();
  if (!docsOk) {
    log.block('Documentación incompleta');
    process.exit(1);
  }

  // 2. Leer roadmap
  let roadmapData;
  try {
    roadmapData = parseRoadmap();
    displayRoadmapStatus(roadmapData);
  } catch {
    log.block('No se puede leer ROADMAP.md');
    process.exit(1);
  }

  // 3. REGRESSION TESTS - Verificar tareas completadas
  const regressionOk = runRegressionTests(roadmapData.completedTasks);
  if (!regressionOk) {
    log.block('Trabajo previo inestable - repara antes de continuar');
    process.exit(1);
  }

  // 4. Verificar infraestructura para siguiente tarea
  const infraOk = checkInfrastructure(roadmapData.nextTaskId);
  if (!infraOk) {
    log.block('Infraestructura faltante para siguiente tarea');
    process.exit(1);
  }

  // 5. Auditoría Offline-First
  const offlineOk = auditOfflineFirst();

  // Resumen
  log.header('RESULTADO');

  if (docsOk && regressionOk && infraOk && offlineOk) {
    console.log(`${C.green}${C.bold}✅ LUZ VERDE PARA EL AGENTE${C.reset}`);
    console.log(
      `${C.green}   Sistema estable. Puede ejecutar tarea ${roadmapData.nextTaskId || 'siguiente'}.${C.reset}\n`
    );
    process.exit(0);
  } else {
    console.log(`${C.red}${C.bold}❌ SISTEMA INESTABLE${C.reset}`);
    console.log(`${C.red}   Corregir errores antes de continuar.${C.reset}\n`);
    process.exit(1);
  }
}

main();
