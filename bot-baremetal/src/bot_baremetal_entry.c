#include "../include/bot_baremetal.h"
#include "../instinct/instinct_layer.h"
#include "../instinct/threat_levels.h"
#include "../../united-baremetal/include/united_bus.h"
#include <stdint.h>

/* Global instinct layer — accessible by organ_bus */
static InstinctLayer _bot_instinct;
static uint8_t _bot_initialized = 0;

/* ─── Callbacks câblés à l'InstinctLayer ─────────────────────────────────── */

/**
 * Callback : une menace a atteint un niveau nécessitant une alerte SwarmMind.
 * On traduit l'alerte en un GLOBULE_WHITE sur le bus — c'est ainsi que le
 * Scheduler (kernel-baremetal) reçoit l'ordre de passer en OO_STATE_COMBAT.
 */
static void _on_swarm_alert_cb(uint8_t threat_level, TriggerType trigger_type) {
    /* On ne publie que si le niveau est significatif (>= ALERT = 2) */
    if (threat_level < 2) return;

    globule_t g;
    g.globule_id   = 0;              /* Assigné par le bus */
    g.type         = GLOBULE_WHITE;  /* Globule immunitaire — priorité maximale */
    g.source_organ = ORGAN_IMMUNE;   /* 2 = ORGAN_IMMUNE */
    g.target_organ = ORGAN_BROADCAST;/* 0xFF — tous les organes */
    g.payload_addr = (void*)(uintptr_t)(uint32_t)trigger_type; /* Type de déclencheur */
    g.payload_size = (uint32_t)threat_level;                    /* Niveau de menace */

    int result = united_bus_pump(g);
    (void)result; /* En baremetal, on ne peut pas gérer l'échec ici */
}

/**
 * Callback : une menace critique nécessite une alerte directe au LLM via le bus.
 * Émet un GLOBULE_WHITE avec une description textuelle.
 */
static void _on_oo_bridge_alert_cb(uint8_t threat_level, const char *description) {
    (void)description; /* En baremetal, pas de malloc pour copier la string */
    if (threat_level < 3) return; /* Seulement COMBAT et SURVIVAL */
    _on_swarm_alert_cb(threat_level, 0xFF);
}

/**
 * Callback : mise en quarantaine d'un processus.
 * Émet un GLOBULE_WHITE ciblé vers le kernel (ORGAN_SOMA id=1).
 */
static void _on_quarantine_cb(uint32_t pid, uint64_t addr) {
    globule_t g;
    g.globule_id   = 0;
    g.type         = GLOBULE_WHITE;
    g.source_organ = ORGAN_IMMUNE;
    g.target_organ = ORGAN_SOMA;     /* Ciblé vers le Soma/Kernel */
    g.payload_addr = (void*)(uintptr_t)addr;
    g.payload_size = pid;
    united_bus_pump(g);
}

/**
 * Callback : coupure réseau.
 * Émet un GLOBULE_YELLOW de contrôle vers le SENSORY (drivers réseau).
 */
static void _on_network_cut_cb(int full_cut) {
    globule_t g;
    g.globule_id   = 0;
    g.type         = GLOBULE_YELLOW; /* Signal de contrôle */
    g.source_organ = ORGAN_IMMUNE;
    g.target_organ = ORGAN_SENSORY;  /* 4 = drivers réseau */
    g.payload_addr = (void*)0;
    g.payload_size = full_cut ? 0xDEADu : 0xC07Au; /* 0xDEAD=total cut, 0xC07A=targeted cut */
    united_bus_pump(g);
}

/**
 * Callback : déploiement d'un honey trap.
 * Émet un GLOBULE_YELLOW vers le COLLECTIVE (Go / swarm communication).
 */
static void _on_honeytrap_deploy_cb(uint64_t addr) {
    globule_t g;
    g.globule_id   = 0;
    g.type         = GLOBULE_YELLOW;
    g.source_organ = ORGAN_IMMUNE;
    g.target_organ = ORGAN_COLLECTIVE; /* 5 = Go / swarm */
    g.payload_addr = (void*)(uintptr_t)addr;
    g.payload_size = 0xBEEF;           /* Code "honeytrap deployed" */
    united_bus_pump(g);
}

/**
 * Callback : demande de régénération d'un agent.
 * Simple broadcast YELLOW pour informer le vital-baremetal.
 */
static void _on_regen_request_cb(uint8_t agent_role) {
    united_bus_broadcast_yellow(ORGAN_IMMUNE, (uint32_t)agent_role);
}

/* ─── API Publique ────────────────────────────────────────────────────────── */

void bot_baremetal_init(void) {
    instinct_init(&_bot_instinct);

    /* Câblage de tous les callbacks vers le bus sanguin */
    _bot_instinct.on_swarm_alert      = _on_swarm_alert_cb;
    _bot_instinct.on_oo_bridge_alert  = _on_oo_bridge_alert_cb;
    _bot_instinct.on_quarantine       = _on_quarantine_cb;
    _bot_instinct.on_network_cut      = _on_network_cut_cb;
    _bot_instinct.on_honeytrap_deploy = _on_honeytrap_deploy_cb;
    _bot_instinct.on_regen_request    = _on_regen_request_cb;

    _bot_initialized = 1;
}

/* Phase 6F: return current threat level (0=dormant, 255=critical) */
uint8_t bot_get_threat_level(void) {
    if (!_bot_initialized) return 0;
    return instinct_current_level(&_bot_instinct);
}

/**
 * Phase 7: Pulse du système immunitaire — appelé par le vital heartbeat.
 * Permet au vital-baremetal de déclencher un scan immunitaire à chaque cycle.
 * En pratique, ceci sera remplacé par un appel depuis le swarm_mind Rust.
 */
void bot_baremetal_pulse(void) {
    if (!_bot_initialized) return;
    /* Placeholder : en production, le SwarmMind Rust est le coordinateur.
     * Cette fonction permet l'intégration C pure sans dépendance Rust. */
}

void bot_baremetal_trigger(uint32_t trigger_type, uint32_t pid, uint64_t addr, uint32_t confidence) {
    if (!_bot_initialized) return;
    instinct_trigger(&_bot_instinct, (TriggerType)trigger_type, pid, addr, confidence);
}

int bot_baremetal_reset_threat(const char* reason) {
    if (!_bot_initialized) return -1;
    return instinct_reset_to_dormant(&_bot_instinct, reason);
}
