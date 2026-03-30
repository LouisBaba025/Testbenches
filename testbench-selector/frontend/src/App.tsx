import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from './api'
import type { Actuator, Components, Testbench, CompatibilityResponse } from './types'

const C = {
  red:'#C1213C', redDk:'#8B1528', black:'#1a1a1a', gray:'#888780',
  purple:'#534AB7', purpleLt:'#EEEDFE', green:'#3B6D11', greenLt:'#EAF3DE',
  border:'var(--color-border-tertiary)', bg:'var(--color-background-primary)',
  bgSec:'var(--color-background-secondary)', text:'var(--color-text-primary)',
  textSec:'var(--color-text-secondary)',
}

function SvgActuator({size=58}:{size?:number}) {
  const h = Math.round(size*50/58)
  return <svg width={size} height={h} viewBox="0 0 58 50" fill="none">
    <rect x="0" y="21" width="7" height="5" rx="2" fill={C.black}/>
    <rect x="6" y="13" width="13" height="21" rx="2.5" fill={C.red} stroke={C.redDk} strokeWidth="0.8"/>
    <rect x="6" y="13" width="4" height="21" rx="2" fill="#E8294D" stroke={C.redDk} strokeWidth="0.6"/>
    <rect x="10" y="9" width="7" height="4" rx="1" fill={C.black}/>
    <line x1="12" y1="9" x2="11" y2="5" stroke={C.black} strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="14" y1="9" x2="14" y2="4" stroke="#333" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="16" y1="9" x2="17" y2="5" stroke={C.black} strokeWidth="1.2" strokeLinecap="round"/>
    <rect x="8" y="19" width="8" height="5" rx="1" fill={C.redDk} stroke="#6B0F1E" strokeWidth="0.4"/>
    <rect x="18" y="10" width="32" height="28" rx="3" fill={C.black} stroke="#111" strokeWidth="0.7"/>
    {[12.5,16.5,20.5,24.5,28.5,32.5].map(y=><rect key={y} x="18" y={y} width="32" height="3" rx="0.8" fill="#2C2C2A" stroke="#111" strokeWidth="0.3"/>)}
    {[12.5,16.5,20.5,24.5,28.5,32.5].map(y=><line key={y} x1="19" y1={y} x2="49" y2={y} stroke="#444" strokeWidth="0.4"/>)}
    <rect x="49" y="21" width="9" height="5" rx="2" fill={C.black}/>
  </svg>
}

function SvgLM({size=76}:{size?:number}) {
  const h = Math.round(size*50/76)
  return <svg width={size} height={h} viewBox="0 0 76 50" fill="none">
    <rect x="0" y="21" width="7" height="5" rx="2" fill={C.black}/>
    <rect x="6" y="10" width="42" height="28" rx="3" fill={C.black} stroke="#111" strokeWidth="0.7"/>
    {[12.5,16.5,20.5,24.5,28.5,32.5].map(y=><rect key={y} x="6" y={y} width="42" height="3" rx="0.8" fill="#2C2C2A" stroke="#111" strokeWidth="0.3"/>)}
    {[12.5,16.5,20.5,24.5,28.5,32.5].map(y=><line key={y} x1="7" y1={y} x2="47" y2={y} stroke="#444" strokeWidth="0.4"/>)}
    <rect x="47" y="13" width="13" height="21" rx="2.5" fill={C.red} stroke={C.redDk} strokeWidth="0.8"/>
    <rect x="57" y="13" width="4" height="21" rx="2" fill="#E8294D" stroke={C.redDk} strokeWidth="0.6"/>
    <rect x="50" y="9" width="10" height="4" rx="1" fill={C.black}/>
    <line x1="53" y1="9" x2="51" y2="4" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="57" y1="9" x2="57" y2="3" stroke="#E24B4A" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="61" y1="9" x2="63" y2="4" stroke={C.black} strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="49" y="20" width="10" height="5" rx="1" fill={C.redDk} stroke="#6B0F1E" strokeWidth="0.4"/>
  </svg>
}

