#ifndef INSTINCT_LAYER_H
#define INSTINCT_LAYER_H

#include "threat_state.h"
#include "../core/territory_map.h"
#include <stdint.h>
#include <stdbool.h>

typedef enum {
    VERDICT_ALLOW = 0,
    VERDICT_VETO_THREAT = 1,
    VERDICT_VETO_TERRITORY = 2,
    VERDICT_VETO_SPLIT_BRAIN = 3
} InstinctVerdict;

typedef struct {
    ThreatState threat;
    TerritoryMap territory;
    uint32_t total_propositions_evaluated;
    uint32_t total_vetoes;
    uint32_t emergency_reflex_ticks;
} InstinctLayer;

void instinct_layer_init(InstinctLayer* layer);
InstinctVerdict instinct_layer_evaluate_action(
    InstinctLayer* layer,
    uint32_t action_id,
    uint64_t target_addr,
    uint64_t size_bytes,
    uint32_t requested_flags
);
void instinct_layer_tick_survival(InstinctLayer* layer, uint32_t delta_ms);

#endif // INSTINCT_LAYER_H
