#![no_std]
#![allow(unused)]

/// Physical properties that can be measured.
#[derive(Debug, Clone, Copy)]
pub enum SensorType {
    Temperature,
    PresenceRadar,
    BiometricStress,
}

/// Represents a cryptographically signed or hardware-verified fact.
#[derive(Debug, Clone, Copy)]
pub struct FactualReading {
    pub sensor: SensorType,
    pub value: f32,
    pub timestamp: u64,
    pub verified: bool,
}

pub trait SensorBus {
    /// Read a specific sensor factually. Returns None if the sensor is unavailable or unverified.
    fn read_sensor(&self, sensor_type: SensorType) -> Option<FactualReading>;
    
    /// Scan all connected sensors for their current states.
    fn scan_all(&self) -> [Option<FactualReading>; 8];
}
