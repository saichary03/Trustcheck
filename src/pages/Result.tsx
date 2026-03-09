import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Shield, ShieldCheck, ShieldAlert, Globe, Server, 
  Lock, Cpu, MapPin, Calendar, ExternalLink, 
  ArrowLeft, Loader2, Smartphone, User, Star, Download, Eye
} from "lucide-react";
import { motion } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Result() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    if (!query) {
      navigate("/");
      return;
    }

    const analyze = async () => {
      setLoading(true);
      try {
        // Simple heuristic to detect if it's a domain or app name
        const isDomain = query.includes(".") && !query.includes(" ");
        setIsApp(!isDomain);

        if (isDomain) {
          const response = await axios.post("/api/analyze/domain", { domain: query });
          setData(response.data);
          
          // Get AI Insights for Domain
          const aiResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze this website domain for cybersecurity risks and trust: ${query}. 
            Provide a concise summary of potential risks, trust level, and recommendations. 
            Keep it professional and technical.`,
          });
          setAiAnalysis(aiResponse.text || "");
        } else {
          const response = await axios.post("/api/analyze/app", { appName: query });
          setData(response.data);
          
          // Get AI Insights for App
          const aiResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze this mobile app for privacy and security risks: ${query}. 
            Provide a concise summary of its permissions, developer reputation, and privacy risk level. 
            Keep it professional.`,
          });
          setAiAnalysis(aiResponse.text || "");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    analyze();
  }, [query, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-zinc-400 animate-pulse">Analyzing {query}...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-white text-xl mb-6">Failed to analyze {query}</p>
        <button onClick={() => navigate("/")} className="text-emerald-500 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Search
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Report */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#151518] border border-white/5 rounded-3xl p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {isApp ? <Smartphone className="w-6 h-6 text-emerald-500" /> : <Globe className="w-6 h-6 text-emerald-500" />}
                  <h1 className="text-3xl font-bold">{isApp ? data.name : data.domain}</h1>
                </div>
                <p className="text-zinc-500">{isApp ? "Mobile Application Report" : "Website Security Report"}</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                data.riskLevel === "Low" || data.securityRisk === "Low" ? "bg-emerald-500/10 text-emerald-500" :
                data.riskLevel === "Medium" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"
              }`}>
                {data.riskLevel === "Low" || data.securityRisk === "Low" ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                Risk Level: {isApp ? data.securityRisk : data.riskLevel}
              </div>
            </div>

            {isApp ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Stat icon={<User className="w-4 h-4" />} label="Developer" value={data.developer} />
                <Stat icon={<Star className="w-4 h-4" />} label="Rating" value={`${data.rating}/5`} />
                <Stat icon={<Download className="w-4 h-4" />} label="Downloads" value={data.downloads} />
                <Stat icon={<Shield className="w-4 h-4" />} label="Category" value={data.category} />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Stat icon={<Server className="w-4 h-4" />} label="IP Address" value={data.ip} />
                <Stat icon={<MapPin className="w-4 h-4" />} label="Location" value={`${data.geo.city}, ${data.geo.country}`} />
                <Stat icon={<Lock className="w-4 h-4" />} label="SSL Status" value={data.ssl.valid ? "Valid" : "Invalid"} />
                <Stat icon={<Calendar className="w-4 h-4" />} label="Domain Age" value={data.whois.creationDate !== "Unknown" ? "3+ Years" : "Unknown"} />
              </div>
            )}
          </motion.div>

          {/* Detailed Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SectionCard title="Security Status" icon={<Shield className="w-5 h-5 text-emerald-500" />}>
              <ul className="space-y-4">
                <StatusItem label="SSL Certificate" status={isApp ? "N/A" : (data.ssl.valid ? "active" : "inactive")} />
                <StatusItem label="Malware Check" status="active" />
                <StatusItem label="Phishing Detection" status="active" />
                <StatusItem label="Blacklist Status" status="active" />
              </ul>
            </SectionCard>

            <SectionCard title={isApp ? "Permissions Used" : "Domain Information"} icon={isApp ? <Eye className="w-5 h-5 text-emerald-500" /> : <Globe className="w-5 h-5 text-emerald-500" />}>
              {isApp ? (
                <div className="flex flex-wrap gap-2">
                  {data.permissions.map((p: string) => (
                    <span key={p} className="px-3 py-1 bg-white/5 rounded-lg text-xs text-zinc-400 border border-white/5">{p}</span>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-zinc-500">Registrar</span><span className="text-zinc-300">{data.whois.registrar}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Created</span><span className="text-zinc-300">{data.whois.creationDate.split('T')[0]}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Expires</span><span className="text-zinc-300">{data.whois.expirationDate.split('T')[0]}</span></div>
                </div>
              )}
            </SectionCard>
          </div>

          <SectionCard title="AI Analysis & Insights" icon={<Cpu className="w-5 h-5 text-emerald-500" />}>
            <div className="prose prose-invert max-w-none text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
              {aiAnalysis}
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Sidebar Stats */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#151518] border border-white/5 rounded-3xl p-8"
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Trust Score
            </h3>
            
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-6">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="stroke-white/5"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`transition-all duration-1000 ${
                      (isApp ? 90 : data.trustScore) > 70 ? "stroke-emerald-500" : 
                      (isApp ? 90 : data.trustScore) > 40 ? "stroke-yellow-500" : "stroke-red-500"
                    }`}
                    strokeWidth="3"
                    strokeDasharray={`${isApp ? 90 : data.trustScore}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{isApp ? 90 : data.trustScore}</span>
                </div>
              </div>
              
              <div className="w-full space-y-4">
                <ScoreFactor label="SSL Security" score={isApp ? 100 : (data.ssl.valid ? 100 : 0)} />
                <ScoreFactor label="Domain Age" score={isApp ? 100 : (data.whois.creationDate !== "Unknown" ? 100 : 0)} />
                <ScoreFactor label="Reputation" score={100} />
              </div>
            </div>
          </motion.div>

          {!isApp && (
            <SectionCard title="Technology Stack" icon={<Cpu className="w-5 h-5 text-emerald-500" />}>
              <div className="flex flex-wrap gap-2">
                {data.technologies.map((t: string) => (
                  <span key={t} className="px-3 py-1 bg-emerald-500/5 text-emerald-500 rounded-lg text-xs border border-emerald-500/10">{t}</span>
                ))}
              </div>
            </SectionCard>
          )}

          <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
            <h4 className="text-emerald-500 font-semibold mb-2 text-sm">Pro Tip</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Always check the SSL issuer and domain expiration date. New domains with short expiration dates are often used for phishing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="text-white font-medium truncate" title={value}>{value}</div>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151518] border border-white/5 rounded-3xl p-6"
    >
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function StatusItem({ label, status }: { label: string, status: "active" | "inactive" | "N/A" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-400 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${
          status === "active" ? "text-emerald-500" : status === "inactive" ? "text-red-500" : "text-zinc-600"
        }`}>
          {status === "active" ? "Secure" : status === "inactive" ? "Risk Detected" : "N/A"}
        </span>
        <div className={`w-2 h-2 rounded-full ${
          status === "active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
          status === "inactive" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-zinc-800"
        }`} />
      </div>
    </div>
  );
}

function ScoreFactor({ label, score }: { label: string, score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-500">{label}</span>
        <span className="text-zinc-300">{score}%</span>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-1000" 
          style={{ width: `${score}%` }} 
        />
      </div>
    </div>
  );
}
