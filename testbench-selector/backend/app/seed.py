from .models import Actuator, LoadMachine, GearRatio, TorqueSensor, Testbench


def seed(db):
    # Load Machines
    if not db.query(LoadMachine).first():
        lm1 = LoadMachine(name="ASC1-082A-0K", model="SOMANET Actilink S C Line G1 80mm",
            rated_torque_nm=3.2, peak_torque_nm=13.0, max_speed_rpm=3000,
            rated_power_w=1005, notes="SOMANET Integro 8, EtherCAT, IP65. All 3 testbenches.")
        db.add(lm1); db.flush()
    
    lm = db.query(LoadMachine).filter_by(name="ASC1-082A-0K").first()

    if not db.query(GearRatio).first():
        g7  = GearRatio(ratio=7.0,  label="1:7",  notes="TB1 – torque sensor 120H31H")
        g15 = GearRatio(ratio=15.0, label="1:15", notes="TB2 – torque sensor 120H69H")
        g50 = GearRatio(ratio=50.0, label="1:50", notes="TB3 – torque sensor 2025024EH")
        db.add_all([g7, g15, g50]); db.flush()

    g7  = db.query(GearRatio).filter_by(label="1:7").first()
    g15 = db.query(GearRatio).filter_by(label="1:15").first()
    g50 = db.query(GearRatio).filter_by(label="1:50").first()

    if not db.query(TorqueSensor).first():
        db.add_all([
            TorqueSensor(name="120H31H",   serial="120H31H",   max_torque_nm=100, bidirectional=True,  sensor_type="DYN-200", notes="TB1 100Nm bidirectional"),
            TorqueSensor(name="120H69H",   serial="120H69H",   max_torque_nm=200, bidirectional=False, sensor_type="DYN-200", notes="TB2 200Nm"),
            TorqueSensor(name="2025024EH", serial="2025024EH", max_torque_nm=500, bidirectional=False, sensor_type="DYN-200", notes="TB3 500Nm"),
        ]); db.flush()

    s1 = db.query(TorqueSensor).filter_by(name="120H31H").first()
    s2 = db.query(TorqueSensor).filter_by(name="120H69H").first()
    s3 = db.query(TorqueSensor).filter_by(name="2025024EH").first()

    if not db.query(Testbench).first():
        db.add_all([
            Testbench(name="Testbench 1", load_machine_id=lm.id, gear_ratio_id=g7.id,  torque_sensor_id=s1.id),
            Testbench(name="Testbench 2", load_machine_id=lm.id, gear_ratio_id=g15.id, torque_sensor_id=s2.id),
            Testbench(name="Testbench 3", load_machine_id=lm.id, gear_ratio_id=g50.id, torque_sensor_id=s3.id),
        ]); db.flush()

    # Actuators upsert — only real products
    actuators = [
        # AL-JP series (Strain Wave 101:1, output shaft speeds from datasheet)
        dict(name="AL-JP 14", rated_torque_nm=9.6,   peak_torque_nm=34.0,  max_speed_rpm=70,  rated_power_w=None, notes="Strain Wave 101:1. OD 72mm. 24-48V."),
        dict(name="AL-JP 17", rated_torque_nm=22.0,  peak_torque_nm=66.0,  max_speed_rpm=46,  rated_power_w=None, notes="Strain Wave 101:1. OD 80mm. 24-48V."),
        dict(name="AL-JP 20", rated_torque_nm=34.0,  peak_torque_nm=102.0, max_speed_rpm=45,  rated_power_w=None, notes="Strain Wave 101:1. OD 90mm. 24-48V."),
        dict(name="AL-JP 25", rated_torque_nm=64.0,  peak_torque_nm=194.0, max_speed_rpm=38,  rated_power_w=None, notes="Strain Wave 101:1. OD 110mm. 24-48V."),
        dict(name="AL-JP 32", rated_torque_nm=137.0, peak_torque_nm=411.0, max_speed_rpm=27,  rated_power_w=None, notes="Strain Wave 101:1. OD 142mm. 24-48V."),
        # ACTILINK-JD series (planetary gear)
        dict(name="AJD-08",   rated_torque_nm=6.0,   peak_torque_nm=17.0,  max_speed_rpm=400, rated_power_w=170,  notes="JD8. AJD-08-20-400. Planetary 7.75:1. OD 78.5mm."),
        dict(name="AJD-09",   rated_torque_nm=11.0,  peak_torque_nm=30.0,  max_speed_rpm=470, rated_power_w=400,  notes="JD9. AJD-09-30-500. Planetary 9:1. OD 88mm."),
        dict(name="AJD-10",   rated_torque_nm=20.0,  peak_torque_nm=60.0,  max_speed_rpm=210, rated_power_w=380,  notes="JD10. AJD-10-60-200. Planetary 9:1. OD 106mm."),
        dict(name="AJD-12",   rated_torque_nm=40.0,  peak_torque_nm=110.0, max_speed_rpm=200, rated_power_w=700,  notes="JD12. AJD-12-120-200. Planetary 9:1. OD 120mm."),
        # AJP series (tested on testbenches)
        dict(name="AJP-20",   rated_torque_nm=20.0,  peak_torque_nm=60.0,  max_speed_rpm=3000, rated_power_w=None, notes="Tested TB3 (1:50). FW v5.1.7."),
        dict(name="JP-17",    rated_torque_nm=17.0,  peak_torque_nm=51.0,  max_speed_rpm=3000, rated_power_w=None, notes="Tested TB2 (1:15). OBLAC: AJP-14-SAMPLE."),
    ]
    for a in actuators:
        if not db.query(Actuator).filter_by(name=a["name"]).first():
            db.add(Actuator(**a))
    db.commit()
    print("Seeded OK.")
