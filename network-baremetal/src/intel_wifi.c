#include "wifi_core.h"

extern void oo_print(const char* msg);

static int intel_init(void) {
    oo_print("[Intel-WiFi] Scanning PCI for iwlwifi (Vendor 8086)...\n");
    return 0;
}

static int intel_scan(void) {
    return 0;
}

static int intel_connect(const char* ssid, const char* password) {
    (void)ssid;
    (void)password;
    return 0;
}

static int intel_disconnect(void) {
    return 0;
}

static int intel_get_state(void) {
    return WIFI_STATE_DISCONNECTED;
}

static int intel_send_frame(const uint8_t* data, uint32_t len) {
    (void)data;
    (void)len;
    return 0;
}

void wifi_register_intel(WifiBackend* backend) {
    backend->name = "Intel_80211_PCIe";
    backend->init = intel_init;
    backend->scan = intel_scan;
    backend->connect = intel_connect;
    backend->disconnect = intel_disconnect;
    backend->get_state = intel_get_state;
    backend->send_frame = intel_send_frame;
}
