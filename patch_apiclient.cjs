const fs = require('fs');

let code = fs.readFileSync('src/utils/apiClient.ts', 'utf8');

code = code.replace(
  /\/\/ if \(settings\.modelName\) headers\['x-custom-model-name'\] = settings\.modelName;/,
  `if (settings.modelName) headers['x-custom-model-name'] = settings.modelName;`
);

fs.writeFileSync('src/utils/apiClient.ts', code);
