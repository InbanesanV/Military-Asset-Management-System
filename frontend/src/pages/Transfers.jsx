import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeftRight, Plus, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { transferAPI, assetAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusBadge = (status) => {
  const map = {
    COMPLETED: 'badge-green',
    IN_TRANSIT: 'badge-yellow',
    PENDING: 'badge-blue',
  };
  return map[status] || 'badge-blue';
};

const Transfers = () => {
  const { user, isAdmin } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  const [form, setForm] = useState({
    sourceBaseId: '',
    destinationBaseId: '',
    equipmentTypeId: '',
    quantity: '',
    notes: '',
  });

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transferAPI.getAll({ page, limit: LIMIT });
      setTransfers(res.data.transfers);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchTransfers(); }, [fetchTransfers]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [basesRes, equipRes] = await Promise.all([assetAPI.getBases(), assetAPI.getEquipmentTypes()]);
        setBases(basesRes.data.bases);
        setEquipmentTypes(equipRes.data.equipmentTypes);
      } catch (err) { console.error(err); }
    };
    loadMeta();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.sourceBaseId === form.destinationBaseId) {
      setError('Source and destination bases must be different.');
      return;
    }
    setSubmitting(true);
    try {
      await transferAPI.create({
        sourceBaseId: parseInt(form.sourceBaseId),
        destinationBaseId: parseInt(form.destinationBaseId),
        equipmentTypeId: parseInt(form.equipmentTypeId),
        quantity: parseInt(form.quantity),
        notes: form.notes || undefined,
      });
      setSuccess('Transfer completed successfully!');
      setForm({ sourceBaseId: '', destinationBaseId: '', equipmentTypeId: '', quantity: '', notes: '' });
      fetchTransfers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Transfers</h1>
        <p className="page-subheader">Initiate and track cross-base asset movements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="section-card">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-700">New Transfer</h2>
          </div>

          {success && <div className="alert-success mb-4">✓ {success}</div>}
          {error && <div className="alert-error mb-4">✗ {error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">From Base *</label>
              <select
                value={form.sourceBaseId}
                onChange={(e) => setForm({ ...form, sourceBaseId: e.target.value })}
                className="select-field"
                required
                id="transfer-source-select"
              >
                <option value="">Select Source Base</option>
                {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label">To Base *</label>
              <select
                value={form.destinationBaseId}
                onChange={(e) => setForm({ ...form, destinationBaseId: e.target.value })}
                className="select-field"
                required
                id="transfer-dest-select"
              >
                <option value="">Select Destination Base</option>
                {bases.map((b) => (
                  <option key={b.id} value={b.id} disabled={b.id === parseInt(form.sourceBaseId)}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Visual flow indicator */}
            {form.sourceBaseId && form.destinationBaseId && (
              <div className="flex items-center justify-between px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                <span className="text-emerald-700 font-semibold truncate">
                  {bases.find(b => b.id === parseInt(form.sourceBaseId))?.name}
                </span>
                <ArrowRight className="w-4 h-4 text-emerald-500 mx-2 shrink-0" />
                <span className="text-emerald-700 font-semibold truncate">
                  {bases.find(b => b.id === parseInt(form.destinationBaseId))?.name}
                </span>
              </div>
            )}

            <div>
              <label className="form-label">Equipment Type *</label>
              <select
                value={form.equipmentTypeId}
                onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })}
                className="select-field"
                required
                id="transfer-equipment-select"
              >
                <option value="">Select Equipment</option>
                {equipmentTypes.map((et) => <option key={et.id} value={et.id}>{et.name} ({et.category})</option>)}
              </select>
            </div>

            <div>
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="input-field"
                placeholder="e.g. 10"
                required
                id="transfer-quantity-input"
              />
            </div>

            <div>
              <label className="form-label">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-field resize-none"
                rows={2}
                placeholder="Transfer notes..."
                id="transfer-notes-input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2"
              id="transfer-submit-btn"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowLeftRight className="w-4 h-4" />
              )}
              {submitting ? 'Processing...' : 'Execute Transfer'}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="section-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-700">Transfer History</h2>
            <span className="text-xs text-slate-400 bg-surface-100 px-2.5 py-1 rounded-full">{total} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Equipment</th>
                  <th className="text-right">Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j}><div className="h-4 bg-surface-200 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : transfers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-400 py-10">
                      <ArrowLeftRight className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No transfer records found
                    </td>
                  </tr>
                ) : (
                  transfers.map((t) => (
                    <tr key={t.id}>
                      <td className="text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString()}</td>
                      <td className="font-medium text-xs text-slate-700">{t.source_base_name}</td>
                      <td className="font-medium text-xs text-slate-700">{t.destination_base_name}</td>
                      <td className="text-xs text-slate-600">{t.equipment_name}</td>
                      <td className="text-right font-bold text-brand-600">{t.quantity.toLocaleString()}</td>
                      <td><span className={statusBadge(t.status)}>{t.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-2.5 disabled:opacity-40" id="transfer-prev-btn">
                <ChevronLeft className="w-3 h-3" /> Prev
              </button>
              <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-2.5 disabled:opacity-40" id="transfer-next-btn">
                Next <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transfers;
