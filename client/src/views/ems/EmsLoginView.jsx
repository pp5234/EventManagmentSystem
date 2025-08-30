import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useRouter } from '../../hooks/useRouter';
import ApiService from "../../api/ApiService.jsx";

const EmsLoginView = () => {
    const [form, setForm] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const auth = useAuth();
    const { showToast } = useToast();
    const { navigate } = useRouter();

    useEffect(() => {
        if (!auth.loading && auth.user) {
            navigate('/ems/dashboard');
        }
    }, [auth.user, auth.loading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const email = (form.email || '').trim();
        const password = form.password || '';

        if (!email || !password) {
            showToast('Please provide email and password.', 'error');
            return;
        }

        setLoading(true);
        try {
            const result = await auth.login({ email, password });

            const token = result.jwt;
            if (token) {
                try {
                    localStorage.setItem('ems_token', token);
                } catch (err) {
                    console.warn('EmsLoginView: could not set localStorage ems_token', err);
                }
                if (typeof ApiService.setToken === 'function') {
                    ApiService.setToken(token);
                }
            }

            showToast('Login successful!', 'success');

            if (window.opener) {
                try {
                    setTimeout(() => {
                        try { window.opener.location.reload(); } catch (e) {}
                        try { window.close(); } catch (e) {}
                    }, 50);
                } catch (err) {
                    window.close();
                }
            } else {
                navigate('/ems/dashboard');
            }
        } catch (error) {
            showToast(error?.message || 'Login failed. Please check your credentials.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ems-login-container">
            <h2>EMS Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default EmsLoginView;
