# OO Operating Organism — Comprehensive Codebase Structure Analysis

**Generated:** June 18, 2026  
**Scope:** All subsystems, drivers, modules, integration points, and centralization gaps

---

## 1. CORE STRUCTURE: MAIN SUBSYSTEMS/ORGANS

### 1.1 Architectural Layers

The codebase follows **7-layer architecture**:

| Layer | Component | Language | Role | Status |
|-------|-----------|----------|------|--------|
| **1. Cognitive Core** | `llm-baremetal` | C + ASM + UEFI | Bare-metal LLM runtime + Mamba SSM | ✅ v0.1 |
| **2. Execution Kernel** | `oo-host` | Rust | Agent runtime + scheduling | ✅ Active |
| **3. Simulation** | `oo-sim` | C | Simulated test environments | 🟡 Phase 2 |
| **4. Research** | `oo-lab` | Multi-lang | Prototyping + ideation | 🟡 Phase 2 |
| **5. Evolution** | `oo-dplus` | Rust (no_std) | Policy engine + mutation system | ✅ Active |
| **6. Meta** | `oo-system/meta` | C | Self-modification framework | 🔲 Phase 4 |
| **7. Interface** | `oo-system/interface` | C | CLI + hardware bridges | ✅ CLI active |

---

### 1.2 Biological Organ System (16 Baremetal Modules)

Each organ maps to a biological system and engineering role. Built in order (dependencies): **bus → vital → dependents**.

#### Vital Chain (Must Stay Alive)

| Directory | Biological System | Role | Type | Primary Files |
|-----------|-------------------|------|------|---|
| **united-baremetal** | Cardiovascular + Blood | IPC ring bus (globule transport) | **VITAL** | `united_bus.h/c` |
| **kernel-baremetal** | Musculoskeletal + Brainstem | Scheduler + task orchestration | **VITAL** | `oo_scheduler.h/c` |
| **memory-baremetal** | Memory + Renal (GC) | Bio-inspired allocation + recovery | **VITAL** | `bio_mem.h`, `hedged_malloc.h/c` |
| **reflex-baremetal** | Brainstem + Spinal Cord | Hard safety + interrupt reflexes | **VITAL** | `nervous_system.h/c` |
| **vital-baremetal** | Endocrine + Homeostasis | Mode FSM + vital parameter regulation | **VITAL** | `vital_homeostasis.h`, `consciousness_fsm.c` |
| **network-baremetal** | Respiratory System | NIC drivers + throughput regulation | **VITAL** | `lungs.h`, `nic_pci.h/c` |
| **bot-baremetal** | Immune System | Threat detection + instinct layer | **VITAL** | `bot_dna.h/c`, `instinct_layer` |

#### Adaptive/Support Organs

| Directory | Biological System | Role | Type |
|-----------|-------------------|------|------|
| **identity-baremetal** | Identity / DNA fingerprint | Hardware FNV-1a hash | Identity |
| **sense-baremetal** | Sensory Organs + Digestive | I/O normalization + sensor fusion | Interface |
| **proprioception-baremetal** | Proprioception (body awareness) | Stack/heap integrity monitoring | Interface |
| **vocal-baremetal** | Speech/Communication | UART interface + speaker output | Interface |
| **shadow-baremetal** | Integumentary / Immune | Anti-forensics + boundary control | Maintenance |
| **swarm-baremetal** | Lymphatic + Collective Intelligence | P2P pheromone + distributed health | Maintenance |
| **evolution-baremetal** | Reproductive / Mutation | Controlled evolution + genome variation | Adaptive |
| **regen-baremetal** | Recovery / Regeneration | Hot-patching + code replacement | Adaptive |
| **dream-baremetal** | Sleep / Recovery | Consolidation + maintenance cycles | Maintenance |

#### Control Planes (Central Registry)

| Directory | Role | Files |
|-----------|------|-------|
| **control-planes** | Organ state registry + health aggregation | `oo_organ_state.h/c`, `oo_homeostasis_mode.c` |

#### Upper-Level Orchestration

