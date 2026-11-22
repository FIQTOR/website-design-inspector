import { InspectedElementData } from '../types/inspector';
import { formatCssRules, generateDesignSummary } from './cssUtils';

export function exportAsCssFile(data: InspectedElementData): void {
  const content = formatCssRules(data);
  const filename = `${sanitizeFilename(data.tagName.toLowerCase() + '-' + (data.id || 'element'))}-styles.css`;
  triggerDownload(content, filename, 'text/css');
}

export function exportAsJsonFile(data: InspectedElementData): void {
  const content = JSON.stringify(data, null, 2);
  const filename = `${sanitizeFilename(data.tagName.toLowerCase() + '-' + (data.id || 'element'))}-design.json`;
  triggerDownload(content, filename, 'application/json');
}

export function exportAsTxtFile(data: InspectedElementData): void {
  const content = generateDesignSummary(data);
  const filename = `${sanitizeFilename(data.tagName.toLowerCase() + '-' + (data.id || 'element'))}-summary.txt`;
  triggerDownload(content, filename, 'text/plain');
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

