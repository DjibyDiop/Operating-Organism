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

static uint64_t heap_base  = 0;
static uint64_t heap_limit = 0;
static int g_posture_balanced = 1;

#ifndef PROPRIOCEPTION_HOST
#include <efi.h>
#include <efilib.h>
#endif

static void proprioception_seed_canary(void) {
    uint64_t sp = 0;
#if defined(__x86_64__) || defined(_M_X64)
    __asm__ volatile ("mov %%rsp, %0" : "=r"(sp));
#endif
    if (sp > 16) {
        stack_canary_addr = (uint64_t*)(uintptr_t)(sp - 8);
        *stack_canary_addr = stack_canary_value;
    }
}

void proprioception_init(void) {
    oo_print("[Proprioception] Body awareness initialized. Monitoring stack + heap posture.\n");

#ifdef PROPRIOCEPTION_HOST
    heap_base = 0x100000ULL;
    heap_limit = 0x40000000ULL;
#else
    UINTN MemoryMapSize = 0;
    EFI_MEMORY_DESCRIPTOR *MemoryMap = NULL;
    UINTN MapKey, DescriptorSize;
    UINT32 DescriptorVersion;

    uefi_call_wrapper(BS->GetMemoryMap, 5, &MemoryMapSize, MemoryMap, &MapKey, &DescriptorSize, &DescriptorVersion);
    MemoryMapSize += 4 * DescriptorSize;

    if (uefi_call_wrapper(BS->AllocatePool, 3, EfiLoaderData, MemoryMapSize, (void**)&MemoryMap) == EFI_SUCCESS) {
        if (!EFI_ERROR(uefi_call_wrapper(BS->GetMemoryMap, 5, &MemoryMapSize, MemoryMap, &MapKey, &DescriptorSize, &DescriptorVersion))) {
            uint64_t max_addr = 0;
            uint64_t min_addr = 0xFFFFFFFFFFFFFFFFULL;
            UINTN NumEntries = MemoryMapSize / DescriptorSize;
            EFI_MEMORY_DESCRIPTOR *Desc = MemoryMap;
            for (UINTN i = 0; i < NumEntries; i++) {
                if (Desc->Type == EfiConventionalMemory || Desc->Type == EfiLoaderData || Desc->Type == EfiLoaderCode) {
                    if (Desc->PhysicalStart < min_addr) min_addr = Desc->PhysicalStart;
                    uint64_t end = Desc->PhysicalStart + (Desc->NumberOfPages * 4096);
                    if (end > max_addr) max_addr = end;
                }
                Desc = (EFI_MEMORY_DESCRIPTOR*)((UINT8*)Desc + DescriptorSize);
            }
            if (min_addr != 0xFFFFFFFFFFFFFFFFULL) {
                heap_base = min_addr;
                heap_limit = max_addr;
            }
        }
        uefi_call_wrapper(BS->FreePool, 1, MemoryMap);
    }
#endif

    proprioception_seed_canary();
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
        g_posture_balanced = 0;
        globule_t alarm;
        alarm.type         = GLOBULE_WHITE;
        alarm.source_organ = 0x09;  /* ORGAN_PROPRIOCEPTION */
        alarm.target_organ = 0xFF;  /* Broadcast */
        alarm.payload_addr = 0;
        alarm.payload_size = 0;
        united_bus_pump(alarm);
    } else {
        g_posture_balanced = 1;
    }
}

int proprioception_is_balanced(void) {
    return g_posture_balanced;
}