| Directory | Role | Language | Type |
|-----------|------|----------|------|
| **oo-system** | Layer 6-7 integration + CLI | C | Meta + Interface |
| **oo-host** | Layer 2 execution kernel | Rust | Orchestration |
| **oo-dplus** | Layer 5 policy + mutation engine | Rust | Evolution |
| **yamaoo** | Desktop UI + visualization | Rust + C + C++ | Desktop app |
| **colony-server** | Distributed organism heartbeat aggregation | Multi | Network coordination |

---

### 1.3 Module Dependency Graph

**Build order (Root Makefile `ORGANS` list):**

```
united-baremetal (bus foundation)
    ↓
kernel-baremetal, memory-baremetal, network-baremetal
    ↓
identity-baremetal, sense-baremetal, vocal-baremetal
    ↓
reflex-baremetal, evolution-baremetal, dream-baremetal
    ↓
regen-baremetal, swarm-baremetal, shadow-baremetal
    ↓
bot-baremetal, vital-baremetal, proprioception-baremetal
    ↓
llm-baremetal (cortex, depends on all organs)
```

**Include patterns:**
- Most organs include `../../united-baremetal/include/united_bus.h`
- Some organs include `../../identity-baremetal/include/dna_hash.h`
- `evolution-baremetal` depends on `identity-baremetal`
- `swarm-baremetal` depends on `network-baremetal` + `identity-baremetal` + `united-baremetal`

---

## 2. DRIVERS & MODULES INVENTORY

### 2.1 Header Files (27 Public Interfaces)

All follow pattern: `include/*.h` with matching `src/*.c`

```
united-baremetal/include/united_bus.h              ✅ Full impl
kernel-baremetal/include/oo_scheduler.h            ✅ Full impl
memory-baremetal/include/bio_mem.h                 ✅ Full impl
memory-baremetal/include/hedged_malloc.h           ✅ Full impl
network-baremetal/include/nic.h                    ✅ Full impl
network-baremetal/include/nic_pci.h                ✅ Full impl
network-baremetal/include/lungs.h                  ✅ Full impl
network-baremetal/include/io_ports.h               ✅ Full impl
identity-baremetal/include/dna_hash.h              ✅ Full impl
sense-baremetal/include/sensory_receptors.h        ✅ Full impl
proprioception-baremetal/include/proprioception.h  ⚠️  STUB
vocal-baremetal/include/vocal.h                    ✅ Partial impl
reflex-baremetal/include/nervous_system.h          ✅ Full impl
evolution-baremetal/include/genetics.h             ✅ Full impl
dream-baremetal/include/dream_baremetal.h          ✅ Full impl
regen-baremetal/include/regen.h                    ✅ Full impl
swarm-baremetal/include/pheromones.h               ✅ Full impl
shadow-baremetal/include/stealth.h                 ✅ Full impl
bot-baremetal/include/bot_baremetal.h              ✅ Facade pattern
vital-baremetal/include/vital_homeostasis.h        ✅ Full impl
vital-baremetal/include/vital_consciousness.h      ✅ Full impl
vital-baremetal/include/vital_metabolism.h         ✅ Full impl
vital-baremetal/include/vital_synapse.h            ✅ Full impl
vital-baremetal/include/vital_spark.h              ✅ Full impl
vital-baremetal/include/vital_nociception.h        ✅ Full impl
vital-baremetal/include/vital_dream_sim.h          ✅ Full impl
llm-baremetal/include/llm_baremetal_facade.h       ✅ Facade pattern
```

### 2.2 Source Files (37 C implementations + 2 Rust)

**C Files (37 total):**

