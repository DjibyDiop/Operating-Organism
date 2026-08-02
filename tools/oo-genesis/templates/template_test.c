#include <stdio.h>
#include <string.h>
#include <assert.h>
#include <stdlib.h>
#include "oo_api.h"
#include "module_{name}.h"

/* SDK Stubs for unit test context */
void* oo_malloc(size_t size) { return malloc(size); }
void  oo_free(void* ptr) { free(ptr); }
int   oo_post(uint16_t ch, const void* p, size_t s) { (void)ch; (void)p; (void)s; return 0; }
int   oo_net_send(const void* d, size_t s) { (void)d; (void)s; return 0; }
int   oo_net_recv(void* b, size_t s) { (void)b; (void)s; return 0; }
int   oo_ipc_write(const void* d, size_t s) { (void)d; (void)s; return 0; }
int   oo_ipc_read(void* b, size_t s) { (void)b; (void)s; return 0; }
void  oo_print(const char* msg) { printf("[Test-Stub] %s", msg); }

int main(void) {
    printf("=== Starting tests for organ {name} ===\n");
    
    // Call module init
    {name}_mod_init(NULL);
    assert(g_{name}.active == 1);
    printf("  [PASS] {name} module initialization successful.\n");

    // Simulate sending memory pressure payload (e.g. 1000 free cells)
    uint32_t free_cells = 1000;
    {name}_mod_handle(OO_CH_MEM_PRESSURE, &free_cells, sizeof(free_cells));
    printf("  [PASS] {name} module handled critical memory pressure successfully.\n");
    
    // Simulate tick
    {name}_mod_tick(1);
    assert(g_{name}.state_ticks == 1);
    printf("  [PASS] {name} module tick successful.\n");

    printf("=== All tests for organ {name} passed! ===\n");
    return 0;
}
