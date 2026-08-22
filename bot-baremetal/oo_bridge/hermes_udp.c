#include <winsock2.h>
#include <ws2tcpip.h>
#include <stdio.h>
#include <stdint.h>

/* Use OPI-baremetal's Hermes Mesh definition to ensure exact protocol match */
#include "../../OPI-baremetal/oo-net/core/hermes_mesh.h"

/* We define stats here since we don't link the OPI hermes_mesh.c */
HermesMeshStats g_hermes_stats;

static SOCKET g_udp_socket = INVALID_SOCKET;
static struct sockaddr_in g_broadcast_addr;

void hermes_mesh_init(void) {
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) {
        printf("[Hermes] Winsock init failed.\n");
        return;
    }

    g_udp_socket = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
    if (g_udp_socket == INVALID_SOCKET) {
        printf("[Hermes] Socket creation failed.\n");
        return;
    }

    /* Enable broadcast */
    int opt_broadcast = 1;
    setsockopt(g_udp_socket, SOL_SOCKET, SO_BROADCAST, (char*)&opt_broadcast, sizeof(opt_broadcast));

    /* Enable reuse address so multiple bots can test on same PC */
    int opt_reuse = 1;
    setsockopt(g_udp_socket, SOL_SOCKET, SO_REUSEADDR, (char*)&opt_reuse, sizeof(opt_reuse));

    struct sockaddr_in recv_addr;
    recv_addr.sin_family = AF_INET;
    recv_addr.sin_port = htons(HERMES_PORT);
    recv_addr.sin_addr.s_addr = INADDR_ANY;

    if (bind(g_udp_socket, (struct sockaddr*)&recv_addr, sizeof(recv_addr)) == SOCKET_ERROR) {
        printf("[Hermes] Bind failed on port %d.\n", HERMES_PORT);
    } else {
        printf("[Hermes] UDP Mesh listening on %d.\n", HERMES_PORT);
    }

    /* Setup broadcast address */
    g_broadcast_addr.sin_family = AF_INET;
    g_broadcast_addr.sin_port = htons(HERMES_PORT);
    g_broadcast_addr.sin_addr.s_addr = INADDR_BROADCAST;

    /* Non-blocking mode */
    u_long mode = 1;
    ioctlsocket(g_udp_socket, FIONBIO, &mode);
    
    memset(&g_hermes_stats, 0, sizeof(g_hermes_stats));
}

int hermes_send_packet(HermesPacket* pkt, size_t payload_len) {
    if (g_udp_socket == INVALID_SOCKET || !pkt) return -1;
    
    pkt->magic = HERMES_MAGIC;
    pkt->payload_len = payload_len;
    size_t pkt_len = sizeof(HermesPacket) + payload_len;
    
    int res = sendto(g_udp_socket, (char*)pkt, (int)pkt_len, 0, (struct sockaddr*)&g_broadcast_addr, sizeof(g_broadcast_addr));
    return res > 0 ? 0 : -1;
}

void hermes_poll_network(void) {
    if (g_udp_socket == INVALID_SOCKET) return;

    char buffer[4096];
    struct sockaddr_in sender_addr;
    int sender_len = sizeof(sender_addr);

    while (1) {
        int bytes = recvfrom(g_udp_socket, buffer, sizeof(buffer), 0, (struct sockaddr*)&sender_addr, &sender_len);
        if (bytes == SOCKET_ERROR) {
            if (WSAGetLastError() == WSAEWOULDBLOCK) {
                break; /* No more packets */
            }
            break;
        }

        if (bytes >= (int)sizeof(HermesPacket)) {
            HermesPacket* pkt = (HermesPacket*)buffer;
            
            if (pkt->magic == HERMES_MAGIC) {
                printf("[Hermes] RX Type: %d, Len: %u from %s\n", pkt->type, pkt->payload_len, inet_ntoa(sender_addr.sin_addr));
                
                /* Route to Bot Reflex Engine / Instinct Layer */
                extern void nbia_handle_hermes(const uint8_t* pkt_ptr, size_t len);
                nbia_handle_hermes((const uint8_t*)buffer, bytes);
                
                g_hermes_stats.rx_packets++;
                g_hermes_stats.rx_bytes += bytes;
            } else {
                g_hermes_stats.dropped_magic++;
            }
        }
    }
}
