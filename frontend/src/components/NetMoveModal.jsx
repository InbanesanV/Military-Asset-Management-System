import React from 'react';
import { X, TrendingUp, Package, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const NetMoveModal = ({ metrics, onClose }) => {
  if (!metrics) return null;

  const items = [
    {
      label: 'Purchases',
      value: metrics.purchases,
      icon: Package,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      rowBg: 'bg-blue-50',
      valueCls: 'text-blue-600',
      sign: '+',
      description: 'New stock procured',
    },
    {
      label: 'Transfers In',
      value: metrics.transfersIn,
      icon: ArrowDownLeft,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      rowBg: 'bg-emerald-50',
      valueCls: 'text-emerald-600',
      sign: '+',
      description: 'Assets received from other bases',
    },
    {
      label: 'Transfers Out',
      value: metrics.transfersOut,
      icon: ArrowUpRight,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      rowBg: 'bg-red-50',
      valueCls: 'text-red-600',
      sign: '-',
      description: 'Assets sent to other bases',
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-card-lg animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Net Movement Breakdown</h2>
              <p className="text-xs text-slate-400">Asset flow for the selected period</p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-modal-btn"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-surface-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Breakdown items */}
        <div className="p-6 space-y-3">
          {items.map(({ label, value, icon: Icon, iconBg, iconColor, rowBg, valueCls, sign, description }) => (
            <div key={label} className={`flex items-center justify-between p-3 rounded-xl ${rowBg}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{label}</p>
                  <p className="text-xs text-slate-500">{description}</p>
                </div>
              </div>
              <p className={`text-xl font-bold ${valueCls}`}>
                {sign}{value?.toLocaleString() || 0}
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mx-6 mb-6 p-4 bg-surface-50 rounded-xl border border-surface-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">Total Net Movement</p>
              <p className="text-xs text-slate-400 mt-0.5">Purchases + In − Out</p>
            </div>
            <p className={`text-2xl font-bold ${(metrics.netMovement || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {(metrics.netMovement || 0) >= 0 ? '+' : ''}{(metrics.netMovement || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            id="modal-close-btn"
            className="btn-primary w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetMoveModal;
