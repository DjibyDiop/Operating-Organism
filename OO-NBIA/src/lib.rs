#![cfg_attr(not(test), no_std)]
#![allow(static_mut_refs)]

pub mod oracle;
pub mod sensor_bus;
pub mod actuator_bus;
pub mod reflex_engine;
pub mod latent_awareness;

use sensor_bus::{StaticSensorBus, SensorType};
use actuator_bus::StaticActuatorBus;
use reflex_engine::ReflexEngine;
use latent_awareness::{LatentAwarenessEngine, OOPhenomenon};

// NBIA_CORE: No-Bot-No-IA Peripheral Nervous System
// The goal of this library is to provide a fact-based, zero-hallucination
// physical edge for the OO ecosystem.

/// Global Homeostasis State of the NBIA unit.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Homeostasis {
    /// Everything is functioning normally, fact-checking passed.
    Normal,
    /// Environmental threshold exceeded (e.g., extreme temperature).
    Warning,
    /// Critical failure or loss of sensor integrity.
    Critical,
}

/* ─── Static Singletons for Bare-Metal Operation ────────────── */

static mut SENSOR_BUS: StaticSensorBus = StaticSensorBus::new();
static mut ACTUATOR_BUS: StaticActuatorBus = StaticActuatorBus::new();
static mut LATENT_ENGINE: LatentAwarenessEngine = LatentAwarenessEngine::new();
static mut NBIA_INITIALIZED: bool = false;

/* ─── C FFI Bridge for Bot-Baremetal & OO Ecosystem ─────────── */

#[no_mangle]
pub extern "C" fn nbia_init() {
    unsafe {
        SENSOR_BUS = StaticSensorBus::new();
        ACTUATOR_BUS = StaticActuatorBus::new();
        LATENT_ENGINE = LatentAwarenessEngine::new();
        NBIA_INITIALIZED = true;
    }
}

#[no_mangle]
pub extern "C" fn nbia_tick(delta_ms: u32) {
    unsafe {
        if !NBIA_INITIALIZED {
            nbia_init();
        }

        // 1. Tick the reflex engine
        let mut reflex = ReflexEngine::new(&SENSOR_BUS, &mut ACTUATOR_BUS);
        reflex.tick();

        // 2. Advance biological latent awareness time
        LATENT_ENGINE.advance_time(delta_ms);
    }
}

#[no_mangle]
pub extern "C" fn nbia_handle_hermes(pkt_ptr: *const u8, len: usize) {
    if pkt_ptr.is_null() || len < 4 {
        return;
    }
    unsafe {
        // Record incoming packet traffic into latent awareness
        let current_traffic = LATENT_ENGINE.real_hermes_traffic;
        LATENT_ENGINE.ingest_perception(
            latent_awareness::PERCEPTION_HERMES_TRAFFIC,
            (current_traffic as u32).saturating_add(len as u32),
        );

        // Check if packet carries an OPI heartbeat (byte 0 == 0x48 'H' or special tag)
        let first_byte = *pkt_ptr;
        if first_byte == b'H' || first_byte == 0x01 {
            LATENT_ENGINE.ingest_perception(latent_awareness::PERCEPTION_OPI_HEARTBEAT, 1);
        }
    }
}

#[no_mangle]
pub extern "C" fn nbia_update_sensor(sensor_type: u8, value: f32, verified: u8) {
    let st = match sensor_type {
        0 => SensorType::Temperature,
        1 => SensorType::PresenceRadar,
        _ => SensorType::BiometricStress,
    };
    unsafe {
        SENSOR_BUS.update(st, value, 0, verified != 0);
    }
}

#[no_mangle]
pub extern "C" fn nbia_get_hvac_temp() -> f32 {
    unsafe { ACTUATOR_BUS.hvac_temp }
}

#[no_mangle]
pub extern "C" fn nbia_get_drift() -> f32 {
    unsafe { LATENT_ENGINE.last_drift }
}

/* ─── D+ Perception FFI Bridge (Exact signatures from bot entry) ─ */

#[no_mangle]
pub extern "C" fn dplus_runtime_advance(delta_ms: u32) {
    unsafe {
        if !NBIA_INITIALIZED {
            nbia_init();
        }
        LATENT_ENGINE.advance_time(delta_ms);

        // Also run reflex tick
        let mut reflex = ReflexEngine::new(&SENSOR_BUS, &mut ACTUATOR_BUS);
        reflex.tick();
    }
}

