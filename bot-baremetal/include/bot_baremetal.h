#pragma once
#ifndef BOT_BAREMETAL_H
#define BOT_BAREMETAL_H

#ifdef __cplusplus
extern "C" {
#endif

#include "../core/bot_dna.h"
#include "../core/territory_map.h"

// Canonical module facade for strict baremetal layout checks.
void bot_baremetal_init(void);

// Phase 6F: Return current threat level for organ_bus (0=dormant, 255=critical)
uint8_t bot_get_threat_level(void);

// Phase 7: Pulse bot immune cycle — called by vital heartbeat
void bot_baremetal_pulse(void);

// Trigger a threat reaction in the Bot's InstinctLayer
void bot_baremetal_trigger(uint32_t trigger_type, uint32_t pid, uint64_t addr, uint32_t confidence);

// Reset current threat level to dormant
int bot_baremetal_reset_threat(const char* reason);

#ifdef __cplusplus
}
#endif

#endif // BOT_BAREMETAL_H
