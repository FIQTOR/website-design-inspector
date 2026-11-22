import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { TypographyInfo } from '../../types/inspector';

interface TypographyTabProps {
  typography: TypographyInfo;
}

export const TypographyTab: React.FC<TypographyTabProps> = ({ typography }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const rows = [
    { label: 'font-family', value: typography.fontFamily },
    { label: 'font-size', value: typography.fontSize },
    { label: 'font-weight', value: typography.fontWeight },
    { label: 'font-style', value: typography.fontStyle },
    { label: 'line-height', value: typography.lineHeight },
    { label: 'letter-spacing', value: typography.letterSpacing },
    { label: 'text-align', value: typography.textAlign },
    { label: 'text-transform', value: typography.textTransform },
    { label: 'text-decoration', value: typography.textDecoration },
    { label: 'color', value: typography.textColor },
  ];

  return (
    <div className="space-y-1.5 text-xs">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-bg-secondary border border-transparent hover:border-border-subtle transition-all"
        >
          <span className="text-text-secondary font-mono w-28 truncate">{row.label}</span>
          <span className="text-text-primary font-mono flex-1 text-right truncate pr-2" title={row.value}>
            {row.value}
          </span>
          <button
            onClick={() => handleCopy(row.value, row.label)}
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

