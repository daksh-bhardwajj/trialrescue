/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Check, 
  Zap, 
  Mail, 
  Code2, 
  BarChart3, 
  ShieldCheck, 
  ChevronDown, 
  Timer,
  TrendingUp,
  Globe,
  Activity,
  LayoutDashboard,
  Layers,
  Settings,
  Users,
  Menu,
  X,
  Sparkles,
  Lock
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

// --- Hooks ---

function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Mouse position hook for spotlight effects
function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  return mousePosition;
}

// --- UI Primitives ---

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 ease-[cubic-bezier(0.21,0.45,0.15,1.00)] transform ${isVisible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-12 blur-sm"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionBadge({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)]">
      <span className="flex h-1.5 w-1.5 relative">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">
        {label}
      </span>
    </div>
  );
}

function InfiniteLogoTicker() {
    const logos = [
        { name: "Acme Corp", icon: Globe }, { name: "Nexus", icon: Zap }, { name: "Echo", icon: Activity },
        { name: "Vertex", icon: Layers }, { name: "Pulse", icon: TrendingUp }, { name: "Orbital", icon: Globe },
        { name: "Hyperion", icon: Zap }, { name: "Zenith", icon: Activity }
    ];

    return (
        <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll">
                {[...logos, ...logos].map((Logo, i) => (
                    <li key={i} className="flex items-center gap-2 opacity-30 grayscale transition-all hover:opacity-60 hover:grayscale-0">
                        <Logo.icon size={20} />
                        <span className="font-bold text-lg tracking-tight">{Logo.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

// --- Complex Visualizations ---

function HeroDashboard() {
  return (
    <div className="w-full h-full bg-[#080808] flex overflow-hidden rounded-xl relative select-none">
       {/* Sidebar */}
       <div className="hidden sm:flex w-14 border-r border-white/[0.06] flex-col items-center py-4 gap-6 bg-[#0a0a0a]">
          <div className="h-8 w-8 rounded-lg bg-white text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
             <Zap size={14} fill="currentColor" />
          </div>
          <div className="flex flex-col gap-4 mt-4">
             <div className="p-2 rounded-lg bg-white/10 text-white"><LayoutDashboard size={16} /></div>
             <div className="p-2 rounded-lg text-zinc-600"><Layers size={16} /></div>
             <div className="p-2 rounded-lg text-zinc-600"><Settings size={16} /></div>
          </div>
       </div>
       
       {/* Main Content */}
       <div className="flex-1 p-4 sm:p-6 relative">
          {/* Scanline effect */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none z-20" />

          {/* Header */}
          <div className="flex justify-between items-end mb-6">
             <div>
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                   <Activity size={10} className="text-emerald-500" />
                   Live Intelligence
                </div>
                <div className="text-lg font-bold text-white tracking-tight">Recovery Overview</div>
             </div>
             <div className="flex gap-2">
                <div className="hidden sm:block h-7 w-24 rounded-lg border border-white/10 bg-white/5" />
             </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
             {/* Card 1 */}
             <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Drifting Users</span>
                   <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tighter">342</div>
                <div className="w-full bg-zinc-800/50 h-1 mt-3 rounded-full overflow-hidden">
                    <div className="bg-amber-500 w-2/3 h-full" />
                </div>
             </div>
             {/* Card 2 */}
             <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Emails Delivered</span>
                   <Mail size={12} className="text-zinc-500" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tighter">856</div>
                <div className="w-full bg-zinc-800/50 h-1 mt-3 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 w-3/4 h-full" />
                </div>
             </div>
             {/* Card 3 */}
             <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 relative overflow-hidden shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)_inset]">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">MRR Rescued</span>
                   <Sparkles size={12} className="text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tighter">$2,490</div>
                <div className="text-[9px] text-emerald-400/70 mt-1 font-medium">+12% this month</div>
             </div>
          </div>

          {/* Activity Feed */}
          <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.01] p-1 overflow-hidden">
             {[1,2,3,4].map(i => (
                <div key={i} className="flex justify-between items-center p-3 hover:bg-white/[0.03] rounded-lg transition-colors border-b border-white/[0.02] last:border-0">
                   <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-[8px] text-zinc-500 font-mono">U{i}</div>
                      <div className="flex flex-col">
                         <div className="h-2 w-20 bg-zinc-800 rounded mb-1" />
                         <div className="h-1.5 w-12 bg-zinc-900 rounded" />
                      </div>
                   </div>
                   <div className="h-1.5 w-8 bg-emerald-900/50 rounded" />
                </div>
             ))}
          </div>
       </div>
    </div>
  )
}

// --- Pricing Card (The Obsidian Card) ---
function PricingCard() {
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
  
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!divRef.current) return;
      const rect = divRef.current.getBoundingClientRect();
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
  
    return (
      <div
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsFocused(true)}
        onMouseLeave={() => setIsFocused(false)}
        className="relative w-full max-w-md rounded-[2.5rem] border border-white/10 bg-[#080808] p-8 md:p-10 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]"
      >
        {/* Spotlight Effect */}
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
          style={{
            opacity: isFocused ? 1 : 0,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-white">Founder's Pass</h3>
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-400 uppercase tracking-wide">
                            Limited
                        </span>
                    </div>
                    <p className="text-sm text-zinc-500">Everything you need to recover revenue.</p>
                </div>
                <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                        <span className="text-4xl font-bold text-white tracking-tighter">$19</span>
                        <span className="text-sm text-zinc-500 font-medium">/mo</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1">Locks for life</p>
                </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

            <div className="space-y-5 mb-10 flex-1">
                {[
                    'Unlimited recovered users',
                    'Custom sender branding',
                    '3-stage smart nudge sequences',
                    'Priority founder support',
                    'Cancel anytime'
                ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-white/20 transition-colors">
                            <Check size={10} className="text-white" />
                        </div>
                        <span className="text-sm text-zinc-300 font-medium group-hover:text-white transition-colors">{feat}</span>
                    </div>
                ))}
            </div>

            <Link
                href="/auth"
                className="relative w-full group overflow-hidden rounded-2xl bg-white py-4 text-center text-sm font-bold text-black transition-transform active:scale-[0.98]"
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    Start Recovering
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-100 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </Link>

            <div className="mt-6 flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                    <ShieldCheck size={12} />
                    <span>Secure Payment</span>
                </div>
            </div>
        </div>
      </div>
    );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-6 text-left group"
      >
        <span className="text-sm font-medium text-zinc-300 transition-colors group-hover:text-white group-hover:pl-2">{question}</span>
        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-300 ${isOpen ? 'rotate-180 bg-white text-black' : 'text-zinc-500'}`}>
            <ChevronDown size={14} />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="pb-6 text-sm leading-relaxed text-zinc-400 pr-8 pl-2">
          {answer}
        </p>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#020202] font-sans text-zinc-100 selection:bg-indigo-500/30 selection:text-white">
      
      {/* --- Cinematic Ambient Lighting --- */}
      <div className="pointer-events-none fixed inset-0 z-0">
         <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[600px] w-[80vw] rounded-full bg-indigo-600/[0.06] blur-[120px] opacity-60" />
         <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-600/[0.02] blur-[150px]" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        
        {/* --- Floating Navigation --- */}
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 animate-in slide-in-from-top-4 duration-700 fade-in">
          <nav className="relative flex items-center gap-2 rounded-full border border-white/10 bg-[#050505]/80 p-1.5 pl-5 pr-2 backdrop-blur-xl shadow-2xl ring-1 ring-white/5">
            
            <div className="flex items-center gap-2.5 mr-2 md:mr-6">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-white to-zinc-400 text-black shadow-lg shadow-white/10">
                <Zap size={14} fill="currentColor" />
              </div>
              <span className="text-sm font-bold tracking-tight text-white hidden sm:inline-block">TrialRescue</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center">
              {['How it works', 'Pricing', 'FAQ'].map((item) => {
                const id = item.toLowerCase().replace(/\s+/g, '-');
                return (
                    <a 
                    key={item} 
                    href={`#${id}`}
                    onClick={(e) => handleScroll(e, id)}
                    className="rounded-full px-4 py-1.5 text-[12px] font-medium text-zinc-400 transition-all hover:bg-white/5 hover:text-white"
                    >
                    {item}
                    </a>
                );
              })}
            </div>

            <div className="h-4 w-px bg-white/10 mx-1 hidden md:block" />

            <Link 
              href="/auth"
              className="hidden md:block rounded-full px-4 py-1.5 text-[12px] font-bold text-zinc-300 transition-colors hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="group flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-bold text-black transition-all hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
            >
              Get Access
              <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-zinc-400"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </nav>

          {/* Mobile Dropdown */}
          {isMobileMenuOpen && (
             <div className="absolute top-full mt-2 left-4 right-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 flex flex-col gap-2 shadow-2xl animate-in slide-in-from-top-2 fade-in md:hidden">
                {['How it works', 'Pricing', 'FAQ'].map((item) => (
                    <a 
                        key={item} 
                        href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={(e) => handleScroll(e, item.toLowerCase().replace(/\s+/g, '-'))}
                        className="p-3 rounded-xl bg-white/5 text-sm text-zinc-200"
                    >
                        {item}
                    </a>
                ))}
                <Link href="/auth" className="p-3 rounded-xl bg-white/5 text-sm text-zinc-200">Sign In</Link>
             </div>
          )}
        </header>

        <main className="flex-1">
          
          {/* --- Hero Section --- */}
          <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-6 overflow-hidden">
            <div className="mx-auto max-w-7xl flex flex-col items-center text-center">

              <FadeIn delay={100}>
                <h1 className="mx-auto max-w-4xl text-5xl font-semibold tracking-tighter text-white md:text-7xl lg:text-8xl drop-shadow-2xl leading-[1.05]">
                    Recover lost trials <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-200 via-zinc-400 to-zinc-700 italic pr-2">
                    while you sleep.
                    </span>
                </h1>
              </FadeIn>

              <FadeIn delay={200}>
                <p className="mx-auto mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-zinc-400 font-medium">
                    Stop letting <span className="text-white">90% of your signups</span> churn silently. TrialRescue connects to your backend and sends intelligent, branded nudges ~ automatically turning cold leads into MRR.
                </p>
              </FadeIn>

              <FadeIn delay={300}>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                    href="/auth"
                    className="relative h-12 px-8 rounded-full bg-white text-black text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)]"
                    >
                    Start Recovering Now
                    <ArrowRight size={16} />
                    </Link>
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                        <Check size={14} className="text-emerald-500" />
                        <span>Setup in 15 mins</span>
                    </div>
                </div>
              </FadeIn>

              {/* Premium Dashboard Mockup */}
              <FadeIn delay={500} className="w-full flex justify-center perspective-[2000px]">
                <div className="mt-20 relative w-full max-w-5xl group">
                    
                    {/* The Container - Responsive Tilt (None on Mobile, 3D on Desktop) */}
                    <div className="relative rounded-2xl border border-white/10 bg-[#0A0A0A] p-2 shadow-2xl shadow-indigo-500/10 transition-transform duration-1000 sm:[transform:rotateX(12deg)] sm:group-hover:[transform:rotateX(2deg)]">
                        
                        {/* Glass Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] to-transparent pointer-events-none z-20 rounded-2xl opacity-50" />
                        
                        {/* Inner Dashboard Component */}
                        <div className="rounded-xl bg-[#050505] overflow-hidden aspect-[16/10] relative border border-white/5">
                            <HeroDashboard />
                        </div>
                    </div>
                    
                    {/* Ambient Glow Under Dashboard */}
                    <div className="absolute -inset-4 bg-indigo-500/20 blur-[80px] -z-10 rounded-[100%] opacity-40 sm:opacity-60" />
                </div>
              </FadeIn>

              {/* Infinite Scroll Logos */}
              <div className="mt-24 w-full max-w-4xl border-t border-white/5 pt-10">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-8">Trusted by forward-thinking founders</p>
                 <InfiniteLogoTicker />
              </div>

            </div>
          </section>

          {/* --- Features (Bento) --- */}
          <section id="how-it-works" className="py-24 px-6 relative bg-[#030303]">
             <div className="mx-auto max-w-6xl">
                <FadeIn>
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Recovery on Autopilot.</h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                            No complex visual flow builders. No drag-and-drop nightmares. Just connect your data, set your rules, and we handle the psychology of recovery.
                        </p>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {/* Feature 1: Integration */}
                   <FadeIn delay={100} className="md:col-span-2">
                    <div className="h-full rounded-[32px] border border-white/10 bg-[#080808] p-8 relative overflow-hidden group hover:border-white/20 transition-colors">
                        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <Code2 size={140} />
                        </div>
                        <div className="relative z-10">
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 border border-blue-500/20">
                                <span className="font-bold font-mono">01</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Integration in minutes.</h3>
                            <p className="text-zinc-400 mb-8 max-w-md leading-relaxed">
                                Simply send a <code>user_signed_up</code> event from your backend. That's it. No frontend scripts slowing down your app.
                            </p>
                            {/* Mock Code Snippet */}
                            <div className="rounded-xl bg-[#050505] border border-white/10 p-5 font-mono text-xs text-zinc-400 shadow-2xl relative">
                                <div className="absolute top-4 right-4 flex gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-white/20" />
                                    <div className="h-2 w-2 rounded-full bg-white/20" />
                                </div>
                                <p><span className="text-purple-400">await</span> trialRescue.<span className="text-blue-400">track</span>({'{'}</p>
                                <p className="pl-4">event: <span className="text-emerald-400">"user_signed_up"</span>,</p>
                                <p className="pl-4">email: <span className="text-amber-300">"user@acme.com"</span></p>
                                <p> {'}'});</p>
                            </div>
                        </div>
                    </div>
                   </FadeIn>

                   {/* Feature 2: Detect */}
                   <FadeIn delay={200}>
                    <div className="h-full rounded-[32px] border border-white/10 bg-[#080808] p-8 relative overflow-hidden group hover:border-white/20 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6 border border-amber-500/20">
                                <span className="font-bold font-mono">02</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Inactivity Detection</h3>
                            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                                We monitor every user. If they go cold for 2, 4, or 7 days, they are automatically queued.
                            </p>
                            <div className="mt-auto flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-xs font-medium text-zinc-300">Status: Drifting</span>
                                </div>
                                <Timer size={16} className="text-zinc-500" />
                            </div>
                        </div>
                    </div>
                   </FadeIn>

                   {/* Feature 3: Rescue */}
                   <FadeIn delay={300}>
                    <div className="h-full rounded-[32px] border border-white/10 bg-[#080808] p-8 relative overflow-hidden group hover:border-white/20 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/20">
                                <span className="font-bold font-mono">03</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Automated Nudges</h3>
                            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                                Branded emails go out automatically. "From" name is yours. "Reply-to" is yours.
                            </p>
                            <div className="mt-auto transform group-hover:scale-105 transition-transform duration-500">
                                {/* Simplified Email Visual */}
                                <div className="bg-zinc-900 rounded-xl border border-white/10 p-4 shadow-lg">
                                    <div className="flex gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-white/10" />
                                        <div className="flex flex-col gap-1.5 justify-center">
                                            <div className="h-2 w-20 bg-zinc-700 rounded-full" />
                                            <div className="h-1.5 w-12 bg-zinc-800 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-800 rounded-full mb-2" />
                                    <div className="h-2 w-3/4 bg-zinc-800 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                   </FadeIn>

                   {/* Feature 4: Attribution */}
                   <FadeIn delay={400} className="md:col-span-2">
                    <div className="h-full rounded-[32px] border border-white/10 bg-[#080808] p-8 relative overflow-hidden group hover:border-white/20 transition-colors">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-white/[0.02] to-transparent pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 h-full">
                            <div className="flex-1">
                                <div className="h-10 w-10 rounded-xl bg-white/10 text-white flex items-center justify-center mb-6 border border-white/20">
                                   <Zap size={18} fill="currentColor" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Revenue Attribution.</h3>
                                <p className="text-zinc-400 leading-relaxed">
                                   See exactly how much revenue TrialRescue has saved you. We track which specific email led to the upgrade event so you can calculate ROI instantly.
                                </p>
                            </div>
                            <div className="flex-1 w-full">
                                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-900/5 p-6 backdrop-blur-md shadow-[0_0_30px_-5px_rgba(16,185,129,0.1)]">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Rescued MRR</span>
                                        <TrendingUp size={16} className="text-emerald-400" />
                                    </div>
                                    <div className="text-5xl font-bold text-white mb-2 tracking-tighter">$4,290</div>
                                    <div className="text-xs font-medium text-emerald-400/70">+12% vs last month</div>
                                </div>
                            </div>
                        </div>
                    </div>
                   </FadeIn>
                </div>
             </div>
          </section>

          {/* --- Pricing Section (Obsidian Card) --- */}
          <section id="pricing" className="py-32 px-6 relative border-y border-white/[0.02]">
             <div className="mx-auto max-w-md relative perspective-[1000px]">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 rounded-[2.5rem] blur-xl opacity-20 animate-pulse" />
                <FadeIn>
                    <PricingCard />
                </FadeIn>
             </div>
          </section>

          {/* --- FAQ --- */}
          <section id="faq" className="py-32 px-6 border-t border-white/5 bg-[#030303]">
             <div className="mx-auto max-w-3xl">
                <FadeIn>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Frequently Asked Questions</h2>
                        <p className="text-zinc-400">Everything you need to know about the product and billing.</p>
                    </div>
                </FadeIn>
                <div className="space-y-3">
                   <FaqItem 
                      question="How do the emails appear to my users?" 
                      answer="Seamlessly. We use your product name in the 'From' field (e.g., 'Alex from Acme'). The Reply-To is set to your support email, so if a user replies, it goes straight to your inbox. The branding uses your name and links." 
                   />
                   <FaqItem 
                      question="Is this GDPR/Privacy compliant?" 
                      answer="Yes. We act as a data processor. We only store the minimum data required (email, user ID, and timestamps) to function. We do not track sensitive PII beyond contact info." 
                   />
                   <FaqItem 
                      question="Will this annoy my users?" 
                      answer="No. We employ strict frequency capping. A user receives a maximum of 3 emails total (nudge 1, 2, and 3). If they perform an activity or upgrade at any point, they are immediately removed from the sequence." 
                   />
                   <FaqItem 
                      question="Do I need a credit card for the Early Bird?" 
                      answer="Yes, it's a direct checkout link via our payment provider." 
                   />
                   <FaqItem 
                      question="Can I customize the email timing?" 
                      answer="Yes. By default, we send on Day 3, 7, and 14 of inactivity, but you can configure these intervals in your settings dashboard to match your product's trial length." 
                   />
                </div>
             </div>
          </section>

          {/* --- Footer --- */}
          <footer className="border-t border-white/5 bg-black py-16 px-6">
             <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-8 opacity-60 hover:opacity-100 transition-opacity">
                 <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white border border-zinc-800">
                       <Zap size={14} fill="currentColor" />
                    </div>
                    <span className="text-sm font-bold text-white">TrialRescue</span>
                 </div>
                 
                 <div className="flex gap-8 text-xs text-zinc-500 font-medium">
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="mailto:support@trialrescue.com" className="hover:text-white transition-colors">Contact</a>
                 </div>
             </div>
             <div className="mt-8 text-center text-[10px] text-zinc-800 uppercase tracking-widest">
                © {new Date().getFullYear()} Trial Rescue Inc. All rights reserved.
             </div>
          </footer>

        </main>
      </div>
    </div>
  );
}