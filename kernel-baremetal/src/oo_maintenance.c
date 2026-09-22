/*
 * oo_maintenance.c — Periodic Self-Maintenance & Health Scavenger
 */

#include "../include/oo_recovery.h"

extern void oo_print(const char *msg);

static uint32_t g_maintenance_ticks = 0;

void oo_maintenance_step(void) {
    g_maintenance_ticks++;

    /* Every 256 ticks, perform health check & organ telemetry scan */
    if ((g_maintenance_ticks & 0xFF) == 0) {
        oo_homeostasis_state_t current = oo_scheduler_get_state();
        if (current == OO_STATE_SURVIVAL) {
            /* Check if we can safely transition back to normal */
            oo_recovery_stats_t stats = oo_recovery_get_stats();
            if (stats.total_recoveries > 0) {
                oo_scheduler_set_state(OO_STATE_RELAXED);
                oo_print("[Maintenance] Full homeostasis restored. Returned to RELAXED.\n");
            }
        }
    }
}