| Module | C Files | Status |
|--------|---------|--------|
| united-baremetal | 1 | ✅ `united_bus.c` |
| kernel-baremetal | 1 | ✅ `oo_scheduler.c` |
| memory-baremetal | 3 | ✅ `bio_alloc.c`, `hedged_malloc.c`, `hedged_read.c` |
| network-baremetal | 2 | ✅ `respiration.c`, `nic_pci.c` |
| identity-baremetal | 1 | ✅ `self_recognition.c` |
| sense-baremetal | 1 | ✅ `retina_and_touch.c` |
| proprioception-baremetal | 1 | ⚠️ `proprioception_stub.c` (STUB) |
| vocal-baremetal | 1 | ⚠️ `speaker_vocal.c` (Partial) |
| reflex-baremetal | 1 | ✅ `spinal_cord.c` |
| evolution-baremetal | 1 | ✅ `mutation.c` |
| dream-baremetal | 1 | ✅ `dream_daemon.c` |
| regen-baremetal | 1 | ✅ `hotpatch.c` |
| swarm-baremetal | 1 | ✅ `collective.c` |
| shadow-baremetal | 1 | ✅ `anti_forensics.c` |
| bot-baremetal | 2 | ✅ `bot_baremetal_entry.c` + core C files |
| vital-baremetal | 20 | ⚠️ Mix of full + stubs |
| llm-baremetal | 1 | ✅ `llm_baremetal_facade.c` |

**Rust Files (2 total):**
- `vital-baremetal/src/vital_guardian.rs` (security enforcement)
- `vital-baremetal/src/quantum_vault.rs` (cryptographic vault)

### 2.3 Bot-Baremetal Structure (Multi-Language)

**Special case: Mixed C + Rust + Python**

```
bot-baremetal/
├── core/
│   ├── bot_dna.h/c                 (Genetic algorithm + instinct DB)
│   ├── territory_map.h/c           (Spatial threat mapping)
│   └── (other C core modules)
├── instinct/
│   └── (fast reflex subsystem)
├── immune/
│   ├── (Rust: SwarmMind + threat watchers)
│   └── Cargo.toml
├── tests/
│   ├── attack_sim.py               (Python: attack simulation)
│   └── instinct_bench/
├── oo_bridge/
│   └── bridge_agent.py             (Python: FFI bridge to other organs)
└── Makefile                        (Orchestrates: C + Rust + Python)
```

**Multi-language integration:** `bot-baremetal/Makefile` chains:
1. C compilation (`gcc`) → `build/libbot_core.a`
2. Rust compilation (`cargo build --release`)
3. Python tests + bridge validation

---

## 3. MISSING CONNECTIONS & GAPS

### 3.1 Stubs / Incomplete Implementations

| File | Status | Issue | Impact |
|------|--------|-------|--------|
| `proprioception-baremetal/src/proprioception_stub.c` | ⚠️ STUB | No real implementation | Body-awareness monitoring not functional |
| `vital-baremetal/src/united_bus_stub.c` | ⚠️ STUB FALLBACK | In standalone mode only | Ring buffer used in dev, not final bus |
| `vocal-baremetal/src/speaker_vocal.c` | ⚠️ PARTIAL | Basic UART only | No advanced audio/speech synthesis |
| `vital-baremetal/src/oo_stubs.c` | ⚠️ STUBS | Placeholder Rust/ASM bindings | Standalone mode only |

### 3.2 Header Without Implementation Match

**All headers have matching `.c` files** — no orphaned headers found.

Exception: Some organs have **multiple headers** for different subsystems (e.g., `vital-baremetal` has 7 headers):
- `vital_homeostasis.h` → `homeostasis_regulator.c` ✅
- `vital_consciousness.h` → `consciousness_fsm.c` ✅
- `vital_metabolism.h` → `energy_metabolism.c` ✅
- `vital_synapse.h` → `synapse_network.c` ✅
- `vital_spark.h` → `vital_core_unifier.c` ✅
- `vital_nociception.h` → `nociception.c` ✅
- `vital_dream_sim.h` → `dream_simulator.c` ✅

### 3.3 Orphaned Source Files

**Scan result:** No orphaned C/Rust files found in `*-baremetal/src/` directories.

All files are either:
- Directly compiled by `Makefile`
- Part of library build (`libbot_core.a`, `cargo build`)
- Or explicitly documented as test/bench utilities

### 3.4 Modules Importing Undefined Symbols

**Critical check:** Cross-reference validation.

**Found patterns:**

