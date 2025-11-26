export default function PrivacyPolicyPage() {
  const updated = new Date().toLocaleDateString()
  return (
    <div className="static-page">
      <div className="page-header">
        <h1>PRIVACY POLICY</h1>
        <p>Last updated: {updated}</p>
      </div>

      <div className="static-container">
        <section>
          <h2>Overview</h2>
          <p>
            This policy explains how GVNG ("we", "our") collects, uses, and protects
            your personal information when you shop on our site.
          </p>
        </section>

        <section>
          <h2>Data We Collect</h2>
          <ul>
            <li>Order details (items, amount, delivery info)</li>
            <li>Contact information (name, email, address, phone)</li>
            <li>Technical data (device, browser, analytics)</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Data</h2>
          <ul>
            <li>To process orders and provide support</li>
            <li>To improve site performance and user experience</li>
            <li>To prevent fraud and ensure secure payments</li>
          </ul>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            We use cookies for cart functionality, session management, and analytics.
            You can control cookies in your browser settings.
          </p>
        </section>

        <section>
          <h2>Third‑Party Services</h2>
          <p>
            Payment processing is handled by trusted providers. We never store full
            card numbers on our servers.
          </p>
        </section>

        <section>
          <h2>Your Rights</h2>
          <p>
            You can request access, correction, or deletion of your personal data by
            contacting us at privacy@gvng.com.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>Email: privacy@gvng.com</p>
        </section>
      </div>
    </div>
  )
}
