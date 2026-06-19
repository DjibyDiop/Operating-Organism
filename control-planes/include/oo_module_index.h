/*
 * oo_module_index.h - Central index of all OO organism modules and drivers
 * 
 * This header provides a unified interface to all modules and organs of the
 * Operating Organism, enabling centralized symbol validation, initialization,
 * and lifecycle management.
 * 
 * DO NOT include this in production code. Use it only for:
 * - Build-time validation scripts
 * - Module registry inspection
 * - Startup initialization sequences
 * - Diagnostic tools
 */

#ifndef OO_MODULE_INDEX_H
#define OO_MODULE_INDEX_H

#include <stdint.h>

/* ===== ORGAN ENUMERATION ===== */
typedef enum {
    ORGAN_UNITED_BUS           = 0,   /* Universal hub / inter-organ communication */
    ORGAN_KERNEL               = 1,   /* CPU, interrupt, task scheduling */
    ORGAN_MEMORY               = 2,   /* Physical memory management, paging */
    ORGAN_REFLEX               = 3,   /* Fast reactive responses, GPIO */
    ORGAN_VITAL                = 4,   /* Heartbeat, homeostasis, vital signs */
    ORGAN_NETWORK              = 5,   /* Network stack, UDP/TCP, packet handling */
    ORGAN_BOT                  = 6,   /* Motor control, immune responses */
    ORGAN_SENSE                = 7,   /* Sensory input, perception */
    ORGAN_PROPRIOCEPTION       = 8,   /* Body awareness, position feedback */
    ORGAN_VOCAL                = 9,   /* Audio output, speech synthesis */
    ORGAN_DREAM                = 10,  /* Pattern consolidation, offline learning */
    ORGAN_EVOLUTION            = 11,  /* Genetic algorithm, agent evolution */
    ORGAN_SHADOW               = 12,  /* Internal modeling, world-model */
    ORGAN_IDENTITY             = 13,  /* Self-model, identity continuity */
    ORGAN_SWARM                = 14,  /* Multi-agent coordination */
    ORGAN_LLM                  = 15,  /* Language model, reasoning */
    ORGAN_MAX                  = 16
} oo_organ_id_t;

/* ===== VITAL CHAIN ===== */
static const oo_organ_id_t oo_vital_chain[] = {
    ORGAN_UNITED_BUS,
    ORGAN_KERNEL,
    ORGAN_MEMORY,
    ORGAN_REFLEX,
    ORGAN_VITAL,
    ORGAN_NETWORK,
    ORGAN_BOT
};

#define OO_VITAL_CHAIN_LENGTH (sizeof(oo_vital_chain) / sizeof(oo_vital_chain[0]))

/* ===== MODULE INITIALIZATION SIGNATURES ===== */

/* Vital chain - MUST succeed for system to boot */
int united_bus_init(void);
int kernel_init(void);
int memory_init(void);
int reflex_init(void);
int vital_init(void);
int network_init(void);
int bot_init(void);

/* Cognitive + IO */
int sense_init(void);
int proprioception_init(void);
int vocal_init(void);
int dream_init(void);
int evolution_init(void);
int shadow_init(void);
int identity_init(void);
int swarm_init(void);
int llm_init(void);

/* ===== MODULE INTERFACE REGISTRY ===== */
typedef struct {
    const char *name;
    oo_organ_id_t id;
    int (*init)(void);
    int (*shutdown)(void);
    int (*health_check)(void);
} oo_module_t;

/* Extern declarations for module registry lookup */
extern const oo_module_t oo_modules[ORGAN_MAX];

/* ===== SYMBOL VALIDATION MACROS ===== */
#define OO_ASSERT_MODULE_EXPORTS(organ_id) \
    do { \
        if (oo_modules[organ_id].init == NULL) { \
            oo_panic("Module %s has no init function", oo_modules[organ_id].name); \
        } \
    } while(0)

#define OO_MODULE_DECLARE(name, id, init_fn, shutdown_fn, health_fn) \
    const oo_module_t oo_module_##name = { \
        .name = #name, \
        .id = id, \
        .init = init_fn, \
        .shutdown = shutdown_fn, \
        .health_check = health_fn \
    }

/* ===== BOOT SEQUENCE ===== */
int oo_boot_vital_chain(void);
int oo_boot_all_modules(void);

/* ===== DIAGNOSTICS ===== */
void oo_module_print_registry(void);
int oo_module_validate_symbols(void);

#endif /* OO_MODULE_INDEX_H */
