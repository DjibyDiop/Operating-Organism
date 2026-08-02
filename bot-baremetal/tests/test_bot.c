/**
 * test_bot.c
 * Automated test for Bot-Baremetal (Immune System, InstinctLayer & Threat State Escalation)
 */

#include "../include/bot_baremetal.h"
#include "../../united-baremetal/include/united_bus.h"
#include <stdio.h>
#include <assert.h>

void oo_print(const char* msg) {
    printf("%s", msg);
}

int main(void) {
    printf("=== Running Bot-Baremetal Validation ===\n");
    united_bus_init();
    bot_baremetal_init();

    // Initially threat level is 0 (Dormant)
    assert(bot_get_threat_level() == 0);

    // Step 1: DORMANT (0) -> VIGILANCE (1) via memory write exec trigger
    bot_baremetal_trigger(0x01, 1337, 0xFFFF800010000000ULL, 65);
    assert(bot_get_threat_level() == 1);
    printf("[Bot-Baremetal] Escalated to VIGILANCE (1)\n");

    // Step 2: VIGILANCE (1) -> ALERT (2) via memory write exec high-conf trigger
    bot_baremetal_trigger(0x01, 1337, 0xFFFF800010000000ULL, 80);
    assert(bot_get_threat_level() == 2);
    printf("[Bot-Baremetal] Escalated to ALERT (2)\n");

    // Step 3: ALERT (2) -> COMBAT (3) via shellcode signature trigger
    bot_baremetal_trigger(0x03, 1337, 0xFFFF800010000000ULL, 90);
    assert(bot_get_threat_level() == 3);
    printf("[Bot-Baremetal] Escalated to COMBAT (3)\n");

    // Pulse immune cycle
    bot_baremetal_pulse();

    // Step 4: Reset threat level back to DORMANT (0)
    bot_baremetal_reset_threat("Neutralized by test runner");
    assert(bot_get_threat_level() == 0);
    printf("[Bot-Baremetal] Reset to DORMANT (0)\n");

    printf("=== [PASS] Bot-Baremetal Immune System & InstinctLayer verified ===\n");
    return 0;
}
