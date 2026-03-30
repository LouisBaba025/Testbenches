from .models import Actuator, LoadMachine, GearRatio, TorqueSensor, Testbench


def seed(db):
    if db.query(Actuator).count() > 0:
        return  # already seeded

    # ── Load Machines ─────────────────────────────────────────────────────────
    lm = LoadMachine(
        name="ASC1-082A-0K",
        model="SOMANET Actilink S C Line G1 80mm",
        rated_torque_nm=3.2,
        peak_torque_nm=13.0,
        max_speed_rpm=3000,
        rated_power_w=1005,
        notes="SOMANET Integro 8, EtherCAT, 18-bit multiturn encoder, IP65"
    )
    db.add(lm)
    db.flush()

    # ── Gear Ratios ───────────────────────────────────────────────────────────
    g7 = GearRatio(ratio=7.0,  label="1:7",  notes="Testbench 1 – torque sensor 120H31H")
    g15 = GearRatio(ratio=15.0, label="1:15", notes="Testbench 2 – torque sensor 120H69H")
    g50 = GearRatio(ratio=50.0, label="1:50", notes="Testbench 3 – torque sensor 2025024EH")
    db.add_all([g7, g15, g50])
    db.flush()

    # ── Torque Sensors ────────────────────────────────────────────────────────
    s1 = TorqueSensor(name="120H31H", serial="120H31H",   max_torque_nm=100,  bidirectional=True,
                      sensor_type="DYN-200", notes="TB1 – 1:7 gear – 100 Nm bidirectional")
    s2 = TorqueSensor(name="120H69H", serial="120H69H",   max_torque_nm=200,  bidirectional=False,
                      sensor_type="DYN-200", notes="TB2 – 1:15 gear – 200 Nm")
    s3 = TorqueSensor(name="2025024EH", serial="2025024EH", max_torque_nm=500, bidirectional=False,
                      sensor_type="DYN-200", notes="TB3 – 1:50 gear – 500 Nm")
    s4 = TorqueSensor(name="120H31H (backup)", serial=None, max_torque_nm=100, bidirectional=True,
                      sensor_type="DYN-200", notes="Spare 100 Nm")
    db.add_all([s1, s2, s3, s4])
    db.flush()

    # ── Testbenches ───────────────────────────────────────────────────────────
    tb1 = Testbench(name="Testbench 1", load_machine_id=lm.id,
                    gear_ratio_id=g7.id, torque_sensor_id=s1.id)
    tb2 = Testbench(name="Testbench 2", load_machine_id=lm.id,
                    gear_ratio_id=g15.id, torque_sensor_id=s2.id)
    tb3 = Testbench(name="Testbench 3", load_machine_id=lm.id,
                    gear_ratio_id=g50.id, torque_sensor_id=s3.id)
    db.add_all([tb1, tb2, tb3])
    db.flush()

    # ── Actuators ─────────────────────────────────────────────────────────────
    actuators = [
        Actuator(name="AJP-20", rated_torque_nm=20.0, peak_torque_nm=60.0,
                 max_speed_rpm=3000, rated_power_w=None,
                 notes="Tested on TB3 (1:50). FW v5.1.7. AJP series."),
        Actuator(name="JP-17", rated_torque_nm=17.0, peak_torque_nm=51.0,
                 max_speed_rpm=3000, rated_power_w=None,
                 notes="Tested on TB2 (1:15). OBLAC label: AJP-14-SAMPLE. JP series."),
        Actuator(name="JP-10", rated_torque_nm=10.0, peak_torque_nm=30.0,
                 max_speed_rpm=4000, rated_power_w=None, notes="JP series (estimated)"),
        Actuator(name="AJP-40", rated_torque_nm=40.0, peak_torque_nm=120.0,
                 max_speed_rpm=2000, rated_power_w=None, notes="AJP series (estimated)"),
        Actuator(name="AJP-60", rated_torque_nm=60.0, peak_torque_nm=180.0,
                 max_speed_rpm=1500, rated_power_w=None, notes="AJP series (estimated)"),
    ]
    db.add_all(actuators)
    db.commit()
    print("Database seeded.")
