import { useState, useEffect } from 'react';
import { ChequeRecord, PrintPositions, PrintHistoryRecord, Payee } from './types';
import { ImportCSV } from './components/ImportCSV';
import { ChequeTable } from './components/ChequeTable';
import { PayeeTable } from './components/PayeeTable';
import { PayeeForm } from './components/PayeeForm';
import { PrintHistoryTable } from './components/PrintHistoryTable';
import { ChequeForm } from './components/ChequeForm';
import { ConfirmModal } from './components/ConfirmModal';
import { KpiCards } from './components/KpiCards';
import { PrintSettings, DEFAULT_POSITIONS } from './components/PrintSettings';
import { 
  Plus, 
  LayoutDashboard, 
  FileText,
  History,
  Sliders, 
  HelpCircle, 
  Menu, 
  X, 
  Landmark, 
  Search, 
  Printer, 
  ArrowUpRight, 
  AlertCircle,
  FileSpreadsheet,
  Users
} from 'lucide-react';
import { formatChequeDate, stripRupeesPrefix } from './utils/converter';
import jsPDF from 'jspdf';

export default function App() {
  const [records, setRecords] = useState<ChequeRecord[]>(() => {
    try {
      const saved = localStorage.getItem('cheque_records');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error parsing stored cheque records: ', e);
      return [];
    }
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ChequeRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAcPayee, setIsAcPayee] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'history' | 'payees' | 'settings' | 'help'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [payees, setPayees] = useState<Payee[]>(() => {
    try {
      const saved = localStorage.getItem('cheque_payees');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error parsing stored payees: ', e);
      return [];
    }
  });
  const [isPayeeFormOpen, setIsPayeeFormOpen] = useState(false);
  const [editingPayee, setEditingPayee] = useState<Payee | null>(null);

  useEffect(() => {
    localStorage.setItem('cheque_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('cheque_payees', JSON.stringify(payees));
  }, [payees]);

  const [printHistory, setPrintHistory] = useState<PrintHistoryRecord[]>(() => {
    const saved = localStorage.getItem('cheque_print_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cheque_print_history', JSON.stringify(printHistory));
  }, [printHistory]);

  const [positions, setPositions] = useState<PrintPositions>(() => {
    const saved = localStorage.getItem('cheque_print_positions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.dateSpacing === undefined) {
          parsed.dateSpacing = 6.0;
        }
        if (parsed.fontSizeOffset === undefined) {
          parsed.fontSizeOffset = 0;
        }
        return parsed;
      } catch (e) {
        console.error('Error parsing stored cheque print positions', e);
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_POSITIONS));
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const totalCount = records.length;
  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
  const selectedRecords = records.filter(r => selectedIds.includes(r.id));
  const selectedCount = selectedRecords.length;
  const selectedAmount = selectedRecords.reduce((sum, r) => sum + r.amount, 0);

  // Filter records by search term
  const filteredRecords = records.filter(record => 
    record.payeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.amountInWords.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.amount.toString().includes(searchTerm)
  );

  const handleSavePositions = (newPositions: PrintPositions) => {
    setPositions(newPositions);
    localStorage.setItem('cheque_print_positions', JSON.stringify(newPositions));
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Cheque Record',
      message: 'Are you sure you want to delete this cheque record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDanger: true,
      onConfirm: () => {
        setRecords(prev => prev.filter((r) => r.id !== id));
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map(r => r.id));
    }
  };

  const handleDeleteSelected = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Selected Records',
      message: `Are you sure you want to delete all ${selectedIds.length} selected cheque records? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      isDanger: true,
      onConfirm: () => {
        setRecords(prev => prev.filter(r => !selectedIds.includes(r.id)));
        setSelectedIds([]);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeleteHistory = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete History Record',
      message: 'Are you sure you want to delete this print history record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDanger: true,
      onConfirm: () => {
        setPrintHistory(prev => prev.filter(item => item.id !== id));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleClearHistory = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear Print History',
      message: 'Are you sure you want to clear all print history records? This action cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      isDanger: true,
      onConfirm: () => {
        setPrintHistory([]);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const recordPrint = (record: ChequeRecord) => {
    const newRecord: PrintHistoryRecord = {
      id: crypto.randomUUID(),
      chequeId: record.id,
      payeeName: record.payeeName,
      amount: record.amount,
      timestamp: new Date().toISOString()
    };
    setPrintHistory(prev => {
      const updated = [newRecord, ...prev];
      localStorage.setItem('cheque_print_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSavePayee = (payee: Payee) => {
    if (editingPayee) {
      setPayees(payees.map(p => p.id === payee.id ? payee : p));
    } else {
      setPayees([...payees, payee]);
    }
    setIsPayeeFormOpen(false);
    setEditingPayee(null);
  };

  const handleEditPayee = (payee: Payee) => {
    setEditingPayee(payee);
    setIsPayeeFormOpen(true);
  };

  const handleDeletePayee = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Payee',
      message: 'Are you sure you want to delete this payee? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDanger: true,
      onConfirm: () => {
        setPayees(prev => prev.filter(p => p.id !== id));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const printChequeToDoc = (doc: jsPDF, record: ChequeRecord) => {
    const sizeOffset = positions.fontSizeOffset ?? 0;

    // 1. A/C Payee text in top-left corner
    if (isAcPayee) {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(Math.max(4, 10 + sizeOffset));
      doc.text('A/C PAYEE', positions.acPayee.x, positions.acPayee.y);
    }

    // 2. Date in the top right
    doc.setFont('Courier', 'bold');
    doc.setFontSize(Math.max(4, 13 + sizeOffset));
    const dateFormatted = formatChequeDate(record.chequeDate);
    const dateDigits = dateFormatted.replace(/\s/g, '').split('');
    const spacing = positions.dateSpacing !== undefined ? positions.dateSpacing : 6.0;
    
    if (dateDigits.length > 0) {
      dateDigits.forEach((digit, index) => {
        const digitX = positions.date.x + (index * spacing);
        doc.text(digit, digitX, positions.date.y);
      });
    } else {
      doc.text(dateFormatted, positions.date.x, positions.date.y);
    }

    // 3. Payee's name
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(Math.max(4, 11 + sizeOffset));
    doc.text(record.payeeName, positions.payee.x, positions.payee.y);

    // 4. Amount in Words
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(Math.max(4, 10 + sizeOffset));
    const wordsLines = doc.splitTextToSize(stripRupeesPrefix(record.amountInWords), 120);
    doc.text(wordsLines, positions.words.x, positions.words.y);

    // 5. Amount in figures
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(Math.max(4, 12 + sizeOffset));
    const formattedAmount = `***${record.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/-`;
    doc.text(formattedAmount, positions.amount.x, positions.amount.y);
  };

  const handlePrintSelected = () => {
    const recordsToPrint = records.filter(r => selectedIds.includes(r.id));
    if (recordsToPrint.length === 0) return;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    recordsToPrint.forEach((record, index) => {
        if (index > 0) {
          doc.addPage('a4', 'portrait');
        }
        printChequeToDoc(doc, record);
        recordPrint(record);
    });
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  const handlePrintSingle = (record: ChequeRecord) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    printChequeToDoc(doc, record);
    recordPrint(record);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleEdit = (record: ChequeRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleSave = (record: ChequeRecord) => {
    if (editingRecord) {
      setRecords(records.map(r => r.id === record.id ? record : r));
    } else {
      setRecords([...records, record]);
    }
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* MOBILE HEADER BAR */}
      <div className="md:hidden bg-slate-900 text-white flex items-center justify-between p-4 px-5 border-b border-slate-800 shrink-0 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md">
            <Landmark size={20} />
          </div>
          <span className="font-bold tracking-tight text-white text-base">MODARNET</span>
        </div>
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-1.5 focus:bg-slate-800 rounded-lg hover:text-blue-400 transition-colors cursor-pointer"
        >
          {isMobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* LEFT HAND NAVIGATION BAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-905 border-r border-slate-800 flex flex-col justify-between p-5 text-slate-300 transition-transform duration-350 ease-in-out shrink-0
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:sticky md:h-screen md:top-0 h-[calc(100vh-60px)] md:bg-slate-900 mt-[60px] md:mt-0
      `}
      style={{ backgroundColor: '#0f172a' }}
      >
        <div className="space-y-6">
          {/* Logo Brand Header (Desktop) */}
          <div className="hidden md:flex items-center gap-3 py-2 border-b border-slate-800/60">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-md">
              <Landmark size={22} />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-base leading-tight tracking-tight">MODARNET</h1>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {/* Dashboard Link */}
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </div>
              {activeTab === 'dashboard' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </button>

            {/* Cheques Registry Link */}
            <button
              onClick={() => {
                setActiveTab('records');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === 'records'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={18} />
                <span>Cheques Registry</span>
              </div>
              <div className="flex items-center gap-1.5">
                {records.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    activeTab === 'records' ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {records.length}
                  </span>
                )}
                {activeTab === 'records' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
            </button>

             {/* Payee Registry Link */}
            <button
              onClick={() => {
                setActiveTab('payees');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === 'payees'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={18} />
                <span>Payee</span>
              </div>
              <div className="flex items-center gap-1.5">
                {payees.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    activeTab === 'payees' ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {payees.length}
                  </span>
                )}
                {activeTab === 'payees' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
            </button>

            {/* Print History Link */}
            <button
              onClick={() => {
                setActiveTab('history');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <History size={18} />
                <span>Print History</span>
              </div>
              <div className="flex items-center gap-1.5">
                {printHistory.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    activeTab === 'history' ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {printHistory.length}
                  </span>
                )}
                {activeTab === 'history' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
            </button>

            {/* Print Positions Alignment Link */}
            <button
              onClick={() => {
                setActiveTab('settings');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sliders size={18} />
                <span>Align Positions</span>
              </div>
              {activeTab === 'settings' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </button>

            {/* User Guide Link */}
            <button
              onClick={() => {
                setActiveTab('help');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === 'help'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={18} />
                <span>Printing Guide</span>
              </div>
              {activeTab === 'help' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Details */}
        <div className="border-t border-slate-800/60 pt-4 mt-auto">
          <div className="bg-slate-800/40 rounded-xl p-3.5 text-xs text-slate-400 space-y-2">
            <div className="flex justify-between font-mono">
              <span>Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready
              </span>
            </div>
            {selectedCount > 0 && (
              <div className="flex justify-between text-slate-300 font-medium">
                <span>Selected:</span>
                <span className="font-bold underline text-blue-400">{selectedCount} Selected</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER CONTENT SECTION */}
      <main className="flex-1 overflow-y-auto px-6 py-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* TOP GREETING HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              {activeTab === 'dashboard' && 'Welcome to Dashboard'}
              {activeTab === 'records' && 'Registry Repository'}
              {activeTab === 'history' && 'Print History Log'}
              {activeTab === 'payees' && 'Payee management'}
              {activeTab === 'settings' && 'Precision Alignment Panel'}
              {activeTab === 'help' && 'Printing Specifications'}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              {activeTab === 'dashboard' && 'Cheque Printer Station'}
              {activeTab === 'records' && 'Available Cheques Database'}
              {activeTab === 'history' && 'Generated Print History'}
              {activeTab === 'payees' && 'Manage Payee'}
              {activeTab === 'settings' && 'Configure Field Alignments'}
              {activeTab === 'help' && 'Operator Instructions Manual'}
            </h1>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {records.length > 0 && activeTab !== 'records' && (
              <button
                onClick={() => setActiveTab('records')}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                View Database <ArrowUpRight size={15} />
              </button>
            )}
            {activeTab === 'payees' ? (
                <button 
                  onClick={() => { setEditingPayee(null); setIsPayeeFormOpen(true); }} 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Plus size={18} /> Add Payee
                </button>
            ) : (
                <button 
                  onClick={handleAdd} 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
                  id="global-add-record-btn"
                >
                  <Plus size={18} /> Add Cheque Record
                </button>
            )}
          </div>
        </div>

        {/* ACTIVE TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <KpiCards 
              totalCount={totalCount} 
              totalAmount={totalAmount} 
              selectedCount={selectedCount} 
              selectedAmount={selectedAmount} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Import Area */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md/50 transition-shadow lg:col-span-8 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Batch Import Spreadsheets</h3>
                  <p className="text-xs text-slate-500">Fast load hundreds of cheque variables from local .csv spreadsheets</p>
                </div>
                <ImportCSV onDataLoaded={(newData) => {
                  setRecords(newData);
                  setActiveTab('records'); // auto route to registry to inspect import
                }} />
              </div>

              {/* Quick Guide Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm lg:col-span-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="p-2.5 bg-blue-50/50 text-blue-600 rounded-xl w-fit">
                    <HelpCircle size={22} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">Getting Started Tips</h4>
                  <ul className="text-xs text-slate-500 space-y-2.5 list-disc list-inside leading-relaxed font-medium">
                    <li>Create dynamic bank records using the <strong className="text-blue-600">Add Cheque Record</strong> form.</li>
                    <li>Align specific printable areas in the <strong className="text-blue-600">Align Positions</strong> coordinate mapper.</li>
                    <li>Ensure plain white test paper has identical sizing to bank cheques for safe positioning previews!</li>
                  </ul>
                </div>
                <button
                  onClick={() => setActiveTab('help')}
                  className="mt-6 w-full text-center py-2.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 font-bold rounded-xl transition-all duration-150 cursor-pointer"
                >
                  View Full Step-by-Step Guide
                </button>
              </div>
            </div>

            {/* Quick Status / Quick Actions */}
            {records.length > 0 && (
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-5 text-slate-100 pointer-events-none">
                  <Printer size={200} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base md:text-lg">Database contains active cheques</h3>
                  <p className="text-xs text-slate-400 font-medium">You have loaded {records.length} records. Toggle selected items to trigger batch operations.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setActiveTab('records')}
                    className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl transition-all duration-150 text-sm cursor-pointer"
                  >
                    Open Registry Table
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACTIVE TAB: RECORDS */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            {/* Search Input Filter & Quick Controller */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="text"
                  placeholder="Search payee name, amounts, etc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-250 focus:border-blue-500 focus:bg-white text-sm text-slate-800 rounded-xl outline-none font-medium placeholder-slate-400 transition-all focus:ring-2 focus:ring-blue-100/60"
                />
              </div>

              <div className="flex items-center gap-3.5 text-xs text-slate-500 shrink-0 font-medium">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Clear Filter
                  </button>
                )}
                <span>Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> total</span>
              </div>
            </div>

            {/* Cheque Table Core Component */}
            <ChequeTable 
              records={filteredRecords} 
              onDelete={handleDelete} 
              onEdit={handleEdit} 
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              onDeleteSelected={handleDeleteSelected}
              onPrintSelected={handlePrintSelected}
              onPrintSingle={handlePrintSingle}
              isAcPayee={isAcPayee}
              onToggleAcPayee={setIsAcPayee}
            />
          </div>
        )}

        {/* ACTIVE TAB: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <PrintHistoryTable 
              records={printHistory} 
              onDelete={handleDeleteHistory}
              onClearAll={handleClearHistory}
            />
          </div>
        )}

        {/* ACTIVE TAB: PAYEES */}
        {activeTab === 'payees' && (
          <div className="space-y-6">
            <PayeeTable payees={payees} onEdit={handleEditPayee} onDelete={handleDeletePayee} />
          </div>
        )}

        {/* ACTIVE TAB: SETTINGS (ALIGNMENT COORDS) */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-blue-50/40 text-blue-800 border border-blue-200 p-4 rounded-2xl text-xs font-semibold leading-relaxed flex items-start gap-3">
              <AlertCircle size={17} className="text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Alignment coordinates:</strong> The printer matches an A4 format sheet in <strong>portrait mode</strong>. Modify values directly using millimeter scales from top-left offset (0, 0). Click &quot;Save Alignment Settings&quot; to commit modifications permanently inside the local store.
              </span>
            </div>

            <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm/50">
              <PrintSettings 
                positions={positions} 
                onSave={handleSavePositions} 
              />
            </div>
          </div>
        )}

        {/* ACTIVE TAB: INSTRUCTIONS HELP GUIDE */}
        {activeTab === 'help' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm space-y-8 max-w-4xl">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Printing Guide & Printer Setup</h3>
              <p className="text-sm text-slate-500">Follow these critical physical tray alignment guidelines to ensure perfect cheque impressions every time.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center space-y-3">
                <div className="h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-700 rounded-xl font-mono font-bold text-sm">
                  01
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Load White Plain Paper</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Before placing actual high-value bank cheque stock, feed standard plain A4 white sheets first into your printer tray.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center space-y-3">
                <div className="h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-700 rounded-xl font-mono font-bold text-sm">
                  02
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Print Test Sheet</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Select a record and print. The output generates an elegant layout aligned optimally matching standard portrait dimensions.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center space-y-3">
                <div className="h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-700 rounded-xl font-mono font-bold text-sm">
                  03
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Overlay & Match</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Compare the printed sheet against your transparent physical cheque. Measure discrepancies in millimeters and update offset variables inside settings!
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h4 className="font-bold text-slate-800 text-base">Key Printer Offset Specifications</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-xs">
                  <thead className="bg-[#f8fafc]/70">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Print Field</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Fallback/Default (X, Y)</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Alignment Intent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-500">
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-800">A/C Payee Cross Label</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">X: 15mm, Y: 12mm</td>
                      <td className="px-4 py-3">Renders parallel lines at the top-left side of document.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-800">Date Fields</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">X: 148mm, Y: 12mm</td>
                      <td className="px-4 py-3">Matches standard top-right date space blocks on common bank paper.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-800">Payee Name</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">X: 32mm, Y: 28mm</td>
                      <td className="px-4 py-3">Offsets from standard &quot;Pay To...&quot; margin labels.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-800">Amount in Words</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">X: 25mm, Y: 38mm</td>
                      <td className="px-4 py-3">Dynamically wraps lines for long texts matching words lines.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-800">Amount in Figures</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">X: 155mm, Y: 46mm</td>
                      <td className="px-4 py-3">Positions amount figures neatly within the bordered boxes.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* RENDER CHEQUE FORM MODAL */}
      {isFormOpen && (
        <ChequeForm 
          record={editingRecord} 
          onSave={handleSave} 
          onClose={() => setIsFormOpen(false)} 
          payees={payees}
        />
      )}
      
      {/* RENDER PAYEE FORM MODAL */}
      {isPayeeFormOpen && (
        <PayeeForm 
          payee={editingPayee} 
          onSave={handleSavePayee} 
          onClose={() => setIsPayeeFormOpen(false)} 
        />
      )}

      {/* RENDER CUSTOM CONFIRMATION POPUP */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isDanger={confirmModal.isDanger}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
