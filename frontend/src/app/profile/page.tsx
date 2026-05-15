/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trophy, User, Calendar, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/utils/api';

// Valorant Agent icon data — square official portrait crops
const VALORANT_AGENTS = [
  { name: 'Jett',      icon: 'https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png' },
  { name: 'Reyna',     icon: 'https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png' },
  { name: 'Phoenix',   icon: 'https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png' },
  { name: 'Sage',      icon: 'https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png' },
  { name: 'Sova',      icon: 'https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/displayicon.png' },
  { name: 'Viper',     icon: 'https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/displayicon.png' },
  { name: 'Cypher',    icon: 'https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/displayicon.png' },
  { name: 'Breach',    icon: 'https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png' },
  { name: 'Omen',      icon: 'https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png' },
  { name: 'Killjoy',   icon: 'https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png' },
  { name: 'Skye',      icon: 'https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/displayicon.png' },
  { name: 'Yoru',      icon: 'https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/displayicon.png' },
  { name: 'Astra',     icon: 'https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/displayicon.png' },
  { name: 'KAY/O',     icon: 'https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/displayicon.png' },
  { name: 'Chamber',   icon: 'https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/displayicon.png' },
  { name: 'Neon',      icon: 'https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/displayicon.png' },
  { name: 'Fade',      icon: 'https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png' },
  { name: 'Harbor',    icon: 'https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/displayicon.png' },
  { name: 'Gekko',     icon: 'https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png' },
  { name: 'Deadlock',  icon: 'https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/displayicon.png' },
  { name: 'Iso',       icon: 'https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/displayicon.png' },
  { name: 'Clove',     icon: 'https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/displayicon.png' },
  { name: 'Vyse',      icon: 'https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/displayicon.png' },
  { name: 'Tejo',      icon: 'https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/displayicon.png' },
  { name: 'Raze',      icon: 'https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png' },
  { name: 'Brimstone', icon: 'https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/displayicon.png' },
];

