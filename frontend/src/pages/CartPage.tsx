import { useCart } from '../utils/useCart'
import { Link } from 'react-router-dom'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart()

  const subtotal = getTotalPrice()
  const shipping = subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-content">
          <h2>Your Cart is Empty</h2>
          <p>Start shopping to add items to your cart</p>
          <Link to="/products" className="continue-shopping-btn">
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="page-header">
        <h1>SHOPPING CART</h1>
        <p>{cart.length} item(s) in cart</p>
      </div>

      <div className="cart-container">
        {/* Cart Items */}
        <div className="cart-items">
          {cart.map((item, index) => (
            <div key={index} className="cart-item" style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto auto auto', gap: '16px', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #222' }}>
              <div className="item-image" style={{ width: 100, height: 100, background: '#0b0b0b', border: '1px solid #222', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={resolveImageUrl(item.product.image)} alt={item.product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
              </div>

              <div className="item-details" style={{ color: '#ddd' }}>
                <h3>{item.product.name}</h3>
                <p className="item-specs">
                  Size: <strong>{item.size}</strong> | Color: <strong>{item.color}</strong>
                </p>
                <p className="item-price">${item.product.price}</p>
              </div>

              <div className="item-quantity" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => updateQuantity(item.product._id!, item.size, item.color, item.quantity - 1)}
                  style={{ width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: '#191919', color: '#E6FF00', WebkitTextFillColor: '#E6FF00', border: '1px solid #333', cursor: 'pointer' }}
                  aria-label="Decrease quantity"
                >
                  <span style={{ position: 'relative', zIndex: 2 }}>−</span>
                </button>
                <span style={{ minWidth: 24, textAlign: 'center', color: '#fff' }}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product._id!, item.size, item.color, item.quantity + 1)}
                  style={{ width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: '#191919', color: '#E6FF00', WebkitTextFillColor: '#E6FF00', border: '1px solid #333', cursor: 'pointer' }}
                  aria-label="Increase quantity"
                >
                  <span style={{ position: 'relative', zIndex: 2 }}>+</span>
                </button>
              </div>

              <div className="item-subtotal" style={{ color: '#fff' }}>
                <p style={{ margin: 0 }}>${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>

              <button
                onClick={() => removeFromCart(item.product._id!, item.size, item.color)}
                className="remove-btn"
                style={{ width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: '#2a2a2a', border: '1px solid #333', color: '#fff', WebkitTextFillColor: '#fff', cursor: 'pointer' }}
              >
                <span style={{ position: 'relative', zIndex: 2 }}>✕</span>
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>ORDER SUMMARY</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span className={shipping === 0 ? 'free' : ''}>
              {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
            </span>
          </div>

          <div className="summary-row">
            <span>Tax (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-total">
            <span>TOTAL</span>
            <span>${total.toFixed(2)}</span>
          </div>

          {subtotal > 100 && (
            <div className="free-shipping-msg">
              ✓ Free shipping on this order!
            </div>
          )}

          <Link to="/checkout" className="checkout-btn" style={{ display:'inline-block', textAlign:'center', textDecoration:'none', background: '#E6FF00', color: '#111', WebkitTextFillColor: '#111', border: '2px solid #E6FF00', borderRadius: 8, fontWeight: 800, padding: '12px 16px', width: '100%', cursor: 'pointer', boxShadow: '0 0 14px rgba(230,255,0,0.55)' }}>
            <span style={{ position: 'relative', zIndex: 2 }}>PROCEED TO CHECKOUT</span>
          </Link>

          <button onClick={() => clearCart()} className="clear-cart-btn" style={{ background: '#1b1b1b', color: '#fff', WebkitTextFillColor: '#fff', border: '1px solid #333', borderRadius: 8, fontWeight: 700, padding: '10px 14px', width: '100%', cursor: 'pointer' }}>
            <span style={{ position: 'relative', zIndex: 2 }}>CLEAR CART</span>
          </button>

          <Link to="/products" className="continue-shopping-link" style={{ color: '#E6FF00', textDecoration: 'none', fontWeight: 600 }}>
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

// Resolve product image URLs similarly to HomePage (handles backend /uploads paths)
const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5000';
function resolveImageUrl(url: string = '') {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  if (url.startsWith('/uploads/')) return `${API_BASE}${url}`
  return url
}
