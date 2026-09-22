# Customization Rules for OO Workspace

## Architectural Rules

1. **NO MORE MOCKS (Zéro Mocks Policy)**: 
   - Never use "mocks" or stubs for system components. 
   - If an interface, transport layer, or capability is required, build the real foundation for it, even if it is a minimal but fully functional version (e.g., using shared memory, real UART, actual protocol frames) rather than a simulated mock that returns hardcoded success.
   - The system is an organism; it must have real flesh and blood, not cardboard cutouts.
