import React, { useState } from 'react';
import { Payee } from '../types';
import { X } from 'lucide-react';

interface Props {
  payee: Payee | null;
  onSave: (payee: Payee) => void;
  onClose: () => void;
}

export const PayeeForm: React.FC<Props> = ({ payee, onSave, onClose }) => {
  const [formData, setFormData] = useState<Payee>({
    id: payee?.id || crypto.randomUUID(),
    name: payee?.name || '',
    mobile: payee?.mobile || '',
    email: payee?.email || '',
    address: payee?.address || '',
    companyName: payee?.companyName || '',
    others: payee?.others || '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};

    // Validate Name (Mandatory)
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate Company Name (Mandatory)
    if (!formData.companyName || !formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    // Validate Mobile (Exactly 10 digits number)
    if (!formData.mobile || !formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else {
      const cleanedMobile = formData.mobile.trim();
      if (!/^\d{10}$/.test(cleanedMobile)) {
        newErrors.mobile = 'Mobile number must be exactly 10 digits';
      }
    }

    // Validate Email format (if provided)
    if (formData.email && formData.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900">{payee ? 'Edit Payee' : 'Add New Payee'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => {
                setFormData({...formData, name: e.target.value});
                if (errors.name) setErrors({...errors, name: ''});
              }} 
              className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-100 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} 
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile <span className="text-red-500">* (10 Digit)</span></label>
              <input 
                type="text" 
                maxLength={10}
                value={formData.mobile} 
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  setFormData({...formData, mobile: val});
                  if (errors.mobile) setErrors({...errors, mobile: ''});
                }} 
                className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-100 ${errors.mobile ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} 
                placeholder="9876543210"
              />
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input 
                type="text" 
                value={formData.email} 
                onChange={e => {
                  setFormData({...formData, email: e.target.value});
                  if (errors.email) setErrors({...errors, email: ''});
                }} 
                className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-100 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} 
                placeholder="example@company.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.companyName} 
              onChange={e => {
                setFormData({...formData, companyName: e.target.value});
                if (errors.companyName) setErrors({...errors, companyName: ''});
              }} 
              className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-100 ${errors.companyName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} 
            />
            {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
            <textarea 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})} 
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500" 
              rows={3} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Others</label>
            <input 
              type="text" 
              value={formData.others} 
              onChange={e => setFormData({...formData, others: e.target.value})} 
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500" 
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer">Save Payee</button>
          </div>
        </form>
      </div>
    </div>
  );
};
