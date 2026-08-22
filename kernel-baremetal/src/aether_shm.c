// =============================================================================
// aether_shm — Région Mémoire Persistante (Thanatosion)
// =============================================================================
// En production UEFI : cette région est une page physique dédiée dans le
// fichier aether_shm.bin sur la partition EFI.
// Pour le build natif GCC (hôte/QEMU) : on fournit un buffer statique
// pour que le linker résolve les symboles.
// =============================================================================
#include <stdint.h>
#include "thanatosion.h"

// Buffer statique de 1 MB pour la mémoire persistante (build host)
// Sur l'OS réel, le bootloader mappe aether_shm.bin ici.
uint8_t  aether_shm_region[1024 * 1024] = {0};
uint32_t aether_shm_size = sizeof(aether_shm_region);
