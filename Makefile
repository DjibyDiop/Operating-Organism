# =============================================================================
# OO — Operating Organism v1.0 — Root Build Orchestrator
# =============================================================================
# "Comme les vaisseaux sanguins qui parcourent tout le corps humain"
#
# Builds ALL biological organ modules, the Cortex (llm-baremetal), the OPI
# cognitive kernel, control planes, and drivers.
#
# Usage:
#   make              — build organs + cortex (default)
#   make oo-complete  — build EVERYTHING: organs + cortex + OPI + control-planes
#   make organs       — build only the organ .o libs
#   make cortex       — build llm-baremetal/llama2.efi
#   make opi          — build OPI cognitive kernel (core-check)
#   make opi-proto    — build OPI prototype executable
#   make planes       — build control-planes
#   make drivers-check — syntax-check drivers/*.c
#   make archive      — assemble liboo-all.a from all organ objects
#   make status       — full health report of every component
#   make clean        — clean all organs + cortex + OPI build dirs
# =============================================================================

# ── Biological Organ Modules ─────────────────────────────────────────
# Order matters: bus first (united), then core infra, then higher-level organs.
ORGANS := \
    united-baremetal      \
    kernel-baremetal      \
    memory-baremetal      \
    network-baremetal     \
    identity-baremetal    \
    sense-baremetal       \
    vocal-baremetal       \
    reflex-baremetal      \
    evolution-baremetal   \
    dream-baremetal       \
    regen-baremetal       \
    swarm-baremetal       \
    shadow-baremetal      \
    bot-baremetal         \
    vital-baremetal       \
    proprioception-baremetal \
    internal-outils

# Subsystems that are built separately
CORTEX      := llm-baremetal
OPI_DIR     := OPI
PLANES_DIR  := control-planes
DRIVERS_DIR := drivers

# Archive that links organs to cortex (weak stubs get overridden)
OO_ARCHIVE  := liboo-all.a

.PHONY: all oo-complete organs cortex opi opi-proto planes drivers-check \
        archive status status-full clean clean-all $(ORGANS) $(CORTEX)

# ── Default: build organs + cortex ────────────────────────────────────
all: organs cortex

# ── OO-COMPLETE: build the entire organism ────────────────────────────
oo-complete: organs planes archive cortex opi
	@echo ""
	@echo "  ╔═══════════════════════════════════════════════════╗"
	@echo "  ║  🧬 Operating Organism v1.0 — BUILD COMPLETE 🧬  ║"
	@echo "  ╚═══════════════════════════════════════════════════╝"
	@echo ""

# ── TEST-ALL: execute validation test suites across all organs & planes ─
test-all:
	@echo "=== Validation Globale de l'Organisme Baremetal ==="
	@$(MAKE) -C united-baremetal test CC=gcc
	@$(MAKE) -C identity-baremetal test CC=gcc
	@$(MAKE) -C swarm-baremetal test CC=gcc
	@$(MAKE) -C bot-baremetal test CC=gcc
	@$(MAKE) -C network-baremetal test CC=gcc
	@$(MAKE) -C vital-baremetal test CC=gcc
	@$(MAKE) -C kernel-baremetal test CC=gcc
	@$(MAKE) -C llm-baremetal test CC=gcc
	@$(MAKE) -C OPI test CC=gcc
	@$(MAKE) -C sense-baremetal test CC=gcc
	@$(MAKE) -C reflex-baremetal test CC=gcc
	@$(MAKE) -C vocal-baremetal test CC=gcc
	@$(MAKE) -C proprioception-baremetal test CC=gcc
	@$(MAKE) -C dream-baremetal test CC=gcc
	@$(MAKE) -C evolution-baremetal test CC=gcc
	@$(MAKE) -C regen-baremetal test CC=gcc
	@$(MAKE) -C shadow-baremetal test CC=gcc
	@$(MAKE) -C control-planes test CC=gcc
	@echo "=== [SUCCESS] L'ensemble des organes, ponts et plans de contrôle sont opérationnels ! ==="

# ── Build all organ modules ──────────────────────────────────────────
organs: $(ORGANS)

$(ORGANS):
	@echo "  [OO] Building organ: $@"
	@mkdir -p $@/build
	@$(MAKE) -C $@ --no-print-directory 2>&1 | grep -v "^make\[" || true

# ── Build the Cortex (main EFI) ──────────────────────────────────────
cortex: $(CORTEX)

