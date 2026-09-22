# Instructions for Autonomous Agents Working on OO-BOT Baremetal

## 1. Zero-Mocks Strict Rule
- Never introduce dummy engines, mock network drivers, or simulated stub returns.
- If a sensor or actuator is referenced, provide a real in-memory structure or hardware abstraction.

## 2. Multi-Platform Compatibility
- All C source code must adhere to C11 and compile cleanly with `gcc` under both Linux/WSL2 and Windows MinGW.
- Use `_POSIX_C_SOURCE 200809L` or `_DEFAULT_SOURCE` for POSIX features.
- Avoid platform-exclusive APIs without appropriate `#if defined(_WIN32)` wrappers.

## 3. Test Verification
- Whenever modifying `core/`, `instinct/`, or `oo_bridge/`, run:
  ```bash
  make test
  ```
  All tests must pass 100%.
- Bounded run of the bot daemon must be validated:
  ```bash
  ./build/bot 10
  ```
