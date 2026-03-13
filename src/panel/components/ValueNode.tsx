import { useState } from 'react';
import type { FieldValue, NormalizedStore } from '../hooks/useCacheState';

interface ValueNodeProps {
  value: FieldValue;
  store: NormalizedStore;
  onNavigate: (key: string) => void;
  depth: number;
}

const INDENT = 8;

export function ValueNode({ value, store, onNavigate, depth }: ValueNodeProps) {
  const [expanded, setExpanded] = useState(false);

  // null
  if (value === null) {
    return <span style={{ color: 'var(--color-null)', fontStyle: 'italic' }}>null</span>;
  }

  // boolean
  if (typeof value === 'boolean') {
    return <span style={{ color: 'var(--color-boolean)' }}>{value ? 'true' : 'false'}</span>;
  }

  // number
  if (typeof value === 'number') {
    return <span style={{ color: 'var(--color-number)' }}>{value}</span>;
  }

  // string
  if (typeof value === 'string') {
    return <span style={{ color: 'var(--color-string)' }}>"{value}"</span>;
  }

  // __ref (entity reference)
  if (typeof value === 'object' && '__ref' in value) {
    const ref = (value as { __ref: string }).__ref;
    const exists = ref in store;
    return (
      <span
        onClick={exists ? () => onNavigate(ref) : undefined}
        title={exists ? `Go to ${ref}` : `${ref} (not in store)`}
        style={{
          color: 'var(--color-ref)',
          cursor: exists ? 'pointer' : 'default',
          fontStyle: 'italic',
          borderBottom: exists ? '1px solid var(--color-ref)' : 'none',
          opacity: exists ? 1 : 0.6,
        }}
      >
        → {ref}
      </span>
    );
  }

  // array
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span style={{ color: 'var(--color-text-muted)' }}>[]</span>;
    }
    return (
      <span>
        <Toggle label={`[${value.length}]`} isOpen={expanded} onToggle={() => setExpanded((v) => !v)} />
        {expanded && (
          <div style={{ paddingLeft: INDENT }}>
            {value.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, padding: '1px 0', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--color-text-muted)', flexShrink: 0, minWidth: 20 }}>{i}:</span>
                <ValueNode value={item} store={store} onNavigate={onNavigate} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  // inline object (no __ref)
  if (typeof value === 'object') {
    const obj = value as Record<string, FieldValue>;
    const keys = Object.keys(obj).sort();
    if (keys.length === 0) {
      return <span style={{ color: 'var(--color-text-muted)' }}>{'{}'}</span>;
    }
    return (
      <span>
        <Toggle label={`{${keys.length}}`} isOpen={expanded} onToggle={() => setExpanded((v) => !v)} />
        {expanded && (
          <div style={{ paddingLeft: INDENT }}>
            {keys.map((k) => (
              <div key={k} style={{ display: 'flex', gap: 6, padding: '1px 0', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--color-key)', flexShrink: 0 }}>{k}:</span>
                <ValueNode value={obj[k]} store={store} onNavigate={onNavigate} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  return <span style={{ color: 'var(--color-text-muted)' }}>undefined</span>;
}

function Toggle({ label, isOpen, onToggle }: { label: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <span
      onClick={onToggle}
      style={{
        color: 'var(--color-text-muted)',
        cursor: 'pointer',
        userSelect: 'none',
        fontSize: 'var(--font-size-xs)',
      }}
    >
      {isOpen ? '▾ ' : '▸ '}{label}
    </span>
  );
}
