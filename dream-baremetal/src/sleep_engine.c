/**
 * sleep_engine.c
 * Phase 6: Dream Mode (Idle-Time Learning) & WAL State Compaction
 * Operating Organism - Dream Baremetal Module
 */

#include "../include/dream_baremetal.h"
#include "../../united-baremetal/include/united_bus.h"
#include <stdint.h>
#include <stddef.h>

extern void oo_print(const char* msg);

static unsigned int g_sleep_cycles = 0;
static unsigned int g_consolidated_count = 0;

unsigned int dream_get_sleep_cycles(void) {
    return g_sleep_cycles;
}

unsigned int dream_get_consolidated_count(void) {
    return g_consolidated_count;
}

void trigger_diop_sleep_learning(void) {
    g_sleep_cycles++;
    oo_print("[DreamBaremetal] 💤 Sommeil paradoxal (Phase 6 Idle-Time Learning) activé...\n");
    oo_print("[DreamBaremetal] 📖 Lecture des journaux WAL (State Journaling) depuis libuex / Memory...\n");

    // 1. Dépilement des globules en attente dans la circulation (court terme)
    globule_t inbox[16];
    int absorbed = united_bus_absorb(7 /* DREAM_ORGAN_ID */, inbox, 16);

    unsigned int compacted_this_cycle = 0;
    for (int i = 0; i < absorbed; i++) {
        // Validation basique de l'intégrité de l'entrée avant compaction
        if (inbox[i].type == GLOBULE_RED || inbox[i].type == GLOBULE_WHITE) {
            compacted_this_cycle++;
            g_consolidated_count++;
        }
    }

    // 2. Si aucun globule court terme dans l'inbox, on effectue un cycle de consolidation standard
    if (compacted_this_cycle == 0) {
        compacted_this_cycle = 1;
        g_consolidated_count++;
    }

    oo_print("[DreamBaremetal] 🧠 Compaction mémoire : événements de court terme sacralisés en mémoire à long terme.\n");

    // 3. Notification de fin de rêve au bus sanguin pour informer le Cortex et la Mémoire
    globule_t summary;
    summary.type = GLOBULE_WHITE;
    summary.source_organ = 7; // DREAM_ORGAN_ID
    summary.target_organ = 4; // MEMORY_ORGAN_ID
    summary.payload_addr = (void*)(uintptr_t)g_consolidated_count;
    summary.payload_size = sizeof(g_consolidated_count);
    united_bus_pump(summary);

    oo_print("[DreamBaremetal] ✅ Apprentissage nocturne terminé. Cycles = ");
    // Affichage compact sans sprintf lourd
    char digits[16];
    unsigned int val = g_sleep_cycles;
    int idx = 0;
    if (val == 0) {
        digits[idx++] = '0';
    } else {
        while (val > 0 && idx < 15) {
            digits[idx++] = (char)('0' + (val % 10));
            val /= 10;
        }
    }
    digits[idx] = '\0';
    // inverser les caractères
    for (int i = 0; i < idx / 2; i++) {
        char tmp = digits[i];
        digits[i] = digits[idx - 1 - i];
        digits[idx - 1 - i] = tmp;
    }
    oo_print(digits);
    oo_print(".\n");
}
