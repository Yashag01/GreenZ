import React, { useState } from 'react';
import { useRef } from 'react';
import { Play, RotateCcw, ChevronDown, ActivitySquare, Upload } from 'lucide-react';
import { injectFault, resetDemo, uploadCsv } from '../api/client';

export default function DemoControls({ onAction }: { onAction: () => void }) {
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInject = async (type: string, mag: number) => {
    try {
      setLoading(true);
      setShowDropdown(false);
      await injectFault('WTG-001', type, mag);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await resetDemo();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      await uploadCsv(file);
      alert('CSV uploaded and processed successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to upload CSV');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex gap-3 relative">
      <input 
        type="file" 
        accept=".csv" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
      />
      <button 
        disabled={loading}
        onClick={() => fileInputRef.current?.click()}
        className="bg-white border-2 border-flux-charcoal/10 hover:border-flux-charcoal text-flux-charcoal px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
        title="Upload Custom CSV Data"
      >
        <Upload size={16} />
      </button>

      <button 
        disabled={loading}
        onClick={handleReset}
        className="bg-white border-2 border-flux-charcoal/10 hover:border-flux-charcoal text-flux-charcoal px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
      >
        <RotateCcw size={16} />
        <span className="hidden sm:inline">Reset</span>
      </button>

      <div className="relative">
        <button 
          disabled={loading}
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-flux-yellow text-flux-charcoal border-2 border-flux-yellow hover:border-flux-charcoal px-6 py-2 rounded-lg font-anton text-lg tracking-wide uppercase flex items-center gap-2 transition-all disabled:opacity-50 shadow-md"
        >
          <Play size={16} fill="currentColor" />
          Inject Fault <ChevronDown size={18} />
        </button>
        
        {showDropdown && (
          <div className="absolute top-full mt-2 right-0 w-80 bg-flux-charcoal border-2 border-flux-yellow rounded-xl shadow-2xl overflow-hidden z-50">
            <button 
              onClick={() => handleInject('gearbox_wear', 0.25)}
              className="w-full text-left px-5 py-4 hover:bg-flux-dark border-b border-white/10 group transition-colors"
            >
              <div className="font-anton text-xl text-white uppercase tracking-wide group-hover:text-flux-yellow transition-colors">1. Gearbox Wear (Wind)</div>
              <div className="text-xs text-flux-sage font-bold uppercase tracking-wider mt-1">-25% Power, +2 Vibration</div>
              <div className="text-xs font-mono text-white/40 mt-2">Target: WT-27</div>
            </button>
            <button 
              onClick={() => handleInject('inverter_thermal_derating', 0.20)}
              className="w-full text-left px-5 py-4 hover:bg-flux-dark border-b border-white/10 group transition-colors"
            >
              <div className="font-anton text-xl text-white uppercase tracking-wide group-hover:text-flux-yellow transition-colors">2. Thermal Derating (Solar)</div>
              <div className="text-xs text-flux-sage font-bold uppercase tracking-wider mt-1">-20% Power, Temp Spikes</div>
              <div className="text-xs font-mono text-white/40 mt-2">Target: WT-27</div>
            </button>
            <button 
              onClick={() => handleInject('soiling', 0.15)}
              className="w-full text-left px-5 py-4 hover:bg-flux-dark border-b border-white/10 group transition-colors"
            >
              <div className="font-anton text-xl text-white uppercase tracking-wide group-hover:text-flux-yellow transition-colors">3. Soiling / Shade</div>
              <div className="text-xs text-flux-sage font-bold uppercase tracking-wider mt-1">Slight Uniform Degradation</div>
              <div className="text-xs font-mono text-white/40 mt-2">Target: WT-27</div>
            </button>
            <button 
              onClick={() => handleInject('sensor_fault', 0.15)}
              className="w-full text-left px-5 py-4 hover:bg-flux-dark group transition-colors"
            >
              <div className="font-anton text-xl text-white uppercase tracking-wide group-hover:text-flux-yellow transition-colors">4. Sensor Fault</div>
              <div className="text-xs text-flux-sage font-bold uppercase tracking-wider mt-1">Noisy Data Stream</div>
              <div className="text-xs font-mono text-white/40 mt-2">Target: WT-27</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
