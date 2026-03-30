export interface Actuator {
  id: number
  name: string
  rated_torque_nm: number
  peak_torque_nm: number
  max_speed_rpm: number
  rated_power_w: number | null
  notes: string | null
}

export interface LoadMachine {
  id: number
  name: string
  model: string
  rated_torque_nm: number
  peak_torque_nm: number
  max_speed_rpm: number
  rated_power_w: number
  notes: string | null
}

export interface GearRatio {
  id: number
  ratio: number
  label: string
  notes: string | null
}

export interface TorqueSensor {
  id: number
  name: string
  serial: string | null
  max_torque_nm: number
  bidirectional: boolean
  sensor_type: string | null
  notes: string | null
}

export interface Testbench {
  id: number
  name: string
  load_machine: LoadMachine
  gear_ratio: GearRatio
  torque_sensor: TorqueSensor
}

export interface Components {
  actuators: Actuator[]
  load_machines: LoadMachine[]
  gear_ratios: GearRatio[]
  torque_sensors: TorqueSensor[]
}

export interface TestbenchResult {
  testbench_id: number
  testbench_name: string
  compatible: boolean
  limiting_factor: 'ok' | 'speed' | 'torque' | 'both'
  max_dut_speed_rpm: number
  max_dut_torque_nm: number
  lm_speed_at_test: number
  lm_torque_at_test: number
  lm_speed_utilization_pct: number
  lm_torque_utilization_pct: number
}

export interface CompatibilityResponse {
  results: TestbenchResult[]
  best_fit_id: number | null
}

// Chain slot types
export type SlotType = 'actuator' | 'shaft' | 'sensor' | 'gear' | 'load_machine'

export interface ChainSlot {
  type: SlotType
  component: Actuator | TorqueSensor | GearRatio | LoadMachine | null
  fixed: boolean  // actuator and shaft slots are not swappable
}
