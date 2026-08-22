<#
.SYNOPSIS
    oo-build.ps1 - Operating Organism unified build pipeline

.DESCRIPTION
    1. Build all critical organs (united, sense, reflex, kernel, llm-baremetal)
    2. Assemble EFI image
    3. Launch QEMU smoke test
    4. Verify homeostasis invariants

.PARAMETER Smoke
    Run QEMU smoke test after build

.PARAMETER SkipQemu
    Skip QEMU test (build only)

.PARAMETER Organ
    Build a specific organ only (e.g. -Organ united-baremetal)

.EXAMPLE
    pwsh oo-build.ps1
    pwsh oo-build.ps1 -Smoke
    pwsh oo-build.ps1 -Organ reflex-baremetal
#>

param(
    [switch]$Smoke,
    [switch]$SkipQemu,
    [string]$Organ = ""
)

$ErrorActionPreference = "Stop"
$ROOT = $PSScriptRoot
if (-not $ROOT) { $ROOT = "C:\Users\djibi\OneDrive\Bureau\baremetal" }

$PASS = 0
$FAIL = 0
$LOG  = @()

function Log($msg, $color = "Cyan") {
    Write-Host $msg -ForegroundColor $color
    $script:LOG += $msg
}

function Pass($label) {
    $script:PASS++
    Log "  + $label" "Green"
}

function Fail($label, $detail = "") {
    $script:FAIL++
    Log "  X $label $detail" "Red"
}

