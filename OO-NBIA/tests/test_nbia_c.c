#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>
#include <assert.h>

#include "../../bot-baremetal/include/phenomenon_layer.h"

// FFI Declarations
extern void nbia_init(void);
extern void nbia_tick(uint32_t delta_ms);
extern void nbia_update_sensor(uint8_t sensor_type, float value, uint8_t verified);
extern float nbia_get_hvac_temp(void);
extern float nbia_get_drift(void);
extern void nbia_handle_hermes(const uint8_t* pkt_ptr, size_t len);

extern void dplus_runtime_advance(uint32_t delta_ms);
extern void dplus_ingest_perception(uint32_t perception_id, uint32_t value);
extern size_t dplus_poll_phenomena(OOPhenomenon* buffer, size_t max_count);
void rust_eh_personality(void) {}

int main(void) {
    printf("====================================================\n");
    printf("  [TEST] NBIA Latent Awareness & Reflex Verification\n");
    printf("====================================================\n\n");

    // 1. Initialize
    printf("[1/4] Initialisation de NBIA...\n");
    nbia_init();
    printf("      [OK] NBIA initialise avec succes.\n");

    // 2. Reflex Test (Thermal Overheat Mitigation)
    printf("[2/4] Test Reflexe : Surchauffe thermique (78.5 C)...\n");
    nbia_update_sensor(0, 78.5f, 1); // 78.5 C
    nbia_tick(10);
    float hvac = nbia_get_hvac_temp();
    printf("      Temperature HVAC commandee : %.1f C\n", hvac);
    assert(hvac == 18.0f);
    printf("      [PASS] Reflexe thermique instantane valide (Zero IA, 100%% deterministe) !\n");

    // 3. Drift & Absence Detection
    printf("[3/4] Test Veille Latente : Derive (Delta OO) & Evenement Negatif (Absence)...\n");
    dplus_ingest_perception(0x0F10001, 1); // OPI Heartbeat
    dplus_ingest_perception(35253223, 10);  // Awareness stable = 10
    dplus_runtime_advance(1000);

    // Injection d'une perturbation forte
    dplus_ingest_perception(35253223, 95);  // Awareness perturbé = 95
    dplus_runtime_advance(1000);

    OOPhenomenon phenoms[10];
    size_t polled = dplus_poll_phenomena(phenoms, 10);
    printf("      Phenomenes recus apres perturbation : %zu\n", polled);
    assert(polled > 0);
    assert(phenoms[0].type == PHENOMENON_DRIFT);
    printf("      [PASS] Derive detectee (PHENOMENON_DRIFT, confiance: %u%%) !\n", phenoms[0].confidence);

    // Absence de battement pendant 3.1 secondes
    printf("      Avancement du temps de 3100ms sans battement OPI...\n");
    dplus_runtime_advance(3100);
    polled = dplus_poll_phenomena(phenoms, 10);
    printf("      Phenomenes recus apres absence : %zu\n", polled);
    assert(polled > 0);
    assert(phenoms[0].type == PHENOMENON_PHASE_CHANGE);
    assert(phenoms[0].evidence_id == 0x0F1150); // OPI_ISOLATION
    printf("      [PASS] Evenement negatif detecte (Absence OPI -> Isolation) !\n");

    // 4. Emergence Detection
    printf("[4/4] Test Emergence : Instabilite & Blocage Cognitif...\n");
    dplus_ingest_perception(0x0F10001, 1); // Heartbeat rétabli
    dplus_ingest_perception(0x0F10002, 0); // OPI Inference = STALLED

    for (int i = 1; i <= 6; i++) {
        dplus_ingest_perception(0x0F10004, (uint32_t)(i * 12)); // Fragmentation croissante
        dplus_ingest_perception(0x0F10003, (uint32_t)((i % 2 == 0) ? 90 : 5)); // Trafic erratique
        dplus_runtime_advance(1000);
    }

    polled = dplus_poll_phenomena(phenoms, 10);
    bool found_emergence = false;
    for (size_t i = 0; i < polled; i++) {
        if (phenoms[i].type == PHENOMENON_EMERGENCE && phenoms[i].evidence_id == 0x57A1101) {
            found_emergence = true;
            printf("      [Emergence] Detectee : type=%u, evidence=0x%X (COGNITIVE_AND_MEMORY_STALL)\n",
                   phenoms[i].type, phenoms[i].evidence_id);
        }
    }
    assert(found_emergence);
    printf("      [PASS] Emergence structurelle detectee selon nbia_core.plus !\n");

    printf("\n====================================================\n");
    printf("  *** TOUS LES TESTS NBIA SONT VALIDÉS A 100%% ***  \n");
    printf("====================================================\n");
    return 0;
}