function SvgCoupling() {
  return <svg width="18" height="50" viewBox="0 0 18 50" fill="none">
    <rect x="0" y="21" width="18" height="5" rx="2" fill={C.gray}/>
    <circle cx="9" cy="23.5" r="9" fill="#2C2C2A" stroke={C.black} strokeWidth="0.8"/>
    <circle cx="9" cy="23.5" r="5.5" fill="#444441" stroke="#333" strokeWidth="0.7"/>
    <circle cx="9" cy="23.5" r="2.5" fill={C.black}/>
    {([[9,15],[9,32],[2.5,19],[15.5,19],[2.5,28],[15.5,28]] as [number,number][]).map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="1.3" fill={C.black}/>)}
  </svg>
}

function SvgSensor({nm}:{nm:number}) {
  return <svg width="44" height="50" viewBox="0 0 44 50" fill="none">
    <rect x="0" y="21" width="44" height="5" rx="2" fill={C.gray}/>
    <rect x="4" y="12" width="36" height="24" rx="3" fill={C.red} stroke={C.redDk} strokeWidth="1.1"/>
    <rect x="4" y="12" width="36" height="6" rx="2" fill="#E8294D"/>
    <rect x="8" y="18" width="14" height="10" rx="1.5" fill="#0a0a0a" stroke="#6B0F1E" strokeWidth="0.5"/>
    <text x="15" y="25.5" fontSize="4" fill="#00ff66" textAnchor="middle" fontFamily="monospace">0.00</text>
    {[11,16,21].map(cx=><circle key={cx} cx={cx} cy="32" r="1.7" fill={C.redDk} stroke="#6B0F1E" strokeWidth="0.4"/>)}
    <rect x="15" y="8" width="14" height="5" rx="1" fill={C.black}/>
    <line x1="18" y1="8" x2="17" y2="4" stroke={C.black} strokeWidth="1.1" strokeLinecap="round"/>
    <line x1="22" y1="8" x2="22" y2="3" stroke="#333" strokeWidth="1.1" strokeLinecap="round"/>
    <line x1="26" y1="8" x2="27" y2="4" stroke={C.black} strokeWidth="1.1" strokeLinecap="round"/>
    <rect x="7" y="36" width="30" height="4" rx="1" fill={C.redDk} stroke="#6B0F1E" strokeWidth="0.6"/>
    {[12,22,32].map(cx=><circle key={cx} cx={cx} cy="38" r="1.1" fill="#6B0F1E"/>)}
    <text x="32" y="27" fontSize="5" fill="#FAEEDA" textAnchor="middle" fontFamily="monospace" fontWeight="bold">{nm}</text>
  </svg>
}

function SvgGear({label}:{label:string}) {
  return <svg width="52" height="50" viewBox="0 0 52 50" fill="none">
    <rect x="0" y="21" width="52" height="5" rx="2" fill={C.gray}/>
    <rect x="2" y="9" width="48" height="30" rx="4" fill={C.purpleLt} stroke={C.purple} strokeWidth="1.1"/>
    <rect x="2" y="9" width="48" height="7" rx="3" fill="white"/>
    <text x="26" y="19" fontSize="6" fill={C.purple} textAnchor="middle" fontFamily="monospace" fontWeight="bold">{label}</text>
    <circle cx="18" cy="27" r="10" fill="#AFA9EC" stroke={C.purple} strokeWidth="0.9"/>
    <circle cx="18" cy="27" r="6" fill={C.purpleLt} stroke={C.purple} strokeWidth="0.7"/>
    <circle cx="18" cy="27" r="2.5" fill={C.purple}/>
    <circle cx="36" cy="27" r="7" fill="#AFA9EC" stroke={C.purple} strokeWidth="0.9"/>
    <circle cx="36" cy="27" r="4" fill={C.purpleLt} stroke={C.purple} strokeWidth="0.7"/>
    <circle cx="36" cy="27" r="1.8" fill={C.purple}/>
    <rect x="6" y="39" width="40" height="3.5" rx="1" fill="#AFA9EC" stroke={C.purple} strokeWidth="0.5"/>
  </svg>
}

