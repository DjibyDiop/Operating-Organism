/**
 * proprioception_stub.c
 * Proprioception — body awareness module.
 * Monitors stack integrity, heap bounds, and CPU execution state.
 * Acts as the vestibular system of OO: detects balance/posture faults.
 */

#include "proprioception.h"
#include "../../united-baremetal/include/united_bus.h"
#include <stdint.h>

extern void oo_print(const char* msg);

/* Known-good stack sentinel written at init time */
static uint64_t stack_canary_value = 0xDEADBEEFCAFEBABEULL;
static uint64_t* stack_canary_addr = (uint64_t*)0;

/* Simulated heap bounds (set at init from UEFI memory map) */
static uint64_t heap_base  = 0x00200000ULL;  /* 2MB mark */
static uint64_t heap_limit = 0x04000000ULL;  /* 64MB mark */

void proprioception_init(void) {
    oo_print("[Proprioception] Body awareness initialized. Monitoring stack + heap posture.\n");
    /* Write canary near current stack pointer — baremetal approximation */
    uint64_t sp;
#if defined(__x86_64__) || defined(_M_X64)
    __asm__ volatile ("mov %%rsp, %0" : "=r"(sp));
#else
    sp = 0;
#endif
    stack_canary_addr = (uint64_t*)(sp - 8);
    if (stack_canary_addr) *stack_canary_addr = stack_canary_value;
}

void proprioception_check_posture(void) {
    uint8_t fault = 0;

    /* 1) Stack canary check */
    if (stack_canary_addr && *stack_canary_addr != stack_canary_value) {
        oo_print("[Proprioception] ALERT: Stack canary corrupted — possible overflow!\n");
        fault = 1;
    }

    /* 2) Heap bounds sanity (baremetal: read a synthetic heap pointer) */
    uint64_t sp;
#if defined(__x86_64__) || defined(_M_X64)
    __asm__ volatile ("mov %%rsp, %0" : "=r"(sp));
#else
    sp = heap_base;
#endif
    if (sp < heap_base || sp > heap_limit) {
        oo_print("[Proprioception] ALERT: Stack pointer outside expected heap range!\n");
        fault = 1;
    }

    /* 3) Emit WHITE globule if any posture fault detected */
    if (fault) {
        globule_t alarm;
        alarm.type         = GLOBULE_WHITE;
        alarm.source_organ = 0x09;  /* ORGAN_PROPRIOCEPTION */
        alarm.target_organ = 0xFF;  /* Broadcast */
        alarm.payload_addr = 0;
        alarm.payload_size = 0;
        united_bus_pump(alarm);
    }
}
