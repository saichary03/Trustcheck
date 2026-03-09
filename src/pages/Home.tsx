import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Shield, Lock, Globe, Smartphone, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/result?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center max-w-3xl w-full"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Shield className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            WebTrust <span className="text-emerald-500">Analyzer</span>
          </h1>
        </div>
        
        <p className="text-zinc-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
          Comprehensive cybersecurity and trust analysis for websites and mobile apps.
          Search any domain or app name to get a detailed security report.
        </p>

        <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative flex items-center bg-[#151518] border border-white/10 rounded-2xl overflow-hidden p-2">
            <div className="pl-4">
              <Search className="w-6 h-6 text-zinc-500" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter website domain or app name..."
              className="w-full bg-transparent border-none focus:ring-0 text-white px-4 py-3 text-lg placeholder:text-zinc-600 outline-none"
            />
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
            >
              Analyze <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <FeatureCard 
            icon={<Globe className="w-6 h-6" />}
            title="Domain Analysis"
            desc="Whois lookup, SSL status, IP geolocation, and hosting info."
          />
          <FeatureCard 
            icon={<Lock className="w-6 h-6" />}
            title="Security Check"
            desc="Malware detection, phishing risk, and blacklist status."
          />
          <FeatureCard 
            icon={<Smartphone className="w-6 h-6" />}
            title="App Insights"
            desc="Developer info, permissions used, and privacy risk analysis."
          />
        </div>
      </motion.div>
      
      <footer className="absolute bottom-8 text-zinc-600 text-sm">
        © 2026 WebTrust Analyzer • Professional Cybersecurity Tool
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 bg-[#151518] border border-white/5 rounded-2xl text-left hover:border-emerald-500/30 transition-colors">
      <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-4">
        {icon}
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
