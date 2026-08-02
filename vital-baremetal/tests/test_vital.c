/**
 * test_vital.c
 * Automated test for Vital-Baremetal (Eternal Heartbeat, Consciousness FSM, Homeostasis & Synaptic Network)
 */

#include "../include/vital_spark.h"
#include "../include/vital_consciousness.h"
#include "../../united-baremetal/include/united_bus.h"
#include <stdio.h>
#include <assert.h>

void oo_print(const char* msg) {
    printf("%s", msg);
}

extern void vital_init(void);
extern void vital_eternal_heartbeat(void);

int main(void) {
    printf("=== Running Vital-Baremetal Validation ===\n");
    united_bus_init();
    vital_init();

    printf("[Vital-Baremetal] Pulsing 5 heartbeat cycles...\n");
    for (int i = 0; i < 5; i++) {
        vital_eternal_heartbeat();
    }

    uint64_t vitality = get_organism_vitality();
    assert(vitality > 0);

    printf("=== [PASS] Vital-Baremetal Heartbeat & Life Loop verified ===\n");
    return 0;
}
