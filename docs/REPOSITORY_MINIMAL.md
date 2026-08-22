# Repository Structure: Minimal Professional

**Version:** 1.0  
**Date:** 2026-06-19  
**Objective:** Organize the OO Operating Organism repository like a long-lived professional project (cosmopolitan-style): minimal, focused, no dead code, every file has purpose.

---

## 1. REPOSITORY PRINCIPLES

### What We Keep

- **Core Organs**: kernel, memory, vital, network, LLM runtime (C implementations)
- **Host Tools**: oo-host CLI (Rust), yamaoo UI (Rust + C bridge)
- **Build System**: Makefiles, Cargo.toml, CI workflows
- **Documentation**: Canonical docs only (ARCHITECTURE, DESIGN_PRINCIPLES, LANGUAGE_STRATEGY, etc.)
- **Minimal Scripts**: build, validate, release automation

### What We Remove or Archive

- ❌ Old web frontends (React, TypeScript, yama.html)
- ❌ Duplicate documentation (consolidate into canonical docs)
- ❌ Build artifacts (logs, .o files, target/ directories)
- ❌ Dead code (stubs, experimental features, commented-out logic)
- ❌ Submodules unless they are vendored dependencies
- ❌ IDE cruft (.vscode, .idea, .vs inside repo—use .gitignore)
- ❌ Junk files (random screenshots, old logs, PNGs unless necessary)

### What We Validate

**Every commit must pass:**
1. `make validate` — syntax, headers, structure
2. `cargo build --locked` (Rust parts)
3. `make organs` (C parts) — no undefined symbols
4. No dead code, no junk files, no oversized binaries

---

## 2. DIRECTORY STRUCTURE

```
Operating-Organism/
│
├── .github/
│   ├── workflows/
│   │   └── ci-smoke.yml         # Single CI pipeline (validate + build)
│   └── scripts/
│       ├── validate_modules.ps1 # Module registry audit
│       └── symbol_audit.sh      # Pre-link validation
│
├── control-planes/
│   ├── include/
│   │   ├── oo_organ_state.h     # Organ registry
│   │   ├── oo_module_index.h    # Module centralization
│   │   └── oo_homeostasis.h     # State machine invariants
│   └── src/
│       ├── oo_organ_state.c
│       └── oo_homeostasis.c
│
├── kernel-baremetal/
│   ├── include/
│   │   └── oo_kernel.h
│   ├── src/
│   │   └── oo_kernel.c
│   └── Makefile
│
├── memory-baremetal/
│   ├── include/
│   │   └── oo_memory.h
│   ├── src/
│   │   └── oo_memory.c
│   └── Makefile
│
├── united-baremetal/
│   ├── include/
│   │   └── united_bus.h
│   ├── src/
│   │   └── united_bus.c
│   └── Makefile
│
├── vital-baremetal/
│   ├── include/
│   │   └── oo_vital.h
│   ├── src/
│   │   └── oo_vital.c
│   └── Makefile
│
├── network-baremetal/
│   ├── include/
│   │   └── oo_network.h
│   ├── src/
│   │   ├── nic_core.c
│   │   ├── nic_virtio.c
│   │   └── udp_stack.c
│   └── Makefile
│
├── reflex-baremetal/
│   ├── include/
│   │   └── oo_reflex.h
│   ├── src/
│   │   └── oo_reflex.c
│   └── Makefile
│
├── bot-baremetal/
│   ├── include/
│   │   └── bot_controller.h
│   ├── src/
│   │   ├── bot_controller.c
│   │   ├── bot_dna.c
│   │   └── threat_detection.c
│   └── Makefile
│
├── OPI-baremetal/
│   ├── include/
│   │   └── oo_llm.h
│   ├── src/
│   │   └── oo_llm.c
│   └── Makefile
│
├── sense-baremetal/
│   ├── include/
│   │   └── oo_sense.h
│   ├── src/
│   │   └── oo_sense.c
│   └── Makefile
│
├── oo-host/
│   ├── src/
│   │   ├── main.rs
│   │   ├── ffi.rs               # C↔Rust FFI boundary
│   │   └── commands.rs
│   ├── Cargo.toml
│   ├── Cargo.lock               # MUST be committed
│   └── README.md
│
├── yamaoo/
│   ├── native_desktop/
│   │   ├── src/
│   │   │   ├── main.rs          # egui UI
│   │   │   └── ffi.rs           # C bridge
│   │   ├── c_core/
│   │   │   ├── yama_core.c      # C implementation
│   │   │   └── yama_core.h
│   │   ├── Cargo.toml
│   │   ├── Cargo.lock
│   │   └── README.md
│   └── scripts/
│       └── run-native.ps1
│
├── oo-module-registry/
│   └── MODULE_MANIFEST.json     # Central registry of all modules
│
├── tools/
│   ├── scripts/
│   │   ├── smoke_baremetal.ps1  # Quick validation
│   │   └── build.sh             # Multi-stage build
│   └── validate/
│       └── check_headers.py     # Optional validation helpers
│
├── docs/
│   ├── ARCHITECTURE.md          # CANONICAL: system design
│   ├── DESIGN_PRINCIPLES.md     # Philosophy
│   ├── LANGUAGE_STRATEGY.md     # 90% C / 10% Rust strategy
│   ├── REPOSITORY_MINIMAL.md    # (this file)
│   ├── CONTRIBUTING.md          # Governance
│   └── ROADMAP.md               # Phased implementation
│
├── Makefile                     # Root: validate + organ builds
├── rust-toolchain.toml          # Pinned: stable
├── .gitignore                   # Exclude IDE, build artifacts
│
├── README.md                    # Entry point: what is OO, quickstart
└── LICENSE                      # MIT or permissive license

# DO NOT COMMIT
build/                           (gitignored)
target/                          (gitignored: Rust artifacts)
*.o, *.a                         (gitignored: C artifacts)
.vscode/, .idea/, .vs/           (gitignored: IDE files)
__pycache__/                     (gitignored: Python cache)
node_modules/                    (gitignored: npm cache—should not exist)
cleanup_archive_*/               (transitional, can be gitignored)
```

