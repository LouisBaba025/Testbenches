import type {
  Actuator, Components, Testbench,
  CompatibilityResponse, TestbenchResult
} from './types'

const BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : ''

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`)
  return res.json()
}

export const api = {
  getComponents: () => req<Components>('/components'),
  getTestbenches: () => req<Testbench[]>('/testbenches'),

  checkCompatibility: (peak_torque_nm: number, desired_speed_rpm: number) =>
    req<CompatibilityResponse>('/check-compatibility', {
      method: 'POST',
      body: JSON.stringify({ peak_torque_nm, desired_speed_rpm }),
    }),

  checkCustomChain: (body: {
    peak_torque_nm: number
    desired_speed_rpm: number
    gear_ratio: number
    sensor_max_torque_nm: number
    lm_peak_torque_nm: number
    lm_max_speed_rpm: number
  }) =>
    req<TestbenchResult>('/check-custom-chain', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  createActuator: (body: Omit<Actuator, 'id'>) =>
    req<Actuator>('/actuators', { method: 'POST', body: JSON.stringify(body) }),

  updateActuator: (id: number, body: Omit<Actuator, 'id'>) =>
    req<Actuator>(`/actuators/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  deleteActuator: (id: number) =>
    req<{ ok: boolean }>(`/actuators/${id}`, { method: 'DELETE' }),
}
