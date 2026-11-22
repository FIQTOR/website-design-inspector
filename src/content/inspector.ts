import { CSS_CATEGORIES, formatCompactCss } from '../utils/cssUtils';
import { InspectedElementData } from '../types/inspector';
import { exportAsCssFile, exportAsJsonFile, exportAsTxtFile } from '../utils/exportUtils';

export class InspectorPanelOverlay {
  private host: HTMLElement | null = null;
  private shadow: ShadowRoot | null = null;
  private container: HTMLElement | null = null;
  private currentData: InspectedElementData | null = null;
  private activeTab: 'overview' | 'typography' | 'colors' | 'spacing' | 'css' = 'overview';
  private onCloseCallback: () => void;
  private cssSearchQuery: string = '';
  private selectedCssCategory: string = 'All';

  constructor(onClose: () => void) {
    this.onCloseCallback = onClose;
    this.init();
  }

  private init(): void {
    if (this.host) return;

    this.host = document.createElement('div');
    this.host.id = '__wdi_panel_host__';
    this.host.style.position = 'fixed';
    this.host.style.bottom = '20px';
    this.host.style.right = '20px';
    this.host.style.zIndex = '2147483647';
    this.host.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

    this.shadow = this.host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      .panel-window {
        width: 480px;
        max-width: calc(100vw - 40px);
        height: 600px;
        max-height: calc(100vh - 40px);
        background: #0D1117;
        color: #F0F6FC;
        border: 1px solid #30363D;
        border-radius: 12px;
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(12px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .panel-header {
        background: #161B22;
        padding: 12px 16px;
        border-bottom: 1px solid #30363D;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .title-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .logo-icon {
        width: 18px;
        height: 18px;
        color: #7C3AED;
      }
      .app-title {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.3px;
        color: #F0F6FC;
      }
      .header-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .btn-icon {
        background: transparent;
        border: none;
        color: #8B949E;
        cursor: pointer;
        padding: 4px 6px;
        border-radius: 6px;
        font-size: 12px;
        display: inline-flex;
        align-items: center;
        transition: all 0.15s;
      }
      .btn-icon:hover {
        background: #21262D;
        color: #F0F6FC;
      }
      .btn-icon.close-btn:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #EF4444;
      }
      .element-banner {
        background: #161B22;
        padding: 8px 16px;
        border-bottom: 1px solid #30363D;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }
      .selector-code {
        color: #A78BFA;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 320px;
      }
      .dimension-tag {
        color: #8B949E;
        font-size: 11px;
      }
      .tab-bar {
        display: flex;
        background: #161B22;
        border-bottom: 1px solid #30363D;
        overflow-x: auto;
      }
      .tab-btn {
        flex: 1;
        padding: 8px 10px;
        background: transparent;
        border: none;
        border-bottom: 2px solid transparent;
        color: #8B949E;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        text-align: center;
        transition: all 0.15s;
        white-space: nowrap;
      }
      .tab-btn:hover {
        color: #F0F6FC;
      }
      .tab-btn.active {
        color: #A78BFA;
        border-bottom-color: #7C3AED;
        background: rgba(124, 58, 237, 0.08);
      }
      .panel-content {
        flex: 1;
        overflow-y: auto;
        padding: 14px 16px;
      }
      .panel-content::-webkit-scrollbar {
        width: 6px;
      }
      .panel-content::-webkit-scrollbar-thumb {
        background: #30363D;
        border-radius: 3px;
      }
      .panel-content::-webkit-scrollbar-track {
        background: #0D1117;
      }
      .prop-grid {
        display: grid;
        grid-template-columns: 140px 1fr auto;
        gap: 8px;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid rgba(48, 54, 61, 0.6);
        font-size: 12px;
      }
      .prop-name {
        color: #8B949E;
        font-family: ui-monospace, SFMono-Regular, monospace;
      }
      .prop-val {
        color: #F0F6FC;
        font-family: ui-monospace, SFMono-Regular, monospace;
        word-break: break-all;
      }
      .copy-btn {
        background: #21262D;
        border: 1px solid #30363D;
        color: #8B949E;
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 10px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .copy-btn:hover {
        background: #30363D;
        color: #F0F6FC;
      }
      .copy-btn.copied {
        background: #10B981;
        color: #FFFFFF;
        border-color: #10B981;
      }
      .box-model-container {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 16px 0;
        font-family: ui-monospace, SFMono-Regular, monospace;
        font-size: 11px;
      }
      .bm-box {
        border-radius: 6px;
        padding: 20px 24px;
        text-align: center;
        position: relative;
      }
      .bm-margin {
        background: rgba(245, 158, 11, 0.12);
        border: 1px dashed rgba(245, 158, 11, 0.6);
        color: #F59E0B;
      }
      .bm-border {
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.6);
        color: #EF4444;
      }
      .bm-padding {
        background: rgba(16, 185, 129, 0.12);
        border: 1px dashed rgba(16, 185, 129, 0.6);
        color: #10B981;
      }
      .bm-content {
        background: rgba(59, 130, 246, 0.18);
        border: 1px solid rgba(59, 130, 246, 0.6);
        color: #60A5FA;
        padding: 12px 18px;
      }
      .bm-label {
        position: absolute;
        top: 2px;
        left: 6px;
        font-size: 9px;
        text-transform: uppercase;
        font-weight: 700;
        opacity: 0.8;
      }
      .bm-val-top { position: absolute; top: 2px; left: 50%; transform: translateX(-50%); font-size: 10px; }
      .bm-val-bottom { position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); font-size: 10px; }
      .bm-val-left { position: absolute; left: 4px; top: 50%; transform: translateY(-50%); font-size: 10px; }
      .bm-val-right { position: absolute; right: 4px; top: 50%; transform: translateY(-50%); font-size: 10px; }
      
      .color-preview-chip {
        width: 18px;
        height: 18px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
      }
      .color-card {
        background: #161B22;
        border: 1px solid #30363D;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 10px;
      }
      .color-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .badge-indicator {
        font-size: 10px;
        padding: 2px 6px;
        background: #21262D;
        border-radius: 4px;
        color: #8B949E;
      }
      .footer-actions {
        padding: 12px 16px;
        background: #161B22;
        border-top: 1px solid #30363D;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .action-btn {
        background: #21262D;
        border: 1px solid #30363D;
        color: #F0F6FC;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: all 0.15s;
      }
      .action-btn:hover {
        background: #30363D;
        border-color: #8B949E;
      }
      .action-btn.primary {
        background: #7C3AED;
        border-color: #6D28D9;
      }
      .action-btn.primary:hover {
        background: #6D28D9;
      }
      .search-box {
        width: 100%;
        background: #161B22;
        border: 1px solid #30363D;
        color: #F0F6FC;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
        margin-bottom: 12px;
        outline: none;
      }
      .search-box:focus {
        border-color: #7C3AED;
      }
      .cat-pill-group {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 12px;
      }
      .cat-pill {
        background: #161B22;
        border: 1px solid #30363D;
        color: #8B949E;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 12px;
        cursor: pointer;
      }
      .cat-pill.active {
        background: #7C3AED;
        color: #FFFFFF;
        border-color: #7C3AED;
      }
    `;

    this.container = document.createElement('div');
    this.container.className = 'panel-window';

    this.shadow.appendChild(style);
    this.shadow.appendChild(this.container);

    document.documentElement.appendChild(this.host);
  }

  public show(data: InspectedElementData): void {
    this.currentData = data;
    if (this.host) {
      this.host.style.display = 'block';
    }
    this.render();
  }

  public hide(): void {
    if (this.host) {
      this.host.style.display = 'none';
    }
  }

  public destroy(): void {
    if (this.host && this.host.parentNode) {
      this.host.parentNode.removeChild(this.host);
    }
    this.host = null;
    this.shadow = null;
    this.container = null;
  }

  private render(): void {
    if (!this.container || !this.currentData) return;
    const d = this.currentData;

    this.container.innerHTML = `
      <div class="panel-header">
        <div class="title-group">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span class="app-title">Website Design Inspector</span>
        </div>
        <div class="header-actions">
          <button class="btn-icon" id="wdi-min-btn" title="Minimize">─</button>
          <button class="btn-icon close-btn" id="wdi-close-btn" title="Close Panel">✕</button>
        </div>
      </div>

      <div class="element-banner">
        <span class="selector-code" title="${d.selector}">${d.selector}</span>
        <span class="dimension-tag">${Math.round(d.dimensions.width)} × ${Math.round(d.dimensions.height)} px</span>
      </div>

      <div class="tab-bar">
        <button class="tab-btn ${this.activeTab === 'overview' ? 'active' : ''}" data-tab="overview">Overview</button>
        <button class="tab-btn ${this.activeTab === 'typography' ? 'active' : ''}" data-tab="typography">Typography</button>
        <button class="tab-btn ${this.activeTab === 'colors' ? 'active' : ''}" data-tab="colors">Colors</button>
        <button class="tab-btn ${this.activeTab === 'spacing' ? 'active' : ''}" data-tab="spacing">Spacing</button>
        <button class="tab-btn ${this.activeTab === 'css' ? 'active' : ''}" data-tab="css">CSS</button>
      </div>

      <div class="panel-content" id="wdi-tab-body">
        ${this.renderTabContent()}
      </div>

      <div class="footer-actions">
        <button class="action-btn" id="wdi-copy-css">Copy CSS</button>
        <button class="action-btn" id="wdi-copy-selector">Copy Selector</button>
        <button class="action-btn" id="wdi-copy-html">Copy HTML</button>
        <button class="action-btn primary" id="wdi-export-menu">Export ▾</button>
      </div>
    `;

    this.attachEventListeners();
  }

  private renderTabContent(): string {
    if (!this.currentData) return '';
    const d = this.currentData;

    switch (this.activeTab) {
      case 'overview':
        return `
          <div class="prop-grid">
            <span class="prop-name">HTML Tag</span>
            <span class="prop-val">&lt;${d.tagName.toLowerCase()}&gt;</span>
            <button class="copy-btn" data-copy="<${d.tagName.toLowerCase()}>">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Element ID</span>
            <span class="prop-val">${d.id || '<em>(none)</em>'}</span>
            <button class="copy-btn" data-copy="${d.id || ''}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Class Name</span>
            <span class="prop-val">${d.classList.join(' ') || '<em>(none)</em>'}</span>
            <button class="copy-btn" data-copy="${d.classList.join(' ')}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Selector</span>
            <span class="prop-val">${d.selector}</span>
            <button class="copy-btn" data-copy="${d.selector}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Dimensions</span>
            <span class="prop-val">${Math.round(d.dimensions.width)}px × ${Math.round(d.dimensions.height)}px</span>
            <button class="copy-btn" data-copy="${Math.round(d.dimensions.width)}px * ${Math.round(d.dimensions.height)}px">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Position (X, Y)</span>
            <span class="prop-val">X: ${Math.round(d.position.x)}px, Y: ${Math.round(d.position.y)}px</span>
            <button class="copy-btn" data-copy="x: ${d.position.x}px, y: ${d.position.y}px">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Display</span>
            <span class="prop-val">${d.display}</span>
            <button class="copy-btn" data-copy="${d.display}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Position Type</span>
            <span class="prop-val">${d.positionType}</span>
            <button class="copy-btn" data-copy="${d.positionType}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Visibility</span>
            <span class="prop-val">${d.visibility}</span>
            <button class="copy-btn" data-copy="${d.visibility}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Z-Index</span>
            <span class="prop-val">${d.zIndex}</span>
            <button class="copy-btn" data-copy="${d.zIndex}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Viewport</span>
            <span class="prop-val">${d.responsive.viewportWidth} × ${d.responsive.viewportHeight} (DPR: ${d.responsive.devicePixelRatio})</span>
            <button class="copy-btn" data-copy="${d.responsive.viewportWidth}x${d.responsive.viewportHeight}">Copy</button>
          </div>
        `;

      case 'typography':
        return `
          <div class="prop-grid">
            <span class="prop-name">Font Family</span>
            <span class="prop-val">${d.typography.fontFamily}</span>
            <button class="copy-btn" data-copy="${d.typography.fontFamily}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Font Size</span>
            <span class="prop-val">${d.typography.fontSize}</span>
            <button class="copy-btn" data-copy="${d.typography.fontSize}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Font Weight</span>
            <span class="prop-val">${d.typography.fontWeight}</span>
            <button class="copy-btn" data-copy="${d.typography.fontWeight}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Font Style</span>
            <span class="prop-val">${d.typography.fontStyle}</span>
            <button class="copy-btn" data-copy="${d.typography.fontStyle}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Line Height</span>
            <span class="prop-val">${d.typography.lineHeight}</span>
            <button class="copy-btn" data-copy="${d.typography.lineHeight}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Letter Spacing</span>
            <span class="prop-val">${d.typography.letterSpacing}</span>
            <button class="copy-btn" data-copy="${d.typography.letterSpacing}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Text Align</span>
            <span class="prop-val">${d.typography.textAlign}</span>
            <button class="copy-btn" data-copy="${d.typography.textAlign}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Text Transform</span>
            <span class="prop-val">${d.typography.textTransform}</span>
            <button class="copy-btn" data-copy="${d.typography.textTransform}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Text Decoration</span>
            <span class="prop-val">${d.typography.textDecoration}</span>
            <button class="copy-btn" data-copy="${d.typography.textDecoration}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Text Color</span>
            <span class="prop-val">${d.typography.textColor}</span>
            <button class="copy-btn" data-copy="${d.typography.textColor}">Copy</button>
          </div>
        `;

      case 'colors':
        return `
          <div style="margin-bottom: 8px; font-size: 11px; color: #8B949E;">Active color properties extracted from computed style:</div>
          ${d.colors.map(c => `
            <div class="color-card">
              <div class="color-card-header">
                <div>
                  ${!c.isGradientOrImage && !c.isTransparentOrNone ? `<span class="color-preview-chip" style="background-color: ${c.raw}"></span>` : ''}
                  <strong>${c.property}</strong>
                </div>
                ${c.isTransparentOrNone ? '<span class="badge-indicator">Transparent</span>' : ''}
                ${c.isGradientOrImage ? '<span class="badge-indicator">Gradient / Image</span>' : ''}
              </div>
              <div class="prop-grid">
                <span class="prop-name">HEX</span>
                <span class="prop-val">${c.hex}</span>
                <button class="copy-btn" data-copy="${c.hex}">Copy</button>
              </div>
              <div class="prop-grid">
                <span class="prop-name">RGB</span>
                <span class="prop-val">${c.rgb}</span>
                <button class="copy-btn" data-copy="${c.rgb}">Copy</button>
              </div>
              <div class="prop-grid">
                <span class="prop-name">HSL</span>
                <span class="prop-val">${c.hsl}</span>
                <button class="copy-btn" data-copy="${c.hsl}">Copy</button>
              </div>
            </div>
          `).join('')}
        `;

      case 'spacing':
        const bm = d.spacing.boxModel;
        return `
          <div class="box-model-container">
            <div class="bm-box bm-margin">
              <span class="bm-label">margin</span>
              <span class="bm-val-top">${bm.margin.top}</span>
              <span class="bm-val-bottom">${bm.margin.bottom}</span>
              <span class="bm-val-left">${bm.margin.left}</span>
              <span class="bm-val-right">${bm.margin.right}</span>

              <div class="bm-box bm-border">
                <span class="bm-label">border</span>
                <span class="bm-val-top">${bm.border.top}</span>
                <span class="bm-val-bottom">${bm.border.bottom}</span>
                <span class="bm-val-left">${bm.border.left}</span>
                <span class="bm-val-right">${bm.border.right}</span>

                <div class="bm-box bm-padding">
                  <span class="bm-label">padding</span>
                  <span class="bm-val-top">${bm.padding.top}</span>
                  <span class="bm-val-bottom">${bm.padding.bottom}</span>
                  <span class="bm-val-left">${bm.padding.left}</span>
                  <span class="bm-val-right">${bm.padding.right}</span>

                  <div class="bm-box bm-content">
                    <span>${bm.content.width} × ${bm.content.height}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="prop-grid">
            <span class="prop-name">Margin</span>
            <span class="prop-val">${d.spacing.margin}</span>
            <button class="copy-btn" data-copy="${d.spacing.margin}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Padding</span>
            <span class="prop-val">${d.spacing.padding}</span>
            <button class="copy-btn" data-copy="${d.spacing.padding}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Gap / Row / Col</span>
            <span class="prop-val">${d.spacing.gap} / ${d.spacing.rowGap} / ${d.spacing.columnGap}</span>
            <button class="copy-btn" data-copy="gap: ${d.spacing.gap}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Border Radius</span>
            <span class="prop-val">${d.spacing.borderRadius}</span>
            <button class="copy-btn" data-copy="${d.spacing.borderRadius}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Border Style</span>
            <span class="prop-val">${d.spacing.borderWidth} ${d.spacing.borderStyle} ${d.spacing.borderColor}</span>
            <button class="copy-btn" data-copy="${d.spacing.borderWidth} ${d.spacing.borderStyle} ${d.spacing.borderColor}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Box Sizing</span>
            <span class="prop-val">${d.spacing.boxSizing}</span>
            <button class="copy-btn" data-copy="${d.spacing.boxSizing}">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Dimensions</span>
            <span class="prop-val">${d.spacing.width} × ${d.spacing.height}</span>
            <button class="copy-btn" data-copy="width: ${d.spacing.width}; height: ${d.spacing.height};">Copy</button>
          </div>
          <div class="prop-grid">
            <span class="prop-name">Min / Max Size</span>
            <span class="prop-val">Min: ${d.spacing.minWidth} × ${d.spacing.minHeight} | Max: ${d.spacing.maxWidth} × ${d.spacing.maxHeight}</span>
            <button class="copy-btn" data-copy="min-width: ${d.spacing.minWidth}; max-width: ${d.spacing.maxWidth};">Copy</button>
          </div>
        `;

      case 'css':
        const categories = ['All', ...Object.keys(CSS_CATEGORIES)];
        let filteredProps = Object.entries(d.computedCss);

        if (this.selectedCssCategory !== 'All') {
          const validKeys = CSS_CATEGORIES[this.selectedCssCategory] || [];
          filteredProps = filteredProps.filter(([key]) => validKeys.includes(key));
        }

        if (this.cssSearchQuery) {
          const q = this.cssSearchQuery.toLowerCase();
          filteredProps = filteredProps.filter(([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q));
        }

        return `
          <input type="text" class="search-box" id="wdi-css-search" placeholder="Search CSS property or value..." value="${this.cssSearchQuery}" />
          <div class="cat-pill-group">
            ${categories.map(cat => `
              <span class="cat-pill ${this.selectedCssCategory === cat ? 'active' : ''}" data-cat="${cat}">${cat}</span>
            `).join('')}
          </div>
          <div style="font-size: 11px; color: #8B949E; margin-bottom: 8px;">Showing ${filteredProps.length} computed CSS properties:</div>
          ${filteredProps.map(([k, v]) => `
            <div class="prop-grid">
              <span class="prop-name">${k}</span>
              <span class="prop-val">${v}</span>
              <button class="copy-btn" data-copy="${k}: ${v};">Copy</button>
            </div>
          `).join('')}
        `;
    }
  }

  private attachEventListeners(): void {
    if (!this.shadow) return;

    this.shadow.getElementById('wdi-close-btn')?.addEventListener('click', () => {
      this.hide();
      this.onCloseCallback();
    });

    let isMinimized = false;
    const body = this.shadow.getElementById('wdi-tab-body');
    this.shadow.getElementById('wdi-min-btn')?.addEventListener('click', (e) => {
      isMinimized = !isMinimized;
      if (body) {
        body.style.display = isMinimized ? 'none' : 'block';
      }
      (e.target as HTMLElement).textContent = isMinimized ? '□' : '─';
    });

    this.shadow.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const tab = target.getAttribute('data-tab') as any;
        if (tab) {
          this.activeTab = tab;
          this.render();
        }
      });
    });

    this.shadow.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const cat = target.getAttribute('data-cat');
        if (cat) {
          this.selectedCssCategory = cat;
          this.render();
        }
      });
    });

    const searchInput = this.shadow.getElementById('wdi-css-search') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.cssSearchQuery = (e.target as HTMLInputElement).value;
        const tabBody = this.shadow?.getElementById('wdi-tab-body');
        if (tabBody) {
          tabBody.innerHTML = this.renderTabContent();
          this.attachCopyButtons();
          const newSearch = this.shadow?.getElementById('wdi-css-search') as HTMLInputElement;
          if (newSearch) {
            newSearch.focus();
            newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
            newSearch.addEventListener('input', (ev) => {
              this.cssSearchQuery = (ev.target as HTMLInputElement).value;
              this.render();
            });
          }
        }
      });
    }

    this.shadow.getElementById('wdi-copy-css')?.addEventListener('click', () => {
      if (this.currentData) {
        this.copyToClipboard(formatCompactCss(this.currentData));
      }
    });

    this.shadow.getElementById('wdi-copy-selector')?.addEventListener('click', () => {
      if (this.currentData) {
        this.copyToClipboard(this.currentData.selector);
      }
    });

    this.shadow.getElementById('wdi-copy-html')?.addEventListener('click', () => {
      if (this.currentData) {
        this.copyToClipboard(this.currentData.htmlSnippet);
      }
    });

    this.shadow.getElementById('wdi-export-menu')?.addEventListener('click', () => {
      if (!this.currentData) return;
      const format = prompt('Choose export format: "css", "json", or "txt"', 'css');
      if (format === 'css') {
        exportAsCssFile(this.currentData);
      } else if (format === 'json') {
        exportAsJsonFile(this.currentData);
      } else if (format === 'txt') {
        exportAsTxtFile(this.currentData);
      }
    });

    this.attachCopyButtons();
  }

  private attachCopyButtons(): void {
    if (!this.shadow) return;
    this.shadow.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const text = target.getAttribute('data-copy') || '';
        this.copyToClipboard(text);
        const originalText = target.textContent;
        target.textContent = 'Copied!';
        target.classList.add('copied');
        setTimeout(() => {
          target.textContent = originalText;
          target.classList.remove('copied');
        }, 1500);
      });
    });
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    });
  }
}
