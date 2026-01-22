from star import Star

PRESETS = {
    # Relative scaling: sun_like is the baseline.
    "sun_like": {
        "mass": 1.0,
        "luminosity": 1.0,
        "description": "Baseline sun-like star.",
    },
    "red_giant": {
        "mass": 1.2,
        "luminosity": 100.0,
        "description": "Expanded, luminous red giant.",
    },
    "white_dwarf": {
        "mass": 0.8,
        "luminosity": 0.01,
        "description": "Compact, dim white dwarf.",
    },
}


def get_star_preset(name):
    presets = PRESETS
    try:
        preset = presets[name]
    except KeyError as exc:
        raise ValueError(f"Unknown star preset: {name}") from exc
    return Star(type_name=name, mass=preset["mass"], luminosity=preset["luminosity"])


def list_star_presets():
    return PRESETS
