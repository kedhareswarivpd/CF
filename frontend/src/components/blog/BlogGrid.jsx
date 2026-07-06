import { useState } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Reveal from '../ui/Reveal.jsx';
import BlogCard from './BlogCard.jsx';

export default function BlogGrid({ posts, categories }) {
  if (!posts) return <LoadingSpinner />;
  if (!posts.length) return <EmptyState icon="article" title="No blog posts yet" description="Stay tuned!" />;
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  return (
    <section className="py-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-wrap gap-2 mb-stack-lg">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full font-label-caps text-label-caps uppercase transition-all ${
                activeCategory === cat
                  ? 'bg-brand text-white'
                  : 'bg-surface-container dark:bg-dark-surface-container text-ink-muted dark:text-dark-ink-muted hover:bg-outline-variant dark:hover:bg-dark-outline-variant'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filtered.map((post) => (
            <Reveal key={post.slug}>
              <BlogCard post={post} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
