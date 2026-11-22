/**
 * Utility functions for color conversion and detection
 */

export interface ColorConversionResult {
  hex: string;
  rgb: string;
  hsl: string;
  isTransparentOrNone: boolean;
  isGradientOrImage: boolean;
}

export function parseCssColor(colorStr: string): ColorConversionResult {
  const trimmed = colorStr ? colorStr.trim() : '';

  if (!trimmed || trimmed === 'transparent' || trimmed === 'rgba(0, 0, 0, 0)' || trimmed === 'none') {
    return {
      hex: 'transparent',
      rgb: 'rgba(0, 0, 0, 0)',
      hsl: 'transparent',
      isTransparentOrNone: true,
      isGradientOrImage: false
    };
  }

  if (
    trimmed.includes('gradient(') ||
    trimmed.startsWith('url(') ||
    trimmed.includes('linear-gradient') ||
    trimmed.includes('radial-gradient') ||
    trimmed.includes('conic-gradient')
  ) {
    return {
      hex: 'gradient/image',
      rgb: trimmed,
      hsl: 'gradient/image',
      isTransparentOrNone: false,
      isGradientOrImage: true
    };
  }

  // Parse using browser DOM via canvas or dummy element
  const parsed = parseRgbaFromCss(trimmed);
  if (!parsed) {
    return {
      hex: trimmed,
      rgb: trimmed,
      hsl: trimmed,
      isTransparentOrNone: false,
      isGradientOrImage: false
    };
  }

  const { r, g, b, a } = parsed;

  const hex = rgbaToHex(r, g, b, a);
  const rgb = a < 1 ? `rgba(${r}, ${g}, ${b}, ${round(a, 2)})` : `rgb(${r}, ${g}, ${b})`;
  const hsl = rgbaToHsl(r, g, b, a);

  return {
    hex,
    rgb,
    hsl,
    isTransparentOrNone: a === 0,
    isGradientOrImage: false
  };
}

function parseRgbaFromCss(colorStr: string): { r: number; g: number; b: number; a: number } | null {
  // Check for rgb(r, g, b) or rgba(r, g, b, a)
  const rgbaMatch = colorStr.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (rgbaMatch) {
    return {
      r: Math.round(parseFloat(rgbaMatch[1])),
      g: Math.round(parseFloat(rgbaMatch[2])),
      b: Math.round(parseFloat(rgbaMatch[3])),
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1
    };
  }

  // Check modern rgb(r g b / a)
  const modernMatch = colorStr.match(/rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\s*\)/i);
  if (modernMatch) {
    let alpha = 1;
    if (modernMatch[4]) {
      alpha = modernMatch[4].endsWith('%') ? parseFloat(modernMatch[4]) / 100 : parseFloat(modernMatch[4]);
    }
    return {
      r: Math.round(parseFloat(modernMatch[1])),
      g: Math.round(parseFloat(modernMatch[2])),
      b: Math.round(parseFloat(modernMatch[3])),
      a: alpha
    };
  }

  // Check #HEX
  if (colorStr.startsWith('#')) {
    let hex = colorStr.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
        a: 1
      };
    } else if (hex.length === 8) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
        a: round(parseInt(hex.substring(6, 8), 16) / 255, 2)
      };
    }
  }

  return null;
}

function rgbaToHex(r: number, g: number, b: number, a: number): string {
  const toHex = (n: number) => {
    const hex = Math.min(255, Math.max(0, Math.round(n))).toString(16).toUpperCase();
    return hex.length === 1 ? '0' + hex : hex;
  };

  if (a < 1) {
    const alphaHex = toHex(Math.round(a * 255));
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`;
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbaToHsl(r: number, g: number, b: number, a: number): string {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h = Math.round(h * 60);
  }

  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  if (a < 1) {
    return `hsla(${h}, ${sPercent}%, ${lPercent}%, ${round(a, 2)})`;
  }
  return `hsl(${h}, ${sPercent}%, ${lPercent}%)`;
}

function round(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

