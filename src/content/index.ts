// Content script: bridges window.postMessage (urql exchange) ↔ background port

const port = chrome.runtime.connect({ name: 'content' });

// Page → background: forward exchange messages
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  const msg = event.data;
  if (!msg || typeof msg !== 'object') return;
  // Only relay messages from the urql exchange
  if (msg.source !== 'exchange') return;
  try { port.postMessage(msg); } catch {}
});

// Background → page: forward devtools messages (e.g., connection-ack)
port.onMessage.addListener((msg: unknown) => {
  window.postMessage(msg, '*');
});
