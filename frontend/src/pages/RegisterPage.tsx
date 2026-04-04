/**
 * Register Page
 * Public registration — always creates Viewer role.
 * Admins can create higher-role users via the Users page.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email.match(/\S+@\S+\.\S+/)) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.register({ name: form.name, email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch { /* handled globally */ } finally { setLoading(false); }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">💹</div>
          <h1>FinanceOS</h1>
        </div>

        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Create your account</p>
        <p className="auth-subtitle" style={{ marginBottom: '1.75rem' }}>
          Start with a Viewer role. Contact admin to upgrade.
        </p>

        <form onSubmit={handleSubmit}>
          {[
            { id: 'reg-name', field: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { id: 'reg-email', field: 'email', label: 'Email', type: 'email', placeholder: 'you@company.com' },
            { id: 'reg-pass', field: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters' },
            { id: 'reg-confirm', field: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password' },
          ].map(({ id, field, label, type, placeholder }) => (
            <div className="form-group" key={field}>
              <label className="form-label">{label}</label>
              <input
                id={id}
                type={type}
                className="form-control"
                value={form[field as keyof typeof form]}
                onChange={set(field)}
                placeholder={placeholder}
              />
              {errors[field] && <p className="form-error">{errors[field]}</p>}
            </div>
          ))}

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {loading ? <><span className="spinner" /> Creating...</> : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
