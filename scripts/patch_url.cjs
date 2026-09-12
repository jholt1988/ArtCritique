const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /if \(!ollamaUrl\.endsWith\('\/api\/chat'\) && !ollamaUrl\.endsWith\('\/api\/generate'\) && !ollamaUrl\.includes\('\/v1'\)\) \{[\s\S]*?ollamaUrl \+= 'api\/chat';\n    \}/,
  `if (ollamaUrl.includes('/v1') && !ollamaUrl.includes('/chat/completions')) {
      if (!ollamaUrl.endsWith('/')) ollamaUrl += '/';
      ollamaUrl += 'chat/completions';
    } else if (!ollamaUrl.endsWith('/api/chat') && !ollamaUrl.endsWith('/api/generate') && !ollamaUrl.includes('/v1') && !ollamaUrl.includes('/chat/completions')) {
      if (!ollamaUrl.endsWith('/')) ollamaUrl += '/';
      ollamaUrl += 'api/chat';
    }`
);

fs.writeFileSync('server.ts', code);
