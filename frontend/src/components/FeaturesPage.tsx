import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export default function FeaturesPage() {
  return (
    <div className="font-satoshi bg-white min-h-screen text-flux-charcoal selection:bg-flux-yellow selection:text-flux-charcoal">
      
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
          <Link to="/features" className="text-flux-yellow transition-colors">Features</Link>
          <Link to="/how-it-works" className="hover:text-flux-yellow transition-colors">How it Works</Link>
          <Link to="/about" className="hover:text-flux-yellow transition-colors">About Project</Link>
        </div>
        <div className="flex-1 flex justify-end items-center gap-6">
          <Link to="/login" className="bg-flux-charcoal text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-flux-dark transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-16 px-6 lg:px-12 bg-[#f8f9fa] border-b border-flux-charcoal/10 text-center">
        <h1 className="font-anton text-6xl md:text-8xl uppercase leading-[0.9] max-w-4xl mx-auto mb-6">
          The Intelligence <br/>
          <span className="text-flux-yellow">Behind GreenZ</span>
        </h1>
        <p className="text-xl text-flux-charcoal/70 font-medium max-w-3xl mx-auto">
          We don't just alert you when a machine breaks. We use a hybrid Physics-ML architecture to predict failures, identify root causes, and translate engineering faults into exact financial impact.
        </p>
      </section>

      {/* Feature 1 */}
      <section className="py-24 px-6 lg:px-12 max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-16 items-center">
        <div className="flex-1">
          <h2 className="font-anton text-5xl uppercase mb-6">Hybrid Physics + ML</h2>
          <p className="text-flux-charcoal/80 font-medium text-lg leading-relaxed mb-6">
            Unlike pure "black box" deep learning models that operators don't trust, GreenZ starts with <strong>First-Principles Physics</strong>. We calculate the exact expected power output based on real-time weather (Irradiance, Temperature, Wind Speed). 
            <br/><br/>
            Only when the actual power deviates from the physics baseline does our <strong>Machine Learning Classifier</strong> (Random Forest/XGBoost) step in to diagnose the specific anomaly signature (e.g., Thermal Derating, Soiling, Pitch Fault).
          </p>
          <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-flux-charcoal/10 shadow-sm inline-flex">
            <div className="bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-lg font-bold uppercase text-sm">Physics Baseline</div>
            <span className="text-flux-charcoal/30 font-bold">+</span>
            <div className="bg-amber-500/10 text-amber-600 px-4 py-2 rounded-lg font-bold uppercase text-sm">ML Classifier</div>
            <span className="text-flux-charcoal/30 font-bold">=</span>
            <div className="bg-flux-charcoal text-flux-yellow px-4 py-2 rounded-lg font-bold uppercase text-sm">Trust & Accuracy</div>
          </div>
        </div>
        <div className="flex-1 bg-flux-charcoal rounded-3xl p-8 min-h-[400px] relative overflow-hidden flex items-center justify-center border border-flux-charcoal/20 shadow-2xl">
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
           <div className="bg-white/10 backdrop-blur border border-white/20 p-6 rounded-2xl w-full max-w-md relative z-10">
              <div className="text-flux-yellow font-mono text-sm mb-4">{'// Backend Physics Engine (FastAPI)'}</div>
              <div className="font-mono text-emerald-400 text-xs sm:text-sm">
                def calculate_baseline(weather, asset):<br/>
                &nbsp;&nbsp;expected_kw = physics_model(weather)<br/>
                &nbsp;&nbsp;if actual_kw &lt; (expected_kw * 0.9):<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;fault = ml_classifier.predict(asset)<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;return fault<br/>
                &nbsp;&nbsp;return "Healthy"
              </div>
           </div>
        </div>
      </section>

      {/* Feature 2 */}
      <section className="py-24 px-6 lg:px-12 bg-flux-charcoal text-white border-y border-white/10">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row-reverse gap-16 items-center">
          <div className="flex-1">
            <h2 className="font-anton text-5xl uppercase mb-6 text-flux-yellow">Revenue at Risk Model</h2>
            <p className="text-flux-sage font-medium text-lg leading-relaxed mb-6">
              We translate abstract engineering faults into hard currency. GreenZ calculates the exact "Energy at Risk" (kWh) based on the asset's active hours, and multiplies it by your tariff rate.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-flux-yellow mt-1 shrink-0" size={20} />
                <span className="text-white/80">Power Deficit = Expected kW - Actual kW</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-flux-yellow mt-1 shrink-0" size={20} />
                <span className="text-white/80">Time Horizon = Dependent on weather/daylight hours</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-flux-yellow mt-1 shrink-0" size={20} />
                <span className="text-white/80">Loss = Power Deficit × Time Horizon × Tariff</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full flex justify-center">
            <div className="bg-white p-8 rounded-3xl text-flux-charcoal text-center shadow-2xl max-w-md w-full relative">
              <div className="absolute -top-4 -right-4 bg-rose-500 text-white font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-full shadow-lg">Alert</div>
              <div className="text-sm font-bold uppercase tracking-widest text-flux-charcoal/50 mb-2">Estimated Financial Loss</div>
              <div className="font-anton text-6xl text-rose-500 mb-2">45,200</div>
              <div className="text-xl text-flux-charcoal/40 font-medium pb-6 border-b border-flux-charcoal/10">/ day</div>
              <div className="mt-6 flex justify-between text-sm font-medium">
                <span className="text-flux-charcoal/60">Asset</span>
                <strong>INV-007</strong>
              </div>
              <div className="mt-2 flex justify-between text-sm font-medium">
                <span className="text-flux-charcoal/60">Fault</span>
                <strong className="text-rose-500">Thermal Derating</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3 */}
      <section className="py-24 px-6 lg:px-12 max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-16 items-center">
        <div className="flex-1">
          <h2 className="font-anton text-5xl uppercase mb-6">Dynamic Fleet Prioritization</h2>
          <p className="text-flux-charcoal/80 font-medium text-lg leading-relaxed mb-6">
            O&M teams waste thousands of hours manually sifting through thousands of SCADA alarms. GreenZ compresses identical anomaly signatures across the fleet and ranks assets dynamically based on their financial exposure. Never guess what to fix first again.
          </p>
        </div>
        <div className="flex-1 bg-[#f8f9fa] rounded-3xl p-8 border border-flux-charcoal/10 shadow-xl w-full">
            <div className="flex flex-col gap-4">
              {[
                { rank: 1, name: 'INV-012', loss: '12k', fault: 'Thermal Derating', bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
                { rank: 2, name: 'WTG-005', loss: '8k', fault: 'Pitch Fault', bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
                { rank: 3, name: 'INV-002', loss: '1k', fault: 'Soiling', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
              ].map((item, i) => (
                <div key={i} className={clsx("p-4 rounded-xl border flex items-center justify-between", item.bg)}>
                  <div className="flex items-center gap-4">
                    <span className="font-anton text-2xl opacity-50">#{item.rank}</span>
                    <div>
                      <div className="font-bold">{item.name}</div>
                      <div className="text-sm opacity-80">{item.fault}</div>
                    </div>
                  </div>
                  <div className="font-anton text-xl">{item.loss}</div>
                </div>
              ))}
            </div>
        </div>
      </section>

    </div>
  );
}