1. ✅ **United-bus is universal hub:**
   - `kernel-baremetal` → `united_bus.h`
   - `identity-baremetal` → `united_bus.h`
   - `evolution-baremetal` → `identity-baremetal` + `united_bus`
   - `dream-baremetal` → `united_bus.h`
   - `swarm-baremetal` → `united_bus.h` + `network-baremetal` + `identity-baremetal`
   - `shadow-baremetal` → `united_bus.h`
   - `sense-baremetal` → `united_bus.h`
   - `reflex-baremetal` → `united_bus.h`

2. ⚠️ **Potential undefined reference:** `bot-baremetal/src/vital_core_unifier.c` includes `../../united-baremetal/include/united_bus.h` but there are **stubs for standalone mode** which might not match the real bus interface in final build.

3. ⚠️ **Circular dependency risk (but handled):** `bot-baremetal` includes:
   - `bot_dna.h` → `territory_map.h` → includes `bot_dna.h` (MANAGED via `#ifndef` guards)

### 3.5 Build Targets With Missing Links

**Root `Makefile`:**
- Builds all organs → object files (`.o`) in `build/` directories
- **Missing:** No explicit linking step to EFI binary in root Makefile
- **Handled by:** `llm-baremetal/Makefile` (cortex) depends on all organs and links them

**Potential issue:** Organ `.o` files are built but not explicitly collected into a central library or manifest for linking.

---

## 4. CENTRAL REGISTRY / INDEX

### 4.1 **YES — Central Registry Exists: `control-planes/`**

**Location:** `c:\Users\djibi\OneDrive\Bureau\baremetal\control-planes/`

**Core Files:**
- `include/oo_organ_state.h` — Enum + registry interface
- `src/oo_organ_state.c` — Runtime state tracking

**Registry Definition:**

```c
typedef enum {
    OO_ORGAN_UNITED        = 0,
    OO_ORGAN_KERNEL        = 1,
    OO_ORGAN_MEMORY        = 2,
    OO_ORGAN_NETWORK       = 3,
    OO_ORGAN_IDENTITY      = 4,
    OO_ORGAN_SENSE         = 5,
    OO_ORGAN_VOCAL         = 6,
    OO_ORGAN_REFLEX        = 7,
    OO_ORGAN_EVOLUTION     = 8,
    OO_ORGAN_DREAM         = 9,
    OO_ORGAN_REGEN         = 10,
    OO_ORGAN_SWARM         = 11,
    OO_ORGAN_SHADOW        = 12,
    OO_ORGAN_BOT           = 13,
    OO_ORGAN_VITAL         = 14,
    OO_ORGAN_PROPRIOCEPTION= 15,
    OO_ORGAN_CORTEX        = 16,
    OO_ORGAN_COUNT         = 17
} oo_organ_t;
```

**Registry Functions:**

```c
void organ_state_init(void);
void organ_state_publish(oo_organ_t organ, uint8_t health, uint8_t mode);
int  organ_state_get(oo_organ_t organ, oo_organ_snapshot_t* out);
uint8_t organ_state_aggregate_health(void);
uint8_t organ_state_worst_nonvital_health(void);
int organ_state_vital_chain_alive(void);
```

**Integration:**
- Every organ **publishes health/mode** to registry
- Registry emits **YELLOW control globule** on `united_bus`
- Used by homeostasis FSM + telemetry

### 4.2 **Secondary Registries**

| System | File | Purpose |
|--------|------|---------|
| **Vital Chain** | `control-planes/include/oo_organ_state.h` (lines 25-30) | Hardcoded list of vital organs |
| **Bot-Baremetal Core** | `bot-baremetal/core/bot_dna.h` | Threat signature database |
| **Identity** | `identity-baremetal/include/dna_hash.h` | Hardware fingerprint system |
| **D+ Policy** | `oo-dplus/policy.dplus` | Policy rules (text DSL) |

### 4.3 **Build-Time Manifest**

**Root Makefile:**
```makefile
ORGANS := \
    united-baremetal \
    kernel-baremetal \
    memory-baremetal \
    ... (16 total)
```

