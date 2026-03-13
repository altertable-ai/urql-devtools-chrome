import { useEffect, useRef, useState, useCallback } from 'react';
import type { ExchangeMessage } from '@shared/messages';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

type MessageHandler = (msg: ExchangeMessage) => void;

interface UseConnectionResult {
  status: ConnectionStatus;
  onMessage: (handler: MessageHandler) => () => void;
  sendMessage: (msg: unknown) => void;
}

export function useConnection(tabId: number, reconnectKey: number): UseConnectionResult {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const portRef = useRef<chrome.runtime.Port | null>(null);
  const handlersRef = useRef<Set<MessageHandler>>(new Set());

  useEffect(() => {
    const port = chrome.runtime.connect({ name: `devtools-${tabId}` });
    portRef.current = port;
    setStatus('connecting');

    port.postMessage({ source: 'devtools', type: 'connection-ack' });

    port.onMessage.addListener((msg: ExchangeMessage) => {
      if (msg.source === 'exchange') {
        if (msg.type === 'disconnect') {
          setStatus('disconnected');
        } else {
          setStatus('connected');
        }
      }
      for (const handler of handlersRef.current) {
        handler(msg);
      }
    });

    port.onDisconnect.addListener(() => {
      setStatus('disconnected');
      portRef.current = null;
    });

    return () => {
      port.disconnect();
      portRef.current = null;
    };
  }, [tabId, reconnectKey]);

  const onMessage = useCallback((handler: MessageHandler) => {
    handlersRef.current.add(handler);
    return () => { handlersRef.current.delete(handler); };
  }, []);

  const sendMessage = useCallback((msg: unknown) => {
    try { portRef.current?.postMessage(msg); } catch {}
  }, []);

  return { status, onMessage, sendMessage };
}
