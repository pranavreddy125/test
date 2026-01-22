from types import SimpleNamespace

from gravity import gravitational_acceleration
from habitable_zone import compute_habitable_zone
from star import Star


def _normalize_particles(particles):
    normalized = []
    for particle in particles:
        if isinstance(particle, dict):
            normalized.append(
                {
                    "x": float(particle["x"]),
                    "y": float(particle["y"]),
                    "vx": float(particle["vx"]),
                    "vy": float(particle["vy"]),
                    "mass": particle.get("mass"),
                }
            )
        else:
            normalized.append(
                {
                    "x": float(particle.x),
                    "y": float(particle.y),
                    "vx": float(particle.vx),
                    "vy": float(particle.vy),
                    "mass": getattr(particle, "mass", None),
                }
            )
    return normalized


def _snapshot_particles(particles):
    return [
        {
            "x": float(p["x"]),
            "y": float(p["y"]),
            "vx": float(p["vx"]),
            "vy": float(p["vy"]),
            "mass": p.get("mass"),
        }
        for p in particles
    ]


def _snapshot_star(star):
    return {
        "type_name": str(star.type_name),
        "mass": float(star.mass),
        "luminosity": float(star.luminosity),
    }


def snapshot_state(state, star, habitable_zone):
    # TimeCrystal foundation: immutable, full-state snapshot.
    particles = _snapshot_particles(state["particles"])
    star_snapshot = _snapshot_star(star)
    habitable_zone_snapshot = {
        "r_inner": float(habitable_zone[0]),
        "r_outer": float(habitable_zone[1]),
    }
    return {
        "t": float(state["t"]),
        "dt": float(state["dt"]),
        "star": star_snapshot,
        "habitable_zone": habitable_zone_snapshot,
        "epsilon": float(state["epsilon"]),
        "particles": particles,
    }


def evolve_state(state, dt, star):
    # TimeCrystal foundation: pure evolution (no mutation of input state).
    particles = state["particles"]
    accelerations = []
    for particle in particles:
        probe = SimpleNamespace(x=particle["x"], y=particle["y"])
        ax, ay = gravitational_acceleration(probe, star, state["epsilon"])
        accelerations.append((ax, ay))

    new_particles = []
    for particle, (ax, ay) in zip(particles, accelerations):
        vx = particle["vx"] + ax * dt
        vy = particle["vy"] + ay * dt
        x = particle["x"] + vx * dt
        y = particle["y"] + vy * dt
        new_particles.append(
            {
                "x": x,
                "y": y,
                "vx": vx,
                "vy": vy,
                "mass": particle.get("mass"),
            }
        )

    return {
        "t": float(state["t"]) + float(dt),
        "dt": float(dt),
        "epsilon": float(state["epsilon"]),
        "particles": new_particles,
    }


class Simulator:
    def __init__(self, particles, central_mass=None, dt=0.0, epsilon=0.0, t0=0.0, star=None):
        if star is None:
            if central_mass is None:
                raise ValueError("Provide star or central_mass")
            star = Star(type_name="generic", mass=central_mass, luminosity=0.0)
        t0 = float(t0)
        self.star = star
        self.habitable_zone = compute_habitable_zone(self.star.luminosity)
        self.state = {
            "t0": t0,
            "t": t0,
            "dt": float(dt),
            "epsilon": float(epsilon),
            "particles": _normalize_particles(particles),
        }
        self.timeline = []

    def run(self, steps=None, end_time=None):
        # TimeCrystal foundation: single authoritative loop.
        if steps is None and end_time is None:
            raise ValueError("Provide steps or end_time")

        if steps is None:
            end_time = float(end_time)
            while float(self.state["t"]) < end_time:
                self.timeline.append(snapshot_state(self.state, self.star, self.habitable_zone))
                self.state = evolve_state(self.state, self.state["dt"], self.star)
            return self.timeline

        for _ in range(int(steps)):
            self.timeline.append(snapshot_state(self.state, self.star, self.habitable_zone))
            self.state = evolve_state(self.state, self.state["dt"], self.star)
        return self.timeline
