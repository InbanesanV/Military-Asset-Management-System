import React, { useState, useEffect, useCallback } from 'react';
import { Users, Crosshair, Plus } from 'lucide-react';
import { assignmentAPI, expenditureAPI, assetAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Assignments = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [assignForm, setAssignForm] = useState({
    baseId: user?.baseId ? String(user.baseId) : '',
    equipmentTypeId: '',
    quantity: '',
    assignedTo: '',
    notes: '',
  });

  const [expendForm, setExpendForm] = useState({
    baseId: user?.baseId ? String(user.baseId) : '',
    equipmentTypeId: '',
    quantity: '',
    reason: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assignRes, expendRes] = await Promise.all([
        assignmentAPI.getAll({ limit: 20 }),
        expenditureAPI.getAll({ limit: 20 }),
      ]);
      setAssignments(assignRes.data.assignments);
      setExpenditures(expendRes.data.expenditures);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      await assignmentAPI.create({
        baseId: parseInt(assignForm.baseId),
        equipmentTypeId: parseInt(assignForm.equipmentTypeId),
        quantity: parseInt(assignForm.quantity),
        assignedTo: assignForm.assignedTo,
        notes: assignForm.notes || undefined,
      });
      setSuccess('Assignment recorded!');
      setAssignForm({ baseId: user?.baseId ? String(user.baseId) : '', equipmentTypeId: '', quantity: '', assignedTo: '', notes: '' });
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record assignment.');
    } finally { setSubmitting(false); }
  };

  const handleExpendSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      await expenditureAPI.create({
        baseId: parseInt(expendForm.baseId),
        equipmentTypeId: parseInt(expendForm.equipmentTypeId),
        quantity: parseInt(expendForm.quantity),
        reason: expendForm.reason || undefined,
      });
      setSuccess('Expenditure recorded!');
      setExpendForm({ baseId: user?.baseId ? String(user.baseId) : '', equipmentTypeId: '', quantity: '', reason: '' });
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record expenditure.');
    } finally { setSubmitting(false); }
  };

  const FormField = ({ label, id, children }) => (
    <div>
      <label className="form-label" htmlFor={id}>{label}</label>
      {children}
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Assignments & Expenditures</h1>
        <p className="page-subheader">Allocate assets to personnel and record consumption</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-200 rounded-xl w-fit">
        {[
          { key: 'assignments', label: 'Assignments', icon: Users },
          { key: 'expenditures', label: 'Expenditures', icon: Crosshair },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSuccess(''); setError(''); }}
            id={`tab-${key}`}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <div className="section-card">
          <div className="flex items-center gap-2.5 mb-5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'assignments' ? 'bg-amber-100' : 'bg-red-100'}`}>
              {activeTab === 'assignments'
                ? <Users className="w-4 h-4 text-amber-600" />
                : <Crosshair className="w-4 h-4 text-red-600" />}
            </div>
            <h2 className="text-base font-semibold text-slate-700">
              {activeTab === 'assignments' ? 'New Assignment' : 'Record Expenditure'}
            </h2>
          </div>

          {success && <div className="alert-success mb-4">✓ {success}</div>}
          {error && <div className="alert-error mb-4">✗ {error}</div>}

          {activeTab === 'assignments' ? (
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <FormField label="Base *" id="assign-base-select">
                <select id="assign-base-select" value={assignForm.baseId} onChange={e => setAssignForm({ ...assignForm, baseId: e.target.value })} className="select-field" required disabled={!isAdmin}>
                  <option value="">Select Base</option>
                  {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </FormField>
              <FormField label="Equipment Type *" id="assign-equipment-select">
                <select id="assign-equipment-select" value={assignForm.equipmentTypeId} onChange={e => setAssignForm({ ...assignForm, equipmentTypeId: e.target.value })} className="select-field" required>
                  <option value="">Select Equipment</option>
                  {equipmentTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
                </select>
              </FormField>
              <FormField label="Quantity *" id="assign-quantity-input">
                <input id="assign-quantity-input" type="number" min="1" value={assignForm.quantity} onChange={e => setAssignForm({ ...assignForm, quantity: e.target.value })} className="input-field" placeholder="e.g. 10" required />
              </FormField>
              <FormField label="Assigned To *" id="assign-to-input">
                <input id="assign-to-input" type="text" value={assignForm.assignedTo} onChange={e => setAssignForm({ ...assignForm, assignedTo: e.target.value })} className="input-field" placeholder="e.g. Alpha Company, 1st Platoon" required />
              </FormField>
              <FormField label="Notes" id="assign-notes-input">
                <textarea id="assign-notes-input" value={assignForm.notes} onChange={e => setAssignForm({ ...assignForm, notes: e.target.value })} className="input-field resize-none" rows={2} placeholder="Optional notes..." />
              </FormField>
              <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2" id="assign-submit-btn">
                {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                {submitting ? 'Recording...' : 'Record Assignment'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleExpendSubmit} className="space-y-4">
              <FormField label="Base *" id="expend-base-select">
                <select id="expend-base-select" value={expendForm.baseId} onChange={e => setExpendForm({ ...expendForm, baseId: e.target.value })} className="select-field" required disabled={!isAdmin}>
                  <option value="">Select Base</option>
                  {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </FormField>
              <FormField label="Equipment Type *" id="expend-equipment-select">
                <select id="expend-equipment-select" value={expendForm.equipmentTypeId} onChange={e => setExpendForm({ ...expendForm, equipmentTypeId: e.target.value })} className="select-field" required>
                  <option value="">Select Equipment</option>
                  {equipmentTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
                </select>
              </FormField>
              <FormField label="Quantity *" id="expend-quantity-input">
                <input id="expend-quantity-input" type="number" min="1" value={expendForm.quantity} onChange={e => setExpendForm({ ...expendForm, quantity: e.target.value })} className="input-field" placeholder="e.g. 500" required />
              </FormField>
              <FormField label="Reason" id="expend-reason-input">
                <textarea id="expend-reason-input" value={expendForm.reason} onChange={e => setExpendForm({ ...expendForm, reason: e.target.value })} className="input-field resize-none" rows={3} placeholder="e.g. Live fire training exercise" />
              </FormField>
              <button type="submit" disabled={submitting} className="btn-danger w-full flex items-center justify-center gap-2" id="expend-submit-btn">
                {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Crosshair className="w-4 h-4" />}
                {submitting ? 'Recording...' : 'Record Expenditure'}
              </button>
            </form>
          )}
        </div>

        {/* History Table */}
        <div className="section-card lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-700 mb-4">
            {activeTab === 'assignments' ? 'Assignment History' : 'Expenditure History'}
          </h2>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Base</th>
                  <th>Equipment</th>
                  {activeTab === 'assignments' ? <th>Assigned To</th> : <th>Reason</th>}
                  <th className="text-right">Qty</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j}><div className="h-4 bg-surface-200 rounded animate-pulse" /></td>)}</tr>
                  ))
                ) : activeTab === 'assignments' ? (
                  assignments.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-slate-400 py-10">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No assignments found
                    </td></tr>
                  ) : (
                    assignments.map(a => (
                      <tr key={a.id}>
                        <td className="text-xs text-slate-500">{new Date(a.created_at).toLocaleDateString()}</td>
                        <td className="text-xs font-medium text-slate-700">{a.base_name}</td>
                        <td className="text-xs text-slate-600">{a.equipment_name}</td>
                        <td className="text-xs text-slate-600">{a.assigned_to}</td>
                        <td className="text-right font-bold text-amber-600">{a.quantity.toLocaleString()}</td>
                      </tr>
                    ))
                  )
                ) : (
                  expenditures.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-slate-400 py-10">
                      <Crosshair className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No expenditures found
                    </td></tr>
                  ) : (
                    expenditures.map(e => (
                      <tr key={e.id}>
                        <td className="text-xs text-slate-500">{new Date(e.created_at).toLocaleDateString()}</td>
                        <td className="text-xs font-medium text-slate-700">{e.base_name}</td>
                        <td className="text-xs text-slate-600">{e.equipment_name}</td>
                        <td className="text-xs text-slate-600">{e.reason || '—'}</td>
                        <td className="text-right font-bold text-red-600">{e.quantity.toLocaleString()}</td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignments;
