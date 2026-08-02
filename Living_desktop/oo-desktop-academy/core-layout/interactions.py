
class InteractionHandler:
    def __init__(self, physics_engine):
        self.physics = physics_engine

    def handle_click(self, window, force_magnitude=50):
        # A click applies a sudden force to the organic membrane
        deformation = self.physics.calculate_deformation(force_magnitude)
        window.vitality = max(0.1, window.vitality - 0.05) # Interaction costs a bit of energy
        return f"Interaction: Click on {window.window_id}. Membrane deformation: {deformation}."

    def handle_hover(self, window):
        # Hovering stimulates the window slightly
        window.vitality = min(1.0, window.vitality + 0.01)
        return f"Interaction: Hover on {window.window_id}. Vitality stimulated."

class CellInteraction:
    def __init__(self, window, physics):
        self.window = window
        self.handler = InteractionHandler(physics)

    def trigger_click(self):
        return self.handler.handle_click(self.window)
