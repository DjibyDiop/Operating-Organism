#include "territory_map.h"
#include <string.h>

void territory_map_init(TerritoryMap* map) {
    if (!map) return;
    memset(map, 0, sizeof(TerritoryMap));
}

bool territory_map_add_zone(TerritoryMap* map, uint64_t base, uint64_t size, ZoneType type, uint32_t flags) {
    if (!map || map->zone_count >= MAX_TERRITORY_ZONES || size == 0) {
        return false;
    }
    TerritoryZone* z = &map->zones[map->zone_count++];
    z->base_addr = base;
    z->size_bytes = size;
    z->type = type;
    z->access_flags = flags;
    return true;
}

bool territory_map_check_access(const TerritoryMap* map, uint64_t addr, uint64_t size, uint32_t requested_flags) {
    if (!map || size == 0) return false;
    uint64_t end_addr = addr + size;

    for (uint32_t i = 0; i < map->zone_count; i++) {
        const TerritoryZone* z = &map->zones[i];
        uint64_t z_end = z->base_addr + z->size_bytes;

        // Check containment within zone
        if (addr >= z->base_addr && end_addr <= z_end) {
            // Check flags
            if ((z->access_flags & requested_flags) == requested_flags) {
                return true;
            }
        }
    }
    return false;
}