**Smoke script validation:** `tools/scripts/smoke_baremetal.ps1`
- Scans `*-baremetal` directories
- Validates presence of `README.md`, `include/`, `src/`
- Emits JSON + Markdown reports

---

## 5. BUILD SYSTEM

### 5.1 **Three-Tier Build Architecture**

```
Level 3 (Root)
├── Makefile (orchestrates organs → cortex)
└── oo-build.ps1 (PowerShell wrapper)

Level 2 (Each Organ)
├── Makefile (local: build obj files)
├── Cargo.toml (if Rust present)
└── src/ + include/

Level 1 (Components)
├── C files (gcc)
├── Rust crates (cargo)
└── Python scripts (direct or via Make)
```

### 5.2 **Root Makefile (`./Makefile`)**

```makefile
ORGANS := united-baremetal kernel-baremetal memory-baremetal ... (16 total)
CORTEX := llm-baremetal

all: organs cortex

organs: $(ORGANS)  # Builds all .o files in parallel

$(ORGANS):
    @$(MAKE) -C $@ --no-print-directory

cortex: $(ORGANS)  # Depends on organs
    @$(MAKE) -C $(CORTEX) --no-print-directory
```

**Build order enforcement:**
1. `united-baremetal` first (bus foundation)
2. Kernel, memory, network in parallel
3. Dependent organs
4. `llm-baremetal` (cortex) last

### 5.3 **Organ Makefiles (Standard Pattern)**

**Example: `united-baremetal/Makefile`**

```makefile
CC = cc
CFLAGS = -std=c11 -Wall -Wextra -Iinclude
SRC = $(wildcard src/*.c)
OBJ = $(patsubst src/%.c,build/%.o,$(SRC))

build: $(OBJ)
test: build
    @echo "Smoke test passed: objects built"
clean:
    rm -rf build/
```

**Multi-language example: `bot-baremetal/Makefile`**

```makefile
all: core immune
core: build/ $(C_LIB)
immune:
    cd immune && $(CARGO) build --release
test: test-python test-rust test-bench
```

### 5.4 **Discovery Mechanism**

1. **At source:** `*.c` files via `$(wildcard src/*.c)`
2. **At module:** Organ Makefile defines targets
3. **At root:** Root Makefile lists organs explicitly
4. **Validation:** `smoke_baremetal.ps1` scans `*-baremetal` directories

---

## 6. FFI / INTEGRATION POINTS

### 6.1 **C ↔ C Integration (Dominant)**

**Pattern:** Header-based include hierarchy

```
united_bus.h (central interface)
    ↑
    ├← kernel-baremetal/oo_scheduler.c
    ├← identity-baremetal/self_recognition.c
    ├← sense-baremetal/retina_and_touch.c
    ├← reflex-baremetal/spinal_cord.c
    ├← swarm-baremetal/collective.c
    ├← shadow-baremetal/anti_forensics.c
    ├← dream-baremetal/dream_daemon.c
    └← (all other organs)
```

**Globule types** (communication protocol):
- RED (data/tensors)
- WHITE (immune/alerts)
- YELLOW (energy/control)
- GOLD (market data)
- SILVER (execution signals)
- PURPLE (semantic vectors)

### 6.2 **C ↔ Rust Integration**

**Location:** `bot-baremetal` + `vital-baremetal`

**C side:**
```c
// bot-baremetal/core/bot_dna.c
extern void rust_threat_analyze(uint8_t* sig, uint32_t len);
```

**Rust side:**
```rust
// bot-baremetal/immune/src/lib.rs
#[no_mangle]
pub extern "C" fn rust_threat_analyze(sig: *const u8, len: u32) { ... }
```

**Also in vital-baremetal:**
- `vital_guardian.rs` (Rust: security enforcement)
- `quantum_vault.rs` (Rust: cryptographic operations)

### 6.3 **C ↔ Python Integration**

**Location:** `bot-baremetal` + `yamaoo`

**C side:**
```c
// bot-baremetal/oo_bridge/bridge_agent.py (via ctypes or CFFI)
```

