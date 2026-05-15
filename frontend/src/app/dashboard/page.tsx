/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, TrendingUp, History, Activity, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl, getImagePath } from '@/utils/api';

interface Auction {
  id: string;
  title: string;
  starting_bid: number;
  current_highest_bid: number;
  duration_minutes: number;
  max_users: number;
  image_url: string;
  status: string;
  end_time: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'past'>('live');
  const { user, token, logout, refreshUser } = useAuth();
  const [liveAuctions, setLiveAuctions] = useState<Auction[]>([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState<Auction[]>([]);
  const [pastBids, setPastBids] = useState<{id:string;title:string;finalPrice:number;date:string;status:string;image:string}[]>([]);

  // Computed stats from real data
  const activeBidsCount = pastBids.filter(b => b.status === 'Highest Bidder').length;
  const acquiredCount = user?.bids_won ?? pastBids.filter(b => b.status === 'Won').length;
  const totalSpend = Number(user?.total_spend ?? pastBids.reduce((sum, b) => sum + (b.status === 'Won' ? Number(b.finalPrice) : 0), 0));

  useEffect(() => {
    refreshUser();
    const fetchAuctions = async () => {
      try {
        const res = await fetch(getApiUrl('/auctions'));
        const data = await res.json();
        setLiveAuctions(data.filter((a: Auction) => a.status === 'active'));
        setUpcomingAuctions(data.filter((a: Auction) => a.status === 'upcoming'));
      } catch (err) {
        console.error(err);
      }
    };
    
    const fetchPastBids = async () => {
      if (!token) return;
      try {
        const res = await fetch(getApiUrl('/bids/my-bids'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setPastBids(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAuctions();
    fetchPastBids();
  }, [token, refreshUser]);

  const featuredAuctions = [...liveAuctions, ...upcomingAuctions].slice(0, 3);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (featuredAuctions.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredAuctions.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [featuredAuctions.length]);



  return (
    <div className="min-h-screen bg-vdark text-vlight font-sans selection:bg-vred/30 pb-20">
      {/* Sharp tactical background */}
      <div className="absolute inset-0 bg-vdark z-[-20]" />
      <div className="absolute inset-0 opacity-20 pointer-events-none z-[-10]" style={{ backgroundImage: 'radial-gradient(#ff4655 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Header */}
      <header className="border-b-2 border-slate-800 bg-vdark sticky top-0 z-40 relative">
        <div className="absolute bottom-0 left-0 w-1/4 h-0.5 bg-vred" />
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-vred flex items-center justify-center bg-black shadow-[0_0_15px_rgba(255,70,85,0.4)]">
              <img src="/logo.png" alt="ValoAuction Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-oswald text-3xl tracking-widest uppercase">Valo<span className="text-vred">Auction</span></span>
          </div>
          <div className="flex items-center gap-6 font-oswald uppercase tracking-widest text-sm">
            {user?.role === 'admin' && (
              <Link href="/admin" className="hidden sm:flex items-center gap-2 px-4 py-2 border border-vred text-vred hover:bg-vred hover:text-vdark transition-colors transform -skew-x-12">
                <span className="block transform skew-x-12">Admin Panel</span>
              </Link>
            )}
            {/* Clickable profile icon */}
            <Link href="/profile" title="My Profile" className="group relative flex-shrink-0">
              <div className="w-10 h-10 border-2 border-vred overflow-hidden bg-slate-900 group-hover:border-white transition-colors shadow-[0_0_10px_rgba(255,70,85,0.3)] group-hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]">
                {user?.valorant_agent_icon ? (
                  <img src={user.valorant_agent_icon} alt="Agent" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 font-oswald text-lg font-bold">
                    {(user?.name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border border-vdark" />
            </Link>
            <button onClick={logout} className="p-2 text-slate-400 hover:text-vred transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Carousel */}
      {featuredAuctions.length > 0 && (
        <div className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden group bg-vdark border-b border-slate-800">
          {featuredAuctions.map((auction, idx) => (
            <div 
              key={auction.id} 
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              {/* Minimal bottom gradient — keeps text readable but image stays bright */}
              <div className="absolute inset-0 bg-gradient-to-t from-vdark/80 via-transparent to-transparent z-10" />
              {/* Skin image centered with contain so full weapon is visible */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <img 
                  src={auction.image_url ? (auction.image_url.startsWith('http') ? auction.image_url : getApiUrl(auction.image_url)) : 'https://media.valorant-api.com/weaponskins/30388628-42f0-606c-82c0-73ad43de997f/displayicon.png'} 
                  alt={auction.title} 
                  className="max-w-full max-h-full object-contain drop-shadow-[0_0_40px_rgba(255,70,85,0.3)] transition-transform duration-[8000ms] group-hover:scale-110"
                  fetchPriority="high"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 z-20 p-5 sm:p-8 max-w-7xl mx-auto">
                <div className="inline-block px-3 py-0.5 mb-2 border border-vred text-vred font-oswald uppercase tracking-widest text-xs bg-vred/10 transform -skew-x-12">
                  <span className="block transform skew-x-12">{auction.status === 'active' ? 'Live Auction' : 'Upcoming Drop'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-oswald font-bold text-white mb-1 tracking-tight uppercase drop-shadow-xl">
                  {auction.title}
                </h2>
                <p className="text-sm text-slate-300 mb-4 font-light">
                  Starting at <span className="font-bold text-white">₹{Number(auction.starting_bid).toLocaleString('en-IN')}</span> &nbsp;·&nbsp; {auction.max_users} agents max
                </p>
                {auction.status === 'active' ? (
                  <Link href={`/auctions/${auction.id}`} className="inline-flex items-center gap-2 bg-vred hover:bg-white text-vdark font-bold py-2.5 px-6 transform -skew-x-12 transition-colors">
                    <span className="block transform skew-x-12 font-oswald tracking-widest uppercase flex items-center gap-2 text-sm">Enter Room <ChevronRight size={16} /></span>
                  </Link>
                ) : (
                  <button disabled className="inline-flex items-center gap-2 bg-slate-800 text-slate-500 font-bold py-2.5 px-6 transform -skew-x-12 cursor-not-allowed">
                    <span className="block transform skew-x-12 font-oswald tracking-widest uppercase flex items-center gap-2 text-sm">Locked <Clock size={16} /></span>
                  </button>
                )}
              </div>
            </div>
          ))}
          {/* Carousel Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {featuredAuctions.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-12 h-1.5 transition-all transform -skew-x-12 ${idx === currentSlide ? 'bg-vred' : 'bg-slate-700 hover:bg-slate-500'}`}
              />
            ))}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 pt-12">

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900 border border-slate-800 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-vred opacity-10 group-hover:opacity-20 transition-opacity transform rotate-45 translate-x-8 -translate-y-8" />
            <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2"><Activity size={16} className="text-vred"/> Active Bids</div>
            <div className="text-5xl font-oswald font-bold text-white">{activeBidsCount}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-45 translate-x-8 -translate-y-8" />
            <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp size={16} className="text-emerald-500"/> Acquired</div>
            <div className="text-5xl font-oswald font-bold text-white">{acquiredCount}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-45 translate-x-8 -translate-y-8" />
            <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2"><History size={16} className="text-indigo-500"/> Total Spend</div>
            <div className="text-5xl font-oswald font-bold text-white">₹{totalSpend.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-slate-800 mb-8 font-oswald uppercase tracking-widest text-xl">
          <button 
            onClick={() => setActiveTab('live')}
            className={`pb-4 transition-colors relative ${activeTab === 'live' ? 'text-white' : 'text-slate-600 hover:text-slate-300'}`}
          >
            Live Protocol
            {activeTab === 'live' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-vred" />}
          </button>
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`pb-4 transition-colors relative ${activeTab === 'upcoming' ? 'text-white' : 'text-slate-600 hover:text-slate-300'}`}
          >
            Upcoming Drops
            {activeTab === 'upcoming' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-vred" />}
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            className={`pb-4 transition-colors relative ${activeTab === 'past' ? 'text-white' : 'text-slate-600 hover:text-slate-300'}`}
          >
            Past Acquisitions
            {activeTab === 'past' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-vred" />}
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'live' && liveAuctions.map(auction => (
            <Link href={`/auctions/${auction.id}`} key={auction.id}>
              <div className="group relative bg-slate-900 border border-slate-800 hover:border-vred p-4 flex flex-col sm:flex-row gap-6 items-center transition-all overflow-hidden cursor-pointer">
                {/* Hover Details Overlay */}
                <div className="absolute inset-0 bg-vdark/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-vred font-bold mb-2 uppercase tracking-widest text-xs">Active Room</div>
                  <div className="text-3xl font-oswald font-bold text-white mb-4 uppercase">{auction.title}</div>
                  <div className="px-8 py-2 bg-vred text-vdark font-bold flex items-center gap-2 transform -skew-x-12 uppercase font-oswald tracking-widest">
                    <span className="block transform skew-x-12 flex items-center gap-2">Enter <ChevronRight size={18} /></span>
                  </div>
                </div>

                {/* Skin thumbnail — object-contain so full gun visible */}
                <div className="relative w-full sm:w-44 h-28 border border-slate-800 bg-slate-950 flex items-center justify-center p-2 flex-shrink-0">
                  <img src={getImagePath(auction.image_url)} alt={auction.title} className="max-w-full max-h-full object-contain" loading="eager" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full bg-vred opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 bg-vred"></span>
                    </span>
                    <span className="text-xs font-bold text-vred uppercase tracking-widest">{auction.status}</span>
                  </div>
                  <h3 className="text-2xl font-oswald uppercase tracking-wide font-bold text-white mb-1 group-hover:text-vred transition-colors">{auction.title}</h3>
                  <div className="flex gap-4 text-sm font-light">
                    <span className="text-slate-400">
                      Ends at {new Date(auction.end_time).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Current Bid</div>
                    <div className="text-3xl font-oswald font-bold text-white">₹{Number(auction.current_highest_bid).toLocaleString('en-IN')}</div>
                  </div>
                </div>
                <div className="hidden sm:flex text-slate-700 group-hover:text-vred transition-colors ml-4 border-l border-slate-800 pl-4">
                  <ChevronRight size={32} />
                </div>
              </div>
            </Link>
          ))}
          {activeTab === 'live' && liveAuctions.length === 0 && <p className="text-slate-500 text-center py-12 font-oswald uppercase tracking-widest">No active protocol.</p>}

          {activeTab === 'upcoming' && upcomingAuctions.map(auction => (
            <div key={auction.id} className="group relative bg-slate-900 border border-slate-800 p-4 flex flex-col sm:flex-row gap-6 items-center transition-all overflow-hidden cursor-not-allowed">
              {/* Hover Details Overlay */}
              <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-slate-500 font-bold mb-2 uppercase tracking-widest text-xs">Release Information</div>
                <div className="text-3xl font-oswald font-bold text-white mb-2 uppercase">{auction.title}</div>
                <div className="text-slate-400 mb-4 flex gap-6 font-light uppercase tracking-wide text-sm">
                  <span><span className="text-white font-bold">₹{Number(auction.starting_bid).toLocaleString('en-IN')}</span> Starting</span>
                  <span><span className="text-white font-bold">{auction.max_users}</span> Agents Max</span>
                </div>
                <div className="px-6 py-2 bg-slate-800 text-slate-400 border border-slate-700 font-bold flex items-center gap-2 transform -skew-x-12 uppercase font-oswald tracking-widest">
                  <span className="block transform skew-x-12 flex items-center gap-2">Locked <Clock size={16} /></span>
                </div>
              </div>

              {/* Skin thumbnail — object-contain so full gun visible */}
              <div className="relative w-full sm:w-44 h-28 border border-slate-800 bg-slate-950 flex items-center justify-center p-2 flex-shrink-0">
                <img src={auction.image_url ? (auction.image_url.startsWith('http') ? auction.image_url : getApiUrl(auction.image_url)) : 'https://media.valorant-api.com/weaponskins/30388628-42f0-606c-82c0-73ad43de997f/displayicon.png'} alt={auction.title} className="max-w-full max-h-full object-contain grayscale opacity-60" loading="eager" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{auction.status}</span>
                </div>
                <h3 className="text-2xl font-oswald uppercase tracking-wide font-bold text-white mb-1 group-hover:text-slate-300 transition-colors">{auction.title}</h3>
                <div className="flex gap-4 text-sm font-light">
                  <span className="text-slate-400">
                    Duration: {auction.duration_minutes} minutes
                  </span>
                </div>
              </div>
              <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Starting Price</div>
                  <div className="text-3xl font-oswald font-bold text-slate-400">₹{Number(auction.starting_bid).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          ))}
          {activeTab === 'upcoming' && upcomingAuctions.length === 0 && <p className="text-slate-500 text-center py-12 font-oswald uppercase tracking-widest">No upcoming drops.</p>}

          {activeTab === 'past' && pastBids.map(bid => (
            <div key={bid.id} className="bg-slate-900 border border-slate-800 p-4 flex flex-col sm:flex-row gap-6 items-center opacity-70 hover:opacity-100 transition-opacity">
              <div className="relative w-full sm:w-40 h-28 border border-slate-800 bg-black">
                <img src={bid.image ? (bid.image.startsWith('http') ? bid.image : getApiUrl(bid.image)) : 'https://images.unsplash.com/photo-1622281898517-8e6797a7e1f4?q=80&w=600&auto=format&fit=crop'} alt={bid.title} className="w-full h-full object-cover grayscale" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-oswald uppercase tracking-wide font-bold text-slate-300 mb-1">{bid.title}</h3>
                <div className="text-sm font-light text-slate-500 uppercase tracking-wider">{bid.date}</div>
              </div>
              <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Final Price</div>
                  <div className="text-3xl font-oswald font-bold text-slate-300">₹{bid.finalPrice.toLocaleString('en-IN')}</div>
                </div>
                <div className={`text-xs font-bold uppercase tracking-widest px-3 py-1 border ${bid.status === 'Won' || bid.status === 'Highest Bidder' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                  {bid.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
