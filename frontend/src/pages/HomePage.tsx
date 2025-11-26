import { useState, useEffect, useRef } from 'react'
import { getProducts } from '../services/productService'
import { fetchAdminProducts } from '../services/adminProductService'
import { Product } from '../types'
import { useCart } from '../utils/useCart'

import { useLanguage } from '../utils/LanguageContext';

export default function HomePage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroTitle, setHeroTitle] = useState(t('hero_title'));
  // Typewriter for hero title
  const fullTextRef = useRef<string>(t('hero_title'));
  const [typedText, setTypedText] = useState('');
  const [typePhase, setTypePhase] = useState<'typing'|'pause'|'erasing'>('typing');
  const [typeIndex, setTypeIndex] = useState(0);
  const typeTimerRef = useRef<number | null>(null);
  const [heroSubtitle, setHeroSubtitle] = useState(t('hero_subtitle'));
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  // Two-phase modal for smooth animations
  const [modalVisible, setModalVisible] = useState(false) // mounted in DOM
  const [modalShown, setModalShown] = useState(false)     // animated in
  const [modalSize, setModalSize] = useState('')
  const [modalColor, setModalColor] = useState('')
  const { addToCart } = useCart()
  // Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [carouselPaused, setCarouselPaused] = useState(false)
  const carouselRef = useRef<HTMLDivElement | null>(null)
  // Page loading overlay control (show on every HomePage entry)
  const [showPageLoader, setShowPageLoader] = useState<boolean>(true)
  const [overlayOpaque, setOverlayOpaque] = useState(true)
  const [loaderMounted, setLoaderMounted] = useState(false)
  const [minPassed, setMinPassed] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const [heroMediaReady, setHeroMediaReady] = useState(false)
  const [fallbackElapsed, setFallbackElapsed] = useState(false)
  

  
  const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5000';
  const resolveImageUrl = (url?: string) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
    if (url.startsWith('/uploads/')) return `${API_BASE}${url}`
    return url
  }
  // Touch swipe state
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchDeltaX, setTouchDeltaX] = useState(0)
  const [didSwipe, setDidSwipe] = useState(false)
  // Close modal with ESC
  useEffect(() => {
    if (!modalVisible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalVisible])

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product)
    setModalSize(product.size?.[0] || 'M')
    setModalColor(product.color?.[0] || 'Black')
    setModalVisible(true)
    // next frame -> trigger transition
    requestAnimationFrame(() => setModalShown(true))
  }

  const handleCloseModal = () => {
    setModalShown(false)
    // wait for transition end before unmount
    setTimeout(() => {
      setModalVisible(false)
      setSelectedProduct(null)
    }, 240)
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts({ limit: 24 })
        let admin: Product[] = []
        try {
          const a = await fetchAdminProducts()
          admin = Array.isArray(a) ? (a as Product[]) : []
        } catch {}
        const merged = [...admin, ...data]
        // De-duplicate before selecting featured
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
        // Only include items explicitly marked as featured (no test injections, no clones)
        let featured = deduped.filter(p => (p as any).isFeatured === true)
        setProducts(featured)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setLoading(false)
      }
    }
    fetchProducts()

    // Load saved hero text from localStorage
    const savedTitle = localStorage.getItem('heroTitle')
    const savedSubtitle = localStorage.getItem('heroSubtitle')
    if (savedTitle) {
      setHeroTitle(savedTitle)
      fullTextRef.current = savedTitle
    }
    if (savedSubtitle) setHeroSubtitle(savedSubtitle)
  }, [])

  // Mark fonts ready (if supported) to avoid text jank behind loader
  useEffect(() => {
    let cancelled = false
    try {
      if ((document as any).fonts && (document as any).fonts.ready) {
        ;(document as any).fonts.ready.then(() => {
          if (!cancelled) setFontsReady(true)
        }).catch(() => {
          if (!cancelled) setFontsReady(true)
        })
      } else {
        setFontsReady(true)
      }
    } catch {
      setFontsReady(true)
    }
    return () => { cancelled = true }
  }, [])

  // Preload first hero/product image (if any) to avoid flicker
  useEffect(() => {
    if (products && products.length > 0) {
      const src = resolveImageUrl(products[0].image)
      if (src) {
        const img = new Image()
        const done = () => setHeroMediaReady(true)
        img.onload = done
        img.onerror = done
        img.src = src
        return () => {
          img.onload = null
          img.onerror = null
        }
      }
    }
    // If no products or no image, don't block on media
    const t = setTimeout(() => setHeroMediaReady(true), 100)
    return () => clearTimeout(t)
  }, [products])

  // Typewriter effect controller
  useEffect(() => {
    // Clear any previous timer
    if (typeTimerRef.current) {
      window.clearTimeout(typeTimerRef.current)
      typeTimerRef.current = null
    }

    const full = fullTextRef.current
    const isDone = typeIndex >= full.length

    if (typePhase === 'typing') {
      if (!isDone) {
        typeTimerRef.current = window.setTimeout(() => {
          setTypedText(full.slice(0, typeIndex + 1))
          setTypeIndex(typeIndex + 1)
        }, 90)
      } else {
        // Small pause when fully typed
        typeTimerRef.current = window.setTimeout(() => {
          setTypePhase('pause')
        }, 900)
      }
    } else if (typePhase === 'pause') {
      // After pause, start erasing
      typeTimerRef.current = window.setTimeout(() => {
        setTypePhase('erasing')
      }, 600)
    } else if (typePhase === 'erasing') {
      if (typeIndex > 0) {
        typeTimerRef.current = window.setTimeout(() => {
          setTypedText(full.slice(0, typeIndex - 1))
          setTypeIndex(typeIndex - 1)
        }, 50)
      } else {
        // Restart typing
        typeTimerRef.current = window.setTimeout(() => {
          setTypePhase('typing')
        }, 300)
      }
    }

    return () => {
      if (typeTimerRef.current) {
        window.clearTimeout(typeTimerRef.current)
        typeTimerRef.current = null
      }
    }
  }, [typePhase, typeIndex])

  // Live update hero content on admin save or cross-tab storage changes
  useEffect(() => {
    const apply = () => {
      try {
        const t = localStorage.getItem('heroTitle') || 'GVNG 2025'
        const s = localStorage.getItem('heroSubtitle') || 'Discover premium quality clothing and accessories'
        setHeroTitle(t)
        setHeroSubtitle(s)
        fullTextRef.current = t
        setTypeIndex(0)
        setTypedText('')
        setTypePhase('typing')
      } catch {}
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'heroTitle' || e.key === 'heroSubtitle') apply()
    }
    const onCustom = () => apply()
    window.addEventListener('storage', onStorage)
    window.addEventListener('heroContentUpdated', onCustom as EventListener)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('heroContentUpdated', onCustom as EventListener)
    }
  }, [])

  // Fade out loading overlay shortly after data is ready
  // Ensure loader is visible at least a short time for perceived performance
  useEffect(() => {
    const t = setTimeout(() => setMinPassed(true), 1200)
    return () => clearTimeout(t)
  }, [])

  // Safety fallback: ensure we never get stuck more than ~5s
  useEffect(() => {
    const t = setTimeout(() => setFallbackElapsed(true), 3200)
    return () => clearTimeout(t)
  }, [])

  // Final safety: hard-hide overlay even if something misfires
  useEffect(() => {
    const killer = setTimeout(() => {
      setOverlayOpaque(false)
      setShowPageLoader(false)
    }, 6000)
    return () => clearTimeout(killer)
  }, [])

  // Fade out overlay after data is ready and minimum time elapsed
  useEffect(() => {
    if (!showPageLoader) return
    const readyByAssets = !loading && minPassed && fontsReady && heroMediaReady
    const ready = readyByAssets || fallbackElapsed
    if (ready) {
      setOverlayOpaque(false)
      const t = setTimeout(() => setShowPageLoader(false), 420)
      return () => clearTimeout(t)
    }
  }, [showPageLoader, loading, minPassed, fontsReady, heroMediaReady, fallbackElapsed])

  // Animate loader content in smoothly when shown
  useEffect(() => {
    if (!showPageLoader) { setLoaderMounted(false); return }
    let raf = requestAnimationFrame(() => setLoaderMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [showPageLoader])

  // While loader is showing, prevent body scroll so content doesn't show/shift behind it
  useEffect(() => {
    try {
      if (showPageLoader) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    } catch {}
    return () => {
      try { document.body.style.overflow = '' } catch {}
    }
  }, [showPageLoader])

  // Carousel autoplay
  useEffect(() => {
    if (!products || products.length === 0 || carouselPaused) return
    const t = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % products.length)
    }, 4200)
    return () => clearInterval(t)
  }, [products, carouselPaused])

  return (
    <div className="home-page">
      {/* Page Loading Overlay */}
      {showPageLoader && (
        <div
          aria-label="Loading"
          className="overlay-loading"
          style={{
            position: 'fixed',
            inset: 0,
            // Opaque base to fully hide underlying content, with neon radial on top
            background: 'radial-gradient(60% 60% at 50% 50%, rgba(230,255,0,0.06) 0%, rgba(0,0,0,0.85) 60%, #000 100%), #000',
            display: 'block',
            zIndex: 2000,
            opacity: overlayOpaque ? 1 : 0,
            transition: 'opacity 420ms ease',
            pointerEvents: overlayOpaque ? 'auto' : 'none'
          }}
        >
          <div style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: loaderMounted ? 'translate(-50%,-50%) scale(1)' : 'translate(-50%,-50%) translateY(6px) scale(0.98)',
            opacity: loaderMounted ? 1 : 0,
            transition: 'opacity 260ms ease, transform 260ms ease',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2.25rem',
              fontWeight: 900,
              letterSpacing: 2,
              fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
              background: 'linear-gradient(90deg,#E6FF00,#8BFF5A,#00FFC8)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 12px rgba(230,255,0,0.25)'
            }}>GVNG</div>
            
          </div>
        </div>
      )}
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1
            className="hero-title"
            aria-label={heroTitle}
            style={{
              position: 'relative',
              background: 'linear-gradient(90deg,#E6FF00,#B6FF3F,#9EFF00,#E6FF00)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 20px rgba(230,255,0,0.18)',
              animation: 'gvng-shimmer 3.5s linear infinite'
            }}
          >
            <span className="tw-text">{typedText}</span>
            <span className="tw-caret" aria-hidden="true"></span>
          </h1>
          <p className="hero-subtitle">{heroSubtitle}</p>
        </div>
        <div className="hero-overlay"></div>
      </section>

      {/* Scoped typewriter styles (spinner CSS moved to App.css to avoid animation resets) */}
      <style>
        {`
        @keyframes gvng-blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
        @keyframes gvng-shimmer {
          0% { background-position: 0% 50% }
          100% { background-position: 200% 50% }
        }
        @keyframes gvng-pulse {
          0%, 100% { text-shadow: 0 0 12px rgba(230,255,0,0.25), 0 0 24px rgba(230,255,0,0.12) }
          50% { text-shadow: 0 0 18px rgba(230,255,0,0.45), 0 0 36px rgba(230,255,0,0.24) }
        }
        .hero-title {
          background-size: 200% auto;
        }
        .tw-caret {
          display: inline-block;
          width: 10px;
          height: 1.2em;
          margin-left: 4px;
          background: #E6FF00;
          box-shadow: 0 0 8px rgba(230,255,0,0.6);
          animation: gvng-blink 1s steps(1,end) infinite;
          vertical-align: -0.15em;
        }
        .tw-text {
          text-shadow: 0 0 12px rgba(230,255,0,0.25), 0 0 24px rgba(230,255,0,0.12);
          animation: gvng-pulse 2.6s ease-in-out infinite;
        }
        `}
      </style>


      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <div className="feature-item">
            <div className="feature-icon">🚚</div>
            <h3>{t('free_shipping')}</h3>
            <p>{t('free_shipping_description')}</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">↩️</div>
            <h3>{t('easy_returns')}</h3>
            <p>{t('easy_returns_description')}</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <h3>{t('secure_payment')}</h3>
            <p>{t('secure_payment_description')}</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⭐</div>
            <h3>{t('best_quality')}</h3>
            <p>{t('best_quality_description')}</p>
          </div>
        </div>
      </section>

      {/* Featured Products (Carousel) */}
      <section className="featured">
        <div className="section-header">
          <h2>{t('featured_products')}</h2>
          <div className="header-line"></div>
        </div>

        {loading ? (
          // Suppress inner loading UI while full-page loader is visible to avoid double spinners/flicker
          showPageLoader ? null : (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          )
        ) : products.length > 0 ? (
          <div
            className="products-carousel"
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured products"
            tabIndex={0}
            onMouseEnter={() => setCarouselPaused(true)}
            onMouseLeave={() => setCarouselPaused(false)}
            onKeyDown={(e) => {
              if (modalVisible) return
              if (e.key === 'ArrowRight') {
                e.preventDefault()
                setCarouselIndex((i) => (i + 1) % products.length)
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault()
                setCarouselIndex((i) => (i - 1 + products.length) % products.length)
              }
            }}
            ref={carouselRef}
            onTouchStart={(e) => {
              if (e.touches && e.touches.length > 0) {
                setTouchStartX(e.touches[0].clientX)
                setTouchDeltaX(0)
                setDidSwipe(false)
                setCarouselPaused(true)
              }
            }}
            onTouchMove={(e) => {
              if (touchStartX !== null && e.touches && e.touches.length > 0) {
                const dx = e.touches[0].clientX - touchStartX
                setTouchDeltaX(dx)
                if (Math.abs(dx) > 8) setDidSwipe(true)
              }
            }}
            onTouchEnd={() => {
              if (touchStartX !== null) {
                if (Math.abs(touchDeltaX) > 50) {
                  if (touchDeltaX < 0) {
                    setCarouselIndex((i) => (i + 1) % products.length)
                  } else {
                    setCarouselIndex((i) => (i - 1 + products.length) % products.length)
                  }
                }
              }
              setTouchStartX(null)
              setTouchDeltaX(0)
              // keep didSwipe true until next tap to suppress accidental modal
              setCarouselPaused(false)
            }}
            style={{ position: 'relative', height: 560, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1200 }}
          >
            {(() => {
              const len = products.length
              let slides: { idx: number, pos: -1 | 0 | 1, isCenter: boolean }[] = []
              if (len >= 3) {
                const prev = (carouselIndex - 1 + len) % len
                const cur = carouselIndex
                const next = (carouselIndex + 1) % len
                slides = [
                  { idx: prev, pos: -1, isCenter: false },
                  { idx: cur, pos: 0, isCenter: true },
                  { idx: next, pos: 1, isCenter: false },
                ]
              } else if (len === 2) {
                const cur = carouselIndex
                const other = (carouselIndex + 1) % 2
                slides = [
                  { idx: cur, pos: 0, isCenter: true },
                  { idx: other, pos: 1, isCenter: false },
                ]
              } else if (len === 1) {
                const cur = carouselIndex % len
                slides = [ { idx: cur, pos: 0, isCenter: true } ]
              }
              return slides.map(({ idx, pos, isCenter }) => {
                const p = products[idx]
                const tx = pos * 260
                const scale = isCenter ? 1 : 0.88
                const z = isCenter ? 5 : 3
                const opacity = isCenter ? 1 : 0.82
                const ry = isCenter ? 0 : (pos < 0 ? 14 : -14)
                return (
                <div
                  key={p._id}
                  onClick={() => {
                    if (didSwipe) { setDidSwipe(false); return }
                    if (isCenter) {
                      handleOpenModal(p)
                    } else {
                      setCarouselIndex(idx)
                    }
                  }}
                  style={{
                    position: 'absolute',
                    width: 'min(380px, 86vw)',
                    transform: `translate3d(${tx}px, 0, 0) rotateY(${ry}deg) scale(${scale})`,
                    transition: 'transform 650ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 650ms ease',
                    willChange: 'transform, opacity',
                    zIndex: z,
                    opacity,
                    cursor: isCenter ? 'pointer' : 'pointer',
                  }}
                >
                  {/* Neon glow behind center card */}
                  <div style={{ position: 'absolute', inset: 0, display: isCenter ? 'block' : 'none', zIndex: 1, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', left: '50%', top: '55%', transform: 'translate(-50%,-50%)', width: '80%', height: '70%', borderRadius: 20, filter: 'blur(18px)', background: 'radial-gradient(60% 60% at 50% 50%, rgba(230,255,0,0.35) 0%, rgba(230,255,0,0.05) 70%, rgba(0,0,0,0) 100%)' }} />
                  </div>
                  {/* Gradient border wrapper */}
                  <div style={{ background: 'linear-gradient(135deg, #E6FF00 0%, #2aff9b 50%, #00ffc8 100%)', padding: 1, borderRadius: 14, position: 'relative', zIndex: 2 }}>
                    {(p as any).isFeatured && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        backgroundColor: 'rgba(255, 215, 0, 0.9)',
                        color: '#1a1a1a',
                        padding: '0.3rem 0.7rem',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        zIndex: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(4px)',
                      }}>
                        Featured
                      </div>
                    )}
                    <div className="product-card" style={{ background: '#0e0e0f', borderRadius: 12, overflow: 'hidden', border: '1px solid #1f1f1f', boxShadow: isCenter ? '0 14px 40px rgba(0,0,0,0.55)' : '0 10px 24px rgba(0,0,0,0.4)' }}>
                    <div className="product-image-wrapper" style={{ position: 'relative' }}>
                      <img src={resolveImageUrl(p.image)} alt={p.name} className="product-image" style={{ width: '100%', height: 340, objectFit: 'contain', display: 'block', background: '#0b0b0b', filter: isCenter ? 'none' : 'saturate(0.85) contrast(0.95)' }} />
                      {isCenter && (
                        <div className="product-overlay" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'end', justifyContent: 'center', padding: 16, background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)', zIndex: 5, pointerEvents: 'auto' }}>
                          <button
                            type="button"
                            className="view-btn"
                            onClick={() => handleOpenModal(p)}
                            style={{ background: '#E6FF00', color: '#111', border: '2px solid #E6FF00', borderRadius: 8, padding: '10px 16px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 14px rgba(230,255,0,0.55)' }}
                          >
                            {t('view_details')}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="product-info" style={{ padding: '12px 14px' }}>
                      <h3 className="product-name">{p.name}</h3>
                      <p className="product-category">{p.category.toUpperCase()}</p>
                      <p className="product-price">${p.price}</p>
                    </div>
                    </div>
                  </div>
                </div>
              )})
            })()}

            {/* Nav arrows */}
            {products.length >= 3 && (
              <>
                <button
                  aria-label="Previous"
                  onClick={() => setCarouselIndex((i) => (i - 1 + products.length) % products.length)}
                  style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: '#1b1b1b', color: '#fff', border: '1px solid #333', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', zIndex: 10 }}
                >
                  ‹
                </button>
                <button
                  aria-label="Next"
                  onClick={() => setCarouselIndex((i) => (i + 1) % products.length)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: '#1b1b1b', color: '#fff', border: '1px solid #333', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', zIndex: 10 }}
                >
                  ›
                </button>
              </>
            )}

            {/* Dots */}
            <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
              {products.length >= 3 ? (
                products.map((_, i) => (
                  <button key={i}
                    onClick={() => setCarouselIndex(i)}
                    aria-label={`Go to slide ${i+1}`}
                    aria-current={i === carouselIndex ? 'true' : undefined}
                    style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', background: i === carouselIndex ? '#E6FF00' : '#2a2a2a', boxShadow: i === carouselIndex ? '0 0 10px rgba(230,255,0,0.6)' : 'none', cursor: 'pointer', padding: 0 }}
                  />
                ))
              ) : (
                <button
                  aria-label={'Single slide'}
                  aria-current={'true'}
                  style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', background: '#E6FF00', boxShadow: '0 0 10px rgba(230,255,0,0.6)', cursor: 'default', padding: 0 }}
                />
              )}
            </div>
          </div>
        ) : (
          <p className="no-products">No products available</p>
        )}

        <div className="view-all">
          <a href="/products" className="view-all-btn">{t('view_all_collection')}</a>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter">
        <div className="newsletter-content">
          <h2>{t('subscribe_newsletter')}</h2>
          <p>{t('subscribe_newsletter_description')}</p>
          <form className="newsletter-form">
            <input type="email" placeholder={t('enter_your_email')} required />
            <button type="submit">{t('subscribe')}</button>
          </form>
        </div>
      </section>

      {/* Product Modal */}
      {modalVisible && selectedProduct && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal()
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            opacity: modalShown ? 1 : 0,
            transition: 'opacity 220ms ease',
            backdropFilter: modalShown ? 'blur(2px)' : 'blur(0px)'
          }}
        >
          <div style={{
            width: 'min(900px, 92vw)',
            background: '#0e0e0f',
            border: '1px solid #222',
            borderRadius: 12,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            opacity: modalShown ? 1 : 0,
            transform: modalShown ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)',
            transition: 'opacity 240ms ease, transform 240ms ease'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: 24 }}>
              <div style={{ background: '#0b0b0b', border: '1px solid #222', borderRadius: 8, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={resolveImageUrl(selectedProduct.image)} alt={selectedProduct.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <h2 style={{ marginTop: 0 }}>{selectedProduct.name}</h2>
                <p style={{ opacity: 0.9 }}>{selectedProduct.description}</p>
                <div style={{ display: 'flex', gap: 16, margin: '12px 0' }}>
                  {selectedProduct.size?.length > 0 && (
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span>{t('size')}</span>
                      <select value={modalSize} onChange={(e) => setModalSize(e.target.value)} style={{ background: '#0b0b0b', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '8px 10px' }}>
                        {selectedProduct.size.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  {selectedProduct.color?.length > 0 && (
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span>{t('color')}</span>
                      <select value={modalColor} onChange={(e) => setModalColor(e.target.value)} style={{ background: '#0b0b0b', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '8px 10px' }}>
                        {selectedProduct.color.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>${selectedProduct.price}</div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={handleCloseModal}
                      style={{ background: '#1b1b1b', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: '10px 16px', cursor: 'pointer' }}
                    >
                      {t('close')}
                    </button>
                    <button
                      onClick={() => {
                        addToCart(selectedProduct, 1, modalSize || selectedProduct.size?.[0] || 'M', modalColor || selectedProduct.color?.[0] || 'Black')
                        handleCloseModal()
                        alert('✅ Added to cart!')
                      }}
                      style={{ background: '#E6FF00', color: '#111', border: '2px solid #E6FF00', borderRadius: 8, padding: '10px 16px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 14px rgba(230,255,0,0.55)' }}
                    >
                      {t('add_to_cart')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
