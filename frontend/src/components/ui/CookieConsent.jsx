import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'corefusion.cookies';
const DEFAULT_PREFS = { essential: true, analytics: false, marketing: false };

function useFocusTrap(active) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;

    const trap = ref.current;
    if (!trap) return;

    const focusable = trap.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    function handler(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    trap.addEventListener('keydown', handler);
    return () => trap.removeEventListener('keydown', handler);
  }, [active]);

  return ref;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const storeAndHide = useCallback((data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* localStorage not available */
    }
    setVisible(false);
    setShowSettings(false);
  }, []);

  const acceptAll = useCallback(() => {
    storeAndHide({ essential: true, analytics: true, marketing: true });
  }, [storeAndHide]);

  const rejectAll = useCallback(() => {
    storeAndHide({ essential: true, analytics: false, marketing: false });
  }, [storeAndHide]);

  const savePreferences = useCallback(() => {
    storeAndHide(prefs);
  }, [prefs, storeAndHide]);

  const modalRef = useFocusTrap(showSettings);

  if (!visible) return null;

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-brand-dark text-white px-margin-mobile md:px-margin-desktop py-stack-lg"
        role="region"
        aria-label="Cookie consent banner"
      >
        <p className="text-body-sm mb-stack-md max-w-container mx-auto">
          We use cookies to enhance your experience. By continuing to visit this site you agree to
          our use of cookies.
        </p>
        <div className="flex flex-wrap gap-4 max-w-container mx-auto">
          <button
            onClick={acceptAll}
            className="bg-white dark:bg-dark-surface text-brand-dark dark:text-dark-brand px-6 py-2 rounded font-label-caps text-label-caps uppercase hover:bg-accent-cyan transition-colors"
          >
            Accept All
          </button>
          <button
            onClick={rejectAll}
            className="border border-white/40 text-white px-6 py-2 rounded font-label-caps text-label-caps uppercase hover:bg-white/10 transition-colors"
          >
            Reject All
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="text-accent-cyan underline font-label-caps text-label-caps uppercase hover:text-white transition-colors"
          >
            Cookie Settings
          </button>
        </div>
      </div>

      {showSettings && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
        >
          <div
            ref={modalRef}
            className="bg-white dark:bg-dark-surface rounded-lg p-stack-lg max-w-sm w-full text-ink dark:text-dark-ink"
          >
            <h3
              id="cookie-settings-title"
              className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-4"
            >
              Cookie Settings
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between py-2">
                <span className="text-body-md">Essential</span>
                <input type="checkbox" checked disabled className="accent-brand" />
              </label>
              <label className="flex items-center justify-between py-2">
                <span className="text-body-md">Analytics</span>
                <input
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                  className="accent-brand"
                />
              </label>
              <label className="flex items-center justify-between py-2">
                <span className="text-body-md">Marketing</span>
                <input
                  type="checkbox"
                  checked={prefs.marketing}
                  onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                  className="accent-brand"
                />
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={savePreferences}
                className="flex-1 bg-brand text-white py-2.5 rounded font-label-caps text-label-caps uppercase hover:bg-brand-dark transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 border border-outline-variant dark:border-dark-outline-variant text-ink dark:text-dark-ink py-2.5 rounded font-label-caps text-label-caps uppercase hover:bg-surface-dim dark:hover:bg-dark-surface-dim transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
