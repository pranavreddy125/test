import math

# Assumptions: simple square-root luminosity scaling.
# k1/k2 are dimensionless scale factors relative to a 1.0 luminosity baseline.
K1 = 0.95
K2 = 1.37


def compute_habitable_zone(luminosity):
    root = math.sqrt(float(luminosity))
    r_inner = K1 * root
    r_outer = K2 * root
    return r_inner, r_outer
