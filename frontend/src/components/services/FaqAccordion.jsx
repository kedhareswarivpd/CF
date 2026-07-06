import { useState } from 'react';
import { Link } from 'react-router-dom';
import { faqs } from '../../data/services.js';
import Icon from '../ui/Icon.jsx';

function FaqItem({ faq, isOpen, onToggle, index }) {
  const id = `faq-${index}`;
  const buttonId = `faq-btn-${index}`;
  return (
    <div className="bg-surface-low rounded-lg border border-outline-variant p-stack-md">
      <button
        id={buttonId}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={id}
        className="w-full flex items-center justify-between text-left cursor-pointer font-display text-body-lg font-semibold text-ink"
      >
        {faq.question}
        <Icon name="expand_more" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div
          id={id}
          role="region"
          aria-labelledby={buttonId}
          className="pt-4 text-body-md text-ink-muted"
        >
          {faq.answer}
        </div>
      )}
    </div>
  );
}

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-section-padding px-margin-mobile md:px-margin-desktop max-w-container mx-auto">
      <div className="grid lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-4">
          <h2 className="font-display text-headline-md text-ink mb-stack-md">Common Questions</h2>
          <p className="text-body-md text-ink-muted mb-stack-lg">
            Everything you need to know about partnering with CoreFusion on your next technical venture.
          </p>
          <div className="p-stack-md bg-accent-cyan-pale rounded-lg border border-brand/20">
            <p className="text-body-sm font-semibold text-brand-dark">Need specialized answers?</p>
            <Link to="/contact" className="text-brand font-bold text-body-sm hover:underline mt-2 inline-block">
              Speak with a Solution Architect
            </Link>
          </div>
        </div>
        <div className="lg:col-span-8 space-y-4">
          {faqs.map((faq, index) => (
            <FaqItem
              key={faq.question}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
