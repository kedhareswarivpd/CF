import { leadership } from '../../data/about.js';

function LinkedInIcon() {
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

export default function LeadershipGrid() {
  return (
    <section className="py-section-padding bg-white dark:bg-dark-surface">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="font-label-caps text-label-caps uppercase text-brand">Executive Leadership</span>
            <h2 className="font-display text-headline-md text-brand-dark dark:text-dark-brand mt-4">Visionaries Steering the Ship</h2>
          </div>
          <button className="font-label-caps text-label-caps uppercase text-brand flex items-center gap-2 group">
            Join our team
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {leadership.map((leader) => (
            <div key={leader.name} className="group">
              <div className="aspect-[4/5] bg-surface-container dark:bg-dark-surface-container rounded-lg overflow-hidden mb-6 relative">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={`Portrait of ${leader.name}`}
                  src={leader.image}
                />
                <div className="absolute inset-0 bg-brand/10 group-hover:bg-transparent transition-colors" />
              </div>
              <h4 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{leader.name}</h4>
              <p className="font-label-caps text-label-caps uppercase text-ink-muted mb-4">{leader.title}</p>
              <div className="flex gap-3">
                <span className="w-8 h-8 rounded bg-surface-container dark:bg-dark-surface-container flex items-center justify-center text-brand hover:bg-brand hover:text-white cursor-pointer transition-colors">
                  <LinkedInIcon />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
