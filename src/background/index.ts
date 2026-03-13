// Background service worker
// Routes messages between content scripts (one per tab) and the devtools panel (one per tab).
// Content scripts connect with name 'content'; background reads tabId from port.sender.tab.id.
// Devtools panels connect with name 'devtools-<tabId>'; they self-identify because
// devtools pages have no sender.tab.

const contentPorts = new Map<number, chrome.runtime.Port>();
const devtoolsPorts = new Map<number, chrome.runtime.Port>();

// Buffer exchange events that arrive before the devtools panel opens
const EVENT_BUFFER_LIMIT = 500;
const eventBuffers = new Map<number, unknown[]>();

function getBuffer(tabId: number): unknown[] {
  if (!eventBuffers.has(tabId)) eventBuffers.set(tabId, []);
  return eventBuffers.get(tabId)!;
}

function sendToDevtools(tabId: number, msg: unknown) {
  const port = devtoolsPorts.get(tabId);
  if (!port) return;
  try { port.postMessage(msg); } catch { devtoolsPorts.delete(tabId); }
}

function sendToContent(tabId: number, msg: unknown) {
  const port = contentPorts.get(tabId);
  if (!port) return;
  try { port.postMessage(msg); } catch { contentPorts.delete(tabId); }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'content') {
    const tabId = port.sender?.tab?.id;
    if (tabId == null) return;

    contentPorts.set(tabId, port);

    port.onMessage.addListener((msg: unknown) => {
      const devtoolsPort = devtoolsPorts.get(tabId);
      if (devtoolsPort) {
        try { devtoolsPort.postMessage(msg); } catch { devtoolsPorts.delete(tabId); }
      } else {
        const buf = getBuffer(tabId);
        buf.push(msg);
        if (buf.length > EVENT_BUFFER_LIMIT) buf.shift();
      }
    });

    port.onDisconnect.addListener(() => {
      contentPorts.delete(tabId);
      // Notify panel of disconnect so it can show the disconnected state
      sendToDevtools(tabId, { source: 'exchange', type: 'disconnect' });
      eventBuffers.delete(tabId);
    });

  } else if (port.name.startsWith('devtools-')) {
    const tabId = parseInt(port.name.slice('devtools-'.length), 10);
    if (isNaN(tabId)) return;

    devtoolsPorts.set(tabId, port);

    // Drain any buffered events so the panel catches up on historical state
    const buf = eventBuffers.get(tabId);
    if (buf?.length) {
      for (const msg of buf) {
        try { port.postMessage(msg); } catch {}
      }
      eventBuffers.delete(tabId);
    }

    // Forward devtools → content (e.g., connection-ack to the exchange)
    port.onMessage.addListener((msg: unknown) => {
      sendToContent(tabId, msg);
    });

    port.onDisconnect.addListener(() => {
      devtoolsPorts.delete(tabId);
    });
  }
});
