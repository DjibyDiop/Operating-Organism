# OO-BOT Integration Guide with OO Ecosystem

## 1. Interaction with OPI (Cognitive Substrate)
OPI communicates with OO-BOT over the **Hermes UDP Mesh**.
- **Packet Structure**: Conforms to `HermesPacket` defined in `OPI-baremetal/oo-net/core/hermes_mesh.h`.
- **Heartbeat Requirement**: OPI must dispatch regular heartbeats to the bot at least once every 1000ms. If no heartbeat is received within 3000ms, the bot transitions to `THREAT_LEVEL_SPLIT_BRAIN` and falls back to autonomous survival mode.
- **Commands & Proclamations**: All directives issued by OPI are treated as proposals. They are passed through `instinct_layer_evaluate_action()`. If the command attempts to access memory outside the designated `TerritoryZone`, it is vetoed immediately.

## 2. Interaction with OO-NBIA (Latent Awareness)
OO-BOT links directly with the Rust static library `libnbia.a`:
- **Bytecode Booting**: D+ organ bytecode (such as `nbia_core_dbc.h`) is booted via `dplus_boot_organ_bytecode()`.
- **Sensory Perception Ingestion**: Capteur signals and organism awareness are ingested via `dplus_ingest_perception()`.
- **Phenomenon Polling**: In every tick of the homeostasis loop, the bot polls `dplus_poll_phenomena()`.
  - `PHENOMENON_DRIFT`: Indicates behavioral or physiological divergence from baseline.
  - `PHENOMENON_EMERGENCE`: Indicates complex patterns emerging from sensory interaction.
  - `PHENOMENON_PHASE_CHANGE`: Indicates macro-state shifts (such as loss of central OPI communication).
  - `PHENOMENON_CONVERGENCE`: Indicates stable alignment between actual and expected states.

## 3. Relationship to OO-Constitution
The bot adheres to `BOT_MANIFESTE.md`. The local bot possesses sovereign local instinct, but its core permissions and constitution rules are governed globally by `oo-constitution`.
