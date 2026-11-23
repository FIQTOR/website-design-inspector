# AGENTS.md — Website Design Inspector

Guidelines for AI agents working in this repository.

## Overview
Chrome Extension (Manifest V3) enabling frontend engineers and designers to inspect, extract, and copy design specifications, typography, box model dimensions, and color schemes directly from any webpage.

## Tech Stack & Architecture
- **Framework**: React 19, TypeScript, Vite, Tailwind CSS.
- **Overlay**: Isolated Shadow DOM overlay injected via content scripts to avoid styling collisions with host websites.
- **Testing**: Vitest (`vitest.config.ts`).

## Key Commands
```bash
npm install
npm run build      # Build extension bundle into dist/
npm test           # Run tests
```

## Guidelines
- Ensure all inspector UI elements are encapsulated in Shadow DOM to prevent inheriting host styles.
- Accurately parse computed styles (`window.getComputedStyle`) into user-friendly CSS tokens.

