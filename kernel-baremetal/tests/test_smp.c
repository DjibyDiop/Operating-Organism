/*
 * test_smp.c — Multi-core SMP validation test for kernel-baremetal
 */

#include <stdio.h>
#include <assert.h>
#include "../include/oo_smp.h"

void oo_print(const char *msg) {
    printf("%s", msg);
}

int main(void) {
    printf("=== [TEST] OO Kernel Baremetal SMP Multi-core Test ===\n");

    int cores = oo_smp_init();
    printf("  Discovered cores: %d\n", cores);
    assert(cores >= 1);

    int started = oo_smp_start_aps();
    printf("  Started AP cores: %d\n", started);
    assert(started >= 0);

    int online = oo_smp_core_count();
    printf("  Online cores: %d\n", online);
    assert(online == cores);

    uint8_t current = oo_smp_current_core();
    printf("  Current core ID: %u\n", (unsigned)current);

    uint8_t cortex_affinity = oo_smp_get_affinity(ORGAN_TYPE_CORTEX);
    uint8_t immune_affinity = oo_smp_get_affinity(ORGAN_TYPE_IMMUNE);
    uint8_t sensory_affinity = oo_smp_get_affinity(ORGAN_TYPE_SENSORY);

    printf("  Affinity map: CORTEX -> Core %u, IMMUNE -> Core %u, SENSORY -> Core %u\n",
           (unsigned)cortex_affinity, (unsigned)immune_affinity, (unsigned)sensory_affinity);

    assert(cortex_affinity == 0);
    assert(immune_affinity == 1);
    assert(sensory_affinity == 2);

    /* Test spinlock */
    oo_spinlock_t lock = OO_SPINLOCK_INIT;
    oo_spin_lock(&lock);
    int trylock_res = oo_spin_trylock(&lock);
    assert(trylock_res == 0); /* Locked already */
    oo_spin_unlock(&lock);

    trylock_res = oo_spin_trylock(&lock);
    assert(trylock_res == 1); /* Succeeded */
    oo_spin_unlock(&lock);

    /* Dispatch test */
    oo_smp_dispatch_organ_to_core(ORGAN_TYPE_IMMUNE);
    oo_smp_dispatch_organ_to_core(ORGAN_TYPE_CORTEX);

    oo_smp_status_report();

    printf("=== [SUCCESS] SMP Multi-core Validation PASSED ===\n");
    return 0;
}
