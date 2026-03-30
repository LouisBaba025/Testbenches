from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base


class Actuator(Base):
    __tablename__ = "actuators"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    rated_torque_nm = Column(Float, nullable=False)
    peak_torque_nm = Column(Float, nullable=False)
    max_speed_rpm = Column(Integer, nullable=False)
    rated_power_w = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)


class LoadMachine(Base):
    __tablename__ = "load_machines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    model = Column(String, nullable=False)
    rated_torque_nm = Column(Float, nullable=False)
    peak_torque_nm = Column(Float, nullable=False)
    max_speed_rpm = Column(Integer, nullable=False)
    rated_power_w = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)


class GearRatio(Base):
    __tablename__ = "gear_ratios"
    id = Column(Integer, primary_key=True, index=True)
    # ratio stored as multiplier: gear_ratio=7 means output 7x slower (1:7)
    # LM_speed = DUT_speed * ratio, LM_torque = DUT_torque / ratio
    ratio = Column(Float, nullable=False)
    label = Column(String, nullable=False)  # e.g. "1:7"
    notes = Column(Text, nullable=True)


class TorqueSensor(Base):
    __tablename__ = "torque_sensors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    serial = Column(String, nullable=True)
    max_torque_nm = Column(Float, nullable=False)
    bidirectional = Column(Boolean, default=True)
    sensor_type = Column(String, nullable=True)
    notes = Column(Text, nullable=True)


class Testbench(Base):
    __tablename__ = "testbenches"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    load_machine_id = Column(Integer, ForeignKey("load_machines.id"), nullable=False)
    gear_ratio_id = Column(Integer, ForeignKey("gear_ratios.id"), nullable=False)
    torque_sensor_id = Column(Integer, ForeignKey("torque_sensors.id"), nullable=False)

    load_machine = relationship("LoadMachine")
    gear_ratio = relationship("GearRatio")
    torque_sensor = relationship("TorqueSensor")
