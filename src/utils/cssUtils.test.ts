import { describe, it, expect } from 'vitest';
import { formatCompactCss, formatCssRules, generateDesignSummary } from './cssUtils';
import { InspectedElementData } from '../types/inspector';

const mockData: InspectedElementData = {
  tagName: 'BUTTON',
  id: 'submit-btn',
  classList: ['btn', 'btn-primary'],
  selector: '#submit-btn',
  dimensions: { width: 120, height: 40 },
  position: { x: 50, y: 100, top: 100, left: 50 },
  display: 'inline-flex',
  positionType: 'relative',
  visibility: 'visible',
  zIndex: '10',
  opacity: '1',
  htmlSnippet: '<button id="submit-btn" class="btn btn-primary">Submit</button>',
  isSvg: false,
  isInIframe: false,
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: '20px',
    letterSpacing: 'normal',
    textAlign: 'center',
    textTransform: 'none',
    textDecoration: 'none',
    textColor: '#FFFFFF'
  },
  colors: [
    {
      property: 'Color',
      raw: '#FFFFFF',
      hex: '#FFFFFF',
      rgb: 'rgb(255, 255, 255)',
      hsl: 'hsl(0, 0%, 100%)',
      isTransparentOrNone: false
    },
    {
      property: 'Background Color',
      raw: '#7C3AED',
      hex: '#7C3AED',
      rgb: 'rgb(124, 58, 237)',
      hsl: 'hsl(262, 83%, 58%)',
      isTransparentOrNone: false
    }
  ],
  spacing: {
    margin: '0px 0px 10px 0px',
    padding: '8px 16px',
    gap: '8px',
    rowGap: 'normal',
    columnGap: 'normal',
    borderRadius: '6px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#6D28D9',
    width: '120px',
    height: '40px',
    minWidth: 'auto',
    maxWidth: 'none',
    minHeight: 'auto',
    maxHeight: 'none',
    display: 'inline-flex',
    boxSizing: 'border-box',
    boxModel: {
      margin: { top: 0, right: 0, bottom: 10, left: 0 },
      padding: { top: 8, right: 16, bottom: 8, left: 16 },
      border: { top: 1, right: 1, bottom: 1, left: 1 },
      content: { width: 86, height: 22 }
    }
  },
  computedCss: {
    'display': 'inline-flex',
    'position': 'relative',
    'background-color': '#7C3AED',
    'color': '#FFFFFF'
  },
  inlineStyles: {},
  responsive: {
    viewportWidth: 1920,
    viewportHeight: 1080,
    devicePixelRatio: 1,
    scrollX: 0,
    scrollY: 0,
    url: 'https://example.com'
  },
  timestamp: Date.now()
};

describe('cssUtils', () => {
  it('formats compact CSS cleanly', () => {
    const compact = formatCompactCss(mockData);
    expect(compact).toContain('#submit-btn {');
    expect(compact).toContain('display: inline-flex;');
    expect(compact).toContain('position: relative;');
    expect(compact).toContain('font-family: Inter, sans-serif;');
    expect(compact).toContain('background-color: #7C3AED;');
  });

  it('generates accurate design summary text', () => {
    const summary = generateDesignSummary(mockData);
    expect(summary).toContain('Website Design Inspector Summary');
    expect(summary).toContain('Selector: #submit-btn');
    expect(summary).toContain('Font Family: Inter, sans-serif');
    expect(summary).toContain('Window Size: 1920px x 1080px');
  });

  it('formats computed rules block', () => {
    const rules = formatCssRules(mockData);
    expect(rules).toContain('#submit-btn {');
    expect(rules).toContain('background-color: #7C3AED;');
  });
});

