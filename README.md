# Website Design Inspector

A modern Chrome Extension (Manifest V3) built with React, TypeScript, Vite, and Tailwind CSS. It enables frontend engineers and designers to inspect, extract, and copy design specifications from any webpage without opening DevTools.

## Features

- **Interactive Element Inspector**: Hover highlight and click-to-select elements with isolated Shadow DOM overlays.
- **Typography Detection**: Reads font-family, size, weight, line-height, letter-spacing, alignment, and color.
- **Color Extraction**: Converts colors into HEX, RGB, and HSL formats with support for transparency and CSS gradients.
- **Box Model Visualization**: Displays computed margin, border, padding, and content dimensions.
- **CSS Explorer**: Categorized CSS inspector with search, one-click copy, and design summary generation.
- **Export Formats**: Export extracted element styling into `.css`, `.json`, or `.txt`.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation & Build

```bash
# Clone the repository
git clone https://github.com/FIQTOR/website-design-inspector.git
cd website-design-inspector

# Install dependencies
npm install

# Run automated unit tests
npm run test

# Build for production
npm run build
```

### Loading in Google Chrome

1. Open `chrome://extensions/` in Chrome.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the `dist` folder located in this repository.

## Scripts

- `npm run dev`: Start local Vite development server.
- `npm run test`: Run automated Vitest test suite.
- `npm run build`: Typecheck and produce the unpacked extension bundle inside `dist/`.

## License

MIT

