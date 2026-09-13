import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fetchAssets } from './api/client';
import type { AssetSummary } from './types/api';
import FleetSummary from './components/FleetSummary';
import PriorityTable from './components/PriorityTable';
import AssetDetailPanel from './components/AssetDetailPanel';
import DemoControls from './components/DemoControls';
import AlertsList from './components/AlertsList';
import SystemHealthTab from './components/SystemHealthTab';
import { supabase } from './api/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Wrench, Shield, Users } from 'lucide-react';

const queryClient = new QueryClient();

function MainDashboard() {
  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'solar' | 'wind'>('all');
  const [viewMode, setViewMode] = useState<'fleet' | 'health'>('fleet');
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      if (localStorage.getItem('demo_bypass') === 'true') {
        setUserEmail('demo@gmail.com');
        return;
      }

      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      } else {
        setUserEmail(session.user.email || '');
      }
    };
    checkUser();
  }, [navigate]);
  
  const loadData = async () => {
    try {
      const data = await fetchAssets();
      setAssets(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    
    const eventSource = new EventSource('http://localhost:8000/api/demo/stream');
    eventSource.onmessage = (event) => {
      console.log("SSE Message:", event.data);
      if (event.data === "demo_reset" || event.data.startsWith("asset_updated:") || event.data.startsWith("asset_deleted:")) {
        loadData();
      }
    };
    
    return () => eventSource.close();
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem('demo_bypass');
    if (supabase) {
      await supabase.auth.signOut();
    }
    navigate('/login');
  };

  const filteredAssets = assets.filter(a => filterType === 'all' || a.type === filterType);

  return (
    <div className="min-h-screen bg-flux-grid-dark bg-[#f8f9fa] flex flex-col">
      <header className="bg-white border-b border-flux-charcoal/10 px-6 py-4 flex justify-between items-center shadow-sm relative z-20">
        <div className="flex items-center gap-4">
          <h1 className="font-anton text-3xl uppercase tracking-wide text-flux-charcoal flex items-center">
            <img src="/logo.png" alt="GreenZ Logo" className="h-8 w-8 mr-2 object-contain" />
            Green<span className="text-flux-yellow">Z</span>
          </h1>
          <div className="hidden md:block h-6 w-px bg-flux-charcoal/20"></div>
          <span className="hidden md:inline font-bold uppercase tracking-widest text-xs text-flux-charcoal/50">
            Explainable Predictive Maintenance
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <DemoControls />
          
          <div className="flex items-center gap-4 pl-6 border-l border-flux-charcoal/10">

            <Link to="/profile" className="text-xs font-bold uppercase tracking-wider text-flux-charcoal hover:text-flux-yellow transition-colors flex items-center gap-2">
              <Users size={16} /> Team
            </Link>
            <Link to="/technician" className="text-xs font-bold uppercase tracking-wider text-flux-charcoal hover:text-flux-yellow transition-colors flex items-center gap-2 mr-2">
              <Wrench size={16} /> Tech View
            </Link>
            
            <div className="flex items-center gap-2 text-sm text-flux-charcoal font-medium">
              <div className="w-8 h-8 rounded bg-flux-charcoal text-white flex items-center justify-center font-anton uppercase">
                {userEmail ? userEmail[0] : 'O'}
              </div>
              <span className="hidden lg:inline">{userEmail || 'Owner Profile'}</span>
            </div>
            <button onClick={handleSignOut} className="text-flux-charcoal/60 hover:text-rose-500 transition-colors p-2" title="Sign Out">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
        {}
        <div className="flex gap-2">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors ${filterType === 'all' ? 'bg-flux-charcoal text-white' : 'bg-white text-flux-charcoal/60 hover:bg-flux-charcoal/5 border border-flux-charcoal/10'}`}
          >
            All Assets
          </button>
          <button 
            onClick={() => setFilterType('solar')}
            className={`px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors ${filterType === 'solar' ? 'bg-amber-500 text-white' : 'bg-white text-flux-charcoal/60 hover:bg-amber-500/10 border border-flux-charcoal/10'}`}
          >
            Solar Inverters
          </button>
          <button 
            onClick={() => setFilterType('wind')}
            className={`px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors ${filterType === 'wind' ? 'bg-emerald-500 text-white' : 'bg-white text-flux-charcoal/60 hover:bg-emerald-500/10 border border-flux-charcoal/10'}`}
          >
            Wind Turbines
          </button>
          
          <div className="w-px h-6 bg-flux-charcoal/20 mx-2 self-center"></div>
          
          <button 
            onClick={() => setViewMode('fleet')}
            className={`px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors ${viewMode === 'fleet' ? 'bg-flux-charcoal text-white' : 'bg-white text-flux-charcoal/60 hover:bg-flux-charcoal/5 border border-flux-charcoal/10'}`}
          >
            Asset View
          </button>
          <button 
            onClick={() => setViewMode('health')}
            className={`px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors ${viewMode === 'health' ? 'bg-indigo-600 text-white' : 'bg-white text-flux-charcoal/60 hover:bg-indigo-600/10 border border-flux-charcoal/10'}`}
          >
            Alert Grouping
          </button>
        </div>

        <FleetSummary assets={filteredAssets} />

        {viewMode === 'fleet' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
            <div className="lg:col-span-3 flex flex-col gap-6">
              <PriorityTable assets={filteredAssets} onSelect={setSelectedAsset} />
            </div>
            <div className="lg:col-span-1 flex flex-col gap-6">
              <AlertsList />
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white p-6 rounded-xl border border-flux-charcoal/10 shadow-sm">
            <SystemHealthTab assets={filteredAssets} onSelectAsset={setSelectedAsset} />
          </div>
        )}
      </main>
      
      {selectedAsset && (
        <AssetDetailPanel 
          assetId={selectedAsset} 
          onClose={() => setSelectedAsset(null)} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainDashboard />
    </QueryClientProvider>
  );
}
