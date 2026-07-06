import { useState, useEffect, useRef } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';

export default function GalleryGrid({ albums }) {
  if (!albums) return <LoadingSpinner />;
  if (!albums.length) return <EmptyState icon="photo_library" title="No albums available" description="Gallery is empty." />;
  const [activeAlbum, setActiveAlbum] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const album = albums[activeAlbum];
  const lightboxRef = useRef(null);
  const prevFocusRef = useRef(null);

  useEffect(() => {
    if (!lightbox) return;
    prevFocusRef.current = document.activeElement;
    const timer = setTimeout(() => {
      const firstBtn = lightboxRef.current?.querySelector('button');
      if (firstBtn) firstBtn.focus();
    }, 0);
    return () => {
      clearTimeout(timer);
      prevFocusRef.current?.focus();
    };
  }, [lightbox]);

  const handleLightboxKeyDown = (e) => {
    if (e.key === 'Escape') {
      setLightbox(null);
      return;
    }
    if (e.key === 'ArrowLeft') {
      const prev = (lightbox.index - 1 + album.images.length) % album.images.length;
      setLightbox({ ...album.images[prev], index: prev });
      return;
    }
    if (e.key === 'ArrowRight') {
      const next = (lightbox.index + 1) % album.images.length;
      setLightbox({ ...album.images[next], index: next });
      return;
    }
    if (e.key === 'Tab') {
      const focusable = lightboxRef.current?.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  return (
    <section className="py-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-wrap gap-2 mb-stack-lg">
          {albums.map((a, i) => (
            <button
              key={a.name}
              onClick={() => { setActiveAlbum(i); setLightbox(null); }}
              className={`px-4 py-2 rounded-full font-label-caps text-label-caps uppercase transition-all ${
                activeAlbum === i
                  ? 'bg-brand text-white'
                  : 'bg-surface-container dark:bg-dark-surface-container text-ink-muted dark:text-dark-ink-muted hover:bg-outline-variant dark:hover:bg-dark-outline-variant'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
        {album && (
          <div>
            <Reveal>
              <div className="mb-4">
                <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{album.name}</h3>
                <p className="text-body-md text-ink-muted dark:text-dark-ink-muted">{album.description}</p>
              </div>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {album.images.map((img, i) => (
                <Reveal key={i}>
                  <button
                    onClick={() => setLightbox({ ...img, index: i })}
                    className="w-full aspect-video bg-surface-container dark:bg-dark-surface-container rounded-lg border border-outline-variant dark:border-dark-outline-variant flex items-center justify-center hover:border-brand transition-colors group relative overflow-hidden"
                  >
                    <div className="flex flex-col items-center gap-2 text-ink-muted dark:text-dark-ink-muted group-hover:text-brand dark:group-hover:text-dark-brand transition-colors">
                      <Icon name="image" className="text-4xl" />
                      <span className="text-body-sm px-2 text-center">{img.caption}</span>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>

      {lightbox && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          onKeyDown={handleLightboxKeyDown}
        >
          <div className="bg-white dark:bg-dark-surface rounded-lg max-w-3xl w-full p-stack-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-body text-body-sm text-ink-muted dark:text-dark-ink-muted">{lightbox.caption}</p>
              </div>
              <button onClick={() => setLightbox(null)} className="text-ink-muted dark:text-dark-ink-muted hover:text-brand dark:hover:text-dark-brand">
                <Icon name="close" className="text-2xl" />
              </button>
            </div>
            <div
              tabIndex={0}
              className="aspect-video bg-surface-container dark:bg-dark-surface-container rounded-lg flex items-center justify-center"
            >
              <Icon name="image" className="text-6xl text-ink-muted/40" />
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  const prev = (lightbox.index - 1 + album.images.length) % album.images.length;
                  setLightbox({ ...album.images[prev], index: prev });
                }}
                className="text-ink-muted dark:text-dark-ink-muted hover:text-brand dark:hover:text-dark-brand font-label-caps text-label-caps uppercase flex items-center gap-1"
              >
                <Icon name="chevron_left" /> Previous
              </button>
              <span className="text-body-sm text-ink-muted dark:text-dark-ink-muted">
                {lightbox.index + 1} / {album.images.length}
              </span>
              <button
                onClick={() => {
                  const next = (lightbox.index + 1) % album.images.length;
                  setLightbox({ ...album.images[next], index: next });
                }}
                className="text-ink-muted dark:text-dark-ink-muted hover:text-brand dark:hover:text-dark-brand font-label-caps text-label-caps uppercase flex items-center gap-1"
              >
                Next <Icon name="chevron_right" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
