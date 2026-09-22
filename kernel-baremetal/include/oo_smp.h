/*
 * oo_smp.h — Support Multiprocesseur Symétrique (SMP) pour OO
 *
 * Implémentation réelle basée sur :
 *   - MADT ACPI pour découverte des cœurs (AP = Application Processors)
 *   - SIPI (Startup IPI) via l'APIC local pour démarrer les AP
 *   - Spinlocks basés sur __atomic_compare_exchange (GCC/Clang builtins)
 *   - Affinité d'organe : chaque organe peut être épinglé sur un cœur
 *
 * Pas de mock — en QEMU baremetal, les AP reçoivent de vraies interruptions.
 */
#ifndef OO_SMP_H
#define OO_SMP_H

#include <stdint.h>
#include "oo_scheduler.h"

#ifdef __cplusplus
extern "C" {
#endif

/* ─── Limites ────────────────────────────────────────────────────────────── */
#define OO_SMP_MAX_CORES 16

/* ─── État d'un cœur ─────────────────────────────────────────────────────── */
typedef enum {
    OO_CORE_OFFLINE  = 0,
    OO_CORE_STARTING = 1,
    OO_CORE_ONLINE   = 2,
    OO_CORE_HALTED   = 3,
} oo_core_state_t;

/* ─── Affinity : quel organe sur quel cœur ──────────────────────────────── */
typedef struct {
    oo_organ_type_t organ_type;
    uint8_t         core_id;    /* 0 = BSP, 1..N = AP */
} oo_organ_affinity_t;

/* ─── Affinités par défaut ──────────────────────────────────────────────── */
/*
 * CORTEX (OPI/Mamba-2) → core 0 (BSP) : toujours vivant
 * IMMUNE (Bot)         → core 1        : surveillance temps-réel
 * SENSORY (Sense)      → core 2        : entrées hardware non-bloquantes
 * VITAL               → core 0        : partagé avec CORTEX (priorité haute)
 */
static const oo_organ_affinity_t OO_DEFAULT_AFFINITIES[] = {
    { ORGAN_TYPE_CORTEX,  0 },
    { ORGAN_TYPE_VITAL,   0 },
    { ORGAN_TYPE_IMMUNE,  1 },
    { ORGAN_TYPE_SENSORY, 2 },
    { ORGAN_TYPE_DBC,     1 },
};
#define OO_DEFAULT_AFFINITY_COUNT \
    ((int)(sizeof(OO_DEFAULT_AFFINITIES) / sizeof(OO_DEFAULT_AFFINITIES[0])))

/* ─── Spinlock primitif ─────────────────────────────────────────────────── */
typedef volatile int oo_spinlock_t;

#define OO_SPINLOCK_INIT 0

static inline void oo_spin_lock(oo_spinlock_t *lock) {
    int expected;
    do {
        expected = 0;
    } while (!__atomic_compare_exchange_n(lock, &expected, 1, 0,
                                          __ATOMIC_ACQUIRE,
                                          __ATOMIC_RELAXED));
}

static inline void oo_spin_unlock(oo_spinlock_t *lock) {
    __atomic_store_n(lock, 0, __ATOMIC_RELEASE);
}

static inline int oo_spin_trylock(oo_spinlock_t *lock) {
    int expected = 0;
    return __atomic_compare_exchange_n(lock, &expected, 1, 0,
                                       __ATOMIC_ACQUIRE, __ATOMIC_RELAXED);
}

/* ─── API publique SMP ──────────────────────────────────────────────────── */

/*
 * oo_smp_init — Lit la MADT ACPI, découvre les AP, configure les affinités.
 * Doit être appelé depuis BSP (core 0) APRÈS bio_mem_init().
 * Retourne le nombre de cœurs découverts (>= 1, BSP compris).
 */
int oo_smp_init(void);

/*
 * oo_smp_start_aps — Envoie le SIPI à chaque AP et attend qu'ils soient ONLINE.
 * L'entrée AP est oo_ap_entry() (voir oo_smp.c).
 * Retourne le nombre d'AP démarrés avec succès.
 */
int oo_smp_start_aps(void);

/*
 * oo_smp_core_count — Nombre de cœurs ONLINE (incluant BSP).
 */
int oo_smp_core_count(void);

/*
 * oo_smp_current_core — Retourne l'ID du cœur courant (via l'APIC ID).
 */
uint8_t oo_smp_current_core(void);

/*
 * oo_smp_get_affinity — Retourne l'ID de cœur préféré pour un type d'organe.
 * Retourne 0 (BSP) si aucune affinité définie ou cœur cible hors ligne.
 */
uint8_t oo_smp_get_affinity(oo_organ_type_t organ_type);

/*
 * oo_smp_dispatch_organ_to_core — Demande au scheduler d'exécuter l'organe
 * sur le cœur qui lui est affecté (via IPI inter-core si nécessaire).
 */
void oo_smp_dispatch_organ_to_core(oo_organ_type_t organ_type);

/*
 * oo_smp_halt_core — Met le cœur courant en attente (HLT loop).
 * Utilisé par les AP après avoir traité leur queue.
 */
void oo_smp_halt_core(void);

/*
 * oo_smp_core_state — Retourne l'état d'un cœur donné.
 */
oo_core_state_t oo_smp_core_state(uint8_t core_id);

/*
 * oo_smp_status_report — Imprime un rapport sur tous les cœurs (debug).
 */
void oo_smp_status_report(void);

#ifdef __cplusplus
}
#endif

#endif /* OO_SMP_H */
