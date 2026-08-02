
class OrganicMaterial:
    def __init__(self, name, opacity=1.0, self_illumination=0.0):
        self.name = name
        self.opacity = opacity
        self.self_illumination = self_illumination

class LivingGlass(OrganicMaterial):
    def __init__(self):
        super().__init__(name='Living Glass', opacity=0.6, self_illumination=0.2)

class NeuralMembrane(OrganicMaterial):
    def __init__(self):
        super().__init__(name='Neural Membrane', opacity=0.9, self_illumination=0.8)