function Node({icon,label,lc,sub,swap,onSwap}:{icon:React.ReactNode;label:string;lc:string;sub?:string;swap?:boolean;onSwap?:()=>void}) {
  return <div style={{display:'flex',flexDirection:'column',alignItems:'center',position:'relative',zIndex:1,flexShrink:0}}>
    {swap&&onSwap&&<button onClick={onSwap} style={{position:'absolute',top:'-7px',right:'-8px',width:'16px',height:'16px',borderRadius:'50%',background:'#E24B4A',color:'white',fontSize:'10px',border:'none',cursor:'pointer',zIndex:3,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>×</button>}
    <div style={{background:C.bg,borderRadius:'8px',padding:'3px 4px',border:`0.5px solid ${swap?C.redDk:C.border}`}}>{icon}</div>
    <div style={{fontSize:'9px',fontWeight:500,marginTop:'4px',color:lc,textAlign:'center',maxWidth:'80px',lineHeight:1.3}}>{label}</div>
    {sub&&<div style={{fontSize:'8px',color:C.textSec,textAlign:'center'}}>{sub}</div>}
  </div>
}

const Gap=()=><div style={{width:'12px',flexShrink:0,zIndex:1}}/>

function Chain({tb,actName,actPeak,result,isBest,onSwap}:{tb:Testbench;actName:string;actPeak:number;result:any;isBest:boolean;onSwap:(t:'sensor'|'gear'|'lm')=>void}) {
  const ok=result?.compatible
  const bc=!result?C.border:!ok?'#F09595':isBest?C.green:'#97C459'
  const hbg=isBest?C.greenLt:C.bgSec
  const badge=!result?null:isBest?{t:'★ best fit',bg:C.green,c:'#EAF3DE'}:!ok?
    result.limiting_factor==='speed'?{t:'⚠ speed',bg:'#FAC775',c:'#633806'}:
    result.limiting_factor==='torque'?{t:'⚠ torque',bg:'#FAC775',c:'#633806'}:
    {t:'✗ no',bg:'#F09595',c:'#791F1F'}:
    {t:'✓ ok',bg:'#C0DD97',c:'#27500A'}
  return <div style={{border:`${isBest?2:0.5}px solid ${bc}`,borderRadius:'12px',overflow:'hidden'}}>
    <div style={{background:hbg,borderBottom:`0.5px solid ${C.border}`,padding:'7px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{fontSize:'11px',fontWeight:500,color:C.textSec,textTransform:'uppercase',letterSpacing:'0.5px'}}>{tb.name} — Gear {tb.gear_ratio.label}</div>
      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
        {result&&<div style={{fontSize:'10px',color:C.textSec}}>max <b style={{color:C.text}}>{result.max_dut_speed_rpm} rpm</b> · <b style={{color:C.text}}>{result.max_dut_torque_nm} Nm</b></div>}
        {badge&&<span style={{fontSize:'9px',padding:'2px 8px',borderRadius:'20px',background:badge.bg,color:badge.c,fontWeight:500}}>{badge.t}</span>}
      </div>
    </div>
    <div style={{padding:'8px 14px 14px',background:C.bg,position:'relative',overflowX:'auto'}}>
      <div style={{position:'absolute',left:14,right:14,top:'46%',height:'7px',background:'#B4B2A9',borderRadius:'4px',zIndex:0}}/>
      <div style={{position:'absolute',left:14,right:14,top:'44%',height:'2px',background:'#D3D1C7',borderRadius:'1px',zIndex:0}}/>
      <div style={{display:'flex',alignItems:'center',gap:0}}>
        <Node icon={<SvgActuator/>} label={actName} lc={C.redDk} sub={`${actPeak} Nm pk`}/>
        <Gap/><Node icon={<SvgCoupling/>} label="Coupling" lc={C.gray}/>
        <Gap/><Node icon={<SvgSensor nm={tb.torque_sensor.max_torque_nm}/>} label={tb.torque_sensor.name} lc={C.redDk} sub={`${tb.torque_sensor.max_torque_nm} Nm`} swap onSwap={()=>onSwap('sensor')}/>
        <Gap/><Node icon={<SvgCoupling/>} label="Coupling" lc={C.gray}/>
        <Gap/><Node icon={<SvgGear label={tb.gear_ratio.label}/>} label={`Gear ${tb.gear_ratio.label}`} lc="#3C3489" sub={`×${tb.gear_ratio.ratio}`} swap onSwap={()=>onSwap('gear')}/>
        <Gap/><Node icon={<SvgLM/>} label={tb.load_machine.name} lc={C.green} sub={`${tb.load_machine.rated_power_w}W`} swap onSwap={()=>onSwap('lm')}/>
      </div>
      <div style={{height:'5px',background:'#B4B2A9',borderRadius:'2px',margin:'4px 0 0'}}/>
      <div style={{height:'2px',background:'#888780',borderRadius:'2px',margin:'1px 0 0'}}/>
    </div>
  </div>
}

function SwapModal({type,components,onSelect,onClose}:{type:'sensor'|'gear'|'lm'|null;components:Components|null;onSelect:(id:number)=>void;onClose:()=>void}) {
  if(!type||!components)return null
  const items=type==='sensor'?components.torque_sensors:type==='gear'?components.gear_ratios:components.load_machines
  return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
    <div style={{background:C.bg,borderRadius:'12px',border:`0.5px solid ${C.border}`,padding:'20px',minWidth:'280px',maxWidth:'360px'}} onClick={e=>e.stopPropagation()}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
        <div style={{fontSize:'14px',fontWeight:500}}>Swap {type}</div>
        <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:'20px',color:C.textSec,lineHeight:1}}>×</button>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
        {(items as any[]).map((item:any)=><button key={item.id} onClick={()=>{onSelect(item.id);onClose()}} style={{padding:'10px 12px',borderRadius:'8px',border:`0.5px solid ${C.border}`,background:C.bg,cursor:'pointer',textAlign:'left',width:'100%',display:'flex',flexDirection:'column',gap:'2px'}}>
          <div style={{fontSize:'13px',fontWeight:500}}>{item.name??item.label}</div>
          <div style={{fontSize:'11px',color:C.textSec}}>
            {type==='sensor'&&`${item.max_torque_nm} Nm · ${item.bidirectional?'bidirectional':'unidirectional'}`}
            {type==='gear'&&`Ratio ×${item.ratio}`}
            {type==='lm'&&`${item.rated_power_w}W · ${item.peak_torque_nm} Nm peak · ${item.max_speed_rpm} rpm`}
          </div>
        </button>)}
      </div>
    </div>
  </div>
}

function NewTB({components,onCreated}:{components:Components|null;onCreated:()=>void}) {
  const [open,setOpen]=useState(false)
  const [name,setName]=useState('')
  const [lmId,setLmId]=useState<number|null>(null)
  const [gearId,setGearId]=useState<number|null>(null)
  const [sensorId,setSensorId]=useState<number|null>(null)
  const [saving,setSaving]=useState(false)
  if(!open)return<button onClick={()=>setOpen(true)} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',padding:'10px',borderRadius:'10px',border:`1.5px dashed ${C.border}`,background:'transparent',cursor:'pointer',fontSize:'12px',color:C.textSec,width:'100%'}}>+ New Testbench</button>
  const canSave=!!(name&&lmId&&gearId&&sensorId)
  const save=async()=>{if(!canSave)return;setSaving(true);try{await fetch('/api/testbenches',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,load_machine_id:lmId,gear_ratio_id:gearId,torque_sensor_id:sensorId})});setOpen(false);setName('');setLmId(null);setGearId(null);setSensorId(null);onCreated()}finally{setSaving(false)}}
  return<div style={{border:`1.5px dashed ${C.border}`,borderRadius:'12px',padding:'14px',background:C.bgSec}}>
    <div style={{fontSize:'11px',fontWeight:500,color:C.textSec,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'10px'}}>New Testbench</div>
    <div style={{marginBottom:'8px'}}>
      <div style={{fontSize:'10px',color:C.textSec,marginBottom:'3px'}}>Name</div>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Testbench 4" style={{width:'100%',padding:'5px 8px',borderRadius:'6px',border:`0.5px solid ${C.border}`,background:C.bg,fontSize:'12px'}}/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'6px',marginBottom:'10px'}}>
      {([['Load machine',lmId,setLmId,(components?.load_machines??[]).map((l:any)=>({id:l.id,label:l.name,sub:`${l.rated_power_w}W`}))],['Gear',gearId,setGearId,(components?.gear_ratios??[]).map((g:any)=>({id:g.id,label:g.label,sub:`×${g.ratio}`}))],['Sensor',sensorId,setSensorId,(components?.torque_sensors??[]).map((s:any)=>({id:s.id,label:s.name,sub:`${s.max_torque_nm}Nm`}))]] as any[]).map(([lbl,val,setter,opts]:any)=><div key={lbl}>
        <div style={{fontSize:'10px',color:C.textSec,marginBottom:'3px'}}>{lbl}</div>
        <select value={val??''} onChange={e=>setter(Number(e.target.value))} style={{width:'100%',padding:'5px 6px',borderRadius:'6px',border:`0.5px solid ${C.border}`,background:C.bg,fontSize:'11px'}}>
          <option value="">—</option>
          {opts.map((o:any)=><option key={o.id} value={o.id}>{o.label} ({o.sub})</option>)}
        </select>
      </div>)}
    </div>
    <div style={{display:'flex',gap:'6px'}}>
      <button onClick={()=>setOpen(false)} style={{flex:1,padding:'6px',borderRadius:'6px',border:`0.5px solid ${C.border}`,background:'none',cursor:'pointer',fontSize:'12px'}}>Cancel</button>
      <button onClick={save} disabled={!canSave||saving} style={{flex:2,padding:'6px',borderRadius:'6px',border:'none',background:canSave?C.red:'#ccc',color:'white',cursor:canSave?'pointer':'default',fontSize:'12px',fontWeight:500}}>{saving?'Saving...':'Create'}</button>
    </div>
  </div>
}

