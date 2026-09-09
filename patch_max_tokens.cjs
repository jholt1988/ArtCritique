const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
    const runpodPayload = { 
      input: { 
        prompt: combinedPrompt.trim(),
        max_tokens: 4000,
        max_new_tokens: 4000
      } 
    };
    if (images.length > 0) {
      runpodPayload.input.images = images;
      runpodPayload.input.image = images[0];
    }
`;

code = code.replace(
  /const runpodPayload = \{ input: \{ prompt: combinedPrompt\.trim\(\) \} \};\s*if \(images\.length > 0\) \{\s*runpodPayload\.input\.images = images;\s*runpodPayload\.input\.image = images\[0\]; \/\/ some workers use input\.image\s*\}/,
  replacement.trim()
);

fs.writeFileSync('server.ts', code);
