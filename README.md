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
│   ├── legacy/
│   └── sandbox_/
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

Open `http://localhost:8000/Jan_26_grav_demo/frontend/legacy/index.html`.

3) Run the API (optional):

```bash
uvicorn backend.api:app --reload
```

Example endpoints:

- POST `http://localhost:8000/simulate`
- GET `http://localhost:8000/presets`

4) Run the sandbox frontend (Vite + React):

```bash
cd frontend/sandbox_
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

## Notes

- Change parameters in `backend/scenarios.py` for star preset, dt, epsilon, and initial velocity.
- The frontend only reads and draws frames; it does no physics or stepping.
- Output is a list of snapshot objects with time, star metadata, habitable zone, epsilon, and full particle state.

## Output Schema

`backend/main.py` writes `backend/output/data.json` as:

```json
{
  "meta": {
    "steps": 800,
    "dt": 0.02,
    "t0": 0.0,
    "central_mass": 1.0,
    "epsilon": 0.01
  },
  "frames": [
    [{ "x": 1.0, "y": 0.0 }]
  ]
}
```

If you need full snapshots (star + habitable zone + full particle state), run the API (`/simulate`) which returns full snapshot objects per step.

## API

- `POST /simulate` runs a fresh simulation with a chosen star preset and initial conditions.
- `GET /presets` returns available star types and default simulation parameters.
