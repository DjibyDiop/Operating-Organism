//! OO Vision Core — minimal API and renderer stubs
//!
//! This crate provides the core primitives and a tiny renderer trait
//! so that host examples can exercise the API while we design the
//! portable renderer backends.

/// Minimal Surface primitive
#[derive(Debug)]
pub struct Surface {
    pub id: u64,
}

/// Renderer abstraction — intentionally small for the prototype.
pub trait OORenderer {
    fn begin_frame(&mut self);
    fn draw_surface(&mut self, surface: &Surface);
    fn end_frame(&mut self);
}

/// A trivial software renderer stub used for testing the API.
pub struct SoftwareRenderer;
impl SoftwareRenderer {
    pub fn new() -> Self {
        Self
    }
}
impl OORenderer for SoftwareRenderer {
    fn begin_frame(&mut self) {
        println!("[oo_vision_core] SoftwareRenderer: begin_frame");
    }

    fn draw_surface(&mut self, surface: &Surface) {
        println!("[oo_vision_core] SoftwareRenderer: draw_surface id={}", surface.id);
    }

    fn end_frame(&mut self) {
        println!("[oo_vision_core] SoftwareRenderer: end_frame");
    }
}

#[cfg(not(feature = "wgpu"))]
/// Placeholder for a GPU-backed renderer when `wgpu` feature is disabled.
pub struct WgpuRenderer;
#[cfg(not(feature = "wgpu"))]
impl WgpuRenderer {
    pub fn new() -> Self {
        Self
    }
}
#[cfg(not(feature = "wgpu"))]
impl OORenderer for WgpuRenderer {
    fn begin_frame(&mut self) {
        println!("[oo_vision_core] WgpuRenderer: begin_frame (placeholder)");
    }

    fn draw_surface(&mut self, surface: &Surface) {
        println!("[oo_vision_core] WgpuRenderer: draw_surface id={}", surface.id);
    }

    fn end_frame(&mut self) {
        println!("[oo_vision_core] WgpuRenderer: end_frame");
    }
}

#[cfg(feature = "wgpu")]
/// Real `wgpu`-based renderer. This performs a basic device initialization
/// so the host can use GPU resources. Drawing is currently a placeholder
/// (no surface or swapchain) but the device/queue are available.
pub mod wgpu_backend {
    use super::{OORenderer, Surface};
    use wgpu;

    pub struct WgpuRenderer {
        _instance: wgpu::Instance,
        _adapter: wgpu::Adapter,
        device: wgpu::Device,
        queue: wgpu::Queue,
    }

    impl WgpuRenderer {
        pub fn new() -> Self {
            let instance = wgpu::Instance::new(wgpu::Backends::all());
            let adapter = pollster::block_on(instance.request_adapter(&wgpu::RequestAdapterOptions {
                power_preference: wgpu::PowerPreference::HighPerformance,
                compatible_surface: None,
                force_fallback_adapter: false,
            }))
            .expect("No suitable GPU adapter found");

            let (device, queue) = pollster::block_on(adapter.request_device(
                &wgpu::DeviceDescriptor {
                    label: None,
                    features: wgpu::Features::empty(),
                    limits: wgpu::Limits::default(),
                },
                None,
            ))
            .expect("Failed to create device");

            Self { _instance: instance, _adapter: adapter, device, queue }
        }
    }

    impl OORenderer for WgpuRenderer {
        fn begin_frame(&mut self) {
            println!("[oo_vision_core::wgpu] begin_frame");
        }

        fn draw_surface(&mut self, surface: &Surface) {
            println!("[oo_vision_core::wgpu] draw_surface id={}", surface.id);
        }

        fn end_frame(&mut self) {
            println!("[oo_vision_core::wgpu] end_frame");
        }
    }
}

#[cfg(feature = "wgpu")]
pub use wgpu_backend::WgpuRenderer;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn smoke_software_renderer() {
        let mut r = SoftwareRenderer::new();
        r.begin_frame();
        r.draw_surface(&Surface { id: 42 });
        r.end_frame();
    }
}
