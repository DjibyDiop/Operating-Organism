#include "virtio_net.h"
#include <string.h>

// VirtIO PCI Capability offsets (simplified)
#define VIRTIO_PCI_CAP_COMMON_CFG   1
#define VIRTIO_PCI_CAP_NOTIFY_CFG   2
#define VIRTIO_PCI_CAP_ISR_CFG      3
#define VIRTIO_PCI_CAP_DEVICE_CFG   4

int virtio_net_init(VirtioNetCtx *ctx, SymbionPCIDevice *pci) {
    if (!ctx || !pci) return -1;

    // 1. Find VirtIO Capabilities via PCI
    // VirtIO uses a special capability structure to find MMIO regions
    uint32_t bar0 = oo_pci_read_config(pci->bus, pci->slot, pci->func, 0x10);
    ctx->mmio_base = bar0 & 0xFFFFFFF0;

    // 2. Reset Device
    volatile uint8_t *common_cfg = (volatile uint8_t*)(uintptr_t)ctx->mmio_base;
    common_cfg[0] = 0; // Status = 0 (Reset)
    
    // 3. Acknowledge and Driver bit
    common_cfg[0] |= 1; // ACK
    common_cfg[0] |= 2; // DRIVER

    // 4. Negotiate Features
    ctx->features = *(volatile uint32_t*)(common_cfg + 4);
    common_cfg[0] |= 8; // FEATURES_OK
    
    // 5. Read MAC address from device config space
    // Assuming device config space is at a specific offset in BAR0 or via another capability
    // For simplicity, we'll read from mmio_base + 0x100 (standard in some QEMU configs)
    volatile uint8_t *device_cfg = (volatile uint8_t*)(uintptr_t)(ctx->mmio_base + 0x100);
    for (int i=0; i<6; i++) {
        ctx->mac[i] = device_cfg[i];
    }
    
    // Initialize RX and TX VirtQueues (mock memory addresses for bare-metal testing)
    ctx->rx_vq.queue_idx = 0;
    ctx->rx_vq.last_used_idx = 0;
    ctx->tx_vq.queue_idx = 1;
    ctx->tx_vq.last_used_idx = 0;

    common_cfg[0] |= 4; // DRIVER_OK
    ctx->active = 1;
    _log_causal(0, "virtio_net_synapse_linked");
    
    return 0;
}

int virtio_net_send(VirtioNetCtx *ctx, void *data, uint16_t len) {
    if (!ctx || !ctx->active || !data || len == 0) return -1;
    
    // Simplified VirtQueue TX descriptor handling
    uint16_t head = ctx->tx_vq.free_head;
    if (ctx->tx_vq.desc) {
        ctx->tx_vq.desc[head].addr = (uint64_t)(uintptr_t)data;
        ctx->tx_vq.desc[head].len = len;
        ctx->tx_vq.desc[head].flags = 0; // No next descriptor
        
        uint16_t avail_idx = ctx->tx_vq.avail->idx;
        ctx->tx_vq.avail->ring[avail_idx % 256] = head;
        
        // Memory barrier
        __asm__ volatile("sfence" ::: "memory");
        
        ctx->tx_vq.avail->idx = avail_idx + 1;
        ctx->tx_vq.free_head = (head + 1) % 256;
        
        // Notify device via Queue Notify register (offset 0x50 typically in MMIO)
        volatile uint16_t *notify_reg = (volatile uint16_t*)(uintptr_t)(ctx->mmio_base + 0x50);
        *notify_reg = ctx->tx_vq.queue_idx;
    }
    
    return 0;
}

int virtio_net_receive(VirtioNetCtx *ctx, void *buffer, uint16_t *len) {
    if (!ctx || !ctx->active || !buffer || !len) return -1;
    
    // Poll the used ring RX
    if (ctx->rx_vq.used && ctx->rx_vq.last_used_idx != ctx->rx_vq.used->idx) {
        uint16_t used_idx = ctx->rx_vq.last_used_idx % 256;
        uint32_t desc_id = ctx->rx_vq.used->ring[used_idx].id;
        uint32_t pkt_len = ctx->rx_vq.used->ring[used_idx].len;
        
        if (pkt_len > *len) {
            pkt_len = *len;
        }
        
        // Memory barrier
        __asm__ volatile("lfence" ::: "memory");
        
        if (ctx->rx_vq.desc) {
            void *pkt_data = (void*)(uintptr_t)ctx->rx_vq.desc[desc_id].addr;
            memcpy(buffer, pkt_data, pkt_len);
        }
        
        *len = pkt_len;
        ctx->rx_vq.last_used_idx++;
        
        return 1; // 1 packet received
    }
    
    return 0;
}
