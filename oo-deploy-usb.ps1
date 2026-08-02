param (
    [Parameter(Mandatory=$true)]
    [string]$DriveLetter
)

$targetPath = "C:\Users\djibi\OneDrive\Bureau\baremetal\llm-baremetal\llama2.efi"

if (-Not (Test-Path "$($DriveLetter):\")) {
    Write-Host "Erreur: Le lecteur $($DriveLetter):\ n'existe pas." -ForegroundColor Red
    exit 1
}

$efiPath = "$($DriveLetter):\EFI\BOOT"
if (-Not (Test-Path $efiPath)) {
    New-Item -ItemType Directory -Force -Path $efiPath | Out-Null
    Write-Host "Dossier $efiPath créé." -ForegroundColor Cyan
}

$destinationFile = "$efiPath\BOOTX64.EFI"
Write-Host "Déploiement de l'Organisme (llama2.efi) vers $destinationFile ..." -ForegroundColor Cyan
Copy-Item -Path $targetPath -Destination $destinationFile -Force

Write-Host "Le déploiement est terminé ! La clé USB est prête." -ForegroundColor Green
Write-Host "------------------------------------------------------"
Write-Host "Instructions pour l'Éveil matériel :" -ForegroundColor Yellow
Write-Host "1. Débranche la clé et branche-la sur le vrai PC cible."
Write-Host "2. Allume le PC et rentre dans le BIOS/UEFI."
Write-Host "3. IMPORTANT : Désactive le 'Secure Boot' (l'Organisme n'est pas signé numériquement par Microsoft)."
Write-Host "4. Modifie l'ordre de démarrage pour booter sur la clé USB (UEFI OS)."
Write-Host "5. Observe la naissance."