export default function App() {
  const [components,setComponents]=useState<Components|null>(null)
  const [testbenches,setTestbenches]=useState<Testbench[]>([])
  const [selected,setSelected]=useState<Actuator|null>(null)
  const [testTorque,setTestTorque]=useState(45)
  const [testSpeed,setTestSpeed]=useState(150)
  const [results,setResults]=useState<CompatibilityResponse|null>(null)
  const [loading,setLoading]=useState(false)
  const [swapModal,setSwapModal]=useState<{tbId:number;type:'sensor'|'gear'|'lm'}|null>(null)
  const deb=useRef<ReturnType<typeof setTimeout>>()

  const load=useCallback(async()=>{
    const[comps,tbs]=await Promise.all([api.getComponents(),api.getTestbenches()])
    setComponents(comps);setTestbenches(tbs)
    if(!selected&&comps.actuators.length){const a=comps.actuators[0];setSelected(a);setTestTorque(Math.round(a.peak_torque_nm*0.7))}
  },[selected])

  useEffect(()=>{load()},[])

  const check=useCallback(async(t:number,s:number)=>{if(t<=0||s<=0)return;setLoading(true);try{setResults(await api.checkCompatibility(t,s))}finally{setLoading(false)}},[])
  useEffect(()=>{clearTimeout(deb.current);deb.current=setTimeout(()=>check(testTorque,testSpeed),400)},[testTorque,testSpeed])

  const handleSwap=async(tbId:number,type:'sensor'|'gear'|'lm',itemId:number)=>{
    const tb=testbenches.find(t=>t.id===tbId);if(!tb)return
    await fetch(`/api/testbenches/${tbId}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:tb.name,load_machine_id:type==='lm'?itemId:tb.load_machine.id,gear_ratio_id:type==='gear'?itemId:tb.gear_ratio.id,torque_sensor_id:type==='sensor'?itemId:tb.torque_sensor.id})})
    load()
  }

  const peak=selected?.peak_torque_nm??testTorque
  const name=selected?.name??'Custom DUT'

  return<div style={{display:'grid',gridTemplateColumns:'210px 1fr',gridTemplateRows:'50px 1fr auto',minHeight:'100vh',background:C.bgSec}}>
    <div style={{gridColumn:'1/-1',background:C.bg,borderBottom:`0.5px solid ${C.border}`,display:'flex',alignItems:'center',padding:'0 18px',gap:'12px'}}>
      <div style={{fontSize:'15px',fontWeight:500,letterSpacing:'-0.3px'}}><span style={{color:C.red}}>Syn</span>apticon — Testbench Selector</div>
      <div style={{fontSize:'10px',color:C.textSec}}>click × to swap component</div>
      {loading&&<div style={{marginLeft:'auto',fontSize:'11px',color:C.textSec}}>calculating...</div>}
    </div>

    <div style={{background:C.bg,borderRight:`0.5px solid ${C.border}`,padding:'12px',display:'flex',flexDirection:'column',gap:'12px',overflowY:'auto'}}>
      <div>
        <SL_Label>Actuator (DUT)</SL_Label>
        <select value={selected?String(selected.id):'__custom__'} onChange={e=>{if(e.target.value==='__custom__'){setSelected(null);return};const a=components?.actuators.find(a=>String(a.id)===e.target.value)??null;setSelected(a);if(a){setTestTorque(Math.round(a.peak_torque_nm*0.7));setTestSpeed(150)}}} style={{width:'100%',padding:'6px 8px',borderRadius:'8px',border:`0.5px solid ${C.border}`,background:C.bg,fontSize:'12px'}}>
          {components?.actuators.map(a=><option key={a.id} value={String(a.id)}>{a.name}</option>)}
          <option value="__custom__">— custom —</option>
        </select>
        {selected&&<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'4px',marginTop:'6px'}}>
          {([['Nm rated',selected.rated_torque_nm,false],['Nm peak',selected.peak_torque_nm,true],['rpm',selected.max_speed_rpm,false]] as any[]).map(([l,v,r]:any)=><div key={l} style={{background:C.bgSec,borderRadius:'6px',padding:'4px',textAlign:'center',border:`0.5px solid ${C.border}`}}><div style={{fontSize:'14px',fontWeight:500,color:r?'#A32D2D':C.text}}>{v}</div><div style={{fontSize:'8px',color:C.textSec}}>{l}</div></div>)}
        </div>}
        {selected&&selected.notes&&<div style={{fontSize:'9px',color:C.textSec,marginTop:'5px',lineHeight:1.4}}>{selected.notes}</div>}
      </div>

      <div style={{borderTop:`0.5px solid ${C.border}`,paddingTop:'12px'}}>
        <SL_Label>Test parameters</SL_Label>
        {([['Peak torque [Nm]',testTorque,setTestTorque,selected?testTorque>selected.peak_torque_nm:false],['Speed [rpm]',testSpeed,setTestSpeed,selected?testSpeed>selected.max_speed_rpm:false]] as any[]).map(([l,v,s,w]:any)=><div key={l} style={{marginBottom:'6px'}}>
          <div style={{fontSize:'10px',color:C.textSec,marginBottom:'3px'}}>{l}</div>
          <input type="number" min={0} value={v} onChange={e=>{const n=parseFloat(e.target.value);if(!isNaN(n))s(n)}} style={{width:'100%',padding:'5px 8px',borderRadius:'7px',border:`0.5px solid ${w?'#E24B4A':C.border}`,background:C.bg,fontSize:'12px'}}/>
          {w&&<div style={{fontSize:'9px',color:'#E24B4A',marginTop:'2px'}}>⚠ exceeds actuator limit</div>}
        </div>)}
      </div>

      <div style={{borderTop:`0.5px solid ${C.border}`,paddingTop:'12px'}}>
        <SL_Label>Component library</SL_Label>
        {[['Gearboxes',components?.gear_ratios,'gear'],['Sensors',components?.torque_sensors,'sensor'],['Load machines',components?.load_machines,'lm']].map(([title,items,_type]:any)=><div key={title} style={{marginBottom:'8px'}}>
          <div style={{fontSize:'9px',color:C.textSec,marginBottom:'3px'}}>{title}</div>
          {(items??[]).map((item:any)=><div key={item.id} style={{display:'flex',alignItems:'center',gap:'6px',padding:'4px 7px',borderRadius:'6px',border:`0.5px solid ${C.border}`,background:C.bg,fontSize:'10px',marginBottom:'2px'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',flexShrink:0,background:_type==='gear'?C.purple:_type==='sensor'?C.red:C.green}}/>
            <div><div style={{fontWeight:500,color:_type==='gear'?C.purple:_type==='sensor'?C.red:C.green}}>{item.name??item.label}</div><div style={{fontSize:'9px',color:C.textSec}}>{_type==='gear'?`×${item.ratio}`:_type==='sensor'?`${item.max_torque_nm} Nm`:`${item.rated_power_w}W`}</div></div>
          </div>)}
        </div>)}
      </div>
    </div>

    <div style={{display:'flex',flexDirection:'column',overflowY:'auto'}}>
      <div style={{flex:1,padding:'14px 18px',display:'flex',flexDirection:'column',gap:'12px'}}>
        {testbenches.map(tb=>{
          const result=results?.results.find(r=>r.testbench_id===tb.id)
          const isBest=tb.id===results?.best_fit_id
          return<Chain key={tb.id} tb={tb} actName={name} actPeak={peak} result={result} isBest={isBest} onSwap={type=>setSwapModal({tbId:tb.id,type})}/>
        })}
        <NewTB components={components} onCreated={load}/>
      </div>

      {results&&<div style={{borderTop:`0.5px solid ${C.border}`,padding:'12px 18px',background:C.bg}}>
        <div style={{fontSize:'9px',fontWeight:500,color:C.textSec,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:'8px'}}>Compatibility — {testTorque} Nm · {testSpeed} rpm</div>
        <div style={{display:'grid',gridTemplateColumns:`repeat(${Math.max(testbenches.length,1)},1fr)`,gap:'8px'}}>
          {results.results.map(r=>{
            const isBest=r.testbench_id===results.best_fit_id;const ok=r.compatible
            const bc=!ok?'#F09595':isBest?C.green:'#97C459'
            const bg=!ok?'#FCEBEB':isBest?C.greenLt:C.bg
            return<div key={r.testbench_id} style={{borderRadius:'8px',border:`${isBest?2:0.5}px solid ${bc}`,background:bg,padding:'8px 10px'}}>
              <div style={{fontSize:'11px',fontWeight:500,marginBottom:'4px'}}>{r.testbench_name}</div>
              {[['max speed',`${r.max_dut_speed_rpm} rpm`,!ok&&r.limiting_factor==='speed'],['max torque',`${r.max_dut_torque_nm} Nm`,!ok&&r.limiting_factor==='torque'],['LM speed',`${r.lm_speed_at_test} rpm (${r.lm_speed_utilization_pct.toFixed(0)}%)`,false],['LM torque',`${r.lm_torque_at_test} Nm`,false]].map(([l,v,w]:any)=><div key={l} style={{fontSize:'10px',color:C.textSec}}>{l} <b style={{color:w?'#A32D2D':C.text,fontWeight:500}}>{v}</b></div>)}
            </div>
          })}
        </div>
      </div>}
    </div>

    {swapModal&&<SwapModal type={swapModal.type} components={components} onSelect={id=>handleSwap(swapModal.tbId,swapModal.type,id)} onClose={()=>setSwapModal(null)}/>}
  </div>
}

function SL_Label({children}:{children:React.ReactNode}) {
  return<div style={{fontSize:'9px',fontWeight:500,color:'var(--color-text-secondary)',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:'5px'}}>{children}</div>
}
