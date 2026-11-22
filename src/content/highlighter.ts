/**
 * Manages element highlighting without altering original website layout or DOM hierarchy.
 * Uses an absolutely positioned overlay box attached inside a detached Shadow DOM host.
 */

export class ElementHighlighter {
  private host: HTMLElement | null = null;
  private shadow: ShadowRoot | null = null;
  private hoverBox: HTMLElement | null = null;
  private selectedBox: HTMLElement | null = null;
  private labelBadge: HTMLElement | null = null;

  constructor() {
    this.createOverlay();
  }

  private createOverlay(): void {
    if (this.host) return;

    this.host = document.createElement('div');
    this.host.id = '__wdi_highlighter_host__';
    this.host.style.position = 'absolute';
    this.host.style.top = '0';
    this.host.style.left = '0';
    this.host.style.width = '100%';
    this.host.style.height = '100%';
    this.host.style.pointerEvents = 'none';
    this.host.style.zIndex = '2147483646';

    this.shadow = this.host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      .box {
        position: fixed;
        pointer-events: none;
        box-sizing: border-box;
        transition: all 0.05s ease-out;
        z-index: 2147483646;
        display: none;
      }
      .hover-box {
        border: 2px solid #7C3AED;
        background-color: rgba(124, 58, 237, 0.12);
      }
      .selected-box {
        border: 2px solid #10B981;
        background-color: rgba(16, 185, 129, 0.18);
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
      }
      .badge {
        position: absolute;
        top: -24px;
        left: 0;
        background: #0D1117;
        color: #F0F6FC;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid #30363D;
        white-space: nowrap;
        pointer-events: none;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .badge-tag {
        color: #A78BFA;
      }
      .badge-dim {
        color: #8B949E;
      }
    `;

    this.hoverBox = document.createElement('div');
    this.hoverBox.className = 'box hover-box';

    this.labelBadge = document.createElement('div');
    this.labelBadge.className = 'badge';
    this.hoverBox.appendChild(this.labelBadge);

    this.selectedBox = document.createElement('div');
    this.selectedBox.className = 'box selected-box';

    this.shadow.appendChild(style);
    this.shadow.appendChild(this.hoverBox);
    this.shadow.appendChild(this.selectedBox);

    document.documentElement.appendChild(this.host);
  }

  public highlightHover(el: Element): void {
    if (!this.hoverBox || !this.labelBadge) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    this.hoverBox.style.display = 'block';
    this.hoverBox.style.top = `${rect.top}px`;
    this.hoverBox.style.left = `${rect.left}px`;
    this.hoverBox.style.width = `${rect.width}px`;
    this.hoverBox.style.height = `${rect.height}px`;

    // Position badge above or below depending on boundary
    if (rect.top < 30) {
      this.labelBadge.style.top = '100%';
    } else {
      this.labelBadge.style.top = '-24px';
    }

    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const firstClass = el.classList.length ? `.${el.classList[0]}` : '';
    const dims = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;

    this.labelBadge.innerHTML = `<span class="badge-tag">${tag}${id}${firstClass}</span> <span class="badge-dim">${dims}</span>`;
  }

  public clearHover(): void {
    if (this.hoverBox) {
      this.hoverBox.style.display = 'none';
    }
  }

  public highlightSelected(el: Element): void {
    if (!this.selectedBox) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    this.selectedBox.style.display = 'block';
    this.selectedBox.style.top = `${rect.top}px`;
    this.selectedBox.style.left = `${rect.left}px`;
    this.selectedBox.style.width = `${rect.width}px`;
    this.selectedBox.style.height = `${rect.height}px`;
  }

  public clearSelected(): void {
    if (this.selectedBox) {
      this.selectedBox.style.display = 'none';
    }
  }

  public clearAll(): void {
    this.clearHover();
    this.clearSelected();
  }

  public destroy(): void {
    if (this.host && this.host.parentNode) {
      this.host.parentNode.removeChild(this.host);
    }
    this.host = null;
    this.shadow = null;
    this.hoverBox = null;
    this.selectedBox = null;
    this.labelBadge = null;
  }
}