---

## 3. FILE CLASSIFICATION

### Tier 1: ESSENTIAL (Must Keep)

| File | Purpose | Language |
|------|---------|----------|
| `README.md` | Entry point, quickstart, philosophy | Markdown |
| `ARCHITECTURE.md` | Canonical system design | Markdown |
| `DESIGN_PRINCIPLES.md` | Core tenets | Markdown |
| `Makefile` | Build orchestration | Makefile |
| `rust-toolchain.toml` | Toolchain pin | TOML |
| `MODULE_MANIFEST.json` | Module registry | JSON |
| All `*-baremetal/` with `include/` + `src/` | Core organs | C |
| `oo-host/` with `Cargo.toml` + `Cargo.lock` | Host CLI | Rust |
| `yamaoo/native_desktop/` | UI + bridge | Rust + C |
| `.github/workflows/ci-smoke.yml` | CI pipeline | YAML |

### Tier 2: IMPORTANT (Good to Keep)

| File | Purpose |
|------|---------|
| `LANGUAGE_STRATEGY.md` | Language policy rationale |
| `CONTRIBUTING.md` | Governance rules |
| `ROADMAP.md` | Phased plan |
| `tools/scripts/` | Validation helpers |
| `oo-module-registry/` | Module audit source |

### Tier 3: OPTIONAL (Keep Only If Used)

| File | Purpose | Condition |
|------|---------|-----------|
| `oo-sim/`, `oo-lab/`, `oo-model/` | Simulation lanes | Only if actively maintained |
| `oo-constitution/` | Evolution plane | Only if phase 3+ |
| `oo-system/` | System integration | Only if demonstrated value |
| `bounty-helix/` | AI tools | Move to `tools/` or remove |

### Tier 4: ARCHIVE (Remove or Move)

| File | Action | Reason |
|------|--------|--------|
| `yamaoo/frontend/` | DELETE | Old React UI (replaced by Rust egui) |
| `yamaoo/app/` | DELETE | Duplicate of frontend |
| `yamaoo/backend/` | DELETE | Java backend (not used) |
| `desktop_display/` | MOVE to `yamaoo/native_desktop/desktop_display/` | Consolidate under yamaoo |
| Old HTML/CSS files | DELETE | Obsolete web UI |
| `.junie/plans/` | MOVE to `docs/ROADMAP_DETAIL.md` or ARCHIVE | Consolidate docs |
| `Operating-Organism/` (git submodule) | DELETE | Dead fork |
| `OPI-baremetal-github`, `OPI-baremetal-public` | DELETE | Duplicate repos |

---

## 4. VALIDATION RULES

### What Passes `git commit`

```bash
# Before commit, run:
make validate                    # Syntax, headers, module registry
cargo build --locked             # Rust compilation
make organs                       # C compilation + link check
```

### What Fails `git commit`

- ❌ Undefined symbols in `.o` files
- ❌ Header without matching `.c` file
- ❌ Module in `MODULE_MANIFEST.json` but directory missing
- ❌ Dead code (unused functions, commented-out blocks)
- ❌ File >5MB without justification
- ❌ Binary files (`.png`, `.gif`, `.o`, `.a`, images) except in `docs/` if necessary
- ❌ Python in `src/` (must be in `tools/`)
- ❌ TypeScript anywhere (except archive)
- ❌ Temporary files, logs, IDE configs

