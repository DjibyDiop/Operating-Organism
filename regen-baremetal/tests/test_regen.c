/**
 * test_regen.c
 * Automated test suite for regen-baremetal (Hotpatch / Cellular Regeneration)
 */

#include "../include/regen.h"
#include <stdio.h>
#include <assert.h>

void oo_print(const char* msg) {
    printf("%s", msg);
}

int original_val = 100;
int replacement_val = 999;

int target_function(void) {
    return original_val;
}

int replacement_function(void) {
    return replacement_val;
}

int main(void) {
    printf("=== Running Regen-Baremetal Validation ===\n");
    regen_init();

    printf("[Regen] Testing function pointer redirection & stem cell readiness...\n");
    int res_before = target_function();
    assert(res_before == 100);

    /* Note: On modern OS user-mode with NX/WP protection, modifying code bytes directly
       causes a page fault unless mprotect/VirtualProtect is used. Here we test the logic
       in a safe simulation buffer to verify the relative JMP opcode generation. */
    uint8_t buffer[16] = {0x90, 0x90, 0x90, 0x90, 0x90, 0x90};
    void* fake_target = (void*)buffer;
    void* fake_repl   = (void*)(buffer + 100);

    regen_hotpatch(fake_target, fake_repl);
    assert(buffer[0] == 0xE9); // E9 is relative JMP opcode x86
    int32_t jump_offset = *(int32_t*)(buffer + 1);
    assert(jump_offset == 95); // 100 - 5 bytes for JMP instruction

    printf("=== [PASS] Regen-Baremetal Hotpatch x86 Opcode Generation verified ===\n");
    return 0;
}
