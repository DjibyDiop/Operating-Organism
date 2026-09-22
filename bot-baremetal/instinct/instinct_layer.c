#include "instinct_layer.h"
#include <string.h>

void instinct_layer_init(InstinctLayer* layer) {
    if (!layer) return;
    memset(layer, 0, sizeof(InstinctLayer));
    threat_state_init(&layer->threat);
    territory_map_init(&layer->territory);
}

InstinctVerdict instinct_layer_evaluate_action(
    InstinctLayer* layer,
    uint32_t action_id,
    uint64_t target_addr,
    uint64_t size_bytes,
    uint32_t requested_flags
) {
    if (!layer) return VERDICT_VETO_THREAT;
    layer->total_propositions_evaluated++;

    // 1. Check Split-Brain Isolation: In split-brain mode, the bot refuses all remote propositions
    if (layer->threat.split_brain_active) {
        layer->total_vetoes++;
        threat_state_report_veto(&layer->threat);
        return VERDICT_VETO_SPLIT_BRAIN;
    }

    // 2. Check Threat Level: In LOCKDOWN, all non-vital actions are vetoed
    if (layer->threat.current_level == THREAT_LEVEL_LOCKDOWN) {
        layer->total_vetoes++;
        return VERDICT_VETO_THREAT;
    }

    // 3. Check Territory Boundaries
    if (size_bytes > 0) {
        if (!territory_map_check_access(&layer->territory, target_addr, size_bytes, requested_flags)) {
            layer->total_vetoes++;
            threat_state_report_veto(&layer->threat);
            return VERDICT_VETO_TERRITORY;
        }
    }

    // Action allowed
    (void)action_id;
    return VERDICT_ALLOW;
}

void instinct_layer_tick_survival(InstinctLayer* layer, uint32_t delta_ms) {
    if (!layer) return;
    threat_state_advance_time(&layer->threat, delta_ms);

    if (layer->threat.split_brain_active || layer->threat.current_level >= THREAT_LEVEL_CRITICAL) {
        layer->emergency_reflex_ticks++;
        // Maintain vital autonomous physical survival instincts
    }
}
