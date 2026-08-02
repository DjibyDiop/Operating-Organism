/**
 * test_kernel.c
 * Automated test for Kernel-Baremetal (Brainstem Scheduler & Dynamic Homeostasis Redistribution)
 */

#include "../include/oo_scheduler.h"
#include "../../united-baremetal/include/united_bus.h"
#include <stdio.h>
#include <assert.h>

void oo_print(const char* msg) {
    printf("%s", msg);
}

static int cortex_calls = 0;
static int immune_calls = 0;

static void dummy_cortex_entry(void) {
    cortex_calls++;
}

static void dummy_immune_entry(void) {
    immune_calls++;
}

int main(void) {
    printf("=== Running Kernel-Baremetal Validation ===\n");
    united_bus_init();
    oo_scheduler_init();

    assert(oo_scheduler_get_state() == OO_STATE_RELAXED);

    oo_scheduler_register_organ(ORGAN_TYPE_CORTEX, dummy_cortex_entry);
    oo_scheduler_register_organ(ORGAN_TYPE_IMMUNE, dummy_immune_entry);

    printf("[Kernel-Baremetal] Running heartbeat in RELAXED state...\n");
    for (int i = 0; i < 5; i++) {
        oo_scheduler_heartbeat();
    }
    assert(cortex_calls > 0);

    printf("[Kernel-Baremetal] Shifting state to COMBAT...\n");
    oo_scheduler_set_state(OO_STATE_COMBAT);
    assert(oo_scheduler_get_state() == OO_STATE_COMBAT);

    for (int i = 0; i < 5; i++) {
        oo_scheduler_heartbeat();
    }
    assert(immune_calls > 0);

    oo_scheduler_set_state(OO_STATE_RELAXED);
    assert(oo_scheduler_get_state() == OO_STATE_RELAXED);

    printf("=== [PASS] Kernel-Baremetal Biological Scheduler & Homeostasis verified ===\n");
    return 0;
}
