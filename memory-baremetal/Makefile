CC ?= gcc
CFLAGS ?= -std=c11 -Wall -Wextra -Iinclude
.RECIPEPREFIX := >

SRC := $(wildcard src/*.c)
OBJ_DIR := build/obj
OBJ := $(patsubst src/%.c,$(OBJ_DIR)/%.o,$(SRC))

TEST_SRC := tests/test_hedged_malloc.c src/hedged_malloc.c src/bio_alloc.c
TEST_OBJ := $(patsubst %.c,$(OBJ_DIR)/%.o,$(notdir $(TEST_SRC)))
TEST_BIN := $(OBJ_DIR)/test_hedged_malloc

.PHONY: all build test clean test_run

all build: $(OBJ)

$(OBJ_DIR)/%.o: src/%.c | $(OBJ_DIR)
>$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR)/test_hedged_malloc.o: tests/test_hedged_malloc.c | $(OBJ_DIR)
>$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR):
ifeq ($(OS),Windows_NT)
>@if not exist $(subst /,\,$@) mkdir $(subst /,\,$@)
else
>mkdir -p $@
endif

test: build $(TEST_BIN)

$(TEST_BIN): $(OBJ_DIR)/test_hedged_malloc.o $(OBJ_DIR)/hedged_malloc.o $(OBJ_DIR)/bio_alloc.o | $(OBJ_DIR)
>$(CC) $(CFLAGS) $^ ../united-baremetal/build/obj/united_bus.o -o $@

test_run: $(TEST_BIN)
>$(TEST_BIN)

clean:
ifeq ($(OS),Windows_NT)
>@if exist build rmdir /s /q build
else
>rm -rf build
endif
