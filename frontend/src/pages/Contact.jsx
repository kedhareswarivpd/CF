import ContactForm from '../components/contact/ContactForm.jsx';
import Icon from '../components/ui/Icon.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const OFFICES = [
  { city: 'Bangalore, India', role: 'HQ & Innovation Lab' },
  { city: 'Dubai, UAE', role: 'MENA Regional Office' },
  { city: 'Singapore', role: 'SEA Hub' },
];

export default function Contact() {
  useDocumentTitle('Contact Us | CoreFusion Technologies');

  return (
    <section className="mx-auto max-w-container px-margin-mobile py-section-padding md:px-margin-desktop">
      <Reveal className="mx-auto mb-stack-xl max-w-2xl text-center">
        <span className="font-label-caps text-label-caps uppercase text-brand">Get in Touch</span>
        <h1 className="my-4 font-display text-headline-md text-white dark:text-dark-brand">Let&apos;s Build Something Resilient</h1>
        <p className="text-body-lg text-white">
          Tell us about your next technical initiative — a Solution Architect will follow up within one
          business day.
        </p>
      </Reveal>

      <div className="grid gap-gutter lg:grid-cols-12">
        <Reveal from="left" className="rounded-lg border border-outline-variant bg-white p-stack-lg shadow-card dark:border-dark-outline-variant dark:bg-dark-surface lg:col-span-7">
          <ContactForm />
        </Reveal>

        <div className="flex flex-col gap-stack-lg lg:col-span-5">
          <Reveal from="right" delay={100} className="rounded-lg bg-brand-dark p-stack-lg text-white">
            <h3 className="mb-4 font-display text-headline-sm">Direct Contact</h3>
            <div className="mb-3 flex items-center gap-3">
              <Icon name="mail" className="text-accent-cyan" />
              <span className="text-body-sm">info@corefusiontech.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="call" className="text-accent-cyan" />
              <span className="text-body-sm">+91-11-0000-0000</span>
            </div>
          </Reveal>

          <Reveal from="right" delay={200} className="rounded-lg border border-outline-variant bg-surface-low p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface-low">
            <h3 className="mb-4 font-display text-headline-sm text-white">Global Offices</h3>
            <div className="flex flex-col gap-4">
              {OFFICES.map((office, i) => (
                <Reveal key={office.city} from="right" delay={300 + i * 80}>
                  <div className="flex items-start gap-3">
                    <Icon name="location_on" className="mt-0.5 text-white" />
                    <div>
                      <p className="text-body-sm font-semibold text-white">{office.city}</p>
                      <p className="text-xs uppercase tracking-wide text-white">{office.role}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
