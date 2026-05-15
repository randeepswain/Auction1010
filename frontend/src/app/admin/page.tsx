/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, LayoutDashboard, Clock, LogOut, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/utils/api';

interface Auction {
  id: string;
  title: string;
  current_highest_bid: number;
  status: string;
  image_url: string;
  end_time: string;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  valorant_agent_icon?: string;
}

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', starting_bid: '', duration_minutes: '', max_users: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [editingAuctionId, setEditingAuctionId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ current_highest_bid: '', end_time: '' });
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'users'>('create');

  async function fetchAuctions() {
    try {
      const res = await fetch(getApiUrl('/auctions'));
      const data = await res.json();
      setAuctions(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch(getApiUrl('/users'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsersList(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (!user) {
      setTimeout(() => {
        if (!localStorage.getItem('token')) router.push('/login');
      }, 500);
    } else {
      if (user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false);
        fetchAuctions();
        fetchUsers();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const handleDeleteAuction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this auction?')) return;
    try {
      const res = await fetch(getApiUrl(`/auctions/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete auction');
      setMessage('Auction successfully deleted!');
      fetchAuctions();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage('Error: ' + err.message);
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(getApiUrl(`/users/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setMessage('User successfully deleted!');
      fetchUsers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage('Error: ' + err.message);
      }
    }
  };

  const handleApproveUser = async (id: string) => {
    try {
      const res = await fetch(getApiUrl(`/users/${id}/approve`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to approve user');
      setMessage('User successfully approved!');
      fetchUsers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage('Error: ' + err.message);
      }
    }
  };

  const handleLaunchAuction = async (id: string) => {
    try {
      const res = await fetch(getApiUrl(`/auctions/${id}/launch`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to launch auction');
      setMessage('Auction successfully launched!');
      fetchAuctions();
    } catch (err: unknown) {
      if (err instanceof Error) setMessage('Error: ' + err.message);
    }
  };

  const handleUpdateAuction = async (id: string) => {
    try {
      const body: Partial<Auction> = {};
      if (editData.current_highest_bid) body.current_highest_bid = Number(editData.current_highest_bid);
      if (editData.end_time) body.end_time = editData.end_time;

      const res = await fetch(getApiUrl(`/auctions/${id}`), {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed to update auction');
      setMessage('Auction successfully updated!');
      setEditingAuctionId(null);
      fetchAuctions();
    } catch (err: unknown) {
      if (err instanceof Error) setMessage('Error: ' + err.message);
    }
  };

  const startEditing = (auction: Auction) => {
    setEditingAuctionId(auction.id);
    setEditData({
      current_highest_bid: auction.current_highest_bid.toString(),
      end_time: new Date(auction.end_time).toISOString().slice(0, 16)
    });
  };

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('starting_bid', formData.starting_bid);
      data.append('duration_minutes', formData.duration_minutes);
      data.append('max_users', formData.max_users);
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await fetch(getApiUrl('/auctions/create'), {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: data
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create auction');
      }
      setMessage('Auction successfully created and is now live!');
      setFormData({ title: '', starting_bid: '', duration_minutes: '', max_users: '' });
      setImageFile(null);
      fetchAuctions();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage('Error: ' + err.message);
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-vdark text-vlight font-sans selection:bg-vred/30">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1622281898517-8e6797a7e1f4?q=80&w=2000&auto=format&fit=crop')] opacity-5 grayscale mix-blend-overlay z-[-10]" />
      
      <header className="border-b-2 border-slate-800 bg-vdark relative z-10">
        <div className="absolute bottom-0 left-0 w-1/4 h-0.5 bg-vred" />
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-vred flex items-center justify-center bg-black shadow-[0_0_15px_rgba(255,70,85,0.4)]">
              <img src="/logo.png" alt="ValoAuction Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-oswald text-2xl font-bold tracking-widest uppercase text-white">Admin<span className="text-vred">Control</span></span>
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-vred hover:text-vdark text-slate-300 font-oswald uppercase tracking-widest font-bold transform -skew-x-12 transition-colors">
            <span className="block transform skew-x-12 flex items-center gap-2"><LogOut size={16} /> Disconnect</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
        
        {/* Sidebar */}
        <div className="md:col-span-3 space-y-4">
          <button onClick={() => setActiveTab('create')} className={`w-full flex items-center justify-between px-6 py-4 font-oswald font-bold uppercase tracking-widest transition-colors transform -skew-x-12 border-l-4 ${activeTab === 'create' ? 'bg-vred/10 text-vred border-vred' : 'bg-slate-900 text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'}`}>
            <span className="block transform skew-x-12 flex items-center gap-3"><Plus size={18}/> New Asset</span>
          </button>
          <button onClick={() => setActiveTab('manage')} className={`w-full flex items-center justify-between px-6 py-4 font-oswald font-bold uppercase tracking-widest transition-colors transform -skew-x-12 border-l-4 ${activeTab === 'manage' ? 'bg-vred/10 text-vred border-vred' : 'bg-slate-900 text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'}`}>
            <span className="block transform skew-x-12 flex items-center gap-3"><LayoutDashboard size={18}/> Registry</span>
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center justify-between px-6 py-4 font-oswald font-bold uppercase tracking-widest transition-colors transform -skew-x-12 border-l-4 ${activeTab === 'users' ? 'bg-vred/10 text-vred border-vred' : 'bg-slate-900 text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'}`}>
            <span className="block transform skew-x-12 flex items-center gap-3"><Users size={18}/> Agents</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="md:col-span-9 space-y-8">
          {message && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500 text-emerald-400 font-bold uppercase tracking-widest text-sm">
              {message}
            </div>
          )}

          {activeTab === 'create' ? (
            <div className="bg-slate-900 border border-slate-800 p-8 relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-vred opacity-10 transform rotate-45 translate-x-8 -translate-y-8" />
              <h2 className="text-4xl font-oswald font-bold mb-8 flex items-center gap-3 uppercase tracking-wider text-white"><Plus className="text-vred"/> Initialize Asset</h2>
              
              <form onSubmit={handleCreateAuction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asset Designation</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-white focus:outline-none focus:border-vred transition-colors" placeholder="e.g. PRIME VANDAL" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Starting Value (₹)</label>
                <input required value={formData.starting_bid} onChange={e => setFormData({...formData, starting_bid: e.target.value})} type="number" min="1" className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-white focus:outline-none focus:border-vred transition-colors" placeholder="1275" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Duration (Minutes)</label>
                <input required value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: e.target.value})} type="number" min="1" className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-white focus:outline-none focus:border-vred transition-colors" placeholder="10" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agent Capacity</label>
                <input required value={formData.max_users} onChange={e => setFormData({...formData, max_users: e.target.value})} type="number" min="2" className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-white focus:outline-none focus:border-vred transition-colors" placeholder="10" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visual Intel (Optional - Auto-fetches from API if empty)</label>
                <input 
                  type="file" 
                  accept="image/jpeg, image/jpg"
                  onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-white focus:outline-none focus:border-vred file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-bold file:uppercase file:tracking-widest file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700" 
                />
              </div>

              <button type="submit" className="md:col-span-2 mt-6 bg-vred hover:bg-white text-vdark font-bold py-4 transition-colors font-oswald uppercase tracking-widest text-lg transform -skew-x-12">
                <span className="block transform skew-x-12">Deploy Asset</span>
              </button>
            </form>
          </div>
          ) : activeTab === 'manage' ? (
            <div className="bg-slate-900 border border-slate-800 p-8 relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-vred opacity-10 transform rotate-45 translate-x-8 -translate-y-8" />
              <h2 className="text-4xl font-oswald font-bold mb-8 flex items-center gap-3 uppercase tracking-wider text-white"><LayoutDashboard className="text-vred"/> Asset Registry</h2>
              <div className="space-y-4">
                {auctions.map(auction => (
                  <div key={auction.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-950 border border-slate-800 gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img src={auction.image_url ? (auction.image_url.startsWith('http') ? auction.image_url : getApiUrl(auction.image_url)) : 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=200'} alt={auction.title} className="w-16 h-16 object-cover" />
                      <div>
                        <h3 className="font-oswald font-bold text-xl uppercase tracking-wider text-white">{auction.title}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest"><span className="text-white">₹{Number(auction.current_highest_bid).toLocaleString('en-IN')}</span> • {auction.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto font-oswald uppercase tracking-widest font-bold">
                      {editingAuctionId === auction.id ? (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500">New Bid (₹)</label>
                            <input 
                              type="number" 
                              value={editData.current_highest_bid} 
                              onChange={e => setEditData({...editData, current_highest_bid: e.target.value})}
                              className="bg-slate-900 border border-slate-700 px-2 py-1 text-white text-sm focus:border-vred outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500">End Time</label>
                            <input 
                              type="datetime-local" 
                              value={editData.end_time} 
                              onChange={e => setEditData({...editData, end_time: e.target.value})}
                              className="bg-slate-900 border border-slate-700 px-2 py-1 text-white text-sm focus:border-vred outline-none"
                            />
                          </div>
                          <div className="flex gap-2 items-end">
                            <button onClick={() => handleUpdateAuction(auction.id)} className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-colors">
                              <Save size={18} />
                            </button>
                            <button onClick={() => setEditingAuctionId(null)} className="p-2 bg-slate-800 text-slate-400 border border-slate-700 hover:bg-vred hover:text-white transition-colors">
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {auction.status === 'active' && (
                            <button onClick={() => startEditing(auction)} className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-colors transform -skew-x-12">
                              <span className="block transform skew-x-12 flex items-center gap-2"><Edit2 size={16}/> Override</span>
                            </button>
                          )}
                          {auction.status === 'upcoming' && (
                            <button onClick={() => handleLaunchAuction(auction.id)} className="px-6 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-colors transform -skew-x-12 w-full sm:w-auto">
                              <span className="block transform skew-x-12">Launch</span>
                            </button>
                          )}
                          <button onClick={() => handleDeleteAuction(auction.id)} className="px-6 py-2 bg-slate-800 text-slate-400 border border-slate-700 hover:bg-vred hover:text-white hover:border-vred transition-colors transform -skew-x-12 w-full sm:w-auto">
                            <span className="block transform skew-x-12">Scrap</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {auctions.length === 0 && <p className="text-slate-500 text-center py-8 font-oswald uppercase tracking-widest">No assets found.</p>}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-8 relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-vred opacity-10 transform rotate-45 translate-x-8 -translate-y-8" />
              <h2 className="text-4xl font-oswald font-bold mb-8 flex items-center gap-3 uppercase tracking-wider text-white"><Users className="text-vred"/> Agent Network</h2>
              <div className="space-y-4">
                {usersList.map(u => (
                  <div key={u.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-950 border border-slate-800 gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      {/* Avatar — shows agent icon if set, otherwise initial */}
                      <div className="w-12 h-12 border-2 border-slate-700 overflow-hidden flex-shrink-0 bg-slate-900 relative">
                        {u.valorant_agent_icon ? (
                          <img src={u.valorant_agent_icon} alt={u.name || u.email} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-oswald text-xl font-bold text-slate-400 uppercase">
                            {(u.name || u.email)[0]}
                          </div>
                        )}
                        {/* Role badge */}
                        {u.role === 'admin' && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-vred" title="Admin" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white uppercase tracking-wider">{u.name || u.email}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{u.email}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Role: {u.role} • Status: <span className={u.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}>{u.status}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto font-oswald uppercase tracking-widest font-bold">
                      {u.status === 'pending' && (
                        <button onClick={() => handleApproveUser(u.id)} className="px-6 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-colors transform -skew-x-12 w-full sm:w-auto">
                          <span className="block transform skew-x-12">Authorize</span>
                        </button>
                      )}
                      <button onClick={() => handleDeleteUser(u.id)} className="px-6 py-2 bg-slate-800 text-slate-400 border border-slate-700 hover:bg-vred hover:text-white hover:border-vred transition-colors transform -skew-x-12 w-full sm:w-auto">
                        <span className="block transform skew-x-12">Revoke</span>
                      </button>
                    </div>
                  </div>
                ))}
                {usersList.length === 0 && <p className="text-slate-500 text-center py-8 font-oswald uppercase tracking-widest">No agents found.</p>}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-6 relative">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Network Agents</div>
              <div className="text-5xl font-oswald font-bold text-white flex items-center gap-4"><Users size={32} className="text-vred"/> {usersList.length}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 relative">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Active Protocol</div>
              <div className="text-5xl font-oswald font-bold text-white flex items-center gap-4"><Clock size={32} className="text-emerald-400"/> {auctions.length}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
