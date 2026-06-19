# Language Strategy: 90% C / 10% Rust+C++

**Version:** 1.0  
**Date:** 2026-06-19  
**Objective:** Maximize runtime determinism and portability by concentrating core logic in C, using Rust only for host tools and safe FFI boundaries, and C++ only as optional bridges.

---

## 1. LANGUAGE ALLOCATION

### 90% Core Logic: C

**Scope:**
- All bare-metal organs (kernel, memory, vital, network, LLM runtime)
- Device drivers
- Inter-organ communication protocols (globule)
- Low-level state machines and invariants
- Memory allocators and data structures
- Boot code and initialization sequences

**Why C:**
- Deterministic: no garbage collector, no hidden allocations, no runtime overhead
- Portable: compiles to every platform (bare-metal, Linux, Windows, macOS)
- Auditable: minimal implicit behavior, suitable for 20+ year maintenance
- Measurable: symbol tables, linking, build artifacts are stable and observable

**Standards:**
- C11 or C17 (freestanding subset)
- No C++ features, no POSIX-only APIs (except where hardware requires)
- Explicit error handling (return codes, not exceptions)

---

### 5% Host Tooling: Rust

**Scope:**
- `oo-host`: CLI dispatch, telemetry parsing, debug interface
- `yamaoo/native_desktop`: UI framework (egui), rendering, user interaction
- FFI wrappers: safe abstractions around C organs (managed at build boundary)

**Why Rust:**
- Safety: prevents segfaults in host tools (not critical path, but nice-to-have)
- Ergonomics: pattern matching, strong type system for CLI parsing
- Cargo: reproducible dependency management via `Cargo.lock`

**Restrictions:**
- No Rust in bare-metal critical path
- No procedural macros in core organs
- All Rust code must cross C FFI only at explicit boundaries
- `cargo build --locked` must produce bitwise reproducible output

**Examples:**
```rust
// GOOD: Rust CLI parses telemetry from C organ
fn main() {
    let json_str = unsafe { ffi::organ_status() };
    let status: OrgStatus = serde_json::from_str(&json_str)?;
    println!("{:?}", status);
}

// BAD: Rust logic in critical path
// (organ state machines, memory allocation, real-time scheduling)
```

---

### 5% Bridge/Optional: C++

**Scope:**
- Hardware abstraction layers (if needed)
- External library integrations (only if proven necessary)
- NEVER: business logic, state machines, or performance-critical code

**Why minimal C++:**
- Not needed for MVP
- Adds complexity to build system
- Encourages abstraction layers that hide implementation details
- Use only if a proven dependency requires C++ or strong typing

**Restrictions:**
- No C++ in bare-metal
- No C++ in organs (use C)
- C++ compiles to statically-linked `.a` only
- All C++ must be optional dependency (can compile without it)

**Example acceptable use:**
```cpp
// Optional cryptography bridge (not in critical path)
extern "C" {
  int crypto_hash(const uint8_t *data, uint32_t len, uint8_t *out) {
    auto hasher = SHA256();
    hasher.update(data, len);
    hasher.finalize(out);
    return 0;
  }
}
```

---

## 2. MIGRATION PHASES

### Phase 1: Stabilize C Core (2026-Q3)

**Goals:**
- All organs have C implementations (no stubs)
- Remove Rust code from critical paths
- Validate `make organs && make cortex` produces stable EFI binary

**Actions:**
1. Audit current C implementations for completeness
2. Convert any remaining pseudo-code or partial organs to C
3. Ensure all headers have matching implementations
4. Update Makefiles to enforce C11 freestanding

**Checklist:**
- [ ] All organs in `oo-module-registry/MODULE_MANIFEST.json` have status="complete"
- [ ] `make organs` builds without warnings (except deprecation in old headers)
- [ ] `nm -u kernel.efi | grep -v __` returns empty
- [ ] EFI binary boots and initializes all vital chain organs

---

### Phase 2: Extract Rust to Host Layer (2026-Q3/Q4)

**Goals:**
- Move `oo-host` from mixed Rust/Python to pure Rust
- `yamaoo/native_desktop` goes from TypeScript+Rust to pure Rust
- Define clean FFI boundary between C runtime and Rust tools

**Actions:**
1. Create `oo-host/src/ffi.rs`: safe wrappers around C organ APIs
2. Rewrite telemetry parsers in Rust (serde_json)
3. Migrate yamaoo UI from TypeScript to egui-driven Rust
4. Lock toolchain: `rust-toolchain.toml` = `stable`
5. Add `Cargo.lock` to version control (deterministic builds)

**Checklist:**
- [ ] `cargo build --locked` in `oo-host` succeeds
- [ ] `cargo build --locked` in `yamaoo/native_desktop` succeeds
- [ ] All Rust→C calls go through `ffi.rs`
- [ ] No C code imported directly into Rust modules

---

### Phase 3: Remove Optional Languages (2026-Q4)

**Goals:**
- Remove Python from runtime critical path (tools only)
- Eliminate TypeScript entirely
- Consolidate build targets

**Actions:**
1. Move `bounty-helix` tools to Python scripts under `tools/`, not in core build
2. Archive/remove React frontend completely
3. Consolidate YAML/shell configurations
4. Single build graph: `make organs` → `make cortex` → `cargo build`

**Checklist:**
- [ ] No Python in any Makefile (only optional dev tools)
- [ ] No TypeScript files except in archive
- [ ] CI workflow builds C, then Rust, no python

