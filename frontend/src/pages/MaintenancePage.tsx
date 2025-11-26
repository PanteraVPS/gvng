import React, { useEffect, useState } from 'react'

interface Props {
  title?: string
  message?: string
}

export default function MaintenancePage({ title, message }: Props) {
  let t = title
  let m = message
  let bg: string | null = null
  let ov = 0.65
  try {
    if (!t) t = localStorage.getItem('maintenance.title') || "We'll be back soon"
    if (!m) m = localStorage.getItem('maintenance.message') || 'We are performing scheduled maintenance. Please check back shortly.'
    bg = localStorage.getItem('maintenance.bg')
    const ro = parseFloat(localStorage.getItem('maintenance.overlay') || '0.65')
    if (!isNaN(ro)) ov = Math.max(0, Math.min(0.9, ro))
  } catch {}

  const hasBg = !!(bg && (/^https:\/\//i.test(bg) || /^data:/i.test(bg)))
  const [fade, setFade] = useState(0)
  const [, setTick] = useState(0)
  useEffect(() => { const t = setTimeout(()=>setFade(1), 20); return ()=>clearTimeout(t) }, [bg])
  useEffect(() => {
    const onUpd = () => {
      setFade(0)
      setTick(v => v + 1)
      setTimeout(() => setFade(1), 20)
    }
    window.addEventListener('maintenanceUpdated', onUpd as EventListener)
    window.addEventListener('storage', onUpd)
    return () => {
      window.removeEventListener('maintenanceUpdated', onUpd as EventListener)
      window.removeEventListener('storage', onUpd)
    }
  }, [])
  const topA = ov
  const botA = Math.max(0, Math.min(0.95, ov * 0.92))
  const wrapperStyle: React.CSSProperties = hasBg
    ? {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        background: `linear-gradient(180deg, rgba(0,0,0,${topA}) 0%, rgba(0,0,0,${botA}) 100%), url(${bg}) center/cover no-repeat fixed`,
        opacity: fade,
        transition: 'opacity .35s ease'
      }
    : { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 16px', background:'#0b0b0b' }

  return (
    <div style={wrapperStyle}>
      <div style={{ width:'min(820px, 96vw)', background:'rgba(14,14,15,0.88)', border:'1px solid #222', borderRadius:16, padding:24, textAlign:'center', boxShadow:'0 12px 32px rgba(0,0,0,0.45)' }}>
        <div style={{ fontSize:48, lineHeight:1, marginBottom:8 }}>🛠️</div>
        <h1 style={{ margin:'0 0 8px' }}>{t}</h1>
        <p style={{ margin:'0 0 16px', opacity:0.85 }}>{m}</p>
        <div style={{ fontSize:12, opacity:0.6, marginBottom:16 }}>Thank you for your patience.</div>
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <a href="/" style={btnPrimary}>Refresh</a>
        </div>
      </div>
    </div>
  )
}

const btnPrimary: React.CSSProperties = {
  background: 'linear-gradient(180deg, #EEFF3A 0%, #D4F000 100%)',
  color: '#0b0b0b',
  fontWeight: 800,
  border: '1px solid #B5D200',
  borderRadius: 10,
  padding: '11px 20px',
  cursor: 'pointer',
  letterSpacing: 0.3,
  boxShadow: '0 8px 16px rgba(230,255,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
  textDecoration: 'none'
}

// miniBtn removed since Admin button was removed
