/**
 * collective.c
 * Swarm Baremetal - Collective Intelligence & Pheromones
 */

#include "../include/pheromones.h"
#include "../../united-baremetal/include/united_bus.h"
#include "../../network-baremetal/include/lungs.h"
#include "../../identity-baremetal/include/dna_hash.h"

extern void oo_print(const char* msg);

static unsigned int g_emitted_count = 0;
static unsigned int g_received_count = 0;
static unsigned int g_accepted_count = 0;

void swarm_init(void) {
    g_emitted_count = 0;
    g_received_count = 0;
    g_accepted_count = 0;
    oo_print("[SwarmBaremetal] 👥 Intelligence collective active. Recherche de pairs...\n");
}

unsigned int swarm_get_emitted_count(void) {
    return g_emitted_count;
}

unsigned int swarm_get_received_count(void) {
    return g_received_count;
}

unsigned int swarm_get_accepted_count(void) {
    return g_accepted_count;
}

void swarm_emit_pheromone(uint8_t type, const void* data, size_t size) {
    (void)type;
    g_emitted_count++;
    oo_print("[SwarmBaremetal] 📢 Emission de pheromones vers l'essaim.\n");
    // On utilise les poumons (Network) pour diffuser l'information
    network_exhale((const uint8_t*)data, size);
}

void swarm_on_pheromone_received(const uint8_t* sender_dna, const void* data, size_t size) {
    g_received_count++;
    oo_print("[SwarmBaremetal] 📥 Pheromone recue d'un pair.\n");
    
    // Validation de l'identite du pair (Est-ce un membre de l'essaim de confiance ?)
    if (identity_is_self((const oo_dna_signature_t*)sender_dna)) {
        g_accepted_count++;
        oo_print("[SwarmBaremetal] ✅ Pair reconnu. Absorption de l'anticorps.\n");
        
        globule_t shared_immunity;
        shared_immunity.type = GLOBULE_WHITE;
        shared_immunity.source_organ = 10; // ORGAN_TYPE_SWARM
        shared_immunity.target_organ = 1;  // Vers le Système Immunitaire (Bot)
        shared_immunity.payload_addr = (void*)data;
        shared_immunity.payload_size = (uint32_t)size;
        
        united_bus_pump(shared_immunity);
    } else {
        oo_print("[SwarmBaremetal] ⚠️ Pair inconnu ou ADN altere ! Pheromone rejetee.\n");
    }
}
