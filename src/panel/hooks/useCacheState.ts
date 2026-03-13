import { useEffect, useReducer, useCallback } from 'react';
import type { ExchangeMessage } from '@shared/messages';

// The normalized cache store
export type FieldValue =
  | string
  | number
  | boolean
  | null
  | { __ref: string }
  | FieldValue[]
  | { [key: string]: FieldValue };

export type EntityFields = Record<string, FieldValue>;
export type NormalizedStore = Record<string, EntityFields>;

type Action =
  | { type: 'MERGE'; payload: NormalizedStore }
  | { type: 'CLEAR' };

function reducer(state: NormalizedStore, action: Action): NormalizedStore {
  if (action.type === 'CLEAR') return {};
  if (action.type === 'MERGE') {
    const next = { ...state };
    for (const key of Object.keys(action.payload)) {
      next[key] = { ...(state[key] ?? {}), ...action.payload[key] };
    }
    return next;
  }
  return state;
}

// --- Normalization ---

function entityKey(obj: Record<string, unknown>): string | null {
  const typename = obj.__typename as string | undefined;
  if (!typename) return null;
  // Root operation types have no id
  if (typename === 'Query' || typename === 'Mutation' || typename === 'Subscription') {
    return typename;
  }
  const id = obj.id ?? obj._id ?? obj.uid;
  if (id == null) return null;
  return `${typename}:${id}`;
}

function normalizeValue(value: unknown, store: NormalizedStore): FieldValue {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item, store));
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const key = entityKey(obj);
    if (key) {
      normalizeEntity(key, obj, store);
      return { __ref: key };
    }
    // Inline object without a key
    const result: Record<string, FieldValue> = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = normalizeValue(v, store);
    }
    return result;
  }

  return null;
}

function normalizeEntity(
  key: string,
  obj: Record<string, unknown>,
  store: NormalizedStore
): void {
  if (!store[key]) store[key] = {};
  for (const [field, value] of Object.entries(obj)) {
    store[key][field] = normalizeValue(value, store);
  }
}

function normalizeResult(result: Record<string, unknown>): NormalizedStore {
  const store: NormalizedStore = {};
  const rootFields: EntityFields = {};

  for (const [field, value] of Object.entries(result)) {
    rootFields[field] = normalizeValue(value, store);
  }

  const rootTypename = (result.__typename as string | undefined) ?? 'Query';
  store[rootTypename] = { ...(store[rootTypename] ?? {}), ...rootFields };

  return store;
}

// --- Hook ---

interface UseCacheStateResult {
  store: NormalizedStore;
  eventCount: number;
  clear: () => void;
}

export function useCacheState(
  onMessage: (handler: (msg: ExchangeMessage) => void) => () => void
): UseCacheStateResult {
  const [state, dispatch] = useReducer(reducer, {});
  const [eventCount, countDispatch] = useReducer((n: number, a: 'inc' | 'reset') => a === 'reset' ? 0 : n + 1, 0);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
    countDispatch('reset');
  }, []);

  useEffect(() => {
    return onMessage((msg) => {
      if (msg.source !== 'exchange' || msg.type !== 'debug-event') return;

      const event = (msg as { data: { type?: string; data?: unknown } }).data;
      if (!event) return;

      // Handle write events from @urql/exchange-graphcache
      // The event type can vary between versions: 'write', 'cacheWrite', 'update'
      const eventType = event.type ?? '';
      const isWriteEvent =
        eventType === 'write' ||
        eventType === 'cacheWrite' ||
        eventType === 'update' ||
        eventType.toLowerCase().includes('write');

      if (!isWriteEvent) return;

      const rawData = event.data;
      if (!rawData || typeof rawData !== 'object') return;

      // The data field may be the result directly or wrapped in { data: {...} }
      const resultData = (rawData as Record<string, unknown>).data ?? rawData;
      if (!resultData || typeof resultData !== 'object' || Array.isArray(resultData)) return;

      const normalized = normalizeResult(resultData as Record<string, unknown>);
      if (Object.keys(normalized).length > 0) {
        dispatch({ type: 'MERGE', payload: normalized });
        countDispatch('inc');
      }
    });
  }, [onMessage]);

  return { store: state, eventCount, clear };
}