**Python side:**
```python
# tests/attack_sim/attack_sim.py — generates threat scenarios
# oo_bridge/bridge_agent.py — FFI interface to C libraries
```

### 6.4 **Rust Whole-System**

**Modules with Cargo.toml:**

| Crate | Purpose | FFI |
|-------|---------|-----|
| `oo-host` | Execution kernel | Calls into C via `libao_sys` + direct bindings |
| `oo-dplus` | Policy engine | `no_std`, talks to C via IPC |
| `bot-baremetal/immune` | Threat analysis | C-native, exports `extern "C" fn` |
| `vital-baremetal/src` (Rust) | Security + crypto | Linked into cortex |
| `yamaoo/native_desktop` | Desktop app | Rust frontend + C core via FFI |

### 6.5 **Boundary Clarity**

**Soma (Execution Layer) — C/ASM**
- `llm-baremetal`, all `*-baremetal` organs
- Direct hardware access, no abstraction

**Immune/Security — Rust**
- `vital-baremetal/src/*.rs`
- `bot-baremetal/immune/`
- Memory-safe threat analysis

**High-Level Logic — Python/Go**
- `oo-host` (Rust agent framework)
- `yamaoo` (desktop orchestration)
- `oo-dplus` (policy in Rust, embeddable)

**Clear separation:**
✅ **C → Rust** (unsafe blocks for FFI, extern "C")  
✅ **Rust → C** (safe wrappers)  
✅ **Python → C** (ctypes / CFFI)  
✅ **No Python → Rust direct** (via C bridge)

---

## 7. CURRENT GAPS & RECOMMENDED SOLUTIONS

### 7.1 **Gap: Module Linkage Registry**

**Problem:** Organ object files are built but not explicitly manifest for final linking.

**Current state:**
- Root Makefile builds organs → `organ/build/*.o`
- `llm-baremetal/Makefile` must know which `.o` files to collect
- No single manifest of "these .o files produce this library"

**Recommendation:**
```makefile
# Add to root Makefile
.PHONY: organ-objects

organ-objects:
    @for organ in $(ORGANS); do \
        find $$organ/build -name "*.o" >> organ_objects.txt; \
    done
    @echo "Organ objects listed in organ_objects.txt"
```

### 7.2 **Gap: Build Output Consistency**

**Problem:** Some organs may build `.a` (static lib), some `.o` (objects), some `.so` (shared).

**Current state:**
- Most organs only build `.o` files
- `bot-baremetal` builds `libbot_core.a`
- No standard artifact naming

**Recommendation:**
```makefile
# Standard in each Makefile
OUTPUT_LIB = $(MODULE_NAME)/build/lib$(MODULE_NAME).a
$(OUTPUT_LIB): $(OBJ)
    ar rcs $@ $^
    @echo "$(MODULE_NAME): $@"
```

### 7.3 **Gap: Undefined Symbol Detection (Pre-Link)**

**Problem:** No automated check for unresolved extern symbols before EFI build.

**Current state:**
- Only discovered at final `llm-baremetal` link stage
- Errors may appear late in build process

**Recommendation:**
```bash
# Add to smoke script: check for unresolved symbols
for obj in */build/*.o */build/*.a; do
    nm -u "$obj" | grep -v "^$" && echo "Unresolved in $obj"
done
```

### 7.4 **Gap: Header-Only Module Support**

**Problem:** Some organs (e.g., future additions) might be header-only or pure-Rust without C source.

**Current state:**
- Smoke script allows `include/` without `src/` (compatibility mode)
- But Makefile assumes `src/*.c` exists

**Recommendation:**
```makefile
# Conditional compilation
ifeq ($(wildcard src/*.c),)
    # Header-only: skip compilation
    .PHONY: build
    build:
        @echo "$(MODULE): header-only, no compilation"
else
    # Normal C compilation
    build: $(OBJ)
endif
```

### 7.5 **Gap: Centralized Symbol Export Registry**

**Problem:** No single place that documents "what symbols each organ exports".

