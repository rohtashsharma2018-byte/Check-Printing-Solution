import React from 'react';
import { Layers, IndianRupee, CheckSquare, Coins } from 'lucide-react';

interface Props {
  totalCount: number;
  totalAmount: number;
  selectedCount: number;
  selectedAmount: number;
}

export const KpiCards: React.FC<Props> = ({ totalCount, totalAmount, selectedCount, selectedAmount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 font-sans">
      {/* Total Cheques */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
        <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
          <Layers size={22} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Cheques</p>
          <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-0.5">{totalCount}</p>
        </div>
      </div>

      {/* Total Amount */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
        <div className="p-3.5 bg-sky-50 text-sky-600 rounded-xl">
          <IndianRupee size={22} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Amount</p>
          <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-0.5">
            ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Selected Cheques */}
      <div className={`p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
        selectedCount > 0 
          ? 'bg-emerald-50/40 border-emerald-200/80 shadow-sm' 
          : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className={`p-3.5 rounded-xl ${
          selectedCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-400'
        }`}>
          <CheckSquare size={22} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selected</p>
          <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-0.5">{selectedCount}</p>
        </div>
      </div>

      {/* Selected Amount */}
      <div className={`p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
        selectedCount > 0 
          ? 'bg-emerald-50/40 border-emerald-200/80 shadow-sm' 
          : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className={`p-3.5 rounded-xl ${
          selectedCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-400'
        }`}>
          <Coins size={22} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selected Value</p>
          <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-0.5">
            ₹{selectedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};