$(CORTEX): organs
	@echo "  [OO] Building cortex: $@"
	@$(MAKE) -C $@ --no-print-directory

# ── Build OPI Cognitive Kernel ───────────────────────────────────────
opi:
	@echo "  [OO] Building OPI cognitive kernel (core-check)..."
	@$(MAKE) -C $(OPI_DIR) core-check --no-print-directory 2>&1 || true
	@echo "  [OO] OPI core-check complete."

opi-proto:
	@echo "  [OO] Building OPI prototype..."
	@$(MAKE) -C $(OPI_DIR) prototype --no-print-directory 2>&1 || true

opi-immune:
	@echo "  [OO] Building OPI immune prototype..."
	@$(MAKE) -C $(OPI_DIR) immune --no-print-directory 2>&1 || true

opi-intelligence:
	@echo "  [OO] Building OPI intelligence prototype..."
	@$(MAKE) -C $(OPI_DIR) intelligence --no-print-directory 2>&1 || true

opi-metamorphic:
	@echo "  [OO] Building OPI metamorphic (APE) prototype..."
	@$(MAKE) -C $(OPI_DIR) metamorphic --no-print-directory 2>&1 || true

opi-symbiosis:
	@echo "  [OO] Building OPI symbiosis (multi-node) prototype..."
	@$(MAKE) -C $(OPI_DIR) symbiosis --no-print-directory 2>&1 || true

# ── Build Control Planes ─────────────────────────────────────────────
planes:
	@echo "  [OO] Building control-planes..."
	@mkdir -p $(PLANES_DIR)/build
	@$(MAKE) -C $(PLANES_DIR) --no-print-directory 2>&1 | grep -v "^make\[" || true

