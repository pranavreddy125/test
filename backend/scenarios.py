from simulator import Simulator
from star_presets import get_star_preset

DEFAULT_EPSILON = 0.01
DEFAULT_DT = 0.02
DEFAULT_STEPS = 800


def build_simulator(particles, star, dt, epsilon=DEFAULT_EPSILON):
    return Simulator(particles, star=star, dt=dt, epsilon=epsilon)


def simple_orbit():
    # Chosen to show bending without blowing up; tweak mass/dt/epsilon to break it.
    star = get_star_preset("sun_like")
    dt = DEFAULT_DT
    epsilon = 0.01

    x0, y0 = 1.0, 0.0
    vx0, vy0 = 0.0, 1.2

    particle = {"x": x0, "y": y0, "vx": vx0, "vy": vy0, "mass": None}
    sim = build_simulator([particle], star=star, dt=dt, epsilon=epsilon)
    return sim
