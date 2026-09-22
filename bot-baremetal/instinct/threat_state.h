#ifndef THREAT_STATE_H
#define THREAT_STATE_H

#include "threat_levels.h"
#include <stdint.h>
#include <stdbool.h>

typedef struct {
    ThreatLevel current_level;
    uint32_t anomaly_counter;
    uint32_t ms_since_heartbeat;
    uint32_t consecutive_vetoes;
    bool split_brain_active;
} ThreatState;

void threat_state_init(ThreatState* state);
void threat_state_feed_heartbeat(ThreatState* state);
void threat_state_report_anomaly(ThreatState* state, uint32_t severity);
void threat_state_report_veto(ThreatState* state);
void threat_state_advance_time(ThreatState* state, uint32_t delta_ms);
ThreatLevel threat_state_get_level(const ThreatState* state);

#endif // THREAT_STATE_H
