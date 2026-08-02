CC ?= gcc
CFLAGS ?= -std=c11 -Wall -Wextra -Iinclude
.RECIPEPREFIX := >

SRC := $(wildcard src/*.c)
OBJ_DIR := build/obj
OBJ := $(patsubst src/%.c,$(OBJ_DIR)/%.o,$(SRC))

.PHONY: all build test clean

all build: $(OBJ)

$(OBJ_DIR)/%.o: src/%.c | $(OBJ_DIR)
>$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR):
ifeq ($(OS),Windows_NT)
>@if not exist $(subst /,\,$@) mkdir $(subst /,\,$@)
else
>mkdir -p $@
endif

test: build
>$(CC) $(CFLAGS) -Iinclude -I../united-baremetal/include tests/test_dream.c build/obj/dream_daemon.o build/obj/sleep_engine.o ../united-baremetal/build/obj/united_bus.o -o build/test_dream.exe
>build/test_dream.exe

clean:
ifeq ($(OS),Windows_NT)
>@if exist build rmdir /s /q build
else
>rm -rf build
endif
