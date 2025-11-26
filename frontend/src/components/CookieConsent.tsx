import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const v = localStorage.getItem('cookieConsent')
      if (!v) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const setConsent = (status: 'accepted' | 'declined') => {
    try {
      localStorage.setItem('cookieConsent', status)
      localStorage.setItem('cookieConsentAt', new Date().toISOString())
      document.cookie = `cookieConsent=${status}; path=/; max-age=${60 * 60 * 24 * 365}`
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{ position:'fixed', left:16, right:16, bottom:16, zIndex: 9999 }}>
      <div style={{
        background:'rgba(18,18,20,0.88)',
        border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:20,
        padding:16,
        boxShadow:'0 12px 34px rgba(0,0,0,0.5)',
        backdropFilter:'blur(10px) saturate(130%)',
        WebkitBackdropFilter:'blur(10px) saturate(130%)',
      }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:12 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontWeight:800, fontSize:16 }}>
              <span role="img" aria-label="cookie">🍪</span>
              <span>We use cookies</span>
            </div>
            <div style={{ opacity:0.85, fontSize:15, lineHeight:1.5 }}>
              We use cookies to enhance your experience and analyze traffic. Read our <Link to="/privacy" style={{ color:'#9bd0ff' }}>Privacy Policy</Link> and <Link to="/terms" style={{ color:'#9bd0ff' }}>Terms</Link>.
            </div>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', flexWrap:'wrap' }}>
            <button onClick={() => setConsent('declined')} style={btnMuted}>Decline</button>
            <button onClick={() => setConsent('accepted')} style={btnPrimary}>Accept</button>
          </div>
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
  borderRadius: 999,
  padding: '10px 18px',
  cursor: 'pointer',
  boxShadow: '0 0 0 3px rgba(230,255,0,0.10) inset'
}
const btnMuted: React.CSSProperties = {
  background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)',
  color: '#eaeaea',
  border: '1px solid #2d2d2d',
  borderRadius: 999,
  padding: '10px 18px',
  cursor: 'pointer',
  opacity: 0.9
}
