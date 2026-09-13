import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Play } from 'lucide-react';

export default function AboutPage() {

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
          <Link to="/how-it-works" className="hover:text-flux-yellow transition-colors">How it Works</Link>
          <Link to="/about" className="text-flux-yellow transition-colors">About Project</Link>
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
          Built for the <br/>
          <span className="text-flux-yellow">Hackathon</span>
        </h1>
        <p className="text-xl text-flux-charcoal/70 font-medium max-w-2xl mx-auto">
          GreenZ aims to disrupt the renewable energy O&M sector by aligning engineering telemetry directly with business outcomes.
        </p>
      </section>

      {/* Tech Stack & Vision */}
      <section className="py-12 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* What's Built */}
          <div className="bg-white border border-flux-charcoal/10 p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="font-anton text-3xl uppercase mb-6 flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" /> What's Built
            </h3>
            <div className="flex flex-col gap-6 relative">
              
              {/* Vertical connection line */}
              <div className="absolute left-3 top-4 bottom-4 w-px bg-emerald-500/30"></div>

              <div className="flex items-start gap-6 relative z-10">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-emerald-500 mt-1 shrink-0 flex items-center justify-center text-[10px] font-bold text-emerald-500 shadow-sm">1</div>
                <div>
                  <h4 className="text-flux-charcoal mb-1 font-anton uppercase text-xl">FastAPI Python Backend</h4>
                  <p className="text-sm text-flux-charcoal/70 leading-relaxed">A robust data pipeline that simulates real-time edge streaming, calculates physics baselines, and runs mock ML classifications.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 relative z-10">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-emerald-500 mt-1 shrink-0 flex items-center justify-center text-[10px] font-bold text-emerald-500 shadow-sm">2</div>
                <div>
                  <h4 className="text-flux-charcoal mb-1 font-anton uppercase text-xl">React + Vite Dashboard</h4>
                  <p className="text-sm text-flux-charcoal/70 leading-relaxed">A highly responsive frontend that handles real-time Server-Sent Events (SSE) and complex state management.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 relative z-10">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-emerald-500 mt-1 shrink-0 flex items-center justify-center text-[10px] font-bold text-emerald-500 shadow-sm">3</div>
                <div>
                  <h4 className="text-flux-charcoal mb-1 font-anton uppercase text-xl">Robust CSV Processing</h4>
                  <p className="text-sm text-flux-charcoal/70 leading-relaxed">The engine gracefully handles batched historical data uploads, complete with duplicate detection and error handling.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Future Roadmap */}
          <div className="bg-white border border-flux-charcoal/10 p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="font-anton text-3xl uppercase mb-6 flex items-center gap-3">
              <Play className="text-amber-500" /> Future Roadmap
            </h3>
            <div className="flex flex-col gap-6 relative">
              
              {/* Vertical connection line */}
              <div className="absolute left-3 top-4 bottom-4 w-px bg-amber-500/30"></div>

              <div className="flex items-start gap-6 relative z-10">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-amber-500 mt-1 shrink-0 flex items-center justify-center text-[10px] font-bold text-amber-500 shadow-sm">1</div>
                <div>
                  <h4 className="text-flux-charcoal mb-1 font-anton uppercase text-xl">Actual ML Model</h4>
                  <p className="text-sm text-flux-charcoal/70 leading-relaxed">Replacing the mock classifiers with actual scikit-learn or TensorFlow models trained on open-source SCADA datasets.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 relative z-10">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-amber-500 mt-1 shrink-0 flex items-center justify-center text-[10px] font-bold text-amber-500 shadow-sm">2</div>
                <div>
                  <h4 className="text-flux-charcoal mb-1 font-anton uppercase text-xl">GenAI Tech Chat</h4>
                  <p className="text-sm text-flux-charcoal/70 leading-relaxed">Integrating Gemini to allow technicians to "chat" with their assets and generate automated repair manuals on the fly.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 relative z-10">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-amber-500 mt-1 shrink-0 flex items-center justify-center text-[10px] font-bold text-amber-500 shadow-sm">3</div>
                <div>
                  <h4 className="text-flux-charcoal mb-1 font-anton uppercase text-xl">Mobile Technician App</h4>
                  <p className="text-sm text-flux-charcoal/70 leading-relaxed">A dedicated mobile-first PWA for field workers to acknowledge tickets and scan physical hardware QR codes.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
