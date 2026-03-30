import type { Testbench, GearRatio, TorqueSensor, LoadMachine } from '../types'
import {
  IconActuator, IconLoadMachine, IconCoupling, IconDYN200, IconGearbox
} from './Icons'

interface ChainNode {
  type: 'actuator' | 'coupling' | 'sensor' | 'gearbox' | 'loadmachine'
  label: string
  sublabel: string
  swappable: boolean
  id?: number
}

interface Props {
  testbench: Testbench
  actuatorName: string
  actuatorPeak: number
  onSwapSensor: (tbId: number) => void
  onSwapGear: (tbId: number) => void
  onSwapLM: (tbId: number) => void
}

export function ChainCanvas({ testbench, actuatorName, actuatorPeak, onSwapSensor, onSwapGear, onSwapLM }: Props) {
  const { gear_ratio, torque_sensor, load_machine } = testbench

  return (
    <div className="relative px-3 py-4 overflow-x-auto">
      {/* aluminum profile rail background */}
      <div className="absolute left-3 right-3" style={{
        top: '50%', transform: 'translateY(-4px)',
        height: '8px', background: '#B4B2A9', borderRadius: '4px', zIndex: 0
      }}/>
      <div className="absolute left-3 right-3" style={{
        top: '50%', transform: 'translateY(-6px)',
        height: '3px', background: '#D3D1C7', borderRadius: '2px', zIndex: 0
      }}/>
      {/* rail bolt holes */}
      {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((p, i) => (
        <div key={i} className="absolute" style={{
          left: `calc(${p * 100}%)`,
          top: '50%', transform: 'translateY(2px)',
          width: '5px', height: '5px',
          background: '#888780', borderRadius: '50%', zIndex: 0
        }}/>
      ))}

      {/* Chain */}
      <div className="relative flex items-center gap-0" style={{ zIndex: 1 }}>

        {/* DUT Actuator */}
        <ChainItem label={actuatorName} sublabel={`DUT · ${actuatorPeak} Nm pk`} labelColor="#8B1528">
          <IconActuator />
        </ChainItem>

        <ShaftSpacer />

        {/* Coupling */}
        <ChainItem label="Coupling" sublabel="" labelColor="#5F5E5A">
          <IconCoupling />
        </ChainItem>

        <ShaftSpacer />

        {/* Torque Sensor — swappable */}
        <ChainItem
          label={torque_sensor.name}
          sublabel={`DYN-200 · ${torque_sensor.max_torque_nm} Nm`}
          labelColor="#8B1528"
          onDelete={() => onSwapSensor(testbench.id)}
        >
          <IconDYN200 nm={torque_sensor.max_torque_nm} />
        </ChainItem>

        <ShaftSpacer />

        {/* Coupling */}
        <ChainItem label="Coupling" sublabel="" labelColor="#5F5E5A">
          <IconCoupling />
        </ChainItem>

        <ShaftSpacer />

        {/* Gearbox — swappable */}
        <ChainItem
          label={`Gear ${gear_ratio.label}`}
          sublabel={`×${gear_ratio.ratio} torque`}
          labelColor="#3C3489"
          onDelete={() => onSwapGear(testbench.id)}
        >
          <IconGearbox label={gear_ratio.label} />
        </ChainItem>

        <ShaftSpacer />

        {/* Coupling */}
        <ChainItem label="Coupling" sublabel="" labelColor="#5F5E5A">
          <IconCoupling />
        </ChainItem>

        <ShaftSpacer />

        {/* Load Machine — swappable */}
        <ChainItem
          label={load_machine.name}
          sublabel={`${load_machine.rated_power_w}W · ${load_machine.peak_torque_nm}Nm pk`}
          labelColor="#8B1528"
          onDelete={() => onSwapLM(testbench.id)}
        >
          <IconLoadMachine />
        </ChainItem>

      </div>
    </div>
  )
}

function ShaftSpacer() {
  return <div className="flex-shrink-0" style={{ width: '12px', zIndex: 1 }} />
}

function ChainItem({ children, label, sublabel, labelColor, onDelete }: {
  children: React.ReactNode
  label: string
  sublabel: string
  labelColor: string
  onDelete?: () => void
}) {
  return (
    <div className="flex flex-col items-center flex-shrink-0 relative" style={{ zIndex: 1 }}>
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute flex items-center justify-center"
          style={{
            top: '-6px', right: '-8px', width: '15px', height: '15px',
            borderRadius: '50%', background: '#E24B4A', color: '#fff',
            fontSize: '10px', border: 'none', cursor: 'pointer', zIndex: 3,
            lineHeight: 1
          }}
          title="Click to swap component"
        >×</button>
      )}
      {/* white backing card so icons sit cleanly above the rail */}
      <div style={{
        background: 'var(--color-background-primary)',
        borderRadius: '6px', padding: '2px 3px',
        border: '0.5px solid var(--color-border-tertiary)'
      }}>
        {children}
      </div>
      <div style={{
        fontSize: '9px', fontWeight: 500, marginTop: '4px',
        color: labelColor, textAlign: 'center', maxWidth: '88px', lineHeight: 1.3
      }}>{label}</div>
      {sublabel && (
        <div style={{ fontSize: '8px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          {sublabel}
        </div>
      )}
    </div>
  )
}
