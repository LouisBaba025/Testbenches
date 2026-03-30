import type { CompatibilityResponse, TestbenchResult } from '../types'

interface Props {
  response: CompatibilityResponse | null
  loading: boolean
  torque: number
  speed: number
}

export function ResultsPanel({ response, loading, torque, speed }: Props) {
  if (loading) return (
    <div className="flex items-center gap-2 py-1" style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
      <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full"/>
      Calculating...
    </div>
  )
  if (!response) return null

  return (
    <div>
      <div style={{
        fontSize: '9px', fontWeight: 500, textTransform: 'uppercase' as const,
        letterSpacing: '0.6px', color: 'var(--color-text-secondary)', marginBottom: '8px'
      }}>
        Compatibility — {torque} Nm · {speed} rpm
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {response.results.map(r => (
          <ResultCard key={r.testbench_id} result={r} isBest={r.testbench_id === response.best_fit_id} />
        ))}
      </div>
    </div>
  )
}

function ResultCard({ result: r, isBest }: { result: TestbenchResult; isBest: boolean }) {
  const ok = r.compatible
  const lf = r.limiting_factor

  const borderColor = !ok ? '#F09595' : isBest ? '#3B6D11' : '#97C459'
  const borderWidth = isBest ? '2px' : '0.5px'
  const bg = !ok ? '#FCEBEB' : isBest ? '#EAF3DE' : 'var(--color-background-primary)'

  const badge = isBest
    ? { text: '★ best fit', bg: '#3B6D11', color: '#EAF3DE' }
    : !ok
      ? lf === 'speed'
        ? { text: '⚠ speed limit', bg: '#FAC775', color: '#633806' }
        : lf === 'torque'
          ? { text: '⚠ torque limit', bg: '#FAC775', color: '#633806' }
          : { text: '✗ not compatible', bg: '#F09595', color: '#791F1F' }
      : { text: '✓ ok', bg: '#C0DD97', color: '#27500A' }

  return (
    <div style={{
      borderRadius: '8px',
      border: `${borderWidth} solid ${borderColor}`,
      background: bg,
      padding: '8px 10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' as const, marginBottom: '5px' }}>
        <span style={{ fontSize: '11px', fontWeight: 500 }}>{r.testbench_name}</span>
        <span style={{
          fontSize: '9px', padding: '2px 6px', borderRadius: '20px',
          background: badge.bg, color: badge.color, fontWeight: 500
        }}>{badge.text}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '2px' }}>
        <Stat label="max speed" value={`${r.max_dut_speed_rpm} rpm`} warn={!ok && lf === 'speed'} />
        <Stat label="max torque" value={`${r.max_dut_torque_nm} Nm`} warn={!ok && lf === 'torque'} />
        <Stat label="LM speed" value={`${r.lm_speed_at_test} rpm (${r.lm_speed_utilization_pct.toFixed(0)}%)`} />
        <Stat label="LM torque" value={`${r.lm_torque_at_test} Nm (${r.lm_torque_utilization_pct.toFixed(0)}%)`} />
      </div>
    </div>
  )
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
      {label}{' '}
      <b style={{ color: warn ? '#A32D2D' : 'var(--color-text-primary)', fontWeight: 500 }}>{value}</b>
    </div>
  )
}
