CC ?= gcc
CFLAGS ?= -std=c11 -Wall -Wextra -Iinclude -I../united-baremetal/include
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

test: CFLAGS += -DSHADOW_HOST
test: build
>$(CC) $(CFLAGS) -Iinclude -I../united-baremetal/include tests/test_shadow.c build/obj/anti_forensics.o ../united-baremetal/build/obj/united_bus.o -o build/test_shadow.exe
>build/test_shadow.exe

clean:
ifeq ($(OS),Windows_NT)
>@if exist build rmdir /s /q build
else
>rm -rf build
endif
