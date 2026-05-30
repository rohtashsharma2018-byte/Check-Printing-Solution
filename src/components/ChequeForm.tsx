import React, { useState, useEffect } from 'react';
import { ChequeRecord, Payee } from '../types';
import { amountToWords, ensureIsoDate } from '../utils/converter';

interface Props {
  record: ChequeRecord | null;
  onSave: (record: ChequeRecord) => void;
  onClose: () => void;
  payees: Payee[];
}

export const ChequeForm: React.FC<Props> = ({ record, onSave, onClose, payees }) => {
  const [form, setForm] = useState<ChequeRecord>({
    id: record?.id || Math.random().toString(36).substring(7),
    payeeName: record?.payeeName || '',
    chequeDate: record?.chequeDate || '',
    amount: record?.amount || 0,
    amountInWords: record?.amountInWords || 'Rupees Zero Only',
  });
  
  const [payeeSearch, setPayeeSearch] = useState(record?.payeeName || '');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (record) {
      setForm({
        ...record,
        chequeDate: ensureIsoDate(record.chequeDate)
      });
      setPayeeSearch(record.payeeName);
    }
  }, [record]);

  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    setError('');
    onSave({ ...form, payeeName: payeeSearch });
    onClose();
  };

  const filteredPayees = payees.filter(p => 
    p.companyName.toLowerCase().includes(payeeSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">{record ? 'Edit Record' : 'Add New Record'}</h2>
        <div className="mb-4 relative">
          <label className="block text-sm font-medium mb-1">Payee Name (Search Company)</label>
          <input 
            value={payeeSearch} 
            onChange={e => {
                setPayeeSearch(e.target.value);
                setIsOpen(true);
            }} 
            onFocus={() => setIsOpen(true)}
            className="border p-2 w-full rounded-lg" 
            required 
            placeholder="Search or type company..."
          />
          {isOpen && payeeSearch && filteredPayees.length > 0 && (
            <div className="absolute z-10 w-full bg-white border mt-1 max-h-40 overflow-y-auto rounded-lg shadow-lg">
                {filteredPayees.map(payee => (
                    <div 
                        key={payee.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                            setPayeeSearch(payee.companyName);
                            setIsOpen(false);
                        }}
                    >
                        {payee.companyName} - <span className='text-gray-500 text-xs'>{payee.name}</span>
                    </div>
                ))}
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Date</label>
          <input 
            type="date" 
            value={form.chequeDate} 
            onChange={e => setForm({...form, chequeDate: e.target.value})} 
            className="border p-2 w-full rounded-lg" 
            required 
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input 
            type="number" 
            min="0.01" 
            step="0.01" 
            value={form.amount || ''} 
            onChange={e => {
              const amt = parseFloat(e.target.value) || 0;
              setForm({...form, amount: amt, amountInWords: amountToWords(amt)});
              if (amt > 0) {
                setError('');
              }
            }} 
            className={`border p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-100 ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} 
            required 
          />
          {error && <p className="text-red-500 text-xs mt-1 font-semibold">{error}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Amount in Words</label>
          <input value={form.amountInWords} readOnly className="border p-2 w-full bg-gray-100 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex-1 hover:bg-blue-700 transition-colors cursor-pointer">Save</button>
          <button type="button" onClick={onClose} className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg flex-1 transition-colors cursor-pointer font-medium">Cancel</button>
        </div>
      </form>
    </div>
  );
};
