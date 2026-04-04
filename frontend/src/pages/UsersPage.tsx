/**
 * Users Page — Admin Only
 * Manage user accounts: create, edit role/status, deactivate.
 * Backend will reject any non-Admin request to these endpoints.
 */
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, UserX } from 'lucide-react';
import { userAPI } from '../services/api';
import UserModal from '../components/ui/UserModal';
import type { User, UserFilters } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({ page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({ ...filters, search: debouncedSearch || undefined });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch {} finally { setLoading(false); }
  }, [filters, debouncedSearch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDeactivate = async (u: User) => {
    if (u._id === currentUser?._id) return toast.error('Cannot deactivate yourself');
    if (!window.confirm(`Deactivate ${u.name}?`)) return;
    try {
      await userAPI.deactivate(u._id);
      toast.success(`${u.name} deactivated`);
      fetchUsers();
    } catch {}
  };

  const openAdd = () => { setEditUser(null); setModalOpen(true); };
  const openEdit = (u: User) => { setEditUser(u); setModalOpen(true); };
  const setPage = (p: number) => setFilters((f) => ({ ...f, page: p }));

  return (
    <div className="page-wrapper animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>User Management</h1>
          <p>Manage team members and their roles</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="table-container">
        {/* Search & Filters */}
        <div className="filter-bar">
          <div className="search-wrap">
            <Search size={15} className="search-icon" />
            <input
              className="form-control"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setFilters((f) => ({ ...f, page: 1 })); }}
            />
          </div>
          <select className="form-control" defaultValue="" onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value as any, page: 1 }))}>
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Analyst">Analyst</option>
            <option value="Viewer">Viewer</option>
          </select>
          <select className="form-control" defaultValue="" onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as any, page: 1 }))}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-screen" style={{ minHeight: 240 }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No users found</h3>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Joined</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const initials = u.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
                const isSelf = u._id === currentUser?._id;
                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{initials}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {u.name} {isSelf && <span style={{ color: 'var(--primary)', fontSize: '0.7rem' }}>(you)</span>}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                    <td><span className={`badge badge-${u.status}`}>{u.status}</span></td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {u.lastLogin ? format(new Date(u.lastLogin), 'MMM d, yyyy') : 'Never'}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {format(new Date(u.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(u)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm btn-icon"
                          onClick={() => handleDeactivate(u)}
                          disabled={isSelf || u.status === 'inactive'}
                          title={u.status === 'inactive' ? 'Already inactive' : 'Deactivate'}
                        >
                          <UserX size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <span className="pagination-info">
              {pagination.total} users total
            </span>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => setPage(pagination.page - 1)} disabled={pagination.page === 1}>‹</button>
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button key={i+1} className={`page-btn ${i+1 === pagination.page ? 'active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(pagination.page + 1)} disabled={pagination.page === pagination.pages}>›</button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <UserModal user={editUser} onClose={() => setModalOpen(false)} onSuccess={fetchUsers} />
      )}
    </div>
  );
};

export default UsersPage;
