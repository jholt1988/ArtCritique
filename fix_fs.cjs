const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("import * as fs from 'fs';")) {
  code = code.replace("import dotenv from 'dotenv';", "import dotenv from 'dotenv';\nimport * as fs from 'fs';");
}
fs.writeFileSync('server.ts', code);
