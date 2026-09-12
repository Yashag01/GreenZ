import { useEffect, useState } from 'react';
import type { Alert } from '../types/api';
import { fetchAlerts } from '../api/client';
import { Bell, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export default function AlertsList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAlerts();
        setAlerts(data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel flex-1 flex flex-col p-0 overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-flux-charcoal/10 bg-white">
        <h2 className="font-anton text-2xl uppercase tracking-wide text-flux-charcoal flex items-center gap-3">
          <div className="p-1.5 bg-flux-charcoal rounded">
            <Bell size={20} className="text-white" />
          </div>
          Live Alerts
        </h2>
      </div>
      
      <div className="overflow-y-auto flex-1 bg-[#f8f9fa] p-4 space-y-4">
        {alerts.length === 0 ? (
          <div className="text-flux-charcoal/40 text-sm font-bold text-center mt-10 uppercase tracking-wide">No active alerts.</div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className="bg-white rounded-lg p-4 border border-flux-charcoal/10 shadow-sm relative overflow-hidden group">
              <div 
                className={clsx("absolute top-0 left-0 w-1 h-full", 
                  alert.severity === 'Critical' ? 'bg-rose-500' : 'bg-flux-yellow'
                )}
              ></div>
              
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs font-bold text-flux-charcoal/40 uppercase tracking-wider">{new Date(alert.created_at).toLocaleTimeString()}</span>
                <span className={clsx('text-xs font-bold px-2 py-1 rounded uppercase tracking-wider', 
                  alert.severity === 'Critical' ? 'bg-rose-50 text-rose-600' : 'bg-flux-yellow/20 text-amber-700'
                )}>
                  {alert.asset_id}
                </span>
              </div>
              <p className="font-bold text-flux-charcoal mb-2">{alert.message}</p>
              <div className="flex items-start gap-2 bg-[#f8f9fa] p-2 rounded text-xs font-medium text-flux-charcoal/70 border border-flux-charcoal/5">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-flux-charcoal/40" />
                <span>{alert.recommended_action}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
