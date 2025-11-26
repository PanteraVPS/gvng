import React, { useState, useEffect } from 'react';
import { logout, getCurrentUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import trashIcon from '../assets/trash.svg';

const ProfilePage = () => {
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [activeTab, setActiveTab] = useState('orders');
    const [logoUrl, setLogoUrl] = useState('https://i.imgur.com/8Km9tYz.png');
    const [isHovering, setIsHovering] = useState(false);
    const navigate = useNavigate();

    const resolveImageUrl = (url?: string) => {
        if (!url) return ''
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
        const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5000';
        if (url.startsWith('/uploads/')) return `${API_BASE}${url}`
        return url
    }

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings');
                console.log('Settings response:', res.data);
                setLogoUrl(res.data.logoUrl);
            } catch (error) {
                console.error('Failed to fetch settings', error);
            }
        };

        const fetchUser = async () => {
            const currentUser = getCurrentUser();
            if (currentUser) {
                try {
                    const res = await api.get('/auth/profile');
                    console.log('User profile response:', res.data);
                    setUser(res.data.data);
                    setNewEmail(res.data.data.email);
                } catch (error) {
                    console.error('Failed to fetch user profile', error);
                }
            } else {
                navigate('/');
            }
        };

        const fetchOrders = async () => {
            try {
                const res = await api.get('/users/orders');
                setOrders(res.data);
            } catch (error) {
                console.error('Failed to fetch orders', error);
            }
        };

        fetchSettings();
        fetchUser();
        fetchOrders();
    }, []);

    const handleEmailUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.put('/auth/profile', { email: newEmail });
            setUser(res.data.data);
            alert('Email updated successfully');
        } catch (error) {
            console.error('Failed to update email', error);
            alert('Failed to update email');
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/auth/password', { password: newPassword });
            setNewPassword('');
            alert('Password updated successfully');
        } catch (error) {
            console.error('Failed to update password', error);
            alert('Failed to update password');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const formData = new FormData();
            formData.append('profileImage', e.target.files[0]);
            try {
                const res = await api.post('/users/profile-image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setUser(res.data.data);
            } catch (error) {
                console.error('Failed to upload image', error);
                alert('Failed to upload image');
            }
        }
    };

    const handleRemoveImage = async () => {
        try {
            const res = await api.delete('/users/profile-image');
            setUser(res.data.data);
        } catch (error) {
            console.error('Failed to remove image', error);
            alert('Failed to remove image');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) {
        return <div style={styles.loading}>Loading...</div>;
    }

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.leftPanel}>
                    <div style={styles.profileCard}>
                        <div
                            className="profile-image-container"
                            style={styles.profileImageContainer}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <img src={resolveImageUrl(user.profileImageUrl) || logoUrl} alt="Profile" style={styles.profileImage} />
                            <button
                                type="button"
                                aria-label="Remove profile image"
                                onClick={handleRemoveImage}
                                className="remove-image-icon"
                                style={{ ...styles.removeImageIcon, opacity: isHovering ? 1 : 0, pointerEvents: isHovering ? 'auto' : 'none' }}
                            >
                                <img src={trashIcon} alt="Remove" style={{ width: '18px', height: '18px', margin: 'auto' }} />
                            </button>
                        </div>
                        <h2 style={styles.profileName}>{user.firstName} {user.lastName}</h2>
                        <p style={styles.profileEmail}>{user.email}</p>
                        <input type="file" onChange={handleImageUpload} style={{ display: 'none' }} id="profileImage" accept="image/png, image/jpeg, image/gif, image/webp" />
                        <label htmlFor="profileImage" style={styles.uploadButton}>Upload Picture</label>
                        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
                    </div>
                </div>
                <div style={styles.rightPanel}>
                    <div style={styles.tabs}>
                        <button 
                            style={activeTab === 'orders' ? styles.activeTab : styles.tab} 
                            onClick={() => setActiveTab('orders')}
                        >
                            Order History
                        </button>
                        <button 
                            style={activeTab === 'settings' ? styles.activeTab : styles.tab} 
                            onClick={() => setActiveTab('settings')}
                        >
                            Account Settings
                        </button>
                    </div>
                    <div style={styles.tabContent}>
                        {activeTab === 'orders' && (
                            <div>
                                {orders.length > 0 ? (
                                    <ul style={styles.orderList}>
                                        {orders.map((order: any) => (
                                            <li key={order._id} style={styles.orderItem}>
                                                <span>Order ID: {order._id.substring(0, 8)}...</span>
                                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                                <span>${order.total.toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>You have no orders.</p>
                                )}
                            </div>
                        )}
                        {activeTab === 'settings' && (
                            <div style={styles.settingsForm}>
                                <form onSubmit={handleEmailUpdate} style={styles.form}>
                                    <label style={styles.label}>Email Address</label>
                                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} style={styles.input} />
                                    <button type="submit" style={styles.button}>Update Email</button>
                                </form>
                                <form onSubmit={handlePasswordUpdate} style={styles.form}>
                                    <label style={styles.label}>New Password</label>
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={styles.input} placeholder="Enter new password" />
                                    <button type="submit" style={styles.button}>Update Password</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: {
        background: '#121212',
        color: '#fff',
        minHeight: 'calc(100vh - 200px)',
        padding: '2rem',
        fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
    },
    loading: {
        color: '#fff',
        textAlign: 'center',
        padding: '5rem'
    },
    container: {
        display: 'flex',
        maxWidth: '1200px',
        margin: '0 auto',
        gap: '2rem'
    },
    leftPanel: {
        flex: '1'
    },
    profileCard: {
        background: '#1a1a1a',
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center'
    },
    profileImageContainer: {
        position: 'relative',
        width: '120px',
        height: '120px',
        margin: '0 auto 1rem auto'
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        objectFit: 'cover'
    },
    removeImageIcon: {
        position: 'absolute',
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
        background: 'rgba(0, 0, 0, 0.5)',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s ease-in-out, opacity 0.2s ease-in-out',
        backdropFilter: 'blur(2px)'
    },
    profileName: {
        margin: '0',
        fontSize: '1.5rem'
    },
    profileEmail: {
        margin: '0.25rem 0 0',
        color: '#888'
    },
    rightPanel: {
        flex: '3',
        background: '#1a1a1a',
        padding: '2rem',
        borderRadius: '8px'
    },
    tabs: {
        display: 'flex',
        borderBottom: '1px solid #333',
        marginBottom: '1.5rem'
    },
    tab: {
        background: 'none',
        border: 'none',
        color: '#888',
        padding: '1rem 1.5rem',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    activeTab: {
        background: 'none',
        border: 'none',
        color: '#0f0',
        padding: '1rem 1.5rem',
        cursor: 'pointer',
        fontSize: '1rem',
        borderBottom: '2px solid #0f0'
    },
    tabContent: {},
    orderList: {
        listStyle: 'none',
        padding: '0'
    },
    orderItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '1rem',
        borderBottom: '1px solid #333'
    },
    settingsForm: {
    },
    form: {
        marginBottom: '2rem'
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        color: '#888'
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        background: '#333',
        border: '1px solid #444',
        borderRadius: '4px',
        color: '#fff',
        fontSize: '1rem',
        boxSizing: 'border-box'
    },
    button: {
        width: '100%',
        marginTop: '1rem',
        padding: '0.8rem 1.6rem',
        background: 'rgba(17, 255, 0, 0.8)',
        color: '#000',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.2s ease-in-out',
        backdropFilter: 'blur(5px)'
    },
    uploadButton: {
        marginTop: '1rem',
        padding: '0.8rem 1.6rem',
        background: 'rgba(17, 255, 0, 0.8)',
        color: '#000',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        display: 'inline-block',
        transition: 'all 0.2s ease-in-out',
        backdropFilter: 'blur(5px)'
    },
    logoutButton: {
        marginTop: '1rem',
        padding: '0.8rem 1.6rem',
        background: 'rgba(255, 0, 0, 0.8)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.2s ease-in-out',
        backdropFilter: 'blur(5px)'
    }
};

export default ProfilePage;



