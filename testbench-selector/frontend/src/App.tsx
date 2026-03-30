import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from './api'
import type { Actuator, Components, Testbench, CompatibilityResponse } from './types'
import { ActuatorPanel } from './components/ActuatorPanel'
import { ChainCanvas } from './components/ChainCanvas'
import { Library } from './components/Library'
import { ResultsPanel } from './components/ResultsPanel'

export default function App() {
  const [components, setComponents] = useState<Components | null>(null)
  const [testbenches, setTestbenches] = useState<Testbench[]>([])
  const [selectedActuator, setSelectedActuator] = useState<Actuator | null>(null)
  const [testTorque, setTestTorque] = useState(45)
  const [testSpeed, setTestSpeed] = useState(150)
  const [results, setResults] = useState<CompatibilityResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const loadData = useCallback(async () => {
    const [comps, tbs] = await Promise.all([api.getComponents(), api.getTestbenches()])
    setComponents(comps)
    setTestbenches(tbs)
    if (comps.actuators.length) setSelectedActuator(comps.actuators[0])
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const runCheck = useCallback(async (torque: number, speed: number) => {
    if (torque <= 0 || speed <= 0) return
    setLoading(true)
    try {
      const res = await api.checkCompatibility(torque, speed)
      setResults(res)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runCheck(testTorque, testSpeed), 400)
    return () => clearTimeout(debounceRef.current)
  }, [testTorque, testSpeed, runCheck])

  const handleTorqueChange = (v: number) => {
    setTestTorque(v)
    if (selectedActuator) setTestTorque(Math.min(v, selectedActuator.peak_torque_nm))
  }

  const actuatorPeak = selectedActuator?.peak_torque_nm ?? testTorque
  const actuatorName = selectedActuator?.name ?? 'Custom'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '210px 1fr',
      gridTemplateRows: '46px 1fr auto',
      minHeight: '100vh',
      background: 'var(--color-background-tertiary)',
    }}>
      {/* Topbar */}
      <div style={{
        gridColumn: '1 / -1',
        background: 'var(--color-background-primary)',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px'
      }}>
        <div style={{ fontSize: '15px', fontWeight: 500, letterSpacing: '-0.3px' }}>
          <span style={{ color: '#D4274D' }}>Syn</span>apticon — Testbench Selector
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
          × swap component · click to remove
        </div>
      </div>

      {/* Sidebar */}
      <div style={{
        background: 'var(--color-background-secondary)',
        borderRight: '0.5px solid var(--color-border-tertiary)',
        padding: '10px', display: 'flex', flexDirection: 'column', gap: '12px',
        overflowY: 'auto'
      }}>
        <ActuatorPanel
          actuators={components?.actuators ?? []}
          selected={selectedActuator}
          onSelect={a => {
            setSelectedActuator(a)
            if (a) { setTestTorque(Math.round(a.peak_torque_nm * 0.75)); setTestSpeed(150) }
          }}
          onActuatorsChange={loadData}
          testTorque={testTorque}
          testSpeed={testSpeed}
          onTorqueChange={handleTorqueChange}
          onSpeedChange={setTestSpeed}
        />
        <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: '10px' }}>
          <div style={{
            fontSize: '9px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.6px',
            color: 'var(--color-text-secondary)', marginBottom: '6px'
          }}>Component library</div>
          <Library components={components} />
        </div>
      </div>

      {/* Main canvas */}
      <div style={{
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
        background: 'var(--color-background-primary)'
      }}>
        <div style={{ flex: 1, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {testbenches.length === 0 && (
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', padding: '20px' }}>
              Loading testbenches...
            </div>
          )}
          {testbenches.map(tb => {
            const result = results?.results.find(r => r.testbench_id === tb.id)
            const isBest = tb.id === results?.best_fit_id
            const borderColor = !result ? 'var(--color-border-tertiary)'
              : !result.compatible ? '#F09595'
              : isBest ? '#3B6D11'
              : '#97C459'
            const headerBg = isBest ? '#EAF3DE' : 'var(--color-background-secondary)'

            return (
              <div key={tb.id} style={{
                border: `${isBest ? '2px' : '0.5px'} solid ${borderColor}`,
                borderRadius: '10px', overflow: 'hidden'
              }}>
                {/* TB header */}
                <div style={{
                  background: headerBg,
                  borderBottom: '0.5px solid var(--color-border-tertiary)',
                  padding: '7px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {tb.name} — Gear {tb.gear_ratio.label}
                  </div>
                  {result && (
                    <TBBadge result={result} isBest={isBest} />
                  )}
                </div>

                {/* Chain */}
                <ChainCanvas
                  testbench={tb}
                  actuatorName={actuatorName}
                  actuatorPeak={actuatorPeak}
                  onSwapSensor={() => {}}
                  onSwapGear={() => {}}
                  onSwapLM={() => {}}
                />
              </div>
            )
          })}
        </div>

        {/* Results bar */}
        <div style={{
          borderTop: '0.5px solid var(--color-border-tertiary)',
          padding: '12px 18px',
          background: 'var(--color-background-secondary)'
        }}>
          <ResultsPanel
            response={results}
            loading={loading}
            torque={testTorque}
            speed={testSpeed}
          />
        </div>
      </div>
    </div>
  )
}

function TBBadge({ result, isBest }: { result: any; isBest: boolean }) {
  if (isBest) return <Badge text="★ best fit" bg="#3B6D11" color="#EAF3DE" />
  if (!result.compatible) {
    const lf = result.limiting_factor
    const t = lf === 'speed' ? '⚠ speed limit'
      : lf === 'torque' ? '⚠ torque limit'
      : '✗ not compatible'
    return <Badge text={t} bg="#FAC775" color="#633806" />
  }
  return <Badge text="✓ compatible" bg="#C0DD97" color="#27500A" />
}

function Badge({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <span style={{
      fontSize: '9px', padding: '2px 8px', borderRadius: '20px',
      background: bg, color, fontWeight: 500
    }}>{text}</span>
  )
}
