# Architecture of OO-BOT Baremetal

## 1. System Philosophy
OO-BOT Baremetal functions as a sovereign biological cell within the larger OO macro-organism. It does not possess large language model cognitive weights (which reside exclusively in OPI), but provides real-time reflex loops, physical hardware safety envelopes, and local instinct vetoes.

```
                    ┌─────────────────────────┐
                    │    OO-CONSTITUTION      │
                    │   (Supreme Sovereign)   │
                    └───────────┬─────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
       ┌──────────────────┐          ┌───────────────────┐
       │   OPI COGNITIVE  │          │  BOT BAREMETAL    │
       │     SUBSTRATE    │◄────────►│ (Sensori-Motor    │
       │ (Llama3.2/Memory)│  Hermes  │  Peripheral Organ)│
       └──────────────────┘   UDP    └─────────┬─────────┘
                                               │
                                     ┌─────────┴─────────┐
                                     ▼                   ▼
                            ┌────────────────┐   ┌───────────────┐
                            │ INSTINCT LAYER │   │  TERRITORY    │
                            │ & THREAT FSM   │   │  ZONE MAP     │
                            └────────────────┘   └───────────────┘
```

---

## 2. Core Subsystems

### 2.1 Bot DNA (`core/bot_dna.c`)
Every bot instance carries an immutable genome defined by:
- A human-readable identifier (`name`).
- Generational counter (`generation`).
- Hardware fingerprint (`hardware_fingerprint`).
- Capabilities bitmask (`capabilities_mask`).
- FNV-1a 64-bit verification digest (`dna_hash`).

Any run-time alteration of memory outside designated mutator channels immediately invalidates the DNA hash, placing the bot in immediate lock-down.

### 2.2 Territory Map (`core/territory_map.c`)
Defines the memory and I/O sovereignty of the bot across up to 8 discrete zones:
- `ZONE_PERIPHERAL_IO`: Hardware UART, GPIO, and actuation registers.
- `ZONE_DMA_BUFFER`: Shared sensory buffers.
- `ZONE_SENSOR_MMIO`: Memory-mapped sensor inputs.
- `ZONE_ISOLATED_MEM`: Internal state memory strictly isolated from remote writes.

Every memory access proposition is checked with `territory_map_check_access(map, addr, size, requested_flags)` before any instruction is allowed to actuate hardware.

### 2.3 Threat State FSM (`instinct/threat_state.c`)
The Threat State finite-state machine monitors the physical and relational integrity of the organ:
- `THREAT_LEVEL_NOMINAL`: Normal operation; regular heartbeats received.
- `THREAT_LEVEL_ELEVATED`: 3+ anomalies detected; increased verification strictness.
- `THREAT_LEVEL_CRITICAL`: 8+ anomalies; execution throttled.
- `THREAT_LEVEL_SPLIT_BRAIN`: 3000ms heartbeat loss; autonomous survival protocol activated.
- `THREAT_LEVEL_LOCKDOWN`: 15+ anomalies or severe tamper; all actions frozen.

### 2.4 Instinct & Sovereign Veto Layer (`instinct/instinct_layer.c`)
Implements the fundamental principle: **"OPI proposes, Bot disposes."**
Even if OPI issues a cryptographically valid command, the local Instinct Layer can emit:
- `VERDICT_ALLOW`: Safe to execute.
- `VERDICT_VETO_THREAT`: Blocked due to elevated threat level.
- `VERDICT_VETO_TERRITORY`: Blocked due to address boundary violation.
- `VERDICT_VETO_SPLIT_BRAIN`: Blocked because cognitive communication is severed and local survival prioritizes defense.

---

## 3. Communication Bridge
- **Hermes UDP Mesh** (`oo_bridge/hermes_udp.c`): Binds UDP port 11111 (configurable) and receives packets conforming to `HermesPacket` format.
- **NBIA FFI Integration** (`OO-NBIA`): Ingests sensory perceptions, ticks the latent awareness engine, and polls phenomena (`OOPhenomenon`) for decoupled reactive control.
