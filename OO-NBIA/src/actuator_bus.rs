#![no_std]
#![allow(unused)]

/// Physical actions that can be taken (Invisible UI & Environment).
#[derive(Debug, Clone, Copy)]
pub enum ActuatorType {
    SmartHvac,
    HapticWearable,
    AmbientLighting,
}

#[derive(Debug, Clone, Copy)]
pub enum ActuatorCommand {
    SetTemperature(f32),
    TriggerPulse(u8),
    ChangeColor(u32),
}

pub trait ActuatorBus {
    /// Actuate the physical world based on a specific command.
    /// NBIA guarantees that this is only called if the D+ Warden reflex allowed it.
    fn actuate(&mut self, actuator: ActuatorType, cmd: ActuatorCommand) -> Result<(), &'static str>;
}

/// Static embedded actuator bus recording hardware actuations deterministically.
#[derive(Debug, Clone, Copy)]
pub struct StaticActuatorBus {
    pub hvac_temp: f32,
    pub haptic_pulse: u8,
    pub lighting_color: u32,
    pub last_actuation_count: u32,
}

impl Default for StaticActuatorBus {
    fn default() -> Self {
        Self::new()
    }
}

impl StaticActuatorBus {
    pub const fn new() -> Self {
        Self {
            hvac_temp: 21.0,
            haptic_pulse: 0,
            lighting_color: 0xFFFFFF,
            last_actuation_count: 0,
        }
    }
}

impl ActuatorBus for StaticActuatorBus {
    fn actuate(&mut self, actuator: ActuatorType, cmd: ActuatorCommand) -> Result<(), &'static str> {
        match (actuator, cmd) {
            (ActuatorType::SmartHvac, ActuatorCommand::SetTemperature(t)) => {
                self.hvac_temp = t;
                self.last_actuation_count += 1;
                Ok(())
            }
            (ActuatorType::HapticWearable, ActuatorCommand::TriggerPulse(p)) => {
                self.haptic_pulse = p;
                self.last_actuation_count += 1;
                Ok(())
            }
            (ActuatorType::AmbientLighting, ActuatorCommand::ChangeColor(c)) => {
                self.lighting_color = c;
                self.last_actuation_count += 1;
                Ok(())
            }
            _ => Err("Invalid actuator / command pair"),
        }
    }
}
