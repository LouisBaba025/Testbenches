import type { Components } from '../types'

interface Props {
  components: Components | null
}

export function Library({ components }: Props) {
  if (!components) return (
    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
  )

  return (
    <div className="flex flex-col gap-3">
      <Section title="Gearboxes">
        {components.gear_ratios.map(g => (
          <LibItem key={g.id} color="#CECBF6" stroke="#7F77DD" textColor="#3C3489"
            icon={<GearIcon/>} label={`Gear ${g.label}`} sub={`ratio ×${g.ratio}`}/>
        ))}
      </Section>

      <Section title="Torque sensors">
        {components.torque_sensors.map(s => (
          <LibItem key={s.id} color="#F0997B" stroke="#D85A30" textColor="#712B13"
            icon={<SensorIcon/>} label={s.name} sub={`${s.max_torque_nm} Nm`}/>
        ))}
      </Section>

      <Section title="Load machines">
        {components.load_machines.map(lm => (
          <LibItem key={lm.id} color="#1a1a1a" stroke="#333" textColor="#8B1528"
            icon={<LMIcon/>} label={lm.name} sub={`${lm.rated_power_w}W`}/>
        ))}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: '9px', fontWeight: 500, textTransform: 'uppercase' as const,
        letterSpacing: '0.6px', color: 'var(--color-text-secondary)', marginBottom: '4px'
      }}>{title}</div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}

function LibItem({ color, stroke, textColor, icon, label, sub }: {
  color: string; stroke: string; textColor: string
  icon: React.ReactNode; label: string; sub: string
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '4px 7px', borderRadius: '6px',
      border: '0.5px solid var(--color-border-tertiary)',
      background: 'var(--color-background-primary)',
      fontSize: '10px', cursor: 'grab', color: 'var(--color-text-primary)'
    }}>
      {icon}
      <div>
        <div style={{ fontWeight: 500, color: textColor }}>{label}</div>
        <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)' }}>{sub}</div>
      </div>
    </div>
  )
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="4" width="14" height="8" rx="2" fill="#CECBF6" stroke="#7F77DD" strokeWidth="0.7"/>
      <circle cx="5.5" cy="8" r="2.5" fill="#AFA9EC" stroke="#534AB7" strokeWidth="0.6"/>
      <circle cx="5.5" cy="8" r="1.2" fill="#534AB7"/>
      <circle cx="11" cy="8" r="1.8" fill="#AFA9EC" stroke="#534AB7" strokeWidth="0.6"/>
      <circle cx="11" cy="8" r="0.8" fill="#534AB7"/>
    </svg>
  )
}

function SensorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="4" width="12" height="8" rx="1.5" fill="#C1213C" stroke="#8B1528" strokeWidth="0.7"/>
      <rect x="3" y="7" width="5" height="3" rx="0.5" fill="#0a0a0a"/>
      <text x="5.5" y="10" fontSize="2.5" fill="#00ff66" textAnchor="middle" fontFamily="monospace">0.0</text>
      <line x1="0" y1="8" x2="2.5" y2="8" stroke="#888780" strokeWidth="1"/>
      <line x1="13.5" y1="8" x2="16" y2="8" stroke="#888780" strokeWidth="1"/>
    </svg>
  )
}

function LMIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="4" width="10" height="8" rx="1.5" fill="#1a1a1a" stroke="#333" strokeWidth="0.6"/>
      <rect x="1" y="5.5" width="10" height="1.5" fill="#2C2C2A"/>
      <rect x="1" y="8" width="10" height="1.5" fill="#2C2C2A"/>
      <rect x="1" y="10.5" width="10" height="1.5" fill="#2C2C2A"/>
      <rect x="10.5" y="5" width="5" height="6" rx="1.2" fill="#C1213C" stroke="#8B1528" strokeWidth="0.6"/>
      <line x1="0" y1="8" x2="1.5" y2="8" stroke="#888780" strokeWidth="1"/>
    </svg>
  )
}
