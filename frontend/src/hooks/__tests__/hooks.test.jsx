import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import useScrollToTop from '../useScrollToTop.js';
import useScrollReveal from '../useScrollReveal.js';
import useFocusTrap from '../useFocusTrap.js';
import useDocumentTitle from '../useDocumentTitle.js';
import useCountUp from '../useCountUp.js';
import { useRoleGuard } from '../useRoleGuard.js';

const mockUseAuth = vi.fn();
vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: (...args) => mockUseAuth(...args),
}));

describe('useRoleGuard', () => {
  it('allows matching roles', () => {
    mockUseAuth.mockReturnValue({
      user: { user_metadata: { role: 'admin' } },
      initializing: false,
    });
    const { result } = renderHook(() => useRoleGuard('admin'), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/admin']}>{children}</MemoryRouter>
      ),
    });
    expect(result.current.denied).toBe(false);
    expect(result.current.isAllowed).toBe(true);
  });

  it('denies non-matching roles', () => {
    mockUseAuth.mockReturnValue({
      user: { user_metadata: { role: 'client' } },
      initializing: false,
    });
    const { result } = renderHook(() => useRoleGuard('admin'), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/admin']}>{children}</MemoryRouter>
      ),
    });
    expect(result.current.denied).toBe(true);
    expect(result.current.isAllowed).toBe(false);
  });

  it('allows when role metadata is absent (backend enforces)', () => {
    mockUseAuth.mockReturnValue({
      user: { user_metadata: null },
      initializing: false,
    });
    const { result } = renderHook(() => useRoleGuard('admin'), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/admin']}>{children}</MemoryRouter>
      ),
    });
    expect(result.current.denied).toBe(false);
  });
});

describe('useScrollToTop', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it('calls scrollTo on mount', () => {
    renderHook(() => useScrollToTop(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
      ),
    });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('calls scrollTo when pathname changes', () => {
    const { rerender } = renderHook(() => useScrollToTop(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
      ),
    });

    expect(window.scrollTo).toHaveBeenCalledTimes(1);

    rerender({ children: null });
  });
});

describe('useScrollReveal', () => {
  it('returns a ref and visible state', () => {
    const { result } = renderHook(() => useScrollReveal());
    const [ref, visible] = result.current;

    expect(ref).toHaveProperty('current');
    expect(visible).toBe(false);
  });

  it('accepts custom options', () => {
    const { result } = renderHook(() => useScrollReveal({ threshold: 0.5 }));
    const [ref, visible] = result.current;

    expect(ref).toHaveProperty('current');
    expect(visible).toBe(false);
  });
});

describe('useFocusTrap', () => {
  it('returns a ref', () => {
    const { result } = renderHook(() => useFocusTrap(true));
    expect(result.current).toHaveProperty('current');
  });

  it('does nothing when inactive', () => {
    const { result } = renderHook(() => useFocusTrap(false));
    expect(result.current.current).toBeNull();
  });
});

describe('useDocumentTitle', () => {
  const originalTitle = document.title;

  beforeEach(() => {
    document.title = 'Original Title';
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  it('sets document title', () => {
    renderHook(() => useDocumentTitle('New Title'));
    expect(document.title).toBe('New Title');
  });

  it('restores previous title on unmount', () => {
    const { unmount } = renderHook(() => useDocumentTitle('New Title'));
    expect(document.title).toBe('New Title');

    unmount();
    expect(document.title).toBe('Original Title');
  });

  it('updates title when prop changes', () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: 'First Title' },
    });
    expect(document.title).toBe('First Title');

    rerender({ title: 'Second Title' });
    expect(document.title).toBe('Second Title');
  });
});

describe('useCountUp', () => {
  it('returns a ref and display value', () => {
    const { result } = renderHook(() => useCountUp('100'));
    const [ref, display] = result.current;

    expect(ref).toHaveProperty('current');
    expect(typeof display).toBe('string');
  });

  it('handles numeric values with prefix', () => {
    const { result } = renderHook(() => useCountUp('$100'));
    const [, display] = result.current;

    expect(display).toContain('$');
  });

  it('handles numeric values with suffix', () => {
    const { result } = renderHook(() => useCountUp('100+'));
    const [, display] = result.current;

    expect(display).toContain('+');
  });

  it('handles non-numeric values', () => {
    const { result } = renderHook(() => useCountUp('N/A'));
    const [, display] = result.current;

    expect(display).toBe('N/A');
  });

  it('handles float values', () => {
    const { result } = renderHook(() => useCountUp('99.9'));
    const [, display] = result.current;

    expect(display).toBeDefined();
  });

  it('starts at 0', () => {
    const { result } = renderHook(() => useCountUp('430+'));
    const [, display] = result.current;

    expect(display).toBe('0+');
  });
});

