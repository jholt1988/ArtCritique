const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /const collections = JSON\.parse\(response\.text \|\| '\[\]'\);\s*res\.json\(collections\);/,
  `let collections = JSON.parse(response.text || '[]');\n    if (!Array.isArray(collections)) collections = [];\n    res.json(collections);`
);

fs.writeFileSync('server.ts', code);
