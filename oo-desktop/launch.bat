@echo off
echo Starting oo-desktop...
if exist "..\oo-run.ps1" (
  powershell -ExecutionPolicy Bypass -File "..\oo-run.ps1"
) else (
  echo No ..\oo-run.ps1 found. See README.md
)
