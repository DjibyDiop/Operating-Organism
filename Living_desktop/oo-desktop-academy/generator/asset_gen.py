
import os
import json

class LivingAssetGenerator:
    def __init__(self, output_dir='oo-desktop-academy/assets-textures'):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_svg(self, ocdl_data):
        theme = ocdl_data.get('theme', 'organic')
        resp = ocdl_data['biological_properties']['respiration_rate']
        # Color intensity based on respiration
        intensity = int(resp * 255)
        color = f'rgb({100}, {intensity}, {255})'
        
        svg_content = f'<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">\n'
        svg_content += f'  <circle cx="50" cy="50" r="40" fill="{color}" stroke="white" stroke-width="2" />\n'
        svg_content += f'</svg>'
        
        file_path = os.path.join(self.output_dir, f"{theme.lower().replace(' ', '_')}_icon.svg")
        with open(file_path, 'w') as f:
            f.write(svg_content)
        return file_path

    def generate_texture_profile(self, ocdl_data):
        theme = ocdl_data.get('theme', 'organic')
        fluidity = ocdl_data['layout_config']['fluidity']
        
        profile = {
            'theme': theme,
            'viscosity': 1.0 - fluidity,
            'refraction': 0.5 + (fluidity * 0.5),
            'glow': 'active' if ocdl_data['biological_properties']['neural_connectivity'] else 'dormant'
        }
        
        file_path = os.path.join(self.output_dir, f"{theme.lower().replace(' ', '_')}_texture.json")
        with open(file_path, 'w') as f:
            json.dump(profile, f, indent=4)
        return file_path

# Advanced Animation Extension

class IconFactory: ... # (Defined in kernel)
class AnimationStudio: ... # (Defined in kernel)
