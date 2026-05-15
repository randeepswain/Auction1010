import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-vdark text-vlight font-sans overflow-hidden">
      {/* Sharp Background Elements */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-vred opacity-10 -skew-x-12 translate-x-32 z-0" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 border-r-4 border-vred opacity-20 -skew-x-12 -translate-x-16 z-0" />

      <header className="relative z-10 border-b border-white/10 bg-vdark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-vred flex items-center justify-center bg-black shadow-[0_0_15px_rgba(255,70,85,0.4)]">
              <img src="/logo.png" alt="ValoAuction Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-oswald text-3xl tracking-widest uppercase">Valo<span className="text-vred">Auction</span></span>
          </div>
          <nav className="flex items-center gap-6 font-oswald tracking-wider uppercase text-lg">
            <Link href="/login" className="hover:text-vred transition-colors">Login</Link>
            <Link href="/login" className="bg-vred text-vdark font-bold px-8 py-2 transform -skew-x-12 hover:bg-white transition-colors">
              <span className="block transform skew-x-12">Play Now</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 relative z-10 flex items-center max-w-7xl mx-auto px-6 w-full py-20">
        <div className="max-w-2xl">
          <div className="inline-block px-4 py-1 mb-6 border border-vred text-vred font-oswald uppercase tracking-widest text-xl bg-vred/10 backdrop-blur-sm transform -skew-x-12">
            <span className="block transform skew-x-12">Episode 9 // Act 3</span>
          </div>
          <h1 className="text-8xl sm:text-9xl font-oswald font-bold uppercase leading-none tracking-tighter mb-8 drop-shadow-lg">
            Defy The <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vred to-orange-500">Limits</span>
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-xl font-light leading-relaxed">
            Enter the most exclusive underground auction network. Bid on premium tactical gear, secure your loadout, and dominate the arena.
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link href="/login" className="group relative inline-flex items-center justify-center bg-vred text-vdark font-bold py-5 px-10 text-xl font-oswald uppercase tracking-widest transform -skew-x-12 overflow-hidden hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out z-0" />
              <span className="relative z-10 flex items-center gap-2 transform skew-x-12">
                Enter Network <ChevronRight size={24} />
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
