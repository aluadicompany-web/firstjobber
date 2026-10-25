// The shared browser flow exercises overhead orders with the current in-scene kitchen UI.
process.argv.push('--orders');
await import('./browser.mjs');
