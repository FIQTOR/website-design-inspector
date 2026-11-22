import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { InspectedElementData } from '../../types/inspector';

interface OverviewTabProps {
  data: InspectedElementData;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ data }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const rows = [
    { label: 'HTML Tag', value: `<${data.tagName.toLowerCase()}>`, copyVal: `<${data.tagName.toLowerCase()}>` },
    { label: 'Element ID', value: data.id || '(none)', copyVal: data.id || '' },
    { label: 'Classes', value: data.classList.length ? data.classList.join(' ') : '(none)', copyVal: data.classList.join(' ') },
    { label: 'Selector', value: data.selector, copyVal: data.selector },
    { label: 'Dimensions', value: `${Math.round(data.dimensions.width)}px × ${Math.round(data.dimensions.height)}px`, copyVal: `${Math.round(data.dimensions.width)}px * ${Math.round(data.dimensions.height)}px` },
    { label: 'Position', value: `X: ${Math.round(data.position.x)}px, Y: ${Math.round(data.position.y)}px`, copyVal: `x: ${data.position.x}px, y: ${data.position.y}px` },
    { label: 'Display', value: data.display, copyVal: data.display },
    { label: 'Position Type', value: data.positionType, copyVal: data.positionType },
    { label: 'Visibility', value: data.visibility, copyVal: data.visibility },
    { label: 'Z-Index', value: data.zIndex, copyVal: data.zIndex },
    { label: 'Opacity', value: data.opacity, copyVal: data.opacity },
    { label: 'Viewport Size', value: `${data.responsive.viewportWidth} × ${data.responsive.viewportHeight} (DPR: ${data.responsive.devicePixelRatio})`, copyVal: `${data.responsive.viewportWidth}x${data.responsive.viewportHeight}` },
  ];

  return (
    <div className="space-y-1.5 text-xs">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between py-1 px-2 rounded hover:bg-bg-secondary border border-transparent hover:border-border-subtle transition-all"
        >
          <span className="text-text-secondary font-mono w-28 truncate">{row.label}</span>
          <span className="text-text-primary font-mono flex-1 text-right truncate pr-2" title={row.value}>
            {row.value}
          </span>
          <button
            onClick={() => handleCopy(row.copyVal, row.label)}
            className="p-1 hover:bg-bg-tertiary rounded text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center"
            title="Copy value"
          >
            {copiedKey === row.label ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      ))}
    </div>
  );
};

