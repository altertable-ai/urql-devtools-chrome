// Messages from the urql exchange (page → content script → background → panel)

export interface DebugEventData {
  type: string;
  message?: string;
  operation?: {
    key: number;
    kind?: string;
    variables?: Record<string, unknown>;
    operationName?: string;
  };
  // The raw GraphQL result data for write events
  data?: unknown;
  source?: string;
  timestamp?: number;
}

export interface ExchangeDebugEvent {
  source: 'exchange';
  type: 'debug-event';
  data: DebugEventData;
}

export interface ExchangeInit {
  source: 'exchange';
  type: 'init' | 'connection-init';
  version?: string;
}

export type ExchangeMessage = ExchangeDebugEvent | ExchangeInit | { source: string; type: string; [k: string]: unknown };

// Messages from the devtools panel → background → content script → page

export interface DevtoolsAck {
  source: 'devtools';
  type: 'connection-ack';
}

export interface DevtoolsInit {
  source: 'devtools';
  type: 'connection-init';
  tabId: number;
}
