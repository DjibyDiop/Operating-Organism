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

/// Placeholder for a GPU-backed renderer (wgpu adapter to be added later).
pub struct WgpuRenderer;
impl WgpuRenderer {
    pub fn new() -> Self {
        Self
    }
}
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
