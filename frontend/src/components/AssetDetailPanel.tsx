import { useEffect, useState, useRef } from 'react';
import { X, Target, Wrench, AlertTriangle, Activity, ChevronRight, CheckCircle2, Sparkles, Edit2, Trash2, Save, Send, Mail, Smartphone } from 'lucide-react';
import type { AssetDetail, HistoryPoint } from '../types/api';
import { fetchAssetDetail, fetchAssetHistory, updateAsset, deleteAsset } from '../api/client';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { supabase } from '../api/supabase';

interface TeamMember {
  name: string;
  email: string;
  phone: string;
}

// Helper component for animated number with trend
const DonutGauge = ({ value }: { value: number }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const color = value > 75 ? '#ef4444' : value > 40 ? '#f59e0b' : '#10b981';
  
  return (
    <div className="relative flex items-center justify-center">
      <svg className="transform -rotate-90 w-24 h-24">
        <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
        <circle cx="48" cy="48" r={radius} stroke={color} strokeWidth="8" fill="transparent" 
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out', filter: 'drop-shadow(0 0 4px currentColor)' }} 
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-anton text-2xl" style={{ color }}>{value.toFixed(0)}<span className="text-sm">%</span></span>
      </div>
    </div>
  );
};

const TrendMetric = ({ label, value, prevValue, unit, isInverseBad = false, format = "number" }: any) => {
  const delta = prevValue !== null && prevValue !== undefined ? value - prevValue : 0;
  const isUp = delta > 0;
  const isDown = delta < 0;
  
  // Logic for what color is "good" or "bad"
  let colorClass = "text-white/60";
  let arrow = null;
  
  if (isUp) {
    colorClass = isInverseBad ? "text-rose-400" : "text-emerald-400";
    arrow = "↑";
  } else if (isDown) {
    colorClass = isInverseBad ? "text-emerald-400" : "text-rose-400";
    arrow = "↓";
  }

  const formatValue = (v: number) => {
    if (format === "currency") return `₹${v.toLocaleString('en-IN')}`;
    if (format === "percent") return `${v.toFixed(1)}%`;
    return v.toFixed(0);
  };

  const formatDelta = (d: number) => {
    if (d === 0) return "";
    const sign = d > 0 ? "+" : "";
    if (format === "currency") return `${sign}₹${Math.abs(d).toLocaleString('en-IN')}`;
    if (format === "percent") return `${sign}${d.toFixed(1)}%`;
    return `${sign}${d.toFixed(0)}`;
  };

  return (
    <div className="bg-flux-charcoal p-4 rounded-xl border border-white/10 shadow-lg relative overflow-hidden transition-all duration-300">
      <div className="text-[10px] font-bold uppercase tracking-widest text-flux-sage flex items-center gap-1.5 mb-2">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="font-anton text-3xl text-white tracking-wide transition-all duration-500">
          {formatValue(value)} {unit && <span className="text-sm font-mono text-flux-sage/60 ml-1">{unit}</span>}
        </div>
      </div>
      <div className={`text-xs font-mono font-bold mt-2 transition-all duration-300 ${colorClass} min-h-[16px]`}>
        {arrow} {formatDelta(delta)}
      </div>
    </div>
  );
};

