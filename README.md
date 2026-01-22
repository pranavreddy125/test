# Gravity / Light-Bending Demo

Minimal two-part demo with strict separation of concerns:

- Python does all physics and time evolution.
- Frontend only draws the precomputed output.

## Structure

```
Jan_26_grav_demo/
├── backend/
│   ├── api.py
│   ├── habitable_zone.py
│   ├── particle.py
│   ├── gravity.py
│   ├── simulator.py
│   ├── scenarios.py
│   ├── star.py
│   ├── star_presets.py
│   └── main.py
│   └── output/
├── frontend/
│   ├── index.html
│   └── render.js
└── README.md
```

## Run

1) Generate data:

```bash
python backend/main.py
```

This writes `backend/output/data.json`.

2) View in browser (needs a simple web server for `fetch`):

```bash
python -m http.server 8000
```

Open `http://localhost:8000/frontend/index.html`.

3) Run the API (optional):

```bash
uvicorn backend.api:app --reload
```

Example endpoints:

- POST `http://localhost:8000/simulate`
- GET `http://localhost:8000/presets`

## Notes

- Change parameters in `backend/scenarios.py` for star preset, dt, epsilon, and initial velocity.
- The frontend only reads and draws frames; it does no physics or stepping.
- Output is a list of snapshot objects with time, star metadata, habitable zone, epsilon, and full particle state.

## Snapshot Schema

Each snapshot is a full, immutable state at time `t`:

```json
{
  "t": 0.0,
  "dt": 0.02,
  "star": {
    "type_name": "sun_like",
    "mass": 1.0,
    "luminosity": 1.0
  },
  "habitable_zone": {
    "r_inner": 0.95,
    "r_outer": 1.37
  },
  "epsilon": 0.01,
  "particles": [
    { "x": 1.0, "y": 0.0, "vx": 0.0, "vy": 1.2, "mass": null }
  ]
}
```

## API

- `POST /simulate` runs a fresh simulation with a chosen star preset and initial conditions.
- `GET /presets` returns available star types and default simulation parameters.
