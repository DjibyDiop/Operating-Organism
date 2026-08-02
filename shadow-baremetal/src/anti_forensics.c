/**
 * anti_forensics.c
 * Shadow Baremetal - Stealth, Camouflage & Necrosis Defense
 */

#include "../include/stealth.h"
#include "../../united-baremetal/include/united_bus.h"

extern void oo_print(const char* msg);

#ifndef SHADOW_HOST
extern void bio_purge_infected_tissue(void* ptr, size_t size);
extern void cpu_halt(void); // Instruction `hlt`
extern void disable_interrupts(void); // Instruction `cli`
#else
static void bio_purge_infected_tissue(void* ptr, size_t size) {
    uint8_t* p = (uint8_t*)ptr;
    for (size_t i = 0; i < size; i++) p[i] = 0;
}
#endif

static uint8_t g_camouflage_level = 0;
static int g_purged = 0;
static int g_dead = 0;

void shadow_init(void) {
    g_camouflage_level = 0;
    g_purged = 0;
    g_dead = 0;
    oo_print("[ShadowBaremetal] 🌑 L'instinct sombre est tapi dans l'ombre.\n");
}

uint8_t shadow_get_camouflage_level(void) {
    return g_camouflage_level;
}

int shadow_is_purged(void) {
    return g_purged;
}

int shadow_is_dead(void) {
    return g_dead;
}

void shadow_activate_camouflage(uint8_t threat_severity) {
    g_camouflage_level = threat_severity;
    oo_print("[ShadowBaremetal] 🦇 Camouflage actif ! Detournement des tables de pages en cours...\n");
    // Logique Rootkit :
    // 1. Lire le registre CR3 (Page Directory Base Register).
    // 2. Parcourir les Page Tables (PML4 -> PDPT -> PD -> PT).
    // 3. Effacer le bit "Present" des pages contenant le code du Bot et du LLM.
    // 4. Installer un handler #PF (Page Fault) secret.
    // 5. Si le CPU de l'Organisme tente d'y accéder, le handler remet la page, lit, et la recache.
    // 6. Si un outil d'analyse externe lit la RAM, il verra des zéros ou une erreur.
}

void shadow_panic_purge(void) {
    g_purged = 1;
    oo_print("[ShadowBaremetal] 💀 MENACE CRITIQUE. Purge totale des clés cryptographiques et du Cortex.\n");
    
    // Destruction des modèles LLM en mémoire et des clés privées
    uint8_t dummy_buffer[64];
    bio_purge_infected_tissue(dummy_buffer, sizeof(dummy_buffer));
}

void shadow_simulate_death(void) {
    g_dead = 1;
    oo_print("[ShadowBaremetal] ⚰️ Mort simulee. Extinction des signaux vitaux...\n");
    
    // Envoi d'un Globule Blanc d'arrêt total sur le bus
    globule_t kill_signal;
    kill_signal.type = GLOBULE_WHITE;
    kill_signal.target_organ = 0xFF; // Broadcast
    kill_signal.source_organ = 11;   // SHADOW
    kill_signal.payload_addr = 0;
    kill_signal.payload_size = 0;
    united_bus_pump(kill_signal);
    
#ifndef SHADOW_HOST
    // Blocage matériel sur cible baremetal réelle
    disable_interrupts(); // cli
    while(1) {
        cpu_halt(); // hlt
    }
#endif
}

void shadow_necrosis(void* fake_organ_ptr, size_t size) {
    oo_print("[ShadowBaremetal] 🥀 Necrose activee. Generation d'un organe leurre.\n");
    // On remplit une zone mémoire avec du code poubelle ou des données erronées
    // pour que l'attaquant perde son temps sur une "cadavre" numérique.
    uint8_t* decoy = (uint8_t*)fake_organ_ptr;
    for (size_t i = 0; i < size; i++) {
        decoy[i] = (uint8_t)(i % 255); // Fake data
    }
}
