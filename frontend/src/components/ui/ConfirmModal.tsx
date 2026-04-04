import { X, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  type = 'danger',
}: ConfirmModalProps) => {
  const confirmBtnClass = type === 'danger' ? 'btn-danger' : type === 'warning' ? 'btn-warning' : 'btn-primary';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}>
      <div className="modal animate-slide-up" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              className={`kpi-icon-wrap`}
              style={{
                width: 32,
                height: 32,
                marginBottom: 0,
                background: type === 'danger' ? 'var(--danger-light)' : 'var(--primary-light)',
                color: type === 'danger' ? 'var(--danger)' : 'var(--primary)',
              }}
            >
              <AlertCircle size={18} />
            </div>
            <h3 className="modal-title">{title}</h3>
          </div>
          <button className="modal-close" onClick={onCancel} disabled={loading}><X size={20} /></button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{message}</p>
        </div>

        <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button className={`btn ${confirmBtnClass}`} onClick={onConfirm} disabled={loading}>
            {loading && <span className="spinner" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
