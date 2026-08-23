# Build & Run (prototype)

Rust example (requires Rust toolchain):

```powershell
cd oo-desktop\oo-vision-core
cargo build --examples
cargo run --example host
```

Notes
- The `WgpuRenderer` is a placeholder for now; add `wgpu` in `Cargo.toml` and implement the adapter when ready.
- Later we will provide a `no_std` compatible core and separate crates for bare-metal adapters.
