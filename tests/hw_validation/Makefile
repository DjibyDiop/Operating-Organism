# =============================================================================
# OO Hardware Validation Test Suite — Makefile
# =============================================================================

CC     ?= gcc
CFLAGS ?= -std=c11 -Wall -Wextra -O2 -I../../drivers

.RECIPEPREFIX := >

BUILD_DIR := build
TEST_OUT  := $(BUILD_DIR)/test_drivers.exe

.PHONY: all test clean

all: $(TEST_OUT)

$(TEST_OUT): test_drivers.c ../../drivers/oo_driver_registry.c | $(BUILD_DIR)
>$(CC) $(CFLAGS) $^ -o $@

$(BUILD_DIR):
ifeq ($(OS),Windows_NT)
>@if not exist $(BUILD_DIR) mkdir $(BUILD_DIR)
else
>mkdir -p $(BUILD_DIR)
endif

test: $(TEST_OUT)
>$(TEST_OUT)

clean:
ifeq ($(OS),Windows_NT)
>@if exist $(BUILD_DIR) rmdir /s /q $(BUILD_DIR)
else
>rm -rf $(BUILD_DIR)
endif
