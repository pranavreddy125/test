from particle import Particle
from simulator import Simulator


def simple_orbit():
    # Chosen to show bending without blowing up; tweak mass/dt/epsilon to break it.
    central_mass = 1.0
    dt = 0.02
    epsilon = 0.01

    x0, y0 = 1.0, 0.0
    vx0, vy0 = 0.0, 1.2

    particle = Particle(x0, y0, vx0, vy0)
    sim = Simulator([particle], central_mass=central_mass, dt=dt, epsilon=epsilon)
    return sim
