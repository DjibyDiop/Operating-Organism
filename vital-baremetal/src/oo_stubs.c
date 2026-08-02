#include <stdint.h>
#include <stddef.h>
#include "united_bus.h"

/// =============================================================================
/// VITAL-BAREMETAL - STUBS (Bouchons pour compilation standalone)
/// =============================================================================
/// Remplace les fonctions des autres organes et des modules Rust/Asm
/// quand vital-baremetal est compilé seul pour test QEMU.
/// En mode OO complet, ce fichier est exclu du link.
/// =============================================================================

// --- RUST GUARDIAN (stubs) ---

static uint64_t stub_vitality = 100;

uint64_t get_organism_vitality(void) {
    return stub_vitality++;
}

uint8_t get_guardian_state(void) {
    return 0; // HEALTHY
}

uint64_t get_total_anomalies(void) {
    return 0;
}

uint8_t get_monitored_cores(void) {
    return 1;
}

// --- QUANTUM VAULT (stub) ---
void vital_quantum_sign(uint64_t entropy) {
    (void)entropy;
}

// --- TEMPORAL ENGINE (stub) ---
uint64_t vital_temporal_get_jitter(void) {
    return 0;
}

void vital_steel_tick(uint64_t* pulse, uint64_t* jitter) {
    if (pulse) (*pulse)++;
    if (jitter) *jitter = 1;
}

int vital_quantum_verify(uint64_t entropy) {
    (void)entropy;
    return 1;
}

void vital_ouroboros_panic(void) {
    // Panic stub
}

// --- SWARM (stub) ---
void swarm_emit_pheromone(uint8_t type, const void* data, size_t size) {
    (void)type; (void)data; (void)size;
}

// --- IDENTITY (stub) ---
int identity_is_self(const void* sig) {
    (void)sig;
    return 1;
}

// --- I/O PORTS (stub for Pineal Gland RTC) ---
void outb(uint16_t port, uint8_t val) {
    (void)port; (void)val;
}

uint8_t inb(uint16_t port) {
    (void)port;
    return 0;
}

// --- STORAGE (stub for Soma-DNA persistence) ---
int oo_storage_write_all(void* ctx, const char* name, const void* data, uint32_t len) {
    (void)ctx; (void)name; (void)data; (void)len;
    return 0;
}

int oo_storage_exists(void* ctx, const char* name) {
    (void)ctx; (void)name;
    return 0;
}

int oo_storage_read_all(void* ctx, const char* name, void* data, uint32_t len, uint64_t* out_len) {
    (void)ctx; (void)name; (void)data; (void)len; (void)out_len;
    return -1;
}
