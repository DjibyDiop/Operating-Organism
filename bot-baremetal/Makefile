CC      ?= gcc
CFLAGS  = -pipe -Wall -Wextra -Wpedantic -std=c11 -O2 -g \
          -Icore -Iinstinct -Iinclude -Ioo_bridge

# Platform detection
ifeq ($(OS),Windows_NT)
    PLATFORM_LIBS = -lws2_32 -lntdll -luserenv
    EXE_EXT       = .exe
    MKDIR         = if not exist $(subst /,\,$(1)) mkdir $(subst /,\,$(1))
    RMDIR         = if exist $(subst /,\,$(1)) rmdir /s /q $(subst /,\,$(1))
    RM            = del /q $(subst /,\,$(1)) 2>nul || exit 0
else
    PLATFORM_LIBS = -lpthread -lm -ldl
    EXE_EXT       =
    MKDIR         = mkdir -p $(1)
    RMDIR         = rm -rf $(1)
    RM            = rm -f $(1)
endif

CORE_SOURCES = \
    core/bot_dna.c \
    core/territory_map.c \
    instinct/threat_state.c \
    instinct/instinct_layer.c \
    oo_bridge/hermes_udp.c

OBJ_DIR   = build/obj
CORE_OBJS = $(patsubst %.c,$(OBJ_DIR)/%.o,$(CORE_SOURCES))
C_LIB     = build/libbot_core.a
NBIA_LIB  = ../OO-NBIA/target/release/libnbia.a

BOT_EXE   = build/bot$(EXE_EXT)
TEST_EXE  = build/test_bot$(EXE_EXT)

.PHONY: all core test run-test clean dirs nbia

all: core $(BOT_EXE) $(TEST_EXE)

dirs:
ifeq ($(OS),Windows_NT)
	@if not exist build mkdir build
	@if not exist build\obj mkdir build\obj
	@if not exist build\obj\core mkdir build\obj\core
	@if not exist build\obj\instinct mkdir build\obj\instinct
	@if not exist build\obj\src mkdir build\obj\src
	@if not exist build\obj\oo_bridge mkdir build\obj\oo_bridge
else
	@mkdir -p build/obj/core build/obj/instinct build/obj/src build/obj/oo_bridge
endif

$(C_LIB): dirs $(CORE_OBJS)
	ar rcs $@ $(CORE_OBJS)
	@echo "[Core] Library: $@"

$(OBJ_DIR)/core/%.o: core/%.c | dirs
	$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR)/instinct/%.o: instinct/%.c | dirs
	$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR)/src/%.o: src/%.c | dirs
	$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR)/oo_bridge/%.o: oo_bridge/%.c | dirs
	$(CC) $(CFLAGS) -c $< -o $@

core: $(C_LIB)

nbia:
	@echo "[NBIA] Checking Rust NBIA static library..."
	@test -f $(NBIA_LIB) || (cd ../OO-NBIA && cargo build --release)

$(BOT_EXE): $(OBJ_DIR)/src/bot_baremetal_entry.o $(C_LIB) $(NBIA_LIB)
	$(CC) $(CFLAGS) $< $(C_LIB) $(NBIA_LIB) $(PLATFORM_LIBS) -o $@
	@echo "[Bot] Built: $@"

$(TEST_EXE): tests/test_bot.c $(C_LIB) $(NBIA_LIB)
	$(CC) $(CFLAGS) $< $(C_LIB) $(NBIA_LIB) $(PLATFORM_LIBS) -o $@
	@echo "[Test] Built: $@"

test: $(TEST_EXE)
	@echo "[Test] Running bot-baremetal sovereign test suite..."
	./$(TEST_EXE)

clean:
ifeq ($(OS),Windows_NT)
	@if exist build rmdir /s /q build
else
	@rm -rf build/
endif
	@echo "[Clean] Done"
