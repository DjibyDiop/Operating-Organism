CC ?= gcc
CFLAGS ?= -std=c11 -Wall -Wextra -Iinclude -I../oo-d+/Core -I../OPI-baremetal/oo-crypto/core
.RECIPEPREFIX := >

SRC := $(wildcard src/*.c)
# Include crypto library for the Warden
SRC += ../OPI-baremetal/oo-crypto/core/oo_crypto.c

OBJ_DIR := build/obj
# Fix obj mapping for files not in src/ (flattening objects)
OBJ := $(patsubst src/%.c,$(OBJ_DIR)/%.o,$(filter src/%,$(SRC)))
OBJ += $(OBJ_DIR)/oo_crypto.o
OBJ += $(OBJ_DIR)/thanatosion.o

.PHONY: all build test clean

all build: $(OBJ)

$(OBJ_DIR)/%.o: src/%.c | $(OBJ_DIR)
>$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR)/oo_crypto.o: ../OPI-baremetal/oo-crypto/core/oo_crypto.c | $(OBJ_DIR)
>$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR)/thanatosion.o: ../oo-d+/Core/thanatosion.c | $(OBJ_DIR)
>$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR):
ifeq ($(OS),Windows_NT)
>@if not exist $(subst /,\,$@) mkdir $(subst /,\,$@)
else
>mkdir -p $@
endif

test: build
>$(CC) $(CFLAGS) -Iinclude -I../united-baremetal/include tests/test_kernel.c $(OBJ) ../united-baremetal/build/obj/united_bus.o -o build/test_kernel.exe
>build/test_kernel.exe
>$(CC) $(CFLAGS) -Iinclude tests/test_smp.c src/oo_smp.c -o build/test_smp.exe
>build/test_smp.exe
>$(CC) $(CFLAGS) -Iinclude tests/test_recovery.c src/oo_recovery.c src/oo_scheduler.c src/oo_maintenance.c src/oo_smp.c ../oo-d+/Core/thanatosion.c -I../united-baremetal/include ../united-baremetal/build/obj/united_bus.o -o build/test_recovery.exe
>build/test_recovery.exe

clean:
ifeq ($(OS),Windows_NT)
>@if exist build rmdir /s /q build
else
>rm -rf build
endif
