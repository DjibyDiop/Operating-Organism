# Build & Run (prototype)


Rust example (requires Rust toolchain):

```powershell
cd oo-desktop\oo-vision-core
cargo build --examples
cargo run --example host
```

To build the optional GPU-backed backend (requires system GPU drivers and may take longer):

```powershell
cd oo-desktop\oo-vision-core
cargo build --features wgpu --examples
cargo run --features wgpu --example host
```

Notes
- The `WgpuRenderer` is a placeholder for now; add `wgpu` in `Cargo.toml` and implement the adapter when ready.
- Later we will provide a `no_std` compatible core and separate crates for bare-metal adapters.
