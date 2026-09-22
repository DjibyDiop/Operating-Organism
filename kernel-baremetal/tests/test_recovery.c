/*
 * test_recovery.c — Validation test for autonomic recovery & self-healing
 */

#include <stdio.h>
#include <assert.h>
#include "../include/oo_scheduler.h"
#include "../include/oo_recovery.h"

void oo_print(const char *msg) {
    printf("%s", msg);
}

int main(void) {
    printf("=== [TEST] OO Kernel Baremetal Recovery & Self-Healing Test ===\n");

    oo_scheduler_init();
    oo_recovery_init();

    assert(oo_scheduler_get_state() == OO_STATE_RELAXED);

    /* 1. Simulate a thermal panic injection */
    printf("  [Test] Injecting thermal panic...\n");
    oo_recovery_handle(OO_RECOVERY_REASON_THERMAL_PANIC);

    oo_recovery_stats_t stats = oo_recovery_get_stats();
    assert(stats.total_recoveries == 1);
    assert(stats.last_reason == OO_RECOVERY_REASON_THERMAL_PANIC);
    assert(oo_scheduler_get_state() == OO_STATE_VIGILANT);

    /* 2. Run maintenance loop steps to restore homeostasis */
    for (int i = 0; i < 300; i++) {
        oo_maintenance_step();
    }

    /* 3. Simulate memory pressure */
    printf("  [Test] Injecting memory pressure...\n");
    oo_recovery_handle(OO_RECOVERY_REASON_MEMORY_PRESSURE);

    stats = oo_recovery_get_stats();
    assert(stats.total_recoveries == 2);
    assert(stats.last_reason == OO_RECOVERY_REASON_MEMORY_PRESSURE);

    printf("=== [SUCCESS] Recovery & Self-Healing Validation PASSED ===\n");
    return 0;
}
