const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /return \{ text: outputText \};/g,
  `fs.appendFileSync("/tmp/runpod_log.txt", "EXTRACTED TEXT: " + outputText + "\\n"); return { text: outputText };`
);

fs.writeFileSync('server.ts', code);
