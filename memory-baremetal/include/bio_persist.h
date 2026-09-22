/*
 * bio_persist.h — NeuralFS Persistent Memory & Soma-DNA Journal
 *
 * Provides robust crash-resistant journaled persistent storage on flash/disk.
 * Implements CRC32 checksummed records, automatic rollback on corrupted entries,
 * and zero-mock real I/O via the OO Storage layer.
 */

#ifndef BIO_PERSIST_H
#define BIO_PERSIST_H

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

#define NEURAL_FS_MAGIC        0x4E455552 /* "NEUR" */
#define NEURAL_FS_ENTRY_MAGIC  0x454E5452 /* "ENTR" */
#define NEURAL_FS_MAX_KEY_LEN  64
#define NEURAL_FS_MAX_PAYLOAD  4096

typedef struct {
    uint32_t magic;           /* NEURAL_FS_ENTRY_MAGIC */
    uint32_t sequence;        /* Monotonically increasing */
    char     key[NEURAL_FS_MAX_KEY_LEN];
    uint32_t payload_len;
    uint32_t checksum_crc32;
    uint32_t is_deleted;
    uint8_t  payload[NEURAL_FS_MAX_PAYLOAD];
} neural_fs_entry_t;

typedef struct {
    uint32_t magic;           /* NEURAL_FS_MAGIC */
    uint32_t version;
    uint32_t total_entries;
    uint32_t valid_entries;
    uint64_t sector_base;
    uint64_t sector_count;
} neural_fs_header_t;

/* Initialize NeuralFS with underlying block storage */
int bio_persist_init(uint64_t sector_base, uint64_t sector_count);

/* Write a journaled entry with CRC32 verification */
int bio_persist_write(const char *key, const void *data, size_t size);

/* Read the latest valid entry for key */
int bio_persist_read(const char *key, void *buf, size_t max_size);

/* Check if a valid entry exists */
int bio_persist_exists(const char *key);

/* Delete an entry by writing a tombstone */
int bio_persist_delete(const char *key);

/* Flush unwritten journal pages to disk */
int bio_persist_flush(void);

/* Format / reset the persistent journal */
int bio_persist_format(void);

/* Calculate CRC32 */
uint32_t bio_persist_crc32(const void *buf, size_t len);

#ifdef __cplusplus
}
#endif

#endif /* BIO_PERSIST_H */