**Current state:**
- Each organ has public headers in `include/`
- But no automated symbol extraction/validation

**Recommendation:**
Create `SYMBOLS.md` at repo root:

```markdown
## Exported Symbols by Organ

### united-baremetal
- `void united_bus_init(void)`
- `int united_bus_pump(globule_t g)`
- `int united_bus_absorb(uint8_t organ, globule_t* buf, int max)`
- `united_bus_health_t united_bus_get_health(void)`

### kernel-baremetal
- `void oo_scheduler_init(void)`
- `void oo_scheduler_tick(void)`
- ...
```

### 7.6 **Gap: Policy/Contract Enforcement**

**Problem:** No automated enforcement of "baremetal module standard" at build time.

**Current state:**
- `BAREMETAL_STANDARD.md` is documentation only
- Smoke test validates structure but doesn't block build

**Recommendation:**
```makefile
# Add pre-build check
.PHONY: validate-structure

validate-structure:
    @pwsh tools/scripts/smoke_baremetal.ps1 -FailOnMissing -FailOnStrictMissing
    
build: validate-structure $(OBJ)
```

---

## 8. MISSING PIECES SUMMARY

| Category | Issue | Severity | Recommendation |
|----------|-------|----------|---|
| **Linkage** | No manifest of final `.o` / `.a` outputs | 🟡 Medium | Create artifact registry |
| **Symbols** | No pre-link undefined symbol detection | 🟡 Medium | Add `nm -u` validation to smoke |
| **Header-Only** | Makefile assumes C sources exist | 🟡 Medium | Add conditional compilation |
| **Exports** | No centralized symbol documentation | 🟠 Low | Generate `SYMBOLS.md` |
| **Standards** | Module standard not enforced at build | 🟡 Medium | Make smoke test blocking |
| **Stubs** | `proprioception_stub.c` and `vital_bus_stub.c` not production-ready | 🔴 High | Implement proprioception fully |
| **Circular deps** | `bot_dna.h` ↔ `territory_map.h` (managed but fragile) | 🟠 Low | Document circular dep policy |
| **Rust linking** | `bot-baremetal/immune` must link into cortex EFI | 🔴 High | Add explicit Rust→EFI linking rules |

---

## 9. RECOMMENDED CENTRALIZATION APPROACH

### 9.1 **Proposed Module Manifest (NEW)**

**File:** `MODULE_MANIFEST.json`

```json
{
  "version": "1.0",
  "build_order": [
    "united-baremetal",
    "kernel-baremetal",
    "memory-baremetal",
    ...
  ],
  "organs": {
    "united-baremetal": {
      "id": 0,
      "biological_system": "Cardiovascular + Blood",
      "type": "VITAL",
      "headers": ["united_bus.h"],
      "exports": [
        "united_bus_init",
        "united_bus_pump",
        "united_bus_absorb",
        "united_bus_get_health"
      ],
      "depends_on": [],
      "language": "C"
    },
    "kernel-baremetal": {
      "id": 1,
      "biological_system": "Musculoskeletal",
      "type": "VITAL",
      "headers": ["oo_scheduler.h"],
      "exports": ["oo_scheduler_init", "oo_scheduler_tick"],
      "depends_on": ["united-baremetal"],
      "language": "C"
    },
    ...
  },
  "vital_chain": [0, 1, 2, 7, 14]
}
```

### 9.2 **Enhanced Smoke Script Integration**

Add validation rules:
1. Check `MODULE_MANIFEST.json` exists
2. Verify every organ listed has `include/` + `src/`
3. Verify export symbols exist in headers via `grep`
4. Validate build order (topological sort of depends_on)

### 9.3 **CI/CD Integration**

```yaml
# .github/workflows/baremetal-build.yml
- name: Validate module structure
  run: pwsh tools/scripts/smoke_baremetal.ps1 -FailOnStrictMissing

- name: Extract symbols
  run: ./tools/scripts/extract_symbols.sh > SYMBOLS.md

- name: Build all organs
  run: make organs

- name: Link cortex
  run: make cortex

- name: Smoke validation
  run: make test
```

