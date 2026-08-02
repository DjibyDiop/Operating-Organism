
class OrganicLayout:
    def __init__(self, fluidity=0.5, padding='0px'):
        self.fluidity = fluidity
        self.padding = padding
        self.children = []

    def add_child(self, child):
        self.children.append(child)

class OrganicRow(OrganicLayout):
    def __repr__(self):
        return f"OrganicRow(fluidity={self.fluidity}, children_count={len(self.children)})"

class OrganicColumn(OrganicLayout):
    def __repr__(self):
        return f"OrganicColumn(fluidity={self.fluidity}, children_count={len(self.children)})"

class OrganicGrid(OrganicLayout):
    def __init__(self, columns=2, **kwargs):
        super().__init__(**kwargs)
        self.columns = columns

class OrganicStack(OrganicLayout):
    def __repr__(self):
        return f"OrganicStack(fluidity={self.fluidity}, depth={len(self.children)})"