#[no_mangle]
pub extern "C" fn dplus_boot_organ_bytecode(bytecode: *const u8, length: usize) -> u64 {
    if bytecode.is_null() || length == 0 {
        return 0;
    }
    unsafe {
        if !NBIA_INITIALIZED {
            nbia_init();
        }
    }
    // Return unique organ hash / handle (FNV-1a 64-bit on bytecode)
    let mut hash: u64 = 0xcbf29ce484222325;
    for i in 0..length {
        let b = unsafe { *bytecode.add(i) };
        hash ^= b as u64;
        hash = hash.wrapping_mul(0x100000001b3);
    }
    hash
}

#[no_mangle]
pub extern "C" fn dplus_ingest_perception(perception_id: u32, value: u32) {
    unsafe {
        if !NBIA_INITIALIZED {
            nbia_init();
        }
        LATENT_ENGINE.ingest_perception(perception_id, value);
    }
}

#[no_mangle]
pub extern "C" fn dplus_poll_phenomena(buffer: *mut OOPhenomenon, max_count: usize) -> usize {
    if buffer.is_null() || max_count == 0 {
        return 0;
    }
    unsafe {
        if !NBIA_INITIALIZED {
            nbia_init();
        }
        let slice = core::slice::from_raw_parts_mut(buffer, max_count);
        LATENT_ENGINE.pop_phenomena(slice)
    }
}

/* ─── Freestanding Panic Handler ────────────────────────────── */

#[cfg(not(test))]
#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}

/* ─── Certified Unit Tests ──────────────────────────────────── */

#[cfg(test)]
mod tests {
    use super::*;
    use latent_awareness::*;

    #[test]
    fn test_reflex_thermal_overheat() {
        nbia_init();
        nbia_update_sensor(0, 78.5, 1); // 78.5°C verified
        nbia_tick(10);
        let hvac = nbia_get_hvac_temp();
        assert_eq!(hvac, 18.0);
    }

    #[test]
    fn test_latent_awareness_drift_and_absence() {
        nbia_init();
        // 1. Nominal heartbeat
        dplus_ingest_perception(PERCEPTION_OPI_HEARTBEAT, 1);
        dplus_ingest_perception(PERCEPTION_ORGANISM_AWARENESS, 10);
        dplus_runtime_advance(1000);

        // 2. Inject drift
        dplus_ingest_perception(PERCEPTION_ORGANISM_AWARENESS, 95);
        dplus_runtime_advance(1000);

        let mut buffer = [OOPhenomenon::default(); 10];
        let polled = dplus_poll_phenomena(buffer.as_mut_ptr(), 10);
        assert!(polled > 0);
        assert!(buffer[0].p_type == PHENOMENON_DRIFT);

        // 3. Negative event: 3s without heartbeat
        dplus_runtime_advance(3100);
        let polled2 = dplus_poll_phenomena(buffer.as_mut_ptr(), 10);
        assert!(polled2 > 0);
        assert_eq!(buffer[0].p_type, PHENOMENON_PHASE_CHANGE);
        assert_eq!(buffer[0].evidence_id, 0x0F1_150); // OPI_ISOLATION
    }

    #[test]
    fn test_emergence_detection() {
        nbia_init();
        dplus_ingest_perception(PERCEPTION_OPI_HEARTBEAT, 1);
        dplus_ingest_perception(PERCEPTION_OPI_INFERENCE, 0); // Stalled

        // Inject 5 seconds of increasing fragmentation and erratic traffic
        for i in 1..=6 {
            dplus_ingest_perception(PERCEPTION_MEMORY_FRAG, i * 10);
            dplus_ingest_perception(PERCEPTION_HERMES_TRAFFIC, if i % 2 == 0 { 80 } else { 5 });
            dplus_runtime_advance(1000);
        }

        let mut buffer = [OOPhenomenon::default(); 10];
        let polled = dplus_poll_phenomena(buffer.as_mut_ptr(), 10);
        let mut found_emergence = false;
        for i in 0..polled {
            if buffer[i].p_type == PHENOMENON_EMERGENCE && buffer[i].evidence_id == 0x57A1101 {
                found_emergence = true;
            }
        }
        assert!(found_emergence, "Expected EMERGENCE phenomenon for stall and erratic traffic");
    }
}

