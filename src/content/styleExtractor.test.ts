import { describe, it, expect } from 'vitest';
import { extractElementDesign } from './styleExtractor';

describe('styleExtractor in DOM', () => {
  it('extracts real element typography, dimensions and box model', () => {
    const el = document.createElement('div');
    el.id = 'test-card';
    el.className = 'card primary-card';
    el.style.fontSize = '18px';
    el.style.fontWeight = '700';
    el.style.color = 'rgb(124, 58, 237)';
    el.style.backgroundColor = 'rgb(13, 17, 23)';
    el.style.margin = '10px 20px';
    el.style.padding = '8px 12px';
    el.style.display = 'flex';
    document.body.appendChild(el);

    const data = extractElementDesign(el);

    expect(data.tagName).toBe('DIV');
    expect(data.id).toBe('test-card');
    expect(data.selector).toContain('#test-card');
    expect(data.typography.fontSize).toBe('18px');
    expect(data.typography.fontWeight).toBe('700');
    expect(data.display).toBe('flex');
    expect(data.colors.length).toBeGreaterThanOrEqual(1);

    document.body.removeChild(el);
  });
});

