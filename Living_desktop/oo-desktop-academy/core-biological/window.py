
class LivingWindow:
    def __init__(self, window_id, respiration_rate=0.5):
        self.window_id = window_id
        self.state = 'dormant'
        self.vitality = 1.0
        self.respiration_rate = respiration_rate
        self.neural_link_id = None

    def pulse(self):
        # Simulate biological respiration affecting vitality slightly
        if self.state == 'active':
            self.vitality = max(0.0, self.vitality - (0.01 * self.respiration_rate))
        return f"Window {self.window_id} pulsed. Vitality: {self.vitality:.2f}"

    def wake_up(self):
        self.state = 'active'
        return f"Window {self.window_id} is now ACTIVE."

    def connect_to_neural_bridge(self, bridge_id):
        self.neural_link_id = bridge_id
        return f"Neural connection established with Bridge: {bridge_id}"

    def __repr__(self):
        return f"LivingWindow(id={self.window_id}, state={self.state}, vitality={self.vitality})"
