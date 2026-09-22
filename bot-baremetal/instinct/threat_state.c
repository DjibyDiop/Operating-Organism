#include "threat_state.h"
#include <string.h>

#define SPLIT_BRAIN_TIMEOUT_MS 3000

void threat_state_init(ThreatState* state) {
    if (!state) return;
    memset(state, 0, sizeof(ThreatState));
    state->current_level = THREAT_LEVEL_NOMINAL;
}

void threat_state_feed_heartbeat(ThreatState* state) {
    if (!state) return;
    state->ms_since_heartbeat = 0;
    if (state->split_brain_active) {
        state->split_brain_active = false;
        if (state->current_level == THREAT_LEVEL_SPLIT_BRAIN) {
            state->current_level = (state->anomaly_counter > 5) ? THREAT_LEVEL_ELEVATED : THREAT_LEVEL_NOMINAL;
        }
    }
}

void threat_state_report_anomaly(ThreatState* state, uint32_t severity) {
    if (!state) return;
    state->anomaly_counter += severity;

    if (state->anomaly_counter >= 15) {
        state->current_level = THREAT_LEVEL_LOCKDOWN;
    } else if (state->anomaly_counter >= 8) {
        state->current_level = THREAT_LEVEL_CRITICAL;
    } else if (state->anomaly_counter >= 3 && state->current_level == THREAT_LEVEL_NOMINAL) {
        state->current_level = THREAT_LEVEL_ELEVATED;
    }
}

void threat_state_report_veto(ThreatState* state) {
    if (!state) return;
    state->consecutive_vetoes++;
    threat_state_report_anomaly(state, 2);
}

void threat_state_advance_time(ThreatState* state, uint32_t delta_ms) {
    if (!state) return;
    state->ms_since_heartbeat = state->ms_since_heartbeat + delta_ms;

    // Check for split-brain isolation (heartbeat timeout)
    if (state->ms_since_heartbeat >= SPLIT_BRAIN_TIMEOUT_MS) {
        state->split_brain_active = true;
        if (state->current_level < THREAT_LEVEL_SPLIT_BRAIN) {
            state->current_level = THREAT_LEVEL_SPLIT_BRAIN;
        }
    }

    // Gradual decay of anomalies in nominal conditions
    if (!state->split_brain_active && state->anomaly_counter > 0 && (delta_ms >= 1000)) {
        state->anomaly_counter--;
        if (state->anomaly_counter == 0 && state->current_level == THREAT_LEVEL_ELEVATED) {
            state->current_level = THREAT_LEVEL_NOMINAL;
        }
    }
}

ThreatLevel threat_state_get_level(const ThreatState* state) {
    if (!state) return THREAT_LEVEL_LOCKDOWN;
    return state->current_level;
}
