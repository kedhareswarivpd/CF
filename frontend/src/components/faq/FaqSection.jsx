import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function FaqSection({ categories }) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name);
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (question) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(question)) next.delete(question);
      else next.add(question);
      return next;
    });
  };

  const currentCategory = categories.find((c) => c.name === activeCategory);
  const items = currentCategory?.items ?? [];

  return (
    <section className="py-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-wrap gap-2 mb-stack-lg">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => { setActiveCategory(cat.name); setOpenItems(new Set()); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-label-caps text-label-caps uppercase transition-all ${
                activeCategory === cat.name
                  ? 'bg-brand text-white'
                  : 'bg-surface-container dark:bg-dark-surface-container text-ink-muted dark:text-dark-ink-muted hover:bg-outline-variant dark:hover:bg-dark-outline-variant'
              }`}
            >
              <Icon name={cat.icon} className="text-lg" />
              {cat.name}
            </button>
          ))}
        </div>
        <div className="max-w-3xl mx-auto space-y-stack-md">
          {items.map((item) => {
            const isOpen = openItems.has(item.question);
            return (
              <Reveal key={item.question}>
                <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
                  <button
                    id={`faq-section-btn-${item.question.replace(/\s+/g, '-')}`}
                    onClick={() => toggleItem(item.question)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-section-${item.question.replace(/\s+/g, '-')}`}
                    className="w-full flex items-center justify-between px-stack-lg py-4 text-left hover:bg-surface-container dark:hover:bg-dark-surface-container transition-colors"
                  >
                    <span className="font-body text-body-md font-semibold text-brand-dark dark:text-dark-brand pr-4">
                      {item.question}
                    </span>
                    <Icon
                      name={isOpen ? 'remove' : 'add'}
                      className="text-brand text-xl flex-shrink-0"
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={`faq-section-${item.question.replace(/\s+/g, '-')}`}
                      role="region"
                      aria-labelledby={`faq-section-btn-${item.question.replace(/\s+/g, '-')}`}
                      className="px-stack-lg pb-4"
                    >
                      <p className="text-body-md text-ink-muted dark:text-dark-ink-muted">{item.answer}</p>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
