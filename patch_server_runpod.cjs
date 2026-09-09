const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  /if \(customBaseUrl\?\.includes\('runpod\.ai'\)\) \{/,
  "if (customBaseUrl?.includes('runpod.ai') && !customBaseUrl.includes('/v1') && !customBaseUrl.includes('/openai')) {"
);
fs.writeFileSync('server.ts', code);
