import { useEffect, useState } from 'react';
import { fetchAssets, resolveIssue } from '../api/client';
import type { AssetSummary } from '../types/api';
import { supabase } from '../api/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ArrowLeft, Target, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

export default function TechnicianView() {
  const [assets, setAssets] = useState<AssetSummary[]>([]);
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
    const eventSource = new EventSource('http://localhost:8000/api/demo/stream');
    eventSource.onmessage = (event) => {
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

  // Only show assets that need attention
  const actionable = assets.filter(a => a.decision_status === 'Inspect Now' || a.decision_status === 'Schedule Inspection' || a.status === 'Critical' || a.status === 'Warning');

  return (
    <div className="min-h-screen bg-flux-grid-dark bg-[#f8f9fa] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-flux-charcoal/10 px-6 py-4 flex flex-col md:flex-row justify-between md:items-center shadow-sm relative z-20 gap-4">
        <div className="flex items-baseline gap-4">
          <h1 className="font-anton text-3xl uppercase tracking-wide text-flux-charcoal">
            Renew<span className="text-flux-yellow">AI</span>
          </h1>
          <div className="h-6 w-px bg-flux-charcoal/20"></div>
          <span className="font-bold uppercase tracking-widest text-xs text-flux-charcoal/50">
            Field Technician
          </span>
        </div>
        
        <div className="flex items-center gap-6 justify-between md:justify-end">
          <Link to="/dashboard" className="text-xs font-bold uppercase tracking-wider text-flux-charcoal hover:text-flux-yellow transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Owner Dashboard
          </Link>
          <div className="flex items-center gap-4 pl-6 border-l border-flux-charcoal/10">
            <div className="flex items-center gap-2 text-sm text-flux-charcoal font-medium">
              <div className="w-8 h-8 rounded bg-flux-charcoal text-white flex items-center justify-center font-anton uppercase">
                {userEmail ? userEmail[0] : 'T'}
              </div>
            </div>
            <button onClick={handleSignOut} className="text-flux-charcoal/60 hover:text-rose-500 transition-colors p-2" title="Sign Out">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col gap-6">
        <div className="mb-4">
          <h2 className="font-anton text-4xl uppercase text-flux-charcoal mb-2">Active Work Orders</h2>
          <p className="text-flux-charcoal/60 font-bold uppercase tracking-wider text-sm">
            {actionable.length} critical issues require inspection
          </p>
        </div>

        <div className="space-y-6">
          {actionable.length === 0 ? (
            <div className="panel flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                <Target size={32} />
              </div>
              <h3 className="font-anton text-2xl uppercase tracking-wide text-flux-charcoal">All Clear</h3>
              <p className="text-flux-charcoal/60 font-medium">No pending maintenance required.</p>
            </div>
          ) : (
            actionable.map((a, i) => {
              const isCritical = a.decision_status === 'Inspect Now' || a.status === 'Critical';
              const faultName = a.ranked_conditions && a.ranked_conditions.length > 0 ? a.ranked_conditions[0].condition_name : a.fault_type;
              const evidence = a.ranked_conditions && a.ranked_conditions.length > 0 ? a.ranked_conditions[0].evidence : ['Power generation deviated significantly from baseline.'];
              
              return (
              <div key={a.id} className="panel-dark relative overflow-hidden group">
                <div className={clsx("absolute top-0 left-0 w-2 h-full", 
                  isCritical ? 'bg-rose-500' : 'bg-flux-yellow'
                )}></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-flux-sage/60 text-xs font-bold uppercase tracking-wider mb-1">WORK ORDER #{2048 + i}</p>
                    <h3 className="font-anton text-4xl uppercase text-white tracking-wide">{a.id}</h3>
                    <p className="text-sm text-white/50 capitalize font-medium">{a.type}</p>
                  </div>
                  <span className={clsx("px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider shadow-lg",
                    isCritical ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  )}>
                    {a.decision_status || a.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <p className="text-flux-sage/60 text-[10px] font-bold uppercase tracking-wider">Failure Risk</p>
                    <p className="font-mono text-xl text-white mt-1">{a.failure_risk.toFixed(1)}%</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <p className="text-flux-sage/60 text-[10px] font-bold uppercase tracking-wider">Rev at Risk</p>
                    <p className="font-mono text-xl text-rose-400 mt-1">₹{a.revenue_at_risk.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 sm:col-span-2">
                    <p className="text-flux-sage/60 text-[10px] font-bold uppercase tracking-wider">Top Diagnostic Condition</p>
                    <p className="font-anton text-xl text-flux-yellow mt-1 tracking-wide">{faultName !== 'None' ? faultName : 'Unknown Anomaly'}</p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mb-6">
                  <p className="text-flux-sage/60 text-xs font-bold uppercase tracking-wider mb-2">Primary Evidence & Action</p>
                  <ul className="space-y-2 mb-4">
                    {evidence.map((r, j) => (
                      <li key={j} className="text-sm font-medium text-white/80 flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-flux-yellow mt-2 shrink-0"></div> {r}
                      </li>
                    ))}
                  </ul>
                  <div className="bg-flux-yellow/10 border border-flux-yellow/20 p-3 rounded-lg">
                    <p className="text-xs text-flux-yellow font-bold uppercase tracking-wider mb-1">Recommended Action</p>
                    <p className="text-sm text-white">{a.recommended_action || 'Inspect asset.'}</p>
                  </div>
                </div>

                <button 
                  onClick={async () => {
                    try {
                      await resolveIssue(a.id);
                      alert(`Inspection started and issue resolved for ${a.id}`);
                    } catch(e) {
                      console.error(e);
                      alert('Failed to resolve issue');
                    }
                  }}
                  className="w-full sm:w-auto bg-flux-yellow hover:bg-white text-flux-charcoal font-anton uppercase tracking-wide text-xl px-8 py-4 rounded transition-colors shadow-lg shadow-flux-yellow/10 flex items-center justify-center gap-3"
                >
                  <TrendingDown size={20} /> Mark Inspection Started
                </button>
              </div>
            )})
          )}
        </div>
      </main>
    </div>
  );
}
