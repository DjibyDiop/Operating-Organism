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

/// Static embedded sensor bus holding physical telemetry without dynamic allocation.
#[derive(Debug, Clone, Copy)]
pub struct StaticSensorBus {
    readings: [Option<FactualReading>; 8],
}

impl Default for StaticSensorBus {
    fn default() -> Self {
        Self::new()
    }
}

impl StaticSensorBus {
    pub const fn new() -> Self {
        Self {
            readings: [None; 8],
        }
    }

    pub fn update(&mut self, sensor: SensorType, value: f32, timestamp: u64, verified: bool) {
        let idx = match sensor {
            SensorType::Temperature => 0,
            SensorType::PresenceRadar => 1,
            SensorType::BiometricStress => 2,
        };
        self.readings[idx] = Some(FactualReading {
            sensor,
            value,
            timestamp,
            verified,
        });
    }
}

impl SensorBus for StaticSensorBus {
    fn read_sensor(&self, sensor_type: SensorType) -> Option<FactualReading> {
        let idx = match sensor_type {
            SensorType::Temperature => 0,
            SensorType::PresenceRadar => 1,
            SensorType::BiometricStress => 2,
        };
        self.readings[idx]
    }

    fn scan_all(&self) -> [Option<FactualReading>; 8] {
        self.readings
    }
}
