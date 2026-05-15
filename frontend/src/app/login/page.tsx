/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/utils/api';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }
      
      login(data.access_token, data.user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="min-h-screen bg-vdark text-vlight font-sans flex overflow-hidden">
      
      {/* Left Side: Hero Image Section */}
      <div className="relative hidden lg:flex lg:w-1/2 items-end justify-start p-12">
        <div className="absolute inset-0 bg-vdark">
          <img 
            src="https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/fullportrait.png" 
            alt="Jett Tactical Protocol" 
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity grayscale contrast-125 translate-y-12 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-vdark via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-vdark" />
        </div>
        
        <div className="relative z-10 max-w-lg border-l-4 border-vred pl-6 py-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-vred/10 border border-vred text-vred text-xs font-bold uppercase tracking-widest mb-6 font-oswald">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full bg-vred opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 bg-vred"></span>
            </span>
            Network Active
          </div>
          <h2 className="text-6xl font-oswald font-bold text-white mb-4 tracking-tight uppercase">
            Secure The <br/><span className="text-vred">Asset.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8 font-light">
            Gain exclusive access to private real-time tactical bidding rooms. 
          </p>
          <div className="flex gap-6 font-oswald uppercase tracking-widest text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="text-vred" size={16} />
              <span>Verified Access</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="text-vred" size={16} />
              <span>Real-Time Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative bg-vdark">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-vred opacity-5 -skew-x-12 translate-x-32" />
        
        <div className="w-full max-w-md z-10">
          <div className="mb-10 animate-in slide-in-from-bottom-4 fade-in duration-700 text-center sm:text-left border-l-4 border-vred pl-6 py-2">
            <h1 className="text-5xl font-oswald font-bold tracking-tight mb-2 text-white uppercase">
              {isLogin ? 'Authentication' : 'Registration'}
            </h1>
            <p className="text-slate-400 font-light uppercase tracking-widest text-sm">
              {isLogin ? 'Enter Protocol Credentials' : 'Apply For Clearance'}
            </p>
          </div>

          <div className="bg-vdark border border-slate-800 p-8 relative animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-vred" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-vred" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-vred" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-vred" />

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="bg-vred/10 border border-vred/50 text-vred p-3 text-sm font-bold uppercase tracking-wide">
                  {error}
                </div>
              )}
              
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Callsign</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-vred transition-colors rounded-none"
                      placeholder="JETT"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-vred transition-colors rounded-none"
                    placeholder="agent@protocol.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Security Code</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-vred transition-colors rounded-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-vred hover:bg-white text-vdark font-bold font-oswald uppercase tracking-widest py-4 text-lg transition-all flex justify-center items-center gap-2 group transform -skew-x-12 mt-8"
              >
                <span className="block transform skew-x-12 flex items-center gap-2">
                  {isLogin ? 'Initialize' : 'Apply'} 
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
            </form>
          </div>

          <p className="text-center text-slate-500 mt-8 text-sm uppercase tracking-widest font-bold">
            {isLogin ? "No clearance? " : "Already verified? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-vred hover:text-white transition-colors"
            >
              {isLogin ? 'Apply Now' : 'Login'}
            </button>
          </p>
        </div>
      </div>
      
    </div>
  );
}
