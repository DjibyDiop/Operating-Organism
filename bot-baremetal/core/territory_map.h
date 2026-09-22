#ifndef TERRITORY_MAP_H
#define TERRITORY_MAP_H

#include <stdint.h>
#include <stdbool.h>

#define MAX_TERRITORY_ZONES 8

typedef enum {
    ZONE_PERIPHERAL_IO = 1,
    ZONE_DMA_BUFFER    = 2,
    ZONE_SENSOR_MMIO   = 3,
    ZONE_ISOLATED_MEM  = 4
} ZoneType;

typedef struct {
    uint64_t base_addr;
    uint64_t size_bytes;
    ZoneType type;
    uint32_t access_flags; // 1 = READ, 2 = WRITE, 4 = EXECUTE
} TerritoryZone;

typedef struct {
    TerritoryZone zones[MAX_TERRITORY_ZONES];
    uint32_t zone_count;
} TerritoryMap;

void territory_map_init(TerritoryMap* map);
bool territory_map_add_zone(TerritoryMap* map, uint64_t base, uint64_t size, ZoneType type, uint32_t flags);
bool territory_map_check_access(const TerritoryMap* map, uint64_t addr, uint64_t size, uint32_t requested_flags);

#endif // TERRITORY_MAP_H
