import React, { useState } from 'react';
import { Copy, Check, Search } from 'lucide-react';
import { CSS_CATEGORIES } from '../../utils/cssUtils';

interface CssTabProps {
  computedCss: Record<string, string>;
  inlineStyles: Record<string, string>;
}

export const CssTab: React.FC<CssTabProps> = ({ computedCss, inlineStyles }) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const categories = ['All', 'Inline Styles', ...Object.keys(CSS_CATEGORIES)];

  let entries: [string, string][] = [];

  if (selectedCat === 'Inline Styles') {
    entries = Object.entries(inlineStyles);
  } else if (selectedCat === 'All') {
    entries = Object.entries(computedCss);
  } else {
    const validProps = CSS_CATEGORIES[selectedCat] || [];
    entries = Object.entries(computedCss).filter(([k]) => validProps.includes(k));
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    entries = entries.filter(([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q));
  }

  return (
    <div className="space-y-3 text-xs">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search CSS properties or values..."
          className="w-full bg-bg-secondary border border-border-subtle rounded-md pl-8 pr-3 py-1.5 text-text-primary text-xs placeholder-text-muted focus:outline-none focus:border-accent"
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
              selectedCat === cat
                ? 'bg-accent text-white'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
            }`}
          >
            {cat} {cat === 'Inline Styles' ? `(${Object.keys(inlineStyles).length})` : ''}
          </button>
        ))}
      </div>

      <div className="text-[11px] text-text-muted">
        Showing {entries.length} properties
      </div>

      {/* Property List */}
      <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
        {entries.length === 0 ? (
          <div className="text-center text-text-muted py-6">No matching CSS properties found.</div>
        ) : (
          entries.map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between py-1 px-2 rounded hover:bg-bg-secondary border border-transparent hover:border-border-subtle transition-all font-mono"
            >
              <span className="text-text-secondary w-36 truncate">{k}</span>
              <span className="text-text-primary flex-1 text-right truncate pr-2" title={v}>
                {v}
              </span>
              <button
                onClick={() => handleCopy(`${k}: ${v};`, k)}
                className="p-1 hover:bg-bg-tertiary rounded text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center"
                title="Copy declaration"
              >
                {copiedKey === k ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

