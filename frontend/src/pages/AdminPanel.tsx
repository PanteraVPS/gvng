import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { login, getCurrentUser } from '../services/authService';
import { Product, User } from '../types'
import { fetchAdminProducts, deleteAdminProduct } from '../services/adminProductService'
import { updateUser, getAllUsers } from '../services/adminUserService';

const CATEGORIES = ['men','women','kids','accessories','gvng']

interface AdminEditing extends Omit<Product, 'createdAt' | 'isFeatured'> {
  createdAt?: string | Date;
  isFeatured?: boolean;
}

export default function AdminPanel() {
  const getApiBase = () => {
    if (import.meta.env.PROD) return '';
    return 'http://localhost:5000';
  };
  const API_BASE = getApiBase();
  const [auth, setAuth] = useState<boolean>(!!getCurrentUser());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [customProducts, setCustomProducts] = useState<AdminEditing[]>([]);
  const empty: AdminEditing = { _id: '', name: '', description: '', price: 0, category: 'men', size: [], color: [], stock: 0, image: '', rating: 0, createdAt: undefined, isFeatured: false };
  const [editing, setEditing] = useState<AdminEditing>(empty);
  const [isEdit, setIsEdit] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{ firstName: string; lastName: string; email: string; role: string; password?: string; banned?: boolean }>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'customer',
    password: '',
    banned: false
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string>('');
    // User edit modal logic
    const openEditUserModal = (user: User) => {
      setEditingUser(user);
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || 'customer',
        password: '',
        banned: !!user.banned
      });
      setEditError('');
      setEditLoading(false);
    };

    const closeEditUserModal = () => {
      setEditingUser(null);
      setEditError('');
      setEditLoading(false);
    };

    const handleUserUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingUser) return;
      setEditLoading(true);
      setEditError('');
      try {
        await updateUser(editingUser._id || '', editForm);
        setUsers((prev) => prev.map((u) => (u._id === editingUser._id ? { ...u, ...editForm } : u)));
        closeEditUserModal();
        showToast('User updated successfully');
      } catch (err: any) {
        setEditError(normalizeError(err));
      } finally {
        setEditLoading(false);
      }
    };
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard'|'products'|'users'|'settings'|'categories'>('dashboard');
  const [categories, setCategories] = useState<string[]>(['men','women','kids','accessories','gvng','other']);
  const DEFAULT_CATEGORY = 'other';
  // Price filter removed from Admin toolbar per request
  const [socialLinks, setSocialLinks] = useState<{ instagram: string; facebook: string; twitter: string }>({ instagram: '', facebook: '', twitter: '' });
  const [heroTitleAdmin, setHeroTitleAdmin] = useState<string>('');
  const [heroSubtitleAdmin, setHeroSubtitleAdmin] = useState<string>('');
  const [maintenanceEnabled, setMaintenanceEnabled] = useState<boolean>(false);
  const [maintenanceTitle, setMaintenanceTitle] = useState<string>("We'll be back soon");
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>('We are performing scheduled maintenance. Please check back shortly.');
  const [maintenanceBg, setMaintenanceBg] = useState<string>('');
  const [maintenanceBgError, setMaintenanceBgError] = useState<string>('');
  const [maintenanceOverlay, setMaintenanceOverlay] = useState<number>(0.65);
  const [maintenanceBgSize, setMaintenanceBgSize] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<{ totalOrders: number; itemsSold: number; totalProfit: number; currency: string }>({ totalOrders: 0, itemsSold: 0, totalProfit: 0, currency: 'USD' });
  const [trend, setTrend] = useState<Array<{ date: string; orders: number; items: number; revenue: number }>>([]);
  const [trendDays, setTrendDays] = useState<number>(30);
  const [customDaysInput, setCustomDaysInput] = useState<string>('30');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [breakdown, setBreakdown] = useState<{ byCategory: Array<{ category: string; items: number; revenue: number; orders: number }>; byFeatured: Array<{ isFeatured: boolean; items: number; revenue: number; orders: number }> }>({ byCategory: [], byFeatured: [] });
  const [settingsSocialOpen, setSettingsSocialOpen] = useState(true);
  const [settingsHeroOpen, setSettingsHeroOpen] = useState(true);
  const [toast, setToast] = useState<{ msg: string; visible: boolean }>({ msg: '', visible: false });
  const toastTimerRef = useRef<number | null>(null);
  const showToast = (msg: string) => {
    try {
      setToast({ msg, visible: true });
      if (toastTimerRef.current) { window.clearTimeout(toastTimerRef.current); toastTimerRef.current = null; }
      toastTimerRef.current = window.setTimeout(() => setToast({ msg: '', visible: false }), 1800);
    } catch {}
  };
  // Removed localStorage import/export to ensure DB is the only source of truth
  
  
  const resolveImageUrl = (url?: string) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
    const API_BASE = getApiBase();
    if (url.startsWith('/uploads/')) return `${API_BASE}${url}`
    return url
  }

  const normalizeError = (err: any): string => {
    try {
      if (!err) return 'Unknown error';
      if (typeof err === 'string') return err;
      if (err.response && err.response.data) {
        const d = err.response.data;
        if (typeof d === 'string') return d;
        if (d.message && typeof d.message === 'string') return d.message;
        if (d.error && typeof d.error === 'string') return d.error;
        if (d.errors && typeof d.errors === 'object') return JSON.stringify(d.errors);
        return JSON.stringify(d);
      }
      if (err.message && typeof err.message === 'string') return err.message;
      if (err.error && typeof err.error === 'string') return err.error;
      return JSON.stringify(err);
    } catch {
      return 'Unknown error';
    }
  };

  const dedupeByFingerprint = (items: AdminEditing[]): AdminEditing[] => {
    const seen = new Set<string>();
    const out: AdminEditing[] = [];
    for (const p of items) {
      const key = [
        (p.name||'').trim().toLowerCase(),
        (p.category||'').trim().toLowerCase(),
        String(p.price||0),
        (p.image||'')
      ].join('|');
      if (!seen.has(key)) { seen.add(key); out.push(p); }
    }
    return out;
  };

  const saveCategories = (list: string[]) => {
    const unique = Array.from(new Set(list.map(c => (c || '').trim().toLowerCase()).filter(Boolean)));
    if (!unique.includes(DEFAULT_CATEGORY)) unique.push(DEFAULT_CATEGORY);
    setCategories(unique);
    try { localStorage.setItem('admin.categories', JSON.stringify(unique)); } catch {}
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = new Set(['image/jpeg','image/png','image/webp','image/gif']);
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (!allowed.has(file.type)) {
      setErrorMsg('Unsupported image type. Allowed: JPEG, PNG, WEBP, GIF.');
      return;
    }
    if (file.size > maxBytes) {
      setErrorMsg('Image too large. Max 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditing({ ...editing, image: reader.result as string });
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setEditing({ ...editing, image: '' });
    try { if (fileInputRef.current) fileInputRef.current.value = ''; } catch {}
  };

  useEffect(() => {
    if (auth) {
      fetchAdminProducts().then(data => setCustomProducts(dedupeByFingerprint(data as AdminEditing[])));
      getAllUsers().then(data => setUsers(data));
    }
  }, [auth]);

  useEffect(() => {
    if (!auth) return;
    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/metrics/sales`);
        if (!resp.ok) return;
        const j = await resp.json();
        setMetrics({
          totalOrders: Number(j.totalOrders || 0),
          itemsSold: Number(j.itemsSold || 0),
          totalProfit: Number(j.totalProfit || 0),
          currency: typeof j.currency === 'string' ? j.currency : 'USD'
        });
      } catch {}
    })();
  }, [auth]);

  useEffect(() => {
    setCustomDaysInput(String(trendDays));
  }, [trendDays]);

  useEffect(() => {
    if (!auth) return;
    (async () => {
      try {
        const params = new URLSearchParams();
        if (startDate && endDate) {
          params.set('start', startDate);
          params.set('end', endDate);
        } else {
          params.set('days', String(trendDays));
        }
        const resp = await fetch(`${API_BASE}/api/metrics/sales/trend?${params.toString()}`);
        if (!resp.ok) return;
        const j = await resp.json();
        const series = Array.isArray(j.series) ? j.series : [];
        setTrend(series);
      } catch {}
    })();
  }, [auth, API_BASE, trendDays, startDate, endDate]);

  // Load categories from saved localStorage and derive from products
  useEffect(() => {
    if (!auth) return;
    try {
      const savedRaw = localStorage.getItem('admin.categories');
      const saved = savedRaw ? JSON.parse(savedRaw) : [];
      const fromProducts = Array.from(new Set(customProducts.map(p => (p.category || '').trim().toLowerCase()).filter(Boolean)));
      const base = Array.from(new Set([ ...CATEGORIES, DEFAULT_CATEGORY ]));
      const merged = Array.from(new Set([ ...base, ...fromProducts, ...(Array.isArray(saved) ? saved : []) ]));
      setCategories(merged);
    } catch {}
  }, [auth, customProducts]);

  useEffect(() => {
    if (!auth) return;
    try {
      setSocialLinks({
        instagram: localStorage.getItem('social.instagram') || '',
        facebook: localStorage.getItem('social.facebook') || '',
        twitter: localStorage.getItem('social.twitter') || ''
      });
      setHeroTitleAdmin(localStorage.getItem('heroTitle') || 'GVNG 2025');
      setHeroSubtitleAdmin(localStorage.getItem('heroSubtitle') || 'Discover premium quality clothing and accessories');
      const mentOn = (localStorage.getItem('maintenance.enabled') || 'false') === 'true';
      const mentTitle = localStorage.getItem('maintenance.title') || "We'll be back soon";
      const mentMsg = localStorage.getItem('maintenance.message') || 'We are performing scheduled maintenance. Please check back shortly.';
      const mentBg = localStorage.getItem('maintenance.bg') || '';
      const mentOv = parseFloat(localStorage.getItem('maintenance.overlay') || '0.65');
      setMaintenanceEnabled(mentOn);
      setMaintenanceTitle(mentTitle);
      setMaintenanceMessage(mentMsg);
      setMaintenanceBg(mentBg);
      if (!isNaN(mentOv)) setMaintenanceOverlay(Math.max(0, Math.min(0.9, mentOv)));
    } catch {}
  }, [auth]);

  useEffect(() => {
    if (!auth) return;
    (async () => {
      try {
        const params = new URLSearchParams();
        if (startDate && endDate) {
          params.set('start', startDate);
          params.set('end', endDate);
        } else {
          params.set('days', String(trendDays));
        }
        const resp = await fetch(`${API_BASE}/api/metrics/sales/breakdown?${params.toString()}`);
        if (!resp.ok) return;
        const j = await resp.json();
        setBreakdown({ byCategory: Array.isArray(j.byCategory) ? j.byCategory : [], byFeatured: Array.isArray(j.byFeatured) ? j.byFeatured : [] });
      } catch {}
    })();
  }, [auth, API_BASE, trendDays, startDate, endDate]);

  const handleLogin = async () => {
    try {
      await login(username, password);
      const user = getCurrentUser();
      if (user && user.role === 'admin') {
        setAuth(true);
      } else {
        alert('Invalid credentials or not an admin');
      }
    } catch (error) {
      alert('Login failed');
    }
  };

  const resetForm = () => { setEditing(empty); setIsEdit(false); setErrorMsg(''); setImageFile(null); };

  const validate = (p: Partial<AdminEditing>): string => {
    if (!p.name?.trim()) return 'Name required';
    if (!p.description?.trim()) return 'Description required';
    if (!(p.price && p.price > 0)) return 'Price must be > 0';
    if (!p.size || p.size.length === 0) return 'At least one size';
    if (!p.color || p.color.length === 0) return 'At least one color';
    if (!p.image) return 'Image is required';
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    (async () => {
      setSubmitting(true);
      const { _id, createdAt, ...prodData } = editing;
      const prod = { ...prodData, price: Number(editing.price), stock: Number(editing.stock), isFeatured: !!editing.isFeatured };
      
      const validationError = validate(prod);
      if (validationError) {
        setErrorMsg(validationError);
        setSubmitting(false);
        return;
      }

      try {
        const fd = new FormData();
        fd.append('name', prod.name);
        fd.append('description', prod.description);
        fd.append('price', String(prod.price));
        fd.append('stock', String(prod.stock || 0));
        fd.append('category', prod.category);
        if (prod.rating != null) fd.append('rating', String(prod.rating));
        if (Array.isArray(prod.size)) fd.append('size', prod.size.join(','));
        if (Array.isArray(prod.color)) fd.append('color', prod.color.join(','));
        fd.append('isFeatured', prod.isFeatured ? 'true' : 'false');
        if (imageFile) {
          fd.append('image', imageFile, imageFile.name);
        } else if (!isEdit) {
          // Create requires either a file or an http(s) URL
          if (editing.image && typeof editing.image === 'string') {
            if (editing.image.startsWith('http://') || editing.image.startsWith('https://')) {
              fd.append('image', editing.image);
            } else if (editing.image.startsWith('data:')) {
              throw new Error('Data URLs are not allowed. Please upload a file or provide an http(s) image URL.');
            } else {
              throw new Error('Image is required (file upload or http(s) URL).');
            }
          } else {
            throw new Error('Image is required (file upload or http(s) URL).');
          }
        } else if (isEdit && editing.image && typeof editing.image === 'string') {
          // For updates, only send if it's an http(s) URL; otherwise omit to keep existing
          if (editing.image.startsWith('http://') || editing.image.startsWith('https://')) {
            fd.append('image', editing.image);
          } else if (editing.image.startsWith('data:')) {
            throw new Error('Data URLs are not allowed. Please upload a file or provide an http(s) image URL.');
          }
        }

        const url = isEdit && _id
          ? `${API_BASE}/api/admin-products/${_id}`
          : `${API_BASE}/api/admin-products`;
        const method = isEdit && _id ? 'PUT' : 'POST';

        const resp = await fetch(url, { method, body: fd });
        const json = await resp.json().catch(() => ({}));
        if (!resp.ok || (json && json.success === false)) {
          throw json?.error ? new Error(json.error) : new Error(`HTTP ${resp.status}`);
        }

        const refreshed = await fetchAdminProducts();
        setCustomProducts(dedupeByFingerprint(refreshed as AdminEditing[]));
        resetForm();
        setSubmitting(false);
        showToast(isEdit ? 'Product updated' : 'Product added');
      } catch (err: any) {
        setErrorMsg(`Error: ${normalizeError(err)}`);
        setSubmitting(false);
      }
    })();
  };

  const handleEdit = (p: AdminEditing) => { setEditing(p); setIsEdit(true); setErrorMsg(''); setDrawerOpen(true); };
  const handleDelete = async (id: string) => { if (confirm('Delete product?')) { const ok = await deleteAdminProduct(id); if (!ok) { setErrorMsg('Delete failed (offline?)'); return; } const refreshed = await fetchAdminProducts(); setCustomProducts(refreshed as AdminEditing[]); if (editing._id===id) resetForm(); showToast('Product deleted'); } };
  const toggleFeatured = async (p: AdminEditing) => {
    try {
      const fd = new FormData();
      fd.append('isFeatured', (!p.isFeatured) ? 'true' : 'false');
      const resp = await fetch(`${API_BASE}/api/admin-products/${p._id}`, { method: 'PUT', body: fd });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok || (json && json.success === false)) throw new Error(json?.error || `HTTP ${resp.status}`);
      const refreshed = await fetchAdminProducts();
      setCustomProducts(dedupeByFingerprint(refreshed as AdminEditing[]));
    } catch (err:any) {
      setErrorMsg(`Error: ${normalizeError(err)}`);
    }
  };
  const getVisibleProducts = () => {
    // Admin category filter is disabled; return all products
    return customProducts;
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectAllVisible = () => {
    const visible = getVisibleProducts();
    setSelectedIds(new Set(visible.map(p => p._id!).filter(Boolean)));
  };
  const clearSelection = () => setSelectedIds(new Set());
  // Category bulk move disabled per request

  // (Per-product category dropdown removed; using bulk move control instead)
  const bulkSetFeatured = async (target: boolean) => {
    try {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;
      const byId = new Map(customProducts.map(p => [p._id!, p] as const));
      const toChange = ids
        .map(id => byId.get(id))
        .filter((p): p is AdminEditing => !!p && (!!p.isFeatured) !== target);
      await Promise.all(toChange.map(async (p) => {
        const fd = new FormData();
        fd.append('isFeatured', target ? 'true' : 'false');
        const resp = await fetch(`${API_BASE}/api/admin-products/${p._id}`, { method: 'PUT', body: fd });
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}));
          throw new Error(j?.error || `HTTP ${resp.status}`);
        }
      }));
      const refreshed = await fetchAdminProducts();
      setCustomProducts(dedupeByFingerprint(refreshed as AdminEditing[]));
      setSelectedIds(new Set());
    } catch (err:any) {
      setErrorMsg(`Error: ${normalizeError(err)}`);
    }
  };
  const handlePurgeAll = async () => {
    if (!confirm('Delete ALL products? This cannot be undone.')) return;
    try {
      await fetch(`${API_BASE}/api/admin-products/all`, { method: 'DELETE' });
      const refreshed = await fetchAdminProducts();
      setCustomProducts(dedupeByFingerprint(refreshed as AdminEditing[]));
      resetForm();
    } catch (e) {
      setErrorMsg('Purge failed');
    }
  };

  // Removed old handleUserUpdate for users
  // const handleUserUpdate = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!editingUser?._id) return;
  //   try {
  //     const updatedUser = await updateUser(editingUser._id, editingUser);
  //     if (updatedUser) {
  //       setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u));
  //       setEditingUser(null);
  //       showToast('User updated successfully');
  //     } else {
  //       showToast('Failed to update user');
  //     }
  //   } catch (error) {
  //     showToast('Error updating user');
  //   }
  // };
  // Remove old handleUserUpdate for users
  const closeEditModal = () => {
    setDrawerOpen(false);
    setTimeout(() => { resetForm(); }, 220);
  };

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!auth) {
    return (
      <div style={{ maxWidth: 420, margin: '60px auto', background: '#0e0e0f', padding: 32, borderRadius: 12, border: '1px solid #222' }}>
        <h2 style={{ marginTop: 0 }}>Admin Login (Test)</h2>
        <p>Use username <code>admin</code> and password <code>gvng123</code>.</p>
        <input placeholder='Username' value={username} onChange={e=>setUsername(e.target.value)} style={inputStyle} />
        <input placeholder='Password' type='password' value={password} onChange={e=>setPassword(e.target.value)} style={inputStyle} />
        <button onClick={handleLogin} style={btnPrimary}>LOGIN</button>
      </div>
    )
  }

  return (
    <div style={{ width:'100%', margin: '40px 0', padding: '0 16px 0 0', display:'grid', gridTemplateColumns:'260px 1fr', gap:20 }}>
      <aside style={sideNav}>
        <div style={{ fontWeight:800, letterSpacing:0.5, marginBottom:16 }}>Admin</div>
        <button type='button' onClick={()=>setActiveTab('dashboard')} style={{...sideNavItem, ...(activeTab==='dashboard'?sideNavItemActive:{})}}>Dashboard</button>
        <button type='button' onClick={()=>setActiveTab('products')} style={{...sideNavItem, ...(activeTab==='products'?sideNavItemActive:{})}}>Products</button>
        <button type='button' onClick={()=>setActiveTab('users')} style={{...sideNavItem, ...(activeTab==='users'?sideNavItemActive:{})}}>Users</button>
        <button type='button' onClick={()=>setActiveTab('settings')} style={{...sideNavItem, ...(activeTab==='settings'?sideNavItemActive:{})}}>Site Settings</button>
        <button type='button' disabled style={{...sideNavItem, opacity:0.5, cursor:'not-allowed'}}>Categories</button>
        <div style={{ marginTop:'auto', display:'grid', gap:8 }}>
          <div style={{ fontSize:12, opacity:0.7 }}>Quick stats</div>
          <div style={{ fontSize:12, opacity:0.8 }}>Products: {customProducts.length}</div>
          <div style={{ fontSize:12, opacity:0.8 }}>Featured: {customProducts.filter(p=>!!p.isFeatured).length}</div>
          <button onClick={()=>{sessionStorage.removeItem('adminAuth'); setAuth(false)}} style={{...miniBtn, marginTop:12}}>Log out</button>
        </div>
        {/* KPI metrics moved to main area for better visibility */}
      </aside>
      <main>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 style={{ margin:0 }}>
            {activeTab==='dashboard' ? 'Admin Dashboard' : activeTab==='products' ? 'Admin Products' : activeTab==='users' ? 'User Management' : activeTab==='settings' ? 'Site Settings' : 'Categories'}
          </h2>
          <div style={{ display:'flex', gap:12 }}>
            {activeTab==='products' && <button type='button' onClick={handlePurgeAll} style={miniDanger}>DELETE ALL</button>}
          </div>
        </div>
        {activeTab==='users' && (
          <div>
            <h3>Users</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {users.map(user => (
                <div key={user._id} style={{ background: '#0e0e0f', border: '1px solid #222', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src={resolveImageUrl(user.profileImageUrl)} alt={`${user.firstName} ${user.lastName}`} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }} />
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{user.firstName} {user.lastName}</h4>
                  <p style={{ margin: '0.25rem 0', color: '#888' }}>{user.email}</p>
                  <p style={{ margin: '0.25rem 0', color: '#888', fontSize: '0.95em' }}>IP: {user.ip || '-'}</p>
                  <p style={{ margin: '0.25rem 0', color: '#888', fontSize: '0.95em' }}>Country: {user.country || '-'}</p>
                  <p style={{ margin: '0.5rem 0', padding: '0.25rem 0.5rem', background: user.role === 'admin' ? '#E6FF00' : '#333', color: user.role === 'admin' ? '#000' : '#fff', borderRadius: '4px', fontSize: '0.8rem' }}>{user.role}</p>
                  {user.banned ? (
                    <button onClick={async () => {
                      await updateUser(user._id || '', { banned: false });
                      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, banned: false } : u));
                      showToast('User unbanned');
                    }} style={{ ...miniBtn, background: '#E6FF00', color: '#222', marginTop: '0.5rem' }}>Unban</button>
                  ) : null}
                  <button onClick={() => openEditUserModal(user)} style={{ ...miniBtn, marginTop: '1rem' }}>Edit</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab==='dashboard' && (
          <div style={{ display:'grid', gap:16, marginTop:24 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16 }}>
              <div style={kpiCard}>
                <div style={{ fontSize:12, opacity:0.7 }}>Total Orders</div>
                <div style={{ fontSize:32, fontWeight:800 }}>{metrics.totalOrders.toLocaleString()}</div>
              </div>
              <div style={kpiCard}>
                <div style={{ fontSize:12, opacity:0.7 }}>Items Sold</div>
                <div style={{ fontSize:32, fontWeight:800 }}>{metrics.itemsSold.toLocaleString()}</div>
              </div>
              <div style={kpiCard}>
                <div style={{ fontSize:12, opacity:0.7 }}>Revenue</div>
                <div style={{ fontSize:32, fontWeight:800 }}>
                  {new Intl.NumberFormat(undefined, { style:'currency', currency: metrics.currency }).format(metrics.totalProfit)}
                </div>
              </div>
            </div>
            {/* Move breakdown cards to top, just under KPIs */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16 }}>
              <div style={{ background:'#0e0e0f', border:'1px solid #222', borderRadius:12, padding:16 }}>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:8 }}>Revenue by Category</div>
                <div style={{ width:'100%', height:280 }}>
                  <ResponsiveContainer>
                    <BarChart data={breakdown.byCategory} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" />
                      <XAxis dataKey="category" tick={{ fill: '#9a9a9a' }} />
                      <YAxis tick={{ fill: '#9a9a9a' }} tickFormatter={(v)=> new Intl.NumberFormat(undefined, { style:'currency', currency: metrics.currency }).format(Number(v))} />
                      <Tooltip 
                        contentStyle={{ background:'#111', border:'1px solid #333', borderRadius:8 }} 
                        labelStyle={{ color:'#eaeaea' }} 
                        itemStyle={{ color:'#eaeaea' }} 
                        formatter={(v:any)=> new Intl.NumberFormat(undefined, { style:'currency', currency: metrics.currency }).format(Number(v))} 
                      />
                      <Bar dataKey="revenue" fill="#E6FF00" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ background:'#0e0e0f', border:'1px solid #222', borderRadius:12, padding:16 }}>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:8 }}>Featured vs Non‑featured</div>
                <div style={{ width:'100%', height:280 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie dataKey="revenue" data={breakdown.byFeatured} nameKey="isFeatured" cx="50%" cy="50%" outerRadius={90}>
                        {breakdown.byFeatured.map((entry, index) => (
                          <Cell key={`c-top-${index}`} fill={entry.isFeatured ? '#62B0FF' : '#A987FF'} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background:'#111', border:'1px solid #333', borderRadius:8 }} 
                        labelStyle={{ color:'#eaeaea' }} 
                        itemStyle={{ color:'#eaeaea' }} 
                        formatter={(v:any)=> new Intl.NumberFormat(undefined, { style:'currency', currency: metrics.currency }).format(Number(v))} 
                      />
                      <Legend wrapperStyle={{ color:'#cfcfcf' }} formatter={(val)=> val==='true' ? 'Featured' : 'Not featured'} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'center', flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <span style={{ fontSize:12, opacity:0.7 }}>Date range:</span>
                <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={{ ...inputStyle, width: 160, padding:'6px 8px', marginTop:0 }} />
                <span style={{ opacity:0.6 }}>→</span>
                <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={{ ...inputStyle, width: 160, padding:'6px 8px', marginTop:0 }} />
                <button type='button' style={{ ...miniBtn, padding:'6px 10px' }} onClick={()=>{ if (!startDate || !endDate) return; /* effect triggers automatically */ }}>Apply</button>
                <button type='button' style={{ ...miniBtn, padding:'6px 10px' }} onClick={()=>{ setStartDate(''); setEndDate(''); }}>Clear</button>
              </div>
              {[7,30,90].map(d => (
                <button key={d} type='button' onClick={()=>setTrendDays(d)}
                  style={{
                    ...miniBtn,
                    padding: '6px 10px',
                    opacity: trendDays===d ? 1 : 0.85,
                    border: trendDays===d ? '1px solid #5a5a5a' : '1px solid #2d2d2d',
                    background: trendDays===d ? 'linear-gradient(180deg, #232323 0%, #171717 100%)' : miniBtn.background as any
                  }}>
                  {d}d
                </button>
              ))}
              <span style={{ fontSize:12, opacity:0.7, marginLeft:8 }}>Custom:</span>
              <input
                type="number"
                min={1}
                max={365}
                value={customDaysInput}
                onChange={e=>setCustomDaysInput(e.target.value)}
                onKeyDown={(e)=>{
                  if (e.key==='Enter') {
                    const v = Math.max(1, Math.min(365, parseInt(customDaysInput || '0', 10)));
                    if (!isNaN(v)) setTrendDays(v);
                  }
                }}
                style={{ ...inputStyle, width:80, padding:'6px 8px', marginTop:0 }}
              />
              <button type='button' onClick={()=>{ const v = Math.max(1, Math.min(365, parseInt(customDaysInput || '0', 10))); if (!isNaN(v)) setTrendDays(v); }} style={{ ...miniBtn, padding:'6px 10px' }}>Apply</button>
            </div>
            <div style={{ background:'#0e0e0f', border:'1px solid #222', borderRadius:12, padding:16 }}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:8 }}>
                {startDate && endDate ? `Revenue (${startDate} → ${endDate})` : `Revenue (${trendDays} days)`}
              </div>
              <div style={{ width:'100%', height:280 }}>
                <ResponsiveContainer>
                  <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E6FF00" stopOpacity={0.7}/>
                        <stop offset="100%" stopColor="#E6FF00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: '#9a9a9a', fontSize: 11 }} minTickGap={16}/>
                    <YAxis tick={{ fill: '#9a9a9a' }} tickFormatter={(v)=> new Intl.NumberFormat().format(v)} />
                    <Tooltip 
                      contentStyle={{ background:'#111', border:'1px solid #333', borderRadius:8 }} 
                      labelStyle={{ color:'#eaeaea' }} 
                      itemStyle={{ color:'#eaeaea' }} 
                      formatter={(v: any)=> new Intl.NumberFormat(undefined, { style:'currency', currency: metrics.currency }).format(Number(v))} 
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#E6FF00" fill="url(#rev)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ background:'#0e0e0f', border:'1px solid #222', borderRadius:12, padding:16 }}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:8 }}>
                {startDate && endDate ? `Orders & Items (${startDate} → ${endDate})` : `Orders & Items (${trendDays} days)`}
              </div>
              <div style={{ width:'100%', height:260 }}>
                <ResponsiveContainer>
                  <LineChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: '#9a9a9a', fontSize: 11 }} minTickGap={16}/>
                    <YAxis tick={{ fill: '#9a9a9a' }} />
                    <Tooltip 
                      contentStyle={{ background:'#111', border:'1px solid #333', borderRadius:8 }} 
                      labelStyle={{ color:'#eaeaea' }} 
                      itemStyle={{ color:'#eaeaea' }} 
                    />
                    <Legend wrapperStyle={{ color: '#cfcfcf' }} />
                    <Line type="monotone" dataKey="orders" name="Orders" stroke="#62B0FF" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="items" name="Items" stroke="#A987FF" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            
          </div>
        )}
      {activeTab==='settings' && (
        <div style={{ marginTop:24, background:'#0e0e0f', padding:24, border:'1px solid #222', borderRadius:12, maxWidth:720 }}>
          <div style={{ display:'grid', gap:16 }}>
            {/* Social Links Card */}
            <div style={{ background:'#0b0b0b', border:'1px solid #222', borderRadius:12, padding:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h3 style={{ margin:0 }}>Social Links</h3>
                <button type='button' style={miniBtn} onClick={()=>setSettingsSocialOpen(v=>!v)}>{settingsSocialOpen ? 'Hide' : 'Show'}</button>
              </div>
              {settingsSocialOpen && (
                <div style={{ marginTop:12 }}>
                  <p style={{ opacity:0.8, marginTop:0, marginBottom:16, fontSize:13 }}>Add your official social profiles. These show in the footer.</p>
                  <label style={labelStyle}>Instagram URL<input style={inputStyle} type="url" placeholder="https://instagram.com/yourpage" value={socialLinks.instagram} onChange={e=>setSocialLinks(s=>({...s, instagram: e.target.value}))} /></label>
                  <label style={labelStyle}>Facebook URL<input style={inputStyle} type="url" placeholder="https://facebook.com/yourpage" value={socialLinks.facebook} onChange={e=>setSocialLinks(s=>({...s, facebook: e.target.value}))} /></label>
                  <label style={labelStyle}>Twitter URL<input style={inputStyle} type="url" placeholder="https://x.com/yourpage" value={socialLinks.twitter} onChange={e=>setSocialLinks(s=>({...s, twitter: e.target.value}))} /></label>
                  <div style={{ display:'flex', gap:12, marginTop:16 }}>
                    <button type='button' style={btnSecondary} onClick={()=>{
                      setSocialLinks({ instagram:'', facebook:'', twitter:'' })
                    }}>Reset</button>
                    <button type='button' style={btnPrimary} onClick={()=>{
                      const ig = (socialLinks.instagram||'').trim();
                      const fb = (socialLinks.facebook||'').trim();
                      const tw = (socialLinks.twitter||'').trim();
                      const check = (label:string, val:string): string | null => {
                        if (!val) return null;
                        if (!val.toLowerCase().startsWith('https://')) return `${label} URL must start with https://`;
                        try { new URL(val); } catch { return `${label} URL is invalid`; }
                        return null;
                      };
                      const e1 = check('Instagram', ig); if (e1) { showToast(e1); return; }
                      const e2 = check('Facebook', fb); if (e2) { showToast(e2); return; }
                      const e3 = check('Twitter', tw); if (e3) { showToast(e3); return; }
                      try {
                        localStorage.setItem('social.instagram', ig)
                        localStorage.setItem('social.facebook', fb)
                        localStorage.setItem('social.twitter', tw)
                      } catch {}
                      try { window.dispatchEvent(new Event('socialLinksUpdated')) } catch {}
                      showToast('Social links saved')
                    }}>Save</button>
                  </div>
                </div>
              )}
            </div>

            {/* Hero Content Card */}
            <div style={{ background:'#0b0b0b', border:'1px solid #222', borderRadius:12, padding:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h3 style={{ margin:0 }}>Hero Content</h3>
                <button type='button' style={miniBtn} onClick={()=>setSettingsHeroOpen(v=>!v)}>{settingsHeroOpen ? 'Hide' : 'Show'}</button>
              </div>
              {settingsHeroOpen && (
                <div style={{ marginTop:12 }}>
                  <p style={{ opacity:0.8, marginTop:0, marginBottom:16, fontSize:13 }}>Controls the big title and subtitle on the home page. The title types letter by letter.</p>
                  <label style={labelStyle}>Hero Title
                    <input style={inputStyle} placeholder="GVNG 2025" value={heroTitleAdmin} onChange={e=>setHeroTitleAdmin(e.target.value)} />
                  </label>
                  <label style={labelStyle}>Hero Subtitle
                    <input style={inputStyle} placeholder="Discover premium quality clothing and accessories" value={heroSubtitleAdmin} onChange={e=>setHeroSubtitleAdmin(e.target.value)} />
                  </label>
                  <div style={{ display:'flex', gap:12, marginTop:16 }}>
                    <button type='button' style={btnSecondary} onClick={()=>{
                      setHeroTitleAdmin('GVNG 2025');
                      setHeroSubtitleAdmin('Discover premium quality clothing and accessories');
                    }}>Reset</button>
                    <button type='button' style={btnPrimary} onClick={()=>{
                      try {
                        const t = heroTitleAdmin.trim();
                        const s = heroSubtitleAdmin.trim();
                        if (t) localStorage.setItem('heroTitle', t); else localStorage.removeItem('heroTitle');
                        if (s) localStorage.setItem('heroSubtitle', s); else localStorage.removeItem('heroSubtitle');
                      } catch {}
                      try { window.dispatchEvent(new Event('heroContentUpdated')) } catch {}
                      showToast('Hero content saved');
                    }}>Save</button>
                  </div>
                </div>
              )}
            </div>

            {/* Maintenance Mode Card */}
            <div style={{ background:'#0b0b0b', border:'1px solid #222', borderRadius:12, padding:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h3 style={{ margin:0 }}>Maintenance Mode</h3>
              </div>
              <div style={{ marginTop:12 }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
                  <input type='checkbox' checked={maintenanceEnabled} onChange={e=>setMaintenanceEnabled(e.target.checked)} /> Enable maintenance mode
                </label>
                <div style={{ display:'grid', gap:12, marginTop:12 }}>
                  <label style={labelStyle}>Title
                    <input style={inputStyle} placeholder="We'll be back soon" value={maintenanceTitle} onChange={e=>setMaintenanceTitle(e.target.value)} />
                  </label>
                  <label style={labelStyle}>Message
                    <textarea style={textAreaStyle} placeholder="We are performing scheduled maintenance. Please check back shortly." value={maintenanceMessage} onChange={e=>setMaintenanceMessage(e.target.value)} />
                  </label>
                  <label style={labelStyle}>Overlay Intensity
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 70px', alignItems:'center', gap:8 }}>
                      <input type="range" min={0} max={0.9} step={0.05} value={maintenanceOverlay} onChange={e=>setMaintenanceOverlay(parseFloat(e.target.value))} />
                      <input value={maintenanceOverlay.toFixed(2)} onChange={e=>{ const v = parseFloat(e.target.value); if (!isNaN(v)) setMaintenanceOverlay(Math.max(0, Math.min(0.9, v))); }} style={{ ...inputStyle, padding:'6px 8px', marginTop:0 }} />
                    </div>
                    <span style={{ fontSize:12, opacity:0.7 }}>Controls how dark the background overlay appears (0 = none, 0.9 = darkest).</span>
                  </label>
                  <label style={labelStyle}>Background Image URL (optional)
                    <input style={inputStyle} type="url" placeholder="https://example.com/gvng.jpg" value={maintenanceBg} onChange={e=>{ setMaintenanceBg(e.target.value); setMaintenanceBgSize(null); }} />
                    <span style={{ fontSize:12, opacity:0.7 }}>Use an https URL. It will appear behind the maintenance card.</span>
                  </label>
                  <div>
                    <div style={{ fontSize:12, opacity:0.75, marginBottom:6 }}>Or upload an image (max 5MB):</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e)=>{
                        setMaintenanceBgError('');
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const allowed = new Set(['image/jpeg','image/png','image/webp','image/gif']);
                        const maxBytes = 5 * 1024 * 1024;
                        if (!allowed.has(file.type)) { setMaintenanceBgError('Unsupported image type. Allowed: JPEG, PNG, WEBP, GIF.'); return; }
                        if (file.size > maxBytes) { setMaintenanceBgError('Image too large. Max 5MB.'); return; }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const dataUrl = reader.result as string;
                          setMaintenanceBg(dataUrl);
                          setMaintenanceBgSize(file.size);
                        };
                        reader.readAsDataURL(file);
                      }}
                      style={{ ...inputStyle, padding: '6px 8px' }}
                    />
                    {maintenanceBgError && (
                      <div style={{ marginTop:6, color:'#ffb7b7', background:'rgba(255,102,102,0.12)', border:'1px solid rgba(255,102,102,0.25)', borderRadius:6, padding:'6px 8px', fontSize:12 }}>{maintenanceBgError}</div>
                    )}
                    <div style={{ marginTop:10, background:'#0e0e0f', border:'1px solid #222', borderRadius:8, padding:10 }}>
                      <div style={{ fontSize:12, opacity:0.75, marginBottom:6 }}>Preview</div>
                      <div style={{ height:160, borderRadius:6, overflow:'hidden', background: maintenanceBg ? `url(${maintenanceBg}) center/cover no-repeat` : '#121212', display:'flex', alignItems:'center', justifyContent:'center', color:'#aaa' }}>
                        {!maintenanceBg && 'No image'}
                      </div>
                      <div style={{ fontSize:12, opacity:0.75, marginTop:6 }}>
                        {maintenanceBg ? (maintenanceBg.startsWith('data:') ? `Current: Uploaded image${maintenanceBgSize!=null?` (~${(maintenanceBgSize/1024/1024).toFixed(2)} MB)`:''}` : `Current: ${maintenanceBg}`) : 'Current: none'}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8, marginTop:8 }}>
                      <button type='button' style={miniBtn} onClick={()=>setMaintenanceBg('')}>Clear image</button>
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:12, marginTop:16 }}>
                  <button type='button' style={btnSecondary} onClick={()=>{
                    if (!confirm('Reset maintenance settings to defaults?')) return;
                    setMaintenanceEnabled(false);
                    setMaintenanceTitle("We'll be back soon");
                    setMaintenanceMessage('We are performing scheduled maintenance. Please check back shortly.');
                    setMaintenanceBg('');
                    setMaintenanceOverlay(0.65);
                    setMaintenanceBgSize(null);
                  }}>Reset</button>
                  <button type='button' style={btnPrimary} onClick={()=>{
                    const bg = (maintenanceBg||'').trim();
                    const isHttps = bg.toLowerCase().startsWith('https://');
                    const isData = bg.toLowerCase().startsWith('data:');
                    if (bg && !isHttps && !isData) { showToast('Background must be https URL or uploaded image'); return; }
                    try {
                      localStorage.setItem('maintenance.enabled', maintenanceEnabled ? 'true' : 'false');
                      localStorage.setItem('maintenance.title', (maintenanceTitle||'').trim() || "We'll be back soon");
                      localStorage.setItem('maintenance.message', (maintenanceMessage||'').trim() || 'We are performing scheduled maintenance. Please check back shortly.');
                      if (bg) localStorage.setItem('maintenance.bg', bg); else localStorage.removeItem('maintenance.bg');
                      localStorage.setItem('maintenance.overlay', String(Math.max(0, Math.min(0.9, maintenanceOverlay))));
                    } catch {}
                    try { window.dispatchEvent(new Event('maintenanceUpdated')) } catch {}
                    showToast('Maintenance settings saved');
                  }}>Save</button>
                </div>
                <div style={{ marginTop:10, fontSize:12, opacity:0.75 }}>
                  When enabled, visitors see the maintenance page on all routes except <code>/admin</code>.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab==='categories' && (
        <div style={{ marginTop:24, background:'#0e0e0f', padding:24, border:'1px solid #222', borderRadius:12, maxWidth:820 }}>
          <h3 style={{ marginTop:0 }}>Manage Categories</h3>
          <p style={{ opacity:0.8, marginTop:6, marginBottom:16, fontSize:13 }}>Add, rename, or delete categories. Deleting a category lets you delete its products or reassign them to '{DEFAULT_CATEGORY}'.</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'end', marginBottom:16 }}>
            <label style={labelStyle}>New category name
              <input id="new-cat" style={inputStyle} placeholder="e.g. shoes" />
            </label>
            <button type='button' style={btnPrimary} onClick={()=>{
              const el = document.getElementById('new-cat') as HTMLInputElement | null;
              const name = (el?.value || '').trim().toLowerCase();
              if (!name) return;
              if (categories.includes(name)) { alert('Category already exists'); return; }
              saveCategories([...categories, name]);
              if (el) el.value='';
              showToast(`Category "${name}" added`);
            }}>Add</button>
          </div>
          <div style={{ display:'grid', gap:10 }}>
            {categories.map(cat => (
              <div key={cat} style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:8, alignItems:'center', background:'#0b0b0b', border:'1px solid #222', borderRadius:10, padding:10 }}>
                <div style={{ fontWeight:700 }}>{cat}</div>
                <button type='button' style={miniBtn} onClick={()=>{
                  const newName = prompt('Rename category', cat)?.trim().toLowerCase();
                  if (!newName || newName===cat) return;
                  if (categories.includes(newName)) { alert('Category already exists'); return; }
                  const nextCats = categories.map(c => c===cat?newName:c);
                  saveCategories(nextCats);
                  (async ()=>{
                    const affected = customProducts.filter(p => (p.category||'').toLowerCase()===cat);
                    for (const p of affected) {
                      try {
                        const fd = new FormData();
                        fd.append('category', newName);
                        await fetch(`${API_BASE}/api/admin-products/${p._id}`, { method: 'PUT', body: fd });
                      } catch {}
                    }
                    const refreshed = await fetchAdminProducts();
                    setCustomProducts(dedupeByFingerprint(refreshed as AdminEditing[]));
                    showToast(`Category renamed to "${newName}"`);
                  })();
                }}>Rename</button>
                <button type='button' style={miniDanger} onClick={()=>{
                  const hasProducts = customProducts.some(p => (p.category||'').toLowerCase()===cat);
                  if (!hasProducts) {
                    saveCategories(categories.filter(c=>c!==cat));
                    showToast(`Category "${cat}" deleted`);
                    return;
                  }
                  if (confirm(`Category "${cat}" has products. Delete products as well?`)) {
                    (async ()=>{
                      const targets = customProducts.filter(p => (p.category||'').toLowerCase()===cat);
                      for (const p of targets) {
                        try { await fetch(`${API_BASE}/api/admin-products/${p._id}`, { method:'DELETE' }); } catch {}
                      }
                      const refreshed = await fetchAdminProducts();
                      setCustomProducts(dedupeByFingerprint(refreshed as AdminEditing[]));
                      saveCategories(categories.filter(c=>c!==cat));
                      showToast(`Category "${cat}" and ${targets.length} product${targets.length!==1?'s':''} deleted`);
                    })();
                  } else {
                    (async ()=>{
                      const targets = customProducts.filter(p => (p.category||'').toLowerCase()===cat);
                      for (const p of targets) {
                        try { const fd = new FormData(); fd.append('category', DEFAULT_CATEGORY); await fetch(`${API_BASE}/api/admin-products/${p._id}`, { method: 'PUT', body: fd }); } catch {}
                      }
                      const refreshed = await fetchAdminProducts();
                      setCustomProducts(dedupeByFingerprint(refreshed as AdminEditing[]));
                      const next = categories.filter(c=>c!==cat);
                      if (!next.includes(DEFAULT_CATEGORY)) next.push(DEFAULT_CATEGORY);
                      saveCategories(next);
                      showToast(`Category "${cat}" deleted; moved ${targets.length} product${targets.length!==1?'s':''} to "${DEFAULT_CATEGORY}"`);
                    })();
                  }
                }}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Import/Export removed: DB is the single source of truth */}
      {activeTab==='products' && !isEdit && (
        <form onSubmit={handleSubmit} style={{ marginTop: 24, background:'#0e0e0f', padding:24, border:'1px solid #222', borderRadius:12 }}>
          <h3 style={{ marginTop:0 }}>Add Product</h3>
          {errorMsg && <div style={{ background:'#3d0000', color:'#ffb7b7', padding:'8px 12px', borderRadius:6, marginBottom:12, fontSize:13 }}>{errorMsg}</div>}
          <label style={labelStyle}>Name<input style={inputStyle} value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} /></label>
          <label style={labelStyle}>Description<textarea style={textAreaStyle} value={editing.description} onChange={e=>setEditing({...editing,description:e.target.value})} /></label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16 }}>
            <label style={labelStyle}>Price<input type='number' step='0.01' style={inputStyle} value={editing.price} onChange={e=>setEditing({...editing,price:parseFloat(e.target.value)})} /></label>
            <label style={labelStyle}>Stock<input type='number' style={inputStyle} value={editing.stock} onChange={e=>setEditing({...editing,stock:parseInt(e.target.value||'0')})} /></label>
            <label style={labelStyle}>Category<select style={{...inputStyle, opacity:0.6, cursor:'not-allowed'}} value={editing.category} disabled>{Array.from(new Set([...(categories||[]), editing.category||''])).filter(Boolean).map(c=> <option key={c} value={c}>{c}</option>)}</select></label>
            <label style={labelStyle}>Rating<input type='number' step='0.1' max='5' min='0' style={inputStyle} value={editing.rating||0} onChange={e=>setEditing({...editing,rating:parseFloat(e.target.value)})} /></label>
          </div>
          <label style={labelStyle}>Sizes (comma)<input style={inputStyle} value={editing.size.join(',')} onChange={e=>setEditing({...editing,size:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} /></label>
          <label style={labelStyle}>Colors (comma)<input style={inputStyle} value={editing.color.join(',')} onChange={e=>setEditing({...editing,color:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} /></label>
          <label style={labelStyle}>
              Image URL (optional)
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={editing.image && editing.image.startsWith('http') ? editing.image : ''}
                onChange={(e)=>{ setImageFile(null); setEditing({ ...editing, image: e.target.value }); }}
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Or Upload Image
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ ...inputStyle, padding: '6px 8px' }} />
          </label>
          <label style={{ display:'flex', alignItems:'center', gap:8, marginTop:12, fontSize:13 }}>
            <input type='checkbox' checked={!!editing.isFeatured} onChange={e=>setEditing({...editing,isFeatured:e.target.checked})} /> Featured (show in carousel)
          </label>
          {editing.image && (
            <div style={{ marginTop:12, border:'1px solid #222', borderRadius:8, padding:12, background:'#0b0b0b' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <div style={{ fontSize:12, opacity:0.7 }}>Preview</div>
                <button type="button" onClick={handleClearImage} style={miniBtn}>CLEAR IMAGE</button>
              </div>
              <img src={editing.image} alt="preview" onError={(ev)=>{(ev.currentTarget as HTMLImageElement).style.opacity='0.3'}} style={{ maxWidth:'100%', maxHeight:160, objectFit:'contain' }} />
            </div>
          )}
          <div style={{ display:'flex', gap:12, marginTop:16 }}>
            <button type='submit' disabled={submitting} style={{...btnPrimary, opacity: submitting?0.7:1, cursor: submitting?'not-allowed':'pointer'}}>{submitting ? 'WORKING...' : 'ADD'}</button>
          </div>
        </form>
      )}
      {activeTab==='products' && (
        <div style={{ marginTop:32 }}>
          <h3 style={{ marginTop:0 }}>Custom Products ({getVisibleProducts().length})</h3>
          <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', margin:'10px 0 18px' }}>
            <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
              <span style={{ opacity:0.7 }}>Filter:</span>
              <select disabled value={'all'} style={{ ...inputStyle, width: 180, marginTop:0, padding:'6px 8px', opacity:0.6, cursor:'not-allowed' }}>
                <option value="all">All categories</option>
                {Array.from(new Set(categories)).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <span style={{ fontSize:12, opacity:0.7 }}>
              Selected: {selectedIds.size}
            </span>
            <button type='button' onClick={selectAllVisible} style={miniBtn}>
              Select all
            </button>
            <button type='button' onClick={clearSelection} style={{...miniBtn, opacity:selectedIds.size===0?0.55:1, cursor:selectedIds.size===0?'not-allowed':'pointer', filter:selectedIds.size===0?'grayscale(35%)':undefined}} disabled={selectedIds.size===0}>
              Clear selection
            </button>
            <button type='button' onClick={()=>bulkSetFeatured(true)} style={{...miniBtn, opacity:selectedIds.size===0?0.55:1, cursor:selectedIds.size===0?'not-allowed':'pointer', filter:selectedIds.size===0?'grayscale(35%)':undefined}} disabled={selectedIds.size===0}>
              Feature selected
            </button>
            <button type='button' onClick={()=>bulkSetFeatured(false)} style={{...miniBtn, opacity:selectedIds.size===0?0.55:1, cursor:selectedIds.size===0?'not-allowed':'pointer', filter:selectedIds.size===0?'grayscale(35%)':undefined}} disabled={selectedIds.size===0}>
              Unfeature selected
            </button>
            {/* Category move controls hidden per request */}
          </div>
          {getVisibleProducts().length===0 && <p>No products in this view.</p>}
          <h4 style={{ margin:'18px 0 8px' }}>Featured ({getVisibleProducts().filter(p=>!!p.isFeatured).length})</h4>
          <div style={{ display:'grid', gap:18, gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))' }}>
            {getVisibleProducts().filter(p=>!!p.isFeatured).map(p => (
              <div key={p._id} style={{ background:'#0e0e0f', border:'1px solid #222', borderRadius:10, padding:14, position:'relative' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <input type='checkbox' checked={selectedIds.has(p._id!)} onChange={()=>toggleSelect(p._id!)} />
                    <span style={{ fontWeight:700 }}>{p.name}</span>
                  </label>
                </div>
                <div style={{ fontSize:12, opacity:0.8 }}>{p.category} • ${p.price}</div>
                
                {p.createdAt && <div style={{ fontSize:11, opacity:0.5 }}>Added {new Date(p.createdAt).toLocaleString()}</div>}
                {p.image && (
                  <div style={{ position:'relative', marginTop:8, background:'#000', borderRadius:6, overflow:'hidden' }}>
                    <img src={resolveImageUrl(p.image)} alt='' style={{ width:'100%', height:140, objectFit:'contain', display:'block' }} />
                    {p.isFeatured && (
                      <span style={badgeFeatured}>⭐ Featured</span>
                    )}
                  </div>
                )}
                <div style={{ display:'flex', gap:8, marginTop:10, alignItems:'center', justifyContent:'center' }}>
                  <button onClick={()=>handleEdit(p)} style={miniBtn}>Edit</button>
                  <button onClick={()=>toggleFeatured(p)} style={miniBtn}>{p.isFeatured ? 'Unfeature' : 'Feature'}</button>
                  <button onClick={()=>handleDelete(p._id!)} style={miniDanger}>Delete</button>
                </div>
              </div>
            ))}
          </div>
          <h4 style={{ margin:'22px 0 8px' }}>Others ({getVisibleProducts().filter(p=>!p.isFeatured).length})</h4>
          <div style={{ display:'grid', gap:18, gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))' }}>
            {getVisibleProducts().filter(p=>!p.isFeatured).map(p => (
            <div key={p._id} style={{ background:'#0e0e0f', border:'1px solid #222', borderRadius:10, padding:14, position:'relative' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <label style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <input type='checkbox' checked={selectedIds.has(p._id!)} onChange={()=>toggleSelect(p._id!)} />
                  <span style={{ fontWeight:700 }}>{p.name}</span>
                </label>
              </div>
              <div style={{ fontSize:12, opacity:0.8 }}>{p.category} • ${p.price}</div>
              
              {p.createdAt && <div style={{ fontSize:11, opacity:0.5 }}>Added {new Date(p.createdAt).toLocaleString()}</div>}
              {p.image && (
                <div style={{ position:'relative', marginTop:8, background:'#000', borderRadius:6, overflow:'hidden' }}>
                  <img src={resolveImageUrl(p.image)} alt='' style={{ width:'100%', height:140, objectFit:'contain', display:'block' }} />
                  {p.isFeatured && (
                    <span style={badgeFeatured}>⭐ Featured</span>
                  )}
                </div>
              )}
              <div style={{ display:'flex', gap:8, marginTop:10, alignItems:'center', justifyContent:'center' }}>
                <button onClick={()=>handleEdit(p)} style={miniBtn}>Edit</button>
                <button onClick={()=>toggleFeatured(p)} style={miniBtn}>{p.isFeatured ? 'Unfeature' : 'Feature'}</button>
                <button onClick={()=>handleDelete(p._id!)} style={miniDanger}>Delete</button>
              </div>
            </div>
            ))}
          </div>
        </div>
      )}
      {/* Backend products list removed */}
      </main>

      {editingUser && (
        <div style={modalBackdrop}>
          <div style={modalPanel}>
            <h3>Edit User</h3>
            <form onSubmit={handleUserUpdate}>
              <label style={labelStyle}>First Name
                <input style={inputStyle} type="text" value={editForm.firstName} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} required />
              </label>
              <label style={labelStyle}>Last Name
                <input style={inputStyle} type="text" value={editForm.lastName} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} required />
              </label>
              <label style={labelStyle}>Email
                <input style={inputStyle} type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} required />
              </label>
              <label style={labelStyle}>Role
                <select style={inputStyle} value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} required>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label style={labelStyle}>New Password
                <input style={inputStyle} type="password" value={editForm.password || ''} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} placeholder="Leave blank to keep current" />
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:8, marginTop:12, fontSize:13 }}>
                <input type='checkbox' checked={!!editForm.banned} onChange={e => setEditForm(f => ({ ...f, banned: e.target.checked }))} /> Ban user
              </label>
              {editError && <div style={{ color: '#ff4d4f', marginTop: 8 }}>{editError}</div>}
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={closeEditUserModal} style={btnSecondary}>Cancel</button>
                <button type="submit" style={btnPrimary} disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEdit && (
        <div style={modalBackdrop} onClick={closeEditModal}>
          <div style={{...modalPanel, transform: drawerOpen ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)', opacity: drawerOpen ? 1 : 0, transition: 'transform .22s ease, opacity .22s ease'}} onClick={(e)=>e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <h3 style={{ margin:0 }}>Edit Product</h3>
              <button type='button' onClick={closeEditModal} style={miniBtn}>Close</button>
            </div>
            <form onSubmit={handleSubmit}>
              {errorMsg && <div style={{ background:'rgba(255,102,102,0.12)', color:'#ffb7b7', padding:'8px 12px', border:'1px solid rgba(255,102,102,0.25)', borderRadius:8, marginBottom:12, fontSize:13 }}>{errorMsg}</div>}
              <label style={labelStyle}>Name<input style={inputStyle} value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} /></label>
              <label style={labelStyle}>Description<textarea style={textAreaStyle} value={editing.description} onChange={e=>setEditing({...editing,description:e.target.value})} /></label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16 }}>
                <label style={labelStyle}>Price<input type='number' step='0.01' style={inputStyle} value={editing.price} onChange={e=>setEditing({...editing,price:parseFloat(e.target.value)})} /></label>
                <label style={labelStyle}>Stock<input type='number' style={inputStyle} value={editing.stock} onChange={e=>setEditing({...editing,stock:parseInt(e.target.value||'0')})} /></label>
                <label style={labelStyle}>Category<select style={{...inputStyle, opacity:0.6, cursor:'not-allowed'}} value={editing.category} disabled>{Array.from(new Set([...(categories||[]), editing.category||''])).filter(Boolean).map(c=> <option key={c} value={c}>{c}</option>)}</select></label>
                <label style={labelStyle}>Rating<input type='number' step='0.1' max='5' min='0' style={inputStyle} value={editing.rating||0} onChange={e=>setEditing({...editing,rating:parseFloat(e.target.value)})} /></label>
              </div>
              <label style={labelStyle}>Sizes (comma)<input style={inputStyle} value={editing.size.join(',')} onChange={e=>setEditing({...editing,size:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} /></label>
              <label style={labelStyle}>Colors (comma)<input style={inputStyle} value={editing.color.join(',')} onChange={e=>setEditing({...editing,color:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} /></label>
              <label style={labelStyle}>
                Image URL (optional)
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={editing.image && editing.image.startsWith('http') ? editing.image : ''}
                  onChange={(e)=>{ setImageFile(null); setEditing({ ...editing, image: e.target.value }); }}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Or Upload Image
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ ...inputStyle, padding: '6px 8px' }} />
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:8, marginTop:12, fontSize:13 }}>
                <input type='checkbox' checked={!!editing.isFeatured} onChange={e=>setEditing({...editing,isFeatured:e.target.checked})} /> Featured (show in carousel)
              </label>
              {editing.image && (
                <div style={{ marginTop:12, border:'1px solid #222', borderRadius:8, padding:12, background:'rgba(0,0,0,0.35)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <div style={{ fontSize:12, opacity:0.7 }}>Preview</div>
                    <button type="button" onClick={handleClearImage} style={miniBtn}>CLEAR IMAGE</button>
                  </div>
                  <img src={editing.image} alt="preview" onError={(ev)=>{(ev.currentTarget as HTMLImageElement).style.opacity='0.3'}} style={{ maxWidth:'100%', maxHeight:160, objectFit:'contain' }} />
                </div>
              )}
              <div style={{ display:'flex', gap:12, marginTop:16, justifyContent:'flex-end' }}>
                <button type='button' onClick={closeEditModal} style={btnSecondary}>Cancel</button>
                <button type='submit' disabled={submitting} style={{...btnPrimary, opacity: submitting?0.7:1, cursor: submitting?'not-allowed':'pointer'}}>{submitting ? 'WORKING...' : 'Save changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Toast */}
      {toast.visible && (
        <div style={{ position:'fixed', right:16, bottom:16, background:'#111', color:'#eaeaea', border:'1px solid #2a2a2a', borderRadius:10, padding:'10px 14px', boxShadow:'0 8px 24px rgba(0,0,0,0.45)', zIndex:1000 }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = { width:'100%', background:'#0b0b0b', color:'#fff', border:'1px solid #333', borderRadius:6, padding:'8px 10px', marginTop:4 }
const textAreaStyle: React.CSSProperties = { ...inputStyle, minHeight:90, resize:'vertical' }
const labelStyle: React.CSSProperties = { display:'grid', gap:4, fontSize:14 }
const btnPrimary: React.CSSProperties = {
  background: 'linear-gradient(180deg, #EEFF3A 0%, #D4F000 100%)',
  color: '#0b0b0b',
  fontWeight: 800,
  border: '1px solid #B5D200',
  borderRadius: 10,
  padding: '11px 20px',
  cursor: 'pointer',
  letterSpacing: 0.3,
  boxShadow: '0 8px 16px rgba(230,255,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
  transition: 'transform .08s ease, box-shadow .2s ease, opacity .2s'
}
const btnSecondary: React.CSSProperties = {
  background: 'linear-gradient(180deg, #1E1E20 0%, #171719 100%)',
  color: '#f3f3f3',
  fontWeight: 600,
  border: '1px solid #2a2a2e',
  borderRadius: 10,
  padding: '10px 16px',
  cursor: 'pointer',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)'
}
const miniBtn: React.CSSProperties = {
  background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)',
  color: '#eaeaea',
  border: '1px solid #2d2d2d',
  borderRadius: 999,
  padding: '6px 12px',
  fontSize: 12,
  cursor: 'pointer',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 6px rgba(0,0,0,0.25)',
  transition: 'opacity .2s ease, transform .08s ease'
}
const miniDanger: React.CSSProperties = {
  background: 'linear-gradient(180deg, #6b0f1a 0%, #3a0b12 100%)',
  color: '#fff',
  border: '1px solid #7a2a33',
  borderRadius: 999,
  padding: '6px 12px',
  fontSize: 12,
  cursor: 'pointer',
  boxShadow: '0 6px 12px rgba(122,42,51,0.25), inset 0 1px 0 rgba(255,255,255,0.06)'
}
const sideNav: React.CSSProperties = { display:'flex', flexDirection:'column', gap:8, background:'#0e0e0f', border:'1px solid #222', borderRadius:12, padding:14, minHeight: '70vh' }
const sideNavItem: React.CSSProperties = { textAlign:'left', background:'transparent', color:'#eaeaea', border:'1px solid #2d2d2d', borderRadius:8, padding:'10px 12px', cursor:'pointer' }
const sideNavItemActive: React.CSSProperties = { background:'linear-gradient(180deg, #1a1a1a 0%, #111 100%)', border:'1px solid #3a3a3a' }
const kpiCard: React.CSSProperties = { background:'linear-gradient(180deg, #111 0%, #0c0c0c 100%)', border:'1px solid #222', borderRadius:12, padding:16, boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)' }
const modalBackdrop: React.CSSProperties = {
  position: 'fixed',
  inset: 0 as unknown as number, // TS appeasement for inline style
  background: 'rgba(0,0,0,0.45)',
  backdropFilter: 'blur(12px) saturate(140%)',
  WebkitBackdropFilter: 'blur(12px) saturate(140%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  zIndex: 999
}
const modalPanel: React.CSSProperties = {
  width: 'min(800px, 92vw)',
  maxHeight: '85vh',
  overflow: 'auto',
  background: 'rgba(20,20,22,0.88)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: 22,
  boxShadow: '0 10px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)'
}

// Featured badge overlay for images
const badgeFeatured: React.CSSProperties = {
  position: 'absolute',
  top: 8,
  left: 8,
  background: 'linear-gradient(180deg, #EEFF3A 0%, #D4F000 100%)',
  color: '#0b0b0b',
  border: '1px solid #B5D200',
  borderRadius: 999,
  padding: '6px 12px',
  fontSize: 12,
  fontWeight: 800,
  boxShadow: '0 8px 16px rgba(230,255,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)'
}
