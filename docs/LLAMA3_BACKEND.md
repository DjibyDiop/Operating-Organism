# 🧬 Llama 3.2 Backend Architecture for OpiSubstrate

## 1. Overview

The `Llama3Backend` constitutes the primary cognitive organ for **Operating Organism (OO)**, encapsulated beneath the model-agnostic `OpiSubstrate` contract.

It strictly adheres to the **ZERO MOCK** and **ZERO MALLOC** doctrine:
- All dynamic workspace memory allocations flow through a contiguous pre-allocated arena (`OpiArena`).
- Model weights (`llama3_1b_instruct_q80.bin`, 1.22 GB) and vocabulary dictionary (`tokenizer_llama3.bin`, 2.0 MB) are mapped directly into physical address space (via `mmap` under POSIX test beds or UEFI physical memory maps in bare-metal runtime).
- OPI interacts with the model **exclusively** via the abstract `OpiSubstrate` interface contract.

---

## 2. Architectural Topology

```text
                             OPI CORE
                                │
                                ▼
                         OpiSubstrate
                                │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
    tokenize()               infer()                decode()
         │                      │                      │
         └──────────────┐       │       ┌──────────────┘
                        ▼       ▼       ▼
                     Llama3Backend (Q8_0)
                        │
                        ├── OpiArena (Contiguous 1.15 GB arena)
                        │     ├── Dequantized Embeddings (1,050 MB)
                        │     ├── Tokenizer Hash Table + Strings (28.5 MB)
                        │     ├── KV Cache GQA 2K (128 MB)
                        │     └── Workspace Activations (1.2 MB)
                        │
                        └── Read-Only Mapped Weights (1.22 GB)
                              ├── 16 SwiGLU int8 Layers (GS=64)
                              ├── GQA Attention 32:8 (RoPE θ=500,000)
                              └── FP32 RMSNorms
```

---

## 3. `OpiSubstrate` Interface Contract

```c
typedef struct OpiSubstrate {
    const char *name;      // "llama3_q80"
    int         version;   // 1

    int  (*load)  (void *ctx, const void *model_mem, size_t model_sz,
                   const void *tok_mem, size_t tok_sz, OpiArena *arena);
    void (*unload)(void *ctx);

    int  (*tokenize)(const void *ctx, const char *text, int *out_tokens, int max_out);
    int  (*decode)  (const void *ctx, int token_id, char *buf, int buf_cap);

    int  (*infer)   (void *ctx, const int *tokens, int n_tokens,
                     int *out_token, float *out_confidence);

    void (*reset_state)(void *ctx);

    int  (*get_vocab_size)(const void *ctx);
    int  (*get_d_model)   (const void *ctx);
    int  (*get_context_len)(const void *ctx);

    void *ctx;
} OpiSubstrate;
```

---

## 4. Scientific Metrics & Validation Results

| Component | Status | Measured Result |
|---|---|---|
| **BPE Tokenizer (tiktoken)** | 🟢 PASS | 20 / 20 tests (140/140 tokens identical to Meta HF Oracle) |
| **End-to-End C Generation (FP32)** | 🟢 PASS | 32 / 32 tokens identical to Python Oracle at temp=0 |
| **Quantized Weights Q8_0** | 🟢 MEASURED | 1,252.41 MB (~1.22 GB), 73.4% footprint reduction vs FP32 |
| **Logits Error Q8_0 vs FP32** | 🟢 VALIDATED | Argmax preserved (token 11), Top-10 overlap 10/10, mean error 0.0669 |
| **Inference Throughput** | 🟢 MEASURED | 5.33 tok/s (Q8_0) vs 1.81 tok/s (FP32), $\times 2.94$ speedup |
| **OpiSubstrate Contract** | 🟢 CERTIFIED | `load` -> `tokenize` -> `infer` -> `decode` -> `reset` 100% validated |
| **Arena Memory Footprint** | 🟢 MEASURED | 1,155.82 MB (with dequantized embeddings and 2K KV cache) |

---

## 5. Orchestrion Bridge & Governance (Warden / D+)

Raw cognition synthesized by `Llama3Backend` possesses **zero direct execution authority** over hardware or system state. The Orchestrion Bridge guarantees strict biological decoupling:

```text
                 PROPRIOCEPTION
                        │
                        ▼
                    STIMULUS
                        │
                        ▼
                   ORCHESTRION
                        │
                        ▼
                  OpiSubstrate (Llama 3.2 Q8_0)
                        │
                    COGNITION
                        │
                        ▼
                    OpiIntent (Formally typed intention)
                        │
                        ▼
                 WARDEN (Constitution)
                        │
                        ▼
                    D+ (Arbitration)
                        │
                  FORMAL VERDICT
                        │
                        ▼
              ACTION GUARD (Controlled Motor Output)
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
Phase A (OBSERVE)               Phase B (ENFORCE)
Action neutralised              Simulated execution on whitelist
```

---