export default function AssetDetailPanel({ assetId, onClose }: { assetId: string, onClose: () => void }) {
  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const prevAssetRef = useRef<AssetDetail | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', type: '', location: '', capacity_kw: 0, criticality: 0.5 });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTechIndex, setSelectedTechIndex] = useState<number>(0);

  useEffect(() => {
    const fetchTeam = async () => {
      if (localStorage.getItem('demo_bypass') === 'true') {
        setTeamMembers([
          { name: 'John Doe', email: 'tech1@example.com', phone: '+919876543210' },
          { name: 'Alice Smith', email: 'tech2@example.com', phone: '+919876543211' }
        ]);
        return;
      }
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('profiles').select('team_members').eq('id', session.user.id).single();
        if (data?.team_members) {
          setTeamMembers(data.team_members);
        }
      }
    };
    fetchTeam();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const newAsset = await fetchAssetDetail(assetId);
        setAsset(current => {
          prevAssetRef.current = current;
          return newAsset;
        });
        setHistory(await fetchAssetHistory(assetId));
      } catch (e) {
        console.error(e);
      }
    };
    load();
    const interval = setInterval(load, 2000); // Poll faster for playback demo
    return () => clearInterval(interval);
  }, [assetId]);

  useEffect(() => {
    if (asset && !isEditing) {
      setEditForm({
        name: asset.name,
        type: asset.type,
        location: asset.location,
        capacity_kw: asset.capacity_kw,
        criticality: asset.criticality || 0.5
      });
    }
  }, [asset, isEditing]);

  const handleSave = async () => {
    try {
      await updateAsset(assetId, {
        ...editForm,
        capacity_kw: Number(editForm.capacity_kw),
        criticality: Number(editForm.criticality)
      });
      setIsEditing(false);
    } catch (e) {
      alert("Failed to update asset");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this asset? This action cannot be undone.")) {
      try {
        await deleteAsset(assetId);
        onClose();
      } catch (e) {
        alert("Failed to delete asset");
      }
    }
  };

  const generateMessage = () => {
    return `*Work Order: ${asset?.name}*\nLocation: ${asset?.location}\nPriority Score: ${asset?.priority_score}\n\n*Likely Fault:*\n${asset?.ranked_conditions?.[0]?.condition_name || asset?.fault_type}\n\n*Action Plan (Immediate):*\n${asset?.action_immediate?.join(', ') || 'N/A'}`;
  };

  const handleWhatsApp = () => {
    if (teamMembers.length === 0) return alert('No technicians in roster. Go to Team Settings.');
    const tech = teamMembers[selectedTechIndex];
    if (!tech.phone) return alert('No phone number for ' + tech.name);
    
    // clean phone
    let phone = tech.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(generateMessage())}`;
    window.open(url, '_blank');
  };

  const handleEmail = () => {
    if (teamMembers.length === 0) return alert('No technicians in roster. Go to Team Settings.');
    const tech = teamMembers[selectedTechIndex];
    if (!tech.email) return alert('No email for ' + tech.name);
    
    const subject = `Work Order: ${asset?.name} - ${asset?.ranked_conditions?.[0]?.condition_name || asset?.fault_type}`;
    const body = generateMessage();
    window.location.href = `mailto:${tech.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (!asset) return null;
  const prevAsset = prevAssetRef.current;
  
  const isHealthy = asset.decision_status === 'Monitor' || asset.status === 'Normal';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-flux-charcoal/80 backdrop-blur-sm">
      <div className="w-full max-w-[900px] bg-flux-dark h-full shadow-2xl border-l-4 border-flux-yellow flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-flux-charcoal relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-flux-yellow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="relative z-10 w-1/2">
            {isEditing ? (
              <div className="flex flex-col gap-3 bg-flux-charcoal/50 p-4 rounded-xl border border-white/20">
                <input className="bg-flux-dark border border-white/10 text-white px-3 py-2 rounded focus:outline-none focus:border-flux-yellow" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Asset Name" />
                <div className="flex gap-2">
                  <input className="bg-flux-dark border border-white/10 text-white px-3 py-2 rounded w-1/3 focus:outline-none focus:border-flux-yellow" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})} placeholder="Type" />
                  <input className="bg-flux-dark border border-white/10 text-white px-3 py-2 rounded w-2/3 focus:outline-none focus:border-flux-yellow" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} placeholder="Location" />
                </div>
                <div className="flex gap-2">
                  <input type="number" className="bg-flux-dark border border-white/10 text-white px-3 py-2 rounded w-1/2 focus:outline-none focus:border-flux-yellow" value={editForm.capacity_kw} onChange={e => setEditForm({...editForm, capacity_kw: parseFloat(e.target.value)})} placeholder="Capacity (kW)" />
                  <input type="number" step="0.1" className="bg-flux-dark border border-white/10 text-white px-3 py-2 rounded w-1/2 focus:outline-none focus:border-flux-yellow" value={editForm.criticality} onChange={e => setEditForm({...editForm, criticality: parseFloat(e.target.value)})} placeholder="Criticality (0.0-1.0)" />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-anton text-white uppercase tracking-wide flex items-baseline gap-4">
                  {asset.id} 
                  <span className="text-xl text-flux-sage tracking-normal">{asset.name}</span>
                </h2>
                <p className="text-xs font-bold text-flux-yellow mt-1 uppercase tracking-widest">{asset.type} • {asset.location} • {asset.capacity_kw} kW</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 relative z-10 self-start">
            {isEditing ? (
              <button onClick={handleSave} className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-lg text-emerald-400 font-bold transition-colors flex items-center gap-2 text-sm uppercase tracking-wider">
                <Save size={16} /> Save
              </button>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="p-2.5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors border border-white/10" title="Edit Asset">
                  <Edit2 size={16} />
                </button>
                <button onClick={handleDelete} className="p-2.5 hover:bg-rose-500/20 rounded-full text-rose-400/80 hover:text-rose-400 transition-colors border border-rose-500/20" title="Delete Asset">
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <div className="w-px h-8 bg-white/10 mx-1"></div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors border border-white/20">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 bg-flux-grid-dark relative">
          
          {/* Market-Style Live KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            <TrendMetric 
              label="Actual Power" 
              value={asset.actual_power || 0} 
              prevValue={prevAsset?.actual_power} 
              unit="kW"
            />
            <TrendMetric 
              label="Deviation" 
              value={asset.deviation_pct || 0} 
              prevValue={prevAsset?.deviation_pct} 
              format="percent"
              isInverseBad={true} // more negative is bad
            />
            <TrendMetric 
              label="Est. Energy Loss" 
              value={asset.energy_at_risk || 0} 
              prevValue={prevAsset?.energy_at_risk} 
              unit="kWh"
              isInverseBad={true} // higher is bad
            />
            <TrendMetric 
              label="Est. Financial Loss" 
              value={asset.revenue_at_risk || 0} 
              prevValue={prevAsset?.revenue_at_risk} 
              format="currency"
              isInverseBad={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Predictive Maintenance & Health */}
            <div className="bg-flux-charcoal p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col justify-center items-center relative z-10">
               <h3 className="font-bold uppercase tracking-wider text-flux-sage mb-6 text-xs w-full text-left flex items-center gap-2">
                 <Target size={16} className="text-flux-yellow"/> Predictive Maintenance
               </h3>
               <DonutGauge value={asset.failure_risk || 0} />
               <p className="text-white font-bold mt-4">Risk Score</p>
               <p className="text-xs text-flux-sage/60 mt-1 uppercase tracking-widest">{isHealthy ? 'Normal' : 'High Risk'}</p>
            </div>
            {/* Top Diagnostic Condition */}
            <div className="bg-flux-charcoal p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col justify-center col-span-1 md:col-span-2">
              <div className="text-xs font-bold uppercase tracking-wider text-flux-sage flex items-center gap-2 mb-3"><Target size={16} className="text-flux-yellow"/> Likely Condition</div>
              <div className="font-anton text-3xl text-white uppercase">
                {asset.ranked_conditions && asset.ranked_conditions.length > 0 
                  ? asset.ranked_conditions[0].condition_name 
                  : (isHealthy ? "Normal Operation" : asset.fault_type)}
              </div>
              {asset.ranked_conditions?.[0]?.confidence && (
                <div className="text-xs font-mono text-flux-sage/80 mt-4 bg-white/5 inline-block px-3 py-1.5 rounded self-start">
                  EVIDENCE STRENGTH: <span className="text-white font-bold">{asset.ranked_conditions[0].confidence}</span>
                </div>
              )}
            </div>

            {/* Why panel + Financial impact (AIZAR Style) */}
            <div className="bg-flux-charcoal p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col relative z-10">
              <h3 className="font-bold uppercase tracking-wider text-flux-sage mb-4 text-xs flex items-center gap-2">
                <AlertTriangle size={16} className="text-flux-yellow"/> Why is this flagged?
              </h3>
              <ul className="space-y-3">
                {asset.reasons && asset.reasons.length > 0 ? (
                  asset.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white font-medium bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-flux-yellow mt-1.5 shrink-0"></div> {r}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-flux-sage/60 italic p-3">No significant anomalous evidence detected.</li>
                )}
              </ul>
            </div>

            <div className="bg-flux-charcoal p-6 rounded-2xl border border-rose-500/20 shadow-xl flex flex-col justify-center relative z-10">
              <h3 className="font-bold uppercase tracking-wider text-flux-sage mb-4 text-xs flex items-center gap-2">
                Financial Impact
              </h3>
              <p className="text-flux-sage/80 text-sm">Energy loss per day</p>
              <p className="text-2xl font-anton tracking-wide text-white">
                {asset.energy_at_risk?.toLocaleString("en-IN")} kWh
              </p>
              <p className="text-flux-sage/80 text-sm mt-4">Financial exposure per day</p>
              <p className="text-4xl font-anton tracking-wide text-rose-400">
                ₹{asset.revenue_at_risk?.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="panel-dark flex flex-col relative z-10 py-4">
            <h3 className="font-bold uppercase tracking-wider text-flux-sage mb-4 text-xs flex items-center gap-2">
              <Activity size={16} className="text-flux-yellow"/> Live Analytics Pipeline Trace
            </h3>
            <div className="flex flex-wrap gap-2 items-center">
               <Badge label="Telemetry" passed={true} />
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

          <div className="panel-dark flex-1 min-h-[300px] relative z-10">
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-bold uppercase tracking-wider text-flux-sage text-xs">Actual vs Expected (Simulated Live View)</h3>
              <div className="flex gap-3 items-center">
                <div className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
                  MODEL: {asset.model_status.toUpperCase()}
                </div>
              </div>
            </div>
            
            <div className="h-[220px] w-full">
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
                    itemStyle={{ fontFamily: 'monospace' }}
                  />
                  <Area type="monotone" dataKey="expected_power" stroke="#ffe17c" strokeWidth={2} strokeDasharray="4 4" fill="none" name="Expected (Baseline)" isAnimationActive={false} />
                  <Area type="monotone" dataKey="actual_power" stroke="#3b82f6" strokeWidth={2} fill="none" name="Actual (Sensor)" isAnimationActive={false} 
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      if (payload.is_anomaly) {
                         return <circle cx={cx} cy={cy} r={4} fill="#ef4444" stroke="#ef4444" style={{ filter: 'drop-shadow(0 0 6px #ef4444)' }} />;
                      }
                      return <circle cx={cx} cy={cy} r={0} />;
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AIZAR-style Environmental / Temp Charts */}
          <div className="panel-dark flex-1 min-h-[300px] relative z-10 mt-6">
            <h3 className="font-bold uppercase tracking-wider text-flux-sage text-xs mb-4">
               Physical & Environmental Telemetry
            </h3>
            <div className="h-[220px] w-full">
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
                    itemStyle={{ fontFamily: 'monospace' }}
                  />
                  {asset.type === 'solar' ? (
                    <>
                      <Area type="monotone" dataKey="irradiance_wm2" stroke="#f59e0b" fill="none" strokeWidth={2} name="Irradiance (W/m²)" isAnimationActive={false} />
                      <Area type="monotone" dataKey="module_temp_c" stroke="#ef4444" fill="none" strokeWidth={2} name="Module Temp (°C)" isAnimationActive={false} />
                      <Area type="monotone" dataKey="ambient_temp_c" stroke="#3b82f6" fill="none" strokeWidth={2} name="Ambient Temp (°C)" isAnimationActive={false} />
                    </>
                  ) : (
                    <>
                      <Area type="monotone" dataKey="wind_speed_ms" stroke="#10b981" fill="none" strokeWidth={2} name="Wind Speed (m/s)" isAnimationActive={false} />
                      <Area type="monotone" dataKey="bearing_temp_c" stroke="#ef4444" fill="none" strokeWidth={2} name="Bearing Temp (°C)" isAnimationActive={false} />
                      <Area type="monotone" dataKey="ambient_temp_c" stroke="#3b82f6" fill="none" strokeWidth={2} name="Ambient Temp (°C)" isAnimationActive={false} />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* AIZAR-style Detailed Action Plan */}
          <div className={`p-6 rounded-2xl flex flex-col gap-4 relative z-10 shadow-xl ${isHealthy ? 'bg-flux-charcoal border-2 border-flux-sage/20 text-white' : 'bg-flux-yellow text-flux-charcoal border-2 border-flux-yellow shadow-flux-yellow/10'}`}>
            <div className="flex items-start gap-4 mb-2">
              <Wrench className="mt-1" size={24} />
              <div className="flex-1">
                <h3 className="font-anton text-2xl uppercase tracking-wide">Action Plan</h3>
                <p className="text-sm font-medium mt-1 leading-relaxed opacity-80">
                  Prioritized remediation steps for {asset.name}
                </p>
              </div>
            </div>

            {(!asset.action_immediate || asset.action_immediate.length === 0) ? (
              <div className="bg-black/10 rounded-lg p-4 font-medium">
                No immediate action required. Continue routine monitoring.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Immediate */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600">
                      Immediate Actions
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {asset.action_immediate.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm font-medium">
                        <span className="text-rose-600 shrink-0">▸</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Inspect */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600">
                      Signature-Driven Actions
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {asset.action_inspect.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm font-medium">
                        <span className="text-orange-600 shrink-0">▸</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Follow up */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      Long-Term Remediation
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {asset.action_long_term.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm font-medium">
                        <span className="text-blue-700 shrink-0">▸</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Work Order Dispatch */}
          {!isHealthy && (
            <div className="bg-gradient-to-r from-flux-charcoal to-flux-dark p-6 rounded-2xl border border-white/10 shadow-xl relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <Send className="text-flux-yellow" size={24} />
                <h3 className="font-anton text-2xl uppercase tracking-wide text-white">Dispatch Work Order</h3>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-flux-sage uppercase tracking-wider mb-2">Assign Technician</label>
                  <select 
                    className="w-full bg-white/5 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-flux-yellow appearance-none cursor-pointer"
                    value={selectedTechIndex}
                    onChange={(e) => setSelectedTechIndex(Number(e.target.value))}
                  >
                    {teamMembers.length === 0 ? (
                      <option value={0} disabled>No technicians available. Add in Team Settings.</option>
                    ) : (
                      teamMembers.map((tech, idx) => (
                        <option key={idx} value={idx} className="bg-flux-charcoal text-white">
                          {tech.name} • {tech.phone || tech.email}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={handleWhatsApp}
                    className="flex-1 md:flex-none px-6 py-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/50 text-[#25D366] font-bold uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Smartphone size={18} /> WhatsApp
                  </button>
                  <button 
                    onClick={handleEmail}
                    className="flex-1 md:flex-none px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 font-bold uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail size={18} /> Email
                  </button>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

function Badge({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider border ${passed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
      {passed ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
      {label}
    </div>
  );
}
