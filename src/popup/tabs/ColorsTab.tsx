import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { ColorEntry } from '../../types/inspector';

interface ColorsTabProps {
  colors: ColorEntry[];
}

export const ColorsTab: React.FC<ColorsTabProps> = ({ colors }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  if (!colors || colors.length === 0) {
    return <div className="text-center text-xs text-text-muted py-6">No color attributes detected.</div>;
  }

  return (
    <div className="space-y-3">
      {colors.map((c, i) => (
        <div key={i} className="bg-bg-secondary border border-border-subtle rounded-lg p-3 text-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {!c.isGradientOrImage && !c.isTransparentOrNone && (
                <span
                  className="w-4 h-4 rounded border border-white/20 inline-block shadow-sm"
                  style={{ backgroundColor: c.raw }}
                />
              )}
              <span className="font-semibold text-text-primary">{c.property}</span>
            </div>
            {c.isTransparentOrNone && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-muted">Transparent</span>
            )}
            {c.isGradientOrImage && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-muted">Gradient / Image</span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between py-0.5">
              <span className="text-text-secondary font-mono text-[11px]">HEX</span>
              <span className="text-text-primary font-mono text-[11px] truncate max-w-[200px]">{c.hex}</span>
              <button
                onClick={() => handleCopy(c.hex, `${i}-hex`)}
                className="p-1 hover:bg-bg-tertiary rounded text-text-secondary hover:text-text-primary"
              >
                {copiedKey === `${i}-hex` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-text-secondary font-mono text-[11px]">RGB</span>
              <span className="text-text-primary font-mono text-[11px] truncate max-w-[200px]">{c.rgb}</span>
              <button
                onClick={() => handleCopy(c.rgb, `${i}-rgb`)}
                className="p-1 hover:bg-bg-tertiary rounded text-text-secondary hover:text-text-primary"
              >
                {copiedKey === `${i}-rgb` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-text-secondary font-mono text-[11px]">HSL</span>
              <span className="text-text-primary font-mono text-[11px] truncate max-w-[200px]">{c.hsl}</span>
              <button
                onClick={() => handleCopy(c.hsl, `${i}-hsl`)}
                className="p-1 hover:bg-bg-tertiary rounded text-text-secondary hover:text-text-primary"
              >
                {copiedKey === `${i}-hsl` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

