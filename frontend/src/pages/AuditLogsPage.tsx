import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Search, History, Filter } from 'lucide-react';
import { auditAPI } from '../services/api';
import type { AuditLog } from '../types';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: '',
    page: 1,
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditAPI.getAll(filters);
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch {} finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
  };

  const setPage = (p: number) => setFilters(f => ({ ...f, page: p }));

  const getActionBadgeClass = (action: string) => {
    if (action.includes('CREATE')) return 'success';
    if (action.includes('UPDATE') || action.includes('ROLE')) return 'warning';
    if (action.includes('DELETE') || action.includes('REJECT') || action.includes('DEACTIVATE')) return 'danger';
    return 'info';
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>Audit logs</h1>
          <p>Trace all critical system activities and user actions</p>
        </div>
      </div>

      <div className="table-container">
        {/* Filter Bar */}
        <div className="filter-bar">
          <div style={{ display: 'flex', gap: '0.75rem', flex: 1, flexWrap: 'wrap' }}>
            <div className="search-wrap" style={{ minWidth: 200 }}>
              <Filter size={15} className="search-icon" />
              <select 
                className="form-control" 
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
              >
                <option value="">All Actions</option>
                <optgroup label="Authentication">
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                </optgroup>
                <optgroup label="Financial Records">
                  <option value="CREATE_RECORD">Create Record</option>
                  <option value="UPDATE_RECORD">Update Record</option>
                  <option value="DELETE_RECORD">Delete Record</option>
                  <option value="RESTORE_RECORD">Restore Record</option>
                </optgroup>
                <optgroup label="User Management">
                  <option value="CREATE_USER">Create User</option>
                  <option value="UPDATE_USER">Update User</option>
                  <option value="ROLE_CHANGE">Role Change</option>
                  <option value="DEACTIVATE_USER">Deactivate User</option>
                </optgroup>
                <optgroup label="Access Requests">
                  <option value="ACCESS_REQUEST_CREATED">Request Created</option>
                  <option value="ACCESS_REQUEST_APPROVED">Request Approved</option>
                  <option value="ACCESS_REQUEST_REJECTED">Request Rejected</option>
                </optgroup>
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="date" 
                className="form-control" 
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                placeholder="From"
              />
              <span style={{ color: 'var(--text-muted)' }}>to</span>
              <input 
                type="date" 
                className="form-control" 
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                placeholder="To"
              />
            </div>
          </div>
          
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ action: '', startDate: '', endDate: '', page: 1 })}>
            Reset Filters
          </button>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="loading-screen" style={{ minHeight: 300 }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><History size={40} /></div>
            <h3>No audit logs found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th style={{ width: '30%' }}>Details</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{log.userId?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.userId?.email}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${getActionBadgeClass(log.action)}`} style={{ fontSize: '0.7rem' }}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', opacity: 0.8 }}>{log.entity}</span>
                      {log.entityId && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.entityId}</div>}
                    </td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {log.details}
                    </td>
                    <td style={{ fontSize: '0.8125rem', fontFamily: 'monospace', opacity: 0.7 }}>
                      {log.ipAddress || 'local'}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <span className="pagination-info">
              Showing {logs.length} of {pagination.total} logs
            </span>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => setPage(pagination.page - 1)} disabled={pagination.page === 1}>‹</button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const p = pagination.page <= 3 ? i + 1 : pagination.page + i - 2;
                if (p > pagination.pages) return null;
                return (
                  <button 
                    key={p} 
                    className={`page-btn ${p === pagination.page ? 'active' : ''}`} 
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
              <button className="page-btn" onClick={() => setPage(pagination.page + 1)} disabled={pagination.page === pagination.pages}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
