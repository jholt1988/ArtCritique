const fs = require('fs');

function replaceInFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/gemini-2\.5-flash/g, 'gemini-2.0-flash');
  fs.writeFileSync(file, code);
}

replaceInFile('server.ts');
replaceInFile('src/components/ProviderSettingsModal.tsx');
