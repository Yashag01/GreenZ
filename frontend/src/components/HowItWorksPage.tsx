import { Link } from 'react-router-dom';
import { ArrowLeft, Database, Activity, BrainCircuit, Banknote } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="font-satoshi bg-[#f8f9fa] min-h-screen text-flux-charcoal selection:bg-flux-yellow selection:text-flux-charcoal">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full h-20 bg-white/90 backdrop-blur-md z-50 border-b border-flux-charcoal/10 flex items-center px-6 lg:px-12">
        <div className="flex-1">
          <Link to="/" className="font-anton text-3xl uppercase tracking-wide flex items-center hover:opacity-80 transition-opacity">
            <ArrowLeft className="inline mr-3 mb-1" size={24} />
            <img src="/logo.png" alt="GreenZ Logo" className="h-8 w-8 mr-2 object-contain" />
            Green<span className="text-flux-yellow">Z</span>
          </Link>
        </div>
        <div className="hidden md:flex flex-1 justify-center gap-8 font-medium text-sm">
          <Link to="/features" className="hover:text-flux-yellow transition-colors">Features</Link>
          <Link to="/how-it-works" className="text-flux-yellow transition-colors">How it Works</Link>
          <Link to="/about" className="hover:text-flux-yellow transition-colors">About Project</Link>
        </div>
        <div className="flex-1 flex justify-end items-center gap-6">
          <Link to="/login" className="bg-flux-charcoal text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-flux-dark transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-16 px-6 lg:px-12 text-center max-w-4xl mx-auto">
        <h1 className="font-anton text-6xl md:text-8xl uppercase leading-[0.9] mb-6">
          The <span className="text-flux-yellow">Pipeline</span>
        </h1>
        <p className="text-xl text-flux-charcoal/70 font-medium">
          A seamless transition from raw SCADA hardware telemetry to actionable financial intelligence in your browser.
        </p>
      </section>

      {/* Pipeline Steps */}
      <section className="py-12 px-6 lg:px-12 max-w-[1400px] mx-auto pb-32">
        <div className="flex flex-col gap-8 relative">
          
          {/* Vertical Line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-flux-charcoal/10 -translate-x-1/2"></div>

          {/* Step 1 */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
            <div className="flex-1 lg:text-right flex flex-col items-center lg:items-end">
               <div className="w-16 h-16 rounded-full bg-flux-charcoal text-white flex items-center justify-center shadow-xl z-10 mb-6 lg:mb-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                 <Database size={32} />
               </div>
               <h3 className="font-anton text-4xl uppercase mb-4">1. SCADA Data Ingestion</h3>
               <p className="text-lg text-flux-charcoal/70 font-medium">
                 We ingest high-frequency telemetry from your existing hardware—whether through batched CSV uploads or real-time IoT API streams. We monitor everything from Inverter IGBT temperatures to Wind Turbine blade vibrations.
               </p>
            </div>
            <div className="flex-1 w-full">
              <div className="bg-white p-6 rounded-3xl border border-flux-charcoal/10 shadow-lg">
                 <div className="font-mono text-sm text-flux-charcoal/50 mb-2">POST /api/ingest</div>
                 <div className="bg-flux-charcoal text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-hidden">
                   "asset_id": "WTG-002",<br/>
                   "timestamp": "2026-09-12T10:00:00Z",<br/>
                   "wind_speed_ms": 12.4,<br/>
                   "actual_power_kw": 1850.0,<br/>
                   "pitch_angle_deg": 1.2
                 </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-4 relative z-20">
            <div className="w-10 h-10 rounded-full bg-white border border-flux-charcoal/10 flex items-center justify-center text-flux-charcoal/30">
              ↓
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col lg:flex-row-reverse gap-8 lg:gap-16 items-center mt-12">
            <div className="flex-1 lg:text-left flex flex-col items-center lg:items-start">
               <div className="w-16 h-16 rounded-full bg-white border-2 border-flux-yellow text-flux-charcoal flex items-center justify-center shadow-xl z-10 mb-6 lg:mb-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                 <Activity size={32} className="text-flux-yellow" />
               </div>
               <h3 className="font-anton text-4xl uppercase mb-4">2. Physics Deviation Check</h3>
               <p className="text-lg text-flux-charcoal/70 font-medium">
                 Our system calculates the exact power your asset <em>should</em> be producing right now based on localized weather patterns. If the actual power dips below this baseline, we trigger an active anomaly window.
               </p>
            </div>
            <div className="flex-1 w-full flex lg:justify-end">
              <div className="bg-white p-6 rounded-3xl border border-flux-charcoal/10 shadow-lg w-full max-w-lg relative overflow-hidden">
                 <div className="absolute inset-0 bg-flux-yellow/5"></div>
                 <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wider text-flux-charcoal/50">
                      <span>Expected Power</span>
                      <span className="text-emerald-500">2200 kW</span>
                    </div>
                    <div className="w-full h-2 bg-emerald-500/20 rounded-full overflow-hidden"><div className="w-full h-full bg-emerald-500"></div></div>
                    <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wider text-flux-charcoal/50 mt-4">
                      <span>Actual Power</span>
                      <span className="text-rose-500">1850 kW</span>
                    </div>
                    <div className="w-full h-2 bg-rose-500/20 rounded-full overflow-hidden"><div className="w-[84%] h-full bg-rose-500"></div></div>
                    <div className="mt-4 text-center font-anton text-rose-500 text-xl animate-pulse">DEVIATION DETECTED</div>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-4 relative z-20">
            <div className="w-10 h-10 rounded-full bg-white border border-flux-charcoal/10 flex items-center justify-center text-flux-charcoal/30">
              ↓
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center mt-12">
            <div className="flex-1 lg:text-right flex flex-col items-center lg:items-end">
               <div className="w-16 h-16 rounded-full bg-flux-charcoal text-white flex items-center justify-center shadow-xl z-10 mb-6 lg:mb-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                 <BrainCircuit size={32} />
               </div>
               <h3 className="font-anton text-4xl uppercase mb-4">3. ML Classification</h3>
               <p className="text-lg text-flux-charcoal/70 font-medium">
                 Once an anomaly is detected, our pre-trained ML classifiers analyze the multidimensional telemetry footprint to diagnose the exact hardware fault (e.g., "Soiling on Panels", "Inverter Overheating", "Gearbox Wear").
               </p>
            </div>
            <div className="flex-1 w-full">
              <div className="bg-flux-charcoal p-6 rounded-3xl border border-flux-charcoal/10 shadow-lg text-white">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-3 h-3 rounded-full bg-flux-yellow animate-ping"></div>
                   <div className="font-mono text-sm uppercase tracking-widest text-flux-sage">Random Forest Classifier</div>
                 </div>
                 <div className="space-y-3 font-medium">
                   <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                     <span>Pitch Fault Probability</span>
                     <span className="text-flux-yellow font-bold">92.4%</span>
                   </div>
                   <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10 opacity-50">
                     <span>Yaw Error Probability</span>
                     <span>4.1%</span>
                   </div>
                   <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10 opacity-50">
                     <span>Sensor Drift Probability</span>
                     <span>3.5%</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-4 relative z-20">
            <div className="w-10 h-10 rounded-full bg-white border border-flux-charcoal/10 flex items-center justify-center text-flux-charcoal/30">
              ↓
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col lg:flex-row-reverse gap-8 lg:gap-16 items-center mt-12">
            <div className="flex-1 lg:text-left flex flex-col items-center lg:items-start">
               <div className="w-16 h-16 rounded-full bg-flux-yellow text-flux-charcoal flex items-center justify-center shadow-xl z-10 mb-6 lg:mb-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                 <Banknote size={32} />
               </div>
               <h3 className="font-anton text-4xl uppercase mb-4">4. Financial Translation</h3>
               <p className="text-lg text-flux-charcoal/70 font-medium">
                 We quantify the fault in Rupees. The React dashboard instantly receives Server-Sent Events (SSE) and reorganizes the fleet hierarchy, providing O&M managers with a prioritized action plan.
               </p>
            </div>
            <div className="flex-1 w-full flex lg:justify-end">
              <div className="bg-white p-6 rounded-3xl border border-flux-charcoal/10 shadow-lg w-full max-w-lg">
                 <div className="flex items-center gap-3 mb-4 border-b border-flux-charcoal/10 pb-4">
                   <div className="bg-rose-500/10 text-rose-600 px-3 py-1 rounded font-bold uppercase text-xs">New Alert</div>
                   <div className="font-medium">WTG-002 (Wind Turbine)</div>
                 </div>
                 <div className="flex justify-between items-end">
                   <div>
                     <div className="text-sm font-bold uppercase tracking-wider text-flux-charcoal/50 mb-1">Financial Impact</div>
                     <div className="font-anton text-4xl text-rose-500">24,500 <span className="text-lg text-flux-charcoal/40">/ day</span></div>
                   </div>
                   <button className="bg-flux-charcoal text-white px-4 py-2 rounded-lg font-medium hover:bg-flux-dark transition-colors">
                     Dispatch Team
                   </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-24 px-6 lg:px-12 bg-flux-charcoal text-white border-t border-flux-charcoal/10 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-anton text-5xl md:text-7xl uppercase mb-4 text-flux-yellow">How to Use GreenZ</h2>
            <p className="text-xl font-medium text-flux-sage max-w-3xl mx-auto">A quick start guide for new O&M managers and operators.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative group hover:bg-white/10 transition-colors">
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-flux-yellow text-flux-charcoal font-anton text-2xl flex items-center justify-center shadow-lg">1</div>
              <h3 className="font-anton text-2xl uppercase mb-4 mt-2">Access Dashboard</h3>
              <p className="text-white/70 font-medium">Click "Dashboard" in the top right to enter the main control room. Use Demo Mode for a quick preview without an account.</p>
            </div>

            <div className="hidden md:flex items-center justify-center -mx-4 z-20 text-flux-yellow/50">
              <div className="w-8 h-8 rounded-full border border-flux-yellow/30 flex items-center justify-center">→</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative group hover:bg-white/10 transition-colors">
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-flux-yellow text-flux-charcoal font-anton text-2xl flex items-center justify-center shadow-lg">2</div>
              <h3 className="font-anton text-2xl uppercase mb-4 mt-2">Load Data</h3>
              <p className="text-white/70 font-medium">Use the "Load Defaults" or "Upload CSV" buttons in the top header to inject your SCADA telemetry into the physics engine.</p>
            </div>

            <div className="hidden md:flex items-center justify-center -mx-4 z-20 text-flux-yellow/50">
              <div className="w-8 h-8 rounded-full border border-flux-yellow/30 flex items-center justify-center">→</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative group hover:bg-white/10 transition-colors">
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-flux-yellow text-flux-charcoal font-anton text-2xl flex items-center justify-center shadow-lg">3</div>
              <h3 className="font-anton text-2xl uppercase mb-4 mt-2">Monitor Fleet</h3>
              <p className="text-white/70 font-medium">Watch the "Priority Table". The AI will automatically surface failing assets to the top based on total Rupees lost per day.</p>
            </div>

            <div className="hidden md:flex items-center justify-center -mx-4 z-20 text-flux-yellow/50">
              <div className="w-8 h-8 rounded-full border border-flux-yellow/30 flex items-center justify-center">→</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative group hover:bg-white/10 transition-colors">
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-flux-yellow text-flux-charcoal font-anton text-2xl flex items-center justify-center shadow-lg">4</div>
              <h3 className="font-anton text-2xl uppercase mb-4 mt-2">Take Action</h3>
              <p className="text-white/70 font-medium">Click on any failing asset to view its detailed AI Diagnosis, then dispatch your technicians to fix the exact root cause.</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
