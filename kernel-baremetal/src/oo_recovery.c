/*
 * oo_recovery.c — Autonomic Recovery Subsystem Implementation
 */

#include "../include/oo_recovery.h"
#include <stddef.h>

extern void oo_print(const char *msg);

static oo_recovery_stats_t g_stats = {0, 0, OO_RECOVERY_REASON_NONE, OO_STATE_RELAXED};
static uint32_t g_heartbeat_counter = 0;
static uint32_t g_watchdog_timeout_threshold = 1000;
static uint32_t g_last_organ_progress = 0;

void oo_recovery_init(void) {
    g_stats.total_recoveries = 0;
    g_stats.last_recovery_timestamp = 0;
    g_stats.last_reason = OO_RECOVERY_REASON_NONE;
    g_stats.state_before_recovery = OO_STATE_RELAXED;
    g_heartbeat_counter = 0;
    g_last_organ_progress = 0;

    oo_print("[Recovery] Autonomic Self-Healing Subsystem online.\n");
}

int oo_recovery_handle(oo_recovery_reason_t reason) {
    g_stats.total_recoveries++;
    g_stats.last_recovery_timestamp = g_heartbeat_counter;
    g_stats.last_reason = reason;
    g_stats.state_before_recovery = oo_scheduler_get_state();

    oo_print("[Recovery] 🚨 AUTONOMIC RECOVERY TRIGGERED! Reason: ");
    switch (reason) {
        case OO_RECOVERY_REASON_ORGAN_FREEZE:
            oo_print("ORGAN FREEZE / DEADLOCK\n");
            break;
        case OO_RECOVERY_REASON_THERMAL_PANIC:
            oo_print("THERMAL PANIC / HARDWARE THROTTLING\n");
            break;
        case OO_RECOVERY_REASON_MEMORY_PRESSURE:
            oo_print("CRITICAL MEMORY PRESSURE / OOM\n");
            break;
        case OO_RECOVERY_REASON_IMMUNE_ATTACK:
            oo_print("IMMUNE INTRUSION / CORRUPTED RUNTIME\n");
            break;
        default:
            oo_print("GENERAL HOMEOSTATIC DISTURBANCE\n");
            break;
    }

    /* 1. Enter survival state to shed load */
    oo_scheduler_set_state(OO_STATE_SURVIVAL);

    /* 2. Execute organ reset & watchdog ping */
    g_last_organ_progress = g_heartbeat_counter;

    /* 3. Gradually return to vigilant state */
    oo_scheduler_set_state(OO_STATE_VIGILANT);

    oo_print("[Recovery] ✨ Organism restored to OO_STATE_VIGILANT successfully.\n");
    return 0;
}

void oo_recovery_watchdog_tick(void) {
    g_heartbeat_counter++;
    if (g_heartbeat_counter - g_last_organ_progress > g_watchdog_timeout_threshold) {
        oo_recovery_handle(OO_RECOVERY_REASON_ORGAN_FREEZE);
    }
}

oo_recovery_stats_t oo_recovery_get_stats(void) {
    return g_stats;
}
