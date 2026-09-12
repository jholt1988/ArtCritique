const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/max_tokens: 4096/g, 'max_tokens: 2048');
code = code.replace(/num_ctx: 4096/g, 'num_ctx: 2048');
fs.writeFileSync('server.ts', code);
