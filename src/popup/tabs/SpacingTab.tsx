import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { SpacingLayoutInfo } from '../../types/inspector';

interface SpacingTabProps {
  spacing: SpacingLayoutInfo;
}

export const SpacingTab: React.FC<SpacingTabProps> = ({ spacing }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const bm = spacing.boxModel;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const rows = [
    { label: 'Margin', value: spacing.margin, copyVal: `margin: ${spacing.margin};` },
    { label: 'Padding', value: spacing.padding, copyVal: `padding: ${spacing.padding};` },
    { label: 'Gap', value: `${spacing.gap} (Row: ${spacing.rowGap}, Col: ${spacing.columnGap})`, copyVal: `gap: ${spacing.gap};` },
    { label: 'Border Radius', value: spacing.borderRadius, copyVal: `border-radius: ${spacing.borderRadius};` },
    { label: 'Border', value: `${spacing.borderWidth} ${spacing.borderStyle} ${spacing.borderColor}`, copyVal: `border: ${spacing.borderWidth} ${spacing.borderStyle} ${spacing.borderColor};` },
    { label: 'Dimensions', value: `${spacing.width} × ${spacing.height}`, copyVal: `width: ${spacing.width}; height: ${spacing.height};` },
    { label: 'Min/Max W', value: `Min: ${spacing.minWidth} / Max: ${spacing.maxWidth}`, copyVal: `min-width: ${spacing.minWidth}; max-width: ${spacing.maxWidth};` },
    { label: 'Min/Max H', value: `Min: ${spacing.minHeight} / Max: ${spacing.maxHeight}`, copyVal: `min-height: ${spacing.minHeight}; max-height: ${spacing.maxHeight};` },
    { label: 'Box Sizing', value: spacing.boxSizing, copyVal: `box-sizing: ${spacing.boxSizing};` },
    { label: 'Flex Direction', value: spacing.flexDirection || 'none', copyVal: spacing.flexDirection || '' },
    { label: 'Justify Content', value: spacing.justifyContent || 'none', copyVal: spacing.justifyContent || '' },
    { label: 'Align Items', value: spacing.alignItems || 'none', copyVal: spacing.alignItems || '' },
  ];

  return (
    <div className="space-y-4 text-xs">
      {/* Box model visualization */}
      <div className="flex justify-center items-center py-2 font-mono text-[10px]">
        <div className="relative rounded bg-amber-500/10 border border-amber-500/50 p-6 text-center text-amber-500 w-full max-w-[340px]">
          <span className="absolute top-1 left-2 text-[9px] uppercase font-bold opacity-75">margin</span>
          <span className="absolute top-1 left-1/2 -translate-x-1/2">{bm.margin.top}</span>
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2">{bm.margin.bottom}</span>
          <span className="absolute left-2 top-1/2 -translate-y-1/2">{bm.margin.left}</span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2">{bm.margin.right}</span>

          <div className="relative rounded bg-rose-500/10 border border-rose-500/50 p-5 text-center text-rose-500">
            <span className="absolute top-1 left-2 text-[9px] uppercase font-bold opacity-75">border</span>
            <span className="absolute top-1 left-1/2 -translate-x-1/2">{bm.border.top}</span>
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2">{bm.border.bottom}</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2">{bm.border.left}</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2">{bm.border.right}</span>

            <div className="relative rounded bg-emerald-500/10 border border-emerald-500/50 p-4 text-center text-emerald-500">
              <span className="absolute top-1 left-2 text-[9px] uppercase font-bold opacity-75">padding</span>
              <span className="absolute top-1 left-1/2 -translate-x-1/2">{bm.padding.top}</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2">{bm.padding.bottom}</span>
              <span className="absolute left-2 top-1/2 -translate-y-1/2">{bm.padding.left}</span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2">{bm.padding.right}</span>

              <div className="rounded bg-blue-500/20 border border-blue-500/50 py-2 px-3 text-center text-blue-400 font-semibold">
                {bm.content.width} × {bm.content.height}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1">
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
    </div>
  );
};

