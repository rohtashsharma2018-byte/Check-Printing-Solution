import React from 'react';
import { ChequeRecord } from '../types';
import { Trash2, Edit2, Printer } from 'lucide-react';
import { formatTableDate, stripRupeesPrefix } from '../utils/converter';

interface Props {
  records: ChequeRecord[];
  onDelete: (id: string) => void;
  onEdit: (record: ChequeRecord) => void;
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onPrintSelected: () => void;
  onPrintSingle: (record: ChequeRecord) => void;
  isAcPayee: boolean;
  onToggleAcPayee: (val: boolean) => void;
}

export const ChequeTable: React.FC<Props> = ({ 
  records, 
  onDelete, 
  onEdit, 
  selectedIds, 
  onSelect, 
  onSelectAll, 
  onDeleteSelected, 
  onPrintSelected,
  onPrintSingle,
  isAcPayee,
  onToggleAcPayee
}) => {
  const isAllSelected = records.length > 0 && selectedIds.length === records.length;

  const [colWidths, setColWidths] = React.useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem('cheque_table_col_widths');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Ignored
      }
    }
    return {
      payee: 200,
      date: 130,
      amount: 150,
      words: 320,
      actions: 125
    };
  });

  const saveWidths = (widths: { [key: string]: number }) => {
    localStorage.setItem('cheque_table_col_widths', JSON.stringify(widths));
  };

  const handleMouseDown = (colKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = colWidths[colKey];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(70, startWidth + deltaX);
      setColWidths(prev => {
        const updated = {
          ...prev,
          [colKey]: newWidth
        };
        saveWidths(updated);
        return updated;
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  const handleTouchStart = (colKey: string, e: React.TouchEvent) => {
    const startX = e.touches[0].clientX;
    const startWidth = colWidths[colKey];

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 0) return;
      const deltaX = moveEvent.touches[0].clientX - startX;
      const newWidth = Math.max(70, startWidth + deltaX);
      setColWidths(prev => {
        const updated = {
          ...prev,
          [colKey]: newWidth
        };
        saveWidths(updated);
        return updated;
      });
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center">
          <label className="inline-flex items-center gap-3 cursor-pointer bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200 select-none">
            <input 
              type="checkbox" 
              checked={isAcPayee} 
              onChange={(e) => onToggleAcPayee(e.target.checked)} 
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4.5 w-4.5 cursor-pointer"
            />
            <span className="flex items-center gap-2">
              Cross &quot;A/C Payee&quot; on Print
            </span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <button 
                onClick={onPrintSelected} 
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
              >
                <Printer size={16} /> Print Selected ({selectedIds.length})
              </button>
              <button 
                onClick={onDeleteSelected} 
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
              >
                <Trash2 size={16} /> Delete Selected
              </button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-6 py-3.5 text-left w-12 rounded-tl-xl align-middle">
                <input type="checkbox" checked={isAllSelected} onChange={onSelectAll} className="rounded border-white/35 text-slate-900 focus:ring-slate-900 h-4.5 w-4.5 cursor-pointer accent-white" />
              </th>
              
              <th 
                className="relative px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider select-none align-middle"
                style={{ width: `${colWidths.payee}px` }}
              >
                <div className="truncate pr-3">Payee</div>
                <div
                  onMouseDown={(e) => handleMouseDown('payee', e)}
                  onTouchStart={(e) => handleTouchStart('payee', e)}
                  className="absolute right-0 top-0 bottom-0 w-2.5 z-10 cursor-col-resize group flex items-center justify-center select-none"
                  style={{ touchAction: 'none' }}
                >
                  <div className="w-[1.5px] h-4 bg-white/30 transition-colors group-hover:bg-white/70 group-active:bg-white/90" />
                </div>
              </th>

              <th 
                className="relative px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider select-none align-middle"
                style={{ width: `${colWidths.date}px` }}
              >
                <div className="truncate pr-3">Date</div>
                <div
                  onMouseDown={(e) => handleMouseDown('date', e)}
                  onTouchStart={(e) => handleTouchStart('date', e)}
                  className="absolute right-0 top-0 bottom-0 w-2.5 z-10 cursor-col-resize group flex items-center justify-center select-none"
                  style={{ touchAction: 'none' }}
                >
                  <div className="w-[1.5px] h-4 bg-white/30 transition-colors group-hover:bg-white/70 group-active:bg-white/90" />
                </div>
              </th>

              <th 
                className="relative px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider select-none align-middle"
                style={{ width: `${colWidths.amount}px` }}
              >
                <div className="truncate pr-3">Amount</div>
                <div
                  onMouseDown={(e) => handleMouseDown('amount', e)}
                  onTouchStart={(e) => handleTouchStart('amount', e)}
                  className="absolute right-0 top-0 bottom-0 w-2.5 z-10 cursor-col-resize group flex items-center justify-center select-none"
                  style={{ touchAction: 'none' }}
                >
                  <div className="w-[1.5px] h-4 bg-white/30 transition-colors group-hover:bg-white/70 group-active:bg-white/90" />
                </div>
              </th>

              <th 
                className="relative px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider select-none align-middle"
                style={{ width: `${colWidths.words}px` }}
              >
                <div className="truncate pr-3">Words</div>
                <div
                  onMouseDown={(e) => handleMouseDown('words', e)}
                  onTouchStart={(e) => handleTouchStart('words', e)}
                  className="absolute right-0 top-0 bottom-0 w-2.5 z-10 cursor-col-resize group flex items-center justify-center select-none"
                  style={{ touchAction: 'none' }}
                >
                  <div className="w-[1.5px] h-4 bg-white/30 transition-colors group-hover:bg-white/70 group-active:bg-white/90" />
                </div>
              </th>

              <th 
                className="relative px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider rounded-tr-xl align-middle"
                style={{ width: `${colWidths.actions}px` }}
              >
                <div className="truncate pr-3">Actions</div>
                <div
                  onMouseDown={(e) => handleMouseDown('actions', e)}
                  onTouchStart={(e) => handleTouchStart('actions', e)}
                  className="absolute right-0 top-0 bottom-0 w-2.5 z-10 cursor-col-resize group flex items-center justify-center select-none"
                  style={{ touchAction: 'none' }}
                >
                  <div className="w-[1.5px] h-4 bg-white/30 transition-colors group-hover:bg-white/70 group-active:bg-white/90" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400 font-medium">
                  No cheque records available. Import a CSV or add a record to get started.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 align-middle">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(record.id)} 
                      onChange={() => onSelect(record.id)} 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4.5 w-4.5 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 align-middle text-sm font-semibold text-gray-900">
                    <div className="truncate" title={record.payeeName}>{record.payeeName}</div>
                  </td>
                  <td className="px-6 py-4 align-middle font-mono text-sm text-gray-600 tracking-wider font-semibold">
                    <div className="truncate" title={formatTableDate(record.chequeDate)}>{formatTableDate(record.chequeDate)}</div>
                  </td>
                  <td className="px-6 py-4 align-middle text-sm font-bold text-gray-900">
                    <div className="truncate" title={`₹${record.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                      ₹{record.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle text-sm text-gray-500 font-medium">
                    <div className="truncate" title={stripRupeesPrefix(record.amountInWords)}>
                      {stripRupeesPrefix(record.amountInWords)}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onPrintSingle(record)} 
                        title="Print Cheque"
                        className="p-1.5 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                      >
                        <Printer size={18} />
                      </button>
                      <button 
                        onClick={() => onEdit(record)} 
                        title="Edit Record"
                        className="p-1.5 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(record.id)} 
                        title="Delete Record"
                        className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
