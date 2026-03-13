# URQL DevTools Chrome Extension

> **Note:** This is an AI-generated Chrome extension that works with the [`@urql/devtools`](https://github.com/urql-graphql/urql-devtools) exchange. The [official browser extension](https://github.com/urql-graphql/urql-devtools) is no longer available/maintained, so this project provides a replacement extension for Chrome. It offers basic cache visualization functionality as a quick development tool and is not intended to evolve significantly beyond its current scope.

A Chrome extension that visualizes the normalized URQL GraphQL cache in real-time from within Chrome DevTools.

## Features

- **Cache Explorer**: Browse your normalized cache entities in real-time
- **Entity Navigation**: Click on entity references to navigate between related data
- **Live Updates**: See cache changes as queries and mutations execute
- **Simple UI**: Clean, focused interface for inspecting cache state

## Installation

### Option 1: Install from Source

1. Clone this repository
2. Install dependencies and build:

```bash
npm install
npm run build
```

3. Load in Chrome:
   - Open `chrome://extensions`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked**
   - Select the `dist/` folder

### Option 2: Install from Release

Download the latest `dist.zip` from the [Releases](../../releases) page, extract it, and follow step 3 above.

## Usage

### 1. Add the devtools exchange to your URQL client

Install the exchange package:

```bash
npm install @urql/devtools
```

Add `devtoolsExchange` to your client **before** `cacheExchange`:

```tsx
import { devtoolsExchange } from '@urql/devtools';
import { cacheExchange, fetchExchange, createClient } from 'urql';

const client = createClient({
  url: '/graphql',
  exchanges: [devtoolsExchange, cacheExchange, fetchExchange],
});
```

### 2. Open DevTools

1. Open Chrome DevTools on your app's tab (F12 or right-click → Inspect)
2. Click the **URQL** tab
3. Execute GraphQL queries in your app

The cache explorer will show:
- **Left panel**: List of cache entities (e.g., `Query`, `User:1`, `Todo:2`)
- **Right panel**: Fields and values for the selected entity
- **Clickable references**: Click `→ EntityKey` links to navigate between related entities

## About This Project

The [`@urql/devtools`](https://github.com/urql-graphql/urql-devtools) package provides an exchange for debugging URQL, but the browser extension component is no longer available. This Chrome extension fills that gap by providing a simple cache visualization panel that works with the `@urql/devtools` exchange.

**Scope**: This is a focused tool for cache inspection. It does not include all features from the original browser extension (event timeline, request tool, etc.) and is not planned for major feature expansion. It's meant to be a quick, practical tool for developers who need basic cache debugging.

## How It Works

The extension intercepts `cacheWrite` debug events from `@urql/exchange-graphcache` and normalizes GraphQL results using the same key strategy as graphcache:

- `${__typename}:${id}` for entities with an `id` field
- `__typename` alone for root types (`Query`, `Mutation`, `Subscription`)
- Nested objects with `__typename` become `{ __ref: 'EntityKey' }` references

## Development

```bash
npm run dev       # watch mode (rebuilds on file changes)
npm run typecheck # type-check without building
```

After changes, reload the extension in `chrome://extensions` (click the refresh icon).

## Architecture

```
Page (urql client with devtoolsExchange)
  │  window.postMessage({ source: 'exchange', type: 'debug-event', ... })
  ▼
content.js (content script)
  │  chrome.runtime.connect({ name: 'content' })
  ▼
background.js (service worker)
  │  routes messages, buffers events until panel opens
  ▼
devtools.html → creates the URQL panel
  ▼
panel.html (React app)
  │  accumulates cache events & normalizes data
  ▼
UI: entity list + tree explorer with clickable references
```

## License

MIT

## Contributing

This is a minimal, focused tool. Bug fixes and small improvements are welcome, but major feature additions are outside the project's scope.
