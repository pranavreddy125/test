class Particle:
    def __init__(self, x, y, vx, vy):
        self.x = float(x)
        self.y = float(y)
        self.vx = float(vx)
        self.vy = float(vy)

    def update_velocity(self, ax, ay, dt):
        self.vx += ax * dt
        self.vy += ay * dt

    def update_position(self, dt):
        self.x += self.vx * dt
        self.y += self.vy * dt
