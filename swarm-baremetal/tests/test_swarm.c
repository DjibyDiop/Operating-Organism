/**
 * test_swarm.c
 * Automated test for Swarm Baremetal (Collective Intelligence & Pheromone Diffusion)
 */

#include "../include/pheromones.h"
#include "../../united-baremetal/include/united_bus.h"
#include "../../identity-baremetal/include/dna_hash.h"
#include <stdio.h>
#include <assert.h>
#include <string.h>

void oo_print(const char* msg) {
    printf("%s", msg);
}

int main(void) {
    printf("=== Running Swarm-Baremetal Validation ===\n");
    united_bus_init();
    identity_init();
    swarm_init();

    assert(swarm_get_emitted_count() == 0);
    assert(swarm_get_received_count() == 0);
    assert(swarm_get_accepted_count() == 0);

    // Emit a pheromone
    const char* antibody = "IMMUNE_ANTIBODY_SIG_01";
    swarm_emit_pheromone(1, antibody, strlen(antibody));
    assert(swarm_get_emitted_count() == 1);

    // Register peer DNA in Thymus
    const char* peer_code = "TRUSTED_SWARM_PEER_ALPHA";
    oo_dna_signature_t peer_sig;
    identity_calculate_dna(peer_code, strlen(peer_code), &peer_sig);
    identity_trust_dna(&peer_sig);

    // Receive pheromone from trusted peer
    swarm_on_pheromone_received(peer_sig.hash, antibody, strlen(antibody));
    assert(swarm_get_received_count() == 1);
    assert(swarm_get_accepted_count() == 1);

    // Receive pheromone from unknown attacker
    const char* rogue_code = "ROGUE_UNTRUSTED_NODE";
    oo_dna_signature_t rogue_sig;
    identity_calculate_dna(rogue_code, strlen(rogue_code), &rogue_sig);
    swarm_on_pheromone_received(rogue_sig.hash, antibody, strlen(antibody));

    assert(swarm_get_received_count() == 2);
    assert(swarm_get_accepted_count() == 1); // Not accepted!

    printf("=== [PASS] Swarm-Baremetal Collective Intelligence & Pheromones verified ===\n");
    return 0;
}
