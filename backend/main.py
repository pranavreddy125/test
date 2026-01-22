import json
from pathlib import Path

from scenarios import simple_orbit


def main():
    sim = simple_orbit()
    steps = 800
    timeline = sim.run(steps)
    frames = [
        [{"x": p["x"], "y": p["y"]} for p in snapshot["state"]["particles"]]
        for snapshot in timeline
    ]

    payload = {
        "meta": {
            "steps": steps,
            "dt": timeline[0]["dt"] if timeline else None,
            "t0": timeline[0]["t"] if timeline else None,
            "central_mass": timeline[0]["state"]["central_mass"] if timeline else None,
            "epsilon": timeline[0]["state"]["epsilon"] if timeline else None,
        },
        "frames": frames,
    }

    output_dir = Path(__file__).resolve().parent / "output"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "data.json"
    output_path.write_text(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
