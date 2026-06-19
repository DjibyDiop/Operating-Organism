# OO Organ Catalog (Biological + Engineering Views)

This file defines the complete organ/system map for OO (Operating Organism).
It does not change any existing directory structure.

## Scope

- Human-inspired full map, but technically measurable.
- Each biological system maps to one or more software engines.
- Existing repositories are reused as they are.

## Organ/System Mapping Matrix

| Biological System | Biological Role | OO Engineering Role | Primary Engines | Baremetal Module | Higher Modules |
|---|---|---|---|---|---|
| Nervous System (CNS/PNS) | Perception, decision, coordination | Global orchestration, signal routing, state transition control | `StrategicBrainEngine`, `SignalBusEngine`, `StateTransitionEngine` | `united-baremetal` (IPC bus) | `oo-system`, `oo-host` |
| Brain Cortex | Planning, reasoning | Long-horizon planning and interpretation via SSM | `PlannerEngine`, `ReasoningEngine` | `llm-baremetal` (thalamic-bloom) | `oo-host`, `oo-model` |
| Brainstem | Vital reflexes | Hard safety path and survival fallback | `ReflexEngine`, `SafeModeEngine` | `reflex-baremetal`, `kernel-baremetal` | `oo-dplus` |
| Spinal Cord | Fast local reflex loops | Low-latency local correction before global planning | `LocalReflexLoop`, `InterruptActionEngine` | `reflex-baremetal` | `oo-sim` |
| Sensory Organs | Observe environment/body | Input ingestion and normalization | `PerceptionIngestEngine`, `SensorFusionEngine` | `sense-baremetal`, `proprioception-baremetal` | `oo-sim`, `oo-lab` |
| Cardiovascular System | Circulate oxygen/nutrients | Resource and signal circulation across modules | `FlowControlEngine`, `PriorityDispatchEngine` | `united-baremetal` (globule ring bus) | `oo-system`, `oo-host` |
| Blood (RBC/WBC/Plasma) | Transport + immune patrol | Event transport (RED=data, WHITE=immune, YELLOW=energy) | `EventTransport`, `ImmunePatrol`, `ContextCarrier` | `united-baremetal` (globule types) | `oo-dplus`, `oo-host` |
| Respiratory System | Oxygen intake, gas exchange | Compute pressure regulation, throughput breathing | `LoadRegulationEngine`, `ThroughputBreathingEngine` | `network-baremetal` (respiration) | `oo-host` |
| Digestive System | Transform external input to energy | Parse/transform external data into usable state | `IngestionPipelineEngine`, `NormalizationEngine` | `sense-baremetal` | `oo-lab`, `oo-model` |
| Hepatic System (Liver) | Filter toxins, regulate chemistry | Policy filtering via 5 Organic Laws (D+ Policy Engine) | `PolicyFilterEngine`, `SanitizationEngine` | `llm-baremetal/thalamic-bloom` (D+ bridge) | `oo-dplus` |
| Renal System (Kidneys) | Remove waste, preserve balance | Garbage/redundancy cleanup, artifact pruning | `WastePruningEngine`, `RetentionPolicyEngine` | `memory-baremetal` (bio_alloc gc) | `oo-host`, `oo-system` |
| Immune System | Detect and isolate threats | Integrity checks, anomaly detection, quarantine | `IntegrityGuardEngine`, `AnomalyDetectorEngine`, `QuarantineEngine` | `bot-baremetal`, `shadow-baremetal` | `oo-dplus`, `oo-host` |
| Endocrine System | Hormonal regulation | Global mode signaling and adaptive thresholds | `ModeSignalEngine`, `AdaptiveThresholdEngine` | `vital-baremetal` (hormone levels) | `oo-system`, `oo-dplus` |
| Musculoskeletal System | Motion and force | Actuation pipeline and execution primitives | `ActionExecutionEngine`, `TaskMotorEngine` | `kernel-baremetal` (scheduler) | `oo-host`, `oo-sim` |
| Integumentary System (Skin) | Boundary and protection | External boundary, trust zone ingress control | `BoundaryControlEngine`, `IngressGuardEngine` | `shadow-baremetal` (anti-forensics) | `oo-dplus` |
| Lymphatic System | Fluid balance, immune transport | Backpressure balancing, distributed health propagation | `BackpressureEngine`, `HealthPropagationEngine` | `swarm-baremetal` | `oo-host`, `oo-system` |
| Reproductive/Mutation System | Variation over time | Controlled evolution and module mutation workflow | `MutationGovernanceEngine`, `VariantEvalEngine` | `evolution-baremetal`, `regen-baremetal` | `oo-dplus`, `oo-model` |
| Memory System (Short/Long) | Retention and recall | Working memory, episodic logs, long-term state | `WorkingMemoryEngine`, `PersistentMemoryEngine`, `RecallEngine` | `memory-baremetal` | `oo-host`, `oo-model` |
| Sleep/Recovery System | Consolidation and repair | Maintenance windows, repair tasks, state compaction | `RecoveryCycleEngine`, `CompactionEngine` | `dream-baremetal` | `oo-host` |
| Proprioception | Body position and balance awareness | Stack/heap integrity monitoring, posture checks | `PostureMonitorEngine`, `StackGuardEngine` | `proprioception-baremetal` | `oo-host` |
| Speech/Communication | Exchange with humans/peers | CLI/UART/colony interfaces | `DialogueEngine`, `HandoffEngine`, `ReportEngine` | `vocal-baremetal` (UART/speaker) | `oo-system/interface`, `oo-host` |
| Collective Intelligence | Swarm coordination | Pheromone P2P, distributed identity validation | `SwarmCoordEngine`, `PheromoneEngine` | `swarm-baremetal` | `colony-server` |
| Identity / DNA | Self-recognition | Hardware fingerprint, TPM, FNV-1a DNA hash | `IdentityEngine`, `DNAHashEngine` | `identity-baremetal` | `oo-dplus` |

