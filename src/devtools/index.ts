// Devtools bootstrap: registers the URQL panel in Chrome DevTools
chrome.devtools.panels.create(
  'URQL',
  '',
  'panel.html',
  () => {
    // Panel registered — the panel's own JS connects to the background on mount
  }
);
