#pragma once

#include <stdint.h>
#include "../OPI-baremetal/oo-modules/symbion-engine/core/symbion.h"

/**
 * VirtIO-Net Driver — High Speed Virtualized Networking
 */

typedef struct {
    uint64_t addr;
    uint32_t len;
    uint16_t flags;
    uint16_t next;
} __attribute__((packed)) VirtqDesc;

typedef struct {
    uint16_t flags;
    uint16_t idx;
    uint16_t ring[256];
    uint16_t used_event;
} __attribute__((packed)) VirtqAvail;

typedef struct {
    uint32_t id;
    uint32_t len;
} __attribute__((packed)) VirtqUsedElem;

typedef struct {
    uint16_t flags;
    uint16_t idx;
    VirtqUsedElem ring[256];
    uint16_t avail_event;
} __attribute__((packed)) VirtqUsed;

typedef struct {
    VirtqDesc *desc;
    VirtqAvail *avail;
    VirtqUsed *used;
    uint16_t num;
    uint16_t free_head;
    uint16_t free_num;
    uint16_t last_used_idx;
    uint16_t queue_idx;
} VirtQueue;

typedef struct {
    uint32_t mmio_base;
    uint32_t features;
    int      active;
    VirtQueue rx_vq;
    VirtQueue tx_vq;
    uint8_t  mac[6];
} VirtioNetCtx;

int virtio_net_init(VirtioNetCtx *ctx, SymbionPCIDevice *pci);
int virtio_net_send(VirtioNetCtx *ctx, void *data, uint16_t len);
int virtio_net_receive(VirtioNetCtx *ctx, void *buffer, uint16_t *len);

