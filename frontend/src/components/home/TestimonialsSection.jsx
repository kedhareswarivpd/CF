import { useEffect, useState } from 'react';
import { fetchTestimonials } from '../../api/cms.js';
import Icon from '../ui/Icon.jsx';
import Avatar from '../ui/Avatar.jsx';

// Public testimonials — the backend CRUD resource and the Admin Panel's
// ContentManager entry for it already existed, but (like the partner logo
// strip) nothing on the public site rendered it at all until now.
export default function TestimonialsSection() {
 const [testimonials, setTestimonials] = useState([]);

 useEffect(() => {
  fetchTestimonials({ limit: 6 })
   .then((res) => setTestimonials(res?.data || []))
   .catch(() => {});
 }, []);

 if (!testimonials.length) return null;

 return (
  <section className="bg-surface-container px-4 py-section-padding dark:bg-dark-surface-container sm:px-6 lg:px-10 xl:px-12 ">
   <div className="mx-auto max-w-container">
    <div className="mb-stack-xl text-center">
     <p className="mb-2 font-label-caps text-label-caps uppercase text-brand">What Our Clients Say</p>
     <h2 className="font-display text-headline-lg text-brand-dark dark:text-dark-brand">Trusted by teams who ship</h2>
    </div>
    <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
     {testimonials.map((t) => (
      <div key={t.id} className="flex h-full flex-col rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
       {!!t.rating && (
        <div className="mb-3 flex gap-0.5 text-accent-cyan">
         {Array.from({ length: 5 }, (_, i) => (
          <Icon key={i} name={i < t.rating ? 'star' : 'star_outline'} className="text-lg" />
         ))}
        </div>
       )}
       <p className="mb-6 flex-1 font-body text-body-md italic text-ink dark:text-dark-ink">&ldquo;{t.content}&rdquo;</p>
       <div className="flex items-center gap-3">
        <Avatar name={t.author_name} size="md" />
        <div>
         <p className="font-semibold text-ink dark:text-dark-ink">{t.author_name}</p>
         <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">
          {[t.author_title, t.company_name].filter(Boolean).join(', ')}
         </p>
        </div>
       </div>
      </div>
     ))}
    </div>
   </div>
  </section>
 );
}
