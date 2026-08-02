/**
 * mutation.c
 * Evolution Baremetal - Mutation & Natural Selection Governance
 */

#include "../include/genetics.h"
#include "../../identity-baremetal/include/dna_hash.h"

extern void oo_print(const char* msg);

#define MAX_MUTATION_HISTORY 64

static uint32_t g_current_generation = 1;
static uint32_t g_mutation_count = 0;
static oo_mutation_t g_mutation_history[MAX_MUTATION_HISTORY];

void evolution_init(void) {
    g_current_generation = 1;
    g_mutation_count = 0;
    oo_print("[EvolutionBaremetal] 🧬 Moteur genetique pret. En attente de mutations...\n");
}

uint32_t evolution_get_generation(void) {
    return g_current_generation;
}

uint32_t evolution_get_mutation_count(void) {
    return g_mutation_count;
}

const oo_mutation_t* evolution_get_mutation(uint32_t index) {
    if (index >= g_mutation_count) return NULL;
    return &g_mutation_history[index];
}

int evolution_apply_mutation(const uint8_t *lora_weights, size_t size) {
    if (!lora_weights || size == 0) return -1;

    oo_print("[EvolutionBaremetal] 🧪 Tentative de mutation (Application LoRA)...\n");

    // 1. Calcul de la signature ADN du nouveau trait
    oo_dna_signature_t sig;
    identity_calculate_dna(lora_weights, size, &sig);

    // 2. Validation par le Thymus (Identity)
    // Seules les mutations "reconnues" ou signées peuvent être appliquées.
    if (identity_is_self(&sig)) {
        oo_print("[EvolutionBaremetal] ✅ Mutation validee. Integration au Cortex.\n");

        // Enregistrement dans l'historique génomique
        if (g_mutation_count < MAX_MUTATION_HISTORY) {
            oo_mutation_t* m = &g_mutation_history[g_mutation_count];
            m->mutation_id = g_mutation_count + 1;
            m->generation = g_current_generation;
            m->confidence = 95;
            m->weight_size = size;
            g_mutation_count++;
        }

        // On "sacralise" cette nouvelle signature dans le genome de confiance
        identity_trust_dna(&sig);
        return 0;
    } else {
        oo_print("[EvolutionBaremetal] ❌ Rejet de greffe ! Mutation non autorisee.\n");
        return -1;
    }
}

void evolution_evaluate_fitness(uint32_t pattern_id, uint8_t success_rate) {
    if (success_rate > 90) {
        oo_print("[EvolutionBaremetal] 🌟 Pattern performant detecte. Passage au genome permanent.\n");
        g_current_generation++;
        // On associe la génération au pattern sélectionné
        if (pattern_id > 0 && pattern_id <= g_mutation_count) {
            g_mutation_history[pattern_id - 1].confidence = 100;
        }
    }
}
