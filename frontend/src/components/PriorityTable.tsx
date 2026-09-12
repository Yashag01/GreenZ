import React from 'react';
import type { AssetSummary } from '../types/api';
import clsx from 'clsx';
import { AlertCircle, ArrowRight, Download } from 'lucide-react';

interface Props {
  assets: AssetSummary[];
  onSelect: (id: string) => void;
}

export default function PriorityTable({ assets, onSelect }: Props) {
  const handleExport = () => {
    const headers = ['Rank', 'Asset ID', 'Type', 'Status', 'Risk Score', 'Likely Condition', 'Energy at Risk (kWh)', 'Revenue Impact (Illustrative)', 'Priority Score'];
    const rows = assets.map(a => [
      a.priority_rank,
      a.id,
      a.type,
      a.decision_status || a.status,
      a.failure_risk.toFixed(1),
      a.ranked_conditions && a.ranked_conditions.length > 0 ? a.ranked_conditions[0].condition_name : a.fault_type,
      a.energy_at_risk.toFixed(1),
      a.revenue_at_risk,
      a.priority_score.toFixed(1)
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `renewai_priority_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="panel flex-1 flex flex-col p-0 overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-flux-charcoal/10 bg-white">
        <h2 className="font-anton text-2xl uppercase tracking-wide text-flux-charcoal flex items-center gap-3">
          <div className="p-1.5 bg-flux-yellow rounded">
            <AlertCircle size={20} className="text-flux-charcoal" />
          </div>
          Maintenance Priority Rank
        </h2>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-flux-charcoal border-2 border-flux-charcoal/10 px-3 py-1.5 rounded hover:bg-flux-charcoal hover:text-white transition-colors"
          title="Download CSV Report"
        >
          <Download size={14} /> Export Report
        </button>
      </div>
      
      <div className="overflow-x-auto flex-1 bg-white">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#f8f9fa] border-b-2 border-flux-charcoal/10">
            <tr className="text-xs font-bold uppercase tracking-wider text-flux-charcoal/60">
              <th className="py-4 px-6 w-16">Rank</th>
              <th className="py-4 px-4">Asset</th>
              <th className="py-4 px-4">Type</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-right">Risk %</th>
              <th className="py-4 px-4">Likely Fault</th>
              <th className="py-4 px-4 text-right">₹ at Risk</th>
              <th className="py-4 px-4 text-right">Score</th>
              <th className="py-4 px-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-flux-charcoal/5 font-medium">
            {assets.map((asset) => (
              <tr 
                key={asset.id} 
                className={clsx(
                  "hover:bg-flux-charcoal/5 transition-colors group cursor-pointer",
                  asset.priority_rank === 1 && asset.decision_status !== 'Monitor' && "border-l-4 border-l-rose-500 bg-rose-50/50"
                )}
                onClick={() => onSelect(asset.id)}
              >
                <td className="py-4 px-6 font-anton text-xl text-flux-charcoal/40">#{asset.priority_rank}</td>
                <td className="py-4 px-4 text-flux-charcoal font-bold">{asset.id}</td>
                <td className="py-4 px-4 text-flux-charcoal/60 capitalize">{asset.type}</td>
                <td className="py-4 px-4">
                  <span className={clsx(
                    'px-2 py-1 rounded text-xs font-bold uppercase tracking-wider',
                    asset.decision_status === 'Inspect Now' && 'bg-rose-100 text-rose-700',
                    (asset.decision_status === 'Schedule Inspection' || asset.decision_status === 'Watch') && 'bg-amber-100 text-amber-700',
                    asset.decision_status === 'Monitor' && 'bg-emerald-100 text-emerald-700'
                  )}>
                    {asset.decision_status || asset.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-right font-mono font-bold">
                  <span className={asset.failure_risk > 50 ? 'text-amber-600' : 'text-flux-charcoal/60'}>
                    {asset.failure_risk.toFixed(1)}%
                  </span>
                </td>
                <td className="py-4 px-4">
                  {asset.ranked_conditions && asset.ranked_conditions.length > 0 && asset.ranked_conditions[0].condition_name !== 'Normal Operation' ? (
                    <span className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded">{asset.ranked_conditions[0].condition_name}</span>
                  ) : asset.fault_type !== 'None' ? (
                    <span className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded">{asset.fault_type}</span>
                  ) : (
                    <span className="text-flux-charcoal/30">-</span>
                  )}
                </td>
                <td className="py-4 px-4 text-right font-mono font-bold">
                  {asset.revenue_at_risk > 0 ? (
                    <span className="text-rose-600">₹{asset.revenue_at_risk.toLocaleString()}</span>
                  ) : (
                    <span className="text-flux-charcoal/30">-</span>
                  )}
                </td>
                <td className="py-4 px-4 text-right font-mono font-bold text-flux-charcoal">
                  {asset.priority_score.toFixed(1)}
                </td>
                <td className="py-4 px-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-flux-charcoal text-white flex items-center justify-center ml-auto">
                    <ArrowRight size={16} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
