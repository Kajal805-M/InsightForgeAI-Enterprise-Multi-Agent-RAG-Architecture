import { describe, it, expect } from 'vitest';
import { Skeleton, SkeletonCard } from '../src/components/Skeleton';
import { Button } from '../src/components/Button';

describe('UI Components', () => {
  it('renders a Skeleton loader correctly', () => {
    const html = Skeleton('h-10 w-10');
    expect(html).toContain('animate-pulse');
    expect(html).toContain('h-10 w-10');
  });

  it('renders a Skeleton Card correctly', () => {
    const html = SkeletonCard();
    expect(html).toContain('rounded-xl border');
    expect(html).toContain('animate-pulse');
  });

  it('renders a Button component correctly', () => {
    const btn = Button({ text: 'Submit' });
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.textContent).toContain('Submit');
  });
});
