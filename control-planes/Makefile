CC ?= gcc
CFLAGS ?= -std=c11 -Wall -Wextra -ffreestanding -mno-red-zone -Iinclude
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
>$(CC) -std=c11 -Wall -Wextra -Iinclude test/test_control_planes.c $(OBJ) -o build/test_control_planes.exe
>build/test_control_planes.exe

clean:
ifeq ($(OS),Windows_NT)
>@if exist build rmdir /s /q build
else
>rm -rf build
endif
