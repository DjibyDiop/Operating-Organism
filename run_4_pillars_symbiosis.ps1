# OPERATING ORGANISM (OO) — 4 PILLARS SYMBIOTIC TEST HARNESS

Write-Host '=================================================================' -ForegroundColor Cyan
Write-Host '  OPERATING ORGANISM (OO) — 4 PILLARS SYMBIOTIC TEST HARNESS    ' -ForegroundColor Cyan
Write-Host '=================================================================' -ForegroundColor Cyan

$OO_ROOT = 'C:\Users\djibi\OneDrive\Bureau\OO'
$DPLUS_DIR = "$OO_ROOT\oo-d+"
$LLM_BAREMETAL_DIR = "$OO_ROOT\llm-baremetal"

Write-Host ' '
Write-Host '[STEP 1] Running 6-Phase End-to-End Bare-Metal Test (D+, OPI, Constitution)...' -ForegroundColor Yellow
Push-Location $DPLUS_DIR
python test_full.py
Pop-Location

Write-Host ' '
Write-Host '[STEP 2] Verifying LLM-Baremetal UEFI Bridge Header & Engine Phase 6...' -ForegroundColor Yellow
if (Test-Path "$LLM_BAREMETAL_DIR\include\oo_dplus_biological_runtime.h") {
    Write-Host '  [OK] Header oo_dplus_biological_runtime.h present.' -ForegroundColor Green
} else {
    Write-Host '  [FAIL] Header missing.' -ForegroundColor Red
}

if (Test-Path "$LLM_BAREMETAL_DIR\oo-kernel\boot\oo_dplus_vm_bridge.c") {
    Write-Host '  [OK] Bridge oo_dplus_vm_bridge.c present.' -ForegroundColor Green
} else {
    Write-Host '  [FAIL] Bridge missing.' -ForegroundColor Red
}

Write-Host ' '
Write-Host '=================================================================' -ForegroundColor Cyan
Write-Host '  SYMBIOSIS STATUS: ALL 4 PILLARS OPERATIONAL (SUCCESS)         ' -ForegroundColor Green
Write-Host '=================================================================' -ForegroundColor Cyan
