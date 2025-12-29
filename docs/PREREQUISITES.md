PRE-REQUISITOS DEL SISTEMA MATSTORE (Entorno WSL/Linux)

Para garantizar la ejecución exitosa de los scripts de automatización, el entorno de desarrollo debe cumplir con lo siguiente.

═══════════════════════════════════════════════════════════════════════════════
FASE 0: FUNDACIONES (Next.js + Tauri)
═══════════════════════════════════════════════════════════════════════════════

0.1a Verificación de Entorno (Rust & System)
---------------------------------------------

Rust (Cargo): Requerido para compilar el backend de Tauri.
  - Comando de verificación: cargo --version
  - Instalación: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

Dependencias de Sistema (Linux/WSL): Necesarias para compilar WebView2 y ventanas GTK.
  - Paquetes (Debian/Ubuntu): 
    build-essential, libssl-dev, libgtk-3-dev, libayatana-appindicator3-dev, 
    librsvg2-dev, libwebkit2gtk-4.0-dev
  - Comando de instalación:
    sudo apt-get update && sudo apt-get install -y \
      libwebkit2gtk-4.0-dev build-essential curl wget file \
      libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev

0.1b Inicialización Next.js
---------------------------

Node.js: Versión LTS o superior (v18.17+ o v20+).
  - Comando: node -v

npm: Gestor de paquetes.
  - Comando: npm -v

0.1c Inicialización Tauri
-------------------------

Tauri CLI: Se instala vía npm, no requiere pre-instalación.
  - Comando post-instalación: npx tauri --version

═══════════════════════════════════════════════════════════════════════════════
FASE 1: MOTOR DE DATOS
═══════════════════════════════════════════════════════════════════════════════

Docker (Opcional pero recomendado): Para correr instancias locales de Supabase.
  - Comando: docker --version

═══════════════════════════════════════════════════════════════════════════════
ESTADO ACTUAL DEL ENTORNO
═══════════════════════════════════════════════════════════════════════════════

[x] Node.js - Instalado
[x] npm - Instalado
[x] Docker - Instalado
[ ] Rust (Cargo) - PENDIENTE
[ ] Dependencias GTK/WebKit - PENDIENTE
