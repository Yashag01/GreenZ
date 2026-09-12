import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Play, Loader2, Send } from 'lucide-react';
import clsx from 'clsx';

export default function AboutPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !feedback) return;
    
    setStatus('loading');
    
    // Simulate Supabase network request
    setTimeout(() => {
      setStatus('success');
      setName('');
      setRole('');
      setFeedback('');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="font-satoshi bg-flux-charcoal min-h-screen text-white selection:bg-flux-yellow selection:text-flux-charcoal">
      
      {/* Navbar (Dark Theme) */}
      <nav className="fixed top-0 w-full h-20 bg-flux-charcoal/90 backdrop-blur-md z-50 border-b border-white/10 flex items-center px-6 lg:px-12">
        <div className="flex-1">
          <Link to="/" className="font-anton text-3xl uppercase tracking-wide flex items-baseline hover:opacity-80 transition-opacity">
            <ArrowLeft className="inline mr-3 mb-1" size={24} />
            Green<span className="text-flux-yellow">Z</span>
          </Link>
        </div>
        <div className="hidden md:flex flex-1 justify-center gap-8 font-medium text-sm">
          <Link to="/features" className="hover:text-flux-yellow transition-colors text-white/70 hover:text-white">Features</Link>
          <Link to="/how-it-works" className="hover:text-flux-yellow transition-colors text-white/70 hover:text-white">How it Works</Link>
          <Link to="/about" className="text-flux-yellow transition-colors">About Project</Link>
        </div>
        <div className="flex-1 flex justify-end items-center gap-6">
          <Link to="/login" className="bg-flux-yellow text-flux-charcoal px-6 py-2.5 rounded-full font-medium text-sm hover:bg-white transition-colors">
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
        <p className="text-xl text-flux-sage font-medium max-w-2xl mx-auto">
          GreenZ aims to disrupt the renewable energy O&M sector by aligning engineering telemetry directly with business outcomes.
        </p>
      </section>

      {/* Tech Stack & Vision */}
      <section className="py-12 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* What's Built */}
          <div className="bg-white/5 border border-white/10 p-10 rounded-3xl shadow-xl hover:bg-white/10 transition-colors duration-300">
            <h3 className="font-anton text-3xl uppercase mb-6 flex items-center gap-3">
              <CheckCircle2 className="text-emerald-400" /> What's Built
            </h3>
            <div className="flex flex-col gap-6 relative">
              
              {/* Vertical connection line */}
              <div className="absolute left-3 top-4 bottom-4 w-px bg-emerald-500/30"></div>

              <div className="flex items-start gap-6 relative z-10">
                <div className="w-6 h-6 rounded-full bg-flux-charcoal border-2 border-emerald-400 mt-1 shrink-0 flex items-center justify-center text-[10px] font-bold text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]">1</div>
                <div>
                  <h4 className="text-white mb-1 font-anton uppercase text-xl">FastAPI Python Backend</h4>
                  <p className="text-sm text-flux-sage leading-relaxed">A robust data pipeline that simulates real-time edge streaming, calculates physics baselines, and runs mock ML classifications.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 relative z-10">
                <div className="w-6 h-6 rounded-full bg-flux-charcoal border-2 border-emerald-400 mt-1 shrink-0 flex items-center justify-center text-[10px] font-bold text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]">2</div>
                <div>
                  <h4 className="text-white mb-1 font-anton uppercase text-xl">React + Vite Dashboard</h4>
                  <p className="text-sm text-flux-sage leading-relaxed">A highly responsive frontend that handles real-time Server-Sent Events (SSE) and complex state management.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 relative z-10">
                <div className="w-6 h-6 rounded-full bg-flux-charcoal border-2 border-emerald-400 mt-1 shrink-0 flex items-center justify-center text-[10px] font-bold text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]">3</div>
                <div>
                  <h4 className="text-white mb-1 font-anton uppercase text-xl">Robust CSV Processing</h4>
                  <p className="text-sm text-flux-sage leading-relaxed">The engine gracefully handles batched historical data uploads, complete with duplicate detection and error handling.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Future Roadmap */}
          <div className="bg-white/5 border border-white/10 p-10 rounded-3xl shadow-xl hover:bg-white/10 transition-colors duration-300">
            <h3 className="font-anton text-3xl uppercase mb-6 flex items-center gap-3">
              <Play className="text-amber-400" /> Future Roadmap
            </h3>
            <div className="flex flex-col gap-6 relative">
              
              {/* Vertical connection line */}
              <div className="absolute left-3 top-4 bottom-4 w-px bg-amber-500/30"></div>

              <div className="flex items-start gap-6 relative z-10">
                <div className="w-6 h-6 rounded-full bg-flux-charcoal border-2 border-amber-400 mt-1 shrink-0 flex items-center justify-center text-[10px] font-bold text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]">1</div>
                <div>
                  <h4 className="text-white mb-1 font-anton uppercase text-xl">Actual ML Model</h4>
                  <p className="text-sm text-flux-sage leading-relaxed">Replacing the mock classifiers with actual scikit-learn or TensorFlow models trained on open-source SCADA datasets.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 relative z-10">
                <div className="w-6 h-6 rounded-full bg-flux-charcoal border-2 border-amber-400 mt-1 shrink-0 flex items-center justify-center text-[10px] font-bold text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]">2</div>
                <div>
                  <h4 className="text-white mb-1 font-anton uppercase text-xl">GenAI Tech Chat</h4>
                  <p className="text-sm text-flux-sage leading-relaxed">Integrating Gemini to allow technicians to "chat" with their assets and generate automated repair manuals on the fly.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 relative z-10">
                <div className="w-6 h-6 rounded-full bg-flux-charcoal border-2 border-amber-400 mt-1 shrink-0 flex items-center justify-center text-[10px] font-bold text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]">3</div>
                <div>
                  <h4 className="text-white mb-1 font-anton uppercase text-xl">Mobile Technician App</h4>
                  <p className="text-sm text-flux-sage leading-relaxed">A dedicated mobile-first PWA for field workers to acknowledge tickets and scan physical hardware QR codes.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Mock Feedback Form */}
      <section className="py-24 px-6 lg:px-12 max-w-3xl mx-auto">
        <div className="bg-flux-dark border border-white/10 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
           
           {/* Background glow */}
           <div className="absolute -top-32 -right-32 w-64 h-64 bg-flux-yellow/20 blur-[100px] rounded-full pointer-events-none"></div>

           <div className="relative z-10">
             <h2 className="font-anton text-4xl uppercase mb-2">Leave a Review</h2>
             <p className="text-flux-sage font-medium mb-8">What do you think about the GreenZ hackathon project? (Mock submission)</p>

             <form onSubmit={handleSubmit} className="flex flex-col gap-5">
               
               <div className="flex flex-col sm:flex-row gap-5">
                 <div className="flex-1">
                   <label className="block text-sm font-bold uppercase tracking-wider text-white/50 mb-2">Name</label>
                   <input 
                     type="text" 
                     required
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-flux-yellow transition-colors font-medium"
                     placeholder="John Doe"
                     disabled={status !== 'idle'}
                   />
                 </div>
                 <div className="flex-1">
                   <label className="block text-sm font-bold uppercase tracking-wider text-white/50 mb-2">Role (Optional)</label>
                   <input 
                     type="text" 
                     value={role}
                     onChange={(e) => setRole(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-flux-yellow transition-colors font-medium"
                     placeholder="Judge / Investor / Dev"
                     disabled={status !== 'idle'}
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-bold uppercase tracking-wider text-white/50 mb-2">Feedback</label>
                 <textarea 
                   required
                   rows={4}
                   value={feedback}
                   onChange={(e) => setFeedback(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-flux-yellow transition-colors font-medium resize-none"
                   placeholder="This project is amazing..."
                   disabled={status !== 'idle'}
                 ></textarea>
               </div>

               <div className="mt-4 flex items-center justify-between">
                 <div className="text-xs font-mono text-white/30 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   Supabase DB connection active
                 </div>
                 
                 <button 
                   type="submit"
                   disabled={status !== 'idle'}
                   className={clsx(
                     "font-anton text-lg px-8 py-3 rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300",
                     status === 'idle' ? "bg-flux-yellow text-flux-charcoal hover:bg-white" : 
                     status === 'loading' ? "bg-white/10 text-white/50 cursor-not-allowed" : 
                     "bg-emerald-500 text-white"
                   )}
                 >
                   {status === 'idle' && <><Send size={18} /> Submit Review</>}
                   {status === 'loading' && <><Loader2 size={18} className="animate-spin" /> Saving...</>}
                   {status === 'success' && <><CheckCircle2 size={18} /> Saved successfully!</>}
                 </button>
               </div>

             </form>
           </div>
        </div>
      </section>

    </div>
  );
}
