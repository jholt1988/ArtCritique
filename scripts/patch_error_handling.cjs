const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /let errorMsg = error\?\.message \|\| 'Failed to analyze artwork\.';/g,
  `let errorMsg = error?.message || 'Failed to analyze artwork.';
    if (errorMsg === 'fetch failed' || errorMsg.includes('ECONNREFUSED')) {
      errorMsg = 'Failed to connect to the custom API endpoint (e.g., Ollama or Runpod). Please verify that the Base URL in Custom Provider Settings is correct, reachable, and the server is running.';
    }`
);

fs.writeFileSync('server.ts', code);
