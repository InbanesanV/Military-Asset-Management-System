import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Plus, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { purchaseAPI, assetAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Purchases = () => {
  const { user, isAdmin } = useAuth();
  const [purchases, setPurchases] = useState([]);
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
    baseId: user?.baseId ? String(user.baseId) : '',
    equipmentTypeId: '',
    quantity: '',
    notes: '',
  });

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (!isAdmin && user?.baseId) params.baseId = user.baseId;
      const res = await purchaseAPI.getAll(params);
      setPurchases(res.data.purchases);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, isAdmin, user?.baseId]);

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

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
    setSubmitting(true);
    try {
      await purchaseAPI.create({
        baseId: parseInt(form.baseId),
        equipmentTypeId: parseInt(form.equipmentTypeId),
        quantity: parseInt(form.quantity),
        notes: form.notes || undefined,
      });
      setSuccess('Purchase recorded successfully!');
      setForm({ baseId: user?.baseId ? String(user.baseId) : '', equipmentTypeId: '', quantity: '', notes: '' });
      fetchPurchases();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record purchase.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const categoryBadge = (category) => {
    const map = { WEAPON: 'badge-red', VEHICLE: 'badge-yellow', AMMUNITION: 'badge-green' };
    return map[category] || 'badge-blue';
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Purchases</h1>
        <p className="page-subheader">Log incoming asset stock and view procurement history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="section-card">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
              <Plus className="w-4 h-4 text-brand-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-700">Log New Purchase</h2>
          </div>

          {success && <div className="alert-success mb-4">✓ {success}</div>}
          {error && <div className="alert-error mb-4">✗ {error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Base *</label>
              <select
                value={form.baseId}
                onChange={(e) => setForm({ ...form, baseId: e.target.value })}
                className="select-field"
                required
                disabled={!isAdmin}
                id="purchase-base-select"
              >
                <option value="">Select Base</option>
                {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label">Equipment Type *</label>
              <select
                value={form.equipmentTypeId}
                onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })}
                className="select-field"
                required
                id="purchase-equipment-select"
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
                placeholder="e.g. 50"
                required
                id="purchase-quantity-input"
              />
            </div>

            <div>
              <label className="form-label">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-field resize-none"
                rows={3}
                placeholder="Optional notes..."
                id="purchase-notes-input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2"
              id="purchase-submit-btn"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Package className="w-4 h-4" />
              )}
              {submitting ? 'Recording...' : 'Record Purchase'}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="section-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-700">Purchase History</h2>
            <span className="text-xs text-slate-400 bg-surface-100 px-2.5 py-1 rounded-full">{total} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Base</th>
                  <th>Equipment</th>
                  <th>Category</th>
                  <th className="text-right">Qty</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j}>
                          <div className="h-4 bg-surface-200 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : purchases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-400 py-10">
                      <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No purchase records found
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id}>
                      <td className="text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="font-medium text-slate-700">{p.base_name}</td>
                      <td className="text-slate-600">{p.equipment_name}</td>
                      <td><span className={categoryBadge(p.category)}>{p.category}</span></td>
                      <td className="text-right font-bold text-emerald-600">+{p.quantity.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-2.5 disabled:opacity-40"
                id="prev-page-btn"
              >
                <ChevronLeft className="w-3 h-3" /> Prev
              </button>
              <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-2.5 disabled:opacity-40"
                id="next-page-btn"
              >
                Next <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Purchases;
