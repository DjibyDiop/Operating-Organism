CC ?= gcc
CFLAGS ?= -std=c11 -Wall -Wextra -Iinclude -I../united-baremetal/include
.RECIPEPREFIX := >

SRC := src/proprioception_stub.c
OBJ_DIR := build/obj
OBJ := $(OBJ_DIR)/proprioception_stub.o

.PHONY: all build test clean

all build: $(OBJ)

$(OBJ_DIR)/%.o: src/%.c | $(OBJ_DIR)
>$(CC) $(CFLAGS) -DPROPRIOCEPTION_HOST -c $< -o $@

$(OBJ_DIR):
ifeq ($(OS),Windows_NT)
>@if not exist $(subst /,\,$@) mkdir $(subst /,\,$@)
else
>mkdir -p $@
endif

test: build
>$(CC) $(CFLAGS) -DPROPRIOCEPTION_HOST -Iinclude -I../united-baremetal/include tests/test_proprioception.c build/obj/proprioception_stub.o ../united-baremetal/build/obj/united_bus.o -o build/test_proprioception.exe
>build/test_proprioception.exe

clean:
ifeq ($(OS),Windows_NT)
>@if exist build rmdir /s /q build
else
>rm -rf build
endif
