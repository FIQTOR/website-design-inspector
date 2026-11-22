import { describe, it, expect } from 'vitest';
import { parseCssColor } from './colorUtils';

describe('colorUtils', () => {
  it('correctly parses hex colors', () => {
    const res = parseCssColor('#7C3AED');
    expect(res.hex).toBe('#7C3AED');
    expect(res.rgb).toBe('rgb(124, 58, 237)');
    expect(res.isTransparentOrNone).toBe(false);
  });

  it('correctly parses rgba string', () => {
    const res = parseCssColor('rgba(124, 58, 237, 0.5)');
    expect(res.rgb).toBe('rgba(124, 58, 237, 0.5)');
    expect(res.hex.toLowerCase()).toBe('#7c3aed80');
    expect(res.isTransparentOrNone).toBe(false);
  });

  it('correctly handles transparent colors', () => {
    const res = parseCssColor('transparent');
    expect(res.isTransparentOrNone).toBe(true);
    expect(res.hex).toBe('transparent');

    const res2 = parseCssColor('rgba(0, 0, 0, 0)');
    expect(res2.isTransparentOrNone).toBe(true);
  });

  it('detects gradients and background images without faking solid colors', () => {
    const res = parseCssColor('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
    expect(res.isGradientOrImage).toBe(true);
    expect(res.hex).toBe('gradient/image');
  });
});

