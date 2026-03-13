import { useState, useRef, useCallback } from 'react';
import { useConnection } from './hooks/useConnection';
import { useCacheState } from './hooks/useCacheState';
import { Toolbar } from './components/Toolbar';
import { EntityList } from './components/EntityList';
import { CacheExplorer } from './components/CacheExplorer';

const TAB_ID = chrome.devtools.inspectedWindow.tabId;
const SIDEBAR_MIN = 140;
const SIDEBAR_MAX = 600;
const SIDEBAR_DEFAULT = 240;

export function App() {
  const [reconnectKey, setReconnectKey] = useState(0);
  const { status, onMessage, sendMessage: _sendMessage } = useConnection(TAB_ID, reconnectKey);
  const { store, eventCount, clear } = useCacheState(onMessage);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  const entityKeys = Object.keys(store).sort((a, b) => {
    const priority = (k: string) =>
      k === 'Query' ? 0 : k === 'Mutation' ? 1 : k === 'Subscription' ? 2 : 3;
    const diff = priority(a) - priority(b);
    if (diff !== 0) return diff;
    return a.localeCompare(b);
  });

  const handleClear = () => {
    clear();
    setSelectedKey(null);
  };

  const handleNavigate = (key: string) => {
    if (key in store) setSelectedKey(key);
  };

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidebarWidth;

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = ev.clientX - dragStartX.current;
      const next = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, dragStartWidth.current + delta));
      setSidebarWidth(next);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [sidebarWidth]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        status={status}
        entityCount={entityKeys.length}
        eventCount={eventCount}
        onClear={handleClear}
        onRefresh={() => setReconnectKey((k) => k + 1)}
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <EntityList
          keys={entityKeys}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
          width={sidebarWidth}
        />

        {/* Resize handle */}
        <div
          onMouseDown={handleDragStart}
          style={{
            width: 4,
            flexShrink: 0,
            background: 'var(--color-border)',
            cursor: 'col-resize',
            transition: 'background 0.1s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--color-accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--color-border)'; }}
        />

        <CacheExplorer
          selectedKey={selectedKey}
          entity={selectedKey != null ? (store[selectedKey] ?? null) : null}
          store={store}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
}
