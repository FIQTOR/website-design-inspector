/**
 * DOM Utility helpers for generating selectors, snippets, and tree inspection
 */

export function getOptimalDomSelector(el: Element): string {
  if (el.id) {
    return `#${CSS.escape(el.id)}`;
  }

  // Handle unique body/html
  if (el.tagName.toLowerCase() === 'body') return 'body';
  if (el.tagName.toLowerCase() === 'html') return 'html';

  let path: string[] = [];
  let current: Element | null = el;

  while (current && current.nodeType === Node.ELEMENT_NODE && current.tagName.toLowerCase() !== 'body') {
    let selector = current.tagName.toLowerCase();
    
    if (current.id) {
      selector = `#${CSS.escape(current.id)}`;
      path.unshift(selector);
      break;
    }

    if (current.classList && current.classList.length > 0) {
      // Pick first meaningful class
      const validClass = Array.from(current.classList).find(cls => !cls.startsWith('__inspector'));
      if (validClass) {
        selector += `.${CSS.escape(validClass)}`;
      }
    }

    // Check nth-of-type if sibling shares selector
    if (current.parentElement) {
      const siblings = Array.from(current.parentElement.children).filter(
        child => child.tagName === current?.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}

export function getCleanHtmlSnippet(el: Element, maxLen: number = 300): string {
  try {
    const clone = el.cloneNode(false) as Element;
    // Don't retain inspector internal attributes if any
    clone.removeAttribute('data-inspector-highlight');
    let str = clone.outerHTML;
    if (str.length > maxLen) {
      str = str.substring(0, maxLen) + '...';
    }
    return str;
  } catch {
    return `<${el.tagName.toLowerCase()}>`;
  }
}

