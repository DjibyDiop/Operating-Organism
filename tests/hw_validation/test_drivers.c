/*
 * test_drivers.c — Hardware Smoke Validation Suite for OO Drivers
 */

#include <stdio.h>
#include <assert.h>
#include "../../drivers/oo_driver_contract.h"

void oo_print(const char *msg) {
    printf("%s", msg);
}

/* Dummy real contexts for smoke validation */
static int test_probe_uart(void *ctx) {
    (void)ctx;
    return OO_DRV_OK;
}

static int test_init_uart(void *ctx) {
    (void)ctx;
    return OO_DRV_OK;
}

static int test_write_uart(void *ctx, uint64_t offset, const void *buf, size_t nbytes) {
    (void)ctx;
    (void)offset;
    printf("  [UART HW TX] %.*s\n", (int)nbytes, (const char *)buf);
    return (int)nbytes;
}

static const oo_driver_desc_t g_uart_desc = {
    .name = "UART-16550-COM1",
    .family = OO_DRV_FAMILY_SERIAL,
    .version = 0x00010000,
    .caps = OO_DRV_CAP_READ | OO_DRV_CAP_WRITE | OO_DRV_CAP_POLL,
    .probe = test_probe_uart,
    .init = test_init_uart,
    .read = NULL,
    .write = test_write_uart,
    .irq = NULL,
    .status = NULL,
    .shutdown = NULL
};

int main(void) {
    printf("=== [TEST] OO Drivers & Hardware Validation Suite ===\n");

    int reg_idx = oo_driver_register(&g_uart_desc, NULL);
    assert(reg_idx >= 0);
    printf("  [Test] Registered driver '%s' at index %d\n", g_uart_desc.name, reg_idx);

    int inited = oo_driver_init_all();
    assert(inited >= 1);
    printf("  [Test] Initialized %d drivers.\n", inited);

    const oo_driver_entry_t *entry = oo_driver_find(OO_DRV_FAMILY_SERIAL);
    assert(entry != NULL);
    assert(entry->alive == 1);

    const char *msg = "OO_HARDWARE_PULSE_OK";
    int written = oo_driver_write(OO_DRV_FAMILY_SERIAL, 0, msg, 20);
    assert(written == 20);

    printf("=== [SUCCESS] Hardware Drivers Validation Suite PASSED ===\n");
    return 0;
}
