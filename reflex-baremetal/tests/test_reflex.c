/**
 * test_reflex.c
 * Automated test suite for reflex-baremetal (Spinal Cord / IDT reflex actions)
 */

#include "../include/nervous_system.h"
#include "../../united-baremetal/include/united_bus.h"
#include <stdio.h>
#include <assert.h>

void oo_print(const char* msg) {
    printf("%s", msg);
}

void cpu_halt(void) {
    printf("[ReflexStub] cpu_halt called.\n");
}

static int custom_reflex_fired = 0;
void test_custom_action(void) {
    custom_reflex_fired = 1;
}

int main(void) {
    printf("=== Running Reflex-Baremetal Validation ===\n");
    united_bus_init();
    reflex_init();

    reflex_status_t status = reflex_get_status();
    assert(status.armed_count == 3);

    printf("[Reflex] Testing custom reflex binding and triggering...\n");
    reflex_bind_action(0x10, test_custom_action);
    reflex_trigger(0x10);
    assert(custom_reflex_fired == 1);

    status = reflex_get_status();
    assert(status.triggered_count == 1);
    assert(status.last_vector == 0x10);

    printf("[Reflex] Testing thermal critical check (temp=90C)...\n");
    reflex_thermal_check(90);

    globule_t buf[4];
    int n = united_bus_absorb(ORGAN_CORTEX, buf, 4);
    assert(n > 0);

    printf("=== [PASS] Reflex-Baremetal Spinal Cord & Hardware Reflexes verified ===\n");
    return 0;
}
