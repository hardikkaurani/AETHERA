import { Link } from 'react-router-dom';
import ThreeLandingBg from '../components/layout/ThreeLandingBg';

export default function LandingPage() {
  return (
    <div className="bg-[#030712] text-slate-100 min-h-screen selection:bg-cyan-500/30 selection:text-white font-sans overflow-x-hidden">
      
      {/* 1. FUTURISTIC NAV BAR */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/aethera-logo.svg" alt="Aethera Logo" className="w-8 h-8 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all" />
            <span className="text-white text-lg font-bold tracking-[0.25em] group-hover:text-cyan-400 transition-colors uppercase font-mono mt-1">Aethera</span>
          </Link>
          
          {/* Menu Links */}
          <div className="hidden md:flex gap-8 text-xs font-semibold tracking-widest text-slate-400 uppercase">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#activity" className="hover:text-white transition-colors">Activity Logs</a>
          </div>
          
          {/* CTA capsule button */}
          <Link 
            to="/login" 
            className="border border-white/20 hover:border-cyan-400 hover:text-cyan-400 px-6 py-2.5 rounded-full text-xs font-bold tracking-widest text-white uppercase transition-all duration-300 bg-white/5 hover:bg-cyan-950/20"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-between pt-32 pb-12 px-6 z-10 overflow-hidden bg-radial-gradient">
        {/* Interactive 3D data particles background */}
        <ThreeLandingBg interactive={false} />

        {/* Dynamic ambient gradient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none z-0"></div>

        {/* Top metadata line */}
        <div className="max-w-7xl mx-auto w-full flex justify-between text-cyan-500/40 font-mono text-[10px] tracking-[0.3em] uppercase mt-4 z-10">
          <span>[ system: aet_active ]</span>
          <span>[ env: production ]</span>
        </div>

        {/* Hero Title */}
        <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col justify-center items-start z-10 my-12">
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-white tracking-tight uppercase leading-[0.85] text-left max-w-5xl select-none">
            Building <br />
            high-fidelity <br />
            developer tracking <br />
            systems
          </h1>
          <p className="text-slate-400 text-sm md:text-lg tracking-wide max-w-xl text-left mt-8 font-medium leading-relaxed">
            A premium issue tracking workspace built for modern engineering teams. Monitor bugs, track sprints, and streamline your entire software development lifecycle.
          </p>
          <div className="flex gap-4 mt-10">
            <Link 
              to="/login" 
              className="bg-white text-slate-950 hover:bg-cyan-400 hover:text-slate-950 px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-xl shadow-cyan-950/20"
            >
              Enter Workspace
            </Link>
            <a 
              href="#features" 
              className="border border-white/20 hover:border-white px-8 py-4 rounded-full text-xs font-bold tracking-widest text-white uppercase transition-all duration-300"
            >
              View Features
            </a>
          </div>
        </div>

        {/* Bottom indicator metrics */}
        <div className="max-w-7xl mx-auto w-full flex flex-wrap justify-between items-end gap-6 border-t border-white/5 pt-8 z-10">
          <div className="flex gap-12">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-500 font-bold mb-1">API LATENCY</p>
              <p className="text-xl font-bold font-mono text-cyan-400">&lt; 10ms</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-500 font-bold mb-1">SYSTEM STATUS</p>
              <p className="text-xl font-bold font-mono text-emerald-400">OPERATIONAL</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-500 font-bold mb-1">VERSION</p>
              <p className="text-xl font-bold font-mono text-slate-400">v2.0.1</p>
            </div>
          </div>
          <div className="text-slate-500 text-[10px] tracking-widest uppercase font-mono">
            Scroll to inspect details ↓
          </div>
        </div>
      </section>

      {/* 3. BEIGE/OFF-WHITE SECTION SPECIFICATION */}
      <section id="features" className="bg-[#f3f0e9] text-[#141414] py-24 px-6 border-t border-[#e3dfd6] relative z-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Header row with corners */}
          <div className="relative border-b border-[#e3dfd6] pb-16 mb-16 flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Corner Indicators */}
            <span className="absolute -top-4 -left-4 text-xs font-bold text-[#b4af9f] select-none font-mono">+</span>
            <span className="absolute -top-4 -right-4 text-xs font-bold text-[#b4af9f] select-none font-mono">+</span>

            <div className="max-w-xl">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-6 font-sans">
                Aethera: Precision bug tracking infrastructure
              </h2>
            </div>
            <div className="max-w-md md:mt-4">
              <p className="text-[#555] text-sm md:text-base leading-relaxed font-medium">
                In software engineering, accurate issue tracking is mission-critical. Aethera is designed as a high-performance environment offering real-time task allocation, visual Kanban workflows, and comprehensive project analytics.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 mt-6 text-xs font-bold tracking-widest uppercase hover:underline">
                <span>Access Dashboard</span>
                <span className="font-mono">→</span>
              </Link>
            </div>
          </div>

          {/* 4. INTERACTIVE 3D SPECIFICATION DISPLAY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center my-16">
            
            {/* Specs list left */}
            <div className="flex flex-col gap-8 text-left">
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#a59f8f] font-extrabold mb-1">FEATURE 01</p>
                <h3 className="text-xl font-bold uppercase mb-2">AGILE KANBAN BOARD</h3>
                <p className="text-[#666] text-xs leading-relaxed font-medium">Full-featured visual interface offering drag-and-drop state updates, sprint categorization, and issue prioritization.</p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#a59f8f] font-extrabold mb-1">FEATURE 02</p>
                <h3 className="text-xl font-bold uppercase mb-2">POSTGRES DATABASE</h3>
                <p className="text-[#666] text-xs leading-relaxed font-medium">Robust relational schema ensuring transactional data safety, precise user allocations, and instant query resolution.</p>
              </div>
            </div>

            {/* Rotating 3D Data Node in Center */}
            <div className="h-[350px] relative w-full border border-[#e3dfd6] rounded-3xl bg-[#ece9e0]/40 overflow-hidden flex items-center justify-center">
              {/* Background watermark text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="text-[8rem] font-black tracking-widest text-[#e3dfd6]/50 uppercase font-sans">AET</span>
              </div>
              <ThreeLandingBg interactive={true} />
            </div>

            {/* Specs list right */}
            <div className="flex flex-col gap-8 text-left lg:pl-6">
              <div className="border border-[#e3dfd6] p-6 rounded-2xl bg-[#ece9e0]/30 font-mono text-xs text-[#333] flex flex-col gap-3">
                <div className="flex justify-between border-b border-[#e3dfd6]/70 pb-2">
                  <span>TEAM CAPACITY:</span>
                  <span className="font-bold text-[#141414]">UNLIMITED</span>
                </div>
                <div className="flex justify-between border-b border-[#e3dfd6]/70 pb-2">
                  <span>ACTIVE WORKSPACES:</span>
                  <span className="font-bold text-[#141414]">MULTI-PROJECT</span>
                </div>
                <div className="flex justify-between border-b border-[#e3dfd6]/70 pb-2">
                  <span>BACKEND ENGINE:</span>
                  <span className="font-bold text-[#141414]">EXPRESS.JS</span>
                </div>
                <div className="flex justify-between">
                  <span>FRONTEND UI:</span>
                  <span className="font-bold text-[#141414]">REACT / VITE</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#a59f8f] font-extrabold mb-1">FEATURE 03</p>
                <h3 className="text-xl font-bold uppercase mb-2">SECURE AUTHENTICATION</h3>
                <p className="text-[#666] text-xs leading-relaxed font-medium">Enterprise-grade JWT token access and encrypted password hashing protecting your proprietary codebase data.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RULER / LIFECYCLE PROGRESS BAR */}
      <section id="workflow" className="bg-[#030712] text-slate-100 py-28 px-6 border-t border-white/5 relative z-20 overflow-hidden">
        {/* Subtle grid line backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#080c18_1px,transparent_1px),linear-gradient(to_bottom,#080c18_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-16 text-left">
            <p className="text-cyan-500 font-mono text-xs tracking-[0.25em] uppercase mb-2">// TRACKING WORKFLOW</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white font-sans">
              SOFTWARE ISSUE LIFECYCLE
            </h2>
          </div>

          {/* Caliper-ruler grid line */}
          <div className="relative w-full border-t border-slate-800 my-8 py-8 flex flex-col md:flex-row justify-between items-start gap-12">
            
            {/* Ticks and stages */}
            <div className="flex-1 text-left relative pt-4">
              <span className="absolute -top-[5px] left-0 w-2 h-2 bg-cyan-500 rounded-full"></span>
              <p className="font-mono text-xs text-cyan-400 font-bold tracking-widest mb-3">01 / REPORTING</p>
              <h3 className="text-lg font-bold text-white uppercase mb-2">Issue Registration</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Bugs and feature requests are documented and categorized under specific development projects.</p>
            </div>

            <div className="flex-1 text-left relative pt-4">
              <span className="absolute -top-[5px] left-0 w-2 h-2 bg-slate-800 rounded-full"></span>
              <p className="font-mono text-xs text-slate-500 font-bold tracking-widest mb-3">02 / TRIAGE</p>
              <h3 className="text-lg font-bold text-white uppercase mb-2">Priority Assessment</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Tickets are evaluated based on severity and status, ensuring critical fixes are addressed first.</p>
            </div>

            <div className="flex-1 text-left relative pt-4">
              <span className="absolute -top-[5px] left-0 w-2 h-2 bg-slate-800 rounded-full"></span>
              <p className="font-mono text-xs text-slate-500 font-bold tracking-widest mb-3">03 / ALLOCATION</p>
              <h3 className="text-lg font-bold text-white uppercase mb-2">Developer Assignment</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Engineers claim tasks, updating progress visually across the interactive Kanban columns.</p>
            </div>

            <div className="flex-1 text-left relative pt-4">
              <span className="absolute -top-[5px] left-0 w-2 h-2 bg-slate-800 rounded-full"></span>
              <p className="font-mono text-xs text-slate-500 font-bold tracking-widest mb-3">04 / RESOLUTION</p>
              <h3 className="text-lg font-bold text-white uppercase mb-2">Code Deployment</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Patches are merged, tickets are marked resolved, and the audit log records the completion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LOGS AND MISSION UPDATES SECTION */}
      <section id="activity" className="bg-[#f3f0e9] text-[#141414] py-24 px-6 border-t border-[#e3dfd6] relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#e3dfd6] pb-8 mb-12">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#a59f8f] font-extrabold mb-1">WORKSPACE METRICS</p>
              <h2 className="text-3xl md:text-5xl font-black uppercase text-[#141414]">PROJECT ACTIVITY LOGS</h2>
            </div>
            <Link to="/login" className="text-xs font-bold tracking-widest uppercase hover:underline mt-4 md:mt-0">
              Open Dashboard →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-[#e3dfd6] p-8 rounded-2xl bg-[#ece9e0]/30 hover:border-[#b4af9f] transition-all flex flex-col justify-between h-[220px]">
              <span className="font-mono text-xs text-[#b4af9f]">AUDIT // PRJ-004</span>
              <div>
                <h3 className="font-bold text-lg uppercase mb-2">New sprint initialized</h3>
                <p className="text-[#666] text-xs leading-relaxed font-medium">Project scope defined. All pending backlog items have been transitioned to the active board.</p>
              </div>
            </div>
            <div className="border border-[#e3dfd6] p-8 rounded-2xl bg-[#ece9e0]/30 hover:border-[#b4af9f] transition-all flex flex-col justify-between h-[220px]">
              <span className="font-mono text-xs text-[#b4af9f]">AUDIT // PRJ-003</span>
              <div>
                <h3 className="font-bold text-lg uppercase mb-2">Critical bug resolved</h3>
                <p className="text-[#666] text-xs leading-relaxed font-medium">Memory leak in the data parser was identified, patched, and verified by the QA team.</p>
              </div>
            </div>
            <div className="border border-[#e3dfd6] p-8 rounded-2xl bg-[#ece9e0]/30 hover:border-[#b4af9f] transition-all flex flex-col justify-between h-[220px]">
              <span className="font-mono text-xs text-[#b4af9f]">AUDIT // PRJ-002</span>
              <div>
                <h3 className="font-bold text-lg uppercase mb-2">Team capacity expanded</h3>
                <p className="text-[#666] text-xs leading-relaxed font-medium">Three new engineering roles have been granted access to the internal workspace.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MAILING LIST / NEWSLETTER */}
      <section className="bg-[#ece9e0] text-[#141414] py-28 px-6 border-t border-[#e3dfd6] relative z-20">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#a59f8f] font-extrabold mb-4">// DEVELOPER MAILING LIST</p>
          <h2 className="text-4xl md:text-5xl font-black uppercase text-[#141414] tracking-tight leading-[0.95] mb-6">
            Get System Updates
          </h2>
          <p className="text-[#555] text-sm mb-8 leading-relaxed font-medium">
            Register to receive release notes, architecture improvements, and bug tracker updates.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="YOUR EMAIL" 
              className="flex-grow bg-[#f3f0e9] border border-[#d3cfc6] rounded-full px-6 py-4 text-xs font-semibold uppercase tracking-widest text-[#141414] focus:outline-none focus:border-[#141414] placeholder:text-[#a59f8f]"
            />
            <button 
              type="submit" 
              className="bg-[#141414] hover:bg-cyan-600 text-white hover:text-white px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* 8. SPLIT-COLUMN SITE MAP FOOTER */}
      <footer className="bg-[#030712] text-slate-400 py-16 px-6 border-t border-white/5 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4">Workspace</h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li><Link to="/login" className="hover:text-white transition-colors">Developer login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4">Features</h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li><a href="#features" className="hover:text-white transition-colors">Specifications</a></li>
              <li><a href="#workflow" className="hover:text-white transition-colors">Lifecycle</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4">Logs</h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li><a href="#activity" className="hover:text-white transition-colors">Audit trail</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2 font-mono tracking-[0.2em]">
              <img src="/aethera-logo.svg" alt="" className="w-4 h-4" />
              AETHERA
            </h4>
            <p className="text-[10px] text-slate-500 uppercase leading-relaxed font-mono mt-1">
              Building next-gen tracking systems.
            </p>
          </div>
        </div>
        
        {/* Bottom copyright */}
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] tracking-widest uppercase text-slate-600 font-mono">
            &copy; 2026 Aethera Bug Tracker. All rights reserved.
          </p>
          <p className="text-[10px] tracking-widest uppercase text-slate-600 font-mono">
            Built by <a href="https://github.com/hardikkaurani" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline transition">HKaurani_01</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
