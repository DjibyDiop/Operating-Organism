@echo off
:: ============================================================================
:: YAMAOO ORGANISM LAUNCHER v3.0
:: ============================================================================
:: Lance tous les processus de l'Organisme en parallèle :
::   1. Backend Java (Spring Boot) — Noyau Java + WebSocket + OSHI
::   2. Frontend React (Vite) — Interface visuelle
::   3. Kernel Agent Rust — Agent baremetal hardware (si compilé)
:: ============================================================================

title YamaOO Organism — Initialisation

echo.
echo  ██╗   ██╗ █████╗ ███╗   ███╗ █████╗  ██████╗  ██████╗
echo  ╚██╗ ██╔╝██╔══██╗████╗ ████║██╔══██╗██╔═══██╗██╔═══██╗
echo   ╚████╔╝ ███████║██╔████╔██║███████║██║   ██║██║   ██║
echo    ╚██╔╝  ██╔══██║██║╚██╔╝██║██╔══██║██║   ██║██║   ██║
echo     ██║   ██║  ██║██║ ╚═╝ ██║██║  ██║╚██████╔╝╚██████╔╝
echo     ╚═╝   ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝
echo.
echo  [ORGANISME OPÉRATIONNEL] — Éveil en cours...
echo  ────────────────────────────────────────────────────────
echo.

:: ─── Phase 0 : DIOP Cognitive Gateway (llm-baremetal) ──────────────────────
echo  [0/4] Démarrage du DIOP Gateway (Gateway Cognitif Souverain)...
set DIOP_DIR=%~dp0..\llm-baremetal
if exist "%DIOP_DIR%" (
    cd /d "%DIOP_DIR%"
    start "DIOP-GATEWAY" cmd /k "python -m diop gateway serve --adapter mock"
    echo       ✓ DIOP Gateway en cours d'éveil sur :11434
) else (
    echo       ⚠  llm-baremetal non trouvé. DIOP Gateway indisponible.
)
timeout /t 2 /nobreak > nul

:: ─── Phase 1 : Noyau Java (Spring Boot + WebSocket + OSHI) ─────────────────
echo.
echo  [1/4] Démarrage du Noyau Java (SomaBridge + YRMRegistry + OSHI)...
cd /d "%~dp0backend"
start "YAMA-BACKEND" cmd /k ".\apache-maven-3.9.6\bin\mvn spring-boot:run -q 2>&1"
timeout /t 3 /nobreak > nul
echo       ✓ Noyau Java en cours d'éveil sur :8080

:: ─── Phase 2 : Interface Visuelle React (Vite) ─────────────────────────────
echo.
echo  [2/4] Démarrage du Sensorium Visuel (React + Vite)...
cd /d "%~dp0frontend"
start "YAMA-FRONTEND" cmd /k "npm run dev 2>&1"
timeout /t 2 /nobreak > nul
echo       ✓ Interface visuelle en cours d'éveil sur :5173

:: ─── Phase 3 : Agent Baremetal Rust (optionnel) ────────────────────────────
echo.
echo  [3/4] Recherche de l'agent baremetal Rust...
set AGENT_PATH=%~dp0modules\kernel_agent\target\release\yama-kernel-agent.exe
if exist "%AGENT_PATH%" (
    start "YAMA-KERNEL-AGENT" cmd /k "%AGENT_PATH%"
    echo       ✓ Agent Rust baremetal actif — données hardware réelles
) else (
    echo       ⚠  Agent Rust non compilé. Fallback: OSHI Java (données réelles mais JVM)
    echo          Pour compiler: cd modules\kernel_agent ^&^& cargo build --release
)

:: ─── Attente et ouverture du navigateur ────────────────────────────────────
echo.
echo  ────────────────────────────────────────────────────────
echo  [ORGANISME EN ÉVEIL] Ouverture du Nexus dans 5 secondes...
echo  ────────────────────────────────────────────────────────
timeout /t 5 /nobreak > nul

start "" "http://localhost:5173"

echo.
echo  ██████╗  ██╗ ██████╗ ██████╗
echo  ██╔══██╗ ██║██╔═══██╗██╔══██╗
echo  ██║  ██║ ██║██║   ██║██████╔╝
echo  ██║  ██║ ██║██║   ██║██╔═══╝
echo  ██████╔╝ ██║╚██████╔╝██║
echo  ╚═════╝  ╚═╝ ╚═════╝ ╚═╝     MIND — ACTIF
echo.
echo  L'Organisme est vivant. Nexus disponible sur http://localhost:5173
echo  ────────────────────────────────────────────────────────
pause
