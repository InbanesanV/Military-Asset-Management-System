import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Package, TrendingUp, Users, Crosshair, Minus, RefreshCw, Filter, SlidersHorizontal,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import NetMoveModal from '../components/NetMoveModal';
import { assetAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    baseId: user?.baseId ? String(user.baseId) : '',
    equipmentTypeId: '',
    startDate: '',
    endDate: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.baseId) params.baseId = filters.baseId;
      if (filters.equipmentTypeId) params.equipmentTypeId = filters.equipmentTypeId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const [metricsRes, chartRes] = await Promise.all([
        assetAPI.getDashboard(params),
        assetAPI.getChartData(params),
      ]);
      setMetrics(metricsRes.data);
      setChartData(chartRes.data.chartData || []);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [basesRes, equipRes] = await Promise.all([
          assetAPI.getBases(),
          assetAPI.getEquipmentTypes(),
        ]);
        setBases(basesRes.data.bases);
        setEquipmentTypes(equipRes.data.equipmentTypes);
      } catch (err) {
        console.error(err);
      }
    };
    loadMeta();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ baseId: user?.baseId ? String(user.baseId) : '', equipmentTypeId: '', startDate: '', endDate: '' });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-surface-200 rounded-xl shadow-card-md p-3 text-xs">
          <p className="font-bold text-slate-700 mb-2">{label}</p>
          {payload.map((entry) => (
            <div key={entry.name} className="flex justify-between gap-4 mb-1">
              <span style={{ color: entry.color }} className="font-medium">{entry.name}</span>
              <span className="font-semibold text-slate-700">{entry.value?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 text-sm">{user?.baseName || 'All Bases'}</p>
        </div>
        <button
          onClick={fetchData}
          className="btn-secondary flex items-center gap-2 self-start sm:self-auto"
          id="refresh-dashboard-btn"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          id="stat-opening"
          title="Opening Balance"
          value={metrics?.openingBalance ?? 0}
          icon={Package}
          color="blue"
          subtitle="Units at period start"
          loading={loading}
        />
        <StatCard
          id="stat-net-movement"
          title="Net Movement"
          value={metrics?.netMovement ?? 0}
          icon={TrendingUp}
          color="emerald"
          subtitle="Click to see breakdown"
          clickable
          onClick={() => setShowModal(true)}
          loading={loading}
        />
        <StatCard
          id="stat-assigned"
          title="Assigned"
          value={metrics?.assigned ?? 0}
          icon={Users}
          color="amber"
          subtitle="Units allocated to personnel"
          loading={loading}
        />
        <StatCard
          id="stat-expended"
          title="Expended"
          value={metrics?.expended ?? 0}
          icon={Crosshair}
          color="red"
          subtitle="Units consumed / used up"
          loading={loading}
        />
        <StatCard
          id="stat-closing"
          title="Closing Balance"
          value={metrics?.closingBalance ?? 0}
          icon={Minus}
          color="indigo"
          subtitle="Current net inventory"
          loading={loading}
        />
      </div>

      {/* Filters */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Filter Metrics</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {isAdmin && (
            <div>
              <label className="form-label">Base</label>
              <select
                name="baseId"
                value={filters.baseId}
                onChange={handleFilterChange}
                className="select-field"
                id="filter-base"
              >
                <option value="">All Bases</option>
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="form-label">Equipment Type</label>
            <select
              name="equipmentTypeId"
              value={filters.equipmentTypeId}
              onChange={handleFilterChange}
              className="select-field"
              id="filter-equipment"
            >
              <option value="">All Equipment</option>
              {equipmentTypes.map((et) => (
                <option key={et.id} value={et.id}>{et.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="input-field"
              id="filter-start-date"
            />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="input-field"
              id="filter-end-date"
            />
          </div>
        </div>
        <button
          onClick={clearFilters}
          className="btn-secondary mt-3 text-xs px-3 py-1.5"
          id="clear-filters-btn"
        >
          Clear Filters
        </button>
      </div>

      {/* Chart */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-slate-800">Asset Inventory by Base</h3>
          {chartData.length > 0 && (
            <span className="text-xs text-slate-400 bg-surface-100 px-2.5 py-1 rounded-full">
              {chartData.length} bases
            </span>
          )}
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
              <Legend wrapperStyle={{ color: '#64748b', fontSize: '12px', paddingTop: '12px' }} />
              <Bar dataKey="WEAPON" fill="#7C3AED" name="Weapons" radius={[6, 6, 0, 0]} />
              <Bar dataKey="VEHICLE" fill="#F59E0B" name="Vehicles" radius={[6, 6, 0, 0]} />
              <Bar dataKey="AMMUNITION" fill="#10B981" name="Ammunition" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
            <Package className="w-8 h-8 text-slate-300" />
            {loading ? 'Loading chart data...' : 'No data available for the selected filters'}
          </div>
        )}
      </div>

      {/* Net Movement Modal */}
      {showModal && (
        <NetMoveModal metrics={metrics} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
