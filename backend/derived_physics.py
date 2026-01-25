from typing import Any, Dict, List

from scenarios import DEFAULT_EPSILON, DEFAULT_STEPS
from star_presets import get_star_preset


def derive_simulation_config(
    *,
    star_type: str,
    x: float,
    y: float,
    vx: float,
    vy: float,
    dt: float,
    simulation_steps: float,
    epsilon: float | None = None,
) -> Dict[str, Any]:
    """Interpret semantic inputs into absolute simulator config."""
    star = get_star_preset(star_type)
    particle = {"x": x, "y": y, "vx": vx, "vy": vy, "mass": None}
    system_timescale_steps = DEFAULT_STEPS
    resolved_steps = int(
        round(simulation_steps * (system_timescale_steps / DEFAULT_STEPS))
    )
    if resolved_steps < 1:
        resolved_steps = 1
    resolved_epsilon = DEFAULT_EPSILON if epsilon is None else epsilon

    return {
        "star": star,
        "particles": [particle],
        "dt": dt,
        "steps": resolved_steps,
        "epsilon": resolved_epsilon,
    }
