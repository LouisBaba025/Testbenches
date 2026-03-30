import { useState } from 'react'
import type { Actuator } from '../types'
import { api } from '../api'

interface Props {
  actuators: Actuator[]
  selected: Actuator | null
  onSelect: (a: Actuator | null) => void
  onActuatorsChange: () => void
  testTorque: number
  testSpeed: number
  onTorqueChange: (v: number) => void
  onSpeedChange: (v: number) => void
}

export function ActuatorPanel({
  actuators, selected, onSelect, onActuatorsChange,
  testTorque, testSpeed, onTorqueChange, onSpeedChange
}: Props) {
  const [mode, setMode] = useState<'select' | 'custom'>('select')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', rated_torque_nm: '', peak_torque_nm: '', max_speed_rpm: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const handleSelect = (id: string) => {
    if (id === '__custom__') { setMode('custom'); onSelect(null); return }
    const a = actuators.find(a => String(a.id) === id) ?? null
    setMode('select')
    onSelect(a)
  }

  const handleCustomTorque = (v: string) => {
    const n = parseFloat(v)
    if (!isNaN(n)) onTorqueChange(n)
  }

  const handleSaveActuator = async () => {
    setSaving(true)
    try {
      await api.createActuator({
        name: form.name,
        rated_torque_nm: parseFloat(form.rated_torque_nm),
        peak_torque_nm: parseFloat(form.peak_torque_nm),
        max_speed_rpm: parseInt(form.max_speed_rpm),
        rated_power_w: null,
        notes: form.notes || null,
      })
      setShowAdd(false)
      setForm({ name: '', rated_torque_nm: '', peak_torque_nm: '', max_speed_rpm: '', notes: '' })
      onActuatorsChange()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Actuator (DUT)</span>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="text-xs text-[#D4274D] hover:underline"
        >+ Add new</button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-3 p-2 bg-red-50 rounded-lg border border-red-100 space-y-1.5">
          <div className="text-xs font-medium text-red-800 mb-1">New actuator</div>
          {[
            ['name', 'Name', 'text'],
            ['rated_torque_nm', 'Rated torque [Nm]', 'number'],
            ['peak_torque_nm', 'Peak torque [Nm]', 'number'],
            ['max_speed_rpm', 'Max speed [rpm]', 'number'],
            ['notes', 'Notes (optional)', 'text'],
          ].map(([k, label, type]) => (
            <div key={k}>
              <label className="text-xs text-gray-500">{label}</label>
              <input
                type={type}
                value={(form as any)[k]}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="w-full mt-0.5 px-2 py-1 text-xs border border-gray-200 rounded-md"
              />
            </div>
          ))}
          <button
            onClick={handleSaveActuator}
            disabled={saving || !form.name || !form.peak_torque_nm}
            className="w-full mt-1 py-1 text-xs bg-[#D4274D] text-white rounded-md disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save actuator'}
          </button>
        </div>
      )}

      {/* Selector */}
      <select
        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg bg-white"
        value={mode === 'custom' ? '__custom__' : String(selected?.id ?? '')}
        onChange={e => handleSelect(e.target.value)}
      >
        <option value="">— select actuator —</option>
        {actuators.map(a => (
          <option key={a.id} value={String(a.id)}>{a.name}</option>
        ))}
        <option value="__custom__">– custom / manual input –</option>
      </select>

      {/* Metrics */}
      {selected && mode === 'select' && (
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          <Metric label="Nm rated" value={selected.rated_torque_nm} color="text-gray-700" />
          <Metric label="Nm peak" value={selected.peak_torque_nm} color="text-[#D4274D]" />
          <Metric label="rpm max" value={selected.max_speed_rpm} color="text-gray-700" />
        </div>
      )}

      {/* Custom inputs */}
      {mode === 'custom' && (
        <div className="mt-2 space-y-1.5">
          <div>
            <label className="text-xs text-gray-400">Peak torque [Nm]</label>
            <input
              type="number" min="0" value={testTorque}
              onChange={e => handleCustomTorque(e.target.value)}
              className="w-full mt-0.5 px-2 py-1 text-sm border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Max speed [rpm]</label>
            <input
              type="number" min="0" defaultValue={3000}
              className="w-full mt-0.5 px-2 py-1 text-sm border border-gray-200 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Test parameters */}
      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Test parameters</div>
        <InputRow
          label="Test torque [Nm]"
          hint="torque the DUT must produce"
          value={testTorque}
          onChange={onTorqueChange}
          max={selected?.peak_torque_nm ?? 9999}
        />
        <InputRow
          label="Test speed [rpm]"
          hint="desired output shaft speed"
          value={testSpeed}
          onChange={onSpeedChange}
          max={selected?.max_speed_rpm ?? 9999}
        />
        {selected && testTorque > selected.peak_torque_nm && (
          <p className="text-xs text-[#D4274D]">⚠ Torque exceeds actuator peak ({selected.peak_torque_nm} Nm)</p>
        )}
      </div>
    </div>
  )
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-center">
      <div className={`text-base font-medium ${color}`}>{value}</div>
      <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}

function InputRow({ label, hint, value, onChange, max }: {
  label: string; hint: string; value: number; onChange: (v: number) => void; max: number
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <label className="text-xs text-gray-600">{label}</label>
        <span className="text-[10px] text-gray-400">{hint}</span>
      </div>
      <input
        type="number" min="0" max={max} value={value}
        onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) onChange(n) }}
        className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg"
      />
    </div>
  )
}
