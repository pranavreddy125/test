import json
from pathlib import Path

from scenarios import simple_orbit


def main():
    sim = simple_orbit()
    steps = 800
    history = sim.run(steps)

    payload = {
        "meta": {
            "steps": steps,
            "dt": sim.dt,
            "central_mass": sim.central_mass,
            "epsilon": sim.epsilon,
        },
        "frames": history,
    }

    output_path = Path(__file__).resolve().parent.parent / "frontend" / "data.json"
    output_path.write_text(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
