from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from scenarios import DEFAULT_DT, DEFAULT_STEPS, build_simulator
from star_presets import get_star_preset, list_star_presets

app = FastAPI(title="Gravity Simulator API", version="0.1.0")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimulateRequest(BaseModel):
    star_type: str = Field(..., min_length=1)
    x: float
    y: float
    vx: float
    vy: float
    dt: float = Field(..., gt=0.0)
    steps: int = Field(..., gt=0)


@app.post("/simulate")
def simulate(request: SimulateRequest) -> List[Dict[str, Any]]:
    try:
        star = get_star_preset(request.star_type)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    particle = {
        "x": request.x,
        "y": request.y,
        "vx": request.vx,
        "vy": request.vy,
        "mass": None,
    }
    sim = build_simulator([particle], star=star, dt=request.dt)
    return sim.run(request.steps)


@app.get("/presets")
def presets() -> Dict[str, Any]:
    return {
        "star_types": list(list_star_presets().keys()),
        "default_parameters": {"dt": DEFAULT_DT, "steps": DEFAULT_STEPS},
        "stars": list_star_presets(),
    }