### 9.4 **Documentation Loop**

Create auto-generated index:
- **File:** `ORGAN_INDEX.md` (generated from `MODULE_MANIFEST.json`)
- **Includes:** Per-organ:
  - Biological role
  - Engineering role
  - Public API (exported symbols)
  - Dependencies
  - Status (✅/🟡/⚠️)
  - Links to source

---

## 10. SUMMARY TABLE

### Subsystems (7-Layer)

| Layer | Component | Files | Status |
|-------|-----------|-------|--------|
| 1 | llm-baremetal | 1 facade | ✅ |
| 2 | oo-host | Rust crate | ✅ |
| 3 | oo-sim | C + scripts | 🟡 |
| 4 | oo-lab | Multi | 🟡 |
| 5 | oo-dplus | Rust no_std | ✅ |
| 6 | oo-system/meta | C | 🔲 |
| 7 | oo-system/iface | C CLI | ✅ |

### Organs (16 Baremetal)

| Organ | Headers | Impl. Files | Status | Vital? |
|-------|---------|-------------|--------|--------|
| united-baremetal | 1 | 1 | ✅ | YES |
| kernel-baremetal | 1 | 1 | ✅ | YES |
| memory-baremetal | 2 | 3 | ✅ | YES |
| network-baremetal | 4 | 2 | ✅ | YES |
| identity-baremetal | 1 | 1 | ✅ | NO |
| sense-baremetal | 1 | 1 | ✅ | NO |
| proprioception-baremetal | 1 | 1 STUB | ⚠️ | NO |
| vocal-baremetal | 1 | 1 PARTIAL | ⚠️ | NO |
| reflex-baremetal | 1 | 1 | ✅ | YES |
| evolution-baremetal | 1 | 1 | ✅ | NO |
| dream-baremetal | 1 | 1 | ✅ | NO |
| regen-baremetal | 1 | 1 | ✅ | NO |
| swarm-baremetal | 1 | 1 | ✅ | NO |
| shadow-baremetal | 1 | 1 | ✅ | NO |
| bot-baremetal | 1 | 2 C + Rust | ✅ | YES |
| vital-baremetal | 7 | 20 C + Rust | ⚠️ MIXED | YES |

### Integration

| Type | Boundary | Status | Issue |
|------|----------|--------|-------|
| C→C | via `#include` | ✅ Well-defined | None |
| C→Rust | via `extern "C"` | ✅ Clear | Linking complex |
| Rust→C | via `unsafe` blocks | ✅ Safe | None |
| Python→C | via `ctypes`/CFFI | ✅ Via bridge | Indirect only |
| IPC | united_bus globules | ✅ Standardized | None |
| Registry | control-planes | ✅ Present | Not used in final link |

---

## 11. ACTIONABLE RECOMMENDATIONS

### **IMMEDIATE (Week 1)**

1. ✅ **Create `MODULE_MANIFEST.json`** — Document organ metadata
2. ✅ **Make smoke test blocking** — Enforce baremetal standard at build time
3. ⚠️ **Implement `proprioception-baremetal` fully** — Replace stub

### **SHORT TERM (Month 1)**

4. ⚠️ **Generate `SYMBOLS.md`** — Auto-extract and document exports
5. ⚠️ **Add pre-link validation** — Detect unresolved symbols before final EFI link
6. 🟠 **Document Rust→EFI linking** — Clear rules for `vital-baremetal/src/*.rs`

### **MEDIUM TERM (Q2)**

7. 🟠 **Centralize artifact registry** — Track final `.o` / `.a` / `.so` outputs
8. 🟠 **Add header-only module support** — Conditional Makefile logic
9. 🟠 **Generate `ORGAN_INDEX.md`** — Auto-doc from manifest

### **LONG TERM (Q3+)**

10. 🔲 **Automated FFI boundary testing** — Validate C↔Rust contracts
11. 🔲 **Per-organ CI gates** — Test each organ independently before root build
12. 🔲 **Symbol deprecation tracking** — Mark symbols for removal/refactor

---

**End of Report**
