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
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <span className="material-symbols-outlined text-[200px] text-accent-cyan">public</span>
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
