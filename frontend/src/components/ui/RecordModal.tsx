/**
 * RecordModal — Add/Edit Financial Record Form
 * Admin-only component for creating and updating records.
 */
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { recordAPI } from '../../services/api';
import { VALID_CATEGORIES } from '../../types';
import type { FinancialRecord, CreateRecordPayload } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface RecordModalProps {
  record?: FinancialRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

const RecordModal = ({ record, onClose, onSuccess }: RecordModalProps) => {
  const isEdit = !!record;

  const [form, setForm] = useState<CreateRecordPayload>({
    amount: record?.amount ?? 0,
    type: record?.type ?? 'expense',
    category: record?.category ?? 'Other',
    date: record?.date ? format(new Date(record.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    notes: record?.notes ?? '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateRecordPayload, string>>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.amount || form.amount <= 0) e.amount = 'Amount must be greater than 0';
    if (!form.type) e.type = 'Type is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.date) e.date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEdit) {
  await recordAPI.update(record!._id, { ...form, __v: record!.__v });
  toast.success('Record updated successfully');
} else {
        await recordAPI.create(form);
        toast.success('Record created successfully');
      }
      onSuccess();
      onClose();
    } catch {
      // Error handled globally by Axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof CreateRecordPayload) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: field === 'amount' ? Number(e.target.value) : e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up">
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? '✏️ Edit Record' : '➕ Add Record'}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                value={form.amount || ''}
                onChange={set('amount')}
                placeholder="0.00"
              />
              {errors.amount && <p className="form-error">{errors.amount}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-control" value={form.type} onChange={set('type')}>
                <option value="income">💰 Income</option>
                <option value="expense">💸 Expense</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={form.category} onChange={set('category')}>
                {VALID_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={form.date as string}
                onChange={set('date')}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.notes ?? ''}
              onChange={set('notes')}
              placeholder="Add any notes..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              {isEdit ? 'Update Record' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordModal;