## Organ Classes

- **Vital Organs**: brainstem (`reflex-baremetal`, `kernel-baremetal`), cardiovascular (`united-baremetal`), respiratory (`network-baremetal`), immune (`bot-baremetal`, `shadow-baremetal`), memory core (`memory-baremetal`).
- **Adaptive Organs**: cortex (`llm-baremetal` / thalamic-bloom), endocrine (`vital-baremetal`), digestive (`sense-baremetal`), mutation (`evolution-baremetal`, `regen-baremetal`).
- **Interface Organs**: sensory (`sense-baremetal`, `proprioception-baremetal`), communication (`vocal-baremetal`), boundary (`shadow-baremetal`).
- **Maintenance Organs**: renal (`memory-baremetal` gc), sleep/recovery (`dream-baremetal`), lymphatic (`swarm-baremetal`).
- **Identity Organs**: DNA/self-recognition (`identity-baremetal`), collective intelligence (`swarm-baremetal`).

## Baremetal Directory ↔ Biological System Quick Reference

| Directory | Biological System | Class |
|---|---|---|
| `united-baremetal` | Cardiovascular + Blood (IPC ring bus) | Vital |
| `sense-baremetal` | Sensory Organs + Digestive | Interface |
| `reflex-baremetal` | Brainstem + Spinal Cord | Vital |
| `kernel-baremetal` | Musculoskeletal + Brainstem (scheduler) | Vital |
| `memory-baremetal` | Memory System + Renal (gc) | Vital / Maintenance |
| `vital-baremetal` | Endocrine System (hormones, FSM) | Adaptive |
| `identity-baremetal` | Identity / DNA fingerprint | Identity |
| `network-baremetal` | Respiratory System | Vital |
| `proprioception-baremetal` | Proprioception (body-awareness) | Interface |
| `regen-baremetal` | Recovery / Reproductive | Adaptive |
| `vocal-baremetal` | Speech / Communication (UART) | Interface |
| `shadow-baremetal` | Integumentary / Immune (boundary) | Maintenance |
| `swarm-baremetal` | Lymphatic + Collective Intelligence | Maintenance |
| `evolution-baremetal` | Reproductive / Mutation | Adaptive |
| `dream-baremetal` | Sleep / Recovery (consolidation) | Maintenance |
| `bot-baremetal` | Immune System (instinct + agents) | Vital |
| `llm-baremetal` | Brain Cortex (thalamic-bloom SSM) | Adaptive |

## Minimal Vital Chain

The chain that must always remain alive:

1. `ReflexEngine` (survival immediate loop)
2. `IntegrityGuardEngine` (threat gate)
3. `StateTransitionEngine` (safe state machine)
4. `PersistentMemoryEngine` (continuity)
5. `FlowControlEngine` (resource circulation)

If non-vital organs fail, this chain keeps OO alive in degraded mode.

## Terminology Rules

- Biological naming is allowed for architecture readability.
- Engineering naming is mandatory for implementation/test references.
- Every organ description must include measurable inputs/outputs.
