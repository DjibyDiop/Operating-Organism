#include "wifi_core.h"

extern void oo_print(const char* msg);

static int virtio_init(void) {
    oo_print("[VirtIO-WiFi] Probing virtio-net as simulated Wi-Fi bridge...\n");
    return 1;
}

static int virtio_scan(void) {
    oo_print("[VirtIO-WiFi] Scanning for virtual QEMU AP...\n");
    return 1;
}

static int virtio_connect(const char* ssid, const char* password) {
    (void)ssid;
    (void)password;
    oo_print("[VirtIO-WiFi] Connecting to virtual SSID...\n");
    return 1;
}

static int virtio_disconnect(void) {
    return 1;
}

static int virtio_get_state(void) {
    return WIFI_STATE_CONNECTED;
}

static int virtio_send_frame(const uint8_t* data, uint32_t len) {
    (void)data;
    return (int)len;
}

void wifi_register_virtio(WifiBackend* backend) {
    backend->name = "VirtIO_Mac80211_hwsim";
    backend->init = virtio_init;
    backend->scan = virtio_scan;
    backend->connect = virtio_connect;
    backend->disconnect = virtio_disconnect;
    backend->get_state = virtio_get_state;
    backend->send_frame = virtio_send_frame;
}
