import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import './safe-header.css'
import HomePage from './pages/HomePage'
import AdminPanel from './pages/AdminPanel'
import ProductsPage from './pages/ProductsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AboutPage from './pages/AboutPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsPage from './pages/TermsPage'
import MaintenancePage from './pages/MaintenancePage.tsx'
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import CookieConsent from './components/CookieConsent'
import visaLogo from './assets/visa.svg'
import mcLogo from './assets/mastercard.svg'
import paypalLogo from './assets/paypal.svg'
import { useCart } from './utils/useCart';
import { useLanguage } from './utils/LanguageContext';
import { getCurrentUser, logout as authLogout } from './services/authService';

function App() {
  const { cart } = useCart();
  const { t } = useLanguage();
  const cartCount = cart.length;
  const user = getCurrentUser();
  const [social, setSocial] = useState({ instagram: '#', facebook: '#', twitter: '#' })
  const [maintenance, setMaintenance] = useState<{ enabled: boolean; title: string; message: string }>({ enabled:false, title:"We'll be back soon", message:'We are performing scheduled maintenance. Please check back shortly.' })
  const [anpc, setAnpc] = useState<{ url: string; icon: string; text: string }>({ url: '', icon: '', text: 'ANPC' })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const isHttpsUrl = (val?: string) => {
    if (!val) return false
    try {
      const u = new URL(val)
      return u.protocol === 'https:'
    } catch {
      return false
    }
  }

  const loadSocial = () => {
    try {
      const instagram = localStorage.getItem('social.instagram') || '#'
      const facebook = localStorage.getItem('social.facebook') || '#'
      const twitter = localStorage.getItem('social.twitter') || '#'
      setSocial({ instagram, facebook, twitter })
    } catch {
      setSocial({ instagram: '#', facebook: '#', twitter: '#' })
    }
  }

  useEffect(() => {
    loadSocial()
    const onUpdate = () => loadSocial()
    window.addEventListener('socialLinksUpdated', onUpdate as any)
    return () => window.removeEventListener('socialLinksUpdated', onUpdate as any)
  }, [])

  const loadAnpc = () => {
    try {
      const url = localStorage.getItem('anpc.url') || ''
      const icon = localStorage.getItem('anpc.icon') || ''
      const text = localStorage.getItem('anpc.text') || 'ANPC'
      setAnpc({ url, icon, text })
    } catch {
      setAnpc({ url: '', icon: '', text: 'ANPC' })
    }
  }

  useEffect(() => {
    loadAnpc()
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('anpc.')) loadAnpc()
    }
    const onCustom = () => loadAnpc()
    window.addEventListener('storage', onStorage)
    window.addEventListener('anpcUpdated', onCustom as any)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('anpcUpdated', onCustom as any)
    }
  }, [])

  useEffect(() => {
    const loadMaint = () => {
      try {
        const enabled = (localStorage.getItem('maintenance.enabled') || 'false') === 'true'
        const title = localStorage.getItem('maintenance.title') || "We'll be back soon"
        const message = localStorage.getItem('maintenance.message') || 'We are performing scheduled maintenance. Please check back shortly.'
        setMaintenance({ enabled, title, message })
      } catch {
        setMaintenance(m=>({ ...m, enabled:false }))
      }
    }
    loadMaint()
    const onUpdate = () => loadMaint()
    window.addEventListener('maintenanceUpdated', onUpdate as any)
    return () => window.removeEventListener('maintenanceUpdated', onUpdate as any)
  }, [])

  return (
    <Router>
      <div className="app-container">

        {/* NAVBAR */}
        <nav className="navbar">
          <div className="nav-container">

            {/* LOGO left */}
            <Link to="/" className="logo">
              <span className="logo-icon">🛡️</span>
              <span className="logo-text">GVNG</span>
            </Link>

            {/* CENTER MENU */}
            <div className="nav-menu desktop-menu"
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "32px"
              }}>
              <Link to="/" className="nav-link">{t('home')}</Link>
              <Link to="/products" className="nav-link">{t('collection')}</Link>
              <Link to="/cart" className="nav-link cart-link">
                {t('cart')}
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            </div>

            {/* LANGUAGE SWITCHER REMOVED */}

            {/* MENU RIGHT */}
            <button className="menu-toggle" onClick={toggleMenu} style={{ marginLeft: "auto" }}>
              ☰
            </button>

            {/* MOBILE MENU - ONLY LOGIN/REGISTER */}
            {isMenuOpen && (
              <div className="mobile-menu">
                {user ? (
                  <>
                    <Link to="/profile" className="nav-link" onClick={toggleMenu}>{t('profile') || 'Profil'}</Link>
                    <button className="nav-link" style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', width: '100%', textAlign: 'center', padding: '15px 0', borderBottom: '1px solid var(--border)' }}
                      onClick={() => { authLogout(); window.location.reload(); }}>
                      {t('logout') || 'Logout'}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="nav-link" onClick={toggleMenu}>{t('login')}</Link>
                    <Link to="/register" className="nav-link" onClick={toggleMenu}>{t('register')}</Link>
                  </>
                )}
              </div>
            )}

          </div>
        </nav>

        <CookieConsent />

        <main className="main-content">
          <Routes>
            <Route path="/" element={maintenance.enabled ? <MaintenancePage title={maintenance.title} message={maintenance.message} /> : <HomePage />} />
            <Route path="/products" element={maintenance.enabled ? <MaintenancePage title={maintenance.title} message={maintenance.message} /> : <ProductsPage />} />
            <Route path="/cart" element={maintenance.enabled ? <MaintenancePage title={maintenance.title} message={maintenance.message} /> : <CartPage />} />
            <Route path="/about" element={maintenance.enabled ? <MaintenancePage title={maintenance.title} message={maintenance.message} /> : <AboutPage />} />
            <Route path="/privacy" element={maintenance.enabled ? <MaintenancePage title={maintenance.title} message={maintenance.message} /> : <PrivacyPolicyPage />} />
            <Route path="/terms" element={maintenance.enabled ? <MaintenancePage title={maintenance.title} message={maintenance.message} /> : <TermsPage />} />
            <Route path="/checkout" element={maintenance.enabled ? <MaintenancePage title={maintenance.title} message={maintenance.message} /> : <CheckoutPage />} />
            <Route path="/maintenance" element={<MaintenancePage title={maintenance.title} message={maintenance.message} />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-container">
            <div className="footer-section">
              <h4>ABOUT</h4>
              <p>Premium quality clothing and accessories for the modern lifestyle.</p>
              <div className="social-links" style={{ display:'flex', gap:12 }}>

                {isHttpsUrl(social.instagram) && (
                  <a href={social.instagram} target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                    Instagram
                  </a>
                )}

                {isHttpsUrl(social.facebook) && (
                  <a href={social.facebook} target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                    Facebook
                  </a>
                )}

                {isHttpsUrl(social.twitter) && (
                  <a href={social.twitter} target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                    Twitter
                  </a>
                )}

              </div>
            </div>

            <div className="footer-section">
              <h4>CUSTOMER CARE</h4>
              <ul>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Shipping Info</a></li>
                <li><a href="#">Returns Policy</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>INFORMATION</h4>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms & Conditions</Link></li>
                <li><a href="#">Size Guide</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>CONTACT</h4>
              <p>Email: info@gvng.com</p>
              <p>Phone: 0000</p>
              <p>Address: 123 Fashion St, NY 10001</p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 GVNG. All rights reserved.</p>
            <div className="payment-methods" style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
              <img src={visaLogo} alt="Visa" height={24} />
              <img src={mcLogo} alt="Mastercard" height={24} />
              <img src={paypalLogo} alt="PayPal" height={24} />

              {(() => {
                const hasValidUrl = !!anpc.url && (anpc.url.startsWith('http://') || anpc.url.startsWith('https://'))
                const href = hasValidUrl ? anpc.url : 'https://anpc.ro'
                const hasIcon = !!anpc.icon && (anpc.icon.startsWith('http://') || anpc.icon.startsWith('https://') || anpc.icon.startsWith('data:'))
                const src = hasIcon ? anpc.icon : '/anpc-sal.svg'
                return (
                  <a href={href} title={anpc.text || 'ANPC'} target="_blank" rel="noreferrer">
                    <img src={src} alt={anpc.text || 'ANPC'} height={24} />
                  </a>
                )
              })()}
            </div>
          </div>
        </footer>

        {/* Floating admin gear */}
        <Link
          to="/admin"
          title="Admin"
          aria-label="Admin"
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            width: 54,
            height: 54,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(27,27,27,0.92)',
            color: '#CFFF04',
            border: '2px solid #333',
            borderRadius: '50%',
            boxShadow: '0 0 16px 2px #CFFF0480, 0 6px 18px rgba(0,0,0,0.35)',
            zIndex: 3000,
            cursor: 'pointer',
          }}
        >
          ⚙️
        </Link>

      </div>
    </Router>
  )
}

export default App
