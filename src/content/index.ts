import { ElementHighlighter } from './highlighter';
import { InspectorPanelOverlay } from './inspector';
import { extractElementDesign } from './styleExtractor';
import { InspectedElementData } from '../types/inspector';

/**
 * Main Content Script Entry point
 * Handles hover highlighting, element clicking, messaging with extension popup,
 * and presenting the detached shadow DOM inspector panel.
 */

class ContentInspectorManager {
  private isInspecting: boolean = false;
  private highlighter: ElementHighlighter | null = null;
  private panelOverlay: InspectorPanelOverlay | null = null;
  private hoveredElement: HTMLElement | SVGElement | null = null;
  private selectedElement: HTMLElement | SVGElement | null = null;

  constructor() {
    this.highlighter = new ElementHighlighter();
    this.panelOverlay = new InspectorPanelOverlay(() => {
      this.clearSelection();
    });

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    this.listenToMessages();
    this.checkInitialState();
  }

  private listenToMessages(): void {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'START_INSPECTION') {
        this.startInspection();
        sendResponse({ success: true, isInspecting: true });
      } else if (message.type === 'STOP_INSPECTION') {
        this.stopInspection();
        sendResponse({ success: true, isInspecting: false });
      } else if (message.type === 'GET_INSPECTION_STATUS') {
        sendResponse({ isInspecting: this.isInspecting });
      } else if (message.type === 'CLOSE_INSPECTOR_OVERLAY') {
        this.clearSelection();
        sendResponse({ success: true });
      }
      return true; // asynchronous response
    });
  }

  private checkInitialState(): void {
    try {
      chrome.storage.local.get(['isInspecting'], (res) => {
        if (res && res.isInspecting) {
          this.startInspection();
        }
      });
    } catch {
      // storage access might not be ready
    }
  }

  public startInspection(): void {
    if (this.isInspecting) return;
    this.isInspecting = true;

    document.addEventListener('mouseover', this.onMouseMove, true);
    document.addEventListener('click', this.onClick, true);
    document.addEventListener('keydown', this.onKeyDown, true);

    chrome.storage.local.set({ isInspecting: true });
  }

  public stopInspection(): void {
    if (!this.isInspecting) return;
    this.isInspecting = false;

    document.removeEventListener('mouseover', this.onMouseMove, true);
    document.removeEventListener('click', this.onClick, true);
    document.removeEventListener('keydown', this.onKeyDown, true);

    if (this.highlighter) {
      this.highlighter.clearAll();
    }
    chrome.storage.local.set({ isInspecting: false });
  }

  private isOurOwnElement(target: EventTarget | null): boolean {
    if (!target || !(target instanceof Element)) return false;
    if (target.id === '__wdi_highlighter_host__' || target.id === '__wdi_panel_host__') return true;
    if (target.closest && (target.closest('#__wdi_highlighter_host__') || target.closest('#__wdi_panel_host__'))) {
      return true;
    }
    return false;
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isInspecting) return;
    const target = e.target as HTMLElement | SVGElement | null;
    if (!target || this.isOurOwnElement(target)) return;

    this.hoveredElement = target;
    if (this.highlighter) {
      this.highlighter.highlightHover(target);
    }
  }

  private onClick(e: MouseEvent): void {
    if (!this.isInspecting) return;
    const target = e.target as HTMLElement | SVGElement | null;

    if (!target || this.isOurOwnElement(target)) return;

    // Stop natural event propagation and default link/button actions when in inspect mode
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    this.selectElement(target);
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (this.selectedElement) {
        this.clearSelection();
      } else {
        this.stopInspection();
      }
    }
  }

  private selectElement(el: HTMLElement | SVGElement): void {
    this.selectedElement = el;
    if (this.highlighter) {
      this.highlighter.clearHover();
      this.highlighter.highlightSelected(el);
    }

    try {
      const designData: InspectedElementData = extractElementDesign(el);

      // Show floating overlay panel
      if (this.panelOverlay) {
        this.panelOverlay.show(designData);
      }

      // Send to runtime message & storage for popup sync
      chrome.runtime.sendMessage({
        type: 'ELEMENT_SELECTED',
        data: designData
      }).catch(() => {
        // popup might not be open right now, which is normal
      });

      // Save to recent inspections in chrome.storage.local
      this.saveToRecentInspections(designData);

    } catch (err) {
      console.error('[Website Design Inspector] Failed extracting styles:', err);
    }
  }

  private saveToRecentInspections(data: InspectedElementData): void {
    try {
      chrome.storage.local.get(['recentInspections'], (res) => {
        const list = Array.isArray(res.recentInspections) ? res.recentInspections : [];
        const newItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          selector: data.selector,
          tagName: data.tagName,
          timestamp: data.timestamp,
          url: data.responsive.url,
          data
        };
        const updated = [newItem, ...list.slice(0, 9)];
        chrome.storage.local.set({
          recentInspections: updated,
          lastInspectedElement: data
        });
      });
    } catch {
      // Ignore storage errors in sandbox
    }
  }

  private clearSelection(): void {
    this.selectedElement = null;
    if (this.highlighter) {
      this.highlighter.clearSelected();
    }
    if (this.panelOverlay) {
      this.panelOverlay.hide();
    }
  }
}

// Instantiate manager singleton
if (!(window as any).__WDI_MANAGER__) {
  (window as any).__WDI_MANAGER__ = new ContentInspectorManager();
}

