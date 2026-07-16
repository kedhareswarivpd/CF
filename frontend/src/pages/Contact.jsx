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
    <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-section-padding">
      <Reveal className="text-center max-w-2xl mx-auto mb-stack-xl">
        <span className="font-label-caps text-label-caps uppercase text-brand">Get in Touch</span>
        <h1 className="font-display text-headline-md text-brand-dark dark:text-dark-brand mt-4 mb-4">Let's Build Something Resilient</h1>
        <p className="text-white text-body-lg">
          Tell us about your next technical initiative — a Solution Architect will follow up within one
          business day.
        </p>
      </Reveal>

      <div className="grid lg:grid-cols-12 gap-gutter">
        <Reveal from="left" className="lg:col-span-7 bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg shadow-card">
          <ContactForm />
        </Reveal>

        <div className="lg:col-span-5 flex flex-col gap-stack-lg">
          <Reveal from="right" delay={100} className="bg-brand-dark text-white rounded-lg p-stack-lg">
            <h3 className="font-display text-headline-sm mb-4">Direct Contact</h3>
            <div className="flex items-center gap-3 mb-3">
              <Icon name="mail" className="text-accent-cyan" />
              <span className="text-body-sm">info@corefusiontech.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="call" className="text-accent-cyan" />
              <span className="text-body-sm">+91-11-0000-0000</span>
            </div>
          </Reveal>

          <Reveal from="right" delay={200} className="bg-surface-low dark:bg-dark-surface-low border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
            <h3 className="font-display text-headline-sm text-white mb-4">Global Offices</h3>
            <div className="flex flex-col gap-4">
              {OFFICES.map((office, i) => (
                <Reveal key={office.city} from="right" delay={300 + i * 80}>
                  <div className="flex items-start gap-3">
                    <Icon name="location_on" className="text-white mt-0.5" />
                    <div>
                      <p className="font-semibold text-white text-body-sm">{office.city}</p>
                      <p className="text-white text-xs uppercase tracking-wide">{office.role}</p>
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
