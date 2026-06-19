# Operating Organism Architecture — Central Integration Map

**Version:** 1.0  
**Date:** 2026-06-18  
**Scope:** Complete module/driver interconnection diagram and centralization strategy

---

## 1. LAYERED ARCHITECTURE

The OO organism operates on 7 interconnected layers:

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 6: Interface (yamaoo, egui, Nexus)                    │
│   └─ Visualization, user control, external I/O              │
├─────────────────────────────────────────────────────────────┤
│ Layer 5: Meta (control-planes, homeostasis FSM)             │
│   └─ Coordination, state aggregation, health checks         │
├─────────────────────────────────────────────────────────────┤
│ Layer 4: Evolution (oo-dplus, evolution-baremetal)          │
│   └─ Agent adaptation, genetic algorithms, fitness eval     │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: Simulation (oo-sim, oo-lab, oo-model)              │
│   └─ Testing, validation, offline learning                  │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: Execution (oo-host, oo-dplus runtime)              │
│   └─ Orchestration, dispatch, FFI boundaries                │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: Cognitive Core (llm-baremetal)                     │
│   └─ Language models, reasoning, decision-making            │
├─────────────────────────────────────────────────────────────┤
│ Layer 0: VITAL CHAIN (must never fail)                      │
│   ├─ united-baremetal (bus)                                 │
│   ├─ kernel-baremetal (scheduler)                           │
│   ├─ memory-baremetal (allocator)                           │
│   ├─ reflex-baremetal (GPIO)                                │
│   ├─ vital-baremetal (heartbeat)                            │
│   ├─ network-baremetal (packets)                            │
│   └─ bot-baremetal (motor control)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. ORGAN DEPENDENCY GRAPH

### Build Order (Strict Topological Sort)

```
Phase 0 (Foundation):
  united-baremetal (no deps)

Phase 1 (Core Services):
  kernel-baremetal      ← united-baremetal
  memory-baremetal      ← kernel-baremetal

Phase 2 (Reactive & Vital):
  reflex-baremetal      ← memory-baremetal, kernel-baremetal
  vital-baremetal       ← reflex-baremetal, memory-baremetal

Phase 3 (IO & Communication):
  network-baremetal     ← vital-baremetal
  bot-baremetal         ← network-baremetal, vital-baremetal

Phase 4 (Sensory):
  sense-baremetal       ← bot-baremetal
  proprioception        ← sense-baremetal

Phase 5 (Cognitive - Solo):
  dream-baremetal       ← memory-baremetal
  evolution-baremetal   ← dream-baremetal

Phase 6 (Cognitive - Integrated):
  shadow-baremetal      ← evolution-baremetal
  identity-baremetal    ← shadow-baremetal
  vocal-baremetal       ← identity-baremetal

Phase 7 (Collective):
  swarm-baremetal       ← identity-baremetal, network-baremetal
  llm-baremetal         ← swarm-baremetal, shadow-baremetal
```

### FFI Boundaries

| Source | Target | Mechanism | Status |
|--------|--------|-----------|--------|
| C ↔ C | All organs | `#include` + globule protocol | ✅ Native |
| Rust ↔ C | native_desktop ↔ yama_core | `extern "C"` + unsafe wrapper | ✅ Safe |
| Python ↔ C | bot-baremetal tools | ctypes bridge | ✅ Indirect |
| CLI ↔ Organism | oo-host, oo-dplus | Command dispatch + JSON | ✅ Validated |

---

## 3. CENTRAL REGISTRY FILES

### `oo-module-registry/MODULE_MANIFEST.json`
**Purpose:** Single source of truth for all modules  
**Contains:**
- Organ ID, name, type, role, status
- Header files, implementations, dependencies
- Build directory, include paths
- Export symbols
- Known TODOs

**Usage:**
```bash
# Build validation script reads this
python scripts/validate_manifest.py

# CI smoke checks module presence
jq '.organs[] | .name' oo-module-registry/MODULE_MANIFEST.json
```

### `control-planes/include/oo_module_index.h`
**Purpose:** Centralized C header for module initialization and lookup  
**Provides:**
- `oo_organ_id_t` enum (0-16)
- `oo_vital_chain[]` array
- Function signatures for all module inits
- Macros for symbol validation

**Usage:**
```c
#include "oo_module_index.h"

// Boot vital chain first
oo_boot_vital_chain();

// Then boot cognitive modules
oo_boot_all_modules();
```

---

