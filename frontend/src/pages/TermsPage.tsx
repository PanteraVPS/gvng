import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 16px' }}>
      <div style={{ background:'#0e0e0f', border:'1px solid #222', borderRadius:12, padding:24 }}>
        <h1 style={{ marginTop:0 }}>Terms & Conditions</h1>
        <p style={{ opacity:0.8 }}>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          Welcome to GVNG. By accessing or using our website, you agree to be bound by these Terms & Conditions. 
          Please read them carefully.
        </p>
        <h3>Purchases</h3>
        <p>All purchases are subject to availability and our acceptance. Prices are displayed in your local currency when available.</p>
        <h3>Returns</h3>
        <p>Items may be returned according to our Returns Policy. Items must be unused and in original packaging.</p>
        <h3>Privacy & Cookies</h3>
        <p>
          We use cookies to improve your experience. For details on how we process your personal data, please see our <Link to="/privacy">Privacy Policy</Link>.
        </p>
        <h3>Contact</h3>
        <p>For questions about these terms, contact us at info@gvng.com.</p>
      </div>
    </div>
  )
}
