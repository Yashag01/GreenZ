import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import clsx from 'clsx';

export default function LandingPage() {
  const [email, setEmail] = useState('');

  return (
    <div className="font-satoshi bg-white min-h-screen text-flux-charcoal selection:bg-flux-yellow selection:text-flux-charcoal">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full h-20 bg-white/90 backdrop-blur-md z-50 border-b border-flux-charcoal/10 flex items-center px-6 lg:px-12">
        <div className="flex-1">
          <Link to="/" className="font-anton text-3xl uppercase tracking-wide flex items-baseline">
            Flux<span className="text-flux-yellow">.</span>
          </Link>
        </div>
        <div className="hidden md:flex flex-1 justify-center gap-8 font-medium text-sm">
          <a href="#features" className="hover:text-flux-yellow transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-flux-yellow transition-colors">How it Works</a>
          <a href="#testimonials" className="hover:text-flux-yellow transition-colors">Testimonials</a>
        </div>
        <div className="flex-1 flex justify-end items-center gap-6">
          <Link to="/login" className="font-medium text-sm hover:opacity-70 transition-opacity">Login</Link>
          <Link to="/login" className="bg-flux-charcoal text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-flux-dark transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
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

      {/* Problem / Solution Split */}
      <section className="flex flex-col lg:flex-row w-full min-h-[600px]">
        {/* Problem */}
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
        
        {/* Solution */}
        <div className="flex-1 bg-flux-dark border-l-4 border-flux-yellow p-12 lg:p-24 flex flex-col justify-start relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-flux-yellow/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="font-anton text-5xl md:text-7xl text-white uppercase mb-12">The Flux Way</h2>
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

      {/* Bento Grid Features */}
      <section id="features" className="py-24 px-6 lg:px-12 bg-white max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-anton text-5xl md:text-7xl uppercase">Everything you need</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
          
          {/* Bento Item 1 */}
          <div className="md:col-span-2 bg-[#f8f9fa] rounded-3xl p-8 border border-flux-charcoal/10 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <h3 className="font-anton text-4xl uppercase mb-2">Real-Time SCADA Sync</h3>
            <p className="text-flux-charcoal/70 font-medium max-w-md">Connect your inverters and turbines directly. We ingest 15-minute intervals automatically.</p>
            
            {/* Abstract UI Mockup */}
            <div className="absolute -bottom-10 -right-10 w-3/4 h-64 bg-white rounded-xl border border-flux-charcoal/10 shadow-2xl flex flex-col group-hover:-translate-y-4 transition-transform duration-500">
              <div className="h-8 border-b border-flux-charcoal/10 flex items-center px-3 gap-1.5 bg-gray-50/50">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              </div>
              <div className="flex-1 p-4 bg-flux-grid-dark flex gap-4">
                <div className="w-1/3 bg-white/80 rounded border border-flux-charcoal/5 h-full"></div>
                <div className="w-2/3 bg-white/80 rounded border border-flux-charcoal/5 h-full relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-flux-yellow rounded-full animate-ping"></div>
                    <span className="font-anton text-sm text-flux-charcoal">SYNCING...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Item 2 */}
          <div className="bg-flux-charcoal rounded-3xl p-8 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <h3 className="font-anton text-4xl uppercase mb-2 text-flux-yellow">AI Diagnostics</h3>
            <p className="text-flux-sage font-medium">Powered by Gemini. Understand exactly what went wrong in plain English.</p>
            <div className="mt-8 font-mono text-sm text-emerald-400 bg-black/50 p-4 rounded-lg border border-white/10 group-hover:scale-105 transition-transform duration-500">
              &gt; ANALYZING WEATHER...<br/>
              &gt; TEMP: 42°C<br/>
              &gt; DIAGNOSIS:<br/>
              <span className="text-white">Thermal Derating</span>
            </div>
          </div>

          {/* Bento Item 3 */}
          <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-flux-charcoal/10 group hover:shadow-2xl transition-all duration-300">
            <h3 className="font-anton text-4xl uppercase mb-2">Financial Impact</h3>
            <p className="text-flux-charcoal/70 font-medium">Translate technical faults into exact Rupees lost.</p>
            <div className="mt-8 flex items-end gap-2">
              <span className="font-anton text-6xl text-rose-500">₹24K</span>
              <span className="font-medium text-flux-charcoal/50 pb-2">/ day</span>
            </div>
          </div>

          {/* Bento Item 4 */}
          <div className="md:col-span-2 bg-flux-dark rounded-3xl p-8 text-white border border-flux-charcoal/10 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="relative z-10 w-1/2">
              <h3 className="font-anton text-4xl uppercase mb-2">Priority Ranking</h3>
              <p className="text-flux-sage font-medium">Never guess what to fix first. We rank every asset dynamically.</p>
            </div>
            
            <div className="absolute top-8 right-8 w-1/2 flex flex-col gap-3 group-hover:translate-x-2 transition-transform duration-500">
              {[
                { rank: 1, name: 'INV-007', risk: 'Critical', bg: 'bg-rose-500/20 text-rose-400' },
                { rank: 2, name: 'WTG-002', risk: 'Warning', bg: 'bg-amber-500/20 text-amber-400' },
                { rank: 3, name: 'INV-012', risk: 'Normal', bg: 'bg-emerald-500/20 text-emerald-400' },
              ].map((item, i) => (
                <div key={i} className="bg-flux-charcoal p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-anton text-flux-sage">#{item.rank}</span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className={clsx("text-xs px-2 py-1 rounded font-bold uppercase tracking-wider", item.bg)}>
                    {item.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 lg:px-12 bg-white border-t border-flux-charcoal/10 relative">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-16 relative">
          
          <div className="lg:w-1/3">
            <div className="sticky top-32">
              <h2 className="font-anton text-6xl md:text-7xl uppercase leading-[0.9]">
                How <br/> Flux <br/> Works
              </h2>
            </div>
          </div>

          <div className="lg:w-2/3 flex flex-col gap-24">
            {[
              {
                title: "Connect Your Data",
                desc: "Upload CSV logs daily or stream via our real-time API. We integrate seamlessly with existing SCADA systems."
              },
              {
                title: "AI Watchdog Analyzes",
                desc: "Our machine learning models continuously compare actual output to expected physics-based baselines, factoring in live weather."
              },
              {
                title: "Act & Save Revenue",
                desc: "Get notified instantly when an anomaly is detected. Dispatch technicians with exact diagnostic information."
              }
            ].map((step, i) => (
              <div key={i} className="relative group cursor-default">
                <div className="absolute -left-8 md:-left-16 -top-12 font-anton text-8xl md:text-9xl text-flux-yellow/20 group-hover:text-flux-yellow transition-colors duration-500 z-0">
                  0{i+1}
                </div>
                <div className="relative z-10 pt-4">
                  <h3 className="font-anton text-4xl md:text-5xl uppercase mb-4">{step.title}</h3>
                  <p className="text-xl text-flux-charcoal/70 font-medium max-w-lg">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 lg:px-12 bg-[#f8f9fa] border-t border-flux-charcoal/10">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-anton text-5xl md:text-6xl uppercase text-center mb-16">Trusted by Operators</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-flux-charcoal/10 p-8 rounded-2xl flex flex-col shadow-sm">
              <div className="flex gap-1 mb-6 text-flux-yellow">{'★★★★★'.split('').map((s,i)=><span key={i} className="text-2xl">{s}</span>)}</div>
              <p className="text-lg font-medium mb-8 flex-1">"We used to inspect 50 inverters manually every week. Flux tells us exactly which 2 need attention. It saved us lakhs in the first month."</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-flux-sage grayscale"></div>
                <div>
                  <div className="font-anton uppercase tracking-wider">Rahul D.</div>
                  <div className="text-sm text-flux-charcoal/60">Solar Plant Manager</div>
                </div>
              </div>
            </div>

            <div className="bg-flux-charcoal text-white p-8 rounded-2xl flex flex-col shadow-xl md:-translate-y-4">
              <div className="flex gap-1 mb-6 text-flux-yellow">{'★★★★★'.split('').map((s,i)=><span key={i} className="text-2xl">{s}</span>)}</div>
              <p className="text-lg font-medium mb-8 flex-1 text-flux-sage">"The priority ranking based on Revenue at Risk completely changed how we dispatch our field teams. Absolutely essential software."</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 grayscale"></div>
                <div>
                  <div className="font-anton uppercase tracking-wider text-white">Sarah K.</div>
                  <div className="text-sm text-flux-sage/60">Director of O&M</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-flux-charcoal/10 p-8 rounded-2xl flex flex-col shadow-sm">
              <div className="flex gap-1 mb-6 text-flux-yellow">{'★★★★★'.split('').map((s,i)=><span key={i} className="text-2xl">{s}</span>)}</div>
              <p className="text-lg font-medium mb-8 flex-1">"The Gemini AI diagnostics are mind-blowing. It read our telemetry and local weather and correctly identified a thermal derating issue before the manufacturer did."</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-flux-sage grayscale"></div>
                <div>
                  <div className="font-anton uppercase tracking-wider">Arjun P.</div>
                  <div className="text-sm text-flux-charcoal/60">Wind Farm Tech</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-flux-yellow py-32 px-6 overflow-hidden flex flex-col items-center text-center">
        {/* Decorative Background Text */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 select-none pointer-events-none overflow-hidden">
          <span className="font-anton text-[20rem] md:text-[30rem] leading-none whitespace-nowrap -rotate-2">FLUX</span>
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="font-anton text-6xl md:text-8xl uppercase leading-[0.9] mb-6">
            Ready to stop guessing?
          </h2>
          <p className="text-xl md:text-2xl font-medium text-flux-charcoal/80 mb-10">
            Join the waitlist today and get 3 months of predictive maintenance free.
          </p>
          
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
