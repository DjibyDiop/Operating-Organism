/**
 * test_evolution.c
 * Automated test for Evolution-Baremetal (Mutations & Generations)
 */

#include "../include/genetics.h"
#include "../../identity-baremetal/include/dna_hash.h"
#include <stdio.h>
#include <assert.h>

void oo_print(const char* msg) {
    printf("%s", msg);
}

int main(void) {
    printf("=== Running Evolution-Baremetal Validation ===\n");
    evolution_init();

    assert(evolution_get_generation() == 1);
    assert(evolution_get_mutation_count() == 0);

    // Apply a valid mutation (weight buffer)
    uint8_t weights[16] = { 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
                            0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10 };
    
    // First let's trust the signature so identity_is_self returns true
    oo_dna_signature_t sig;
    identity_calculate_dna(weights, sizeof(weights), &sig);
    identity_trust_dna(&sig);

    int res = evolution_apply_mutation(weights, sizeof(weights));
    assert(res == 0);
    assert(evolution_get_mutation_count() == 1);

    const oo_mutation_t* mut = evolution_get_mutation(0);
    assert(mut != NULL);
    assert(mut->mutation_id == 1);
    assert(mut->generation == 1);
    assert(mut->weight_size == 16);

    // Evaluate fitness > 90 -> should trigger natural selection and promote generation
    evolution_evaluate_fitness(1, 95);
    assert(evolution_get_generation() == 2);
    assert(evolution_get_mutation(0)->confidence == 100);

    printf("=== [PASS] Evolution-Baremetal Mutations & Natural Selection verified ===\n");
    return 0;
}
