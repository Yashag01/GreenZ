import { useState, useRef, useEffect } from 'react';
import { Play, Square, RotateCcw, ChevronDown, Upload, FastForward, Database } from 'lucide-react';
import { resetDemo, seedDemo, uploadCsv, getPlaybackState, playPlayback, pausePlayback, setPlaybackSpeed } from '../api/client';
import type { PlaybackState } from '../types/api';

export default function DemoControls() {
  const [loading, setLoading] = useState(false);
  const [showSpeedDropdown, setShowSpeedDropdown] = useState(false);
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchState = async () => {
    try {
      const data = await getPlaybackState();
      setPlaybackState(data);
    } catch (e) {
      console.error("Failed to fetch playback state", e);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 1000); // Check state every second
    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = async () => {
    try {
      setLoading(true);
      if (playbackState?.is_playing) {
        await pausePlayback();
      } else {
        await playPlayback();
      }
      await fetchState();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeedChange = async (speed: number) => {
    try {
      setLoading(true);
      setShowSpeedDropdown(false);
      await setPlaybackSpeed(speed);
      await fetchState();
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
      {/* Live Indicator */}
      {playbackState?.is_playing && (
        <div className="absolute -top-6 right-0 flex items-center gap-1 text-rose-500 font-bold text-xs uppercase tracking-widest animate-pulse">
          <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          LIVE
        </div>
      )}

      {/* Play/Stop Button */}
      <button 
        disabled={loading}
        onClick={handlePlayPause}
        className={`${playbackState?.is_playing ? 'bg-rose-50 border-rose-500 text-rose-500' : 'bg-flux-yellow border-flux-yellow text-flux-charcoal'} border-2 hover:border-flux-yellow hover:text-flux-yellow hover:bg-flux-charcoal px-4 py-2 rounded-lg font-bold flex items-center justify-center transition-all disabled:opacity-50 min-w-[60px]`}
        title={playbackState?.is_playing ? "Stop Simulation" : "Start Simulation"}
      >
        {playbackState?.is_playing ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
      </button>

      {/* Speed Control */}
      <div className="relative">
        <button 
          disabled={loading}
          onClick={() => setShowSpeedDropdown(!showSpeedDropdown)}
          className="bg-white border-2 border-flux-charcoal/10 hover:border-flux-charcoal text-flux-charcoal px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <FastForward size={16} />
          {playbackState?.speed || 100}x <ChevronDown size={14} />
        </button>
        
        {showSpeedDropdown && (
          <div className="absolute top-full mt-2 left-0 w-32 bg-flux-charcoal border-2 border-flux-yellow rounded-xl shadow-2xl overflow-hidden z-50">
            {[1, 50, 100, 250, 500].map((s) => (
              <button 
                key={s}
                onClick={() => handleSpeedChange(s)}
                className="w-full text-left px-5 py-3 hover:bg-flux-dark border-b border-white/10 group transition-colors flex items-center justify-between"
              >
                <div className={`font-mono text-lg uppercase tracking-wide ${playbackState?.speed === s ? 'text-flux-yellow' : 'text-white group-hover:text-flux-yellow'}`}>{s}x</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-8 bg-flux-charcoal/20 mx-1"></div>

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
