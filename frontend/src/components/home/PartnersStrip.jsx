import { useEffect, useState } from 'react';
import { fetchPartners } from '../../api/cms.js';

// Public "Technology Partners" logo strip (backend Partner.type =
// technology_partner, distinct from business_partner/reseller) — the
// backend CRUD resource and the Admin Panel's ContentManager entry for it
// already existed, but nothing on the public site actually rendered it (a
// real gap, not a stale-data bug: this feature simply had no frontend
// consumer at all until now).
export default function PartnersStrip() {
 const [partners, setPartners] = useState([]);

 useEffect(() => {
  fetchPartners({ limit: 20, type: 'technology_partner' })
   .then((res) => setPartners(res?.data || []))
   .catch(() => {});
 }, []);

 if (!partners.length) return null;

 return (
  <section className="border-y border-outline-variant bg-surface-container px-4 py-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface-container sm:px-6 lg:px-10 xl:px-12 ">
   <div className="mx-auto max-w-container">
    <p className="mb-6 text-center font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">
     Our Technology Partners
    </p>
    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
     {partners.map((p) => (
      p.website ? (
       <a key={p.id} href={p.website} target="_blank" rel="noreferrer" title={p.name} className="opacity-70 transition-opacity hover:opacity-100">
        <img src={p.logo} alt={p.name} className="h-8 object-contain grayscale hover:grayscale-0" />
       </a>
      ) : (
       <img key={p.id} src={p.logo} alt={p.name} title={p.name} className="h-8 object-contain opacity-70 grayscale" />
      )
     ))}
    </div>
   </div>
  </section>
 );
}
