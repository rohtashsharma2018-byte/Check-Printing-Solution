import React, { useState } from 'react';
import { PrintPositions, ElementPosition } from '../types';
import { Save, Sliders, Check, Type } from 'lucide-react';

interface Props {
  positions: PrintPositions;
  onSave: (newPositions: PrintPositions) => void;
}

export const DEFAULT_POSITIONS: PrintPositions = Object.freeze({
  acPayee: Object.freeze({ x: 15, y: 12 }),
  date: Object.freeze({ x: 148, y: 12 }),
  payee: Object.freeze({ x: 32, y: 28 }),
  words: Object.freeze({ x: 25, y: 38 }),
  amount: Object.freeze({ x: 155, y: 46 }),
  dateSpacing: 6.0,
  fontSizeOffset: 0
}) as unknown as PrintPositions;

export const PrintSettings: React.FC<Props> = ({ positions, onSave }) => {
  const [localPositions, setLocalPositions] = useState<PrintPositions>(positions);
  const [isOpen, setIsOpen] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  // Sync with prop updates if reset is clicked
  React.useEffect(() => {
    setLocalPositions(positions);
  }, [positions]);

  const handleCoordinateChange = (
    key: 'acPayee' | 'date' | 'payee' | 'words' | 'amount',
    axis: 'x' | 'y',
    value: number
  ) => {
    // Standard checks to avoid out-of-bounds or NaN
    const numValue = isNaN(value) ? 0 : Math.max(0, Math.min(300, value));
    setLocalPositions((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [axis]: numValue,
      },
    }));
  };

  const handleSave = () => {
    onSave(localPositions);
    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
    }, 2500);
  };

  // Visual layout mapping (scale: 1mm = 1.5px for the mini visualizer)
  const previewScale = 1.5;

  const fields: { key: 'acPayee' | 'date' | 'payee' | 'words' | 'amount'; label: string; colorClass: string; textColor: string; previewLabel: string }[] = [
    { key: 'acPayee', label: 'A/C Payee Marker', colorClass: 'border-indigo-200 bg-indigo-50 text-indigo-700 focus-within:border-indigo-500', textColor: 'text-indigo-600', previewLabel: 'A/C Payee' },
    { key: 'date', label: 'Date Position', colorClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 focus-within:border-emerald-500', textColor: 'text-emerald-600', previewLabel: 'D D M M Y Y Y Y' },
    { key: 'payee', label: 'Payee Name', colorClass: 'border-sky-200 bg-sky-50 text-sky-700 focus-within:border-sky-500', textColor: 'text-sky-600', previewLabel: 'PAYEE NAME' },
    { key: 'words', label: 'Amount in Words', colorClass: 'border-violet-200 bg-violet-50 text-violet-700 focus-within:border-violet-500', textColor: 'text-violet-600', previewLabel: 'AMOUNT IN WORDS LINE' },
    { key: 'amount', label: 'Amount in Figures', colorClass: 'border-amber-200 bg-amber-50 text-amber-700 focus-within:border-amber-500', textColor: 'text-amber-600', previewLabel: '***123,456.00/-' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
      {/* Header Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100/80 transition-colors cursor-pointer select-none"
        id="toggle-print-settings-btn"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Sliders size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-sm md:text-base">Cheque Print Alignment Settings</h3>
            <p className="text-xs text-gray-500">Fine-tune coordinates (in millimeters) of fields printed on your cheque</p>
          </div>
        </div>
        <div className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
          {isOpen ? 'Collapse Panel' : 'Expand Settings'}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-gray-100 flex flex-col lg:flex-row gap-8">
          {/* Settings Section (Inputs) */}
          <div className="flex-1 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map(({ key, label, colorClass, textColor }) => (
                <div key={key} className={`p-4 rounded-xl border ${colorClass} transition-shadow`}>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
                    {label}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* X Coordinate */}
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 block mb-1">X Coord (mm)</span>
                      <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm px-1.5 focus-within:ring-2 focus-within:ring-blue-100">
                        <input
                          type="number"
                          step="0.5"
                          className="w-full text-center py-1.5 font-mono font-bold text-sm text-gray-800 outline-none"
                          value={localPositions[key].x}
                          onChange={(e) => handleCoordinateChange(key, 'x', parseFloat(e.target.value))}
                        />
                        <div className="flex flex-col border-l border-gray-100 ml-1">
                          <button
                            type="button"
                            onClick={() => handleCoordinateChange(key, 'x', localPositions[key].x + 0.5)}
                            className="px-1 text-[10px] hover:bg-gray-50 text-gray-500 font-bold active:scale-95 cursor-pointer"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCoordinateChange(key, 'x', localPositions[key].x - 0.5)}
                            className="px-1 text-[10px] hover:bg-gray-50 text-gray-500 font-bold active:scale-95 cursor-pointer"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Y Coordinate */}
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 block mb-1">Y Coord (mm)</span>
                      <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm px-1.5 focus-within:ring-2 focus-within:ring-blue-100">
                        <input
                          type="number"
                          step="0.5"
                          className="w-full text-center py-1.5 font-mono font-bold text-sm text-gray-800 outline-none"
                          value={localPositions[key].y}
                          onChange={(e) => handleCoordinateChange(key, 'y', parseFloat(e.target.value))}
                        />
                        <div className="flex flex-col border-l border-gray-100 ml-1">
                          <button
                            type="button"
                            onClick={() => handleCoordinateChange(key, 'y', localPositions[key].y + 0.5)}
                            className="px-1 text-[10px] hover:bg-gray-50 text-gray-500 font-bold active:scale-95 cursor-pointer"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCoordinateChange(key, 'y', localPositions[key].y - 0.5)}
                            className="px-1 text-[10px] hover:bg-gray-50 text-gray-500 font-bold active:scale-95 cursor-pointer"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Date Digit Spacing Slider for fitting individual cheque boxes */}
                  {key === 'date' && (
                    <div className="mt-4 pt-3.5 border-t border-emerald-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block">Digit Spacing interval</span>
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {(localPositions.dateSpacing ?? 6.0).toFixed(1)} mm
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="3.0"
                          max="12.0"
                          step="0.1"
                          className="flex-1 h-1.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          value={localPositions.dateSpacing ?? 6.0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setLocalPositions((prev) => ({
                              ...prev,
                              dateSpacing: isNaN(val) ? 6.0 : val
                            }));
                          }}
                        />
                        <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm px-1 py-0.5 w-18">
                          <input
                            type="number"
                            step="0.1"
                            className="w-full text-center font-mono font-bold text-xs text-gray-800 outline-none"
                            value={localPositions.dateSpacing ?? 6.0}
                            onChange={(e) => {
                              const val = Math.max(1, Math.min(30, parseFloat(e.target.value) || 6.0));
                              setLocalPositions((prev) => ({
                                ...prev,
                                dateSpacing: val
                              }));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Global Font Size Setting (6th slot of the 3x2 grid) */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 text-blue-700 transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Type size={14} className="text-blue-500 font-bold" />
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Cheque Print Font Size
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-3 leading-relaxed">
                    Increase or decrease text size globally for better printed readability.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2.5 bg-white p-2 rounded-xl border border-gray-200 shadow-sm relative z-0">
                    <button
                      type="button"
                      onClick={() => setLocalPositions(prev => ({
                        ...prev,
                        fontSizeOffset: Math.max(-4, (prev.fontSizeOffset ?? 0) - 1)
                      }))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold active:scale-95 cursor-pointer text-sm select-none"
                      title="Decrease Font Size"
                    >
                      －
                    </button>
                    
                    <div className="text-center select-none">
                      <span className="text-[8px] font-bold text-gray-400 block uppercase tracking-wider leading-none mb-1">Size Offset</span>
                      <span className="text-xs font-mono font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                        {(localPositions.fontSizeOffset ?? 0) > 0 ? `+${localPositions.fontSizeOffset}` : localPositions.fontSizeOffset ?? 0} pt
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLocalPositions(prev => ({
                        ...prev,
                        fontSizeOffset: Math.min(10, (prev.fontSizeOffset ?? 0) + 1)
                      }))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold active:scale-95 cursor-pointer text-sm select-none"
                      title="Increase Font Size"
                    >
                      ＋
                    </button>
                  </div>

                  {localPositions.fontSizeOffset !== 0 && (
                    <div className="mt-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => setLocalPositions(prev => ({ ...prev, fontSizeOffset: 0 }))}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                      >
                        Reset to default (0 pt)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all duration-200 cursor-pointer text-sm"
                id="save-print-layouts-btn"
              >
                <Save size={16} /> Save Alignment Settings
              </button>

              {showSavedFeedback && (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold animate-fade-in animate-duration-300">
                  <Check size={14} className="text-emerald-600" /> Settings saved successfully
                </div>
              )}
            </div>
          </div>

          {/* Interactive Layout Preview */}
          <div className="w-full lg:w-[360px] flex flex-col items-center border border-gray-200/80 rounded-2xl p-5 bg-slate-50 shadow-inner">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">A4 Portrait Grid Preview</h4>

            {/* Mini A4 Sheet (A4 is 210mm x 297mm. Scaled down by 1.5, we get: Width 315px, Height 445px) */}
            <div
              className="bg-white border-2 border-gray-300 shadow-lg relative rounded overflow-hidden"
              style={{
                width: `${210 * previewScale}px`,
                height: `${130 * previewScale}px`, // Showing top 130mm of the A4 page where printing happens
              }}
            >
              {/* Reference Grid lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:15px_15px] opacity-70 pointer-events-none" />

              {/* Edge guideline for visual boundaries */}
              <div className="absolute bottom-0 left-0 right-0 border-b border-dashed border-gray-300 text-[9px] font-mono font-bold text-gray-400 text-center pb-0.5 select-none pointer-events-none">
                A4 Top Section (0-130mm)
              </div>

              {/* Render local positions dynamically */}
              {fields.map(({ key, textColor, previewLabel }) => {
                const pos = localPositions[key];
                const offset = localPositions.fontSizeOffset ?? 0;

                if (key === 'date') {
                  const spacing = localPositions.dateSpacing ?? 6.0;
                  const digits = ['D', 'D', 'M', 'M', 'Y', 'Y', 'Y', 'Y'];
                  return (
                    <div
                      key={key}
                      className="absolute flex items-center pointer-events-none transition-all duration-150 select-none"
                      style={{
                        left: `${pos.x * previewScale}px`,
                        top: `${pos.y * previewScale}px`,
                      }}
                    >
                      {digits.map((digit, i) => (
                        <div
                          key={i}
                          className={`absolute rounded border border-current bg-white/95 shadow-sm flex items-center justify-center font-mono font-black ${textColor}`}
                          style={{
                            left: `${i * spacing * previewScale}px`,
                            transform: 'translateX(-50%)',
                            width: `${Math.max(6, 10 + offset * 0.4)}px`,
                            height: `${Math.max(8, 14 + offset * 0.45)}px`,
                            fontSize: `${Math.max(4, 7 + offset * 0.35)}px`
                          }}
                        >
                          {digit}
                        </div>
                      ))}
                    </div>
                  );
                }

                return (
                  <div
                    key={key}
                    className={`absolute rounded border border-current bg-white/90 shadow-sm flex items-center px-1 font-mono font-black pointer-events-none transition-all duration-150 select-none ${textColor}`}
                    style={{
                      left: `${pos.x * previewScale}px`,
                      top: `${pos.y * previewScale}px`,
                      whiteSpace: 'nowrap',
                      maxWidth: key === 'words' ? `${120 * previewScale}px` : 'auto',
                      fontSize: `${Math.max(5, 9 + offset * 0.55)}px`
                    }}
                  >
                    <span className="opacity-90">{previewLabel}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-400 mt-4 text-center font-medium leading-relaxed">
              * Dimensions represent distance in millimeters from the top-left edge of page (0,0). Values dynamically adapt on matching print jobs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
