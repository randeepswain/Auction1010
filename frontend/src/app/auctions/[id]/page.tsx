/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, use, useEffect } from 'react';
import { useAuctionSocket } from '@/hooks/useAuctionSocket';
import { Clock, TrendingUp, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/utils/api';

interface Auction {
  id: string;
  title: string;
  starting_bid: number;
  current_highest_bid: number;
  duration_minutes: number;
  max_users: number;
  image_url: string;
  status: string;
}

export default function AuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const { bids, currentPrice, timeLeft, reactions, placeBid, sendReaction } = useAuctionSocket(resolvedParams.id);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [auction, setAuction] = useState<Auction | null>(null);

  // Fetch auction details
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await fetch(getApiUrl('/auctions'));
        const data = await res.json();
        const found = data.find((a: Auction) => a.id === resolvedParams.id);
        if (found) setAuction(found);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAuction();
  }, [resolvedParams.id]);

  // Local timer countdown
  const [localTimeLeft, setLocalTimeLeft] = useState<number>(0);

  // Sync local timer with server timer only when it significantly diverges or initializes
  useEffect(() => {
    if (Math.abs(localTimeLeft - timeLeft) > 2 || localTimeLeft === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalTimeLeft(timeLeft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  useEffect(() => {
    if (localTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setLocalTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [localTimeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isAuctionEnded = localTimeLeft <= 0;

  const startingPrice = auction ? Number(auction.starting_bid) : 5000;
  const displayPrice = currentPrice > 0 ? Number(currentPrice) : startingPrice;

  const handleBid = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    if (!isNaN(amount) && amount > displayPrice && !isAuctionEnded) {
      const userId = user?.sub || `user_${Math.floor(Math.random() * 1000)}`;
      placeBid(amount, userId);
      setBidAmount('');
    }
  };

  if (!auction) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-vdark text-vlight font-sans selection:bg-vred/30">
      <div className="absolute inset-0 bg-vdark z-[-20]" />
      <div className="absolute inset-0 opacity-10 pointer-events-none z-[-10]" style={{ backgroundImage: 'linear-gradient(45deg, #ff4655 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
      
      {/* Floating Reactions Layer */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {reactions.map((r) => (
          <div 
            key={r.id} 
            className="absolute bottom-20 text-4xl animate-[floatUp_3s_ease-out_forwards]"
            style={{ left: `${(r.id.charCodeAt(0) % 40) + 50}%` }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-300px) scale(1.5); opacity: 0; }
        }
      `}} />

      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b-2 border-slate-800 bg-vdark sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-vred transition-colors font-oswald uppercase tracking-widest font-bold">
          <ArrowLeft size={20} /> Abort Mission
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative aspect-[16/9] bg-slate-950 border border-slate-800 overflow-hidden group p-4">
            <div className="absolute inset-0 bg-vdark/30 z-10 pointer-events-none" />
            {/* Red glow behind skin */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-3/4 bg-vred/5 blur-3xl rounded-full" />
            </div>
            <img 
              src={auction.image_url ? (auction.image_url.startsWith('http') ? auction.image_url : getApiUrl(auction.image_url)) : "https://media.valorant-api.com/weaponskins/30388628-42f0-606c-82c0-73ad43de997f/displayicon.png"} 
              alt={auction.title} 
              className="relative z-20 w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,70,85,0.4)] group-hover:scale-105 transition-transform duration-500"
              fetchPriority="high"
            />
            <div className="absolute bottom-6 left-6 z-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-vred/20 text-vred mb-4 font-bold tracking-widest text-xs uppercase border border-vred/50 transform -skew-x-12">
                <span className="block transform skew-x-12 flex items-center gap-2"><ShieldCheck size={14} /> Authenticated Asset</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-oswald font-bold text-white tracking-tighter uppercase drop-shadow-lg">
                {auction.title}
              </h1>
            </div>
          </div>

          <div className="prose prose-invert prose-slate max-w-none p-6 border border-slate-800 bg-slate-900/50">
            <h3 className="text-2xl font-oswald text-vred uppercase tracking-widest mb-4">Intelligence Brief</h3>
            <p className="text-slate-400 leading-relaxed font-light">
              This is a live protocol for <span className="text-white font-bold">{auction.title}</span>. Base valuation starts at <span className="text-white font-bold">₹{Number(auction.starting_bid).toLocaleString('en-IN')}</span>. 
              Maximum capacity restricted to <span className="text-white font-bold">{auction.max_users}</span> agents in this sector.
            </p>
          </div>
        </div>

        {/* Right Column: Live Bidding Module */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-24 bg-slate-900 border border-slate-800 p-8 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-vred opacity-10 transform rotate-45 translate-x-8 -translate-y-8" />
            {/* Live Status */}
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-vred text-vdark font-bold text-xs uppercase tracking-widest transform -skew-x-12">
                <span className="relative flex h-2 w-2 mr-1 block transform skew-x-12">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-white opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 bg-white"></span>
                </span>
                <span className="block transform skew-x-12">Protocol Active</span>
              </div>
              <div className="flex items-center gap-2 text-vred font-bold font-mono text-xl">
                <Clock size={20} /> {formatTime(localTimeLeft)}
              </div>
            </div>

            {/* Price Display */}
            <div className="mb-10 text-center sm:text-left">
              <p className="text-slate-500 text-xs font-bold mb-2 uppercase tracking-widest">Current Bid</p>
              <div className="flex items-baseline justify-center sm:justify-start gap-2">
                <span className="text-7xl font-oswald font-bold text-white tracking-tighter">
                  ₹{displayPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Bidding Form */}
            <form onSubmit={handleBid} className="space-y-6 mb-10">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-bold font-oswald text-xl">
                  ₹
                </div>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={(displayPrice + 100).toString()}
                  disabled={isAuctionEnded}
                  className="w-full bg-slate-950 border border-slate-800 py-4 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-vred transition-colors disabled:opacity-50 font-mono text-xl"
                  min={displayPrice + 1}
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isAuctionEnded}
                className={`w-full font-bold py-5 transition-all flex justify-center items-center gap-2 font-oswald uppercase tracking-widest text-xl transform -skew-x-12 ${isAuctionEnded ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-vred hover:bg-white text-vdark'}`}
              >
                <span className="block transform skew-x-12 flex items-center gap-2"><TrendingUp size={20} /> {isAuctionEnded ? 'Protocol Terminated' : 'Transmit Bid'}</span>
              </button>
              <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-2 font-bold uppercase tracking-widest">
                <AlertCircle size={14} className="text-vred" /> Transmission is final.
              </p>
            </form>

            {/* Bid History */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                Network Activity
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {bids.length === 0 ? (
                  <p className="text-slate-500 text-sm italic text-center py-4 font-oswald uppercase tracking-widest">Awaiting network traffic.</p>
                ) : (
                   bids.map((bid, i) => (
                    <div 
                      key={bid.id || i} 
                      className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 animate-in fade-in slide-in-from-bottom-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-vdark border border-slate-700 overflow-hidden flex items-center justify-center transform -skew-x-12">
                          {bid.userAvatar ? (
                            <img src={bid.userAvatar} alt={bid.userName} className="w-full h-full object-cover transform skew-x-12" />
                          ) : (
                            <div className="text-slate-500 font-bold text-xs uppercase block transform skew-x-12">
                              {(bid.userName || 'A')[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-xs uppercase tracking-widest">{bid.userName || 'Anonymous'}</span>
                          <span className="text-[10px] text-slate-600 uppercase tracking-tighter">ID: {bid.userId.substring(0, 8)}</span>
                        </div>
                      </div>
                      <span className="text-white font-bold font-oswald text-xl">₹{bid.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Reaction Bar */}
            <div className="mt-8 flex justify-center gap-4 border-t border-slate-800 pt-8">
              <button onClick={() => sendReaction('🔥')} className="p-4 bg-slate-950 border border-slate-800 hover:border-vred transition-all hover:scale-110 active:scale-95 text-2xl transform -skew-x-12"><span className="block transform skew-x-12">🔥</span></button>
              <button onClick={() => sendReaction('😲')} className="p-4 bg-slate-950 border border-slate-800 hover:border-vred transition-all hover:scale-110 active:scale-95 text-2xl transform -skew-x-12"><span className="block transform skew-x-12">😲</span></button>
              <button onClick={() => sendReaction('💸')} className="p-4 bg-slate-950 border border-slate-800 hover:border-vred transition-all hover:scale-110 active:scale-95 text-2xl transform -skew-x-12"><span className="block transform skew-x-12">💸</span></button>
              <button onClick={() => sendReaction('👏')} className="p-4 bg-slate-950 border border-slate-800 hover:border-vred transition-all hover:scale-110 active:scale-95 text-2xl transform -skew-x-12"><span className="block transform skew-x-12">👏</span></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
