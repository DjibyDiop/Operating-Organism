#ifndef OO_WIFI_CORE_H
#define OO_WIFI_CORE_H

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

// Wi-Fi Connection State
typedef enum {
    WIFI_STATE_DISCONNECTED = 0,
    WIFI_STATE_SCANNING,
    WIFI_STATE_AUTHENTICATING,
    WIFI_STATE_ASSOCIATING,
    WIFI_STATE_CONNECTED
} WifiState;

// Wi-Fi Backend Interface
typedef struct {
    const char* name;
    int (*init)(void);
    int (*scan)(void);
    int (*connect)(const char* ssid, const char* password);
    int (*disconnect)(void);
    int (*get_state)(void);
    int (*send_frame)(const uint8_t* data, uint32_t len);
} WifiBackend;

// Core Wi-Fi Functions
int wifi_core_init(void);
int wifi_core_connect(const char* ssid, const char* password);
WifiState wifi_core_get_state(void);
int wifi_core_send(const uint8_t* data, uint32_t len);

// Backend registration functions
void wifi_register_uefi(WifiBackend* backend);
void wifi_register_intel(WifiBackend* backend);
void wifi_register_virtio(WifiBackend* backend);

#ifdef __cplusplus
}
#endif

#endif // OO_WIFI_CORE_H
