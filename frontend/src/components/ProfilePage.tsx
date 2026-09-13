import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Users, User } from 'lucide-react';

interface TeamMember {
  name: string;
  email: string;
  phone: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (localStorage.getItem('demo_bypass') === 'true') {
        setProfileName('Demo Manager');
        setTeamMembers([
          { name: 'John Doe', email: 'tech1@example.com', phone: '+919876543210' },
          { name: 'Alice Smith', email: 'tech2@example.com', phone: '+919876543211' }
        ]);
        setLoading(false);
        return;
      }

      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setProfileName(data.name || '');
        setTeamMembers(data.team_members || []);
      }
      setLoading(false);
    };
    loadProfile();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    if (localStorage.getItem('demo_bypass') === 'true') {
       alert('Profile saved (Demo Mode)');
       setSaving(false);
       return;
    }
    
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('profiles').upsert({
        id: session.user.id,
        name: profileName,
        team_members: teamMembers
      });
      alert('Profile saved successfully!');
    }
    setSaving(false);
  };

  const addMember = () => {
    setTeamMembers([...teamMembers, { name: '', email: '', phone: '' }]);
  };

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...teamMembers];
    newMembers[index][field] = value;
    setTeamMembers(newMembers);
  };

  const removeMember = (index: number) => {
    const newMembers = [...teamMembers];
    newMembers.splice(index, 1);
    setTeamMembers(newMembers);
  };

  if (loading) {
    return <div className="min-h-screen bg-flux-grid-dark flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-flux-grid-dark bg-[#f8f9fa] flex flex-col">
      <header className="bg-white border-b border-flux-charcoal/10 px-6 py-4 flex justify-between items-center shadow-sm relative z-20">
        <Link to="/dashboard" className="flex items-center gap-2 text-flux-charcoal hover:text-flux-yellow font-bold uppercase tracking-wider text-sm transition-colors">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
        <div className="flex items-baseline gap-4">
          <h1 className="font-anton text-2xl uppercase tracking-wide text-flux-charcoal">
            Team Settings
          </h1>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col gap-8 mt-8">
        
        {}
        <section className="bg-white p-8 border border-flux-charcoal/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-flux-yellow/10 rounded-full blur-3xl pointer-events-none"></div>
          <h2 className="font-anton text-3xl uppercase tracking-wide text-flux-charcoal mb-6 flex items-center gap-3">
            <User className="text-flux-yellow" size={32} /> Manager Profile
          </h2>
          <div className="max-w-md relative z-10">
            <label className="block text-sm font-bold text-flux-charcoal uppercase tracking-wider mb-2">Display Name</label>
            <input 
              type="text" 
              className="w-full bg-[#f8f9fa] border-2 border-flux-charcoal/20 px-4 py-3 text-flux-charcoal focus:outline-none focus:border-flux-charcoal transition-colors font-medium"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. Yash"
            />
          </div>
        </section>

        {}
        <section className="bg-white p-8 border border-flux-charcoal/10 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-end mb-8 relative z-10">
            <h2 className="font-anton text-3xl uppercase tracking-wide text-flux-charcoal flex items-center gap-3">
              <Users className="text-flux-yellow" size={32} /> Technician Roster
            </h2>
            <button 
              onClick={addMember}
              className="px-4 py-2 bg-flux-charcoal text-white hover:bg-flux-dark font-bold uppercase tracking-wider text-sm transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> Add Technician
            </button>
          </div>

          <div className="flex flex-col gap-4 relative z-10">
            {teamMembers.length === 0 ? (
              <div className="text-center py-8 text-flux-charcoal/50 font-medium border-2 border-dashed border-flux-charcoal/10">
                No technicians added yet. Click "Add Technician" to start building your roster.
              </div>
            ) : (
              teamMembers.map((member, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 border border-flux-charcoal/10 bg-[#f8f9fa] relative group">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-flux-charcoal/60 uppercase tracking-wider mb-1">Name</label>
                    <input 
                      type="text" 
                      className="w-full border border-flux-charcoal/20 px-3 py-2 text-sm focus:outline-none focus:border-flux-charcoal"
                      value={member.name}
                      onChange={(e) => updateMember(idx, 'name', e.target.value)}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-flux-charcoal/60 uppercase tracking-wider mb-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full border border-flux-charcoal/20 px-3 py-2 text-sm focus:outline-none focus:border-flux-charcoal"
                      value={member.email}
                      onChange={(e) => updateMember(idx, 'email', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-flux-charcoal/60 uppercase tracking-wider mb-1">WhatsApp</label>
                    <input 
                      type="text" 
                      className="w-full border border-flux-charcoal/20 px-3 py-2 text-sm focus:outline-none focus:border-flux-charcoal"
                      value={member.phone}
                      onChange={(e) => updateMember(idx, 'phone', e.target.value)}
                      placeholder="+919876543210"
                    />
                  </div>
                  <button 
                    onClick={() => removeMember(idx)}
                    className="md:mt-6 p-2 text-rose-500 hover:bg-rose-500/10 transition-colors self-start md:self-auto border border-transparent hover:border-rose-500/20"
                    title="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="flex justify-end pt-4 pb-12">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-anton text-xl uppercase tracking-wide transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Save size={24} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </main>
    </div>
  );
}
