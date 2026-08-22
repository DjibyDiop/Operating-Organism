#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>
#include <windows.h>

/* Use exact protocol from OPI-baremetal */
#include "../../OPI-baremetal/oo-net/core/hermes_mesh.h"

// Forward declarations
extern void hermes_mesh_init(void);
extern void hermes_poll_network(void);
extern int hermes_send_packet(HermesPacket* pkt, size_t payload_len);

// NBIA (Rust) FFI exports
extern void nbia_init(void);
extern void nbia_tick(void);
extern void nbia_handle_hermes(const uint8_t* pkt_ptr, size_t len);

// Provide oo_print for united_bus.c (bot doesn't have the full kernel console)
void oo_print(const char* str) {
    printf("%s", str);
}

int main(int argc, char** argv) {
    printf("==========================================\n");
    printf("    OO BOT-BAREMETAL (Sovereign Organ)    \n");
    printf("==========================================\n");
    
    // 1. Initialize NO-MOCK UDP Hermes Mesh
    printf("[Core] Initializing Hermes Mesh (Winsock UDP)...\n");
    hermes_mesh_init();
    
    // 2. Initialize NBIA Reflex Engine (D+ VM)
    printf("[Core] Initializing NBIA Reflex Engine...\n");
    nbia_init();
    
    // 3. Main Bot Loop
    printf("[Core] Entering Homeostasis Loop...\n");
    while (1) {
        // Poll for incoming Hermes messages from OPI or other organs
        hermes_poll_network();
        
        // Execute D+ / Reflex engine step
        nbia_tick();
        
        // Sleep to yield CPU (10ms tick equivalent)
        Sleep(10);
    }
    
    return 0;
}
