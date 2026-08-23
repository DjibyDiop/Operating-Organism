use oo_vision_core::{OORenderer, SoftwareRenderer, Surface};

fn main() {
    println!("oo-vision-core host example starting");
    let mut renderer = SoftwareRenderer::new();
    renderer.begin_frame();
    renderer.draw_surface(&Surface { id: 1 });
    renderer.end_frame();
    println!("example finished");
}
