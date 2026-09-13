import { useState, useRef } from 'react';
import { RotateCcw, Upload, Database } from 'lucide-react';
import { resetDemo, seedDemo, uploadCsv } from '../api/client';

export default function DataControls() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = async () => {
    try {
      setLoading(true);
      await resetDemo();
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      setLoading(true);
      await seedDemo();
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setLoading(true);
      await uploadCsv(files);
      alert(`${files.length} CSV file(s) uploaded and processed successfully!`);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Failed to upload CSV(s)');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex gap-3 relative items-center">
      <button 
        disabled={loading}
        onClick={handleReset}
        className="bg-white border-2 border-flux-charcoal/10 hover:border-flux-charcoal hover:bg-rose-50 text-rose-500 px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
        title="Clear All Assets"
      >
        <RotateCcw size={16} />
      </button>

      <button 
        disabled={loading}
        onClick={handleSeed}
        className="bg-white border-2 border-flux-charcoal/10 hover:border-flux-charcoal hover:bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
        title="Load Default Assets"
      >
        <Database size={16} />
      </button>

      <input 
        type="file" 
        accept=".csv" 
        multiple
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
    </div>
  );
}
