const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// Replace the restrictive else if condition with a catch-all for customBaseUrl
code = code.replace(
  /\} else if \(customBaseUrl && \(customBaseUrl\.includes\('11434'\) \|\| customBaseUrl\.includes\('ollama'\) \|\| customBaseUrl\.endsWith\('\/api\/chat'\)\)\) \{/,
  `} else if (customBaseUrl) {`
);

fs.writeFileSync('server.ts', code);
