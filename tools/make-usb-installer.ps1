#Requires -RunAsAdministrator
<#
.SYNOPSIS
    OO (Operating Organism) — USB Bootable Installer
    Creates a GPT-partitioned FAT32 USB stick that boots OO directly on bare metal.

.DESCRIPTION
    1. Lists all removable disks for selection
    2. Wipes + repartitions selected USB as GPT with EFI System Partition (FAT32)
    3. Copies llama2.efi  → EFI\BOOT\BOOTX64.EFI  (UEFI auto-boot)
    4. Copies model files → \OO\models\
    5. Writes startup.nsh, oo.cfg, README_OO.txt
    6. Prints BIOS setup guide for Secure Boot + UEFI boot order

.PARAMETER DiskNumber
    (Optional) Skip interactive selection and use this disk number directly.
    DANGER: This will ERASE the disk — double check before using.

.PARAMETER SkipModel
    Skip copying large GGUF model files (faster for EFI-only updates).

.EXAMPLE
    # Interactive — recommended
    .\make-usb-installer.ps1

    # Automated (CI / known USB)
    .\make-usb-installer.ps1 -DiskNumber 2 -SkipModel
#>
param(
    [int]$DiskNumber = -1,
    [switch]$SkipModel
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Paths ────────────────────────────────────────────────────────────────────
$REPO_ROOT   = Split-Path $PSScriptRoot -Parent
$EFI_SOURCE  = Join-Path $REPO_ROOT "OPI-baremetal\llama2.efi"
$MODEL_DIR   = Join-Path $REPO_ROOT "OPI-baremetal"
$USB_FILES   = Join-Path $REPO_ROOT "USB-BOOT-FILES"
$STARTUP_NSH = Join-Path $USB_FILES "startup.nsh"
$OO_CFG      = Join-Path $USB_FILES "oo.cfg"

# ── Banner ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ██████╗  ██████╗     ██╗   ██╗███████╗██████╗     ██╗███╗  ██╗███████╗████████╗" -ForegroundColor Cyan
Write-Host "  ██╔═══██╗██╔═══██╗   ██║   ██║██╔════╝██╔══██╗    ██║████╗ ██║██╔════╝╚══██╔══╝" -ForegroundColor Cyan
Write-Host "  ██║   ██║██║   ██║   ██║   ██║███████╗██████╔╝    ██║██╔██╗██║███████╗   ██║   " -ForegroundColor Cyan
Write-Host "  ██║   ██║██║   ██║   ██║   ██║╚════██║██╔══██╗    ██║██║╚████║╚════██║   ██║   " -ForegroundColor Cyan
Write-Host "  ╚██████╔╝╚██████╔╝   ╚██████╔╝███████║██████╔╝    ██║██║ ╚███║███████║   ██║   " -ForegroundColor Cyan
Write-Host "   ╚═════╝  ╚═════╝     ╚═════╝ ╚══════╝╚═════╝     ╚═╝╚═╝  ╚══╝╚══════╝   ╚═╝   " -ForegroundColor Cyan
Write-Host ""
Write-Host "  Operating Organism — Bare-Metal USB Installer" -ForegroundColor White
Write-Host "  Build: $(Get-Date -Format 'yyyy-MM-dd')  EFI: $EFI_SOURCE" -ForegroundColor DarkGray
Write-Host ""

# ── Verify EFI binary exists ─────────────────────────────────────────────────
if (-not (Test-Path $EFI_SOURCE)) {
    Write-Host "[ERROR] llama2.efi not found at: $EFI_SOURCE" -ForegroundColor Red
    Write-Host "        Run 'make' in OPI-baremetal first." -ForegroundColor Yellow
    exit 1
}
$efi_size = (Get-Item $EFI_SOURCE).Length
Write-Host "[OK] EFI binary found: $([math]::Round($efi_size/1MB, 1)) MB" -ForegroundColor Green

# ── List removable disks ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "Available removable disks:" -ForegroundColor Yellow
$removable = Get-Disk | Where-Object { $_.BusType -in @('USB','SD') -or $_.IsRemovable -eq $true }
if ($removable.Count -eq 0) {
    Write-Host "[ERROR] No removable disks found. Plug in your USB drive and retry." -ForegroundColor Red
    exit 1
}
$removable | Format-Table -AutoSize Number, FriendlyName, Size, BusType, PartitionStyle

# ── Disk selection ────────────────────────────────────────────────────────────
if ($DiskNumber -lt 0) {
    Write-Host "WARNING: The selected disk will be COMPLETELY ERASED." -ForegroundColor Red
    $DiskNumber = [int](Read-Host "Enter disk NUMBER to use as OO USB installer")
}

$disk = Get-Disk -Number $DiskNumber -ErrorAction SilentlyContinue
if (-not $disk) {
    Write-Host "[ERROR] Disk $DiskNumber not found." -ForegroundColor Red
    exit 1
}
if (-not ($disk.BusType -in @('USB','SD') -or $disk.IsRemovable)) {
    Write-Host ""
    Write-Host "  !! DISK $DiskNumber appears to be an internal drive !!" -ForegroundColor Red
    Write-Host "  FriendlyName : $($disk.FriendlyName)" -ForegroundColor Red
    Write-Host "  BusType      : $($disk.BusType)" -ForegroundColor Red
    $confirm = Read-Host "  Are you ABSOLUTELY SURE you want to erase it? [type YES to confirm]"
    if ($confirm -ne "YES") { Write-Host "Aborted."; exit 0 }
}

Write-Host ""
Write-Host "Selected: Disk $DiskNumber — $($disk.FriendlyName) ($([math]::Round($disk.Size/1GB,1)) GB)" -ForegroundColor Yellow
$ok = Read-Host "Proceed? All data will be LOST [y/N]"
if ($ok -notmatch '^[yY]') { Write-Host "Aborted."; exit 0 }

# ── Partition & format ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[1/6] Clearing disk $DiskNumber..." -ForegroundColor Cyan
Clear-Disk -Number $DiskNumber -RemoveData -RemoveOEM -Confirm:$false

Write-Host "[2/6] Initializing GPT partition table..." -ForegroundColor Cyan
Initialize-Disk -Number $DiskNumber -PartitionStyle GPT -Confirm:$false

Write-Host "[3/6] Creating EFI System Partition (FAT32, 512 MB)..." -ForegroundColor Cyan
$partition = New-Partition -DiskNumber $DiskNumber -Size 512MB -GptType '{c12a7328-f81f-11d2-ba4b-00a0c93ec93b}' -AssignDriveLetter
Start-Sleep -Seconds 2

$drive = $partition.DriveLetter + ":"
Write-Host "      Assigned drive letter: $drive" -ForegroundColor DarkGray
Format-Volume -DriveLetter $partition.DriveLetter -FileSystem FAT32 -NewFileSystemLabel "OO-BOOT" -Confirm:$false | Out-Null
Write-Host "      Format complete." -ForegroundColor Green

# ── Create directory structure ────────────────────────────────────────────────
Write-Host "[4/6] Creating OO directory structure..." -ForegroundColor Cyan
$dirs = @(
    "$drive\EFI\BOOT",
    "$drive\OO\models",
    "$drive\OO\logs",
    "$drive\OO\lora",
    "$drive\OO\config"
)
foreach ($d in $dirs) { New-Item -ItemType Directory -Path $d -Force | Out-Null }

# ── Copy EFI ──────────────────────────────────────────────────────────────────
Write-Host "[5/6] Copying EFI binary..." -ForegroundColor Cyan
Copy-Item $EFI_SOURCE "$drive\EFI\BOOT\BOOTX64.EFI" -Force
Write-Host "      $([math]::Round($efi_size/1MB,1)) MB → $drive\EFI\BOOT\BOOTX64.EFI" -ForegroundColor Green

# Copy additional EFI (UEFI shell fallback)
$ovmf_shell = Join-Path $REPO_ROOT "tools\Shell.efi"
if (Test-Path $ovmf_shell) {
    Copy-Item $ovmf_shell "$drive\EFI\BOOT\SHELLX64.EFI" -Force
    Write-Host "      UEFI Shell copied as fallback." -ForegroundColor DarkGray
}

# ── Copy model files ──────────────────────────────────────────────────────────
if (-not $SkipModel) {
    Write-Host "[5b] Copying model files..." -ForegroundColor Cyan
    $models = Get-ChildItem $MODEL_DIR -Filter "*.gguf" -Recurse -ErrorAction SilentlyContinue
    $models += Get-ChildItem $MODEL_DIR -Filter "*.bin"  -Recurse -ErrorAction SilentlyContinue |
               Where-Object { $_.Name -notmatch "\.o$" }
    $models += Get-ChildItem $REPO_ROOT -Filter "tokenizer.bin" -ErrorAction SilentlyContinue
    foreach ($m in $models | Select-Object -Unique) {
        $dest = "$drive\OO\models\$($m.Name)"
        if (-not (Test-Path $dest)) {
            Write-Host "      Copying $($m.Name) ($([math]::Round($m.Length/1MB,1)) MB)..." -ForegroundColor DarkGray
            Copy-Item $m.FullName $dest -Force
        }
    }
}

# ── Write startup.nsh ─────────────────────────────────────────────────────────
Write-Host "[6/6] Writing boot scripts and config..." -ForegroundColor Cyan

# Use existing startup.nsh from USB-BOOT-FILES if present, else generate
if (Test-Path $STARTUP_NSH) {
    Copy-Item $STARTUP_NSH "$drive\startup.nsh" -Force
} else {
    @'
@echo -off
echo.
echo  *** OO - Operating Organism ***
echo  Booting bare-metal LLM kernel...
echo.
fs0:\EFI\BOOT\BOOTX64.EFI
'@ | Set-Content "$drive\startup.nsh" -Encoding ASCII
}

# oo.cfg (read by soma_boot.c at startup)
if (Test-Path $OO_CFG) {
    Copy-Item $OO_CFG "$drive\OO\config\oo.cfg" -Force
} else {
    @'
# OO Operating Organism — Boot Configuration
# Parsed by soma_boot.c on first boot

[boot]
model_path  = \OO\models\stories15M.q8_0.gguf
lora_path   = \OO\lora\adapter.bin
log_path    = \OO\logs\OO_UART.log
voice_mode  = 0
debug_level = 1

[llm]
temperature = 0.8
steps       = 256
ctx_size    = 512

[warden]
dplus_threshold = 0.7
thermal_limit   = 85

[self_improve]
lora_rank   = 8
evo_fitness = 75
'@ | Set-Content "$drive\OO\config\oo.cfg" -Encoding ASCII
}

# README on the USB root
@"
OO — Operating Organism
=======================
Build date : $(Get-Date -Format 'yyyy-MM-dd HH:mm')
EFI size   : $([math]::Round($efi_size/1MB,1)) MB

HOW TO BOOT ON A PC
-------------------
1. Insert this USB stick into the target PC.
2. At POST/BIOS screen press F2/F10/DEL to enter UEFI settings.
3. REQUIRED settings:
   - Secure Boot  → DISABLED
   - Boot Mode    → UEFI only (not Legacy/CSM)
   - Fast Boot    → DISABLED (optional but recommended)
4. In Boot Order, move this USB (OO-BOOT) to position 1.
5. Save & Exit — OO will boot automatically.

FIRST BOOT
----------
- REPL prompt appears: OO>
- Type /help for available commands
- Type /lora_status to check LoRA self-improvement state
- Type /thermal to check CPU temperature
- Type /bus_status to see organ bus state
- Type /irq_status to check keyboard IRQ

SELF-IMPROVEMENT
----------------
OO will automatically:
- Learn from your interactions via LoRA adapters (\OO\lora\)
- Log events to \OO\logs\OO_UART.log
- Grow its knowledge base over time

TROUBLESHOOTING
---------------
- Black screen: ensure Secure Boot is OFF and UEFI-only mode
- No keyboard: PS/2 keyboard recommended; USB HID may need BIOS legacy support
- Kernel panic: check BIOS memory settings (disable memory remapping if available)

Source: https://github.com/Djiby-diop/OPI-baremetal
"@ | Set-Content "$drive\README_OO.txt" -Encoding UTF8

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "  ✅  OO USB installer ready on drive $drive" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "  Contents:" -ForegroundColor White
Get-ChildItem "$drive\" -Recurse | Where-Object { -not $_.PSIsContainer } |
    ForEach-Object { Write-Host "    $($_.FullName.Replace($drive,''))  ($([math]::Round($_.Length/1KB,0)) KB)" -ForegroundColor DarkGray }

Write-Host ""
Write-Host "  ┌─────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "  │  BIOS SETTINGS REQUIRED BEFORE BOOT:        │" -ForegroundColor Yellow
Write-Host "  │  • Secure Boot  → DISABLED                  │" -ForegroundColor Yellow
Write-Host "  │  • Boot Mode    → UEFI (no CSM/Legacy)      │" -ForegroundColor Yellow
Write-Host "  │  • Fast Boot    → DISABLED                  │" -ForegroundColor Yellow
Write-Host "  │  • USB in position 1 of boot order          │" -ForegroundColor Yellow
Write-Host "  └─────────────────────────────────────────────┘" -ForegroundColor Yellow
Write-Host ""
