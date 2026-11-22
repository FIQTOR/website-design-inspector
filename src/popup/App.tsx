import React, { useEffect, useState } from 'react';
import {
  Inspect,
  EyeOff,
  Palette,
  Type,
  Code,
  Download,
  ExternalLink,
  Layers,
  History,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { InspectedElementData, RecentInspectionItem } from '../types/inspector';
import { OverviewTab } from './tabs/OverviewTab';
import { TypographyTab } from './tabs/TypographyTab';
import { ColorsTab } from './tabs/ColorsTab';
import { SpacingTab } from './tabs/SpacingTab';
import { CssTab } from './tabs/CssTab';
import { formatCompactCss } from '../utils/cssUtils';
import { exportAsCssFile, exportAsJsonFile, exportAsTxtFile } from '../utils/exportUtils';

export const App: React.FC = () => {
  const [isInspecting, setIsInspecting] = useState(false);
  const [activeTabUrl, setActiveTabUrl] = useState<string>('');
  const [activeTabDomain, setActiveTabDomain] = useState<string>('');
  const [isRestrictedPage, setIsRestrictedPage] = useState(false);
  const [currentElement, setCurrentElement] = useState<InspectedElementData | null>(null);
  const [recentItems, setRecentItems] = useState<RecentInspectionItem[]>([]);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'overview' | 'typography' | 'colors' | 'spacing' | 'css'>('overview');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Get current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        const urlStr = tabs[0].url;
        setActiveTabUrl(urlStr);
        try {
          const parsed = new URL(urlStr);
          setActiveTabDomain(parsed.hostname);
          if (
            urlStr.startsWith('chrome://') ||
            urlStr.startsWith('chrome-extension://') ||
            urlStr.startsWith('edge://') ||
            urlStr.includes('chromewebstore.google.com')
          ) {
            setIsRestrictedPage(true);
          }
        } catch {
          setActiveTabDomain(urlStr);
        }

        // Check if tab is already inspecting
        if (tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_INSPECTION_STATUS' }, (resp) => {
            if (chrome.runtime.lastError) {
              // Content script might not be injected yet
              return;
            }
            if (resp && typeof resp.isInspecting === 'boolean') {
              setIsInspecting(resp.isInspecting);
            }
          });
        }
      }
    });

    // 2. Load stored state
    chrome.storage.local.get(['recentInspections', 'lastInspectedElement', 'isInspecting'], (res) => {
      if (res.recentInspections) setRecentItems(res.recentInspections as RecentInspectionItem[]);
      if (res.lastInspectedElement) setCurrentElement(res.lastInspectedElement as InspectedElementData);
      if (typeof res.isInspecting === 'boolean') setIsInspecting(res.isInspecting);
    });

    // 3. Listen for ELEMENT_SELECTED from content script
    const listener = (msg: any) => {
      if (msg.type === 'ELEMENT_SELECTED' && msg.data) {
        setCurrentElement(msg.data);
        // refresh recents
        chrome.storage.local.get(['recentInspections'], (res) => {
          if (res.recentInspections) setRecentItems(res.recentInspections as RecentInspectionItem[]);
        });
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 2000);
  };

  const toggleInspection = async () => {
    if (isRestrictedPage) {
      alert('Extension content scripts cannot run on browser system pages or Chrome Web Store.');
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;

    const nextState = !isInspecting;

    // Send direct message
    chrome.tabs.sendMessage(
      tab.id,
      { type: nextState ? 'START_INSPECTION' : 'STOP_INSPECTION' },
      async (_res) => {
        if (chrome.runtime.lastError) {
          // Attempt injection if script is not running
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id! },
              files: ['dist/content.js']
            });
            chrome.tabs.sendMessage(tab.id!, {
              type: nextState ? 'START_INSPECTION' : 'STOP_INSPECTION'
            });
          } catch (e) {
            console.error('Cannot inject script:', e);
          }
        }
        setIsInspecting(nextState);
        chrome.storage.local.set({ isInspecting: nextState });
        showNotification(nextState ? 'Inspection mode activated!' : 'Inspection mode stopped.');
      }
    );
  };

  const handleSelectRecent = (item: RecentInspectionItem) => {
    setCurrentElement(item.data);
    showNotification(`Loaded ${item.tagName.toLowerCase()}`);
  };

  const copyCurrentCss = () => {
    if (!currentElement) return;
    navigator.clipboard.writeText(formatCompactCss(currentElement));
    showNotification('CSS Copied to clipboard!');
  };

  return (
    <div className="w-[420px] bg-bg-dark text-text-primary min-h-[520px] flex flex-col font-sans select-none">
      {/* 1. Header */}
      <header className="px-4 py-3 bg-bg-secondary border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent-light">
            <Inspect className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-text-primary leading-tight">
              Website Design Inspector
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isInspecting ? 'bg-emerald-400 animate-pulse' : 'bg-text-muted'
                }`}
              />
              <span className="text-[11px] text-text-secondary">
                {isInspecting ? 'Inspection Active' : 'Ready'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {statusMessage && (
        <div className="bg-accent/90 text-white text-xs px-3 py-1.5 text-center font-medium flex items-center justify-center gap-1.5 animate-fadeIn">
          <CheckCircle className="w-3.5 h-3.5" />
          {statusMessage}
        </div>
      )}

      {/* 2. Current Website Banner */}
      <section className="px-4 py-2.5 bg-bg-secondary/40 border-b border-border-subtle text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden pr-2">
          <ExternalLink className="w-3.5 h-3.5 text-text-secondary shrink-0" />
          <div className="truncate">
            <span className="text-text-primary font-medium">{activeTabDomain || 'No Active Tab'}</span>
            <div className="text-[10px] text-text-muted truncate">{activeTabUrl}</div>
          </div>
        </div>
        {isRestrictedPage && (
          <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded shrink-0">
            Restricted Page
          </span>
        )}
      </section>

      {/* 3. Main Action Bar */}
      <section className="p-4 border-b border-border-subtle bg-bg-dark">
        <button
          onClick={toggleInspection}
          disabled={isRestrictedPage}
          className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
            isRestrictedPage
              ? 'bg-bg-secondary text-text-muted cursor-not-allowed border border-border-subtle'
              : isInspecting
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/30'
              : 'bg-accent hover:bg-accent-hover text-white shadow-purple-900/30'
          }`}
        >
          {isInspecting ? (
            <>
              <EyeOff className="w-4 h-4" /> Stop Inspecting
            </>
          ) : (
            <>
              <Inspect className="w-4 h-4" /> Start Inspecting
            </>
          )}
        </button>

        {/* 4. Quick Tools Bar */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <button
            onClick={() => {
              setActiveInspectorTab('colors');
              if (!isInspecting && !isRestrictedPage) toggleInspection();
            }}
            className="py-1.5 px-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle rounded-md text-[11px] text-text-secondary hover:text-text-primary flex items-center justify-center gap-1.5 transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" /> Color Picker
          </button>
          <button
            onClick={() => {
              setActiveInspectorTab('typography');
              if (!isInspecting && !isRestrictedPage) toggleInspection();
            }}
            className="py-1.5 px-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle rounded-md text-[11px] text-text-secondary hover:text-text-primary flex items-center justify-center gap-1.5 transition-colors"
          >
            <Type className="w-3.5 h-3.5 text-blue-400" /> Typography
          </button>
          <button
            onClick={() => {
              setActiveInspectorTab('css');
              if (!isInspecting && !isRestrictedPage) toggleInspection();
            }}
            className="py-1.5 px-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle rounded-md text-[11px] text-text-secondary hover:text-text-primary flex items-center justify-center gap-1.5 transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-emerald-400" /> CSS Inspector
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {currentElement ? (
          <div>
            {/* Element Header */}
            <div className="px-4 py-2 bg-bg-secondary/70 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="font-mono text-xs font-semibold text-accent-light">
                  &lt;{currentElement.tagName.toLowerCase()}&gt;
                </span>
                <span className="font-mono text-[11px] text-text-secondary truncate max-w-[190px]" title={currentElement.selector}>
                  {currentElement.selector}
                </span>
              </div>
              <span className="text-[10px] text-text-muted font-mono">
                {Math.round(currentElement.dimensions.width)} × {Math.round(currentElement.dimensions.height)}
              </span>
            </div>

            {/* Inspector Tabs */}
            <div className="flex border-b border-border-subtle bg-bg-secondary/40 px-2 overflow-x-auto">
              {(['overview', 'typography', 'colors', 'spacing', 'css'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveInspectorTab(tab)}
                  className={`px-3 py-2 text-xs font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
                    activeInspectorTab === tab
                      ? 'border-accent text-accent-light bg-accent/5'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="p-4">
              {activeInspectorTab === 'overview' && <OverviewTab data={currentElement} />}
              {activeInspectorTab === 'typography' && <TypographyTab typography={currentElement.typography} />}
              {activeInspectorTab === 'colors' && <ColorsTab colors={currentElement.colors} />}
              {activeInspectorTab === 'spacing' && <SpacingTab spacing={currentElement.spacing} />}
              {activeInspectorTab === 'css' && (
                <CssTab computedCss={currentElement.computedCss} inlineStyles={currentElement.inlineStyles} />
              )}
            </div>

            {/* Element Export & Action Footer */}
            <div className="p-3 bg-bg-secondary/60 border-t border-border-subtle flex items-center justify-between gap-2">
              <button
                onClick={copyCurrentCss}
                className="py-1.5 px-2.5 bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle rounded text-xs text-text-primary flex items-center gap-1.5 transition-colors font-medium"
              >
                <Code className="w-3.5 h-3.5" /> Copy CSS
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => exportAsCssFile(currentElement)}
                  className="py-1.5 px-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle rounded text-[11px] text-text-secondary hover:text-text-primary transition-colors"
                  title="Export .css"
                >
                  .CSS
                </button>
                <button
                  onClick={() => exportAsJsonFile(currentElement)}
                  className="py-1.5 px-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle rounded text-[11px] text-text-secondary hover:text-text-primary transition-colors"
                  title="Export .json"
                >
                  .JSON
                </button>
                <button
                  onClick={() => exportAsTxtFile(currentElement)}
                  className="py-1.5 px-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle rounded text-[11px] text-text-secondary hover:text-text-primary transition-colors"
                  title="Export .txt summary"
                >
                  .TXT
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-bg-secondary border border-border-subtle flex items-center justify-center mx-auto mb-3 text-text-muted">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">No Element Selected</h3>
            <p className="text-xs text-text-secondary max-w-[280px] mx-auto mb-4">
              Click <strong>Start Inspecting</strong> and click on any webpage element to inspect typography, colors,
              box-model spacing, and CSS.
            </p>
          </div>
        )}

        {/* 5. Recent Inspected Elements */}
        {recentItems.length > 0 && (
          <section className="p-4 border-t border-border-subtle">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary mb-2">
              <History className="w-3.5 h-3.5" /> Recent Inspections
            </div>
            <div className="space-y-1">
              {recentItems.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectRecent(item)}
                  className="w-full text-left p-2 rounded bg-bg-secondary/40 hover:bg-bg-secondary border border-transparent hover:border-border-subtle flex items-center justify-between text-xs transition-colors"
                >
                  <div className="truncate max-w-[260px]">
                    <span className="font-mono text-accent-light font-medium">&lt;{item.tagName.toLowerCase()}&gt;</span>{' '}
                    <span className="text-text-secondary truncate">{item.selector}</span>
                  </div>
                  <span className="text-[10px] text-text-muted font-mono shrink-0">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default App;
