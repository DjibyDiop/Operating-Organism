#include "../include/lungs.h"
#include "../../united-baremetal/include/united_bus.h"

extern void oo_print(const char* msg);

#include "wifi_core.h"

// Aether-Fabric Rust FFI (weak fallbacks when libaether_fabric is not linked)
__attribute__((weak)) int aether_fabric_init(const uint8_t* node_id_buf) {
    (void)node_id_buf;
    return 0;
}
__attribute__((weak)) int aether_fabric_receive(const uint8_t* payload_buf, size_t payload_len) {
    (void)payload_buf;
    (void)payload_len;
    return -1;
}

static oo_respiration_stats_t global_stats = {0, 0};

void network_init(void) {
    oo_print("[NetworkBaremetal] 🌐 Systeme respiratoire initialise. Attente du lien NIC...\n");
    // Initialisation des drivers NIC (ex: Intel e1000 ou Realtek)
    global_stats.link_up = 1; 
    
    // Init Wi-Fi Core
    wifi_core_init();

    // Init Aether-Fabric with a dummy NodeId for now
    uint8_t dummy_id[16] = {1, 2, 3, 4};
    aether_fabric_init(dummy_id);
    oo_print("[Aether-Fabric] 🌌 P2P module initialized.\n");
}

void network_inhale(const uint8_t* frame, size_t size) {
    if (!frame || size == 0) return;

    // Route packet to Aether-Fabric P2P layer
    if (aether_fabric_receive(frame, size) == 0) {
        // Handled completely by Aether-Fabric
        return;
    }

    // Simulation de classification (Bronches)
    globule_type_t type = GLOBULE_RED;
    if (size < 64) {
        // Les petits paquets sont souvent des signaux de contrôle/keepalive
        type = GLOBULE_YELLOW;
    }
    
    // Conversion en Globule
    globule_t cell;
    cell.type = type;
    cell.source_organ = ORGAN_SENSORY; // 4 = ORGAN_SENSORY (Drivers / I/O)
    cell.target_organ = (type == GLOBULE_YELLOW) ? 3 : 0; // Kernel vs Cortex
    
    cell.payload_addr = (void*)frame;
    cell.payload_size = (uint32_t)size;
    
    if (united_bus_pump(cell) == 0) {
        global_stats.breath_rate++;
    } else {
        oo_print("[NetworkBaremetal] ⚠️ Congestion pulmonaire ! Impossible d'inhaler le paquet.\n");
    }
}

void network_exhale(const uint8_t* data, size_t size) {
    if (!data || size == 0) return;
    
    // Transmission physique sur le câble
    // nic_transmit(data, size);
    oo_print("[NetworkBaremetal] 💨 Expiration de donnees vers l'exterieur.\n");
}

void network_get_stats(oo_respiration_stats_t* stats) {
    if (stats) *stats = global_stats;
}
