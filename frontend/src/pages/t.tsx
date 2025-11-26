import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useCart, CartItem } from '../utils/useCart'

type Address = {
  street: string
  city: string
  county: string
  postalCode: string
}

const initialAddress: Address = {
  street: "",
  city: "",
  county: "",
  postalCode: "",
}

const CheckoutPage: React.FC = () => {
  const { cart, getTotalPrice, clearCart } = useCart()
  const navigate = useNavigate()

  const [shipping, setShipping] = useState<Address>(initialAddress)
  const [billing, setBilling] = useState<Address>(initialAddress)
  const [sameBilling, setSameBilling] = useState(true)
  const [payment, setPayment] = useState<"card" | "cod">("cod")

  const subTotal = useMemo(() => getTotalPrice(), [cart, getTotalPrice])
  const shippingBase = subTotal > 100 ? 0 : 10
  const total = subTotal + shippingBase
  const hasItems = cart.length > 0

  const onPlaceOrder = (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasItems) {
      alert("Coșul este gol!")
      navigate("/products")
      return
    }

    if (!shipping.street.trim() || !shipping.city.trim() || !shipping.county.trim() || !shipping.postalCode.trim()) {
      alert("Completează toate câmpurile pentru adresa de livrare.")
      return
    }

    if (!sameBilling) {
      if (!billing.street.trim() || !billing.city.trim() || !billing.county.trim() || !billing.postalCode.trim()) {
        alert("Completează toate câmpurile pentru adresa de facturare.")
        return
      }
    }

    clearCart()
    navigate("/success")
  }

  return (
    <div style={{ background: "#0b0b0b", minHeight: "100vh", padding: "40px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", background: "#141414", padding: 32, borderRadius: 12, color: "#fff" }}>
        <h1 style={{ marginBottom: 20, fontSize: 28 }}>Finalizare comandă</h1>

        {!hasItems && (
          <p style={{ marginBottom: 24 }}>
            Coșul tău este gol.{" "}
            <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("/products")}>
              Vezi produse
            </span>
          </p>
        )}

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <form onSubmit={onPlaceOrder} style={{ flex: 1 }}>
            <fieldset style={{ border: "1px solid #333", padding: 16, marginBottom: 24 }}>
              <legend style={{ padding: "0 8px" }}>Adresa de livrare</legend>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input value={shipping.street} onChange={(e) => setShipping({ ...shipping, street: e.target.value })} placeholder="Strada" style={{ padding: 12, borderRadius: 6, border: "1px solid #333", background: "#1c1c1c", color: "#fff" }} />
                <input value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} placeholder="Oraș" style={{ padding: 12, borderRadius: 6, border: "1px solid #333", background: "#1c1c1c", color: "#fff" }} />
                <input value={shipping.county} onChange={(e) => setShipping({ ...shipping, county: e.target.value })} placeholder="Județ / Sector" style={{ padding: 12, borderRadius: 6, border: "1px solid #333", background: "#1c1c1c", color: "#fff" }} />
                <input value={shipping.postalCode} onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })} placeholder="Cod poștal" style={{ padding: 12, borderRadius: 6, border: "1px solid #333", background: "#1c1c1c", color: "#fff" }} />
              </div>
            </fieldset>

            <fieldset style={{ border: "1px solid #333", padding: 16, marginBottom: 24 }}>
              <legend style={{ padding: "0 8px" }}>Adresa de facturare</legend>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <input type="checkbox" checked={sameBilling} onChange={(e) => setSameBilling(e.target.checked)} />
                <span>Folosește aceeași adresă ca la livrare</span>
              </label>
              {!sameBilling && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input value={billing.street} onChange={(e) => setBilling({ ...billing, street: e.target.value })} placeholder="Strada" style={{ padding: 12, borderRadius: 6, border: "1px solid #333", background: "#1c1c1c", color: "#fff" }} />
                  <input value={billing.city} onChange={(e) => setBilling({ ...billing, city: e.target.value })} placeholder="Oraș" style={{ padding: 12, borderRadius: 6, border: "1px solid #333", background: "#1c1c1c", color: "#fff" }} />
                  <input value={billing.county} onChange={(e) => setBilling({ ...billing, county: e.target.value })} placeholder="Județ / Sector" style={{ padding: 12, borderRadius: 6, border: "1px solid #333", background: "#1c1c1c", color: "#fff" }} />
                  <input value={billing.postalCode} onChange={(e) => setBilling({ ...billing, postalCode: e.target.value })} placeholder="Cod poștal" style={{ padding: 12, borderRadius: 6, border: "1px solid #333", background: "#1c1c1c", color: "#fff" }} />
                </div>
              )}
            </fieldset>

            <fieldset style={{ border: "1px solid #333", padding: 16, marginBottom: 24 }}>
              <legend style={{ padding: "0 8px" }}>Metodă de plată</legend>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                <span>Plata la livrare</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name="payment" checked={payment === "card"} onChange={() => setPayment("card")} />
                <span>Card bancar</span>
              </label>
            </fieldset>

            <button type="submit" style={{ padding: "14px 20px", background: "#fff", color: "#000", fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", width: "100%", marginTop: 8 }}>
              Plasează comanda
            </button>
          </form>

          <div style={{ width: 300, background: "#1a1a1a", padding: 20, borderRadius: 10 }}>
            <h2 style={{ fontSize: 22, marginBottom: 16 }}>Rezumat comandă</h2>

            {cart.map((p: CartItem) => (
              <div key={p.product._id + p.size + p.color} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
                <img src={resolveImageUrl(p.product.image)} alt={p.product.name} style={{ width: 60, height: 60, borderRadius: 6, objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <div>{p.product.name}</div>
                  <div style={{ fontSize: 14, opacity: 0.6 }}>{p.product.price} lei</div>
                </div>
              </div>
            ))}

            <hr style={{ borderColor: "#333" }} />
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Subtotal</span>
                <span>{subTotal} lei</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Livrare</span>
                <span>{shippingBase === 0 ? "Gratuit" : `${shippingBase} lei`}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontWeight: 700, fontSize: 18 }}>
                <span>Total</span>
                <span>{total} lei</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage

function resolveImageUrl(url?: string) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  if (url.startsWith('/uploads/')) return `${import.meta.env.PROD ? '' : 'http://localhost:5000'}${url}`
  return url
}
