import { useState } from 'react';

interface EntityListProps {
  keys: string[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  width: number;
}

export function EntityList({ keys, selectedKey, onSelect, width }: EntityListProps) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? keys.filter((k) => k.toLowerCase().includes(search.toLowerCase()))
    : keys;

  return (
    <div style={{
      width,
      minWidth: width,
      maxWidth: width,
      borderRight: 'none',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--color-bg)',
      flexShrink: 0,
    }}>
      {/* Search bar */}
      <div style={{
        padding: '5px 8px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-subtle)',
        flexShrink: 0,
      }}>
        <input
          type="text"
          placeholder="Search entities…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '3px 7px',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-mono)',
            border: '1px solid var(--color-border)',
            borderRadius: 3,
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            outline: 'none',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
        />
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {filtered.length === 0 ? (
          <div style={{
            padding: '16px 10px',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)',
            textAlign: 'center',
            lineHeight: 1.7,
          }}>
            {keys.length === 0
              ? <>No cache data yet.<br />Add the devtools exchange and make a query.</>
              : 'No entities match.'}
          </div>
        ) : (
          filtered.map((key) => (
            <EntityRow
              key={key}
              entityKey={key}
              isSelected={key === selectedKey}
              onClick={() => onSelect(key)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface EntityRowProps {
  entityKey: string;
  isSelected: boolean;
  onClick: () => void;
}

function EntityRow({ entityKey, isSelected, onClick }: EntityRowProps) {
  const colonIdx = entityKey.indexOf(':');
  const typename = colonIdx >= 0 ? entityKey.slice(0, colonIdx) : entityKey;
  const id = colonIdx >= 0 ? entityKey.slice(colonIdx + 1) : null;

  return (
    <div
      onClick={onClick}
      title={entityKey}
      style={{
        padding: '5px 10px',
        cursor: 'pointer',
        background: isSelected ? 'var(--color-bg-selected)' : 'transparent',
        borderLeft: isSelected
          ? '2px solid var(--color-accent)'
          : '2px solid transparent',
        userSelect: 'none',
        // Truncation
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        display: 'block',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-hover)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--font-size-sm)',
        color: isSelected ? 'var(--color-typename)' : 'var(--color-key)',
        fontWeight: 500,
      }}>
        {typename}
      </span>
      {id != null && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-subtle)',
        }}>
          :{id}
        </span>
      )}
    </div>
  );
}
