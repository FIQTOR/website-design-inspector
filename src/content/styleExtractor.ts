import {
  ColorEntry,
  InspectedElementData,
  ResponsiveInfo,
  SpacingLayoutInfo,
  TypographyInfo
} from '../types/inspector';
import { parseCssColor } from '../utils/colorUtils';
import { getCleanHtmlSnippet, getOptimalDomSelector } from './domUtils';

/**
 * Extracts complete design information from an element using CSSOM & ComputedStyle API
 */
export function extractElementDesign(el: HTMLElement | SVGElement): InspectedElementData {
  const computed = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();

  // Typography
  const typography: TypographyInfo = {
    fontFamily: computed.fontFamily || 'inherit',
    fontSize: computed.fontSize || '16px',
    fontWeight: computed.fontWeight || '400',
    fontStyle: computed.fontStyle || 'normal',
    lineHeight: computed.lineHeight || 'normal',
    letterSpacing: computed.letterSpacing || 'normal',
    textAlign: computed.textAlign || 'start',
    textTransform: computed.textTransform || 'none',
    textDecoration: computed.textDecorationLine || computed.textDecoration || 'none',
    textColor: computed.color || '#000000'
  };

  // Colors
  const colors: ColorEntry[] = [];
  const colorProps = [
    { name: 'color', label: 'Color' },
    { name: 'backgroundColor', label: 'Background Color' },
    { name: 'borderColor', label: 'Border Color' },
    { name: 'outlineColor', label: 'Outline Color' },
  ];

  for (const { name, label } of colorProps) {
    const val = (computed as any)[name];
    if (val) {
      const parsed = parseCssColor(val);
      colors.push({
        property: label,
        raw: val,
        hex: parsed.hex,
        rgb: parsed.rgb,
        hsl: parsed.hsl,
        isTransparentOrNone: parsed.isTransparentOrNone,
        isGradientOrImage: parsed.isGradientOrImage
      });
    }
  }

  // Box shadow color extraction if present
  const boxShadow = computed.boxShadow;
  if (boxShadow && boxShadow !== 'none') {
    const parsedShadow = parseCssColor(boxShadow);
    colors.push({
      property: 'Box Shadow',
      raw: boxShadow,
      hex: parsedShadow.hex,
      rgb: parsedShadow.rgb,
      hsl: parsedShadow.hsl,
      isTransparentOrNone: false,
      isGradientOrImage: false
    });
  }

  // Check background image / gradient
  const bgImage = computed.backgroundImage;
  if (bgImage && bgImage !== 'none') {
    colors.push({
      property: 'Background Image / Gradient',
      raw: bgImage,
      hex: 'gradient/image',
      rgb: bgImage,
      hsl: 'gradient/image',
      isTransparentOrNone: false,
      isGradientOrImage: true
    });
  }

  // Box model
  const parsePx = (val: string): number => {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : Math.round(n * 10) / 10;
  };

  const boxModel = {
    margin: {
      top: parsePx(computed.marginTop),
      right: parsePx(computed.marginRight),
      bottom: parsePx(computed.marginBottom),
      left: parsePx(computed.marginLeft)
    },
    padding: {
      top: parsePx(computed.paddingTop),
      right: parsePx(computed.paddingRight),
      bottom: parsePx(computed.paddingBottom),
      left: parsePx(computed.paddingLeft)
    },
    border: {
      top: parsePx(computed.borderTopWidth),
      right: parsePx(computed.borderRightWidth),
      bottom: parsePx(computed.borderBottomWidth),
      left: parsePx(computed.borderLeftWidth)
    },
    content: {
      width: Math.round(rect.width - parsePx(computed.paddingLeft) - parsePx(computed.paddingRight) - parsePx(computed.borderLeftWidth) - parsePx(computed.borderRightWidth)),
      height: Math.round(rect.height - parsePx(computed.paddingTop) - parsePx(computed.paddingBottom) - parsePx(computed.borderTopWidth) - parsePx(computed.borderBottomWidth))
    }
  };

  const spacing: SpacingLayoutInfo = {
    margin: `${computed.marginTop} ${computed.marginRight} ${computed.marginBottom} ${computed.marginLeft}`,
    padding: `${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft}`,
    gap: computed.gap || 'normal',
    rowGap: computed.rowGap || 'normal',
    columnGap: computed.columnGap || 'normal',
    borderRadius: computed.borderRadius || '0px',
    borderWidth: computed.borderWidth || `${computed.borderTopWidth} ${computed.borderRightWidth} ${computed.borderBottomWidth} ${computed.borderLeftWidth}`,
    borderStyle: computed.borderStyle || computed.borderTopStyle || 'none',
    borderColor: computed.borderColor || computed.borderTopColor || 'transparent',
    width: `${Math.round(rect.width)}px (computed: ${computed.width})`,
    height: `${Math.round(rect.height)}px (computed: ${computed.height})`,
    minWidth: computed.minWidth,
    maxWidth: computed.maxWidth,
    minHeight: computed.minHeight,
    maxHeight: computed.maxHeight,
    display: computed.display,
    flexDirection: computed.flexDirection,
    justifyContent: computed.justifyContent,
    alignItems: computed.alignItems,
    flexWrap: computed.flexWrap,
    gridTemplateColumns: computed.gridTemplateColumns,
    gridTemplateRows: computed.gridTemplateRows,
    boxSizing: computed.boxSizing,
    boxModel
  };

  // Collect all computed CSS properties for search & copy
  const computedCss: Record<string, string> = {};
  for (let i = 0; i < computed.length; i++) {
    const propName = computed[i];
    const val = computed.getPropertyValue(propName);
    if (val) {
      computedCss[propName] = val;
    }
  }

  // Collect inline styles if any
  const inlineStyles: Record<string, string> = {};
  if (el.style) {
    for (let i = 0; i < el.style.length; i++) {
      const propName = el.style[i];
      inlineStyles[propName] = el.style.getPropertyValue(propName);
    }
  }

  // Responsive / Viewport
  const responsive: ResponsiveInfo = {
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    url: window.location.href
  };

  const classList = Array.from(el.classList || []).filter(c => !c.startsWith('__wdi_'));

  return {
    tagName: el.tagName,
    id: el.id || '',
    classList,
    selector: getOptimalDomSelector(el),
    dimensions: {
      width: Math.round(rect.width * 10) / 10,
      height: Math.round(rect.height * 10) / 10
    },
    position: {
      x: Math.round(rect.x * 10) / 10,
      y: Math.round(rect.y * 10) / 10,
      top: Math.round(rect.top + window.scrollY),
      left: Math.round(rect.left + window.scrollX)
    },
    display: computed.display,
    positionType: computed.position,
    visibility: computed.visibility,
    zIndex: computed.zIndex,
    opacity: computed.opacity,
    htmlSnippet: getCleanHtmlSnippet(el),
    isSvg: el instanceof SVGElement || el.tagName.toLowerCase() === 'svg',
    isInIframe: window !== window.top,
    typography,
    colors,
    spacing,
    computedCss,
    inlineStyles,
    responsive,
    timestamp: Date.now()
  };
}

