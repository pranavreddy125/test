from gravity import gravitational_acceleration


class Simulator:
    def __init__(self, particles, central_mass, dt, epsilon):
        self.particles = particles
        self.central_mass = float(central_mass)
        self.dt = float(dt)
        self.epsilon = float(epsilon)

    def step(self):
        for particle in self.particles:
            ax, ay = gravitational_acceleration(particle, self.central_mass, self.epsilon)
            particle.update_velocity(ax, ay, self.dt)

        for particle in self.particles:
            particle.update_position(self.dt)

    def run(self, steps):
        history = []
        for _ in range(steps):
            frame = []
            for particle in self.particles:
                frame.append({"x": particle.x, "y": particle.y})
            history.append(frame)
            self.step()
        return history
