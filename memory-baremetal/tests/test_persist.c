/*
 * test_persist.c — Validation test for NeuralFS persistent memory
 */

#include <stdio.h>
#include <string.h>
#include <assert.h>
#include "../include/bio_persist.h"

void oo_print(const char *msg) {
    printf("%s", msg);
}

int main(void) {
    printf("=== [TEST] OO Memory Baremetal Persistent NeuralFS Test ===\n");

    int res = bio_persist_init(0, 10000);
    assert(res == 0);

    const char *key1 = "ORGANISM_CONFIG";
    const char *val1 = "MODE=SOUVERAIN;HOMEOSTASIS=STABLE;ENERGY=100";

    res = bio_persist_write(key1, val1, strlen(val1) + 1);
    assert(res == 0);

    assert(bio_persist_exists(key1) == 1);

    char read_buf[256];
    memset(read_buf, 0, sizeof(read_buf));
    int bytes_read = bio_persist_read(key1, read_buf, sizeof(read_buf));
    assert(bytes_read > 0);
    assert(strcmp(read_buf, val1) == 0);
    printf("  Verified record '%s': '%s'\n", key1, read_buf);

    /* Update record with new state (journal versioning) */
    const char *val2 = "MODE=COMBAT;HOMEOSTASIS=ALERT;ENERGY=85";
    res = bio_persist_write(key1, val2, strlen(val2) + 1);
    assert(res == 0);

    memset(read_buf, 0, sizeof(read_buf));
    bytes_read = bio_persist_read(key1, read_buf, sizeof(read_buf));
    assert(bytes_read > 0);
    assert(strcmp(read_buf, val2) == 0);
    printf("  Verified updated journal record '%s': '%s'\n", key1, read_buf);

    /* Flush */
    res = bio_persist_flush();
    assert(res == 0);

    printf("=== [SUCCESS] Persistent Memory NeuralFS Validation PASSED ===\n");
    return 0;
}
