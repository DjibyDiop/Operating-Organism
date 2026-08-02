#include <stdint.h>
#include <stddef.h>
#include "../../united-baremetal/include/united_bus.h"

#ifdef VITAL_STANDALONE
// --- UNITED BUS (Stub pour mode standalone) ---
// Ce stub implémente le contrat minimal de united_bus pour les tests
// unitaires du vital-baremetal sans dépendance sur le bus réel.
#define STUB_BLOOD_VOLUME 64

typedef struct {
    globule_t globule;
    uint8_t   used;
} stub_slot_t;

static stub_slot_t stub_blood[STUB_BLOOD_VOLUME];
static uint32_t stub_write = 0;
static uint32_t stub_organ_reads[16];  // Une tête de lecture par organe

void united_bus_init(void) {
    stub_write = 0;
    for (int i = 0; i < 16; i++) stub_organ_reads[i] = 0;
    for (int i = 0; i < STUB_BLOOD_VOLUME; i++) stub_blood[i].used = 0;
}

int united_bus_pump(globule_t globule) {
    uint32_t idx = stub_write % STUB_BLOOD_VOLUME;
    stub_blood[idx].globule = globule;
    stub_blood[idx].used    = 1;
    stub_write++;
    return 0;
}

int united_bus_absorb(uint8_t organ_id, globule_t* out_buffer, int max_globules) {
    if (organ_id >= 16) return 0;
    int absorbed = 0;
    uint32_t head = stub_organ_reads[organ_id];

    while (head < stub_write && absorbed < max_globules) {
        uint32_t idx = head % STUB_BLOOD_VOLUME;
        if (stub_blood[idx].used) {
            globule_t *g = &stub_blood[idx].globule;
            // Respecte le contrat : broadcast (0xFF) ou cible explicite
            if (g->target_organ == 0xFF || g->target_organ == organ_id) {
                out_buffer[absorbed++] = *g;
            }
        }
        head++;
    }
    stub_organ_reads[organ_id] = head;
    return absorbed;
}

int united_bus_broadcast_yellow(uint8_t source, uint32_t signal_code) {
    globule_t g = {0};
    g.type         = GLOBULE_YELLOW;
    g.source_organ = source;
    g.target_organ = ORGAN_BROADCAST;
    g.payload_size = signal_code;
    return united_bus_pump(g);
}

int united_bus_broadcast_white(uint8_t source, uint32_t threat_id) {
    globule_t g = {0};
    g.type         = GLOBULE_WHITE;
    g.source_organ = source;
    g.target_organ = ORGAN_BROADCAST;
    g.payload_size = threat_id;
    return united_bus_pump(g);
}

void united_bus_gc(void) { /* no-op en mode stub */ }

united_bus_health_t united_bus_get_health(void) {
    united_bus_health_t h = {0};
    h.pending_globules = stub_write;
    h.capacity         = STUB_BLOOD_VOLUME;
    return h;
}
#endif // VITAL_STANDALONE
