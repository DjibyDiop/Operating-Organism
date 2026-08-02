# Mission Critical Reaction-Diffusion Shader

import numpy as np

class OrganicShader:
    def __init__(self, width=128, height=128):
        self.width = width
        self.height = height

class MissionCriticalShader(OrganicShader):
    def __init__(self, width=128, height=128):
        super().__init__(width, height)
        self.U = np.ones((width, height))
        self.V = np.zeros((width, height))
