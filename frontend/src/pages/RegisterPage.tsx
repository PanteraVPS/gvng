import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, getCurrentUser } from "../services/authService";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState<string | null>(null);
    const [focus, setFocus] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (getCurrentUser()) {
            navigate('/');
        }
    }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const data = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      navigate('/profile');
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to register. Please try again.");
      }
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.mainContent}>
        <div style={styles.leftPanel}>
          <h1 style={styles.logo}>GVNG</h1>
          <form onSubmit={handleRegister}>
            <h2 style={styles.sectionTitle}>Create Account</h2>
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            <div style={{ display: "flex", gap: "1rem" }}>
              <input name="firstName" placeholder="First name" onChange={handleChange} style={{ ...styles.input, flex: 1, ...(focus === 'firstName' ? styles.inputFocus : {}) }} onFocus={() => setFocus('firstName')} onBlur={() => setFocus(null)} required />
              <input name="lastName" placeholder="Last name" onChange={handleChange} style={{ ...styles.input, flex: 1, ...(focus === 'lastName' ? styles.inputFocus : {}) }} onFocus={() => setFocus('lastName')} onBlur={() => setFocus(null)} required />
            </div>
            <input name="email" type="email" placeholder="Email" onChange={handleChange} style={{...styles.input, ...(focus === 'email' ? styles.inputFocus : {})}} onFocus={() => setFocus('email')} onBlur={() => setFocus(null)} required />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} style={{...styles.input, ...(focus === 'password' ? styles.inputFocus : {})}} onFocus={() => setFocus('password')} onBlur={() => setFocus(null)} required />
            <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} style={{...styles.input, ...(focus === 'confirmPassword' ? styles.inputFocus : {})}} onFocus={() => setFocus('confirmPassword')} onBlur={() => setFocus(null)} required />
            <button style={{...styles.continueButton, marginTop: '1rem'}}>Register</button>
          </form>
          <div style={styles.footerLinks}>
            <Link to="/login" style={styles.link}>Already have an account? Login</Link>
          </div>
        </div>
        <div style={styles.rightPanel}>
          <div style={styles.promoContent}>
            <h2 style={styles.promoTitle}>Join the GVNG</h2>
            <p style={styles.promoText}>Get access to exclusive drops and members-only content.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: { 
    display: "flex", 
    minHeight: "100vh", 
    background: "#121212", 
    color: "#fff", 
    fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` 
  },
  mainContent: { 
    display: "flex", 
    width: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  leftPanel: { 
    width: "50%", 
    maxWidth: "500px",
    padding: "2rem 4rem", 
  },
  rightPanel: { 
    width: "50%", 
    background: "#1a1a1a", 
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh"
  },
  logo: { 
    fontSize: "2rem", 
    fontWeight: "bold", 
    marginBottom: "1.5rem",
    textAlign: "center"
  },
  sectionTitle: { 
    fontSize: "1.2rem", 
    fontWeight: "500", 
    marginBottom: '1rem',
    textAlign: "center"
  },
  input: { 
    width: "100%", 
    padding: "0.8rem 1rem", 
    marginBottom: "1rem", 
    background: "rgba(0,0,0,0.2)", 
    border: "1px solid #555", 
    borderRadius: "4px", 
    color: "#fff", 
    fontSize: "1rem", 
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)", 
    transition: '0.25s' 
  },
  inputFocus: { 
    border: "1px solid #b4ff3c", 
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5), 0 0 15px rgba(180, 255, 60, 0.5)" 
  },
  continueButton: { 
    width: "100%", 
    padding: "1rem", 
    background: "linear-gradient(90deg,#b4ff3c 0%,#4aff93 100%)", 
    color: "#111", 
    border: "none", 
    borderRadius: "4px", 
    fontSize: "1rem", 
    fontWeight: "bold", 
    cursor: "pointer", 
    marginTop: "1rem", 
    letterSpacing: '0.5px', 
    boxShadow: '0 2px 16px rgba(180, 255, 60, 0.3)', 
    transition: '0.2s' 
  },
  footerLinks: { 
    marginTop: "1rem", 
    textAlign: "center"
  },
  link: {
    color: "#b4ff3c",
    textDecoration: "none"
  },
  promoContent: {
    textAlign: "center",
    padding: "2rem"
  },
  promoTitle: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "1rem"
  },
  promoText: {
    fontSize: "1.2rem",
    color: "#ccc"
  }
};