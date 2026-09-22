#include <stdio.h>
#include <stdint.h>
#include <string.h>

#if defined(_WIN32)
#include <winsock2.h>
#include <ws2tcpip.h>
typedef int socklen_t;
#else
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>
typedef int SOCKET;
#define INVALID_SOCKET (-1)
#define SOCKET_ERROR   (-1)
#define closesocket(s) close(s)
#endif

/* Use OPI-baremetal's Hermes Mesh definition to ensure exact protocol match */
#include "../../OPI-baremetal/oo-net/core/hermes_mesh.h"

HermesMeshStats g_hermes_stats;

static SOCKET g_udp_socket = INVALID_SOCKET;
static struct sockaddr_in g_broadcast_addr;

/* D+ Perception FFI Bridge */
extern void dplus_ingest_perception(uint32_t perception_id, uint32_t value);
extern void nbia_handle_hermes(const uint8_t* pkt_ptr, size_t len);

static uint32_t hash_perception(const char* name) {
    uint32_t hash = 0x811c9dc5;
    for (int i = 0; name[i]; i++) {
        hash ^= (uint32_t)name[i];
        hash *= 0x01000193;
    }
    return hash;
}

void hermes_mesh_init(void) {
#if defined(_WIN32)
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) {
        printf("[Hermes] Winsock init failed.\n");
        return;
    }
#endif

    g_udp_socket = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
    if (g_udp_socket == INVALID_SOCKET) {
        printf("[Hermes] Socket creation failed.\n");
        return;
    }

    /* Enable broadcast */
    int opt_broadcast = 1;
    setsockopt(g_udp_socket, SOL_SOCKET, SO_BROADCAST, (const char*)&opt_broadcast, sizeof(opt_broadcast));

    /* Enable reuse address so multiple bots can test on same PC */
    int opt_reuse = 1;
#if defined(SO_REUSEPORT)
    setsockopt(g_udp_socket, SOL_SOCKET, SO_REUSEPORT, (const char*)&opt_reuse, sizeof(opt_reuse));
#endif
    setsockopt(g_udp_socket, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt_reuse, sizeof(opt_reuse));

    struct sockaddr_in recv_addr;
    memset(&recv_addr, 0, sizeof(recv_addr));
    recv_addr.sin_family = AF_INET;
    recv_addr.sin_port = htons(HERMES_PORT);
    recv_addr.sin_addr.s_addr = INADDR_ANY;

    if (bind(g_udp_socket, (struct sockaddr*)&recv_addr, sizeof(recv_addr)) == SOCKET_ERROR) {
        printf("[Hermes] Bind notice on port %d (local client mode active).\n", HERMES_PORT);
    } else {
        printf("[Hermes] UDP Mesh listening on %d.\n", HERMES_PORT);
    }

    /* Setup broadcast address */
    memset(&g_broadcast_addr, 0, sizeof(g_broadcast_addr));
    g_broadcast_addr.sin_family = AF_INET;
    g_broadcast_addr.sin_port = htons(HERMES_PORT);
    g_broadcast_addr.sin_addr.s_addr = INADDR_BROADCAST;

    /* Non-blocking mode */
#if defined(_WIN32)
    u_long mode = 1;
    ioctlsocket(g_udp_socket, FIONBIO, &mode);
#else
    int flags = fcntl(g_udp_socket, F_GETFL, 0);
    fcntl(g_udp_socket, F_SETFL, flags | O_NONBLOCK);
#endif
    
    memset(&g_hermes_stats, 0, sizeof(g_hermes_stats));
}

int hermes_send_packet(HermesPacket* pkt, size_t payload_len) {
    if (g_udp_socket == INVALID_SOCKET || !pkt) return -1;
    
    pkt->magic = HERMES_MAGIC;
    pkt->payload_len = payload_len;
    size_t pkt_len = sizeof(HermesPacket) + payload_len;
    
    int res = sendto(g_udp_socket, (const char*)pkt, (int)pkt_len, 0, (struct sockaddr*)&g_broadcast_addr, sizeof(g_broadcast_addr));
    return res > 0 ? 0 : -1;
}

void hermes_poll_network(void) {
    if (g_udp_socket == INVALID_SOCKET) return;

    char buffer[4096];
    struct sockaddr_in sender_addr;
    socklen_t sender_len = sizeof(sender_addr);

    while (1) {
        int bytes = recvfrom(g_udp_socket, buffer, sizeof(buffer), 0, (struct sockaddr*)&sender_addr, &sender_len);
        if (bytes == SOCKET_ERROR) {
#if defined(_WIN32)
            if (WSAGetLastError() == WSAEWOULDBLOCK) break;
#else
            if (errno == EAGAIN || errno == EWOULDBLOCK) break;
#endif
            break;
        }

        if (bytes >= (int)sizeof(HermesPacket)) {
            HermesPacket* pkt = (HermesPacket*)buffer;
            
            if (pkt->magic == HERMES_MAGIC) {
                /* Feed NBIA awareness */
                nbia_handle_hermes((const uint8_t*)buffer, (size_t)bytes);

                uint32_t p_id = hash_perception("Hermes.mesh_traffic");
                dplus_ingest_perception(p_id, (uint32_t)bytes);
                
                g_hermes_stats.rx_packets++;
                g_hermes_stats.rx_bytes += bytes;
            } else {
                g_hermes_stats.dropped_magic++;
            }
        }
    }
}
