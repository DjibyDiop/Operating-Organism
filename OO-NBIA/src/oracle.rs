use crate::sensor_bus::{SensorBus, SensorType};

/// Represents a verified fact frame serialized for the Hermes mesh network.
#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct VerifiedFactFrame {
    pub magic: u16,        // 0x4643 ('FC' for Fact Context)
    pub sensor_id: u8,
    pub verified: u8,
    pub value: f32,
    pub timestamp: u64,
}

impl Default for VerifiedFactFrame {
    fn default() -> Self {
        Self {
            magic: 0x4643,
            sensor_id: 0,
            verified: 0,
            value: 0.0,
            timestamp: 0,
        }
    }
}

/// The Oracle is responsible for feeding facts from the physical world
/// (Sensors) into the Swarm/Colony communication fabric (Hermes).
/// It bridges NBIA's local awareness with OPI's global reflection.
pub struct ContextOracle<'a> {
    sensor_bus: &'a dyn SensorBus,
}

impl<'a> ContextOracle<'a> {
    pub fn new(sensor_bus: &'a dyn SensorBus) -> Self {
        Self { sensor_bus }
    }

    /// Gather verified facts into structured Hermes frames.
    pub fn collect_facts(&self, out_frames: &mut [VerifiedFactFrame]) -> usize {
        let readings = self.sensor_bus.scan_all();
        let mut count = 0;

        for reading_opt in readings.iter() {
            if let Some(reading) = reading_opt {
                if reading.verified && count < out_frames.len() {
                    let s_id = match reading.sensor {
                        SensorType::Temperature => 1,
                        SensorType::PresenceRadar => 2,
                        SensorType::BiometricStress => 3,
                    };
                    out_frames[count] = VerifiedFactFrame {
                        magic: 0x4643,
                        sensor_id: s_id,
                        verified: 1,
                        value: reading.value,
                        timestamp: reading.timestamp,
                    };
                    count += 1;
                }
            }
        }

        count
    }
}