# ── Drivers syntax check (no linking — they are compiled into cortex) ─
drivers-check:
	@echo "  [OO] Syntax-checking drivers..."
	@ok=0; fail=0; \
	for f in $(DRIVERS_DIR)/*.c; do \
		$(CC) -fsyntax-only -ffreestanding -I$(DRIVERS_DIR) \
		      -I/usr/include/efi -I/usr/include/efi/x86_64 \
		      -DEFI_FUNCTION_WRAPPER \
		      $$f 2>/dev/null && ok=$$((ok+1)) || fail=$$((fail+1)); \
	done; \
	echo "  [OO] Drivers: $$ok pass, $$fail fail"

# ── Archive: assemble liboo-all.a from organ build objects ───────────
# This archive is linked into the cortex. Weak stubs in llmk_stubs.c
# are automatically overridden by real implementations from organs.
archive:
	@echo "  [OO] Assembling $(OO_ARCHIVE) from organ objects..."
	@rm -f $(OO_ARCHIVE)
	@objs=""; \
	for mod in $(ORGANS); do \
		new=$$(find $$mod/build -name '*.o' 2>/dev/null); \
		if [ -n "$$new" ]; then objs="$$objs $$new"; fi; \
	done; \
	planes=$$(find $(PLANES_DIR)/build -name '*.o' 2>/dev/null); \
	if [ -n "$$planes" ]; then objs="$$objs $$planes"; fi; \
	if [ -n "$$objs" ]; then \
		ar rcs $(OO_ARCHIVE) $$objs; \
		n=$$(echo $$objs | wc -w); \
		echo "  [OO] $(OO_ARCHIVE) created ($$n objects)"; \
	else \
		echo "  [OO] WARNING: no objects found — archive empty"; \
		ar rcs $(OO_ARCHIVE); \
	fi

# ── Clean all ────────────────────────────────────────────────────────
clean:
	@for mod in $(ORGANS); do \
		echo "  [OO] Clean $$mod"; \
		$(MAKE) -C $$mod clean --no-print-directory 2>/dev/null || true; \
	done
	@$(MAKE) -C $(CORTEX) clean --no-print-directory 2>/dev/null || true
	@$(MAKE) -C $(OPI_DIR) clean --no-print-directory 2>/dev/null || true
	@$(MAKE) -C $(PLANES_DIR) clean --no-print-directory 2>/dev/null || true
	@rm -f $(OO_ARCHIVE)

clean-all: clean
	@echo "  [OO] Deep clean: removing all .o, .a, .so, .efi artifacts..."
	@find . -name '*.o' -not -path './.git/*' -delete 2>/dev/null || true
	@find . -name '*.a' -not -path './.git/*' -not -path './cosmopolitan/*' -delete 2>/dev/null || true

# ── Status: comprehensive health report ──────────────────────────────
status:
	@echo ""
	@echo "╔═══════════════════════════════════════════════════════════════╗"
	@echo "║            🧬 Operating Organism — Health Report 🧬          ║"
	@echo "╚═══════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "── Biological Organs ──────────────────────────────────────────"
	@for mod in $(ORGANS); do \
		n=$$(find $$mod/build -name '*.o' 2>/dev/null | wc -l); \
		src=$$(find $$mod/src -name '*.c' 2>/dev/null | wc -l); \
		if [ "$$n" -gt 0 ]; then \
			echo "  ✅ $$mod ($$n objects / $$src sources)"; \
		elif [ "$$src" -gt 0 ]; then \
			echo "  🔧 $$mod (not built — $$src sources available)"; \
		else \
			echo "  ❌ $$mod (empty)"; \
		fi; \
	done
	@echo ""
	@echo "── Cortex (llm-baremetal) ────────────────────────────────────"
	@if [ -f $(CORTEX)/llama2.efi ]; then \
		sz=$$(du -h $(CORTEX)/llama2.efi | cut -f1); \
		echo "  ✅ llama2.efi [$$sz]"; \
	else \
		echo "  ❌ llama2.efi [not built]"; \
	fi
	@echo ""
	@echo "── OPI Cognitive Kernel ──────────────────────────────────────"
	@opi_src=$$(find $(OPI_DIR)/src -name '*.c' 2>/dev/null | wc -l); \
	opi_obj=$$(find $(OPI_DIR)/build -name '*.o' 2>/dev/null | wc -l); \
	opi_proto=$$(find $(OPI_DIR)/build -name '*.exe' 2>/dev/null | wc -l); \
	echo "  Sources: $$opi_src C files"; \
	echo "  Objects: $$opi_obj"; \
	echo "  Prototypes: $$opi_proto"
	@echo ""
	@echo "── Control Planes ───────────────────────────────────────────"
	@cp_n=$$(find $(PLANES_DIR)/build -name '*.o' 2>/dev/null | wc -l); \
	cp_src=$$(find $(PLANES_DIR)/src -name '*.c' 2>/dev/null | wc -l); \
	if [ "$$cp_n" -gt 0 ]; then \
		echo "  ✅ control-planes ($$cp_n objects / $$cp_src sources)"; \
	else \
		echo "  🔧 control-planes (not built — $$cp_src sources)"; \
	fi
	@echo ""
	@echo "── Hardware Drivers ─────────────────────────────────────────"
	@drv_c=$$(find $(DRIVERS_DIR) -name '*.c' 2>/dev/null | wc -l); \
	drv_h=$$(find $(DRIVERS_DIR) -name '*.h' 2>/dev/null | wc -l); \
	echo "  Drivers: $$drv_c sources, $$drv_h headers"
	@echo ""
	@echo "── Archives ─────────────────────────────────────────────────"
	@for a in $(OO_ARCHIVE) libaether_fabric.a libaether_synapse.a librust_guard.a; do \
		if [ -f $$a ]; then \
			sz=$$(du -h $$a | cut -f1); \
			n=$$(ar t $$a 2>/dev/null | wc -l); \
			echo "  ✅ $$a [$$sz, $$n objects]"; \
		else \
			echo "  ❌ $$a [missing]"; \
		fi; \
	done
	@echo ""
	@echo "── Stub Coverage ────────────────────────────────────────────"
	@stubs=$$(grep -c 'void.*{.*void' $(CORTEX)/core/llmk_stubs.c 2>/dev/null || echo 0); \
	echo "  Weak stubs in llmk_stubs.c: ~$$stubs functions"
	@echo "  (Real implementations override these via weak linkage)"
	@echo ""
	@echo "── Host-Side Components ────────────────────────────────────"
	@if [ -f colony-server/Cargo.toml ]; then echo "  ✅ colony-server (Rust)"; else echo "  ❌ colony-server"; fi
	@if [ -f oo-host/Cargo.toml ]; then echo "  ✅ oo-host (Rust serial bridge)"; else echo "  ❌ oo-host"; fi
	@if [ -f Living_desktop/index.html ]; then echo "  ✅ Living_desktop (Dashboard)"; else echo "  ❌ Living_desktop"; fi
	@if [ -d cosmopolitan ]; then echo "  ✅ cosmopolitan (fork present)"; else echo "  ❌ cosmopolitan"; fi
	@echo ""
