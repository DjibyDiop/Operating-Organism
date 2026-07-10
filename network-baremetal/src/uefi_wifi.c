#include "wifi_core.h"

extern void oo_print(const char* msg);

static int uefi_init(void) {
    oo_print("[UEFI-WiFi] Probing EFI_WIRELESS_MAC_CONNECTION_PROTOCOL...\n");
    return 0;
}

static int uefi_scan(void) {
    return 0;
}

static int uefi_connect(const char* ssid, const char* password) {
    (void)ssid;
    (void)password;
    return 0;
}

static int uefi_disconnect(void) {
    return 0;
}

static int uefi_get_state(void) {
    return WIFI_STATE_DISCONNECTED;
}

static int uefi_send_frame(const uint8_t* data, uint32_t len) {
    (void)data;
    (void)len;
    return 0;
}

void wifi_register_uefi(WifiBackend* backend) {
    backend->name = "UEFI_Wireless_MAC";
    backend->init = uefi_init;
    backend->scan = uefi_scan;
    backend->connect = uefi_connect;
    backend->disconnect = uefi_disconnect;
    backend->get_state = uefi_get_state;
    backend->send_frame = uefi_send_frame;
}
