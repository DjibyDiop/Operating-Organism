/**
 * test_network.c
 * Automated test for Network Baremetal (Respiratory System, NIC, Wi-Fi Core & Inhale/Exhale)
 */

#include "../include/lungs.h"
#include "../../united-baremetal/include/united_bus.h"
#include <stdio.h>
#include <assert.h>
#include <string.h>

void oo_print(const char* msg) {
    printf("%s", msg);
}

int main(void) {
    printf("=== Running Network-Baremetal Validation ===\n");
    united_bus_init();
    network_init();

    oo_respiration_stats_t stats;
    network_get_stats(&stats);
    assert(stats.link_up == 1);
    assert(stats.breath_rate == 0);

    // Inhale a small control packet (< 64 bytes) -> GLOBULE_YELLOW
    uint8_t ctrl_pkt[32];
    memset(ctrl_pkt, 0xAA, sizeof(ctrl_pkt));
    network_inhale(ctrl_pkt, sizeof(ctrl_pkt));

    network_get_stats(&stats);
    assert(stats.breath_rate == 1);

    // Inhale a data packet (>= 64 bytes) -> GLOBULE_RED
    uint8_t data_pkt[128];
    memset(data_pkt, 0xBB, sizeof(data_pkt));
    network_inhale(data_pkt, sizeof(data_pkt));

    network_get_stats(&stats);
    assert(stats.breath_rate == 2);

    // Exhale reply
    network_exhale(data_pkt, sizeof(data_pkt));

    printf("=== [PASS] Network-Baremetal Respiratory System & Wi-Fi Core verified ===\n");
    return 0;
}
