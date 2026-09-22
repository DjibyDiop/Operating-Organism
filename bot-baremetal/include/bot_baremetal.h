#ifndef BOT_BAREMETAL_H
#define BOT_BAREMETAL_H

#include "../core/bot_dna.h"
#include "../core/territory_map.h"
#include "../instinct/threat_levels.h"
#include "../instinct/threat_state.h"
#include "../instinct/instinct_layer.h"
#include "phenomenon_layer.h"

typedef struct {
    BotDna dna;
    InstinctLayer instinct;
    bool is_running;
    uint32_t loop_counter;
} BotBaremetal;

void bot_baremetal_init(BotBaremetal* bot, const char* name, uint64_t hw_id);
void bot_baremetal_tick(BotBaremetal* bot, uint32_t delta_ms);

#endif // BOT_BAREMETAL_H