---

### Phase 4: C++ Bridges (2026-Q1 2027 or later)

**Goals:**
- If external dependencies arise, create optional C++ adapters
- NEVER add C++ to critical path
- Maintain ability to build without C++

**Actions:**
1. Create `third-party/adapters/` for optional C++ bridges
2. Document why each C++ bridge exists
3. Add build flag `--with-cpp-adapters` (default off)
4. Link C++ only if explicitly requested

---

## 3. BUILD VALIDATION

### Language Enforcement Rules

```makefile
# In root Makefile
validate-languages:
	# C: must compile with -std=c11 -ffreestanding
	find . -name "*.c" -path "*/src/*" | xargs gcc -std=c11 -ffreestanding -c
	
	# Rust: must use Cargo.lock (no floating versions)
	grep -q "\[\[package\]\]" Cargo.lock || exit 1
	
	# No Python in /src/
	! find . -name "*.py" -path "*/src/*" | grep -v tools/ | grep .
	
	# No TypeScript anywhere
	! find . -name "*.ts" -o -name "*.tsx" | grep -v archive/ | grep .
```

### CI/CD Checks

**`.github/workflows/ci-smoke.yml` additions:**

```yaml
jobs:
  language-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Audit C code
        run: |
          clang --version
          make validate-languages
          
      - name: Verify Cargo.lock pinned
        run: |
          if ! grep -q "version = 4" Cargo.lock; then
            echo "ERROR: Cargo.lock not version 4 (determinism issue)"
            exit 1
          fi
          
      - name: Ensure no Python in src/
        run: |
          if find . -path "*/src/*.py" | grep .; then
            echo "ERROR: Python files in /src/ (must be in /tools/)"
            exit 1
          fi
```

---

## 4. FFI BOUNDARIES

### C ↔ Rust Interface

**File:** `oo-host/src/ffi.rs`

```rust
// Safe wrapper around C function
pub unsafe fn organ_status() -> Result<OrgStatus, String> {
    let c_str = ffi::c_organ_status();
    if c_str.is_null() {
        return Err("organ_status returned NULL".to_string());
    }
    let rust_str = CStr::from_ptr(c_str).to_str()?;
    let status = serde_json::from_str(rust_str)?;
    ffi::c_free_string(c_str);  // C function must free its own strings
    Ok(status)
}

// Rust calls C
extern "C" {
    fn c_organ_status() -> *const c_char;
    fn c_free_string(ptr: *const c_char);
}
```

**File:** `yamaoo/native_desktop/c_core/yama_core.h`

```c
// C exposes JSON API to Rust
extern const char* system_status(void);      // JSON string
extern const char* modules_state(void);      // JSON string
extern void yamaoo_free_string(const char*); // Must free C strings

extern int process_intent(const char* json_intent);
extern int heartbeat(void);
extern int action(const char* action_name);
```

### Rules

1. **C allocates, C frees**: Never have Rust free C memory
2. **Strings as JSON**: All C→Rust data must be JSON (no binary structs)
3. **Errors as codes**: Return int, not exceptions
4. **No Rust types in C**: C must not know about Rust structures

---

## 5. LONG-TERM MAINTENANCE

### Why This Strategy Works for 20 Years

| Aspect | C | Rust | C++ |
|--------|---|------|-----|
| **Portability** | Every platform has C11 | Requires Rust toolchain | Requires g++/clang++ |
| **Auditability** | Full control over machine code | High-level, harder to audit | Hides behavior behind templates |
| **Performance** | Direct + predictable | Zero-cost abstractions (good) | Template bloat (bad) |
| **Skill Transfer** | Every programmer knows C | Rust learning curve | C++ complexity grows |
| **Build Reproducibility** | `-Wall -Werror` + deterministic | Cargo.lock (good) | CMake (fragile) |
| **Dependency Attack Surface** | Minimal (freestanding) | Cargo crates (external risk) | Optional bridges only |

### What Prevents Bit-Rot

1. **C core is self-contained**: No external C dependencies (except libc when ported)
2. **Rust is host-only**: Can be upgraded/refactored without breaking bare-metal
3. **C++ is optional**: Can be removed entirely without breaking MVP
4. **Tests are simple**: Unit tests run on C, integration tests via Rust tools

---

## 6. WHAT NOT TO DO

- ❌ Never put Rust code in bare-metal organs
- ❌ Never use C++ in critical paths
- ❌ Never link Python into kernel (tools only)
- ❌ Never have floating `Cargo` versions (always `Cargo.lock`)
- ❌ Never allow TypeScript in core repository
- ❌ Never hide implementation details in templates (C++ trait objects)
- ❌ Never add languages without updating this document
- ❌ Never mix language "just for convenience"—each language must earn its place

---

## 7. CHECKLIST FOR NEW CODE

Before committing any code:

1. **Which layer?** (bare-metal core vs host tool vs optional bridge)
2. **Which language choice?**
   - Core logic → C
   - Host CLI/UI → Rust
   - External adapter → C++ (if proven necessary)
   - Never anything else
3. **Build determinism:**
   - C: `-fno-asynchronous-unwind-tables -deterministic` flags set
   - Rust: `Cargo.lock` present and pinned
4. **FFI check:**
   - C↔Rust calls through defined boundary
   - No direct struct sharing
   - Strings only (JSON if complex data)
5. **Update `MODULE_MANIFEST.json`:**
   - New module registered with language field
6. **Update this document:**
   - If adding new language or changing strategy