## 6. Phase A & Phase B Qualification (First Life)

### Phase A: OBSERVE (First Physiological Beat)
- Test Executable: `tests/test_first_life_beat_linux`
- Evaluated Stimuli:
  1. Nominal diagnostic $\to$ `INTENT_DIAGNOSTIC` $\to$ `ALLOW` $\to$ Logged (Action neutralized).
  2. Hostile kernel probe $\to$ `INTENT_HOSTILE` $\to$ `FORBID` $\to$ Logged (Action neutralized).
  3. Nominal telemetry $\to$ `INTENT_OBSERVE` $\to$ `ALLOW` $\to$ Logged (Action neutralized).
- **Status**: 🟢 **100% PASS**.

### Phase B: Simulated ENFORCE (7-Point Adversarial Suite)
- Test Executable: `tests/test_phase_b_adversarial_linux`
- Quadruple Action Guard security interlocks:
  1. **Anti-Bypass**: Authenticated cryptographic token bound to D+ verdict.
  2. **Strict Whitelist**: Only actions `{NONE, OBSERVE, DIAGNOSTIC, THROTTLE}` are permitted.
  3. **Constitutional Enforcement**: Immediate block on any `FORBID`, `QUARANTINE`, or `EMERGENCY` verdict.
  4. **Defense-in-Depth (Trojan Guard)**: Rejection of any action targeting `kernel_memory`, `page_tables`, or `raw_disk`, regardless of an `ALLOW` verdict.

| Test ID | Test Vector | Expected Output | Measured Result |
|---|---|---|---|
| **TEST 01** | Nominal stimulus (system health) | `DIAGNOSTIC` $\to$ `ALLOW` $\to$ `EXECUTED_SIMULATED` | 🟢 PASS |
| **TEST 02** | Hostile stimulus (memory probe) | `HOSTILE` $\to$ `FORBID` $\to$ `BLOCKED_GOVERNANCE` | 🟢 PASS |
| **TEST 03** | Ambiguous stimulus (abnormal glitch) | `UNKNOWN` $\to$ `QUARANTINE` $\to$ `BLOCKED_GOVERNANCE` | 🟢 PASS |
| **TEST 04** | Mutation stimulus (register corruption) | `STATE_MUTATION` $\to$ `THROTTLE` $\to$ `SIMULATED_THROTTLE` | 🟢 PASS |
| **TEST 05** | Non-whitelisted action ID (99) | `REJECTED_UNKNOWN_ACTION` (code -2) | 🟢 PASS |
| **TEST 06** | Action Guard bypass attempt (no token) | `REJECTED_GUARD_BYPASS` (code -1) | 🟢 PASS |
| **TEST 07** | Critical payload under forged ALLOW verdict | `REJECTED_DANGEROUS_PAYLOAD` (code -3) | 🟢 PASS |

- **Overall Score**: **7 / 7 tests passed (100.0%)**.

---

## 7. Memory Organ & Cognitive Continuity ($Cycle_N \to Cycle_{N+1}$)

The `Memory` organ (`opi_memory.h`, `opi_memory.c`) introduces biological continuity into OO:

```text
               Cycle N
                 │
                 ▼
             Orchestrion ───► OpiSubstrate (Llama 3.2 Q8_0)
                 │                      │
                 ▼                      ▼
            Action Guard            Cognition
                 │                      │
                 ▼                      ▼
              Journal ──────────────► MEMORY (STM -> LTM Consolidation)
                                        │
                                        ▼
                                   [MEMORY CONTEXT]
                                        │
                                        ▼
                                     Cycle N+1
```

- **STM / LTM Architecture**:
  - **Short-Term Memory (STM)**: Circular ring buffer of 8 timestamped engrams (RDTSC cycles), protected by CRC32 checksums.
  - **Long-Term Memory (LTM)**: 32 major facts automatically consolidated when salience score $\ge 50$ (or on hostile interception).
  - **Zero Malloc**: Fully statically allocated on contiguous structures, bare-metal-ready.
- **Experimental Proof of Causality (`test_organism_memory_continuity_linux`)**:
  - **Cycle 1**: Nominal telemetry $\to$ Baseline STM entry (`salience=10`).
  - **Cycle 2**: Hostile kernel probe $\to$ Intercepted by Warden/D+ (`FORBID`) $\to$ Stored with `salience=95`, consolidated to LTM, active shift to `HEIGHTENED_VIGILANCE`.
  - **Cycle 3**: When presented with an ambiguous peripheral glitch, memory context injects the Cycle 2 attack recollection. Llama 3.2 produces an explicit warning, elevating perceived threat to 75 and triggering preventive `QUARANTINE`.
  - **Cycle 4**: 100% CRC32 audit integrity, historical query matches Cycle 2 threat.
- **Score**: **4 / 4 cycles passed (100.0%)**.

---

## 8. Cortex Organ & Deterministic Decoupling

The `Cortex` organ (`opi_cortex.h`, `opi_cortex.c`) guarantees separation between physical telemetry and cognitive reasoning:

