import { Link } from 'react-router-dom';
import ThreeLandingBg from '../components/layout/ThreeLandingBg';

export default function LandingPage() {
  return (
    <div className="bg-[#030712] text-slate-100 min-h-screen selection:bg-cyan-500/30 selection:text-white font-sans overflow-x-hidden">
      
      {/* 1. FUTURISTIC NAV BAR */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-white text-lg font-bold tracking-[0.25em] hover:text-cyan-400 transition-colors uppercase font-mono">
            Aethera
          </Link>
          
          {/* Menu Links */}
          <div className="hidden md:flex gap-8 text-xs font-semibold tracking-widest text-slate-400 uppercase">
            <a href="#telemetry" className="hover:text-white transition-colors">Telemetry</a>
            <a href="#missions" className="hover:text-white transition-colors">Missions</a>
            <a href="#lifecycle" className="hover:text-white transition-colors">Lifecycle</a>
            <a href="#logs" className="hover:text-white transition-colors">Logs</a>
          </div>
          
          {/* CTA capsule button */}
          <Link 
            to="/login" 
            className="border border-white/20 hover:border-cyan-400 hover:text-cyan-400 px-6 py-2.5 rounded-full text-xs font-bold tracking-widest text-white uppercase transition-all duration-300 bg-white/5 hover:bg-cyan-950/20"
          >
            Launch Console
          </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-between pt-32 pb-12 px-6 z-10 overflow-hidden bg-radial-gradient">
        {/* Interactive 3D telemetry particles background */}
        <ThreeLandingBg interactive={false} />

        {/* Dynamic ambient gradient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none z-0"></div>

        {/* Top metadata line */}
        <div className="max-w-7xl mx-auto w-full flex justify-between text-cyan-500/40 font-mono text-[10px] tracking-[0.3em] uppercase mt-4 z-10">
          <span>[ tele_system: aet_operational ]</span>
          <span>[ orbit: geo_stationary ]</span>
        </div>

        {/* Hero Title */}
        <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col justify-center items-start z-10 my-12">
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-white tracking-tight uppercase leading-[0.85] text-left max-w-5xl select-none">
            Building <br />
            next-generation <br />
            software tracking <br />
            systems
          </h1>
          <p className="text-slate-400 text-sm md:text-lg tracking-wide max-w-xl text-left mt-8 font-medium leading-relaxed">
            High-precision issue telemetry, real-time diagnostic allocation, and unified mission control built for space-grade developer teams.
          </p>
          <div className="flex gap-4 mt-10">
            <Link 
              to="/login" 
              className="bg-white text-slate-950 hover:bg-cyan-400 hover:text-slate-950 px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-xl shadow-cyan-950/20"
            >
              Enter Workspace
            </Link>
            <a 
              href="#telemetry" 
              className="border border-white/20 hover:border-white px-8 py-4 rounded-full text-xs font-bold tracking-widest text-white uppercase transition-all duration-300"
            >
              View Telemetry
            </a>
          </div>
        </div>

        {/* Bottom indicator metrics */}
        <div className="max-w-7xl mx-auto w-full flex flex-wrap justify-between items-end gap-6 border-t border-white/5 pt-8 z-10">
          <div className="flex gap-12">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-500 font-bold mb-1">LATENCY</p>
              <p className="text-xl font-bold font-mono text-cyan-400">&lt; 8.4ms</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-500 font-bold mb-1">STATUS</p>
              <p className="text-xl font-bold font-mono text-emerald-400">ACTIVE</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-500 font-bold mb-1">VERSION</p>
              <p className="text-xl font-bold font-mono text-slate-400">AET-v2.0</p>
            </div>
          </div>
          <div className="text-slate-500 text-[10px] tracking-widest uppercase font-mono">
            Scroll to inspect details ↓
          </div>
        </div>
      </section>

      {/* 3. BEIGE/OFF-WHITE SECTION SPECIFICATION (Vast-Space Style) */}
      <section id="telemetry" className="bg-[#f3f0e9] text-[#141414] py-24 px-6 border-t border-[#e3dfd6] relative z-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Header row with corners */}
          <div className="relative border-b border-[#e3dfd6] pb-16 mb-16 flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Corner Indicators */}
            <span className="absolute -top-4 -left-4 text-xs font-bold text-[#b4af9f] select-none font-mono">+</span>
            <span className="absolute -top-4 -right-4 text-xs font-bold text-[#b4af9f] select-none font-mono">+</span>

            <div className="max-w-xl">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-6 font-sans">
                Aethera-1: Space-grade tracking telemetry
              </h2>
            </div>
            <div className="max-w-md md:mt-4">
              <p className="text-[#555] text-sm md:text-base leading-relaxed font-medium">
                In engineering, latency and error tracking are mission-critical metrics. Aethera-1 is constructed as a high-fidelity workspace providing instantaneous issue assignment, visual kanban tracking, and real-time team synchronization.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 mt-6 text-xs font-bold tracking-widest uppercase hover:underline">
                <span>Configure telemetry</span>
                <span className="font-mono">→</span>
              </Link>
            </div>
          </div>

          {/* 4. INTERACTIVE 3D SPECIFICATION DISPLAY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center my-16">
            
            {/* Specs list left */}
            <div className="flex flex-col gap-8 text-left">
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#a59f8f] font-extrabold mb-1">SPECIFICATION 01</p>
                <h3 className="text-xl font-bold uppercase mb-2">POSTGRES ENGINE</h3>
                <p className="text-[#666] text-xs leading-relaxed font-medium">Relational schema models ensuring transactional safety, zero-data-loss allocations, and low-latency queries.</p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#a59f8f] font-extrabold mb-1">SPECIFICATION 02</p>
                <h3 className="text-xl font-bold uppercase mb-2">TELEMETRY BOARD</h3>
                <p className="text-[#666] text-xs leading-relaxed font-medium">Full-featured kanban interface offering visual drag-and-drop state updates and dynamic project categorization.</p>
              </div>
            </div>

            {/* Rotating 3D Satellite Core in Center */}
            <div className="h-[350px] relative w-full border border-[#e3dfd6] rounded-3xl bg-[#ece9e0]/40 overflow-hidden flex items-center justify-center">
              {/* Background watermark text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="text-[8rem] font-black tracking-widest text-[#e3dfd6]/50 uppercase font-sans">AET-1</span>
              </div>
              <ThreeLandingBg interactive={true} />
            </div>

            {/* Specs list right */}
            <div className="flex flex-col gap-8 text-left lg:pl-6">
              <div className="border border-[#e3dfd6] p-6 rounded-2xl bg-[#ece9e0]/30 font-mono text-xs text-[#333] flex flex-col gap-3">
                <div className="flex justify-between border-b border-[#e3dfd6]/70 pb-2">
                  <span>CREW SIZE:</span>
                  <span className="font-bold text-[#141414]">INFINITE</span>
                </div>
                <div className="flex justify-between border-b border-[#e3dfd6]/70 pb-2">
                  <span>HABITABLE CHANNELS:</span>
                  <span className="font-bold text-[#141414]">16 ACTIVE</span>
                </div>
                <div className="flex justify-between border-b border-[#e3dfd6]/70 pb-2">
                  <span>LATENCY ENGINE:</span>
                  <span className="font-bold text-[#141414]">NODE.JS / VITE</span>
                </div>
                <div className="flex justify-between">
                  <span>ORBITAL RANGE:</span>
                  <span className="font-bold text-[#141414]">425 KM</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#a59f8f] font-extrabold mb-1">SPECIFICATION 03</p>
                <h3 className="text-xl font-bold uppercase mb-2">JWT CRYPTO ACCESS</h3>
                <p className="text-[#666] text-xs leading-relaxed font-medium">Cryptographically signed access tokens and secure HTTP authorization headers protecting mission telemetry.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RULER / LIFECYCLE LIFELINE PROGRESS BAR */}
      <section id="lifecycle" className="bg-[#030712] text-slate-100 py-28 px-6 border-t border-white/5 relative z-20 overflow-hidden">
        {/* Subtle grid line backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#080c18_1px,transparent_1px),linear-gradient(to_bottom,#080c18_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-16 text-left">
            <p className="text-cyan-500 font-mono text-xs tracking-[0.25em] uppercase mb-2">// TRACKING PIPELINE</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white font-sans">
              SOFTWARE LIFECYCLE CHRONOLOGY
            </h2>
          </div>

          {/* Caliper-ruler grid line */}
          <div className="relative w-full border-t border-slate-800 my-8 py-8 flex flex-col md:flex-row justify-between items-start gap-12">
            
            {/* Ticks and stages */}
            <div className="flex-1 text-left relative pt-4">
              <span className="absolute -top-[5px] left-0 w-2 h-2 bg-cyan-500 rounded-full"></span>
              <p className="font-mono text-xs text-cyan-400 font-bold tracking-widest mb-3">01 / INGESTION</p>
              <h3 className="text-lg font-bold text-white uppercase mb-2">Telemetry Registration</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Errors and telemetry reports are instantly ingested and logged under active projects.</p>
            </div>

            <div className="flex-1 text-left relative pt-4">
              <span className="absolute -top-[5px] left-0 w-2 h-2 bg-slate-800 rounded-full"></span>
              <p className="font-mono text-xs text-slate-500 font-bold tracking-widest mb-3">02 / DIAGNOSTICS</p>
              <h3 className="text-lg font-bold text-white uppercase mb-2">Priority Calculation</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Issues are automatically indexed based on severity, project association, and critical path metrics.</p>
            </div>

            <div className="flex-1 text-left relative pt-4">
              <span className="absolute -top-[5px] left-0 w-2 h-2 bg-slate-800 rounded-full"></span>
              <p className="font-mono text-xs text-slate-500 font-bold tracking-widest mb-3">03 / ALLOCATION</p>
              <h3 className="text-lg font-bold text-white uppercase mb-2">Mission Assignment</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Engineers allocate tasks to specific developer cards on the responsive Kanban board workspace.</p>
            </div>

            <div className="flex-1 text-left relative pt-4">
              <span className="absolute -top-[5px] left-0 w-2 h-2 bg-slate-800 rounded-full"></span>
              <p className="font-mono text-xs text-slate-500 font-bold tracking-widest mb-3">04 / RESOLUTION</p>
              <h3 className="text-lg font-bold text-white uppercase mb-2">Telemetry Purge</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Completed logs are validated, resolved, and documented permanently inside the activity stream.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LOGS AND MISSION UPDATES SECTION (Beige Background) */}
      <section id="logs" className="bg-[#f3f0e9] text-[#141414] py-24 px-6 border-t border-[#e3dfd6] relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#e3dfd6] pb-8 mb-12">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#a59f8f] font-extrabold mb-1">MISSION METRICS</p>
              <h2 className="text-3xl md:text-5xl font-black uppercase text-[#141414]">UPDATES & TELEMETRY LOGS</h2>
            </div>
            <Link to="/login" className="text-xs font-bold tracking-widest uppercase hover:underline mt-4 md:mt-0">
              View all mission logs →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-[#e3dfd6] p-8 rounded-2xl bg-[#ece9e0]/30 hover:border-[#b4af9f] transition-all flex flex-col justify-between h-[220px]">
              <span className="font-mono text-xs text-[#b4af9f]">LOG // AET-004</span>
              <div>
                <h3 className="font-bold text-lg uppercase mb-2">Aethera-1 orbit verified</h3>
                <p className="text-[#666] text-xs leading-relaxed font-medium">Production workspace verified and active. Database tables synced successfully.</p>
              </div>
            </div>
            <div className="border border-[#e3dfd6] p-8 rounded-2xl bg-[#ece9e0]/30 hover:border-[#b4af9f] transition-all flex flex-col justify-between h-[220px]">
              <span className="font-mono text-xs text-[#b4af9f]">LOG // AET-003</span>
              <div>
                <h3 className="font-bold text-lg uppercase mb-2">Telemetry streams connected</h3>
                <p className="text-[#666] text-xs leading-relaxed font-medium">Real-time socket streams integrated to capture dashboard metrics instantaneously.</p>
              </div>
            </div>
            <div className="border border-[#e3dfd6] p-8 rounded-2xl bg-[#ece9e0]/30 hover:border-[#b4af9f] transition-all flex flex-col justify-between h-[220px]">
              <span className="font-mono text-xs text-[#b4af9f]">LOG // AET-002</span>
              <div>
                <h3 className="font-bold text-lg uppercase mb-2">VCS sync operational</h3>
                <p className="text-[#666] text-xs leading-relaxed font-medium">Git commit logs synchronized to trace bugs back to code check-ins.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. JOIN MISSION CONTROL NEWSLETTER (Beige Background) */}
      <section className="bg-[#ece9e0] text-[#141414] py-28 px-6 border-t border-[#e3dfd6] relative z-20">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#a59f8f] font-extrabold mb-4">// ENTER TELEMETRY SUBSCRIBER SYSTEM</p>
          <h2 className="text-4xl md:text-5xl font-black uppercase text-[#141414] tracking-tight leading-[0.95] mb-6">
            Join Mission Control
          </h2>
          <p className="text-[#555] text-sm mb-8 leading-relaxed font-medium">
            Register to receive telemetry specs, critical patch details, and space-grade engineering releases.
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

      {/* 8. SPLIT-COLUMN SITE MAP FOOTER (Dark Background) */}
      <footer className="bg-[#030712] text-slate-400 py-16 px-6 border-t border-white/5 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4">Workspace</h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li><Link to="/login" className="hover:text-white transition-colors">Telemetry login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4">Missions</h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li><a href="#telemetry" className="hover:text-white transition-colors">Specs</a></li>
              <li><a href="#lifecycle" className="hover:text-white transition-colors">Lifecycle</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4">Telemetry</h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li><a href="#logs" className="hover:text-white transition-colors">Audit logs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4 font-mono tracking-[0.2em]">AETHERA</h4>
            <p className="text-[10px] text-slate-500 uppercase leading-relaxed font-mono mt-1">
              Building next-gen tracking systems.
            </p>
          </div>
        </div>
        
        {/* Bottom copyright */}
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] tracking-widest uppercase text-slate-600 font-mono">
            &copy; 2026 Aethera Proprietary Systems. All rights reserved.
          </p>
          <p className="text-[10px] tracking-widest uppercase text-slate-600 font-mono">
            Built by <a href="https://github.com/hardikkaurani" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline transition">HKaurani_01</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
