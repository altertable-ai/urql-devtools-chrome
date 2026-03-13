import type { EntityFields, NormalizedStore } from '../hooks/useCacheState';
import { ValueNode } from './ValueNode';

interface CacheExplorerProps {
  selectedKey: string | null;
  entity: EntityFields | null;
  store: NormalizedStore;
  onNavigate: (key: string) => void;
}

export function CacheExplorer({ selectedKey, entity, store, onNavigate }: CacheExplorerProps) {
  if (!selectedKey || !entity) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        color: 'var(--color-text-muted)',
        userSelect: 'none',
      }}>
        <span style={{ fontSize: 13 }}>Select an entity to inspect</span>
        <span style={{ fontSize: 'var(--font-size-sm)' }}>
          Click any item in the list on the left
        </span>
      </div>
    );
  }

  // Sort fields: __typename first, then id/_id, then alphabetical
  const fields = Object.keys(entity).sort((a, b) => {
    if (a === '__typename') return -1;
    if (b === '__typename') return 1;
    if (a === 'id' || a === '_id') return -1;
    if (b === 'id' || b === '_id') return 1;
    return a.localeCompare(b);
  });

  const colonIdx = selectedKey.indexOf(':');
  const typename = colonIdx >= 0 ? selectedKey.slice(0, colonIdx) : selectedKey;
  const id = colonIdx >= 0 ? selectedKey.slice(colonIdx + 1) : null;

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--font-size-sm)',
    }}>
      {/* Entity header */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        background: 'var(--color-bg-subtle)',
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        overflow: 'hidden',
      }}>
        {/* Truncated entity key */}
        <span
          title={selectedKey}
          style={{
            fontFamily: 'var(--font-mono)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            minWidth: 0,
            flex: 1,
          }}
        >
          <span style={{ color: 'var(--color-typename)', fontWeight: 600, fontSize: 13 }}>
            {typename}
          </span>
          {id != null && (
            <span style={{ color: 'var(--color-text-subtle)' }}>:{id}</span>
          )}
        </span>
        {/* Field count — fixed width, never truncated */}
        <span style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-ui)',
          flexShrink: 0,
        }}>
          {fields.length} {fields.length === 1 ? 'field' : 'fields'}
        </span>
      </div>

      {/* Fields */}
      <div style={{ padding: '8px 16px' }}>
        {fields.map((field) => (
          <div
            key={field}
            style={{
              display: 'flex',
              gap: 8,
              padding: '3px 0',
              alignItems: 'flex-start',
              borderBottom: '1px solid transparent',
            }}
          >
            <span style={{
              color: 'var(--color-key)',
              flexShrink: 0,
              minWidth: 140,
              fontWeight: field === '__typename' || field === 'id' ? 500 : 400,
            }}>
              {field}
            </span>
            <ValueNode
              value={entity[field]}
              store={store}
              onNavigate={onNavigate}
              depth={0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
