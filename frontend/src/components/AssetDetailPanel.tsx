import { useEffect, useState } from 'react';
import { X, TrendingDown, Target, Wrench, AlertTriangle, Activity, ChevronRight, CheckCircle2, Info } from 'lucide-react';
import type { AssetDetail, HistoryPoint } from '../types/api';
import { fetchAssetDetail, fetchAssetHistory } from '../api/client';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function AssetDetailPanel({ assetId, onClose }: { assetId: string, onClose: () => void }) {
  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setAsset(await fetchAssetDetail(assetId));
        setHistory(await fetchAssetHistory(assetId));
      } catch (e) {
        console.error(e);
      }
    };
    load();
    const interval = setInterval(load, 3000); 
    return () => clearInterval(interval);
  }, [assetId]);

  if (!asset) return null;
  
  const isHealthy = asset.decision_status === 'Monitor' || asset.status === 'Normal';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-flux-charcoal/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-flux-dark h-full shadow-2xl border-l-4 border-flux-yellow flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-white/10 bg-flux-charcoal relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-flux-yellow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-5xl font-anton text-white uppercase tracking-wide flex items-baseline gap-4">
              {asset.id} 
              <span className="text-2xl text-flux-sage tracking-normal">{asset.name}</span>
            </h2>
            <p className="text-sm font-bold text-flux-yellow mt-2 uppercase tracking-widest">{asset.type} • {asset.location}</p>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full text-white transition-colors border border-white/20">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 flex flex-col gap-6 bg-flux-grid-dark relative">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-flux-charcoal p-6 rounded-2xl border border-white/10 shadow-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-flux-sage flex items-center gap-2 mb-3"><Target size={16} className="text-flux-yellow"/> Top Diagnostic Condition</div>
              <div className="font-anton text-3xl text-white uppercase">
                {asset.ranked_conditions && asset.ranked_conditions.length > 0 
                  ? asset.ranked_conditions[0].condition_name 
                  : asset.fault_type}
              </div>
              {asset.ranked_conditions?.[0]?.confidence && (
                <div className="text-xs font-mono text-flux-sage/60 mt-3 bg-white/5 inline-block px-2 py-1 rounded">
                  EVIDENCE STRENGTH: {asset.ranked_conditions[0].confidence}
                </div>
              )}
            </div>

            <div className="bg-flux-charcoal p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
              <div className="text-xs font-bold uppercase tracking-wider text-flux-sage flex items-center gap-2 mb-3">
                <Activity size={16} className="text-flux-yellow"/> Energy at Risk
              </div>
              <div className="font-anton text-4xl text-white">
                {asset.energy_at_risk.toFixed(0)} <span className="text-xl font-mono text-flux-sage/60">kWh</span>
              </div>
              <div className="text-xs font-mono text-flux-sage/50 mt-3">ESTIMATED OVER CURRENT GENERATION WINDOW</div>
            </div>

            <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-rose-500"></div>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-2 mb-3"><TrendingDown size={16} className="text-rose-500"/> Illustrative Revenue Impact</div>
              <div className="font-anton text-4xl text-rose-600">₹{asset.revenue_at_risk.toLocaleString('en-IN')}</div>
              <div className="text-xs font-mono text-rose-600/50 mt-3">ESTIMATE AT ASSUMED ₹7/kWh — NOT ACTUAL CONTRACT RATE</div>
            </div>
          </div>

          <div className="panel-dark flex flex-col relative z-10">
            <h3 className="font-bold uppercase tracking-wider text-flux-sage mb-4 text-xs flex items-center gap-2">
              <Activity size={16} className="text-flux-yellow"/> AI Pipeline Trace
            </h3>
            <div className="flex flex-wrap gap-2 items-center">
               <Badge label="Raw Data" passed={true} />
               <ChevronRight size={14} className="text-white/20"/>
               <Badge label="Clean" passed={true} />
               <ChevronRight size={14} className="text-white/20"/>
               <Badge label="Expected Model" passed={true} />
               <ChevronRight size={14} className="text-white/20"/>
               <Badge label="Deviation" passed={isHealthy} />
               <ChevronRight size={14} className="text-white/20"/>
               <Badge label="Anomaly" passed={isHealthy} />
               <ChevronRight size={14} className="text-white/20"/>
               <Badge label="Priority" passed={true} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div className="panel-dark flex flex-col relative z-10">
              <h3 className="font-bold uppercase tracking-wider text-flux-sage mb-4 text-xs flex items-center gap-2"><AlertTriangle size={16} className="text-flux-yellow"/> Primary Evidence</h3>
              <ul className="space-y-3">
                {asset.ranked_conditions && asset.ranked_conditions.length > 0 && asset.ranked_conditions[0].evidence ? (
                  asset.ranked_conditions[0].evidence.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white font-medium bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-flux-yellow mt-1.5 shrink-0"></div> {r}
                    </li>
                  ))
                ) : (
                  asset.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white font-medium bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-flux-yellow mt-1.5 shrink-0"></div> {r}
                    </li>
                  ))
                )}
              </ul>
            </div>
            
            <div className="panel-dark flex flex-col relative z-10">
              <h3 className="font-bold uppercase tracking-wider text-flux-sage mb-4 text-xs flex items-center gap-2"><Info size={16} className="text-flux-yellow"/> Condition Likelihood Ranking</h3>
              <ul className="space-y-3">
                {asset.ranked_conditions && asset.ranked_conditions.length > 0 ? (
                  asset.ranked_conditions.map((cond, i) => (
                    <li key={i} className={`flex justify-between items-center text-sm font-medium p-3 rounded-lg border ${i === 0 ? 'bg-flux-yellow/10 border-flux-yellow text-flux-yellow' : 'bg-white/5 border-white/5 text-white/70'}`}>
                      <span>{i+1}. {cond.condition_name}</span>
                      {cond.confidence && <span className="text-xs px-2 py-0.5 rounded bg-white/10 font-mono">{cond.confidence}</span>}
                    </li>
                  ))
                ) : (
                  <li className="flex justify-between items-center text-sm font-medium p-3 rounded-lg border bg-flux-yellow/10 border-flux-yellow text-flux-yellow">
                    <span>1. {asset.fault_type}</span>
                    {asset.fault_confidence && <span className="text-xs px-2 py-0.5 rounded bg-white/10 font-mono">{asset.fault_confidence}</span>}
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="panel-dark flex-1 min-h-[350px] relative z-10">
            <div className="flex justify-between items-end mb-6">
              <h3 className="font-bold uppercase tracking-wider text-flux-sage text-xs">Power Output vs Physics Baseline (24h)</h3>
              <div className="flex gap-3 items-center">
                {asset.deviation_pct !== undefined && asset.deviation_pct !== null ? (
                  asset.deviation_pct < -15 ? (
                    <div className="text-xs font-mono bg-rose-500/10 text-rose-400 px-2 py-1 rounded border border-rose-500/20 font-bold">
                      DEV: {asset.deviation_pct.toFixed(1)}%
                    </div>
                  ) : (
                    <div className="text-xs font-mono bg-flux-sage/10 text-flux-sage px-2 py-1 rounded border border-flux-sage/20">
                      DEV: {asset.deviation_pct.toFixed(1)}%
                    </div>
                  )
                ) : null}
                <div className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
                  MODEL: {asset.model_status.toUpperCase()}
                </div>
              </div>
            </div>
            
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(t) => new Date(t).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                    stroke="#b7c6c2" 
                    fontSize={12}
                    tickMargin={10}
                    fontFamily="monospace"
                  />
                  <YAxis stroke="#b7c6c2" fontSize={12} fontFamily="monospace" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171e19', borderColor: '#272727', color: '#fff', borderRadius: '8px' }}
                    labelFormatter={(l: any) => new Date(l).toLocaleString()}
                  />
                  <Area type="monotone" dataKey="expected_power" stroke="#b7c6c2" strokeDasharray="3 3" fill="none" name="Expected (Baseline)" />
                  <Area type="step" dataKey="actual_power" stroke="#ffe17c" strokeWidth={2} fill="#ffe17c" fillOpacity={0.1} name="Actual (Sensor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-flux-yellow text-flux-charcoal p-6 rounded-2xl flex items-start gap-4 relative z-10 shadow-xl shadow-flux-yellow/10">
            <Wrench className="mt-1" size={24} />
            <div className="flex-1">
              <h3 className="font-anton text-2xl uppercase tracking-wide">Recommended Action</h3>
              <p className="text-sm font-medium mt-2">
                {asset.recommended_action || (isHealthy ? 'No immediate action required. Continue routine monitoring.' : 
                 `Inspect drivetrain/gearbox-related components within 24 hours. Estimated revenue at risk: ₹${asset.revenue_at_risk.toLocaleString('en-IN')}.`)}
              </p>
              {!isHealthy && (
                <button onClick={() => alert('Work Order Created')} className="mt-4 bg-flux-charcoal text-white px-6 py-2 rounded font-bold uppercase tracking-wider text-sm hover:bg-black transition-colors">
                  Create Work Order
                </button>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

function Badge({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border ${passed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
      {passed ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
      {label}
    </div>
  );
}
