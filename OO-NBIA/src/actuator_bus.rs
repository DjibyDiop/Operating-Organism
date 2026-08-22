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
