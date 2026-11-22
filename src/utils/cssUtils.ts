import { InspectedElementData } from '../types/inspector';

/**
 * Utility functions for CSS formatting and categorization
 */

export const CSS_CATEGORIES: Record<string, string[]> = {
  Layout: [
    'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
    'overflow', 'overflow-x', 'overflow-y', 'float', 'clear', 'visibility'
  ],
  'Flex & Grid': [
    'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content', 'align-items',
    'align-content', 'gap', 'row-gap', 'column-gap', 'flex-grow', 'flex-shrink',
    'flex-basis', 'align-self', 'grid-template-columns', 'grid-template-rows',
    'grid-template-areas', 'grid-auto-columns', 'grid-auto-rows', 'grid-auto-flow'
  ],
  BoxModel: [
    'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'box-sizing'
  ],
  Typography: [
    'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
    'letter-spacing', 'text-align', 'text-transform', 'text-decoration',
    'text-overflow', 'white-space', 'word-break', 'color'
  ],
  Backgrounds: [
    'background-color', 'background-image', 'background-repeat',
    'background-position', 'background-size', 'background-attachment',
    'background-clip', 'background-origin'
  ],
  Borders: [
    'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
    'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
    'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
    'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
    'outline-width', 'outline-style', 'outline-color', 'box-shadow'
  ],
  Effects: [
    'opacity', 'transform', 'transition', 'animation', 'filter', 'backdrop-filter',
    'cursor', 'pointer-events', 'user-select'
  ]
};

export function formatCssRules(data: InspectedElementData): string {
  const lines: string[] = [];
  lines.push(`/* Design Inspector - Generated CSS for ${data.selector} */`);
  lines.push(`${data.selector} {`);

  // Include primary layout & typography
  const entries = Object.entries(data.computedCss).sort(([a], [b]) => a.localeCompare(b));
  for (const [key, val] of entries) {
    if (val && val !== 'none' && val !== 'normal' && val !== 'auto' && val !== 'rgba(0, 0, 0, 0)') {
      lines.push(`  ${key}: ${val};`);
    }
  }

  lines.push(`}`);
  return lines.join('\n');
}

export function formatCompactCss(data: InspectedElementData): string {
  const lines: string[] = [];
  lines.push(`/* Element: ${data.selector} */`);
  lines.push(`${data.selector} {`);
  lines.push(`  display: ${data.display};`);
  if (data.positionType && data.positionType !== 'static') {
    lines.push(`  position: ${data.positionType};`);
    if (data.zIndex && data.zIndex !== 'auto') lines.push(`  z-index: ${data.zIndex};`);
  }
  lines.push(`  width: ${data.spacing.width};`);
  lines.push(`  height: ${data.spacing.height};`);
  lines.push(`  margin: ${data.spacing.margin};`);
  lines.push(`  padding: ${data.spacing.padding};`);
  lines.push(`  box-sizing: ${data.spacing.boxSizing};`);
  
  if (data.typography.fontFamily) lines.push(`  font-family: ${data.typography.fontFamily};`);
  if (data.typography.fontSize) lines.push(`  font-size: ${data.typography.fontSize};`);
  if (data.typography.fontWeight) lines.push(`  font-weight: ${data.typography.fontWeight};`);
  if (data.typography.lineHeight) lines.push(`  line-height: ${data.typography.lineHeight};`);
  if (data.typography.textColor) lines.push(`  color: ${data.typography.textColor};`);

  const bg = data.colors.find(
    c => c.property.toLowerCase() === 'background-color' || c.property.toLowerCase() === 'background color'
  );
  if (bg && !bg.isTransparentOrNone) {
    lines.push(`  background-color: ${bg.hex};`);
  }
  if (data.spacing.borderWidth && data.spacing.borderWidth !== '0px') {
    lines.push(`  border: ${data.spacing.borderWidth} ${data.spacing.borderStyle} ${data.spacing.borderColor};`);
  }
  if (data.spacing.borderRadius && data.spacing.borderRadius !== '0px') {
    lines.push(`  border-radius: ${data.spacing.borderRadius};`);
  }
  lines.push(`}`);
  return lines.join('\n');
}

export function generateDesignSummary(data: InspectedElementData): string {
  return `=== Website Design Inspector Summary ===
Element: <${data.tagName.toLowerCase()}> ${data.id ? `#${data.id}` : ''} ${data.classList.length ? `.${data.classList.join('.')}` : ''}
Selector: ${data.selector}
Dimensions: ${Math.round(data.dimensions.width)}px x ${Math.round(data.dimensions.height)}px
Position: X=${Math.round(data.position.x)}px, Y=${Math.round(data.position.y)}px (Type: ${data.positionType}, Display: ${data.display})

[Typography]
- Font Family: ${data.typography.fontFamily}
- Font Size: ${data.typography.fontSize}
- Font Weight: ${data.typography.fontWeight}
- Line Height: ${data.typography.lineHeight}
- Letter Spacing: ${data.typography.letterSpacing}
- Text Align: ${data.typography.textAlign}
- Color: ${data.typography.textColor}

[Box Model & Spacing]
- Margin: ${data.spacing.margin} (T:${data.spacing.boxModel.margin.top} R:${data.spacing.boxModel.margin.right} B:${data.spacing.boxModel.margin.bottom} L:${data.spacing.boxModel.margin.left})
- Padding: ${data.spacing.padding} (T:${data.spacing.boxModel.padding.top} R:${data.spacing.boxModel.padding.right} B:${data.spacing.boxModel.padding.bottom} L:${data.spacing.boxModel.padding.left})
- Border: ${data.spacing.borderWidth} ${data.spacing.borderStyle} ${data.spacing.borderColor}
- Border Radius: ${data.spacing.borderRadius}
- Box Sizing: ${data.spacing.boxSizing}

[Colors]
${data.colors.map(c => `- ${c.property}: ${c.hex} | ${c.rgb} | ${c.hsl}`).join('\n')}

[Viewport]
- Window Size: ${data.responsive.viewportWidth}px x ${data.responsive.viewportHeight}px (DPR: ${data.responsive.devicePixelRatio})
- Source URL: ${data.responsive.url}
- Inspected At: ${new Date(data.timestamp).toLocaleString()}
`;
}

