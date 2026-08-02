<#
.SYNOPSIS
    oo-automate.ps1 — Operating Organism CI/CD Automation (95%)

.DESCRIPTION
    Automatise la compilation, les tests, l'archivage, et le git sync
    de l'ensemble du projet Operating Organism.

    Actions:
      build   — Compile tous les organes + cortex
      status  — Rapport de santé complet
      archive — Assemble liboo-all.a
      git     — Add + commit + push tous les changements
      full    — Tout d'un coup (build + archive + status + git)

.PARAMETER Action
    L'action à exécuter (build, status, archive, git, full)

.PARAMETER Message
    Message de commit git (pour l'action 'git')

.EXAMPLE
    pwsh oo-automate.ps1 -Action build
    pwsh oo-automate.ps1 -Action full -Message "Unification Phase 2 complete"
#>

param(
    [ValidateSet("build","status","archive","git","full")]
    [string]$Action = "status",
    [string]$Message = "OO: Automated commit — $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$ErrorActionPreference = "Stop"
$ROOT = $PSScriptRoot
if (-not $ROOT) { $ROOT = "C:\Users\djibi\OneDrive\Bureau\baremetal" }

$PASS = 0; $FAIL = 0; $WARN = 0

function OK($msg) { $script:PASS++; Write-Host "  ✅ $msg" -ForegroundColor Green }
function ERR($msg) { $script:FAIL++; Write-Host "  ❌ $msg" -ForegroundColor Red }
function SKIP($msg) { $script:WARN++; Write-Host "  ⚠️  $msg" -ForegroundColor Yellow }
function LOG($msg, $c = "Cyan") { Write-Host $msg -ForegroundColor $c }

# ═══ ACTION: STATUS ═══════════════════════════════════════════════
function Do-Status {
    LOG ""
    LOG "╔═══════════════════════════════════════════════════════╗" Magenta
    LOG "║     🧬 Operating Organism — Health Report 🧬          ║" Magenta
    LOG "╚═══════════════════════════════════════════════════════╝" Magenta
    LOG ""

    $organs = @(
        "united-baremetal", "kernel-baremetal", "memory-baremetal",
        "network-baremetal", "identity-baremetal", "sense-baremetal",
        "vocal-baremetal", "reflex-baremetal", "evolution-baremetal",
        "dream-baremetal", "regen-baremetal", "swarm-baremetal",
        "shadow-baremetal", "bot-baremetal", "vital-baremetal",
        "proprioception-baremetal", "internal-outils"
    )

    LOG "── Biological Organs ──────────────────────────────────" Yellow
    foreach ($o in $organs) {
        $src = Get-ChildItem "$ROOT\$o\src\*.c" -ErrorAction SilentlyContinue
        $obj = Get-ChildItem "$ROOT\$o\build\*.o" -ErrorAction SilentlyContinue
        $srcN = if ($src) { $src.Count } else { 0 }
        $objN = if ($obj) { $obj.Count } else { 0 }
        if ($objN -gt 0) { OK "$o ($objN objects / $srcN sources)" }
        elseif ($srcN -gt 0) { SKIP "$o (not built — $srcN sources)" }
        else { ERR "$o (empty)" }
    }

    LOG ""
    LOG "── Cortex (llm-baremetal) ─────────────────────────────" Yellow
    $efi = "$ROOT\llm-baremetal\llama2.efi"
    if (Test-Path $efi) {
        $sz = [math]::Round((Get-Item $efi).Length / 1KB, 1)
        OK "llama2.efi [$sz KB]"
    } else { ERR "llama2.efi [not built]" }

    LOG ""
    LOG "── OPI Cognitive Kernel ───────────────────────────────" Yellow
    $opiSrc = Get-ChildItem "$ROOT\OPI\src" -Recurse -Filter "*.c" -ErrorAction SilentlyContinue
    $opiN = if ($opiSrc) { $opiSrc.Count } else { 0 }
    LOG "  Sources: $opiN C files"

    LOG ""
    LOG "── Control Planes ─────────────────────────────────────" Yellow
    $cpSrc = Get-ChildItem "$ROOT\control-planes\src\*.c" -ErrorAction SilentlyContinue
    $cpN = if ($cpSrc) { $cpSrc.Count } else { 0 }
    LOG "  Sources: $cpN C files"

    LOG ""
    LOG "── Archives ───────────────────────────────────────────" Yellow
    foreach ($a in @("liboo-all.a", "libaether_fabric.a", "libaether_synapse.a")) {
        if (Test-Path "$ROOT\$a") {
            $sz = [math]::Round((Get-Item "$ROOT\$a").Length / 1KB, 1)
            OK "$a [$sz KB]"
        } else { SKIP "$a [missing]" }
    }

    LOG ""
    LOG "── Host Components ────────────────────────────────────" Yellow
    if (Test-Path "$ROOT\colony-server\Cargo.toml") { OK "colony-server (Rust)" } else { ERR "colony-server" }
    if (Test-Path "$ROOT\oo-host\Cargo.toml") { OK "oo-host (Rust)" } else { ERR "oo-host" }
    if (Test-Path "$ROOT\Living_desktop\index.html") { OK "Living_desktop" } else { ERR "Living_desktop" }

    LOG ""
    LOG "── Weak Stubs ─────────────────────────────────────────" Yellow
    $stubs = "$ROOT\llm-baremetal\core\llmk_stubs.c"
    if (Test-Path $stubs) {
        $weakCount = (Get-Content $stubs | Select-String "__attribute__\(\(weak\)\)").Count
        OK "llmk_stubs.c: $weakCount weak functions (ready for organ override)"
    }
}

# ═══ ACTION: BUILD ════════════════════════════════════════════════
function Do-Build {
    LOG ""
    LOG "▶ Building all organs..." Magenta
    & "$ROOT\oo-build.ps1"
}

# ═══ ACTION: ARCHIVE ══════════════════════════════════════════════
function Do-Archive {
    LOG ""
    LOG "▶ Assembling liboo-all.a..." Magenta
    $has_wsl = Get-Command "wsl" -ErrorAction SilentlyContinue
    if ($has_wsl) {
        $wslRoot = $ROOT.Replace("\", "/")
        if ($wslRoot -match '^([A-Za-z]):(.*)') {
            $wslRoot = "/mnt/" + $Matches[1].ToLower() + $Matches[2]
        }
        wsl bash -c "cd '$wslRoot' && make archive 2>&1"
        if ($LASTEXITCODE -eq 0) { OK "liboo-all.a assembled" }
        else { ERR "archive failed" }
    } else { SKIP "WSL not available — cannot assemble archive" }
}

# ═══ ACTION: GIT ══════════════════════════════════════════════════
function Do-Git {
    LOG ""
    LOG "▶ Git sync..." Magenta

    Push-Location $ROOT

    # Add all changes
    git add -A 2>&1 | Out-Null
    OK "git add -A"

    # Check if there are changes
    $status = git status --porcelain 2>&1
    if (-not $status) {
        LOG "  Nothing to commit — working tree clean" Green
        Pop-Location
        return
    }

    $changes = ($status | Measure-Object).Count
    LOG "  $changes file(s) changed"

    # Commit
    git commit -m $Message 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { OK "git commit: $Message" }
    else { SKIP "git commit failed (maybe no changes)" }

    # Push
    git push 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { OK "git push" }
    else { SKIP "git push failed (check remote)" }

    Pop-Location
}

# ═══ DISPATCH ═════════════════════════════════════════════════════
LOG ""
LOG "🧬 Operating Organism — Automation Pipeline" Magenta
LOG "   Root: $ROOT"
LOG ("   " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
LOG "   Action: $Action"
LOG ""

switch ($Action) {
    "build"   { Do-Build }
    "status"  { Do-Status }
    "archive" { Do-Archive }
    "git"     { Do-Git }
    "full"    { Do-Build; Do-Archive; Do-Status; Do-Git }
}

# ═══ SUMMARY ═════════════════════════════════════════════════════
LOG ""
LOG "══════════════════════════════════════════════════════" Magenta
$color = if ($FAIL -gt 0) { "Red" } else { "Green" }
LOG "  PASS: $PASS   WARN: $WARN   FAIL: $FAIL" $color
LOG "══════════════════════════════════════════════════════" Magenta

if ($FAIL -gt 0) { exit 1 } else { exit 0 }
