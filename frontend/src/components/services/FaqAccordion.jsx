import { useState } from 'react';
import { Link } from 'react-router-dom';
import { faqs } from '../../data/services.js';
import Icon from '../ui/Icon.jsx';

function FaqItem({ faq, isOpen, onToggle, index }) {
  const id = `faq-${index}`;
  const buttonId = `faq-btn-${index}`;
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-low p-stack-md">
      <button
        id={buttonId}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={id}
        className="flex w-full cursor-pointer items-center justify-between text-left font-display text-body-lg font-semibold text-white"
      >
        {faq.question}
        <Icon name="expand_more" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div
          id={id}
          role="region"
          aria-labelledby={buttonId}
          className="pt-4 text-body-md text-white"
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
    <section className="mx-auto max-w-container px-margin-mobile py-section-padding md:px-margin-desktop">
      <div className="grid gap-gutter lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="mb-stack-md font-display text-headline-md text-white">Common Questions</h2>
          <p className="mb-stack-lg text-body-md text-white">
            Everything you need to know about partnering with CoreFusion on your next technical venture.
          </p>
          <div className="rounded-lg border border-brand/20 bg-accent-cyan-pale p-stack-md">
            <p className="text-body-sm font-semibold text-brand-dark">Need specialized answers?</p>
            <Link to="/contact" className="mt-2 inline-block text-body-sm font-bold text-brand hover:underline">
              Speak with a Solution Architect
            </Link>
          </div>
        </div>
        <div className="space-y-4 lg:col-span-8">
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