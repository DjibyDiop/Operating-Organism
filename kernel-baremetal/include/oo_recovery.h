/*
 * oo_recovery.h — Automatic Self-Healing, Homeostatic Recovery & Watchdog
 *
 * Implements the autonomic reflex loop:
 *   - Detects freeze / thermal panic / memory corruption
 *   - Executes deterministic rollback
 *   - Auto-restores degraded organs to safe homeostatic state
 */

#ifndef OO_RECOVERY_H
#define OO_RECOVERY_H

#include <stdint.h>
#include "oo_scheduler.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef enum {
    OO_RECOVERY_REASON_NONE           = 0,
    OO_RECOVERY_REASON_ORGAN_FREEZE   = 1,
    OO_RECOVERY_REASON_THERMAL_PANIC  = 2,
    OO_RECOVERY_REASON_MEMORY_PRESSURE= 3,
    OO_RECOVERY_REASON_IMMUNE_ATTACK  = 4,
    OO_RECOVERY_REASON_MANUAL_SIGNAL  = 5
} oo_recovery_reason_t;

typedef struct {
    uint32_t total_recoveries;
    uint32_t last_recovery_timestamp;
    oo_recovery_reason_t last_reason;
    oo_homeostasis_state_t state_before_recovery;
} oo_recovery_stats_t;

/* Initialize the autonomic recovery subsystem */
void oo_recovery_init(void);

/* Trigger autonomic recovery protocol */
int oo_recovery_handle(oo_recovery_reason_t reason);

/* Watchdog tick called at every scheduler heartbeat */
void oo_recovery_watchdog_tick(void);

/* Autonomic self-maintenance loop (polls vital metrics & triggers preventative recovery) */
void oo_maintenance_step(void);

/* Get recovery statistics */
oo_recovery_stats_t oo_recovery_get_stats(void);

#ifdef __cplusplus
}
#endif

#endif /* OO_RECOVERY_H */
