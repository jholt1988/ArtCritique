const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /const tips = JSON\.parse\(response\.text \|\| '\[\]'\);\s*res\.json\(\{ tips \}\);/,
  `let tips = JSON.parse(response.text || '[]');\n    if (!Array.isArray(tips)) tips = [];\n    res.json({ tips });`
);

fs.writeFileSync('server.ts', code);
