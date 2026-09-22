#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>
#include <string.h>
#include <assert.h>

#include "../include/bot_baremetal.h"
#include "../include/phenomenon_layer.h"

// NBIA (Rust) FFI declarations
extern void dplus_runtime_advance(uint32_t delta_ms);
extern uint64_t dplus_boot_organ_bytecode(const uint8_t* bytecode, size_t length);
extern void dplus_ingest_perception(uint32_t perception_id, uint32_t value);
extern size_t dplus_poll_phenomena(OOPhenomenon* buffer, size_t max_count);

void rust_eh_personality(void) {}

static int tests_run = 0;
static int tests_passed = 0;

#define TEST_ASSERT(cond, msg) do { \
    if (!(cond)) { \
        printf("  [FAIL] %s (line %d)\n", msg, __LINE__); \
        return 0; \
    } \
} while(0)

/* TEST 1: Bot DNA & Integrity */
static int test_bot_dna(void) {
    printf("[Test 1] Testing Bot DNA initialization and FNV-1a integrity...\n");
    tests_run++;

    BotDna dna;
    bot_dna_init(&dna, "Bot-Sentinel", 1, 0x12345678ULL, 0x07);
    TEST_ASSERT(strcmp(dna.name, "Bot-Sentinel") == 0, "Bot name match");
    TEST_ASSERT(dna.generation == 1, "Generation match");
    TEST_ASSERT(dna.capabilities_mask == 0x07, "Capabilities match");
    TEST_ASSERT(dna.dna_hash != 0, "Hash computed non-zero");

    // Verify integrity
    TEST_ASSERT(bot_dna_verify_integrity(&dna) == true, "Valid DNA verification");

    // Tamper with DNA
    dna.capabilities_mask = 0xFF;
    TEST_ASSERT(bot_dna_verify_integrity(&dna) == false, "Tampered DNA must fail verification");

    printf("  [PASS] Bot DNA verified and tamper-proof.\n");
    tests_passed++;
    return 1;
}

/* TEST 2: Territory Map Boundary & Access Enforcement */
static int test_territory_map(void) {
    printf("[Test 2] Testing TerritoryMap zones and sovereign boundary enforcement...\n");
    tests_run++;

    TerritoryMap map;
    territory_map_init(&map);

    // Add valid zones
    bool ok1 = territory_map_add_zone(&map, 0x10000000, 0x00010000, ZONE_ISOLATED_MEM, 1); // Read-only
    bool ok2 = territory_map_add_zone(&map, 0x20000000, 0x00020000, ZONE_PERIPHERAL_IO, 3); // Read/Write
    TEST_ASSERT(ok1 && ok2, "Zones added successfully");

    // Check valid access
    TEST_ASSERT(territory_map_check_access(&map, 0x10000000, 0x100, 1) == true, "Read in Isolated Mem zone");
    TEST_ASSERT(territory_map_check_access(&map, 0x20005000, 0x200, 2) == true, "Write in Peripheral IO");

    // Check invalid access (permission denied or out of bounds)
    TEST_ASSERT(territory_map_check_access(&map, 0x10000000, 0x100, 2) == false, "Write in Read-only zone denied");
    TEST_ASSERT(territory_map_check_access(&map, 0x30000000, 0x100, 1) == false, "Out of bounds address denied");
    TEST_ASSERT(territory_map_check_access(&map, 0x1000FFF0, 0x100, 1) == false, "Zone overflow access denied");

    printf("  [PASS] Territory boundaries strictly enforced.\n");
    tests_passed++;
    return 1;
}

/* TEST 3: Threat State FSM & Split-Brain Detection */
static int test_threat_state(void) {
    printf("[Test 3] Testing Threat State FSM and split-brain timeout...\n");
    tests_run++;

    ThreatState state;
    threat_state_init(&state);
    TEST_ASSERT(threat_state_get_level(&state) == THREAT_LEVEL_NOMINAL, "Initial state Nominal");

    // Normal heartbeat ticks
    threat_state_feed_heartbeat(&state);
    threat_state_advance_time(&state, 1000);
    TEST_ASSERT(threat_state_get_level(&state) == THREAT_LEVEL_NOMINAL, "State remains Nominal with heartbeat");

    // Simulate link loss: advance time past 3000ms
    threat_state_advance_time(&state, 3100);
    TEST_ASSERT(threat_state_get_level(&state) == THREAT_LEVEL_SPLIT_BRAIN, "State enters SPLIT_BRAIN after 3000ms without heartbeat");

    // Reconnect heartbeat
    threat_state_feed_heartbeat(&state);
    TEST_ASSERT(threat_state_get_level(&state) == THREAT_LEVEL_NOMINAL, "Heartbeat restores Nominal from Split-Brain");

    // Simulate anomaly escalation
    threat_state_report_anomaly(&state, 2);
    threat_state_report_anomaly(&state, 2); // Total = 4 >= 3 -> ELEVATED
    TEST_ASSERT(threat_state_get_level(&state) == THREAT_LEVEL_ELEVATED, "4 anomalies escalate to ELEVATED");

    threat_state_report_anomaly(&state, 4); // Total = 8 >= 8 -> CRITICAL
    TEST_ASSERT(threat_state_get_level(&state) == THREAT_LEVEL_CRITICAL, "8 anomalies escalate to CRITICAL");

    printf("  [PASS] Threat State FSM correctly tracks anomalies and split-brain.\n");
    tests_passed++;
    return 1;
}

