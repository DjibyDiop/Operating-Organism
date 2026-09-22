# OO-BOT Baremetal — Sovereign Peripheral Organism

## Overview

**OO-BOT Baremetal** is the peripheral sensori-motor organism of the OO ecosystem. While **OPI** serves as the central cognitive substrate, OO-BOT governs local peripheral actuation, hardware I/O boundaries, deterministic reflexes, and split-brain survival under the **OO-Constitution**.

> **FUNDAMENTAL PRINCIPLE (Zero Mocks Policy)**:
> The organism operates entirely in physical and real memory space. All subsystems (DNA verification, territory sandboxing, threat FSM, Hermes UDP communication, and NBIA latent awareness) execute real deterministic code with zero simulated mocks.

---

## Key Capabilities

1. **Bot DNA & Cryptographic Integrity** (`core/bot_dna.c`):
   - 64-bit FNV-1a continuous integrity hashing.
   - Hardware fingerprint binding and generation tracking.
   - Immediate rejection upon tampering.

2. **Territory Sandboxing** (`core/territory_map.c`):
   - Discrete memory zones (`ZONE_PERIPHERAL_IO`, `ZONE_DMA_BUFFER`, `ZONE_SENSOR_MMIO`, `ZONE_ISOLATED_MEM`).
   - Strict boundary and access permission validation (Read, Write, Execute).

3. **Threat State FSM & Split-Brain Autonomy** (`instinct/threat_state.c`):
   - Multi-tier threat evaluation (`NOMINAL`, `ELEVATED`, `CRITICAL`, `SPLIT_BRAIN`, `LOCKDOWN`).
   - 3000ms heartbeat timeout detecting cognitive isolation from OPI.
   - Automatic transition to autonomous split-brain survival routines.

4. **Instinct & Sovereign Veto Layer** (`instinct/instinct_layer.c`):
   - Independent verification of every action proposal.
   - Instant local veto against out-of-boundary access, lockdown, or unauthorized mutations.

5. **Hermes UDP Mesh Integration** (`oo_bridge/hermes_udp.c`):
   - Dual-stack (POSIX Sockets & Windows Winsock2) Hermes network transport.
   - Direct packet routing to the NBIA reflex engine.

6. **NBIA Reflex Substrate** (linked from `OO-NBIA/target/release/libnbia.a`):
   - D+ Organism bytecode loading.
   - Latent awareness state tracking and phenomenon polling (`DRIFT`, `EMERGENCE`, `PHASE_CHANGE`, `CONVERGENCE`).

---

## Build & Test Instructions

### Prerequisites
- GCC (`gcc` with C11 support)
- Rust & Cargo (for compiling `OO-NBIA`)
- Linux / WSL2 or Windows MinGW

### Building the Organism
```bash
# Build core library and executables
make all
```

### Running the Sovereign Test Suite (100% Pass)
```bash
make test
```

### Running the Bounded Homeostasis Daemon
```bash
# Run 100 homeostasis loops (10ms tick rate)
./build/bot 100

# Or run unbounded in continuous operation
./build/bot
```
