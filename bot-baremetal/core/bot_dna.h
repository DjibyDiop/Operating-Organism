#ifndef BOT_DNA_H
#define BOT_DNA_H

#include <stdint.h>
#include <stdbool.h>

#define BOT_NAME_MAX_LEN 32

typedef struct {
    char name[BOT_NAME_MAX_LEN];
    uint32_t generation;
    uint64_t hardware_fingerprint;
    uint64_t dna_hash;
    uint32_t capabilities_mask;
} BotDna;

void bot_dna_init(BotDna* dna, const char* name, uint32_t generation, uint64_t hw_fingerprint, uint32_t caps);
uint64_t bot_dna_compute_hash(const BotDna* dna);
bool bot_dna_verify_integrity(const BotDna* dna);

#endif // BOT_DNA_H
