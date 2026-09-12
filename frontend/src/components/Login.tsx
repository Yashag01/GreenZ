import React, { useState } from 'react';
import { supabase } from '../api/supabase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // DEMO BYPASS
    if (email.toLowerCase() === 'demo@gmail.com') {
      localStorage.setItem('demo_bypass', 'true');
      navigate('/dashboard');
      return;
    }

    if (!supabase) {
      setError('Supabase credentials not configured.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!supabase) {
      setError('Supabase credentials not configured.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      if (data.user) {
        // Initialize empty profile
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name: email.split('@')[0],
          team_members: []
        });
      }
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-flux-grid-dark bg-[#f8f9fa] p-4">
      <div className="max-w-md w-full bg-white border border-flux-charcoal/10 p-10 shadow-2xl relative overflow-hidden">
        
        {/* Decorative corner */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-flux-yellow rotate-45 border-b border-flux-charcoal/10"></div>

        <div className="flex justify-center mb-6">
          <h1 className="font-anton text-5xl uppercase tracking-wide text-flux-charcoal">
            Flux<span className="text-flux-yellow">.</span>
          </h1>
        </div>
        
        <p className="text-center text-flux-charcoal/70 mb-8 font-medium">Access the predictive maintenance dashboard</p>
        
        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded font-medium text-sm text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-bold text-flux-charcoal uppercase tracking-wider mb-2">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-[#f8f9fa] border-2 border-flux-charcoal/20 rounded-none px-4 py-3 text-flux-charcoal focus:outline-none focus:border-flux-charcoal transition-colors font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-flux-charcoal uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-[#f8f9fa] border-2 border-flux-charcoal/20 rounded-none px-4 py-3 text-flux-charcoal focus:outline-none focus:border-flux-charcoal transition-colors font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-flux-charcoal hover:bg-flux-dark text-white font-anton text-xl uppercase tracking-wide py-4 rounded-none transition-colors disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
            <button 
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-white border-2 border-flux-charcoal hover:bg-flux-charcoal hover:text-white text-flux-charcoal font-anton text-xl uppercase tracking-wide py-3 rounded-none transition-colors disabled:opacity-50"
            >
              Create Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
