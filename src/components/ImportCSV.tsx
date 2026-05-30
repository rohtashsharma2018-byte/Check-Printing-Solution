import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { ChequeRecord } from '../types';
import { amountToWords } from '../utils/converter';
import { FileSpreadsheet, Download, Upload, AlertCircle } from 'lucide-react';

interface Props {
  onDataLoaded: (data: ChequeRecord[]) => void;
}

export const ImportCSV: React.FC<Props> = ({ onDataLoaded }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Invalid file type. Please select a .csv formatted spreadsheet.');
      setSuccessMsg(null);
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }

        if (results.data.length === 0) {
          setErrorMsg('The uploaded CSV file is empty.');
          setSuccessMsg(null);
          return;
        }

        try {
          const formattedData = results.data.map((row: any) => {
            const payeeName = row.payeeName || row['Payee Name'] || row['payee name'] || row['Payee'] || row['payee'] || '';
            const chequeDate = row.chequeDate || row['Date'] || row['date'] || row['cheque date'] || row['Cheque Date'] || '';
            const amountRaw = row.amount || row['Amount'] || row['amount'] || '0';
            
            // Clean currency symbol if any
            const cleanedAmountRaw = String(amountRaw).replace(/[\$,]/g, '');
            const amount = parseFloat(cleanedAmountRaw) || 0;

            return {
              id: Math.random().toString(36).substring(7),
              payeeName: String(payeeName).trim(),
              chequeDate: String(chequeDate).trim(),
              amount,
              amountInWords: amountToWords(amount),
            };
          });

          // Filter out rows without payeeName and non-zero amount
          const validData = formattedData.filter(item => item.payeeName.length > 0);
          
          if (validData.length === 0) {
            setErrorMsg('Could not find any valid headers (e.g. "Payee Name", "Date", "Amount") in your CSV.');
            setSuccessMsg(null);
            return;
          }

          onDataLoaded(validData);
          setSuccessMsg(`Successfully imported ${validData.length} cheque records!`);
          setErrorMsg(null);
          
          // Clear feedback messages after some time
          setTimeout(() => {
            setSuccessMsg(null);
          }, 4000);

        } catch (err: any) {
          setErrorMsg('Failed to process CSV file contents. Check headers and template.');
          setSuccessMsg(null);
        }
      },
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const downloadTemplate = () => {
    const csvContent = "Payee Name,Date,Amount\nJohn Doe,01/06/2026,1500.50\nJane Smith,02/06/2026,250.00\nAcme Corporation,03/06/2026,10000.00";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "cheque_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 select-none ${
          isDragging 
            ? 'border-blue-500 bg-blue-50/50' 
            : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 border border-slate-100 mb-3">
            <Upload size={24} className="animate-bounce" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">
            Drag & drop your cheque spreadsheet here
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            or click to browse from local files (.csv only)
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl">
        <div className="flex items-center gap-2 text-slate-600">
          <FileSpreadsheet size={15} className="text-slate-400" />
          <span>Needs <strong>Payee Name</strong>, <strong>Date</strong>, and <strong>Amount</strong> columns.</span>
        </div>
        <button
          onClick={downloadTemplate}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg shadow-sm transition-all duration-150 cursor-pointer text-xs"
        >
          <Download size={13} /> Download CSV Template
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 bg-rose-50 text-rose-800 border border-rose-100 p-3.5 rounded-xl text-xs font-semibold">
          <AlertCircle size={15} className="text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-800 border border-emerald-100 p-3.5 rounded-xl text-xs font-semibold animate-fade-in">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
};
