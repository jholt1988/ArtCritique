const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'console.log("SENDING TO RUNPOD:", JSON.stringify(runpodPayload));',
  'fs.appendFileSync("/tmp/runpod_log.txt", "SENDING TO RUNPOD: " + JSON.stringify(runpodPayload) + "\\n");'
);

code = code.replace(
  'console.log("RUNPOD RESPONSE:", JSON.stringify(data));',
  'fs.appendFileSync("/tmp/runpod_log.txt", "RUNPOD RESPONSE: " + JSON.stringify(data) + "\\n");'
);

fs.writeFileSync('server.ts', code);
