import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getProducts } from '../services/productService'
import { Product } from '../types'
import { fetchAdminProducts } from '../services/adminProductService'
import { useCart } from '../utils/useCart'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [maxPriceBound, setMaxPriceBound] = useState<number>(1000)
  const [priceMin, setPriceMin] = useState<string>('')
  const [priceMax, setPriceMax] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<{ [key: string]: string }>({})
  const [selectedColor, setSelectedColor] = useState<{ [key: string]: string }>({})
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState<'newest'|'price-low'|'price-high'|'rating'|'featured-only'>('newest')
  const [quickView, setQuickView] = useState<Product | null>(null)
  const location = useLocation();
  // Read category from URL query or path (e.g. /products?category=gvng or /collection/gvng)
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const q = params.get('category');
      if (q && q !== category) setCategory(q);
      else if (location.pathname.includes('/collection/gvng') && category !== 'gvng') setCategory('gvng');
    } catch (e) {
      // ignore malformed URLSearchParams
    }
  }, [location.search, location.pathname]);
  const { addToCart } = useCart()
  const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5000';
  const resolveImageUrl = (url?: string) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
    if (url.startsWith('/uploads/')) return `${API_BASE}${url}`
    return url
  }

  const isFeatured = (p: any): boolean => {
    try {
      if (p?.featured === true) return true
      if (p?.isFeatured === true) return true
      if (p?.featured === 'true') return true
      if (Array.isArray(p?.tags) && p.tags.some((t:any)=> String(t).toLowerCase()==='featured')) return true
    } catch {}
    return false
  }

  // Read category from URL query or path (e.g. /products?category=gvng or /collection/gvng)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts(category ? { category } : {});
        let admin: Product[] = []
        try {
          const a = await fetchAdminProducts()
          admin = Array.isArray(a) ? (a as Product[]) : []
        } catch {}
        const local = admin.filter(p => !category || p.category === category)
        // Merge and de-duplicate by _id (fallback to name+category+price+image)
        const merged = [...local, ...data]
        const seen = new Set<string>()
        const deduped: Product[] = []
        for (const p of merged) {
          const key = (p._id && String(p._id)) || [
            (p.name||'').trim().toLowerCase(),
            (p.category||'').trim().toLowerCase(),
            String(p.price||0),
            (p.image||'')
          ].join('|')
          if (!seen.has(key)) { seen.add(key); deduped.push(p) }
        }
        let sorted = [...deduped];
        if (sortBy === 'newest') {
          sorted.sort((a: any, b: any) => {
            const at = a?.createdAt ? new Date(a.createdAt).getTime() : 0
            const bt = b?.createdAt ? new Date(b.createdAt).getTime() : 0
            return bt - at
          })
        }
        if (sortBy === 'price-low') sorted.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-high') sorted.sort((a, b) => b.price - a.price);
        if (sortBy === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        // No GVNG test injection
        try {
          const maxP = Math.max(0, ...sorted.map(p => Number(p.price) || 0))
          setMaxPriceBound(Math.max(50, Math.ceil(maxP)))
        } catch {}
        setProducts(sorted);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, sortBy]);

  const handleAddToCart = (product: Product) => {
    const size = selectedSize[product._id!] || (product.size[0] || 'M')
    const color = selectedColor[product._id!] || (product.color[0] || 'Black')
    addToCart(product, 1, size, color)
    alert('✅ Added to cart!')
  }

  // Ensure the add-to-cart button is visible even if CSS is missing/overridden
  const getButtonStyle = (disabled: boolean) => ({
    background: disabled ? '#222' : '#E6FF00',
    color: disabled ? '#888' : '#111',
    WebkitTextFillColor: disabled ? '#888' : '#111',
    border: `2px solid ${disabled ? '#444' : '#E6FF00'}`,
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: '1.05rem',
    lineHeight: 1.2,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    padding: '0.75em 1.5em',
    marginTop: '1em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : '0 0 14px rgba(230,255,0,0.55)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    mixBlendMode: 'normal' as const,
    filter: 'none',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    zIndex: 10 as const,
  })

  const getButtonLabelStyle = (disabled: boolean) => ({
    position: 'relative' as const,
    zIndex: 99 as const,
    color: disabled ? '#888' : '#111',
    WebkitTextFillColor: disabled ? '#888' : '#111',
    textShadow: disabled ? 'none' : '0 1px 0 rgba(0,0,0,0.25)',
    pointerEvents: 'none' as const,
  })

  return (
    <div className="products-page">
      <style>{`
        .products-page .product-card-large{
          background: linear-gradient(180deg, #111 0%, #0c0c0c 100%);
          border: 1px solid #222;
          border-radius: 14px;
          padding: 14px;
          transition: transform .16s ease, box-shadow .25s ease, border-color .2s ease, background .2s ease;
          position: relative;
          overflow: hidden;
        }
        .products-page .product-card-large::before{
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 16px;
          background:
            radial-gradient(180px 90px at 20% -10%, rgba(230,255,0,0.18), transparent 65%),
            radial-gradient(160px 80px at 80% -10%, rgba(98,176,255,0.10), transparent 60%);
          opacity: 0;
          transition: opacity .25s ease;
          pointer-events: none;
        }
        .products-page .product-card-large::after{
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 14px;
          pointer-events: none;
          box-shadow: inset 0 0 0 0 rgba(255,255,255,0.04);
          transition: box-shadow .25s ease;
        }
        .products-page .product-card-large:hover{
          transform: translateY(-4px);
          box-shadow:
            0 14px 36px rgba(0,0,0,0.50),
            0 18px 40px rgba(230,255,0,0.12),
            0 0 0 1px rgba(230,255,0,0.28);
          border-color: #2d2d2d;
          background: linear-gradient(180deg, #131313 0%, #0f0f0f 100%);
        }
        .products-page .product-card-large:hover::after{
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
        }
        .products-page .product-card-large:hover::before{ opacity: 1; }
        .products-page .product-card-large:focus{
          outline: 2px solid #E6FF00;
          outline-offset: 3px;
        }
        .products-page .product-image-container{
          border: 1px solid #1b1b1b;
          border-radius: 10px;
          overflow: hidden;
          background: #000;
          position: relative;
        }
        .products-page .product-image-container::after{
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(100deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 70%);
          transform: translateX(-120%);
          transition: transform .6s ease;
          pointer-events: none;
          z-index: 2;
        }
        .products-page .product-image-large{
          transition: transform .25s ease;
          position: relative;
          z-index: 1;
        }
        .products-page .product-card-large:hover .product-image-large{
          transform: scale(1.03);
        }
        .products-page .product-card-large:hover .product-image-container::after{
          transform: translateX(120%);
        }
        .products-page .product-title{
          transition: color .15s ease;
        }
        .products-page .product-card-large:hover .product-title{
          color: #eaeaea;
        }
        @keyframes qvIn { from { transform: translateY(8px) scale(.98); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }
        .products-page .quick-view-panel{ animation: qvIn .22s ease; }
        .filter-card{ background: transparent !important; border: 1px solid #2a2a2a; border-radius: 12px; padding: 12px; box-shadow: none !important; backdrop-filter: none !important }
        .products-page .sidebar{ background: transparent !important }
        .products-page .sidebar .filter-section{ background: transparent !important; box-shadow: none !important }
        .chip-row{ display:flex; gap:8px; flex-wrap:wrap; margin-top:10px }
        .chip{ background:linear-gradient(180deg,#1a1a1a 0%, #151515 100%); border:1px solid #2d2d2d; color:#eaeaea; border-radius:999px; padding:6px 10px; font-size:12px; cursor:pointer }
        .chip:active{ transform: scale(0.98) }
        .dual-range{ position: relative; height: 36px; margin-top: 12px }
        .dual-track{ position:absolute; left:0; right:0; top:15px; height:6px; border-radius:999px; background:#1c1c1c }
        .dual-highlight{ position:absolute; top:15px; height:6px; border-radius:999px; background: linear-gradient(90deg, rgba(230,255,0,0.8), rgba(180,220,0,0.8)) }
        .range-input{ -webkit-appearance:none; appearance:none; position:absolute; left:0; right:0; width:100%; background:transparent; pointer-events:none; height:36px; margin:0 }
        .range-input::-webkit-slider-thumb{ -webkit-appearance:none; appearance:none; width:16px; height:16px; border-radius:50%; background:#E6FF00; border:1px solid #B5D200; box-shadow:0 0 0 3px rgba(230,255,0,0.12); pointer-events:auto }
        .range-input::-moz-range-thumb{ width:16px; height:16px; border:none; border-radius:50%; background:#E6FF00; pointer-events:auto }
        .collection-toolbar{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin: 6px 0 12px; }
        .featured-badge{ position:absolute; top:8px; left:8px; z-index:4; background:linear-gradient(180deg,#1a1a1a 0%, #151515 100%); color:#E6FF00; border:1px solid #2d2d2d; border-radius:999px; padding:4px 8px; font-weight:700; font-size:11px; letter-spacing:.3px }
        .featured-tag{ display:inline-block; vertical-align:middle; background:linear-gradient(180deg,#1a1a1a 0%, #151515 100%); color:#E6FF00; border:1px solid #2d2d2d; border-radius:999px; padding:2px 6px; font-weight:700; font-size:10px; letter-spacing:.3px }
        .products-page .stock-badge, .products-page .out-of-stock{ position:absolute; top:8px; right:8px; z-index:4 }
      `}</style>
      {/* Page Header */}
      <div className="page-header">
        <h1>OUR COLLECTION</h1>
        <p>Explore our premium selection of clothing and accessories</p>
      </div>

      <div className="products-container">
        {/* Sidebar Filters */}
        <aside className="sidebar">
          <div className="filter-section" style={{ display:'none' }}>
            <h3>CATEGORY</h3>
            <div className="filter-options">
              {/* Eliminat <select> greșit, rămân doar radio buttons pentru categorii */}
              <label>
                <input 
                  type="radio" 
                  value="women"
                  checked={category === 'women'}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <span>Women</span>
              </label>
              <label>
                <input 
                  type="radio" 
                  value="kids"
                  checked={category === 'kids'}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <span>Kids</span>
              </label>
              <label>
                <input 
                  type="radio" 
                  value="accessories"
                  checked={category === 'accessories'}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <span>Accessories</span>
              </label>
            </div>
          </div>

          <div className="filter-section filter-card" style={{ marginTop: 0 }}>
            <h3 style={{ marginTop: 0 }}>PRICE</h3>
            <div style={{ opacity:0.8, fontSize:12, marginTop:-4 }}>Refine by your budget</div>
            {/* Dual range slider */}
            <div className="dual-range">
              <div className="dual-track" />
              {(() => {
                const minVal = isNaN(parseFloat(priceMin)) ? 0 : Math.max(0, Math.min(parseFloat(priceMin), maxPriceBound))
                const maxVal = isNaN(parseFloat(priceMax)) ? maxPriceBound : Math.min(maxPriceBound, Math.max(parseFloat(priceMax), 0))
                const left = `${(minVal / Math.max(1, maxPriceBound)) * 100}%`
                const width = `${Math.max(0, ((maxVal - minVal) / Math.max(1, maxPriceBound)) * 100)}%`
                return <div className="dual-highlight" style={{ left, width }} />
              })()}
              <input
                className="range-input"
                type="range"
                min={0}
                max={maxPriceBound}
                value={isNaN(parseFloat(priceMin)) ? 0 : Math.min(parseFloat(priceMin), isNaN(parseFloat(priceMax))? maxPriceBound : parseFloat(priceMax))}
                onChange={(e)=>{
                  const currentMax = isNaN(parseFloat(priceMax)) ? maxPriceBound : parseFloat(priceMax)
                  const v = Math.max(0, Math.min(Number(e.target.value)||0, currentMax))
                  setPriceMin(String(v))
                }}
                aria-label="Minimum price"
              />
              <input
                className="range-input"
                type="range"
                min={0}
                max={maxPriceBound}
                value={isNaN(parseFloat(priceMax)) ? maxPriceBound : Math.max(parseFloat(priceMax), isNaN(parseFloat(priceMin))? 0 : parseFloat(priceMin))}
                onChange={(e)=>{
                  const currentMin = isNaN(parseFloat(priceMin)) ? 0 : parseFloat(priceMin)
                  const v = Math.min(maxPriceBound, Math.max(Number(e.target.value)||0, currentMin))
                  setPriceMax(String(v))
                }}
                aria-label="Maximum price"
              />
            </div>
            <div className="filter-options" style={{ display:'grid', gap:8 }}>
              <label style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ opacity:0.75, minWidth:36 }}>Min</span>
                <input type="number" inputMode="decimal" placeholder="0" value={priceMin} onChange={(e)=>setPriceMin(e.target.value)} style={{ ...inputStyle, marginTop:0 }} />
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ opacity:0.75, minWidth:36 }}>Max</span>
                <input type="number" inputMode="decimal" placeholder="9999" value={priceMax} onChange={(e)=>setPriceMax(e.target.value)} style={{ ...inputStyle, marginTop:0 }} />
              </label>
            </div>
            <div className="chip-row">
              <button type="button" className="chip" onClick={()=>{ setPriceMin(''); setPriceMax('50') }}>Under $50</button>
              <button type="button" className="chip" onClick={()=>{ setPriceMin('50'); setPriceMax('100') }}>$50 – $100</button>
              <button type="button" className="chip" onClick={()=>{ setPriceMin('100'); setPriceMax('200') }}>$100 – $200</button>
              <button type="button" className="chip" onClick={()=>{ setPriceMin('200'); setPriceMax('') }}>$200+</button>
              <button type="button" className="chip" onClick={()=>{ setPriceMin(''); setPriceMax(''); }}>Clear</button>
            </div>
          </div>

          {/* SORT BY */}
          <div className="filter-section filter-card" style={{ marginTop: 12 }}>
            <h3 style={{ marginTop: 0 }}>SORT BY</h3>
            <select value={sortBy} onChange={(e)=> setSortBy(e.target.value as 'newest'|'price-low'|'price-high'|'rating'|'featured-only')} style={inputStyle} aria-label="Sort products">
              <option value="newest">Newest</option>
              <option value="featured-only">Featured only</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <div className="chip-row" style={{ marginTop: 10 }}>
              <button type="button" className="chip" onClick={()=>{
                setSortBy('newest');
                setPriceMin('');
                setPriceMax('');
              }}>Reset</button>
            </div>
          </div>

            {/* Eliminat dropdown duplicat SORT BY */}
        </aside>

        {/* Main Content */}
        <div className="products-main">
          {/* Top toolbar sort */}
          <div className="collection-toolbar">
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <label style={{ opacity:.8, fontSize:12 }}>Sort</label>
              <select value={sortBy} onChange={(e)=> setSortBy(e.target.value as 'newest'|'price-low'|'price-high'|'rating'|'featured-only')} style={inputStyle} aria-label="Sort products (top)">
                <option value="newest">Newest</option>
                <option value="featured-only">Featured only</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
            <button type="button" className="chip" onClick={()=>{ setSortBy('newest'); setPriceMin(''); setPriceMax(''); }}>Reset</button>
          </div>
          {loading ? (
            <div className="loading-center">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="products-grid-large">
              {products
                .filter(p => {
                  const v = Number(p.price)
                  const min = parseFloat(priceMin)
                  const max = parseFloat(priceMax)
                  if (sortBy === 'featured-only' && !isFeatured(p)) return false
                  if (!isNaN(min) && v < min) return false
                  if (!isNaN(max) && v > max) return false
                  return true
                })
                .map(product => (
                <div
                  key={product._id}
                  className="product-card-large"
                  role="button"
                  tabIndex={0}
                  onClick={() => setQuickView(product)}
                  onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); setQuickView(product); } }}
                  style={{ cursor:'pointer' }}
                >
                  <div className="product-image-container">
                      {(((product as any)?.featured === true) || ((product as any)?.isFeatured === true) || ((product as any)?.featured === 'true') || (Array.isArray((product as any)?.tags) && (product as any).tags.some((t:any)=> String(t).toLowerCase()==='featured'))) && (
                        <span className="featured-badge">FEATURED</span>
                      )}
                      <img src={resolveImageUrl(product.image)} alt={product.name} className="product-image-large" style={{ width: '100%', height: '100%', maxWidth: '400px', maxHeight: '400px', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
                    {product.stock < 10 && product.stock > 0 && (
                      <span className="stock-badge">Only {product.stock} left</span>
                    )}
                    {product.stock === 0 && (
                      <span className="out-of-stock">Out of Stock</span>
                    )}
                  </div>

                  <div className="product-details">
                    <h3 className="product-title" style={{ marginBottom: 6 }}>
                      {product.name}
                      {(((product as any)?.featured === true) || ((product as any)?.isFeatured === true) || ((product as any)?.featured === 'true') || (Array.isArray((product as any)?.tags) && (product as any).tags.some((t:any)=> String(t).toLowerCase()==='featured'))) && (
                        <span className="featured-tag" style={{ marginLeft: 8 }}>Featured</span>
                      )}
                    </h3>
                    <div className="product-footer" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span className="product-price">${product.price}</span>
                      {product.rating && (
                        <span className="product-rating">⭐ {product.rating.toFixed(1)}</span>
                      )}
                    </div>
                    {/* Click the card to open quick view */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>

      {quickView && (
        <div style={modalBackdrop} onClick={() => setQuickView(null)}>
          <div style={modalPanel} className="quick-view-panel" onClick={(e)=>e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <h3 style={{ margin:0 }}>{quickView.name}</h3>
              <button type='button' onClick={()=>setQuickView(null)} style={miniBtn}>Close</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:16 }}>
              <div style={{ background:'#000', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', minHeight:260 }}>
                <img src={resolveImageUrl(quickView.image)} alt={quickView.name} style={{ maxWidth:'100%', maxHeight:320, objectFit:'contain' }} />
              </div>
              <div>
                <div style={{ opacity:0.85, marginBottom:10 }}>{(quickView.description || '').slice(0, 240)}</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
                  {quickView.size?.length > 0 && (
                    <label style={labelStyle}>Size<select
                      style={inputStyle}
                      value={selectedSize[quickView._id!] || quickView.size[0] || ''}
                      onChange={(e)=> setSelectedSize({ ...selectedSize, [quickView._id!]: e.target.value })}
                    >
                      {quickView.size.map(s => <option key={s} value={s}>{s}</option>)}
                    </select></label>
                  )}
                  {quickView.color?.length > 0 && (
                    <label style={labelStyle}>Color<select
                      style={inputStyle}
                      value={selectedColor[quickView._id!] || quickView.color[0] || ''}
                      onChange={(e)=> setSelectedColor({ ...selectedColor, [quickView._id!]: e.target.value })}
                    >
                      {quickView.color.map(c => <option key={c} value={c}>{c}</option>)}
                    </select></label>
                  )}
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14 }}>
                  <div style={{ fontSize:18, fontWeight:800 }}>${quickView.price}</div>
                  <button
                    onClick={() => { handleAddToCart(quickView); setQuickView(null); }}
                    disabled={quickView.stock === 0}
                    className="gvng-cart-btn"
                    aria-label={quickView.stock === 0 ? 'Out of stock' : 'Add to cart'}
                    style={getButtonStyle(quickView.stock === 0)}
                  >
                    <span style={getButtonLabelStyle(quickView.stock === 0)}>
                      {quickView.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = { width:'100%', background:'#0b0b0b', color:'#fff', border:'1px solid #333', borderRadius:6, padding:'8px 10px', marginTop:4 }
const labelStyle: React.CSSProperties = { display:'grid', gap:4, fontSize:14 }
const miniBtn: React.CSSProperties = { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', color: '#eaeaea', border: '1px solid #2d2d2d', borderRadius: 999, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }
const modalBackdrop: React.CSSProperties = { position:'fixed', inset:0 as unknown as number, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(12px) saturate(140%)', WebkitBackdropFilter:'blur(12px) saturate(140%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, zIndex:999 }
const modalPanel: React.CSSProperties = { width:'min(900px, 92vw)', background:'rgba(20,20,22,0.92)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:22, boxShadow:'0 10px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)' }
