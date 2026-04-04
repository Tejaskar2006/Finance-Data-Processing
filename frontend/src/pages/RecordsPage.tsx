/**
 * Records Page
 * Financial records table with filtering, pagination, and RBAC-based actions.
 *
 * Admin:   Full table + Add/Edit/Delete buttons
 * Analyst: Full table + filters, no Add/Edit/Delete
 * Viewer:  Last 10 records, no filters shown
 */
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, RefreshCw, RotateCcw, Archive } from 'lucide-react';
import { recordAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RoleGate } from '../components/layout/ProtectedRoute';
import RecordModal from '../components/ui/RecordModal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useDebounce } from '../hooks/useDebounce';
import type { FinancialRecord, RecordFilters } from '../types';
import { VALID_CATEGORIES } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const RecordsPage = () => {
  const { hasRole } = useAuth();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RecordFilters>({ page: 1, limit: 20 });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<FinancialRecord | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isTrash, setIsTrash] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<FinancialRecord | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = isTrash
        ? await recordAPI.getDeleted(filters.page)
        : await recordAPI.getAll({ ...filters, search: debouncedSearch || undefined });
      setRecords(res.data.data);
      setPagination(res.data.pagination);
    } catch {} finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, isTrash]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(confirmDelete._id);
    try {
      await recordAPI.delete(confirmDelete._id);
      toast.success('Record moved to trash');
      setConfirmDelete(null);
      fetchRecords();
    } catch {} finally { setDeleting(null); }
  };

  const handleRestore = async (id: string) => {
    setRestoring(id);
    try {
      await recordAPI.restore(id);
      toast.success('Record restored successfully');
      fetchRecords();
    } catch {} finally { setRestoring(null); }
  };

  const handleFilterChange = (key: keyof RecordFilters) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setFilters((p) => ({ ...p, [key]: e.target.value || undefined, page: 1 }));

  const setPage = (p: number) => setFilters((f) => ({ ...f, page: p }));

  const openAdd = () => { setEditRecord(null); setModalOpen(true); };
  const openEdit = (r: FinancialRecord) => { setEditRecord(r); setModalOpen(true); };

  return (
    <div className="page-wrapper animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>{isTrash ? 'Trash Bin' : 'Financial Records'}</h1>
          <p>{isTrash ? `${pagination.total} deleted items` : `${pagination.total} total records`}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <RoleGate roles={['Admin', 'Analyst']}>
            <button
              className={`btn ${isTrash ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setIsTrash(!isTrash); setFilters({ page: 1, limit: 20 }); }}
            >
              {isTrash ? <RefreshCw size={16} /> : <Archive size={16} />}
              {isTrash ? 'View Active' : 'View Trash'}
            </button>
          </RoleGate>
          {!isTrash && (
            <RoleGate roles={['Admin']}>
              <button className="btn btn-primary" onClick={openAdd}>
                <Plus size={16} /> Add Record
              </button>
            </RoleGate>
          )}
        </div>
      </div>

      <div className="table-container">
        {/* Filter Bar — Admin and Analyst */}
        <RoleGate roles={['Admin', 'Analyst']}>
          <div className="filter-bar">
            {/* Search */}
            <div className="search-wrap">
              <Search size={15} className="search-icon" />
              <input
                className="form-control"
                placeholder="Search notes / category..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setFilters((f) => ({ ...f, page: 1 })); }}
              />
            </div>

            {/* Type filter */}
            <select className="form-control" onChange={handleFilterChange('type')} defaultValue="">
              <option value="">All Types</option>
              <option value="income">💰 Income</option>
              <option value="expense">💸 Expense</option>
            </select>

            {/* Category filter */}
            <select className="form-control" onChange={handleFilterChange('category')} defaultValue="">
              <option value="">All Categories</option>
              {VALID_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Date range */}
            <input type="date" className="form-control" onChange={handleFilterChange('startDate')} title="Start date" />
            <input type="date" className="form-control" onChange={handleFilterChange('endDate')} title="End date" />

            <button className="btn btn-ghost btn-sm" onClick={fetchRecords} title="Refresh">
              <RefreshCw size={15} />
            </button>
          </div>
        </RoleGate>
        {isTrash && (
          <div className="alert alert-info" style={{ margin: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Archive size={16} />
            <span>You are viewing deleted records. Admins can restore them using the button in the Actions column.</span>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="loading-screen" style={{ minHeight: 240 }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No records found</h3>
            <p>Try adjusting your filters or add a new record.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th>Created By</th>
                {/* Actions column — Admin only */}
                <RoleGate roles={['Admin']}>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </RoleGate>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {format(new Date(r.date), 'MMM d, yyyy')}
                  </td>
                  <td>
                    <span className={`badge badge-${r.type}`}>
                      {r.type === 'income' ? '↑' : '↓'} {r.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{r.category}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.notes || '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: r.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                    {r.type === 'income' ? '+' : '-'}{formatCurrency(r.amount)}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {typeof r.createdBy === 'object' ? r.createdBy.name : '—'}
                  </td>
                  <RoleGate roles={['Admin']}>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
                        {!isTrash ? (
                          <>
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(r)} title="Edit">
                              <Pencil size={14} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm btn-icon"
                              onClick={() => setConfirmDelete(r)}
                              disabled={deleting === r._id}
                              title="Delete"
                            >
                              {deleting === r._id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Trash2 size={14} />}
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm btn-icon"
                            onClick={() => handleRestore(r._id)}
                            disabled={restoring === r._id}
                            title="Restore"
                          >
                            {restoring === r._id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <RotateCcw size={14} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </RoleGate>
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
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => setPage(pagination.page - 1)} disabled={pagination.page === 1}>‹</button>
              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button key={p} className={`page-btn ${p === pagination.page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                );
              })}
              <button className="page-btn" onClick={() => setPage(pagination.page + 1)} disabled={pagination.page === pagination.pages}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Record Modal */}
      {modalOpen && (
        <RecordModal
          record={editRecord}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchRecords}
        />
      )}
      {/* Confirmation Modal */}
      {confirmDelete && (
        <ConfirmModal
          title="Delete Record?"
          message={`Are you sure you want to delete the ${confirmDelete.category} record for ${formatCurrency(confirmDelete.amount)}? This will move it to the trash bin.`}
          confirmText="Delete Record"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
          loading={!!deleting}
        />
      )}
    </div>
  );
};

export default RecordsPage;
