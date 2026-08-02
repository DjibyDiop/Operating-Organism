/**
 * test_shadow.c
 * Automated test for Shadow-Baremetal (Stealth, Camouflage, Necrosis & Panic Purge)
 */

#include "../include/stealth.h"
#include "../../united-baremetal/include/united_bus.h"
#include <stdio.h>
#include <assert.h>

void oo_print(const char* msg) {
    printf("%s", msg);
}

int main(void) {
    printf("=== Running Shadow-Baremetal Validation ===\n");
    united_bus_init();
    shadow_init();

    assert(shadow_get_camouflage_level() == 0);
    assert(shadow_is_purged() == 0);
    assert(shadow_is_dead() == 0);

    shadow_activate_camouflage(8);
    assert(shadow_get_camouflage_level() == 8);

    uint8_t decoy_buffer[16] = {0};
    shadow_necrosis(decoy_buffer, sizeof(decoy_buffer));
    for (size_t i = 1; i < sizeof(decoy_buffer); i++) {
        assert(decoy_buffer[i] != 0); // Decoy filled with non-zero bytes
    }

    shadow_panic_purge();
    assert(shadow_is_purged() == 1);

    shadow_simulate_death();
    assert(shadow_is_dead() == 1);

    printf("=== [PASS] Shadow-Baremetal stealth, camouflage & necrosis verified ===\n");
    return 0;
}
