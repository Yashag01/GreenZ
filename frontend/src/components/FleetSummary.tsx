import type { AssetSummary } from '../types/api';
import { Activity, DollarSign } from 'lucide-react';

export default function FleetSummary({ assets }: { assets: AssetSummary[] }) {
  const healthy = assets.filter(a => a.decision_status === 'Monitor' || a.status === 'Monitor').length;
  const warning = assets.filter(a => a.decision_status === 'Watch' || a.decision_status === 'Schedule Inspection' || a.status === 'Watch' || a.status === 'Schedule Inspection').length;
  const critical = assets.filter(a => a.decision_status === 'Inspect Now' || a.status === 'Inspect Now').length;
  
  const totalEnergy = assets.reduce((sum, a) => sum + a.energy_at_risk, 0);
  const totalRev = assets.reduce((sum, a) => sum + a.revenue_at_risk, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="panel bg-white flex items-center gap-4 border-l-4 border-l-flux-charcoal">
        <div className="p-3 bg-flux-charcoal rounded-lg text-white shadow">
          <Activity size={24} />
        </div>
        <div>
          <p className="text-xs text-flux-charcoal/60 font-bold uppercase tracking-wider">Total Assets</p>
          <p className="font-anton text-3xl text-flux-charcoal mt-1">{assets.length}</p>
        </div>
      </div>
      
      <div className="panel bg-white flex items-center gap-4 border-l-4 border-l-emerald-500">
        <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-600">
          <CheckCircle size={24} />
        </div>
        <div>
          <p className="text-xs text-flux-charcoal/60 font-bold uppercase tracking-wider">Monitor</p>
          <p className="font-anton text-3xl text-emerald-600 mt-1">{healthy}</p>
        </div>
      </div>
      
      <div className="panel bg-flux-charcoal flex items-center gap-4 border-l-4 border-l-flux-yellow">
        <div className="flex gap-2 text-center w-full">
          <div className="flex-1">
             <p className="text-xs text-flux-sage/60 font-bold uppercase tracking-wider truncate">Watch</p>
             <p className="font-anton text-3xl text-flux-yellow mt-1">{warning}</p>
          </div>
          <div className="flex-1 border-l border-white/10">
             <p className="text-xs text-flux-sage/60 font-bold uppercase tracking-wider truncate">Inspect Now</p>
             <p className="font-anton text-3xl text-rose-500 mt-1">{critical}</p>
          </div>
        </div>
      </div>
      
      <div className="panel bg-white flex items-center gap-4 border-l-4 border-l-rose-500 shadow-rose-500/10">
        <div className="p-3 bg-rose-500/10 rounded-lg text-rose-600">
          <DollarSign size={24} />
        </div>
        <div>
          <p className="text-xs text-flux-charcoal/60 font-bold uppercase tracking-wider">Revenue at Risk</p>
          <p className="font-anton text-3xl text-rose-600 mt-1">₹{totalRev.toLocaleString()} / day at risk</p>
          <p className="text-xs font-mono text-flux-charcoal/50 mt-1">{totalEnergy.toLocaleString()} kWh estimated loss</p>
        </div>
      </div>
    </div>
  );
}

function CheckCircle({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
  )
}