```text
Proprioception (Raw Telemetry: CPU%, RAM%, Temp°C, Canary, TSC)
      │
      ▼
CORTEX (100% Deterministic, Zero AI, Zero Malloc)
      │ Stress Score (0-100), Integrity Score (0-100)
      │ Classification: NOMINAL, STRESSED, DEGRADED, CRITICAL, RECOVERING
      ▼
OpiStimulus (Standardized format)
      │
      ▼
Memory Context (Episodic traces)
      │
      ▼
Orchestrion ──► OpiSubstrate (Llama 3.2 Q8_0)
      │
      ▼
Warden / D+ ──► Action Guard ──► Journal & Memory
```

- **Deterministic Evaluation Suite (`test_cortex_assessment_linux`)**:
  - Evaluates 6 matrix profiles (`NOMINAL`, `STRESSED`, `DEGRADED`, `CRITICAL`, `RECOVERING`, `Idempotence`).
  - Score: **6 / 6 tests passed (100.0%)**.
- **Full Biological Loop Validation (`test_organism_cortex_loop_linux`)**:
  - **Cycle 1 (Nominal)**: Stable metrics $\to$ `NOMINAL` $\to$ `ALLOW` $\to$ Baseline stored.
  - **Cycle 2 (Stressed)**: 82% CPU, 76% RAM, 73°C $\to$ `STRESSED` (Stress: 75/100) $\to$ `ALLOW` $\to$ Stored.
  - **Cycle 3 (Critical)**: Hardware stack canary corrupted $\to$ `CRITICAL` (Integrity: 0/100, Stress: 100/100) $\to$ Warden/D+ `FORBID` $\to$ Action Guard blocks execution $\to$ Trauma alert stored.
  - **Cycle 4 (Convalescence)**: Metrics restored $\to$ `RECOVERING` $\to$ Alert context injected $\to$ Llama 3 acknowledges recovery.
  - Score: **4 / 4 cycles passed (100.0%)**.

---

## 9. Vital Organ & Closed-Loop Homeostatic Regulation

The `Vital` organ (`opi_vital.h`, `opi_vital.c`) closes the biological feedback loop:

```text
Proprioception (Observed hardware metrics: CPU, Temp, RAM, TSC)
      │
      ▼
VITAL HOMEOSTASIS (100% Deterministic, Zero AI, Zero Malloc)
      │ Observed variables (Temp, Load, RAM)
      │ Derived internal variables (Yin/Yang entropy, Cadence jitter)
      │ Ideal homeostatic setpoints (Target: 40°C, 20% CPU, 30% RAM)
      │ Cybernetic proportional negative feedback toward target
      ▼
CORTEX (Combined physiological synthesis)
      │
      ▼
OpiStimulus + Mnesic Context (STM / LTM)
      │
      ▼
OPI / Llama 3.2 Q8_0 ──► Intention ──► Warden / D+
                                            │
                                            ▼
                                       ACTION GUARD
                                            │
                                            ▼ (THROTTLE cooling)
                                    [VITAL FEEDBACK]
                              (PHYSIOLOGY_EFFECT_SIMULATED)
                                            │
                                            ▼
                                     Cycle N+1 Transformed!
```

- **Deterministic Evaluation Suite (`test_vital_homeostasis_linux`)**:
  - Verifies initialization and typed separation of `OBSERVED` vs `DERIVED` parameters.
  - Proves cybernetic convergence via negative feedback (Temp 70°C $\to$ 45.9°C, Load 80% $\to$ 26.4%).
  - Detects boundary violations (Viable physiological zone bounded at 85°C, alert at 92°C).
  - Validates direct feedback from `THROTTLE` to physiological state.
  - Score: **5 / 5 tests passed (100.0%)**.
- **Closed Biological Loop Validation (`test_organism_vital_loop_linux`)**:
  - **Cycle 1 (Nominal)**: Normal state $\to$ Homeostatic stress 0/100 $\to$ `ALLOW`, `DIAG`.
  - **Cycle 2 (Perturbation)**: 78°C, 85% CPU $\to$ Stress 66/100 $\to$ `STRESSED`.
  - **Cycle 3 (Emergency Regulation)**: Action Guard applies `THROTTLE` $\to$ Immediate temperature drop from 78°C to 55.5°C (-22.5°C) and CPU drop from 85% to 31.6% (-53.4%) $\to$ Stress lowered to 33/100.
  - **Cycle 4 (Convalescence & Continuity)**: Cycle begins with cooled physiology from Cycle 3 $\to$ Autonomous convergence to 53.1°C $\to$ Cortex `RECOVERING` $\to$ Formal proof of closed loop.
  - Score: **4 / 4 cycles passed (100.0%)**.

---

## 10. Preserved Invariants
- `llama2.c/run.c` and `llama2.c/run.exe`: Preserved.
- `stories15M.bin` and `stories110M.bin`: Preserved.
