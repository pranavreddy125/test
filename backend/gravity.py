import math


def gravitational_acceleration(particle, star, epsilon):
    # Central mass fixed at (0, 0). Acceleration magnitude is mass / (r^2 + epsilon).
    rx = particle.x
    ry = particle.y
    r2 = rx * rx + ry * ry
    if r2 == 0.0:
        return 0.0, 0.0

    r = math.sqrt(r2)
    magnitude = star.mass / (r2 + epsilon)
    ax = -magnitude * (rx / r)
    ay = -magnitude * (ry / r)
    return ax, ay
