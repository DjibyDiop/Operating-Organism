# =============================================================================
# OO Drivers — Makefile
# Construit liboo_drivers.a à partir de tous les drivers baremetal OO.
#
# Usage:
#   make              — compile tous les drivers → liboo_drivers.a
#   make test         — compile + lance les smoke tests hardware
#   make clean        — nettoie le répertoire build
# =============================================================================

CC      ?= gcc
AR      ?= ar
CFLAGS  ?= -std=c11 -Wall -Wextra -O2 \
           -ffreestanding \
           -I. \
           -I../united-baremetal/include

.RECIPEPREFIX := >

BUILD_DIR  := build/obj
LIB_OUT    := build/liboo_drivers.a
TEST_OUT   := build/test_drivers

# Tous les drivers C (registre inclus)
SRCS := \
    acpi.c         \
    ahci.c         \
    display.c      \
    hda.c          \
    nic_e1000.c    \
    oo_nvme.c      \
    pci.c          \
    ps2.c          \
    uart.c         \
    virtio.c       \
    virtio_net.c   \
    xhci.c         \
    oo_driver_registry.c

OBJS := $(patsubst %.c,$(BUILD_DIR)/%.o,$(SRCS))

.PHONY: all test clean

all: $(LIB_OUT)
    @echo "[drivers] liboo_drivers.a prête — $(words $(SRCS)) drivers compilés."

# ── Archive statique ────────────────────────────────────────────────────────
$(LIB_OUT): $(OBJS) | build
    $(AR) rcs $@ $^
    @echo "[drivers] Archive: $@"

# ── Compilation de chaque driver ────────────────────────────────────────────
$(BUILD_DIR)/%.o: %.c oo_driver_contract.h | $(BUILD_DIR)
    $(CC) $(CFLAGS) -c $< -o $@

# ── Répertoires ─────────────────────────────────────────────────────────────
build:
ifeq ($(OS),Windows_NT)
    @if not exist build mkdir build
else
    mkdir -p build
endif

$(BUILD_DIR): | build
ifeq ($(OS),Windows_NT)
    @if not exist build\obj mkdir build\obj
else
    mkdir -p $(BUILD_DIR)
endif

# ── Tests hardware smoke ─────────────────────────────────────────────────────
# Compile le harness de smoke tests (test_drivers.c dans tests/hw_validation/)
test: $(LIB_OUT)
    $(CC) $(CFLAGS) \
        -I. \
        -I../united-baremetal/include \
        ../tests/hw_validation/test_drivers.c \
        $(LIB_OUT) \
        -o $(TEST_OUT)
    @echo "[drivers] Test lancé..."
    $(TEST_OUT)

# ── Clean ────────────────────────────────────────────────────────────────────
clean:
ifeq ($(OS),Windows_NT)
    @if exist build rmdir /s /q build
else
    rm -rf build
endif
