#define _DEFAULT_SOURCE
#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

#if defined(_WIN32)
#include <windows.h>
#define bot_sleep_ms(ms) Sleep(ms)
#else
#include <unistd.h>
#define bot_sleep_ms(ms) usleep((ms) * 1000)
#endif

/* Use exact protocol from OPI-baremetal */
#include "../../OPI-baremetal/oo-net/core/hermes_mesh.h"
#include "../include/phenomenon_layer.h"
#include "../include/bot_baremetal.h"

// Forward declarations
extern void hermes_mesh_init(void);
extern void hermes_poll_network(void);
extern int hermes_send_packet(HermesPacket* pkt, size_t payload_len);

// NBIA (Rust) FFI
extern void dplus_runtime_advance(uint32_t delta_ms);
extern uint64_t dplus_boot_organ_bytecode(const uint8_t* bytecode, size_t length);
extern void dplus_ingest_perception(uint32_t perception_id, uint32_t value);
extern size_t dplus_poll_phenomena(OOPhenomenon* buffer, size_t max_count);

void rust_eh_personality(void) {}

// Provide oo_print for united_bus.c (bot doesn't have the full kernel console)
void oo_print(const char* str) {
    printf("%s", str);
}

int main(int argc, char** argv) {
    printf("==========================================\n");
    printf("    OO BOT-BAREMETAL (Sovereign Organ)    \n");
    printf("==========================================\n");

    uint32_t max_loops = 0; // 0 = infinite (daemon)
    if (argc > 1) {
        max_loops = (uint32_t)atoi(argv[1]);
    }

    // 0. Initialize Bot Sovereign State (DNA & Territory)
    BotBaremetal bot;
    bot_dna_init(&bot.dna, "Bot-Omega", 1, 0xAA55CC33ULL, 0x00000007);
    instinct_layer_init(&bot.instinct);
    territory_map_add_zone(&bot.instinct.territory, 0x10000000, 0x00100000, ZONE_PERIPHERAL_IO, 3);
    printf("[Core] Bot DNA initialized: '%s' (hash: 0x%016llX)\n", bot.dna.name, (unsigned long long)bot.dna.dna_hash);
    
    // 1. Initialize NO-MOCK UDP Hermes Mesh
    printf("[Core] Initializing Hermes Mesh (UDP Network)...\n");
    hermes_mesh_init();
    
    // 2. Initialize NBIA Reflex Engine (D+ VM)
    printf("[Core] Booting NBIA Organism from D+ source...\n");
#include "nbia_core_dbc.h"
    uint64_t organ_id = dplus_boot_organ_bytecode(nbia_core_dbc, nbia_core_dbc_len);
    printf("[Core] D+ Organ Booted (ID: 0x%016llX, bytecode: %u bytes)\n", (unsigned long long)organ_id, nbia_core_dbc_len);
    
    // 3. Main Bot Homeostasis Loop
    printf("[Core] Entering Homeostasis Loop%s...\n", max_loops > 0 ? " (Bounded Test Mode)" : "");
    
    uint32_t loop_count = 0;
    while (max_loops == 0 || loop_count < max_loops) {
        // Poll for incoming Hermes messages from OPI or other organs
        hermes_poll_network();
        
        // Every 1 second (100 * 10ms), inject organism awareness
        loop_count++;
        if (loop_count % 100 == 0) {
            // Alternate between stable (10) and drift (90) every 5 seconds
            uint32_t val = (loop_count % 1000 < 500) ? 10 : 90;
            printf("[Bot] Loop %u: Ingesting ORGANISM_AWARENESS with value %u\n", loop_count, val);
            dplus_ingest_perception(35253223, val); // FNV-1a Hash of "ORGANISM_AWARENESS"
        }
        
        /* Advance biological time by 10ms */
        dplus_runtime_advance(10);
        instinct_layer_tick_survival(&bot.instinct, 10);
        
        OOPhenomenon phenoms[10];
        size_t polled = dplus_poll_phenomena(phenoms, 10);
        for (size_t i = 0; i < polled; i++) {
            OOPhenomenon* p = &phenoms[i];
            const char* type_str = "UNKNOWN";
            if (p->type == PHENOMENON_DRIFT) type_str = "DRIFT";
            else if (p->type == PHENOMENON_EMERGENCE) type_str = "EMERGENCE";
            else if (p->type == PHENOMENON_PHASE_CHANGE) type_str = "PHASE_CHANGE";
            else if (p->type == PHENOMENON_CONVERGENCE) type_str = "CONVERGENCE";
            else if (p->type == PHENOMENON_TOPOLOGY_MAP) type_str = "TOPOLOGY_MAP";
            else if (p->type == PHENOMENON_CAUSAL_TRACE) type_str = "CAUSAL_TRACE";
            
            printf("[Phenomenon Layer] Published %s (source: 0x%04X, confidence: %u%%)\n", type_str, p->source, p->confidence);
            
            // Decoupled Decision Simulation
            if (p->type == PHENOMENON_DRIFT) {
                printf("[Bot] Received Phenomenon DRIFT -> Decision: OBSERVE (Local sovereignty preserved)\n");
            } else if (p->type == PHENOMENON_CONVERGENCE) {
                printf("[Bot] Received Phenomenon CONVERGENCE -> Decision: NOMINAL (Stability confirmed)\n");
            } else if (p->type == PHENOMENON_PHASE_CHANGE) {
                printf("[Bot] Received Phenomenon PHASE_CHANGE -> Decision: SPLIT_BRAIN_SURVIVAL (OPI Offline)\n");
            }
        }
        
        fflush(stdout);
        bot_sleep_ms(10);
    }
    
    printf("[Core] Loop completed successfully (%u iterations).\n", loop_count);
    return 0;
}
