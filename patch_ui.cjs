const fs = require('fs');

let code = fs.readFileSync('src/components/ProviderSettingsModal.tsx', 'utf8');
code = code.replace(
  /Configure custom API endpoints \(e\.g\. self-hosted models, OpenAI-compatible endpoints\)/g,
  "Configure custom API endpoints (e.g. Ollama, RunPod, self-hosted models)"
);

fs.writeFileSync('src/components/ProviderSettingsModal.tsx', code);