export default function ProfilePage() {
  const { user, token, refreshUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [selectedAgent, setSelectedAgent] = useState(user?.valorant_agent_icon || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Populate form from context
  const populate = useCallback((u: typeof user) => {
    if (!u) return;
    setName(u.name || '');
    setAge(u.age ? String(u.age) : '');
    setSelectedAgent(u.valorant_agent_icon || '');
  }, []);

  useEffect(() => {
    if (!user && !localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    // Only populate if local state is empty and user is available
    if (user && !name && !age && !selectedAgent) {
      const timer = setTimeout(() => populate(user), 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, populate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch(getApiUrl('/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim() || undefined,
          age: age ? parseInt(age) : undefined,
          valorant_agent_icon: selectedAgent || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.name || user?.email || 'Agent';
  const initials = displayName[0].toUpperCase();

  return (
    <div className="min-h-screen bg-vdark text-vlight font-sans selection:bg-vred/30 pb-20 relative">
      {/* Tactical background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#ff4655 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-vred/5 -skew-x-12 translate-x-20 z-0 pointer-events-none" />

      {/* Header */}
      <header className="border-b-2 border-slate-800 bg-vdark sticky top-0 z-40 relative">
        <div className="absolute bottom-0 left-0 w-1/4 h-0.5 bg-vred" />
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-vred flex items-center justify-center bg-black shadow-[0_0_15px_rgba(255,70,85,0.4)]">
              <img src="/logo.png" alt="ValoAuction Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-oswald text-2xl tracking-widest uppercase">Valo<span className="text-vred">Auction</span></span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-oswald uppercase tracking-widest font-bold transform -skew-x-12 transition-colors text-sm"
          >
            <span className="block transform skew-x-12 flex items-center gap-2"><ArrowLeft size={16} /> Back</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-10">

        {/* Profile Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">

          {/* Agent Portrait */}
          <div className="md:col-span-1 flex flex-col items-center gap-4">
            <div className="relative">
              {/* Decorative corner ticks */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-vred z-10" />
              <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-vred z-10" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-vred z-10" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-vred z-10" />
              <div className="w-44 h-44 border-2 border-slate-700 overflow-hidden bg-slate-900 shadow-[0_0_30px_rgba(255,70,85,0.3)]">
                {selectedAgent ? (
                  <img src={selectedAgent} alt="Agent" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                    <span className="font-oswald text-7xl font-bold text-slate-600">{initials}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="font-oswald text-2xl font-bold uppercase tracking-wider text-white">{user?.name || 'Unknown Agent'}</div>
              <div className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">{user?.email}</div>
            </div>
          </div>

          {/* Stats */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 content-start">
            <div className="bg-slate-900 border border-slate-800 p-6 relative overflow-hidden group hover:border-vred transition-colors">
              <div className="absolute top-0 right-0 w-12 h-12 bg-vred opacity-10 rotate-45 translate-x-6 -translate-y-6" />
              <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                <User size={14} className="text-vred" /> Name
              </div>
              <div className="text-2xl font-oswald font-bold text-white truncate">{user?.name || '—'}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 relative overflow-hidden group hover:border-emerald-500 transition-colors">
              <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500 opacity-10 rotate-45 translate-x-6 -translate-y-6" />
              <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                <Calendar size={14} className="text-emerald-500" /> Age
              </div>
              <div className="text-2xl font-oswald font-bold text-white">{user?.age ?? '—'}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 relative overflow-hidden group hover:border-yellow-500 transition-colors">
              <div className="absolute top-0 right-0 w-12 h-12 bg-yellow-500 opacity-10 rotate-45 translate-x-6 -translate-y-6" />
              <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                <Trophy size={14} className="text-yellow-500" /> Bids Won
              </div>
              <div className="text-2xl font-oswald font-bold text-white">{user?.bids_won ?? 0}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 relative overflow-hidden group hover:border-indigo-500 transition-colors">
              <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500 opacity-10 rotate-45 translate-x-6 -translate-y-6" />
              <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                <Shield size={14} className="text-indigo-400" /> Total Spent
              </div>
              <div className="text-2xl font-oswald font-bold text-white">₹{Number(user?.total_spend ?? 0).toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 relative overflow-hidden hover:border-slate-500 transition-colors">
              <div className="absolute top-0 right-0 w-12 h-12 bg-slate-500 opacity-10 rotate-45 translate-x-6 -translate-y-6" />
              <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                <Shield size={14} className="text-slate-400" /> Role
              </div>
              <div className="text-xl font-oswald font-bold text-white uppercase">{user?.role || 'User'}</div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-8">

          {/* Personal Info */}
          <div className="bg-slate-900 border border-slate-800 p-8 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-vred opacity-10 rotate-45 translate-x-8 -translate-y-8" />
            <h2 className="text-2xl font-oswald font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-3">
              <User className="text-vred" size={22} /> Personal Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Callsign (Name)</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-white focus:outline-none focus:border-vred transition-colors font-light"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Age</label>
                <input
                  type="number"
                  min={13}
                  max={120}
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-white focus:outline-none focus:border-vred transition-colors font-light"
                  placeholder="Your age"
                />
              </div>
            </div>
          </div>

          {/* Agent Icon Picker */}
          <div className="bg-slate-900 border border-slate-800 p-8 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500 opacity-10 rotate-45 translate-x-8 -translate-y-8" />
            <h2 className="text-2xl font-oswald font-bold uppercase tracking-widest text-white mb-2 flex items-center gap-3">
              <Shield className="text-indigo-400" size={22} /> Choose Your Agent
            </h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Select your operative identity</p>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {VALORANT_AGENTS.map((agent) => (
                <button
                  type="button"
                  key={agent.name}
                  onClick={() => setSelectedAgent(agent.icon)}
                  title={agent.name}
                  className={`group relative aspect-square overflow-hidden border-2 transition-all duration-150 focus:outline-none
                    ${selectedAgent === agent.icon
                      ? 'border-vred shadow-[0_0_14px_rgba(255,70,85,0.5)] scale-105'
                      : 'border-slate-800 hover:border-slate-500 hover:scale-105'
                    }`}
                >
                  <img
                    src={agent.icon}
                    alt={agent.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${agent.name}&background=1a1a2e&color=ff4655&bold=true&size=128`;
                    }}
                  />
                  {/* Selected overlay */}
                  {selectedAgent === agent.icon && (
                    <div className="absolute inset-0 bg-vred/20 flex items-end justify-end p-1">
                      <CheckCircle size={14} className="text-vred" />
                    </div>
                  )}
                  {/* Name tooltip on hover */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-[9px] font-bold uppercase tracking-wider py-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {agent.name}
                  </div>
                </button>
              ))}
            </div>

            {selectedAgent && (
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 border-2 border-vred overflow-hidden">
                  <img src={selectedAgent} alt="Selected Agent" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Selected Agent</div>
                  <div className="text-white font-oswald font-bold uppercase">
                    {VALORANT_AGENTS.find(a => a.icon === selectedAgent)?.name || 'Unknown'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAgent('')}
                  className="ml-auto text-xs text-slate-600 hover:text-vred transition-colors uppercase tracking-widest font-bold"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Save button + status */}
          <div className="flex items-center gap-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-vred hover:bg-white text-vdark font-bold py-4 px-12 transition-colors font-oswald uppercase tracking-widest text-lg transform -skew-x-12 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="block transform skew-x-12 flex items-center gap-2">
                <Save size={20} /> {saving ? 'Saving...' : 'Save Profile'}
              </span>
            </button>
            {saved && (
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-sm animate-pulse">
                <CheckCircle size={18} /> Profile Updated!
              </div>
            )}
            {error && (
              <div className="text-vred font-bold uppercase tracking-widest text-sm">{error}</div>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
