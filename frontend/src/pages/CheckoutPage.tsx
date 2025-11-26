import React, { useState } from "react";
import { useCart } from "../utils/useCart";

const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", 
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", 
    "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", 
    "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", 
    "Congo, Republic of the", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", 
    "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", 
    "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", 
    "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", 
    "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", 
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", 
    "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", 
    "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", 
    "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", 
    "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", 
    "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", 
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", 
    "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", 
    "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", 
    "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", 
    "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", 
    "Zambia", "Zimbabwe"
];

const getImageUrl = (imagePath: string) => {
  if (!imagePath) {
    return "https://via.placeholder.com/64";
  }
  if (imagePath.startsWith('/uploads')) {
    return `http://localhost:5000${imagePath}`;
  }
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  try {
    return new URL(`../assets/${imagePath}`, import.meta.url).href;
  } catch (error) {
    console.error("Error constructing image URL:", imagePath, error);
    return "https://via.placeholder.com/64";
  }
};

export default function CheckoutPage() {
  const { cart: cartItems, getTotalPrice } = useCart();
  const [email, setEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    country: "Romania",
    postalCode: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isCardDetailsVisible, setIsCardDetailsVisible] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);

  const subtotal = getTotalPrice() || 0;
  const shippingCost = 10.0;
  const total = subtotal + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress({ ...shippingAddress, [name]: value });
  };

  return (
    <div style={styles.page}>
      <div style={styles.mainContent}>
        <div style={styles.leftPanel}>
          <h1 style={styles.logo}>GVNG Shop</h1>
          <form>
            {/* Contact Section */}
            <h2 style={styles.sectionTitle}>Contact</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{...styles.input, ...(focus === 'email' ? styles.inputFocus : {})}} onFocus={() => setFocus('email')} onBlur={() => setFocus(null)} required />

            {/* Shipping Address Section */}
            <h2 style={{ ...styles.sectionTitle, marginTop: '2rem' }}>Shipping address</h2>
            <select name="country" value={shippingAddress.country} onChange={handleInputChange} style={{ ...styles.input, ...styles.select, ...(focus === 'country' ? styles.inputFocus : {}) }} onFocus={() => setFocus('country')} onBlur={() => setFocus(null)} required>
              {countries.map(country => (
                <option key={country} style={styles.selectOption} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", gap: "1rem" }}>
              <input name="firstName" placeholder="First name" onChange={handleInputChange} style={{ ...styles.input, flex: 1, ...(focus === 'firstName' ? styles.inputFocus : {}) }} onFocus={() => setFocus('firstName')} onBlur={() => setFocus(null)} required />
              <input name="lastName" placeholder="Last name" onChange={handleInputChange} style={{ ...styles.input, flex: 1, ...(focus === 'lastName' ? styles.inputFocus : {}) }} onFocus={() => setFocus('lastName')} onBlur={() => setFocus(null)} required />
            </div>
            <input name="address" placeholder="Address" onChange={handleInputChange} style={{...styles.input, ...(focus === 'address' ? styles.inputFocus : {})}} onFocus={() => setFocus('address')} onBlur={() => setFocus(null)} required />
            <input name="apartment" placeholder="Apartment, suite, etc. (optional)" onChange={handleInputChange} style={{...styles.input, ...(focus === 'apartment' ? styles.inputFocus : {})}} onFocus={() => setFocus('apartment')} onBlur={() => setFocus(null)} />
            <div style={{ display: "flex", gap: "1rem" }}>
              <input name="city" placeholder="City" onChange={handleInputChange} style={{ ...styles.input, flex: 1, ...(focus === 'city' ? styles.inputFocus : {}) }} onFocus={() => setFocus('city')} onBlur={() => setFocus(null)} required />
              <input name="postalCode" placeholder="Postal code" onChange={handleInputChange} style={{ ...styles.input, flex: 1, ...(focus === 'postalCode' ? styles.inputFocus : {}) }} onFocus={() => setFocus('postalCode')} onBlur={() => setFocus(null)} required />
            </div>
            <input name="phone" placeholder="Phone" onChange={handleInputChange} style={{...styles.input, ...(focus === 'phone' ? styles.inputFocus : {})}} onFocus={() => setFocus('phone')} onBlur={() => setFocus(null)} required />

            {/* Payment Section */}
            <h2 style={{...styles.sectionTitle, marginTop: '2rem'}}>Payment</h2>
            <p style={{ color: "#ccc", marginTop: '-0.5rem', marginBottom: '1rem' }}>All transactions are secure and encrypted.</p>
            <div 
              style={{...styles.paymentOption, border: paymentMethod === 'card' ? '1px solid #b4ff3c' : '1px solid #444'}} 
              onClick={() => {
                setPaymentMethod('card');
                setIsCardDetailsVisible(prev => !prev);
              }}>
              Credit card
            </div>
            <div 
              style={{...styles.paymentOption, border: paymentMethod === 'cash' ? '1px solid #222' : '1px solid #444'}} 
              onClick={() => {
                setPaymentMethod('cash');
                setIsCardDetailsVisible(false);
              }}>
              Cash on delivery
            </div>
            {paymentMethod === 'card' && isCardDetailsVisible && (
              <div style={styles.paymentGateway}>
                <div style={{ padding: '1rem' }}>
                  <input placeholder="Card number" style={{...styles.input, marginBottom: '0.5rem', ...(focus === 'cardNumber' ? styles.inputFocus : {})}} onFocus={() => setFocus('cardNumber')} onBlur={() => setFocus(null)} required />
                  <input placeholder="Name on card" style={{...styles.input, marginBottom: '0.5rem', ...(focus === 'cardName' ? styles.inputFocus : {})}} onFocus={() => setFocus('cardName')} onBlur={() => setFocus(null)} required />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input placeholder="Expiration date (MM / YY)" style={{...styles.input, flex: 1, marginBottom: 0, ...(focus === 'cardExpiry' ? styles.inputFocus : {})}} onFocus={() => setFocus('cardExpiry')} onBlur={() => setFocus(null)} required />
                    <input placeholder="Security code" style={{...styles.input, flex: 1, marginBottom: 0, ...(focus === 'cardCvc' ? styles.inputFocus : {})}} onFocus={() => setFocus('cardCvc')} onBlur={() => setFocus(null)} required />
                  </div>
                </div>
              </div>
            )}
            
            <button style={{...styles.continueButton, marginTop: '2rem'}}>{paymentMethod === 'card' ? 'Pay now' : 'Complete order'}</button>
          </form>

          <div style={styles.footerLinks}><a href="#">Refund policy</a><a href="#">Shipping policy</a><a href="#">Privacy policy</a><a href="#">Terms of service</a></div>
        </div>
        <div style={styles.rightPanel}>
          <div style={styles.orderSummary}>
            {(cartItems || []).map((item: any) => {
              const itemPrice = (item.product.price && item.quantity) ? (item.product.price * item.quantity) : 0;
              return (
                <div key={`${item.product.id}-${item.size}`} style={styles.productItem}>
                  <img src={getImageUrl(item.product.image)} alt={item.product.name} style={styles.productImage} />
                  <div style={styles.productInfo}>
                    <span style={styles.productName}>{item.product.name || 'Product Name'}</span>
                    <span style={styles.productSize}>Size: {item.size || 'N/A'}</span>
                  </div>
                  <span style={styles.productPrice}>${itemPrice.toFixed(2)}</span>
                </div>
              );
            })}
            <div style={styles.summaryLine}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div style={styles.summaryLine}><span>Shipping</span><span>${shippingCost.toFixed(2)}</span></div>
            <div style={{ ...styles.summaryLine, ...styles.totalLine }}><span>Total</span><span style={styles.totalPrice}>${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: { display: "flex", minHeight: "100vh", background: "#121212", color: "#fff", fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` },
  mainContent: { display: "flex", width: "100%" },
  leftPanel: { width: "55%", padding: "2rem 4rem", borderRight: "1px solid #333" },
  rightPanel: { width: "45%", background: "#1a1a1a", padding: "2rem 4rem" },
  logo: { fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem" },
  sectionTitle: { fontSize: "1.2rem", fontWeight: "500", marginBottom: '1rem' },
  input: { width: "100%", padding: "0.8rem 1rem", marginBottom: "1rem", background: "rgba(0,0,0,0.2)", border: "1px solid #555", borderRadius: "4px", color: "#fff", fontSize: "1rem", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)", transition: '0.25s' },
  inputFocus: { border: "1px solid #b4ff3c", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5), 0 0 15px rgba(180, 255, 60, 0.5)" },
  select: { appearance: "none", backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" },
  selectOption: { color: '#000' },
  continueButton: { width: "100%", padding: "1rem", background: "linear-gradient(90deg,#b4ff3c 0%,#4aff93 100%)", color: "#111", border: "none", borderRadius: "4px", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", marginTop: "1rem", letterSpacing: '0.5px', boxShadow: '0 2px 16px rgba(180, 255, 60, 0.3)', transition: '0.2s' },
  footerLinks: { marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid #333", display: "flex", gap: "1rem", fontSize: "0.8rem" },
  orderSummary: {},
  productItem: { display: "flex", alignItems: "center", marginBottom: "1.5rem" },
  productImage: { width: "64px", height: "64px", borderRadius: "8px", marginRight: "1rem", backgroundColor: "#2a2a2a" },
  productInfo: { flex: 1, display: "flex", flexDirection: "column" },
  productName: { fontWeight: "500" },
  productSize: { fontSize: "0.9rem", color: "#999" },
  productPrice: { fontWeight: "500" },
  summaryLine: { display: "flex", justifyContent: "space-between", marginTop: "1rem" },
  totalLine: { borderTop: "1px solid #333", paddingTop: "1rem", fontSize: "1.2rem", fontWeight: "500" },
  totalPrice: { fontSize: "1.5rem", fontWeight: "bold" },
  reviewLabel: { color: "#999", flex: 1 },
  reviewValue: { flex: 3 },
  changeButton: { background: "none", border: "none", color: "#888", cursor: "pointer", textDecoration: "underline" },
  shippingMethod: { border: "1px solid #444", borderRadius: "8px", padding: "1rem", display: "flex", justifyContent: "space-between" },
  paymentGateway: { border: "1px solid #444", borderRadius: "8px", background: '#090909', marginTop: '1rem' },
  paymentOption: { border: "1px solid #444", borderRadius: "8px", padding: "1.5rem", textAlign: "center", fontWeight: 500, cursor: "pointer", marginBottom: '1rem', transition: '0.2s' },
};

