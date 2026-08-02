CC      ?= gcc
CFLAGS  = -Wall -Wextra -Wpedantic -std=c11 -O2 -g \
          -Icore -Iinstinct -Iinclude \
          -I../united-baremetal/include
.RECIPEPREFIX := >

PYTHON  = python3
CARGO   = cargo

C_SOURCES = \
    core/bot_dna.c \
    core/territory_map.c \
    instinct/threat_state.c \
    instinct/instinct_layer.c \
    src/bot_baremetal_entry.c

OBJ_DIR = build/obj
C_OBJECTS = $(patsubst %.c,$(OBJ_DIR)/%.o,$(C_SOURCES))
C_LIB     = build/libbot_core.a

.PHONY: all core build immune test sim clean status check-deps dirs

all: core

core build: dirs $(C_LIB)
>@echo "[Core] Bot DNA + InstinctLayer + entry built OK"

dirs:
ifeq ($(OS),Windows_NT)
>@if not exist build mkdir build
>@if not exist build\obj mkdir build\obj
>@if not exist build\obj\core mkdir build\obj\core
>@if not exist build\obj\instinct mkdir build\obj\instinct
>@if not exist build\obj\src mkdir build\obj\src
else
>mkdir -p build/obj/core build/obj/instinct build/obj/src
endif

$(C_LIB): $(C_OBJECTS)
>ar rcs $@ $^
>@echo "[Core] Library: $@"

$(OBJ_DIR)/core/%.o: core/%.c | dirs
>$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR)/instinct/%.o: instinct/%.c | dirs
>$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR)/src/%.o: src/%.c | dirs
>$(CC) $(CFLAGS) -c $< -o $@
immune:
>@echo "[Immune] Building SwarmMind + Watchers (Rust)..."
>cd immune && $(CARGO) build --release
>@echo "[Immune] Build complete"

test: core
>$(CC) $(CFLAGS) tests/test_bot.c $(C_OBJECTS) ../united-baremetal/build/obj/united_bus.o -o build/test_bot.exe
>build/test_bot.exe

clean:
ifeq ($(OS),Windows_NT)
>@if exist build rmdir /s /q build
>@del /q core\*.o instinct\*.o src\*.o 2>nul
else
>rm -f $(C_OBJECTS)
>rm -rf build/
>cd immune && $(CARGO) clean 2>/dev/null || true
endif
>@echo "[Clean] Done"

status:
>@echo "=== BOT-BAREMETAL PROJECT STATUS ==="

check-deps:
>@echo "[Check] gcc required for core build"
