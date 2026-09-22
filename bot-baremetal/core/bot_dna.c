#include "bot_dna.h"
#include <string.h>

static uint64_t fnv1a_64(const void* data, size_t len) {
    const uint8_t* ptr = (const uint8_t*)data;
    uint64_t hash = 0xcbf29ce484222325ULL;
    for (size_t i = 0; i < len; i++) {
        hash ^= (uint64_t)ptr[i];
        hash *= 0x100000001b3ULL;
    }
    return hash;
}

void bot_dna_init(BotDna* dna, const char* name, uint32_t generation, uint64_t hw_fingerprint, uint32_t caps) {
    if (!dna) return;
    memset(dna, 0, sizeof(BotDna));
    if (name) {
        strncpy(dna->name, name, BOT_NAME_MAX_LEN - 1);
    }
    dna->generation = generation;
    dna->hardware_fingerprint = hw_fingerprint;
    dna->capabilities_mask = caps;
    dna->dna_hash = bot_dna_compute_hash(dna);
}

uint64_t bot_dna_compute_hash(const BotDna* dna) {
    if (!dna) return 0;
    // Hash fields excluding the dna_hash field itself
    uint8_t buffer[BOT_NAME_MAX_LEN + 4 + 8 + 4];
    size_t offset = 0;
    memcpy(buffer + offset, dna->name, BOT_NAME_MAX_LEN);
    offset += BOT_NAME_MAX_LEN;
    memcpy(buffer + offset, &dna->generation, sizeof(uint32_t));
    offset += sizeof(uint32_t);
    memcpy(buffer + offset, &dna->hardware_fingerprint, sizeof(uint64_t));
    offset += sizeof(uint64_t);
    memcpy(buffer + offset, &dna->capabilities_mask, sizeof(uint32_t));
    offset += sizeof(uint32_t);

    return fnv1a_64(buffer, offset);
}

bool bot_dna_verify_integrity(const BotDna* dna) {
    if (!dna) return false;
    return (dna->dna_hash == bot_dna_compute_hash(dna));
}
