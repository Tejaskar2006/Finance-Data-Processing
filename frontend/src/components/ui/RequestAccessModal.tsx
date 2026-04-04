import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { accessAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface RequestAccessModalProps {
  onClose: () => void;
}

const RequestAccessModal = ({ onClose }: RequestAccessModalProps) => {
  const { user } = useAuth();
  const [requestedRole, setRequestedRole] = useState<'Admin' | 'Analyst'>('Analyst');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      return toast.error('Please provide a reason for your request.');
    }

    setLoading(true);
    try {
      await accessAPI.create({ requestedRole, reason });
      toast.success('Access upgrade request submitted successfully.');
      onClose();
    } catch (err: any) {
      if (err.response?.status !== 401) {
        toast.error(err.response?.data?.message || 'Failed to submit request');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="modal animate-slide-up" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h3 className="modal-title">Request Role Upgrade</h3>
          <button type="button" className="modal-close" onClick={onClose} disabled={loading}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
            Current Role: <strong>{user?.role}</strong>
          </p>

          <div className="form-group">
            <label className="form-label">Requested Role</label>
            <select 
              className="form-control" 
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value as any)}
              disabled={loading}
              required
            >
              <option value="Analyst">Analyst</option>
              <option value="Admin">Admin</option>
            </select>
            {requestedRole === user?.role && (
              <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                You already have this role. Please select a different one.
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea
              className="form-control"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you need this level of access..."
              rows={4}
              disabled={loading}
              required
              maxLength={500}
            />
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {reason.length}/500
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || requestedRole === user?.role}
            >
              {loading && <span className="spinner" />}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestAccessModal;
