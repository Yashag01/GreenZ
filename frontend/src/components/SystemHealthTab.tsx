import { useMemo } from 'react';
import type { AssetSummary } from '../types/api';
import { Target, TrendingDown, AlertTriangle, Download } from 'lucide-react';
import clsx from 'clsx';

export default function SystemHealthTab({ assets, onSelectAsset }: { assets: AssetSummary[], onSelectAsset: (id: string) => void }) {
  const groups = useMemo(() => {
    const map = new Map<string, {
      conditionName: string;
      assetIds: string[];
      totalRevenueAtRisk: number;
      totalEnergyAtRisk: number;
      assets: AssetSummary[];
      isCritical: boolean;
    }>();

    assets.forEach(a => {
      if (a.status === 'Normal') return;
      const conditionName = a.ranked_conditions && a.ranked_conditions.length > 0 
        ? a.ranked_conditions[0].condition_name 
        : a.fault_type;
      
      if (conditionName === 'None') return;

      if (!map.has(conditionName)) {
        map.set(conditionName, {
          conditionName,
          assetIds: [],
          totalRevenueAtRisk: 0,
          totalEnergyAtRisk: 0,
          assets: [],
          isCritical: false
        });
      }
      
      const group = map.get(conditionName)!;
      group.assetIds.push(a.id);
      group.totalRevenueAtRisk += (a.revenue_at_risk || 0);
      group.totalEnergyAtRisk += (a.energy_at_risk || 0);
      group.assets.push(a);
      if (a.decision_status === 'Inspect Now' || a.status === 'Critical') {
        group.isCritical = true;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalRevenueAtRisk - a.totalRevenueAtRisk);
  }, [assets]);

  const handleExportCSV = () => {
    if (groups.length === 0) return;
    const headers = ['Signature Group', 'Priority', 'Affected Assets', 'Total Estimated Financial Loss (INR)', 'Total Estimated Energy Loss (kWh)'];
    const rows = groups.map(g => [
      g.conditionName,
      g.isCritical ? 'High Priority' : 'Warning',
      g.assets.map(a => a.id).join('; '),
      g.totalRevenueAtRisk.toFixed(2),
      g.totalEnergyAtRisk.toFixed(2)
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'alert_grouping_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center bg-white border border-flux-charcoal/10 rounded-xl shadow-sm">
        <Target size={48} className="text-emerald-500 mb-4 opacity-50" />
        <h3 className="font-anton text-2xl uppercase tracking-wide text-flux-charcoal">All Systems Nominal</h3>
        <p className="text-flux-charcoal/60 font-medium">No active faults detected across the fleet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="font-anton text-3xl uppercase tracking-wide text-flux-charcoal">Compressed Alert Grouping</h2>
          <p className="text-flux-charcoal/60 font-bold uppercase tracking-wider text-sm mt-1">
            {groups.length} active signatures detected across {groups.reduce((acc, g) => acc + g.assets.length, 0)} assets
          </p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-white border-2 border-flux-charcoal/10 hover:border-flux-charcoal text-flux-charcoal px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all"
        >
          <Download size={16} />
          Export Groups
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((g, i) => (
          <div key={i} className="panel-dark relative overflow-hidden group">
            <div className={clsx("absolute top-0 left-0 w-2 h-full", 
              g.isCritical ? 'bg-rose-500' : 'bg-flux-yellow'
            )}></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-flux-sage/60 text-xs font-bold uppercase tracking-wider mb-1">Signature Group</p>
                <h3 className="font-anton text-3xl uppercase text-white tracking-wide">{g.conditionName}</h3>
                <p className="text-sm text-white/50 capitalize font-medium">{g.assets.length} Affected Asset(s)</p>
              </div>
              <span className={clsx("px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider shadow-lg",
                g.isCritical ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              )}>
                {g.isCritical ? 'High Priority' : 'Warning'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <p className="text-flux-sage/60 text-[10px] font-bold uppercase tracking-wider">Est. Financial Loss</p>
                <p className="font-mono text-2xl text-rose-400 mt-1">₹{g.totalRevenueAtRisk.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <p className="text-flux-sage/60 text-[10px] font-bold uppercase tracking-wider">Est. Energy Loss</p>
                <p className="font-mono text-2xl text-white mt-1">{g.totalEnergyAtRisk.toFixed(1)} <span className="text-sm">kWh</span></p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-flux-sage/60 text-xs font-bold uppercase tracking-wider mb-2">Affected Assets</p>
              <div className="flex flex-wrap gap-2">
                {g.assets.map(a => (
                  <button 
                    key={a.id} 
                    onClick={() => onSelectAsset(a.id)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-flux-yellow/50 rounded text-sm text-white font-mono transition-colors flex items-center gap-2"
                  >
                    {a.status === 'Critical' && <AlertTriangle size={12} className="text-rose-400" />}
                    {a.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
