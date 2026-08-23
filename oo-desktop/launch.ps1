Param(
    [switch]$Debug
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $scriptDir
Write-Output "Starting oo-desktop..."

if (Test-Path "..\oo-run.ps1") {
    Write-Output "Found ../oo-run.ps1 — launching it."
    & "..\oo-run.ps1"
} else {
    Write-Output "No ../oo-run.ps1 found. See README.md for next steps."
}

Pop-Location
