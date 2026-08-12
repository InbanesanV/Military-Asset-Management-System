import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { auditAPI } from '../services/api';

const actionBadge = (action) => {
  const map = {
    PURCHASE: 'badge-blue',
    TRANSFER: 'badge-green',
    ASSIGNMENT: 'badge-yellow',
    EXPENDITURE: 'badge-red',
  };
  return map[action] || 'badge-purple';
};

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({ action: '', startDate: '', endDate: '' });
  const LIMIT = 25;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filter.action) params.action = filter.action;
      if (filter.startDate) params.startDate = filter.startDate;
      if (filter.endDate) params.endDate = filter.endDate;
      const res = await auditAPI.getAll(params);
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Audit Log</h1>
        <p className="page-subheader">Complete system activity trail — Admin access only</p>
      </div>

      {/* Filter */}
      <div className="section-card">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center">
            <Search className="w-3.5 h-3.5 text-brand-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Filter Audit Records</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="form-label">Action Type</label>
            <select
              value={filter.action}
              onChange={(e) => { setFilter({ ...filter, action: e.target.value }); setPage(1); }}
              className="select-field"
              id="audit-action-filter"
            >
              <option value="">All Actions</option>
              <option value="PURCHASE">PURCHASE</option>
              <option value="TRANSFER">TRANSFER</option>
              <option value="ASSIGNMENT">ASSIGNMENT</option>
              <option value="EXPENDITURE">EXPENDITURE</option>
            </select>
          </div>
          <div>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => { setFilter({ ...filter, startDate: e.target.value }); setPage(1); }}
              className="input-field"
              id="audit-start-date"
            />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => { setFilter({ ...filter, endDate: e.target.value }); setPage(1); }}
              className="input-field"
              id="audit-end-date"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-slate-400" />
            <h2 className="text-base font-semibold text-slate-700">Activity Records</h2>
          </div>
          <span className="text-xs text-slate-400 bg-surface-100 px-2.5 py-1 rounded-full">{total} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j}><div className="h-4 bg-surface-200 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-10">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No audit records found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-xs font-mono text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="font-semibold text-brand-600 text-sm">{log.username || '—'}</td>
                    <td><span className={actionBadge(log.action)}>{log.action}</span></td>
                    <td className="text-xs max-w-xs truncate text-slate-600" title={log.details}>{log.details}</td>
                    <td className="text-xs font-mono text-slate-400">{log.ip_address || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-2.5 disabled:opacity-40"
              id="audit-prev-btn"
            >
              <ChevronLeft className="w-3 h-3" /> Prev
            </button>
            <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-2.5 disabled:opacity-40"
              id="audit-next-btn"
            >
              Next <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
