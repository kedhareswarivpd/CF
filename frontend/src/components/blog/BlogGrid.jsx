import { useState } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Reveal from '../ui/Reveal.jsx';
import BlogCard from './BlogCard.jsx';

export default function BlogGrid({ posts, categories }) {
  const [activeCategory, setActiveCategory] = useState('All');
  if (!posts) return <LoadingSpinner />;
  if (!posts.length) return <EmptyState icon="article" title="No blog posts yet" description="Stay tuned!" />;

  const filtered = activeCategory === 'All'
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  return (
    <section className="py-section-padding">
      <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop">
        <div className="mb-stack-lg flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 font-label-caps text-label-caps uppercase transition-all ${
                activeCategory === cat
                  ? 'bg-brand text-white'
                  : 'bg-brand-dark text-white hover:bg-brand dark:bg-dark-surface-container dark:text-white dark:hover:bg-dark-outline-variant'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <Reveal key={post.slug} from="zoom" delay={i * 80}>
              <BlogCard post={post} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
