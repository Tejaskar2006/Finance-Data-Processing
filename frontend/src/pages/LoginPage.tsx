/**
 * Login Page
 * Handles authentication and stores JWT + user in context.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = { email: '', password: '' };
    if (!form.email.match(/\S+@\S+\.\S+/)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !e.email && !e.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.login({ email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}! 🎉`);
      navigate('/dashboard');
    } catch {
      // Handled globally by Axios interceptor toast
    } finally {
      setLoading(false);
    }
  };

  const set = (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const fillDemo = async (role: string) => {
    const creds: Record<string, { email: string; password: string }> = {
      admin: { email: 'admin@finance.com', password: 'Admin123!' },
      analyst: { email: 'analyst@finance.com', password: 'Analyst123!' },
      viewer: { email: 'viewer@finance.com', password: 'Viewer123!' },
    };
    
    const selected = creds[role];
    setForm(selected);
    setErrors({ email: '', password: '' });

    // Auto-submit after state update (using a small timeout or functional update check)
    // To ensure state is applied, we can call the submission logic directly with the new data
    setLoading(true);
    try {
      const res = await authAPI.login(selected);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}! 🎉`);
      navigate('/dashboard');
    } catch {
      // Error handled by interceptor toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">💹</div>
          <h1>FinanceOS</h1>
        </div>

        <p style={{ marginBottom: '0.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Welcome back
        </p>
        <p className="auth-subtitle" style={{ marginBottom: '1.75rem' }}>
          Sign in to your dashboard
        </p>

        {/* Demo credentials */}
        <div style={{ marginBottom: '1.5rem', padding: '0.875rem', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Demo Access
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['admin', 'analyst', 'viewer'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => fillDemo(r)}
                className="btn btn-ghost btn-sm"
                style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
              >
                {r === 'admin' ? '👑' : r === 'analyst' ? '📊' : '👁'} {r}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={set('email')}
              placeholder="you@company.com"
              autoComplete="email"
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
