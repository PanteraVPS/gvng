import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../utils/useCart'

type Address = {
  strada: string
  City: string
  stateCounty: string
  codPostal: string
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, getTotalPrice, clearCart } = useCart()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [livrare, setLivrare] = useState<Address>({ strada: '', City: '', stateCounty: '', codPostal: '' })
  const [sameBilling, setSameBilling] = useState(true)
  const [facturare, setFacturare] = useState<Address>({ strada: '', City: '', stateCounty: '', codPostal: '' })
  const [payment, setPayment] = useState<'card'|'cod'>('cod')

  const subTotal = useMemo(() => getTotalPrice(), [getTotalPrice, cart])
  const shippingBase = subTotal > 100 ? 0 : 10
  const shipping = shippingBase
  const Total = subTotal + shipping

  const hasItems = cart.length > 0

  const onPlaceOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasItems) {
      alert('Cosul este gol.')
      navigate('/products')
      return
    }
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      alert('Completeaza Last Name, PreLast Name si Phone.')
      return
    }
    if (!livrare.strada.trim() || !livrare.City.trim() || !livrare.stateCounty.trim() || !livrare.codPostal.trim()) {
      alert('Completeaza toate campurile la Delivery Address.')
      return
    }
    if (!sameBilling) {
      if (!facturare.strada.trim() || !facturare.City.trim() || !facturare.stateCounty.trim() || !facturare.codPostal.trim()) {
        alert('Completeaza toate campurile la Address de facturare sau bifeaza "aceeasi ca la livrare".')
        return
      }
    }

    // Placeholder: aici ai integrarea de plata/crearea comenzii
    alert(`✅ Comanda plasata!\nModalitate plata: ${payment === 'cod' ? 'Ramburs' : 'Card'}\nTotal: $${Total.toFixed(2)}`)
    // optional: clear cart
    clearCart()
    navigate('/')
  }

  return (
    <div className="checkout-page" style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Checkout</h1>
        <p style={{ opacity: 0.8 }}>{cart.length} Product(e) in cos</p>
      </div>

      {cart.length === 0 ? (
        <div style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 24 }}>
          <p>Cosul tau este gol.</p>
          <Link to="/products" style={{ color: '#E6FF00', textDecoration: 'none', fontWeight: 700 }}>← Inapoi la Products</Link>
        </div>
      ) : (
        <form onSubmit={onPlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          {/* Coloana Stanga: Formulare */}
          <div style={{ display: 'grid', gap: 18 }}>
            {/* Contact */}
            <section style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Contact Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Last Name</span>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>PreLast Name</span>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} required style={inputStyle} />
                </label>
              </div>
              <label style={{ display: 'grid', gap: 6, marginTop: 12 }}>
                <span>Phone</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" style={inputStyle} />
              </label>
            </section>

            {/* Livrare */}
            <section style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Delivery Address</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Strada, nr., bloc, ap.</span>
                  <input value={livrare.strada} onChange={(e) => setLivrare({ ...livrare, strada: e.target.value })} required style={inputStyle} />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>City</span>
                    <input value={livrare.City} onChange={(e) => setLivrare({ ...livrare, City: e.target.value })} required style={inputStyle} />
                  </label>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>State/County</span>
                    <input value={livrare.stateCounty} onChange={(e) => setLivrare({ ...livrare, stateCounty: e.target.value })} required style={inputStyle} />
                  </label>
                </div>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Postal Code</span>
                  <input value={livrare.codPostal} onChange={(e) => setLivrare({ ...livrare, codPostal: e.target.value })} required style={inputStyle} />
                </label>
              </div>
            </section>

            {/* Shipping */}
            <section style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Shipping</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={radioRowStyle}>
                  <input type="radio" name="shipping" checked readOnly />
                  <span>Standard {shipping === 0 ? '(GRATUIT peste $100)' : `$${shipping.toFixed(2)}`}</span>
                </label>
              </div>
            </section>

            {/* Facturare */}
            <section style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Billing Details</h3>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <input type="checkbox" checked={sameBilling} onChange={(e)=>setSameBilling(e.target.checked)} />
                <span>Aceeași ca Delivery Address</span>
              </label>
              {!sameBilling && (
                <div style={{ display: 'grid', gap: 12 }}>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Strada, nr., bloc, ap.</span>
                    <input value={facturare.strada} onChange={(e) => setFacturare({ ...facturare, strada: e.target.value })} style={inputStyle} />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span>City</span>
                      <input value={facturare.City} onChange={(e) => setFacturare({ ...facturare, City: e.target.value })} style={inputStyle} />
                    </label>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span>State/County</span>
                      <input value={facturare.stateCounty} onChange={(e) => setFacturare({ ...facturare, stateCounty: e.target.value })} style={inputStyle} />
                    </label>
                  </div>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Postal Code</span>
                    <input value={facturare.codPostal} onChange={(e) => setFacturare({ ...facturare, codPostal: e.target.value })} style={inputStyle} />
                  </label>
                </div>
              )}
            </section>

            {/* Plata */}
            <section style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Modalitate de plata</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={radioRowStyle}>
                  <input type="radio" name="payment" checked={payment==='cod'} onChange={()=>setPayment('cod')} />
                  <span>Ramburs (plata la livrare)</span>
                </label>
                <label style={radioRowStyle}>
                  <input type="radio" name="payment" checked={payment==='card'} onChange={()=>setPayment('card')} />
                  <span>Card (simulat)</span>
                </label>
              </div>
            </section>
          </div>

          {/* Coloana Dreapta: Order Summary */}
          <aside style={{ position: 'sticky', top: 18, alignSelf: 'start', background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
            <h3 style={{ marginTop: 0 }}>Order Summary</h3>
            <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
              {cart.map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 56, height: 56, background: '#0b0b0b', border: '1px solid #222', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={resolveImageUrl(c.product.image)} alt={c.product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{c.product.name}</div>
                    <div style={{ opacity: 0.8, fontSize: 13 }}>x{c.quantity} • {c.size} • {c.color}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>${(c.product.price * c.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #222', margin: '10px 0' }}></div>
            <div style={rowBetween}><span>Items Total</span><span>${subTotal.toFixed(2)}</span></div>
            <div style={rowBetween}><span>Shipping</span><span>{shipping === 0 ? 'GRATUIT' : `$${shipping.toFixed(2)}`}</span></div>
            <div style={{ borderTop: '1px solid #222', margin: '10px 0' }}></div>
            <div style={{ ...rowBetween, fontWeight: 800 }}><span>Total</span><span>${Total.toFixed(2)}</span></div>

            <button type="submit" style={{ marginTop: 12, background: '#E6FF00', color: '#111', WebkitTextFillColor: '#111', border: '2px solid #E6FF00', borderRadius: 8, fontWeight: 800, padding: '12px 16px', width: '100%', cursor: 'pointer', boxShadow: '0 0 14px rgba(230,255,0,0.55)' }}>
              <span style={{ position: 'relative', zIndex: 2 }}>Place order</span>
            </button>
            <Link to="/cart" style={{ display: 'block', marginTop: 10, color: '#E6FF00', textDecoration: 'none', fontWeight: 600 }}>← Inapoi la cos</Link>
          </aside>
        </form>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: '#0b0b0b',
  color: '#fff',
  border: '1px solid #333',
  borderRadius: 6,
  padding: '10px 12px'
}

const radioRowStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10
}

const rowBetween: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10
}

function resolveImageUrl(url?: string) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`
  return url
}
import React, { useState } from "react";

type CheckoutForm = {
  firstName: string;
  lastName: string;
  phone: string;
  deliveryAddress: string;
  billingAddress: string;
  sameAsDelivery: boolean;
  paymentMethod: "cod" | "card";
};

const initialForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  phone: "",
  deliveryAddress: "",
  billingAddress: "",
  sameAsDelivery: true,
  paymentMethod: "cod",
};

const SHIPPING_COST = 20;
const ITEMS_COST = 100; // Replace with real cart total if available

export default function CheckoutPage() {
  const [form, setForm] = useState(initialForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "sameAsDelivery" && checked ? { billingAddress: prev.deliveryAddress } : {})
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Order placed! (Demo)");
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Checkout</h2>
      <form onSubmit={handleSubmit}>
        <fieldset style={{ border: 0, marginBottom: 24 }}>
          <legend style={{ fontWeight: 600 }}>Contact Details</legend>
          <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label>First Name<br />
                <input name="firstName" value={form.firstName} onChange={handleChange} required style={{ width: "100%" }} />
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <label>Last Name<br />
                <input name="lastName" value={form.lastName} onChange={handleChange} required style={{ width: "100%" }} />
              import { useState, useMemo } from 'react'
              import { Link, useNavigate } from 'react-router-dom'
              import { useCart } from '../utils/useCart'

              type Address = {
                strada: string
                City: string
                stateCounty: string
                codPostal: string
              }

              export default function CheckoutPage() {
                const navigate = useNavigate()
                const { cart, getTotalPrice, clearCart } = useCart()

                const [firstName, setFirstName] = useState('')
                const [lastName, setLastName] = useState('')
                const [phone, setPhone] = useState('')
                const [livrare, setLivrare] = useState<Address>({ strada: '', City: '', stateCounty: '', codPostal: '' })
                const [sameBilling, setSameBilling] = useState(true)
                const [facturare, setFacturare] = useState<Address>({ strada: '', City: '', stateCounty: '', codPostal: '' })
                const [payment, setPayment] = useState<'card'|'cod'>('cod')

                const subTotal = useMemo(() => getTotalPrice(), [getTotalPrice, cart])
                const shippingBase = subTotal > 100 ? 0 : 10
                const shipping = shippingBase
                const Total = subTotal + shipping

                const hasItems = cart.length > 0

                const onPlaceOrder = (e: React.FormEvent) => {
                  e.preventDefault()
                  if (!hasItems) {
                    alert('Cosul este gol.')
                    navigate('/products')
                    return
                  }
                  if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
                    alert('Completeaza Last Name, PreLast Name si Phone.')
                    return
                  }
                  if (!livrare.strada.trim() || !livrare.City.trim() || !livrare.stateCounty.trim() || !livrare.codPostal.trim()) {
                    alert('Completeaza toate campurile la Delivery Address.')
                    return
                  }
                  if (!sameBilling) {
                    if (!facturare.strada.trim() || !facturare.City.trim() || !facturare.stateCounty.trim() || !facturare.codPostal.trim()) {
                      alert('Completeaza toate campurile la Address de facturare sau bifeaza "aceeasi ca la livrare".')
                      return
                    }
                  }

                  // Placeholder: aici ai integrarea de plata/crearea comenzii
                  alert(`✅ Comanda plasata!\nModalitate plata: ${payment === 'cod' ? 'Ramburs' : 'Card'}\nTotal: $${Total.toFixed(2)}`)
                  // optional: clear cart
                  clearCart()
                  navigate('/')
                }

                return (
                  <div className="checkout-page" style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
                    <div style={{ marginBottom: 20 }}>
                      <h1 style={{ margin: 0 }}>Checkout</h1>
                      <p style={{ opacity: 0.8 }}>{cart.length} Product(e) in cos</p>
                    </div>

                    {cart.length === 0 ? (
                      <div style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 24 }}>
                        <p>Cosul tau este gol.</p>
                        <Link to="/products" style={{ color: '#E6FF00', textDecoration: 'none', fontWeight: 700 }}>← Inapoi la Products</Link>
                      </div>
                    ) : (
                      <form onSubmit={onPlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
                        {/* Coloana Stanga: Formulare */}
                        <div style={{ display: 'grid', gap: 18 }}>
                          {/* Contact */}
                          <section style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
                            <h3 style={{ marginTop: 0 }}>Contact Details</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                              <label style={{ display: 'grid', gap: 6 }}>
                                <span>Last Name</span>
                                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} />
                              </label>
                              <label style={{ display: 'grid', gap: 6 }}>
                                <span>PreLast Name</span>
                                <input value={lastName} onChange={(e) => setLastName(e.target.value)} required style={inputStyle} />
                              </label>
                            </div>
                            <label style={{ display: 'grid', gap: 6, marginTop: 12 }}>
                              <span>Phone</span>
                              <input value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" style={inputStyle} />
                            </label>
                          </section>

                          {/* Livrare */}
                          <section style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
                            <h3 style={{ marginTop: 0 }}>Delivery Address</h3>
                            <div style={{ display: 'grid', gap: 12 }}>
                              <label style={{ display: 'grid', gap: 6 }}>
                                <span>Strada, nr., bloc, ap.</span>
                                <input value={livrare.strada} onChange={(e) => setLivrare({ ...livrare, strada: e.target.value })} required style={inputStyle} />
                              </label>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <label style={{ display: 'grid', gap: 6 }}>
                                  <span>City</span>
                                  <input value={livrare.City} onChange={(e) => setLivrare({ ...livrare, City: e.target.value })} required style={inputStyle} />
                                </label>
                                <label style={{ display: 'grid', gap: 6 }}>
                                  <span>State/County</span>
                                  <input value={livrare.stateCounty} onChange={(e) => setLivrare({ ...livrare, stateCounty: e.target.value })} required style={inputStyle} />
                                </label>
                              </div>
                              <label style={{ display: 'grid', gap: 6 }}>
                                <span>Postal Code</span>
                                <input value={livrare.codPostal} onChange={(e) => setLivrare({ ...livrare, codPostal: e.target.value })} required style={inputStyle} />
                              </label>
                            </div>
                          </section>

                          {/* Shipping */}
                          <section style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
                            <h3 style={{ marginTop: 0 }}>Shipping</h3>
                            <div style={{ display: 'grid', gap: 8 }}>
                              <label style={radioRowStyle}>
                                <input type="radio" name="shipping" checked readOnly />
                                <span>Standard {shipping === 0 ? '(GRATUIT peste $100)' : `$${shipping.toFixed(2)}`}</span>
                              </label>
                            </div>
                          </section>

                          {/* Facturare */}
                          <section style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
                            <h3 style={{ marginTop: 0 }}>Billing Details</h3>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                              <input type="checkbox" checked={sameBilling} onChange={(e)=>setSameBilling(e.target.checked)} />
                              <span>Aceeași ca Delivery Address</span>
                            </label>
                            {!sameBilling && (
                              <div style={{ display: 'grid', gap: 12 }}>
                                <label style={{ display: 'grid', gap: 6 }}>
                                  <span>Strada, nr., bloc, ap.</span>
                                  <input value={facturare.strada} onChange={(e) => setFacturare({ ...facturare, strada: e.target.value })} style={inputStyle} />
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                  <label style={{ display: 'grid', gap: 6 }}>
                                    <span>City</span>
                                    <input value={facturare.City} onChange={(e) => setFacturare({ ...facturare, City: e.target.value })} style={inputStyle} />
                                  </label>
                                  <label style={{ display: 'grid', gap: 6 }}>
                                    <span>State/County</span>
                                    <input value={facturare.stateCounty} onChange={(e) => setFacturare({ ...facturare, stateCounty: e.target.value })} style={inputStyle} />
                                  </label>
                                </div>
                                <label style={{ display: 'grid', gap: 6 }}>
                                  <span>Postal Code</span>
                                  <input value={facturare.codPostal} onChange={(e) => setFacturare({ ...facturare, codPostal: e.target.value })} style={inputStyle} />
                                </label>
                              </div>
                            )}
                          </section>

                          {/* Plata */}
                          <section style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
                            <h3 style={{ marginTop: 0 }}>Modalitate de plata</h3>
                            <div style={{ display: 'grid', gap: 8 }}>
                              <label style={radioRowStyle}>
                                <input type="radio" name="payment" checked={payment==='cod'} onChange={()=>setPayment('cod')} />
                                <span>Ramburs (plata la livrare)</span>
                              </label>
                              <label style={radioRowStyle}>
                                <input type="radio" name="payment" checked={payment==='card'} onChange={()=>setPayment('card')} />
                                <span>Card (simulat)</span>
                              </label>
                            </div>
                          </section>
                        </div>

                        {/* Coloana Dreapta: Order Summary */}
                        <aside style={{ position: 'sticky', top: 18, alignSelf: 'start', background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
                          <h3 style={{ marginTop: 0 }}>Order Summary</h3>
                          <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
                            {cart.map((c: any, i: number) => (
                              <div key={i} style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 10, alignItems: 'center' }}>
                                <div style={{ width: 56, height: 56, background: '#0b0b0b', border: '1px solid #222', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                  <img src={resolveImageUrl(c.product.image)} alt={c.product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700 }}>{c.product.name}</div>
                                  <div style={{ opacity: 0.8, fontSize: 13 }}>x{c.quantity} • {c.size} • {c.color}</div>
                                </div>
                                <div style={{ fontWeight: 700 }}>${(c.product.price * c.quantity).toFixed(2)}</div>
                              </div>
                            ))}
                          </div>

                          <div style={{ borderTop: '1px solid #222', margin: '10px 0' }}></div>
                          <div style={rowBetween}><span>Items Total</span><span>${subTotal.toFixed(2)}</span></div>
                          <div style={rowBetween}><span>Shipping</span><span>{shipping === 0 ? 'GRATUIT' : `$${shipping.toFixed(2)}`}</span></div>
                          <div style={{ borderTop: '1px solid #222', margin: '10px 0' }}></div>
                          <div style={{ ...rowBetween, fontWeight: 800 }}><span>Total</span><span>${Total.toFixed(2)}</span></div>

                          <button type="submit" style={{ marginTop: 12, background: '#E6FF00', color: '#111', WebkitTextFillColor: '#111', border: '2px solid #E6FF00', borderRadius: 8, fontWeight: 800, padding: '12px 16px', width: '100%', cursor: 'pointer', boxShadow: '0 0 14px rgba(230,255,0,0.55)' }}>
                            <span style={{ position: 'relative', zIndex: 2 }}>Place order</span>
                          </button>
                          <Link to="/cart" style={{ display: 'block', marginTop: 10, color: '#E6FF00', textDecoration: 'none', fontWeight: 600 }}>← Inapoi la cos</Link>
                        </aside>
                      </form>
                    )}
                  </div>
                )
              }

              const inputStyle: React.CSSProperties = {
                background: '#0b0b0b',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: 6,
                padding: '10px 12px'
              }

              const radioRowStyle: React.CSSProperties = {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10
              }

              const rowBetween: React.CSSProperties = {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10
              }

              const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5000';
              function resolveImageUrl(url?: string) {
                if (!url) return ''
                if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
                if (url.startsWith('/uploads/')) return `${API_BASE}${url}`
                return url
              }
      if (!facturare.strada.trim() || !facturare.City.trim() || !facturare.State/County.trim() || !facturare.codPostal.trim()) {
        alert('Completeaza toate campurile la Address de facturare sau bifeaza "aceeasi ca la livrare".')
        return
      }
    }

    // Placeholder: aici ai integrarea de plata/crearea comenzii
    alert(`âœ… Comanda plasata!\nModalitate plata: ${payment === 'cod' ? 'Ramburs' : 'Card'}\nTotal: $${Total.toFixed(2)}`)
    // optional: clear cart
    clearCart()
    navigate('/')
  }

  return (
    <div className="checkout-page" style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Checkout</h1>
        <p style={{ opacity: 0.8 }}>{cart.length} Product(e) in cos</p>
      </div>

      {cart.length === 0 ? (
        <div style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 24 }}>
          <p>Cosul tau este gol.</p>
          <Link to="/products" style={{ color: '#E6FF00', textDecoration: 'none', fontWeight: 700 }}>â† Inapoi la Products</Link>
        </div>
      ) : (
        <form onSubmit={onPlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          {/* Coloana Stanga: Formulare */}
          <div style={{ display: 'grid', gap: 18 }}>
            {/* Contact */}
            <section style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Contact Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Last Name</span>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>PreLast Name</span>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} required style={inputStyle} />
                </label>
              </div>
              <label style={{ display: 'grid', gap: 6, marginTop: 12 }}>
                <span>Phone</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" style={inputStyle} />
              </label>
            </section>

            {/* Livrare */}
            <section style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Delivery Address</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Strada, nr., bloc, ap.</span>
                  <input value={livrare.strada} onChange={(e) => setLivrare({ ...livrare, strada: e.target.value })} required style={inputStyle} />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>City</span>
                    <input value={livrare.City} onChange={(e) => setLivrare({ ...livrare, City: e.target.value })} required style={inputStyle} />
                  </label>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>State/County</span>
                    <input value={livrare.stateCounty} onChange={(e) => setLivrare({ ...livrare, stateCounty: e.target.value })} required style={inputStyle} />
                  </label>
                </div>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Postal Code</span>
                  <input value={livrare.codPostal} onChange={(e) => setLivrare({ ...livrare, codPostal: e.target.value })} required style={inputStyle} />
                </label>
              </div>
            </section>

            {/* Shipping */}
            <section style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Shipping</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={radioRowStyle}>
                  <input type="radio" name="shipping" checked readOnly />
                  <span>Standard {shipping === 0 ? '(GRATUIT peste $100)' : `$${shipping.toFixed(2)}`}</span>
                </label>
              </div>
            </section>

            {/* Facturare */}
            <section style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Billing Details</h3>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <input type="checkbox" checked={sameBilling} onChange={(e)=>setSameBilling(e.target.checked)} />
                <span>AceeaÈ™i ca Delivery Address</span>
              </label>
              {!sameBilling && (
                <div style={{ display: 'grid', gap: 12 }}>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Strada, nr., bloc, ap.</span>
                    <input value={facturare.strada} onChange={(e) => setFacturare({ ...facturare, strada: e.target.value })} style={inputStyle} />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span>City</span>
                      <input value={facturare.City} onChange={(e) => setFacturare({ ...facturare, City: e.target.value })} style={inputStyle} />
                    </label>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span>State/County</span>
                      <input value={facturare.stateCounty} onChange={(e) => setFacturare({ ...facturare, stateCounty: e.target.value })} style={inputStyle} />
                    </label>
                  </div>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Postal Code</span>
                    <input value={facturare.codPostal} onChange={(e) => setFacturare({ ...facturare, codPostal: e.target.value })} style={inputStyle} />
                  </label>
                </div>
              )}
            </section>

            {/* Plata */}
            <section style={{ background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Modalitate de plata</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={radioRowStyle}>
                  <input type="radio" name="payment" checked={payment==='cod'} onChange={()=>setPayment('cod')} />
                  <span>Ramburs (plata la livrare)</span>
                </label>
                <label style={radioRowStyle}>
                  <input type="radio" name="payment" checked={payment==='card'} onChange={()=>setPayment('card')} />
                  <span>Card (simulat)</span>
                </label>
              </div>
            </section>
          </div>

          {/* Coloana Dreapta: Order Summary */}
          <aside style={{ position: 'sticky', top: 18, alignSelf: 'start', background: '#0f0f10', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
            <h3 style={{ marginTop: 0 }}>Order Summary</h3>
            <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
              {cart.map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 56, height: 56, background: '#0b0b0b', border: '1px solid #222', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={resolveImageUrl(c.product.image)} alt={c.product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{c.product.name}</div>
                    <div style={{ opacity: 0.8, fontSize: 13 }}>x{c.quantity} â€¢ {c.size} â€¢ {c.color}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>${(c.product.price * c.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #222', margin: '10px 0' }}></div>
            <div style={rowBetween}><span>Items Total</span><span>${subTotal.toFixed(2)}</span></div>
            <div style={rowBetween}><span>Shipping</span><span>{shipping === 0 ? 'GRATUIT' : `$${shipping.toFixed(2)}`}</span></div>
            <div style={{ borderTop: '1px solid #222', margin: '10px 0' }}></div>
            <div style={{ ...rowBetween, fontWeight: 800 }}><span>Total</span><span>${Total.toFixed(2)}</span></div>

            <button type="submit" style={{ marginTop: 12, background: '#E6FF00', color: '#111', WebkitTextFillColor: '#111', border: '2px solid #E6FF00', borderRadius: 8, fontWeight: 800, padding: '12px 16px', width: '100%', cursor: 'pointer', boxShadow: '0 0 14px rgba(230,255,0,0.55)' }}>
              <span style={{ position: 'relative', zIndex: 2 }}>Place order</span>
            </button>
            <Link to="/cart" style={{ display: 'block', marginTop: 10, color: '#E6FF00', textDecoration: 'none', fontWeight: 600 }}>â† Inapoi la cos</Link>
          </aside>
        </form>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: '#0b0b0b',
  color: '#fff',
  border: '1px solid #333',
  borderRadius: 6,
  padding: '10px 12px'
}

const radioRowStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10
}

const rowBetween: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10
}

function resolveImageUrl(url?: string) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`
  return url
}

