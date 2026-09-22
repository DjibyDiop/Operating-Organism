use crate::sensor_bus::{SensorBus, SensorType};
use crate::actuator_bus::{ActuatorBus, ActuatorType, ActuatorCommand};

/// Reflex Engine acts as the peripheral immune/motor system.
/// It runs a continuous loop (at physical Hz) evaluating pre-compiled 
/// D+ rules (DBC) against the current SensorBus state. If a condition
/// matches and the action is safe, it immediately triggers the ActuatorBus.
pub struct ReflexEngine<'a> {
    sensor_bus: &'a dyn SensorBus,
    actuator_bus: &'a mut dyn ActuatorBus,
    pub trigger_count: u32,
    pub last_reaction: &'static str,
}

impl<'a> ReflexEngine<'a> {
    pub fn new(sensor_bus: &'a dyn SensorBus, actuator_bus: &'a mut dyn ActuatorBus) -> Self {
        Self {
            sensor_bus,
            actuator_bus,
            trigger_count: 0,
            last_reaction: "NOMINAL",
        }
    }

    /// Evaluates the reflexes deterministically. Called on every timer tick / interrupt.
    pub fn tick(&mut self) -> u32 {
        let mut actuated = 0;
        let states = self.sensor_bus.scan_all();

        for reading_opt in states.iter() {
            if let Some(reading) = reading_opt {
                if !reading.verified {
                    continue;
                }

                match reading.sensor {
                    SensorType::Temperature => {
                        // Law 1: Thermal threshold protection (Overheat emergency)
                        if reading.value > 70.0 {
                            let _ = self.actuator_bus.actuate(
                                ActuatorType::SmartHvac,
                                ActuatorCommand::SetTemperature(18.0),
                            );
                            let _ = self.actuator_bus.actuate(
                                ActuatorType::HapticWearable,
                                ActuatorCommand::TriggerPulse(3),
                            );
                            self.trigger_count += 1;
                            self.last_reaction = "THERMAL_OVERHEAT_MITIGATION";
                            actuated += 1;
                        }
                    }
                    SensorType::BiometricStress => {
                        // Law 2: Homeostatic stress response
                        if reading.value > 0.80 {
                            let _ = self.actuator_bus.actuate(
                                ActuatorType::AmbientLighting,
                                ActuatorCommand::ChangeColor(0x00FF88),
                            );
                            self.trigger_count += 1;
                            self.last_reaction = "STRESS_HOMEOSTASIS_ENGAGED";
                            actuated += 1;
                        }
                    }
                    SensorType::PresenceRadar => {
                        // Law 3: Presence awareness reflex
                        if reading.value > 0.5 {
                            let _ = self.actuator_bus.actuate(
                                ActuatorType::HapticWearable,
                                ActuatorCommand::TriggerPulse(1),
                            );
                            self.trigger_count += 1;
                            self.last_reaction = "PRESENCE_PROXIMITY_PULSE";
                            actuated += 1;
                        }
                    }
                }
            }
        }

        actuated
    }
}
