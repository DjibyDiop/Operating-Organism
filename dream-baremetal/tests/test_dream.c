/**
 * test_dream.c
 * Automated test for Phase 6 Dream Mode (Idle-Time Learning)
 */

#include "../include/dream_baremetal.h"
#include "../../united-baremetal/include/united_bus.h"
#include <stdio.h>
#include <assert.h>

void oo_print(const char* msg) {
    printf("%s", msg);
}

int main(void) {
    printf("=== Running Dream-Baremetal Phase 6 Validation ===\n");
    united_bus_init();

    // Pump events directed to DREAM_ORGAN_ID (7)
    globule_t evt1;
    evt1.type = GLOBULE_RED;
    evt1.source_organ = 2; // Cortex
    evt1.target_organ = 7; // Dream
    evt1.payload_addr = 0;
    evt1.payload_size = 64;
    united_bus_pump(evt1);

    globule_t evt2;
    evt2.type = GLOBULE_WHITE;
    evt2.source_organ = 1; // Immune
    evt2.target_organ = 7; // Dream
    evt2.payload_addr = 0;
    evt2.payload_size = 32;
    united_bus_pump(evt2);

    assert(dream_get_sleep_cycles() == 0);
    assert(dream_get_consolidated_count() == 0);

    // Trigger Sleep Learning compaction
    trigger_diop_sleep_learning();

    assert(dream_get_sleep_cycles() == 1);
    assert(dream_get_consolidated_count() >= 2);

    printf("=== [PASS] Dream-Baremetal Phase 6 Idle-Time Learning verified ===\n");
    return 0;
}