## 4. MODULE INTERCONNECTIONS

### Globule Protocol (Organ-to-Organ Communication)

All inter-organ messages use **united_bus** as hub:

```c
// organ_a.c sends to organ_b
struct globule msg = {
    .color = RED,        // priority
    .source = ORGAN_A,
    .dest = ORGAN_B,
    .payload = { ... }
};
globule_send(&msg);

// organ_b receives asynchronously
if (globule_receive(ORGAN_B, &msg)) {
    process_message(&msg);
}
```

### Direct #include Dependencies

```
llm-baremetal
  ├─ #include "oo_swarm.h"         (swarm-baremetal)
  └─ #include "oo_shadow.h"        (shadow-baremetal)
      ├─ #include "oo_evolution.h" (evolution-baremetal)
      └─ #include "oo_identity.h"  (identity-baremetal)
          └─ #include "oo_shadow.h"
              └─ #include "oo_dream.h" (dream-baremetal)
```

### Missing Implementations

| Module | Status | Gap | Action |
|--------|--------|-----|--------|
| proprioception-baremetal | Stub | Full body-state tracking with IMU/accelerometer fusion | Implement body-awareness |
| vocal-baremetal | Partial | Audio codec support, streaming | Expand audio I/O |
| united_bus | Complete | Built-in fallback for stub | Ready |

---

## 5. BUILD SYSTEM INTEGRATION

### Root Makefile Sequence

```makefile
# make organs — builds all 16 organ .o files in build/ subdirs
make organs
  → Executes each organ's Makefile
  → Produces organ/build/*.o
  → Validates symbols: nm -u *.o

# make cortex — links final EFI binary
make cortex
  → Links all .o files + libc + bootloader
  → Strips symbols table
  → Produces KERNEL.EFI

# make validate — pre-link checks
make validate
  → Checks MODULE_MANIFEST.json presence
  → Verifies all header files exist
  → Validates undefined symbols
  → Checks vital chain order
```

### CI/CD Pipeline

**File:** `.github/workflows/ci-smoke.yml`

```yaml
jobs:
  build-matrix:
    - cargo build --locked (oo-host, native_desktop)
    - make validate
    - make organs
    - nm -u build/*/*.o | grep -v __  # undefined symbol audit
    - make cortex
```

---

## 6. CENTRALIZATION STRATEGY

### What Gets Centralized

✅ **Module Registry** → `oo-module-registry/MODULE_MANIFEST.json`
✅ **Init Sequences** → `oo_module_index.h` + boot functions
✅ **Symbol Validation** → CI/CD pipeline + validation script
✅ **Documentation** → This file + per-module README.md

### What Stays Distributed

❌ **Implementations** → Each organ keeps its source code
❌ **Build Configs** → Each organ has its own Makefile
❌ **Headers** → Remain in organ-specific `include/` folders

### Validation & Linking

Pre-link validation script (`.github/scripts/validate_modules.ps1`):

```powershell
# Pseudo-code
foreach ($organ in $manifest.organs) {
    $headers = Get-ChildItem $organ.includes/*.h
    $impls = Get-ChildItem $organ.buildDir/*.c
    
    # Check headers match implementations
    # Check symbols don't conflict
    # Check dependencies are satisfied
}

# Final link check
nm -u *.o | where { $_ -notmatch '__' }  # should be empty
```

---

## 7. NEXT STEPS (Priority Order)

1. ✅ **Create MODULE_MANIFEST.json** — done
2. ✅ **Create oo_module_index.h** — done
3. 🔄 **Update CI workflow** — add symbol validation
4. 🔄 **Implement missing modules**:
   - Proprioception full body-state tracking
   - Vocal audio codec expansion
5. 🔄 **Create validation scripts** in `.github/scripts/`
6. 📋 **Per-organ README.md** — document each organ's API
7. 📋 **Test full boot sequence** — verify all init functions

---

## 8. QUICK REFERENCE

| Task | Command | Location |
|------|---------|----------|
| View all modules | `jq '.organs[]' oo-module-registry/MODULE_MANIFEST.json` | CLI |
| Build all organs | `make organs` | Root Makefile |
| Link final binary | `make cortex` | Root Makefile |
| Check undefined symbols | `nm -u build/*/*.o \| grep -v __` | Pre-link validation |
| Boot sequence | `oo_boot_all_modules()` | oo_module_index.h |
| Module status | `oo_module_print_registry()` | oo_module_index.h |

