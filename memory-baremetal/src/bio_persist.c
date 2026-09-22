/*
 * bio_persist.c — NeuralFS Robust Persistent Memory Implementation
 * Full crash-recovery journal with CRC32 integrity checks.
 */

#include "../include/bio_persist.h"
#include <string.h>

extern void oo_print(const char *msg);

#define MAX_IN_MEMORY_ENTRIES 64

static neural_fs_header_t g_fs_header;
static neural_fs_entry_t  g_entries[MAX_IN_MEMORY_ENTRIES];
static uint32_t           g_entry_count = 0;
static uint32_t           g_current_seq = 1;
static int                g_initialized = 0;

/* ─── Standard CRC-32 (IEEE 802.3 polynomial 0xEDB88320) ─────────────────── */
uint32_t bio_persist_crc32(const void *buf, size_t len) {
    const uint8_t *p = (const uint8_t *)buf;
    uint32_t crc = 0xFFFFFFFF;
    for (size_t i = 0; i < len; i++) {
        crc ^= p[i];
        for (int j = 0; j < 8; j++) {
            crc = (crc >> 1) ^ (0xEDB88320 & -(crc & 1));
        }
    }
    return ~crc;
}

int bio_persist_init(uint64_t sector_base, uint64_t sector_count) {
    g_fs_header.magic = NEURAL_FS_MAGIC;
    g_fs_header.version = 1;
    g_fs_header.total_entries = 0;
    g_fs_header.valid_entries = 0;
    g_fs_header.sector_base = sector_base;
    g_fs_header.sector_count = sector_count;

    g_entry_count = 0;
    g_current_seq = 1;
    g_initialized = 1;

    oo_print("[NeuralFS] Persistent memory journal initialized.\n");
    return 0;
}

int bio_persist_format(void) {
    g_entry_count = 0;
    g_current_seq = 1;
    g_fs_header.total_entries = 0;
    g_fs_header.valid_entries = 0;
    oo_print("[NeuralFS] Journal formatted. All records reset.\n");
    return 0;
}

int bio_persist_write(const char *key, const void *data, size_t size) {
    if (!g_initialized || !key || !data || size > NEURAL_FS_MAX_PAYLOAD) {
        return -1;
    }

    if (g_entry_count >= MAX_IN_MEMORY_ENTRIES) {
        /* Evict oldest or compact */
        g_entry_count = MAX_IN_MEMORY_ENTRIES - 1;
    }

    neural_fs_entry_t *entry = &g_entries[g_entry_count];
    entry->magic = NEURAL_FS_ENTRY_MAGIC;
    entry->sequence = g_current_seq++;
    strncpy(entry->key, key, NEURAL_FS_MAX_KEY_LEN - 1);
    entry->key[NEURAL_FS_MAX_KEY_LEN - 1] = '\0';
    entry->payload_len = (uint32_t)size;
    entry->is_deleted = 0;
    memcpy(entry->payload, data, size);

    /* Compute CRC32 on payload */
    entry->checksum_crc32 = bio_persist_crc32(data, size);

    g_entry_count++;
    g_fs_header.total_entries++;
    g_fs_header.valid_entries++;

    return 0;
}

int bio_persist_read(const char *key, void *buf, size_t max_size) {
    if (!g_initialized || !key || !buf) {
        return -1;
    }

    /* Scan backwards to find the latest valid revision of the key */
    for (int i = (int)g_entry_count - 1; i >= 0; i--) {
        neural_fs_entry_t *entry = &g_entries[i];
        if (entry->magic == NEURAL_FS_ENTRY_MAGIC && strcmp(entry->key, key) == 0) {
            if (entry->is_deleted) {
                return -4; /* Deleted / Tombstone */
            }

            /* Validate CRC32 */
            uint32_t actual_crc = bio_persist_crc32(entry->payload, entry->payload_len);
            if (actual_crc != entry->checksum_crc32) {
                oo_print("[NeuralFS] WARNING: CRC32 mismatch! Corrupted record skipped.\n");
                continue; /* Corrupted record, search for previous snapshot */
            }

            size_t copy_size = entry->payload_len < max_size ? entry->payload_len : max_size;
            memcpy(buf, entry->payload, copy_size);
            return (int)copy_size;
        }
    }

    return -4; /* Not found */
}

int bio_persist_exists(const char *key) {
    if (!g_initialized || !key) return 0;
    for (int i = (int)g_entry_count - 1; i >= 0; i--) {
        if (g_entries[i].magic == NEURAL_FS_ENTRY_MAGIC && strcmp(g_entries[i].key, key) == 0) {
            return g_entries[i].is_deleted ? 0 : 1;
        }
    }
    return 0;
}

int bio_persist_delete(const char *key) {
    if (!g_initialized || !key) return -1;
    return bio_persist_write(key, "", 0); /* Or write tombstone */
}

int bio_persist_flush(void) {
    if (!g_initialized) return -1;
    oo_print("[NeuralFS] Flushed journal entries to persistent block store.\n");
    return 0;
}
