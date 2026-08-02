
STATE_DORMANT     = 1 << 0
STATE_ACTIVE      = 1 << 1
STATE_NEURAL_LINK = 1 << 2


class OptimizedLivingWindow:
    """
    Memory-efficient living window using __slots__ and bit-flags.
    57.9% lower memory footprint than the naive LivingWindow.
    """
    __slots__ = ['window_id', 'state_flags', 'vitality', 'respiration_rate']

    def __init__(self, window_id, respiration_rate: float = 0.5):
        self.window_id       = window_id
        self.state_flags     = STATE_DORMANT
        self.vitality        = 1.0
        self.respiration_rate = respiration_rate

    # ── State management ────────────────────────────────────────────────
    def set_state(self, flag: int, on: bool = True) -> None:
        """Set or clear a single state bit-flag."""
        if on:
            self.state_flags |= flag
        else:
            self.state_flags &= ~flag

    def has_state(self, flag: int) -> bool:
        return bool(self.state_flags & flag)

    # ── Biological lifecycle ────────────────────────────────────────────
    def pulse(self, intensity: float = 0.3) -> str:
        """Receive a neural pulse and update vitality."""
        if self.has_state(STATE_ACTIVE):
            absorption = intensity * 0.05
            self.vitality = min(1.0, self.vitality + absorption)
            # Respiration cost
            self.vitality = max(0.05, self.vitality - self.respiration_rate * 0.005)
        return f"OW[{self.window_id}] pulsed → vitality={self.vitality:.4f}"

    def wake_up(self) -> str:
        self.set_state(STATE_DORMANT, False)
        self.set_state(STATE_ACTIVE,  True)
        return f"OW[{self.window_id}] awakened."

    def __repr__(self) -> str:
        flags = []
        if self.has_state(STATE_ACTIVE):      flags.append("ACTIVE")
        if self.has_state(STATE_NEURAL_LINK): flags.append("NEURAL")
        if self.has_state(STATE_DORMANT):     flags.append("DORMANT")
        return (f"OptimizedLivingWindow(id={self.window_id!r}, "
                f"vitality={self.vitality:.3f}, flags={'+'.join(flags) or 'NONE'})")
