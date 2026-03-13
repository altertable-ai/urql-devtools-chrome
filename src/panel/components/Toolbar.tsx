import type { ConnectionStatus } from '../hooks/useConnection';

interface ToolbarProps {
  status: ConnectionStatus;
  entityCount: number;
  eventCount: number;
  onClear: () => void;
  onRefresh: () => void;
}

const STATUS_COLOR: Record<ConnectionStatus, string> = {
  connecting: 'var(--color-status-waiting)',
  connected: 'var(--color-status-connected)',
  disconnected: 'var(--color-status-disconnected)',
};

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connecting: 'Waiting for exchange…',
  connected: 'Connected',
  disconnected: 'Disconnected',
};

const btnStyle: React.CSSProperties = {
  height: 20,
  padding: '0 8px',
  fontSize: 'var(--font-size-sm)',
  border: '1px solid var(--color-border-strong)',
  borderRadius: 3,
  background: 'var(--color-bg)',
  cursor: 'pointer',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-ui)',
};

export function Toolbar({ status, entityCount, eventCount, onClear, onRefresh }: ToolbarProps) {
  return (
    <div style={{
      height: 'var(--toolbar-height)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '0 10px',
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-bg-subtle)',
      flexShrink: 0,
      userSelect: 'none',
    }}>
      <span style={{
        fontWeight: 700,
        color: 'var(--color-accent)',
        fontSize: 13,
        letterSpacing: '-0.01em',
      }}>
        URQL
      </span>

      <span style={{
        width: 1,
        height: 14,
        background: 'var(--color-border)',
      }} />

      <span style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: STATUS_COLOR[status],
        flexShrink: 0,
      }} />
      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-subtle)' }}>
        {STATUS_LABEL[status]}
      </span>

      <span style={{ flex: 1 }} />

      {eventCount > 0 && (
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          {entityCount} {entityCount === 1 ? 'entity' : 'entities'} · {eventCount} {eventCount === 1 ? 'write' : 'writes'}
        </span>
      )}

      <button
        onClick={onRefresh}
        title="Reconnect to exchange"
        style={btnStyle}
      >
        Refresh
      </button>

      <button
        onClick={onClear}
        title="Clear cache state"
        style={btnStyle}
      >
        Clear
      </button>
    </div>
  );
}