/* TEST 4: Instinct Layer Sovereign Veto & Survival Tick */
static int test_instinct_layer(void) {
    printf("[Test 4] Testing Instinct Layer local sovereign vetoes and survival...\n");
    tests_run++;

    InstinctLayer instinct;
    instinct_layer_init(&instinct);
    territory_map_add_zone(&instinct.territory, 0x40000000, 0x1000, ZONE_PERIPHERAL_IO, 3);

    // Command in territory allowed
    InstinctVerdict v1 = instinct_layer_evaluate_action(&instinct, 1, 0x40000100, 0x20, 2);
    TEST_ASSERT(v1 == VERDICT_ALLOW, "Valid peripheral command authorized");

    // Command outside territory vetoed
    InstinctVerdict v2 = instinct_layer_evaluate_action(&instinct, 2, 0x50000000, 0x20, 2);
    TEST_ASSERT(v2 == VERDICT_VETO_TERRITORY, "Unmapped peripheral command vetoed by territory check");
    TEST_ASSERT(instinct.total_vetoes == 1, "Veto counter incremented");

    // Advance survival loop in nominal state
    instinct_layer_tick_survival(&instinct, 100);

    // Force split-brain state
    threat_state_advance_time(&instinct.threat, 3500);
    TEST_ASSERT(threat_state_get_level(&instinct.threat) == THREAT_LEVEL_SPLIT_BRAIN, "Split-brain active");

    // Under split-brain, emergency reflex ticks increment during survival tick
    uint32_t ticks_before = instinct.emergency_reflex_ticks;
    instinct_layer_tick_survival(&instinct, 100);
    TEST_ASSERT(instinct.emergency_reflex_ticks > ticks_before, "Emergency reflex active under split-brain");

    printf("  [PASS] Instinct Layer sovereign veto operational.\n");
    tests_passed++;
    return 1;
}

/* TEST 5: NBIA Organism Integration */
static int test_nbia_organism(void) {
    printf("[Test 5] Testing NBIA Organism bytecode boot and phenomenon polling...\n");
    tests_run++;

    const uint8_t minimal_bytecode[] = {
        0x4F, 0x4F, 0x44, 0x50, // "OODP" magic
        0x01, 0x00, 0x00, 0x00, // version 1
        0x10, 0x00, 0x00, 0x00, // code length
        0x00, 0x00, 0x00, 0x00, // organ flags
        0x01, 0x02, 0x03, 0x04, // payload
        0x05, 0x06, 0x07, 0x08,
        0x09, 0x0A, 0x0B, 0x0C,
        0x0D, 0x0E, 0x0F, 0x10
    };

    uint64_t organ_id = dplus_boot_organ_bytecode(minimal_bytecode, sizeof(minimal_bytecode));
    TEST_ASSERT(organ_id != 0, "D+ organ boots successfully");

    extern void nbia_init(void);
    nbia_init();

    // Ingest perception to trigger drift
    dplus_ingest_perception(0x0F10001, 1); // Heartbeat
    dplus_ingest_perception(35253223, 10); // Hash of ORGANISM_AWARENESS -> stable 10%
    dplus_runtime_advance(1000);
    dplus_ingest_perception(35253223, 95); // Perturbation -> 95%
    dplus_runtime_advance(1000);

    OOPhenomenon phenoms[5];
    size_t count = dplus_poll_phenomena(phenoms, 5);
    TEST_ASSERT(count > 0, "Phenomena published by NBIA engine");
    TEST_ASSERT(phenoms[0].type == PHENOMENON_DRIFT, "Drift phenomenon detected");

    printf("  [PASS] NBIA Organism integrated with Bot Baremetal successfully.\n");
    tests_passed++;
    return 1;
}

int main(void) {
    printf("==========================================\n");
    printf("   BOT-BAREMETAL SOVEREIGN TEST SUITE    \n");
    printf("==========================================\n");

    test_bot_dna();
    test_territory_map();
    test_threat_state();
    test_instinct_layer();
    test_nbia_organism();

    printf("==========================================\n");
    printf("   Results: %d / %d tests passed (%d%%)   \n", 
           tests_passed, tests_run, (tests_passed * 100) / tests_run);
    printf("==========================================\n");

    return (tests_passed == tests_run) ? 0 : 1;
}
