/*
 * oo_driver_contract.h — Interface unifiée pour tous les drivers OO
 *
 * Chaque driver de l'Operating Organism (capteur ou actionneur) doit
 * exposer ce contrat biologique :
 *
 *   probe()   → Détecte le périphérique sur le bus (PCI / ACPI / direct)
 *   init()    → Initialise le périphérique et l'état interne du driver
 *   read()    → Lit des données depuis le périphérique (lecture DMA ou PIO)
 *   write()   → Écrit des données vers le périphérique
 *   irq()     → Handler d'interruption (si applicable)
 *   status()  → Retourne l'état courant du driver (OO_DRV_*)
 *   shutdown()→ Arrêt propre (flush, désactivation interruptions)
 *
 * "Pas de mocks" — chaque implémentation appelle du vrai matériel ou
 * une couche d'abstraction UEFI/baremetal réelle.
 */
#ifndef OO_DRIVER_CONTRACT_H
#define OO_DRIVER_CONTRACT_H

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ─── Codes de statut driver ────────────────────────────────────────────── */
typedef enum {
    OO_DRV_OK          =  0,  /* Opération réussie */
    OO_DRV_ABSENT      = -1,  /* Périphérique absent sur le bus */
    OO_DRV_NOT_INIT    = -2,  /* Driver non encore initialisé */
    OO_DRV_IO_ERROR    = -3,  /* Erreur de lecture/écriture matérielle */
    OO_DRV_TIMEOUT     = -4,  /* Délai dépassé (pas de réponse hardware) */
    OO_DRV_NO_MEM      = -5,  /* Mémoire insuffisante pour les buffers DMA */
    OO_DRV_UNSUPPORTED = -6,  /* Fonctionnalité non supportée par ce driver */
    OO_DRV_BUSY        = -7,  /* Driver occupé (DMA en cours, etc.) */
} oo_driver_status_t;

/* ─── Famille de driver ──────────────────────────────────────────────────── */
typedef enum {
    OO_DRV_FAMILY_STORAGE  = 1,  /* NVMe, AHCI, VirtIO-BLK */
    OO_DRV_FAMILY_NETWORK  = 2,  /* e1000, VirtIO-NET */
    OO_DRV_FAMILY_DISPLAY  = 3,  /* Framebuffer, GPU stub */
    OO_DRV_FAMILY_INPUT    = 4,  /* PS/2 keyboard/mouse, xHCI HID */
    OO_DRV_FAMILY_AUDIO    = 5,  /* HDA */
    OO_DRV_FAMILY_SERIAL   = 6,  /* UART */
    OO_DRV_FAMILY_BUS      = 7,  /* PCI enumerate */
    OO_DRV_FAMILY_FIRMWARE = 8,  /* ACPI */
} oo_driver_family_t;

/* ─── Capacités déclarées par chaque driver ─────────────────────────────── */
#define OO_DRV_CAP_READ    (1u << 0)
#define OO_DRV_CAP_WRITE   (1u << 1)
#define OO_DRV_CAP_IRQ     (1u << 2)
#define OO_DRV_CAP_DMA     (1u << 3)
#define OO_DRV_CAP_POLL    (1u << 4)

/* ─── Descripteur d'un driver (rempli par chaque implémentation) ────────── */
typedef struct oo_driver_desc {
    const char         *name;       /* ex. "NVMe-OO", "e1000-OO" */
    oo_driver_family_t  family;
    uint32_t            version;    /* 0x00010000 = v1.0 */
    uint32_t            caps;       /* Bitfield OO_DRV_CAP_* */

    /* probe — retourne OO_DRV_OK si le périphérique est présent.
     * ctx est un pointeur vers le contexte driver (NvmeCtx, NicE1000Ctx…) */
    int  (*probe)(void *ctx);

    /* init — initialise le périphérique.  */
    int  (*init)(void *ctx);

    /* read — lit nbytes depuis offset, dans buf.
     * Pour les drivers block : offset = LBA * secteur. */
    int  (*read)(void *ctx, uint64_t offset, void *buf, size_t nbytes);

    /* write — écrit nbytes depuis buf vers offset. */
    int  (*write)(void *ctx, uint64_t offset, const void *buf, size_t nbytes);

    /* irq — handler d'interruption. Retourne 1 si l'IRQ était pour nous. */
    int  (*irq)(void *ctx);

    /* status — retourne oo_driver_status_t courant. */
    oo_driver_status_t (*status)(void *ctx);

    /* shutdown — flush + désactivation propre. */
    void (*shutdown)(void *ctx);
} oo_driver_desc_t;

/* ─── Registre global de drivers (max 32 drivers) ──────────────────────── */
#define OO_DRV_MAX_REGISTERED 32

typedef struct {
    const oo_driver_desc_t *desc;
    void                   *ctx;   /* Contexte opaque (NvmeCtx, etc.) */
    int                     alive; /* 1 = probed + init OK */
} oo_driver_entry_t;

/* Enregistre un driver dans le registre global.
 * Retourne l'index (>=0) ou OO_DRV_NO_MEM si le registre est plein. */
int oo_driver_register(const oo_driver_desc_t *desc, void *ctx);

/* Probe + init tous les drivers enregistrés.
 * Retourne le nombre de drivers qui ont passé probe+init avec succès. */
int oo_driver_init_all(void);

/* Cherche un driver par famille.  Retourne NULL si aucun disponible. */
const oo_driver_entry_t *oo_driver_find(oo_driver_family_t family);

/* Dispatch lecture vers le driver correct (premier driver vivant de la famille). */
int oo_driver_read(oo_driver_family_t family, uint64_t offset, void *buf, size_t nbytes);

/* Dispatch écriture. */
int oo_driver_write(oo_driver_family_t family, uint64_t offset, const void *buf, size_t nbytes);

/* Dispatch IRQ — appelle irq() de tous les drivers qui ont OO_DRV_CAP_IRQ.
 * Retourne le nombre de drivers qui ont réclamé l'IRQ. */
int oo_driver_dispatch_irq(void);

#ifdef __cplusplus
}
#endif

#endif /* OO_DRIVER_CONTRACT_H */