### CI/CD Pre-Merge Checks

**`.github/workflows/ci-smoke.yml`:**

```yaml
jobs:
  validate:
    - make validate              # Structure audit
    - cargo build --locked       # Rust determinism
    - make organs                # C determinism
    - ./tools/scripts/validate_modules.ps1  # Registry audit
    - no-dead-code check
    - file-size audit (max 5MB per file)
```

---

## 5. REPOSITORY HYGIENE CHECKLIST

### Monthly

- [ ] Review `git log` for any junk commits
- [ ] Check `.gitignore` covers IDE/build artifacts
- [ ] Audit `docs/` for contradictions or staleness
- [ ] Verify all `*-baremetal/` builds without warnings

### Quarterly

- [ ] Run `make validate` on a clean checkout
- [ ] Test CI pipeline on a real PR
- [ ] Archive any dead experimental code to `archive/` branch
- [ ] Update `MODULE_MANIFEST.json` with any new modules

### Annually

- [ ] Full architecture review: "Does every file still serve a purpose?"
- [ ] Check build toolchain versions (Rust, C compiler)
- [ ] Consolidate any duplicate documentation
- [ ] Plan next year's cleanup/refactoring

---

## 6. MIGRATION STEPS (From Current to Minimal)

### Step 1: Archive Dead Code (Week 1)

```bash
# Create archive branch
git checkout -b cleanup/archive-dead-code

# Move to archive/
mkdir -p archive/2026-06/dead-code/
mv yamaoo/frontend/* archive/2026-06/dead-code/
mv yamaoo/app/* archive/2026-06/dead-code/
mv yamaoo/backend/* archive/2026-06/dead-code/
rm -rf faceApp/ OPI-baremetal-github/ Operating-Organism/

git add -A
git commit -m "chore: archive obsolete code (frontend, app, backend)"
git push origin cleanup/archive-dead-code
```

### Step 2: Consolidate Documentation (Week 1)

```bash
# Keep only canonical docs
rm -f MANIFESTO_OO.md
rm -f docs/old_*.md
git commit -m "docs: consolidate to canonical ARCHITECTURE + DESIGN_PRINCIPLES"
```

### Step 3: Move Tools (Week 2)

```bash
# Organize tools
mv bounty-helix/scripts/* tools/scripts/ 2>/dev/null || true
mv bounty-helix/tools/* tools/ 2>/dev/null || true
# Keep bounty-helix as optional experimental (or archive it)

git commit -m "chore: organize tools under /tools/"
```

### Step 4: Validate Build (Week 2)

```bash
make validate
cargo build --locked  # in oo-host
make organs           # all C organs
# Fix any failures
```

### Step 5: Update CI (Week 3)

```bash
# Replace ci-smoke.yml with comprehensive checks
# Add .github/scripts/validate_modules.ps1
git commit -m "ci: add comprehensive validation pipeline"
```

### Step 6: Create Minimal Docs (Week 3)

```bash
# Add LANGUAGE_STRATEGY.md, REPOSITORY_MINIMAL.md, update CONTRIBUTING.md
git commit -m "docs: add language strategy and repository minimal guidelines"
```

### Step 7: Final PR (Week 4)

```bash
# Merge cleanup/archive-dead-code into main
# All tests pass
# Code review focused on: "Does every file we're keeping serve a purpose?"
```

---

## 7. WHAT SUCCESS LOOKS LIKE

- ✅ New contributor clones repo, reads `README.md` + `ARCHITECTURE.md`, understands OO in <10 min
- ✅ `make validate && cargo build --locked && make organs` → success in <2 min on modern hardware
- ✅ Every file in repo can be justified in one sentence
- ✅ No dead code, no dead docs, no junk files
- ✅ Build is deterministic: same source → same binary (bit-for-bit reproducible)
- ✅ CI catches file size, dead code, missing modules automatically
- ✅ Minimal repo size: <100MB (not counting .git history)
- ✅ Zero external language dependencies in bare-metal (C freestanding only)
- ✅ Repo is sustainable for 20+ years maintenance (no rot, no cruft accumulation)

---

## 8. FUTURE: PROFESSIONAL POLISH

Once the core repo is minimal:

1. **Logo + Branding**: Simple monochrome, no bloat
2. **Website**: GitHub Pages or static site only (no JS framework)
3. **Releases**: Signed, versioned, documented
4. **Security**: Public key infrastructure for builds (if needed)
5. **Community**: Contributing guide, code of conduct (minimal)

But first: **Get the core repository clean and defensible.**

