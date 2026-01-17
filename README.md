# Gravity / Light-Bending Demo

Minimal two-part demo with strict separation of concerns:

- Python does all physics and time evolution.
- Frontend only draws the precomputed output.

## Structure

```
Jan_26_grav_demo/
├── backend/
│   ├── particle.py
│   ├── gravity.py
│   ├── simulator.py
│   ├── scenarios.py
│   └── main.py
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

This writes `frontend/data.json`.

2) View in browser (needs a simple web server for `fetch`):

```bash
python -m http.server 8000
```

Open `http://localhost:8000/frontend/index.html`.

## Notes

- Change parameters in `backend/scenarios.py` for mass, dt, epsilon, and initial velocity.
- The frontend only reads and draws frames; it does no physics or stepping.
- Output format is `frames: [[{x, y}, ...], ...]` with a small `meta` block for reference.
