CC ?= gcc
CFLAGS ?= -std=c11 -Wall -Wextra -Iinclude -I../identity-baremetal/include -I../network-baremetal/include -I../united-baremetal/include
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
>$(MAKE) -C ../identity-baremetal build CC=$(CC)
>$(MAKE) -C ../network-baremetal build CC=$(CC)
>$(CC) $(CFLAGS) -Iinclude -I../identity-baremetal/include -I../network-baremetal/include -I../united-baremetal/include tests/test_swarm.c build/obj/collective.o ../identity-baremetal/build/obj/self_recognition.o ../network-baremetal/build/obj/*.o ../united-baremetal/build/obj/united_bus.o -o build/test_swarm.exe
>build/test_swarm.exe

clean:
ifeq ($(OS),Windows_NT)
>@if exist build rmdir /s /q build
else
>rm -rf build
endif
