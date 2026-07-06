import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from '../Badge.jsx';

describe('Badge', () => {
  it('renders with children', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText(/new/i)).toBeInTheDocument();
  });

  it('accepts className and merges it', () => {
    const { container } = render(<Badge className="bg-brand">Styled</Badge>);
    const badge = container.firstChild;
    expect(badge.className).toContain('bg-brand');
    expect(badge.className).toContain('rounded-full');
  });
});