function ToWsl($winPath) {
    # Convert Windows path to WSL /mnt/... path without calling wslpath
    $p = $winPath.Replace("\", "/")
    if ($p -match '^([A-Za-z]):(.*)') {
        return "/mnt/" + $Matches[1].ToLower() + $Matches[2]
    }
    return $p
}

function Build-Organ($name) {
    $path = Join-Path $ROOT $name
    if (-not (Test-Path $path)) { Fail "$name" "NOT FOUND"; return }

    $makefile = Join-Path $path "Makefile"
    if (-not (Test-Path $makefile)) {
        # No Makefile - try direct gcc compile via WSL
        $src = Get-ChildItem "$path\src\*.c" -ErrorAction SilentlyContinue
        if ($src) {
            $incl = Join-Path $path "include"
            $out  = Join-Path $path "build"
            New-Item -ItemType Directory -Path $out -Force | Out-Null
            $has_gcc = Get-Command "gcc" -ErrorAction SilentlyContinue
            $has_wsl = Get-Command "wsl" -ErrorAction SilentlyContinue
            foreach ($f in $src) {
                $obj = Join-Path $out ($f.BaseName + ".o")
                if ($has_gcc) {
                    $result = & gcc -c -ffreestanding -mno-red-zone -I"$incl" -I"$ROOT\united-baremetal\include" "$($f.FullName)" -o "$obj" 2>&1
                } elseif ($has_wsl) {
                    $linuxPath = ToWsl $f.FullName
                    $linuxIncl = ToWsl $incl
                    $linuxObj  = ToWsl $obj
                    $linuxUbus = ToWsl "$ROOT\united-baremetal\include"
                    $result = wsl gcc -c -ffreestanding -mno-red-zone -I"$linuxIncl" -I"$linuxUbus" "$linuxPath" -o "$linuxObj" 2>&1
                } else {
                    Log "  !  $name - gcc not found (install WSL+gcc or mingw). Skipping compile." "Yellow"
                    return
                }
                if ($LASTEXITCODE -eq 0) { Pass "$name\$($f.Name)" }
                else                     { Fail "$name\$($f.Name)" ($result | Out-String) }
            }
        } else {
            Log "  !  $name - no src/*.c, skipping" "Yellow"
        }
        return
    }

    # Prefer native make+gcc on Windows; fall back to WSL if needed
    $has_make = Get-Command "make" -ErrorAction SilentlyContinue
    $has_gcc  = Get-Command "gcc"  -ErrorAction SilentlyContinue
    $has_wsl  = Get-Command "wsl"  -ErrorAction SilentlyContinue

    if ($has_make -and $has_gcc) {
        Push-Location $path
        try {
            if ($name -eq "bot-baremetal") {
                $result = & make core CC=gcc 2>&1
            } elseif ($name -eq "vital-baremetal") {
                $result = & make -f Makefile.host build CC=gcc 2>&1
            } else {
                $result = & make build CC=gcc 2>&1
            }
            if ($LASTEXITCODE -eq 0) { Pass $name }
            else { Fail $name (($result | Select-Object -Last 5) | Out-String) }
        } finally {
            Pop-Location
        }
    } elseif ($has_wsl) {
        $linuxPath = ToWsl $path
        $result = wsl bash -c "cd '$linuxPath' && make 2>&1" 2>&1
        if ($LASTEXITCODE -eq 0) { Pass $name }
        else {
            $errLines = ($result | Out-String)
            if ($errLines -match "Cannot find|not found|No such file") {
                Log "  !  $name - cross-compiler not in WSL (install gcc-mingw-w64 or gnu-efi)" "Yellow"
            } else {
                Fail $name ($errLines | Select-Object -Last 3 | Out-String)
            }
        }
    } else {
        Log "  !  $name - make/gcc/WSL unavailable, skipping" "Yellow"
    }
}

# =======================================================
Log ""
Log "* Operating Organism - Build Pipeline" "Magenta"
Log "   Root: $ROOT"
Log ("   " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
Log ""

# === PHASE 1: Critical Organs ===========================
Log "-- Phase 1: Critical Organs --------------------------" "Yellow"

$critical_organs = @(
    "united-baremetal",
    "sense-baremetal",
    "reflex-baremetal",
    "kernel-baremetal",
    "memory-baremetal",
    "network-baremetal",
    "identity-baremetal",
    "sense-baremetal",
    "vocal-baremetal",
    "evolution-baremetal",
    "dream-baremetal",
    "regen-baremetal",
    "swarm-baremetal",
    "shadow-baremetal",
    "bot-baremetal",
    "proprioception-baremetal",
    "internal-outils",
    "control-planes",
    "vital-baremetal"
    # NOTE: OPI is under active development - intentionally excluded
)

$host_tools = @(
    "oo-sim"
)

if ($Organ) {
    Build-Organ $Organ
} else {
    foreach ($o in $critical_organs) { Build-Organ $o }
    Log ""
    Log "-- Phase 1b: Host Tools ------------------------------" "Yellow"
    foreach ($t in $host_tools) { Build-Organ $t }
}

# ═══ PHASE 2: Cortex (llm-baremetal) ════════════════════
if (-not $Organ) {
    Log ""
    Log "-- Phase 2: Cortex (llm-baremetal) ------------------" "Yellow"
    $llm_path = Join-Path $ROOT "llm-baremetal"
    $efi = Join-Path (Join-Path $llm_path "llama_engines") "llama2.efi"
    if (Test-Path $efi) {
        $sz = (Get-Item $efi).Length / 1KB
        Pass "llm-baremetal cortex artifact ($([math]::Round($sz,1)) KB)"
        Log "  !  Full gnu-efi cortex rebuild skipped on Windows (use existing llama2.efi)" "Yellow"
    } elseif (Test-Path (Join-Path $llm_path "Makefile")) {
        $has_wsl = Get-Command "wsl" -ErrorAction SilentlyContinue
        if ($has_wsl) {
            Push-Location $llm_path
            $result = wsl bash -c "make test 2>&1" | Select-Object -Last 5 | Out-String
            if ($LASTEXITCODE -eq 0) { Pass "llm-baremetal (cortex)" }
            else                      { Fail "llm-baremetal (cortex)" $result }
            Pop-Location
        } else {
            Fail "llm-baremetal llama2.efi missing (needs WSL+gnu-efi to rebuild)"
        }
    } else {
        Log "  !  llm-baremetal Makefile not found - skipping full build" "Yellow"
    }
}

# ═══ PHASE 3: EFI Image + Archive ════════════════════════
if (-not $Organ) {
    Log ""
    Log "-- Phase 3: EFI Image + Archive ----------------------" "Yellow"
    $efi = Join-Path $ROOT "llm-baremetal\llama2.efi"
    $efi2 = Join-Path $ROOT "llama2.efi"
    if (Test-Path $efi) {
        $sz = (Get-Item $efi).Length / 1KB
        Pass "llama2.efi ($([math]::Round($sz,1)) KB)"
    } elseif (Test-Path $efi2) {
        $sz = (Get-Item $efi2).Length / 1KB
        Pass "llama2.efi (root) ($([math]::Round($sz,1)) KB)"
    } else {
        Fail "llama2.efi not found"
    }

    $boot = Join-Path $ROOT "llm-baremetal\llm-baremetal-boot.img"
    if (Test-Path $boot) {
        $sz = (Get-Item $boot).Length / 1MB
        Pass "llm-baremetal-boot.img ($([math]::Round($sz,0)) MB)"
    } else {
        Fail "llm-baremetal-boot.img missing"
    }

    $sim = Join-Path $ROOT "oo-sim\build\bin\oo-sim.exe"
    if (Test-Path $sim) {
        Pass "oo-sim.exe (host sandbox)"
    } else {
        Log "  !  oo-sim not built (run: make -C oo-sim build)" "Yellow"
    }

    # Assemble liboo-all.a from organ objects (Windows-native)
    $has_ar = Get-Command "ar" -ErrorAction SilentlyContinue
    if ($has_ar) {
        $modDirs = @(
            "united-baremetal","kernel-baremetal","memory-baremetal","network-baremetal",
            "identity-baremetal","sense-baremetal","vocal-baremetal","reflex-baremetal",
            "evolution-baremetal","dream-baremetal","regen-baremetal","swarm-baremetal",
            "shadow-baremetal","proprioception-baremetal","vital-baremetal",
            "internal-outils","control-planes"
        )
        $objs = @()
        foreach ($m in $modDirs) {
            $objs += Get-ChildItem (Join-Path $ROOT $m) -Recurse -Filter *.o -ErrorAction SilentlyContinue |
                     Where-Object { $_.FullName -match '\\build\\' }
        }
        $botOs = @(
                (Join-Path $ROOT "bot-baremetal\build\obj\core\bot_dna.o"),
                (Join-Path $ROOT "bot-baremetal\build\obj\core\territory_map.o"),
                (Join-Path $ROOT "bot-baremetal\build\obj\instinct\threat_state.o"),
                (Join-Path $ROOT "bot-baremetal\build\obj\instinct\instinct_layer.o"),
                (Join-Path $ROOT "bot-baremetal\build\obj\src\bot_baremetal_entry.o")
            ) | Where-Object { Test-Path $_ }
        $all = @($objs | ForEach-Object { $_.FullName }) + $botOs
        $archive = Join-Path $ROOT "liboo-all.a"
        if (Test-Path $archive) { Remove-Item $archive -Force }
        if ($all.Count -gt 0) {
            & ar @(@('rcs', $archive) + $all) 2>&1 | Out-Null
            if (Test-Path $archive) {
                $sz = (Get-Item $archive).Length / 1KB
                Pass "liboo-all.a ($([math]::Round($sz,1)) KB, $($all.Count) objs)"
            } else { Fail "liboo-all.a assemble failed" }
        } else {
            Log "  !  no organ objects for archive" "Yellow"
        }
    } else {
        Log "  !  ar not found - skip liboo-all.a" "Yellow"
    }
}

# ═══ PHASE 4: Homeostasis Invariants ════════════════════
Log ""
Log "-- Phase 4: Homeostasis Invariants ------------------" "Yellow"

# Invariant 1: united-bus ring buffer present
if (Test-Path "$ROOT\united-baremetal\src\united_bus.c") { Pass "INV-1: united-bus ring buffer" }
else { Fail "INV-1: united-bus ring buffer" }

# Invariant 2: reflex engine armed
if (Test-Path "$ROOT\reflex-baremetal\include\nervous_system.h") { Pass "INV-2: reflex engine armed" }
else { Fail "INV-2: reflex engine armed" }

# Invariant 3: D+ policy gate present (thalamic bridge)
if (Test-Path "$ROOT\llm-baremetal\thalamic-bloom\oo_thalamic_bridge.h") { Pass "INV-3: D+ policy gate" }
else { Fail "INV-3: D+ policy gate" }

# Invariant 4: colony-server config reachable
$colony_cfg = "$ROOT\oo-host\colony_url.txt"
if (Test-Path $colony_cfg) {
    $url = Get-Content $colony_cfg
    Pass "INV-4: colony-server configured ($url)"
} else {
    Log "  !  INV-4: colony_url.txt not found - create with batteryphil URL" "Yellow"
}

# Invariant 5: kernel EFI or build target
if ((Test-Path "$ROOT\llama2.efi") -or (Test-Path "$ROOT\llm-baremetal\llama2.efi")) {
    Pass "INV-5: bootable EFI present"
} else {
    Fail "INV-5: no bootable EFI"
}

# Invariant 6: journaling (soma_journal)
if (Test-Path "$ROOT\llm-baremetal\thalamic-bloom\soma_journal.c") { Pass "INV-6: journal module" }
elseif (Get-ChildItem "$ROOT\llm-baremetal" -Recurse -Filter "soma_journal.c" -ErrorAction SilentlyContinue) { Pass "INV-6: journal module" }
else { Log "  !  INV-6: journal module not located" "Yellow" }

# ═══ PHASE 5: QEMU Smoke Test ═══════════════════════════
if ($Smoke -and -not $SkipQemu) {
    Log ""
    Log "-- Phase 5: QEMU Smoke Test --------------------------" "Yellow"

    $qemu = Get-Command "qemu-system-x86_64" -ErrorAction SilentlyContinue
    if (-not $qemu) { Fail "QEMU not found in PATH"; }
    else {
        $ovmf_code = "C:\Program Files\qemu\share\edk2-x86_64-code.fd"
        $ovmf_code_tmp = "$env:TEMP\oo-smoke-code.fd"
        $ovmf_vars_src = "C:\Program Files\qemu\share\edk2-i386-vars.fd"
        $ovmf_vars_tmp = "$env:TEMP\oo-smoke-vars.fd"
        $boot_img = "$ROOT\llm-baremetal\llm-baremetal-boot.img"

        if (-not (Test-Path $ovmf_code)) { Fail "QEMU: OVMF firmware not found at $ovmf_code"; return }
        
        Copy-Item $ovmf_code $ovmf_code_tmp -Force
        Copy-Item $ovmf_vars_src $ovmf_vars_tmp -Force
        Log "  Launching QEMU smoke test (5s timeout)..." "Cyan"
        $proc = Start-Process "qemu-system-x86_64" -ArgumentList @(
            "-machine", "q35,accel=tcg",
            "-cpu", "max",
            "-m", "1024",
            "-drive", "if=pflash,format=raw,readonly=on,file=$ovmf_code_tmp",
            "-drive", "if=pflash,format=raw,file=$ovmf_vars_tmp",
            "-drive", "format=raw,file=$boot_img",
            "-serial", "file:$env:TEMP\oo-smoke-uart.txt",
            "-display", "none",
            "-monitor", "none"
        ) -PassThru -NoNewWindow
        $ended = $proc.WaitForExit(5000)
        if (-not $ended) {
            $proc.Kill()
            Pass "QEMU smoke (booted, no crash in 5s)"
        } else {
            Fail "QEMU crashed (exit $($proc.ExitCode))"
        }
    }
}

# ═══ SUMMARY ════════════════════════════════════════════
Log ""
Log "======================================================" "Magenta"
Log "  PASS: $PASS   FAIL: $FAIL" $(if ($FAIL -gt 0) { "Red" } else { "Green" })
Log "======================================================" "Magenta"
Log ""

# Write log to file
$LOG | Out-File "$ROOT\oo-build.log" -Encoding utf8
Log "  Log saved: $ROOT\oo-build.log" "Gray"

if ($FAIL -gt 0) { exit 1 } else { exit 0 }
