/**
 * UserModal — Create/Edit User (Admin only)
 */
import { useState } from 'react';
import { X } from 'lucide-react';
import { userAPI } from '../../services/api';
import type { User } from '../../types';
import toast from 'react-hot-toast';

interface UserModalProps {
  user?: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UserModal = ({ user, onClose, onSuccess }: UserModalProps) => {
  const isEdit = !!user;

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
    role: user?.role ?? 'Viewer',
    status: user?.status ?? 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!isEdit) {
      if (!form.email.match(/\S+@\S+\.\S+/)) e.email = 'Valid email required';
      if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit) {
        await userAPI.update(user!._id, { name: form.name, role: form.role as any, status: form.status as any });
        toast.success('User updated');
      } else {
        await userAPI.create({ name: form.name, email: form.email, password: form.password, role: form.role });
        toast.success('User created');
      }
      onSuccess();
      onClose();
    } catch { /* handled globally */ } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up">
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? '✏️ Edit User' : '👤 Create User'}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-control" value={form.name} onChange={set('name')} placeholder="John Doe" />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          {!isEdit && (
            <>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" value={form.email} onChange={set('email')} placeholder="user@example.com" />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-control" type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" />
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-control" value={form.role} onChange={set('role')}>
                <option value="Admin">Admin</option>
                <option value="Analyst">Analyst</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
            {isEdit && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={set('status')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              {isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
