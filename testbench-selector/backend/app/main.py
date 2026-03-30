from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, get_db, Base
from .models import Actuator, LoadMachine, GearRatio, TorqueSensor, Testbench
from .schemas import (
    ActuatorOut, ActuatorCreate, LoadMachineOut, GearRatioOut,
    TorqueSensorOut, TestbenchOut, ComponentsOut,
    CompatibilityRequest, CompatibilityResponse, TestbenchResult,
    CustomChainRequest, CustomChainResult
)
from .seed import seed

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Testbench Selector API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    db = next(get_db())
    try:
        seed(db)
    finally:
        db.close()


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok"}


# ── Components ────────────────────────────────────────────────────────────────
@app.get("/api/components", response_model=ComponentsOut)
def get_components(db: Session = Depends(get_db)):
    return ComponentsOut(
        actuators=db.query(Actuator).all(),
        load_machines=db.query(LoadMachine).all(),
        gear_ratios=db.query(GearRatio).all(),
        torque_sensors=db.query(TorqueSensor).all(),
    )


# ── Actuators ─────────────────────────────────────────────────────────────────
@app.get("/api/actuators", response_model=list[ActuatorOut])
def list_actuators(db: Session = Depends(get_db)):
    return db.query(Actuator).all()


@app.post("/api/actuators", response_model=ActuatorOut)
def create_actuator(body: ActuatorCreate, db: Session = Depends(get_db)):
    if db.query(Actuator).filter(Actuator.name == body.name).first():
        raise HTTPException(400, "Actuator name already exists")
    a = Actuator(**body.model_dump())
    db.add(a)
    db.commit()
    db.refresh(a)
    return a


@app.put("/api/actuators/{actuator_id}", response_model=ActuatorOut)
def update_actuator(actuator_id: int, body: ActuatorCreate, db: Session = Depends(get_db)):
    a = db.query(Actuator).filter(Actuator.id == actuator_id).first()
    if not a:
        raise HTTPException(404, "Actuator not found")
    for k, v in body.model_dump().items():
        setattr(a, k, v)
    db.commit()
    db.refresh(a)
    return a


@app.delete("/api/actuators/{actuator_id}")
def delete_actuator(actuator_id: int, db: Session = Depends(get_db)):
    a = db.query(Actuator).filter(Actuator.id == actuator_id).first()
    if not a:
        raise HTTPException(404, "Actuator not found")
    db.delete(a)
    db.commit()
    return {"ok": True}


# ── Testbenches ───────────────────────────────────────────────────────────────
@app.get("/api/testbenches", response_model=list[TestbenchOut])
def list_testbenches(db: Session = Depends(get_db)):
    return db.query(Testbench).all()


# ── Compatibility Check ───────────────────────────────────────────────────────
def calc_compatibility(
    peak_torque_nm: float,
    desired_speed_rpm: float,
    gear_ratio: float,
    sensor_max_torque: float,
    lm_peak_torque: float,
    lm_max_speed: int,
) -> dict:
    """
    Gear ratio G means: LM_speed = DUT_speed × G, LM_torque = DUT_torque / G
    DUT output shaft rotates G times SLOWER than load machine.
    """
    max_dut_torque_by_lm = lm_peak_torque * gear_ratio
    max_dut_torque = min(max_dut_torque_by_lm, sensor_max_torque)
    max_dut_speed = lm_max_speed / gear_ratio

    lm_speed_at_test = desired_speed_rpm * gear_ratio
    lm_torque_at_test = peak_torque_nm / gear_ratio

    speed_ok = desired_speed_rpm <= max_dut_speed
    torque_ok = peak_torque_nm <= max_dut_torque

    if speed_ok and torque_ok:
        limiting = "ok"
    elif not speed_ok and not torque_ok:
        limiting = "both"
    elif not speed_ok:
        limiting = "speed"
    else:
        limiting = "torque"

    lm_speed_util = (lm_speed_at_test / lm_max_speed * 100) if lm_max_speed else 0
    lm_torque_util = (lm_torque_at_test / lm_peak_torque * 100) if lm_peak_torque else 0

    return {
        "compatible": speed_ok and torque_ok,
        "limiting_factor": limiting,
        "max_dut_speed_rpm": round(max_dut_speed, 1),
        "max_dut_torque_nm": round(max_dut_torque, 1),
        "lm_speed_at_test": round(lm_speed_at_test, 1),
        "lm_torque_at_test": round(lm_torque_at_test, 2),
        "lm_speed_utilization_pct": round(lm_speed_util, 1),
        "lm_torque_utilization_pct": round(lm_torque_util, 1),
    }


@app.post("/api/check-compatibility", response_model=CompatibilityResponse)
def check_compatibility(body: CompatibilityRequest, db: Session = Depends(get_db)):
    testbenches = db.query(Testbench).all()
    results = []

    for tb in testbenches:
        calc = calc_compatibility(
            peak_torque_nm=body.peak_torque_nm,
            desired_speed_rpm=body.desired_speed_rpm,
            gear_ratio=tb.gear_ratio.ratio,
            sensor_max_torque=tb.torque_sensor.max_torque_nm,
            lm_peak_torque=tb.load_machine.peak_torque_nm,
            lm_max_speed=tb.load_machine.max_speed_rpm,
        )
        results.append(TestbenchResult(
            testbench_id=tb.id,
            testbench_name=tb.name,
            **calc,
        ))

    # Best fit = compatible TB with highest torque margin (closest to requirement)
    compatible = [r for r in results if r.compatible]
    best_id = None
    if compatible:
        # prefer the one where the test torque uses most of the available torque
        # (closest fit without going over)
        best = max(compatible,
                   key=lambda r: body.peak_torque_nm / r.max_dut_torque_nm)
        best_id = best.testbench_id

    return CompatibilityResponse(results=results, best_fit_id=best_id)


@app.post("/api/check-custom-chain", response_model=CustomChainResult)
def check_custom_chain(body: CustomChainRequest):
    calc = calc_compatibility(
        peak_torque_nm=body.peak_torque_nm,
        desired_speed_rpm=body.desired_speed_rpm,
        gear_ratio=body.gear_ratio,
        sensor_max_torque=body.sensor_max_torque_nm,
        lm_peak_torque=body.lm_peak_torque_nm,
        lm_max_speed=body.lm_max_speed_rpm,
    )
    return CustomChainResult(**calc)


@app.put("/api/testbenches/{tb_id}", response_model=TestbenchOut)
def update_testbench(tb_id: int, body: dict, db: Session = Depends(get_db)):
    from .models import Testbench as TB
    tb = db.query(TB).filter(TB.id == tb_id).first()
    if not tb:
        raise HTTPException(404, "Testbench not found")
    for k, v in body.items():
        if hasattr(tb, k):
            setattr(tb, k, v)
    db.commit()
    db.refresh(tb)
    return tb


@app.post("/api/testbenches", response_model=TestbenchOut)
def create_testbench(body: dict, db: Session = Depends(get_db)):
    from .models import Testbench as TB
    tb = TB(**body)
    db.add(tb)
    db.commit()
    db.refresh(tb)
    return tb
