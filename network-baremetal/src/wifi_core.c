#include "wifi_core.h"

#define WIFI_BACKEND_CAPACITY 3

static WifiBackend g_uefi_backend;
static WifiBackend g_intel_backend;
static WifiBackend g_virtio_backend;
static WifiBackend* g_backends[WIFI_BACKEND_CAPACITY];
static int g_num_backends = 0;
static WifiBackend* g_active_backend = 0;
static WifiState g_state = WIFI_STATE_DISCONNECTED;

extern void oo_print(const char* msg);

static void wifi_log(const char* msg) {
    if (msg) {
        oo_print(msg);
    }
}

static void wifi_add_backend(WifiBackend* backend) {
    if (backend && g_num_backends < WIFI_BACKEND_CAPACITY) {
        g_backends[g_num_backends++] = backend;
    }
}

int wifi_core_init(void) {
    g_num_backends = 0;
    g_active_backend = 0;
    g_state = WIFI_STATE_DISCONNECTED;

    wifi_log("[Wi-Fi] Initializing core stack with fallback chain...\n");

    wifi_register_uefi(&g_uefi_backend);
    wifi_add_backend(&g_uefi_backend);

    wifi_register_intel(&g_intel_backend);
    wifi_add_backend(&g_intel_backend);

    wifi_register_virtio(&g_virtio_backend);
    wifi_add_backend(&g_virtio_backend);

    for (int i = 0; i < g_num_backends; i++) {
        WifiBackend* backend = g_backends[i];
        if (backend && backend->init && backend->init()) {
            g_active_backend = backend;
            wifi_log("[Wi-Fi] Successfully initialized backend: ");
            wifi_log(g_active_backend->name);
            wifi_log("\n");
            return 1;
        }

        wifi_log("[Wi-Fi] Backend failed: ");
        wifi_log((backend && backend->name) ? backend->name : "unknown");
        wifi_log("\n");
    }

    wifi_log("[Wi-Fi] CRITICAL: All Wi-Fi backends failed.\n");
    return 0;
}

int wifi_core_connect(const char* ssid, const char* password) {
    if (!g_active_backend || !g_active_backend->connect) {
        return 0;
    }

    g_state = WIFI_STATE_SCANNING;
    wifi_log("[Wi-Fi] Starting scan & connect...\n");

    int result = g_active_backend->connect(ssid, password);
    if (result) {
        g_state = WIFI_STATE_CONNECTED;
        wifi_log("[Wi-Fi] Connected to network.\n");
    } else {
        g_state = WIFI_STATE_DISCONNECTED;
        wifi_log("[Wi-Fi] Connection failed.\n");
    }
    return result;
}

WifiState wifi_core_get_state(void) {
    if (g_active_backend && g_active_backend->get_state) {
        return (WifiState)g_active_backend->get_state();
    }
    return g_state;
}

int wifi_core_send(const uint8_t* data, uint32_t len) {
    if (g_active_backend && g_active_backend->send_frame && g_state == WIFI_STATE_CONNECTED) {
        return g_active_backend->send_frame(data, len);
    }
    return 0;
}
