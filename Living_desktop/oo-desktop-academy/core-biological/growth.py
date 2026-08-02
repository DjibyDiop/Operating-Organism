
import os
import sys

# Ensure sibling module is importable regardless of working directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from optimized_window import OptimizedLivingWindow, STATE_ACTIVE, STATE_NEURAL_LINK


class GrowthController:
    """
    Manages the lifecycle of LivingWindow organisms on the neural substrate.
    Provides spawn / lifecycle management capabilities.
    """
    def __init__(self, bridge):
        self.bridge = bridge
        self.active_nodes: list[OptimizedLivingWindow] = []

    def spawn_organism(self, name: str, respiration: float = 0.5) -> str:
        """Create a new organism, link it to the neural bridge, and activate it."""
        node = OptimizedLivingWindow(name, respiration)
        node.set_state(STATE_ACTIVE, True)
        node.set_state(STATE_NEURAL_LINK, True)
        self.bridge.register_nodes([node])
        self.active_nodes.append(node)
        return f"Organism {name!r} spawned and linked to bridge. ({len(self.active_nodes)} total)"

    def life_cycle_start(self, cycles: int = 5) -> list[str]:
        """Run N biological cycles across all active organisms."""
        results = []
        for i in range(cycles):
            for node in self.active_nodes:
                # Simulate a vitality drain based on respiration rate
                node.vitality = max(0.1, node.vitality - (0.005 * node.respiration_rate))
            avg = sum(n.vitality for n in self.active_nodes) / max(len(self.active_nodes), 1)
            results.append(f"Cycle {i+1}/{cycles}: avg_vitality={avg:.4f} (ecosystem stable)")
        return results

    def __repr__(self) -> str:
        return f"GrowthController(organisms={len(self.active_nodes)})"
