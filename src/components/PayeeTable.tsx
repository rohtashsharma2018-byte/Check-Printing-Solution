import React from 'react';
import { Payee } from '../types';
import { Edit2, Trash2 } from 'lucide-react';

interface Props {
  payees: Payee[];
  onEdit: (payee: Payee) => void;
  onDelete: (id: string) => void;
}

export const PayeeTable: React.FC<Props> = ({ payees, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-slate-900 text-white">
          <tr>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider rounded-tl-xl">Name</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Mobile</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Company</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Email</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Address</th>
            <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider rounded-tr-xl">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payees.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No payees found.</td>
            </tr>
          ) : (
            payees.map((payee) => (
              <tr key={payee.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{payee.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payee.mobile}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payee.companyName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payee.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payee.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => onEdit(payee)} className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(payee.id)} className="text-red-600 hover:text-red-900 cursor-pointer">
                        <Trash2 size={16} />
                    </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
