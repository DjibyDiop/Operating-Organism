/*
 * oo_driver_registry.c — Implémentation du registre global de drivers OO
 *
 * Permet à tous les organes de trouver leurs drivers sans couplage direct.
 * Pas de mocks — les drivers appelés ici appellent du vrai hardware.
 */
#include "oo_driver_contract.h"

extern void oo_print(const char *msg);

/* ─── Registre interne ───────────────────────────────────────────────────── */
static oo_driver_entry_t g_drivers[OO_DRV_MAX_REGISTERED];
static int               g_driver_count = 0;

/* ─── Enregistrement ─────────────────────────────────────────────────────── */
int oo_driver_register(const oo_driver_desc_t *desc, void *ctx)
{
    if (!desc) return OO_DRV_ABSENT;
    if (g_driver_count >= OO_DRV_MAX_REGISTERED) return OO_DRV_NO_MEM;

    g_drivers[g_driver_count].desc  = desc;
    g_drivers[g_driver_count].ctx   = ctx;
    g_drivers[g_driver_count].alive = 0;
    return g_driver_count++;
}

/* ─── Init tous les drivers ──────────────────────────────────────────────── */
int oo_driver_init_all(void)
{
    int ok = 0;
    for (int i = 0; i < g_driver_count; i++) {
        oo_driver_entry_t *e = &g_drivers[i];
        if (!e->desc) continue;

        /* 1. Probe */
        if (e->desc->probe && e->desc->probe(e->ctx) != OO_DRV_OK) {
            oo_print("[DriverRegistry] ABSENT: ");
            oo_print(e->desc->name);
            oo_print("\n");
            continue;
        }

        /* 2. Init */
        if (e->desc->init && e->desc->init(e->ctx) != OO_DRV_OK) {
            oo_print("[DriverRegistry] INIT FAIL: ");
            oo_print(e->desc->name);
            oo_print("\n");
            continue;
        }

        e->alive = 1;
        ok++;
        oo_print("[DriverRegistry] OK: ");
        oo_print(e->desc->name);
        oo_print("\n");
    }
    return ok;
}

/* ─── Recherche par famille ──────────────────────────────────────────────── */
const oo_driver_entry_t *oo_driver_find(oo_driver_family_t family)
{
    for (int i = 0; i < g_driver_count; i++) {
        if (g_drivers[i].alive &&
            g_drivers[i].desc &&
            g_drivers[i].desc->family == family) {
            return &g_drivers[i];
        }
    }
    return (void*)0;
}

/* ─── Dispatch lecture ───────────────────────────────────────────────────── */
int oo_driver_read(oo_driver_family_t family, uint64_t offset, void *buf, size_t nbytes)
{
    const oo_driver_entry_t *e = oo_driver_find(family);
    if (!e || !e->desc->read) return OO_DRV_UNSUPPORTED;
    return e->desc->read(e->ctx, offset, buf, nbytes);
}

/* ─── Dispatch écriture ──────────────────────────────────────────────────── */
int oo_driver_write(oo_driver_family_t family, uint64_t offset, const void *buf, size_t nbytes)
{
    const oo_driver_entry_t *e = oo_driver_find(family);
    if (!e || !e->desc->write) return OO_DRV_UNSUPPORTED;
    return e->desc->write(e->ctx, offset, buf, nbytes);
}

/* ─── Dispatch IRQ ───────────────────────────────────────────────────────── */
int oo_driver_dispatch_irq(void)
{
    int claimed = 0;
    for (int i = 0; i < g_driver_count; i++) {
        oo_driver_entry_t *e = &g_drivers[i];
        if (e->alive && e->desc &&
            (e->desc->caps & OO_DRV_CAP_IRQ) &&
            e->desc->irq) {
            if (e->desc->irq(e->ctx)) claimed++;
        }
    }
    return claimed;
}
