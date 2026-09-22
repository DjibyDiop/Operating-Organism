#ifndef PHENOMENON_LAYER_H
#define PHENOMENON_LAYER_H

#include <stdint.h>

// Phenomenon Types
#define PHENOMENON_DRIFT 1
#define PHENOMENON_EMERGENCE 2
#define PHENOMENON_PHASE_CHANGE 3
#define PHENOMENON_CONVERGENCE 4
#define PHENOMENON_TOPOLOGY_MAP 0x54 // 'T'
#define PHENOMENON_CAUSAL_TRACE 0x43 // 'C'

// The structured phenomenon emitted by Organisms (like NBIA)
typedef struct {
    uint16_t type;
    uint16_t source;
    uint8_t  confidence;
    uint8_t  flags;
    uint32_t evidence_id;
} OOPhenomenon;

#endif // PHENOMENON_LAYER_H