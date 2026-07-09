import { globalNodes } from '../../data/projects.js';

export default function GlobalMap() {
  return (
    <section className="bg-brand py-stack-xl px-margin-mobile md:px-margin-desktop overflow-hidden">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <span className="font-label-caps text-label-caps uppercase text-accent-cyan">Global Footprint</span>
        <h2 className="font-display text-headline-lg text-white mt-2">Engineering Without Borders</h2>
        <p className="font-body text-body-lg text-surface-dim max-w-2xl mx-auto mt-4 opacity-90">
          From our hubs in Delhi and Dubai to our partners in Seattle, we deliver excellence at a planetary
          scale.
        </p>
      </div>
      <div className="relative w-full max-w-5xl mx-auto aspect-[2/1] bg-brand-dark/40 rounded-xl overflow-hidden border border-white/10">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-72 h-72 md:w-96 md:h-96">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full border-2 border-accent-cyan/30 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-2 rounded-full border border-accent-cyan/20" />
            {/* Globe circle */}
            <div className="absolute inset-4 rounded-full bg-brand-dark/60 border border-accent-cyan/40 overflow-hidden flex items-center justify-center shadow-[0_0_60px_rgba(0,212,255,0.15)]">
              {/* SVG continents */}
              <svg viewBox="0 0 200 200" className="w-full h-full opacity-70" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="100" fill="#0a2540" />
                {/* Latitude lines */}
                {[30,50,70,90,110,130,150,170].map(y => (
                  <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#00d4ff" strokeWidth="0.3" strokeOpacity="0.2" />
                ))}
                {/* Longitude lines */}
                {[25,50,75,100,125,150,175].map(x => (
                  <line key={x} x1={x} y1="0" x2={x} y2="200" stroke="#00d4ff" strokeWidth="0.3" strokeOpacity="0.2" />
                ))}
                {/* North America */}
                <path d="M30 55 L55 50 L65 60 L60 80 L50 90 L35 85 L25 70 Z" fill="#00d4ff" fillOpacity="0.35" stroke="#00d4ff" strokeWidth="0.5" />
                {/* South America */}
                <path d="M50 95 L65 92 L70 110 L65 135 L55 140 L45 125 L42 108 Z" fill="#00d4ff" fillOpacity="0.35" stroke="#00d4ff" strokeWidth="0.5" />
                {/* Europe */}
                <path d="M90 45 L110 42 L115 55 L105 62 L92 60 Z" fill="#00d4ff" fillOpacity="0.35" stroke="#00d4ff" strokeWidth="0.5" />
                {/* Africa */}
                <path d="M90 65 L112 63 L118 85 L112 115 L100 120 L88 110 L84 88 Z" fill="#00d4ff" fillOpacity="0.35" stroke="#00d4ff" strokeWidth="0.5" />
                {/* Asia */}
                <path d="M115 38 L165 35 L175 55 L170 75 L150 80 L130 75 L118 65 L112 50 Z" fill="#00d4ff" fillOpacity="0.35" stroke="#00d4ff" strokeWidth="0.5" />
                {/* Australia */}
                <path d="M148 105 L168 102 L172 118 L162 125 L148 120 Z" fill="#00d4ff" fillOpacity="0.35" stroke="#00d4ff" strokeWidth="0.5" />
              </svg>
            </div>
          </div>
        </div>
        {globalNodes.map((node) => (
          <span
            key={node.label}
            className="map-pulse"
            style={{ top: node.top, left: node.left }}
            title={node.label}
          />
        ))}
        <div className="absolute bottom-6 left-6 glass-panel p-4 rounded-lg hidden md:block">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-accent-cyan rounded-full" />
            <span className="font-label-caps text-label-caps uppercase text-white">Active Project Nodes</span>
          </div>
        </div>
      </div>
    </section>
  );
}
