from pydantic import BaseModel
from typing import Optional


class ActuatorBase(BaseModel):
    name: str
    rated_torque_nm: float
    peak_torque_nm: float
    max_speed_rpm: int
    rated_power_w: Optional[float] = None
    notes: Optional[str] = None

class ActuatorCreate(ActuatorBase):
    pass

class ActuatorOut(ActuatorBase):
    id: int
    class Config:
        from_attributes = True


class LoadMachineOut(BaseModel):
    id: int
    name: str
    model: str
    rated_torque_nm: float
    peak_torque_nm: float
    max_speed_rpm: int
    rated_power_w: float
    notes: Optional[str] = None
    class Config:
        from_attributes = True


class GearRatioOut(BaseModel):
    id: int
    ratio: float
    label: str
    notes: Optional[str] = None
    class Config:
        from_attributes = True


class TorqueSensorOut(BaseModel):
    id: int
    name: str
    serial: Optional[str] = None
    max_torque_nm: float
    bidirectional: bool
    sensor_type: Optional[str] = None
    notes: Optional[str] = None
    class Config:
        from_attributes = True


class TestbenchOut(BaseModel):
    id: int
    name: str
    load_machine: LoadMachineOut
    gear_ratio: GearRatioOut
    torque_sensor: TorqueSensorOut
    class Config:
        from_attributes = True


class CompatibilityRequest(BaseModel):
    peak_torque_nm: float      # DUT peak torque to test
    desired_speed_rpm: float   # desired test speed at DUT output


class TestbenchResult(BaseModel):
    testbench_id: int
    testbench_name: str
    compatible: bool
    limiting_factor: str        # "ok" | "speed" | "torque" | "both"
    max_dut_speed_rpm: float
    max_dut_torque_nm: float
    lm_speed_at_test: float
    lm_torque_at_test: float
    lm_speed_utilization_pct: float
    lm_torque_utilization_pct: float


class CompatibilityResponse(BaseModel):
    results: list[TestbenchResult]
    best_fit_id: Optional[int] = None


class ComponentsOut(BaseModel):
    actuators: list[ActuatorOut]
    load_machines: list[LoadMachineOut]
    gear_ratios: list[GearRatioOut]
    torque_sensors: list[TorqueSensorOut]


class CustomChainRequest(BaseModel):
    peak_torque_nm: float
    desired_speed_rpm: float
    gear_ratio: float
    sensor_max_torque_nm: float
    lm_peak_torque_nm: float
    lm_max_speed_rpm: int


class CustomChainResult(BaseModel):
    compatible: bool
    limiting_factor: str
    max_dut_speed_rpm: float
    max_dut_torque_nm: float
    lm_speed_at_test: float
    lm_torque_at_test: float
    lm_speed_utilization_pct: float
    lm_torque_utilization_pct: float
