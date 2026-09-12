import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fetchAssets } from './api/client';
import type { AssetSummary } from './types/api';
import FleetSummary from './components/FleetSummary';
import PriorityTable from './components/PriorityTable';
import AssetDetailPanel from './components/AssetDetailPanel';
import DemoControls from './components/DemoControls';
import AlertsList from './components/AlertsList';
import { supabase } from './api/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Wrench } from 'lucide-react';

const queryClient = new QueryClient();

function MainDashboard() {
  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check Auth
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
    
    // SSE for real-time updates
    const eventSource = new EventSource('http://localhost:8000/api/demo/stream');
    eventSource.onmessage = (event) => {
      console.log("SSE Message:", event.data);
      if (event.data === "demo_reset" || event.data.startsWith("asset_updated:")) {
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

  return (
    <div className="min-h-screen bg-flux-grid-dark bg-[#f8f9fa] flex flex-col">
      <header className="bg-white border-b border-flux-charcoal/10 px-6 py-4 flex justify-between items-center shadow-sm relative z-20">
        <div className="flex items-baseline gap-4">
          <h1 className="font-anton text-3xl uppercase tracking-wide text-flux-charcoal">
            Renew<span className="text-flux-yellow">AI</span>
          </h1>
          <div className="hidden md:block h-6 w-px bg-flux-charcoal/20"></div>
          <span className="hidden md:inline font-bold uppercase tracking-widest text-xs text-flux-charcoal/50">
            Explainable Predictive Maintenance
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <DemoControls onAction={loadData} />
          
          <div className="flex items-center gap-4 pl-6 border-l border-flux-charcoal/10">
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
        <FleetSummary assets={assets} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
          <div className="lg:col-span-3 flex flex-col gap-6">
            <PriorityTable assets={assets} onSelect={setSelectedAsset} />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6">
            <AlertsList />
          </div>
        </div>
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
