import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, CheckCircle2, ChevronRight, Play } from 'lucide-react';


export default function LandingPage() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    localStorage.setItem('demo_bypass', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="font-satoshi bg-white min-h-screen text-flux-charcoal selection:bg-flux-yellow selection:text-flux-charcoal">
      
      {}
      <nav className="fixed top-0 w-full h-20 bg-white/90 backdrop-blur-md z-50 border-b border-flux-charcoal/10 flex items-center px-6 lg:px-12">
        <div className="flex-1">
          <Link to="/" className="font-anton text-3xl uppercase tracking-wide flex items-center">
            <img src="/logo.png" alt="GreenZ Logo" className="h-8 w-8 mr-2 object-contain" />
            Green<span className="text-flux-yellow">Z</span>
          </Link>
        </div>
        <div className="hidden md:flex flex-1 justify-center gap-8 font-medium text-sm">
          <Link to="/features" className="hover:text-flux-yellow transition-colors">Features</Link>
          <Link to="/how-it-works" className="hover:text-flux-yellow transition-colors">How it Works</Link>
          <Link to="/about" className="hover:text-flux-yellow transition-colors">About Project</Link>
        </div>
        <div className="flex-1 flex justify-end items-center gap-6">
          <button onClick={handleDemoLogin} className="font-medium text-sm hover:opacity-70 transition-opacity text-flux-charcoal border border-flux-charcoal/20 px-4 py-2 rounded-full">
            Demo Mode
          </button>
          <Link to="/login" className="font-medium text-sm hover:opacity-70 transition-opacity">Login</Link>
          <Link to="/login" className="bg-flux-charcoal text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-flux-dark transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {}
      <section className="pt-40 pb-24 px-6 relative bg-flux-grid-dark overflow-hidden flex flex-col items-center text-center">
        <div className="mb-8 inline-flex items-center gap-2 border border-flux-charcoal/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white/50 backdrop-blur">
          <span className="w-2 h-2 rounded-full bg-flux-yellow animate-pulse"></span>
          Predictive Maintenance 2.0
        </div>
        
        <h1 className="font-anton text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.9] max-w-5xl mx-auto mb-6 relative z-10">
          Stop fixing things <br/>
          <span className="relative inline-block">
            <span className="absolute -inset-2 bg-flux-yellow -rotate-[2deg] -z-10 w-[110%] rounded-sm"></span>
            <span className="relative">too late</span>
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-flux-charcoal/70 max-w-xl mx-auto mb-10 font-medium">
          The autonomous AI watchdog for your factory. Detect faults before they happen, prioritize repairs by revenue at risk, and eliminate unplanned downtime.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto relative z-20">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-1 border-2 border-flux-charcoal/20 px-6 py-4 rounded-lg bg-white focus:outline-none focus:border-flux-charcoal transition-colors font-medium"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="font-anton text-xl bg-flux-yellow px-8 py-4 rounded-lg hover:scale-105 transition-transform duration-300 shadow-xl shadow-flux-yellow/20 uppercase tracking-wide">
            Join Waitlist
          </button>
        </div>
      </section>

      {}
      <section className="flex flex-col lg:flex-row w-full min-h-[600px]">
        {}
        <div className="flex-1 bg-flux-charcoal p-12 lg:p-24 flex flex-col justify-start">
          <h2 className="font-anton text-5xl md:text-7xl text-white uppercase mb-12">The Old Way</h2>
          <ul className="space-y-8">
            {[
              "Wait for a machine to break down",
              "Lose thousands of rupees per hour",
              "Technicians waste time on healthy assets",
              "Zero predictability in maintenance budgets"
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-4 text-flux-sage text-xl font-medium">
                <X className="text-rose-500 mt-1 shrink-0" size={24} />
                {text}
              </li>
            ))}
          </ul>
        </div>
        
        {}
        <div className="flex-1 bg-flux-dark border-l-4 border-flux-yellow p-12 lg:p-24 flex flex-col justify-start relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-flux-yellow/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="font-anton text-5xl md:text-7xl text-white uppercase mb-12">The GreenZ Way</h2>
          <ul className="space-y-8 relative z-10">
            {[
              "AI detects a 5% drop in efficiency",
              "Diagnoses the specific root cause instantly",
              "Ranks repair priority by Revenue at Risk",
              "Fix it before the machine actually breaks"
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-4 text-white text-xl font-medium">
                <CheckCircle2 className="text-flux-yellow mt-1 shrink-0" size={24} />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="features" className="py-24 px-6 lg:px-12 bg-white max-w-[1400px] mx-auto">
        <div className="text-center mb-16 flex flex-col items-center">
          <h2 className="font-anton text-5xl md:text-7xl uppercase">The Intelligence Behind GreenZ</h2>
          <p className="mt-4 text-xl text-flux-charcoal/70 font-medium max-w-3xl mx-auto mb-6">
            We don't just alert you when a machine breaks. We use a hybrid Physics-ML architecture to predict failures, identify root causes, and translate engineering faults into exact financial impact.
          </p>
          <Link to="/features" className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-flux-yellow hover:text-flux-charcoal transition-colors border-2 border-flux-yellow hover:border-flux-charcoal px-6 py-2 rounded-full">
            Read Full Deep Dive <ChevronRight size={18} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 bg-[#f8f9fa] rounded-3xl p-8 border border-flux-charcoal/10 hover:shadow-2xl transition-all duration-300">
            <h3 className="font-anton text-4xl uppercase mb-4">Hybrid Physics + Machine Learning</h3>
            <p className="text-flux-charcoal/80 font-medium text-lg leading-relaxed mb-6">
              Unlike pure "black box" deep learning models that operators don't trust, GreenZ starts with <strong>First-Principles Physics</strong>. We calculate the exact expected power output based on real-time weather (Irradiance, Temperature, Wind Speed). 
              <br/><br/>
              Only when the actual power deviates from the physics baseline does our <strong>Machine Learning Classifier</strong> (Random Forest/XGBoost) step in to diagnose the specific anomaly signature (e.g., Thermal Derating, Soiling, Pitch Fault).
            </p>
            <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-flux-charcoal/10 shadow-sm">
              <div className="bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-lg font-bold uppercase text-sm">Physics Baseline</div>
              <span className="text-flux-charcoal/30 font-bold">+</span>
              <div className="bg-amber-500/10 text-amber-600 px-4 py-2 rounded-lg font-bold uppercase text-sm">ML Classifier</div>
              <span className="text-flux-charcoal/30 font-bold">=</span>
              <div className="bg-flux-charcoal text-flux-yellow px-4 py-2 rounded-lg font-bold uppercase text-sm">Trust & Accuracy</div>
            </div>
          </div>

          <div className="bg-flux-charcoal rounded-3xl p-8 text-white hover:shadow-2xl transition-all duration-300">
            <h3 className="font-anton text-4xl uppercase mb-4 text-flux-yellow">Hardware Agnostic</h3>
            <p className="text-flux-sage font-medium text-lg leading-relaxed mb-6">
              GreenZ is built to integrate with any SCADA system. Whether you are running Solar Inverters or Wind Turbines, our platform ingests standard telemetry via CSV batches or live API streams seamlessly.
            </p>
            <div className="flex flex-col gap-2 font-mono text-sm opacity-80">
              <div className="bg-white/10 p-2 rounded">✓ asset_id</div>
              <div className="bg-white/10 p-2 rounded">✓ actual_power</div>
              <div className="bg-white/10 p-2 rounded">✓ irradiance_wm2</div>
              <div className="bg-white/10 p-2 rounded">✓ ambient_temp_c</div>
            </div>
          </div>

          <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-flux-charcoal/10 hover:shadow-2xl transition-all duration-300">
            <h3 className="font-anton text-4xl uppercase mb-4 text-rose-500">Revenue at Risk</h3>
            <p className="text-flux-charcoal/80 font-medium text-lg leading-relaxed mb-8">
              We translate abstract engineering faults into hard currency. GreenZ calculates the exact "Energy at Risk" (kWh) based on the asset's active hours, and multiplies it by your tariff rate.
            </p>
            <div className="bg-white p-6 rounded-xl border border-flux-charcoal/10 text-center shadow-inner">
              <div className="text-sm font-bold uppercase tracking-widest text-flux-charcoal/50 mb-1">Estimated Financial Loss</div>
              <div className="font-anton text-5xl text-rose-500">₹45,200 <span className="text-xl text-flux-charcoal/40">/ day</span></div>
            </div>
          </div>

          <div className="md:col-span-2 bg-flux-dark rounded-3xl p-8 text-white border border-flux-charcoal/10 hover:shadow-2xl transition-all duration-300">
            <h3 className="font-anton text-4xl uppercase mb-4">Dynamic Fleet Prioritization</h3>
            <p className="text-flux-sage font-medium text-lg leading-relaxed mb-6">
              O&M teams waste thousands of hours manually sifting through thousands of SCADA alarms. GreenZ compresses identical anomaly signatures across the fleet and ranks assets dynamically based on their financial exposure. Never guess what to fix first again.
            </p>
            <div className="flex gap-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex-1">
                <div className="text-rose-400 font-bold uppercase text-xs tracking-wider mb-2">Priority 1</div>
                <div className="font-anton text-2xl">INV-012</div>
                <div className="text-sm opacity-70">Loss: ₹12k (Thermal Derating)</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex-1">
                <div className="text-amber-400 font-bold uppercase text-xs tracking-wider mb-2">Priority 2</div>
                <div className="font-anton text-2xl">WTG-005</div>
                <div className="text-sm opacity-70">Loss: ₹8k (Pitch Fault)</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6 lg:px-12 bg-white border-t border-flux-charcoal/10">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-16">
          
          <div className="lg:w-1/3">
            <div className="sticky top-32 flex flex-col items-start">
              <h2 className="font-anton text-6xl md:text-7xl uppercase leading-[0.9] mb-4">
                How <br/> GreenZ <br/> Works
              </h2>
              <p className="text-xl font-medium text-flux-charcoal/60 mb-6">A seamless pipeline from raw SCADA data to actionable financial intelligence.</p>
              <Link to="/how-it-works" className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-flux-yellow hover:text-flux-charcoal transition-colors border-2 border-flux-yellow hover:border-flux-charcoal px-6 py-2 rounded-full">
                View Pipeline <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          <div className="lg:w-2/3 flex flex-col gap-16">
            <div className="relative group cursor-default bg-[#f8f9fa] p-10 rounded-3xl border border-flux-charcoal/10 hover:shadow-xl transition-all">
              <div className="absolute -left-6 -top-10 font-anton text-8xl text-flux-yellow/20 group-hover:text-flux-yellow transition-colors duration-500 z-0">01</div>
              <div className="relative z-10">
                <h3 className="font-anton text-4xl uppercase mb-4">Data Ingestion (SCADA)</h3>
                <p className="text-lg text-flux-charcoal/70 font-medium">
                  We ingest high-frequency telemetry from your existing hardware—whether through batched CSV uploads or real-time IoT API streams. We monitor everything from Inverter IGBT temperatures to Wind Turbine blade vibrations.
                </p>
              </div>
            </div>
            
            <div className="relative group cursor-default bg-[#f8f9fa] p-10 rounded-3xl border border-flux-charcoal/10 hover:shadow-xl transition-all">
              <div className="absolute -left-6 -top-10 font-anton text-8xl text-flux-yellow/20 group-hover:text-flux-yellow transition-colors duration-500 z-0">02</div>
              <div className="relative z-10">
                <h3 className="font-anton text-4xl uppercase mb-4">Physics Baseline & Deviation</h3>
                <p className="text-lg text-flux-charcoal/70 font-medium">
                  Our system calculates the exact power your asset *should* be producing right now based on localized weather patterns. If the actual power dips below this baseline, we trigger an active anomaly window.
                </p>
              </div>
            </div>

            <div className="relative group cursor-default bg-[#f8f9fa] p-10 rounded-3xl border border-flux-charcoal/10 hover:shadow-xl transition-all">
              <div className="absolute -left-6 -top-10 font-anton text-8xl text-flux-yellow/20 group-hover:text-flux-yellow transition-colors duration-500 z-0">03</div>
              <div className="relative z-10">
                <h3 className="font-anton text-4xl uppercase mb-4">Machine Learning Diagnosis</h3>
                <p className="text-lg text-flux-charcoal/70 font-medium">
                  Once an anomaly is detected, our pre-trained ML classifiers analyze the multidimensional telemetry footprint to diagnose the exact hardware fault (e.g., "Soiling on Panels", "Inverter Overheating", "Gearbox Wear").
                </p>
              </div>
            </div>
            
            <div className="relative group cursor-default bg-[#f8f9fa] p-10 rounded-3xl border border-flux-charcoal/10 hover:shadow-xl transition-all">
              <div className="absolute -left-6 -top-10 font-anton text-8xl text-flux-yellow/20 group-hover:text-flux-yellow transition-colors duration-500 z-0">04</div>
              <div className="relative z-10">
                <h3 className="font-anton text-4xl uppercase mb-4">Financial Translation & Action</h3>
                <p className="text-lg text-flux-charcoal/70 font-medium">
                  We quantify the fault in Rupees. The dashboard organizes and groups alerts, providing O&M managers and technicians with a prioritized action plan to save the maximum amount of revenue before catastrophic failure occurs.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section id="about-project" className="py-24 px-6 lg:px-12 bg-flux-charcoal text-white border-t border-flux-charcoal/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="font-anton text-5xl md:text-6xl uppercase mb-4 text-flux-yellow">About This Project</h2>
            <p className="text-xl text-flux-sage font-medium max-w-3xl mx-auto mb-6">
              Built specifically for the hackathon, GreenZ aims to disrupt the renewable energy operations and maintenance sector by aligning engineering telemetry with business outcomes.
            </p>
            <Link to="/about" className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-flux-yellow hover:text-white transition-colors border-2 border-flux-yellow hover:border-white px-6 py-2 rounded-full">
              Read Our Vision <ChevronRight size={18} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white/5 border border-white/10 p-10 rounded-3xl shadow-xl">
              <h3 className="font-anton text-3xl uppercase mb-6 flex items-center gap-3"><CheckCircle2 className="text-emerald-400" /> What's Built</h3>
              <ul className="space-y-6 text-lg font-medium text-white/80">
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                  <p><strong>FastAPI Python Backend</strong>: A robust data pipeline that simulates real-time edge streaming, calculates physics baselines, and runs mock ML classifications.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                  <p><strong>React + Vite Dashboard</strong>: A highly responsive, production-ready frontend that handles real-time Server-Sent Events (SSE) and complex state management.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                  <p><strong>Robust CSV Processing</strong>: The engine gracefully handles batched historical data uploads, complete with duplicate detection and error handling.</p>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 p-10 rounded-3xl shadow-xl">
              <h3 className="font-anton text-3xl uppercase mb-6 flex items-center gap-3"><Play className="text-amber-400" /> Future Roadmap</h3>
              <ul className="space-y-6 text-lg font-medium text-white/80">
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0"></div>
                  <p><strong>Actual ML Model Integration</strong>: Replacing the mock classifiers with actual scikit-learn or TensorFlow models trained on open-source SCADA datasets.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0"></div>
                  <p><strong>Generative AI Technician Chat</strong>: Integrating Gemini to allow technicians to "chat" with their assets and generate automated repair manuals on the fly.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0"></div>
                  <p><strong>Mobile Technician View</strong>: A dedicated mobile-first PWA for field workers to acknowledge tickets and scan physical hardware QR codes.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="relative bg-flux-yellow py-32 px-6 overflow-hidden flex flex-col items-center text-center">
        {}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 select-none pointer-events-none overflow-hidden">
          <span className="font-anton text-[20rem] md:text-[30rem] leading-none whitespace-nowrap -rotate-2">GreenZ</span>
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="font-anton text-6xl md:text-8xl uppercase leading-[0.9] mb-10">
            Ready to stop guessing?
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mx-auto p-2 bg-flux-charcoal rounded-xl shadow-2xl hover:scale-105 transition-transform duration-300">
            <input 
              type="email" 
              placeholder="name@factory.com" 
              className="flex-1 bg-transparent px-4 py-3 text-white focus:outline-none placeholder:text-white/50 font-medium"
            />
            <button className="font-anton text-xl bg-flux-yellow text-flux-charcoal px-8 py-3 rounded-lg uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-white transition-colors">
              Get Started <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
