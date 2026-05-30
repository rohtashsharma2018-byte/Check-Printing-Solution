import React from 'react';
import { PrintHistoryRecord } from '../types';
import { Trash2 } from 'lucide-react';

interface Props {
  records: PrintHistoryRecord[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const PrintHistoryTable: React.FC<Props> = ({ records, onDelete, onClearAll }) => {
  const handleDeleteClick = (id: string) => {
    onDelete(id);
  };

  const handleClearAllClick = () => {
    onClearAll();
  };

  return (
    <div className="space-y-4">
      {records.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleClearAllClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl shadow-sm border border-red-200 transition-all cursor-pointer animate-fade-in"
          >
            <Trash2 size={13} /> Clear All History
          </button>
        </div>
      )}
      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider rounded-tl-xl">Timestamp</th>
              <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Payee</th>
              <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider rounded-tr-xl w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No print history found.</td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono font-medium">{new Date(record.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{record.payeeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                    ₹{record.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteClick(record.id)}
                      title="Delete History Record"
                      className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
