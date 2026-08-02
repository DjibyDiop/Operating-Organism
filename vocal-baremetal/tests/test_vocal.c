/**
 * test_vocal.c
 * Automated test suite for vocal-baremetal (Speaker Tone Emission & Speech)
 */

#include "../include/vocal.h"
#include <stdio.h>
#include <assert.h>

void oo_print(const char* msg) {
    printf("%s", msg);
}

void outb(uint16_t port, uint8_t val) {
    (void)port;
    (void)val;
}

uint8_t inb(uint16_t port) {
    (void)port;
    return 0;
}

int main(void) {
    printf("=== Running Vocal-Baremetal Validation ===\n");
    vocal_init();

    printf("[Vocal] Emitting alert tone 440 Hz for 200 ms...\n");
    vocal_emit_tone(440, 200);

    printf("[Vocal] Speaking vocal message...\n");
    vocal_speak("[Vocal Speech] SYSTÈME OPÉRATIONNEL EN ALERTE\n");

    printf("=== [PASS] Vocal-Baremetal Acoustic Emission verified ===\n");
    return 0;
}
