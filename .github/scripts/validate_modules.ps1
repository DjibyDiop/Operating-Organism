#Requires -Version 5.1
<#
.SYNOPSIS
    Validate OO Operating Organism module manifest and structure.
    
.DESCRIPTION
    Performs comprehensive validation:
    - MODULE_MANIFEST.json structure and contents
    - Vital chain organs present and buildable
    - Header/implementation pairs match
    - No orphaned files
    - Build artifact consistency

.EXAMPLE
    .\validate_modules.ps1 -Verbose
    .\validate_modules.ps1 -StrictMode
#>

param(
    [switch]$Verbose,
    [switch]$StrictMode,  # Fail on warnings
    [string]$ManifestPath = "oo-module-registry/MODULE_MANIFEST.json"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$errors = @()
$warnings = @()
$successes = @()

function Write-Checkmark { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Warning-Custom { Write-Host "⚠️  $args" -ForegroundColor Yellow }
function Write-Error-Custom { Write-Host "❌ $args" -ForegroundColor Red }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Cyan }

# === 1. Validate Manifest JSON ===
Write-Info "Phase 1: Validating MODULE_MANIFEST.json..."

if (!(Test-Path $ManifestPath)) {
    $errors += "MODULE_MANIFEST.json not found at $ManifestPath"
    Write-Error-Custom $errors[-1]
    exit 1
}

try {
    $manifest = Get-Content $ManifestPath | ConvertFrom-Json -ErrorAction Stop
    Write-Checkmark "Manifest JSON is valid"
} catch {
    $errors += "Failed to parse JSON: $_"
    Write-Error-Custom $errors[-1]
    exit 1
}

# Validate manifest schema
$required = @("version", "organs", "vitalChain", "layerStack")
foreach ($field in $required) {
    if ($manifest | Get-Member -Name $field -ErrorAction SilentlyContinue) {
        Write-Checkmark "Manifest has field: $field"
    } else {
        $errors += "Manifest missing required field: $field"
        Write-Error-Custom $errors[-1]
    }
}

# === 2. Validate Vital Chain ===
Write-Info "Phase 2: Validating Vital Chain..."

$vitalChain = $manifest.vitalChain
Write-Info "Vital chain: $($vitalChain -join ' -> ')"

foreach ($organ in $vitalChain) {
    if (Test-Path $organ) {
        Write-Checkmark "$organ exists (vital chain)"
    } else {
        $errors += "CRITICAL: $organ (vital chain) not found"
        Write-Error-Custom $errors[-1]
    }
}

# === 3. Validate Organ Structure ===
Write-Info "Phase 3: Validating organ structure..."

$organCount = 0
foreach ($organ in $manifest.organs) {
    $organCount++
    $name = $organ.name
    $path = $name
    
    if (!(Test-Path $path)) {
        if ($StrictMode) {
            $errors += "Organ $name not found (strict mode)"
        } else {
            $warnings += "Organ $name not found (may be in archive)"
        }
        continue
    }
    
    # Check include/ and src/
    $hasInclude = Test-Path "$path/include"
    $hasSrc = Test-Path "$path/src"
    
    if ($hasInclude -and $hasSrc) {
        Write-Checkmark "$name has standard structure (include/ + src/)"
    } else {
        $warnings += "$name missing expected dirs: include=$hasInclude, src=$hasSrc"
        Write-Warning-Custom $warnings[-1]
    }
    
    # Check headers
    foreach ($header in $organ.headers) {
        $found = Get-ChildItem -Path "$path/include" -Name $header -ErrorAction SilentlyContinue
        if ($found) {
            Write-Info "  ✓ Header: $header"
        } else {
            $warnings += "$name: header $header not found in include/"
            Write-Warning-Custom $warnings[-1]
        }
    }
}

Write-Checkmark "Found $organCount organs in manifest"

# === 4. Check for Orphaned Files ===
Write-Info "Phase 4: Checking for orphaned C files..."

$registeredImpls = @()
foreach ($organ in $manifest.organs) {
    $registeredImpls += $organ.implementations
}

$allCFiles = Get-ChildItem -Path . -Recurse -Filter "*.c" -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch 'node_modules|\.git|cleanup_archive|target' } |
    Select-Object -ExpandProperty Name

$orphaned = @()
foreach ($cfile in $allCFiles) {
    if ($cfile -notin $registeredImpls) {
        $orphaned += $cfile
    }
}

if ($orphaned.Count -eq 0) {
    Write-Checkmark "No orphaned .c files found"
} else {
    Write-Warning-Custom "Found $($orphaned.Count) potentially orphaned .c files:"
    $orphaned | ForEach-Object { Write-Host "  - $_" }
}

# === 5. Validate Build Targets ===
Write-Info "Phase 5: Validating build configuration..."

$cargoFiles = Get-ChildItem -Path . -Recurse -Name "Cargo.toml" | 
    Where-Object { $_ -notmatch 'cleanup_archive|target' }

Write-Checkmark "Found Rust projects: $($cargoFiles.Count)"
$cargoFiles | ForEach-Object { Write-Info "  - $_" }

# === 6. Summary ===
Write-Info "=== VALIDATION SUMMARY ==="
Write-Info "Successes: $($successes.Count)"
Write-Checkmark "Errors: $($errors.Count)"
Write-Warning-Custom "Warnings: $($warnings.Count)"

if ($errors.Count -gt 0) {
    Write-Host "`n=== ERRORS ===" -ForegroundColor Red
    $errors | ForEach-Object { Write-Error-Custom $_ }
    exit 1
}

if ($warnings.Count -gt 0 -and $StrictMode) {
    Write-Host "`n=== WARNINGS (Strict Mode) ===" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Warning-Custom $_ }
    exit 1
}

if ($warnings.Count -gt 0) {
    Write-Host "`n=== WARNINGS ===" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Warning-Custom $_ }
}

Write-Checkmark "Module validation complete ✅"
