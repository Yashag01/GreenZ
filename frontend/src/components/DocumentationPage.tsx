import { Shield, Database, Cpu, Activity, Zap, CheckCircle2, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-flux-grid-dark flex flex-col items-center py-12 px-6">
      
      {/* Header */}
      <div className="w-full max-w-[1000px] mb-12 text-center">
        <h1 className="font-anton text-5xl md:text-6xl uppercase tracking-wide text-white mb-4">
          Renew<span className="text-flux-yellow">AI</span> Trust & Documentation
        </h1>
        <p className="text-flux-sage text-lg max-w-2xl mx-auto">
          Understand the hybrid physics-ML architecture, data requirements, and how RenewAI adapts to industry-standard SCADA systems.
        </p>
        <div className="mt-8">
            <Link to="/dashboard" className="inline-flex items-center gap-2 bg-flux-charcoal border-2 border-flux-yellow text-flux-yellow hover:bg-flux-yellow hover:text-flux-charcoal px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,225,124,0.15)]">
            <Activity size={18} /> Return to Dashboard
            </Link>
        </div>
      </div>

      <div className="w-full max-w-[1000px] flex flex-col gap-12">
        
        {/* Architecture Section */}
        <section className="bg-flux-charcoal border-2 border-white/10 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-flux-yellow/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <h2 className="font-anton text-3xl uppercase text-white mb-6 flex items-center gap-3 relative z-10">
            <Cpu className="text-flux-yellow" /> Architecture Overview
          </h2>
          
          <p className="text-white/80 mb-8 leading-relaxed relative z-10">
            RenewAI uses a hybrid approach combining first-principles physics models with machine learning classifiers. This ensures high explainability (unlike pure black-box deep learning) while adapting to real-world operational degradation.
          </p>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-flux-dark p-6 rounded-xl border border-white/10 relative z-10 overflow-x-auto">
            
            <div className="flex flex-col items-center text-center p-4 bg-white/5 border border-white/10 rounded-lg min-w-[160px]">
              <Database className="text-flux-sage mb-2" size={32} />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-1">SCADA Data</h3>
              <p className="text-xs text-white/50 font-mono">Weather & Power</p>
            </div>

            <ChevronRight className="text-white/20 hidden md:block" size={24} />
            <div className="h-4 w-px bg-white/20 md:hidden"></div>

            <div className="flex flex-col items-center text-center p-4 bg-flux-yellow/10 border border-flux-yellow/20 rounded-lg min-w-[160px]">
              <Activity className="text-flux-yellow mb-2" size={32} />
              <h3 className="font-bold text-flux-yellow text-sm uppercase tracking-wider mb-1">Physics Baseline</h3>
              <p className="text-xs text-white/50 font-mono">Expected Output</p>
            </div>

            <ChevronRight className="text-white/20 hidden md:block" size={24} />
            <div className="h-4 w-px bg-white/20 md:hidden"></div>

            <div className="flex flex-col items-center text-center p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg min-w-[160px]">
              <Zap className="text-rose-400 mb-2" size={32} />
              <h3 className="font-bold text-rose-400 text-sm uppercase tracking-wider mb-1">Deviation</h3>
              <p className="text-xs text-white/50 font-mono">Actual vs Expected</p>
            </div>

            <ChevronRight className="text-white/20 hidden md:block" size={24} />
            <div className="h-4 w-px bg-white/20 md:hidden"></div>

            <div className="flex flex-col items-center text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg min-w-[160px]">
              <Shield className="text-emerald-400 mb-2" size={32} />
              <h3 className="font-bold text-emerald-400 text-sm uppercase tracking-wider mb-1">ML Classifier</h3>
              <p className="text-xs text-white/50 font-mono">Root Cause & Priority</p>
            </div>

          </div>
        </section>

        {/* Data Schema Section */}
        <section className="bg-flux-charcoal border-2 border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="font-anton text-3xl uppercase text-white mb-6 flex items-center gap-3">
            <FileSpreadsheet className="text-flux-yellow" /> CSV Import Data Format
          </h2>
          
          <p className="text-white/80 mb-6 leading-relaxed">
            The system accepts multiple CSV files concurrently. To import data correctly via the Demo Controls, ensure your files include the `asset_id` and `timestamp` columns along with required telemetry features.
          </p>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-flux-dark text-xs uppercase tracking-wider text-flux-sage">
                  <th className="p-4 font-bold border-b border-white/10">Column Name</th>
                  <th className="p-4 font-bold border-b border-white/10">Data Type</th>
                  <th className="p-4 font-bold border-b border-white/10">Description / Example</th>
                </tr>
              </thead>
              <tbody className="text-sm text-white/90">
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-flux-yellow">timestamp</td>
                  <td className="p-4">Datetime</td>
                  <td className="p-4 font-mono text-xs opacity-70">2020-05-15 00:00:00</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-flux-yellow">asset_id</td>
                  <td className="p-4">String</td>
                  <td className="p-4 font-mono text-xs opacity-70">1BY6WEcLGh8j5v7</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-emerald-400">actual_power</td>
                  <td className="p-4">Float</td>
                  <td className="p-4 font-mono text-xs opacity-70">0.0 (kW/MW)</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-emerald-400">ambient_temp_c</td>
                  <td className="p-4">Float</td>
                  <td className="p-4 font-mono text-xs opacity-70">25.18</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-emerald-400">module_temp_c</td>
                  <td className="p-4">Float</td>
                  <td className="p-4 font-mono text-xs opacity-70">22.85</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-emerald-400">irradiance_wm2</td>
                  <td className="p-4">Float</td>
                  <td className="p-4 font-mono text-xs opacity-70">0.0</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-emerald-400">vibration_mm_s</td>
                  <td className="p-4">Float</td>
                  <td className="p-4 font-mono text-xs opacity-70">Wind specific feature</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Industry Standard Section */}
        <section className="bg-flux-charcoal border-2 border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-flux-sage/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

          <h2 className="font-anton text-3xl uppercase text-white mb-6 flex items-center gap-3 relative z-10">
            <CheckCircle2 className="text-flux-sage" /> Enterprise Readiness
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <h3 className="font-bold text-flux-sage uppercase tracking-wider mb-2">Explainable AI (XAI)</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Operators cannot trust black-box alerts. RenewAI maps ML features directly to operational conditions (e.g. Temperature Spike + Power Drop = Thermal Derating) and provides confidence rankings to justify every maintenance recommendation.
              </p>
            </div>
            
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <h3 className="font-bold text-flux-sage uppercase tracking-wider mb-2">O&M Integration</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                The platform calculates "Energy at Risk" and translates it into direct financial exposure ("Revenue at Risk"). This allows O&M teams to sort alerts by economic impact rather than pure technical severity, aligning engineering with business goals.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <h3 className="font-bold text-flux-sage uppercase tracking-wider mb-2">Hardware Agnostic</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                By standardizing ingestion via CSV or API stream, the backend handles any OEM SCADA format (Inverters, Turbines, Met Stations) as long as basic physics telemetry (Irradiance, Temperature, RPM) is provided.
              </p>
            </div>
            
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <h3 className="font-bold text-flux-sage uppercase tracking-wider mb-2">Extensible ML Pipeline</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                The backend architecture isolates the `expected_model.py` and `fault_classifier.py`, meaning data science teams can Hot-Swap new RandomForest or XGBoost models without rewriting the core application layer.
              </p>
            </div>
            
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <h3 className="font-bold text-flux-sage uppercase tracking-wider mb-2">IoT Edge & Hardware Streaming</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                While the UI supports batch CSV uploads, the backend API (`/upload/csv` or direct DB injection) perfectly simulates how remote IoT edge devices or hardware dataloggers on Windmills stream timeseries packets. Incoming packets are seamlessly appended to the active timeline.
              </p>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
