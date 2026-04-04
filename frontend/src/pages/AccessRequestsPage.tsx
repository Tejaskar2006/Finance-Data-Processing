import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Check, X, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { accessAPI } from '../services/api';
import type { AccessRequest } from '../types';
import ConfirmModal from '../components/ui/ConfirmModal';

const AccessRequestsPage = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Confirm Modal State
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    id: string | null;
    actionType: 'approve' | 'reject' | null;
  }>({
    open: false,
    title: '',
    message: '',
    type: 'info',
    id: null,
    actionType: null,
  });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      // The API returns { data: AccessRequest[], count: number } wrapped in ApiResponse
      const res = await accessAPI.getAll();
      setRequests(res.data.data as any); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = (id: string) => {
    setConfirmState({
      open: true,
      title: 'Approve Request',
      message: 'Are you sure you want to approve this request? The user will immediately gain the requested role metrics.',
      type: 'info',
      id,
      actionType: 'approve',
    });
  };

  const executeApprove = async (id: string) => {
    setConfirmState(prev => ({ ...prev, open: false }));
    setProcessing(id);
    try {
      await accessAPI.approve(id);
      toast.success('Request approved and user role updated.');
      fetchRequests();
    } catch (err: any) {
      if (err.response?.status !== 401) {
         toast.error(err.response?.data?.message || 'Failed to approve');
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = (id: string) => {
    setConfirmState({
      open: true,
      title: 'Reject Request',
      message: 'Are you sure you want to reject this role upgrade request?',
      type: 'danger',
      id,
      actionType: 'reject',
    });
  };

  const executeReject = async (id: string) => {
    setConfirmState(prev => ({ ...prev, open: false }));
    setProcessing(id);
    try {
      await accessAPI.reject(id);
      toast.success('Request rejected.');
      fetchRequests();
    } catch (err: any) {
      if (err.response?.status !== 401) {
         toast.error(err.response?.data?.message || 'Failed to reject');
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleConfirm = () => {
    if (!confirmState.id) return;
    if (confirmState.actionType === 'approve') executeApprove(confirmState.id);
    if (confirmState.actionType === 'reject') executeReject(confirmState.id);
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>Access Requests</h1>
          <p>Review and manage user role upgrade requests</p>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-screen" style={{ minHeight: 240 }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
             <div className="empty-state-icon">
                <ShieldAlert size={48} color="var(--text-muted)" />
             </div>
             <h3>No pending requests</h3>
             <p>Users can submit role requests from their dashboard sidebar.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Current Role</th>
                  <th>Requested Role</th>
                  <th style={{ width: '30%' }}>Reason</th>
                  <th>Status</th>
                  <th>Date Requested</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{req.user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.user?.email}</div>
                    </td>
                    <td>
                      <span className={`role-badge ${req.user?.role}`}>{req.user?.role}</span>
                    </td>
                    <td>
                      <span className={`role-badge ${req.requestedRole}`}>{req.requestedRole}</span>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {req.reason}
                    </td>
                    <td>
                      <span className={`badge badge-${req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'danger'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {format(new Date(req.createdAt), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {req.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button 
                            className="btn btn-success btn-sm btn-icon" 
                            title="Approve"
                            onClick={() => handleApprove(req._id)}
                            disabled={processing === req._id}
                          >
                            {processing === req._id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Check size={14} />}
                          </button>
                          <button 
                            className="btn btn-danger btn-sm btn-icon" 
                            title="Reject"
                            onClick={() => handleReject(req._id)}
                            disabled={processing === req._id}
                          >
                            {processing === req._id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <X size={14} />}
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {confirmState.open && (
        <ConfirmModal
          title={confirmState.title}
          message={confirmState.message}
          type={confirmState.type}
          confirmText={confirmState.actionType === 'approve' ? 'Approve' : 'Reject'}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmState(prev => ({ ...prev, open: false }))}
        />
      )}
    </div>
  );
};

export default AccessRequestsPage;
