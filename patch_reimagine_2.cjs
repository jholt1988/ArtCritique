const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCheck = `      if (!openAiResponse.ok) {
        // If images/generations is not supported, fallback to GenAI SDK 
        console.warn('OpenAI images/generations failed, falling back to GenAI SDK', openAiResponse.statusText);
      } else {
        const data = await openAiResponse.json();
        const b64 = data.data?.[0]?.b64_json;
        if (b64) {
          return res.json({ reimagedUrl: "data:image/jpeg;base64," + b64 });
        }
      }`;

const newCheck = `      if (!openAiResponse.ok) {
        let errText = await openAiResponse.text();
        throw new Error(\`OpenAI image generation failed: \${openAiResponse.status} \${openAiResponse.statusText} - \${errText}\`);
      } else {
        const data = await openAiResponse.json();
        const b64 = data.data?.[0]?.b64_json;
        if (b64) {
          return res.json({ reimagedUrl: "data:image/jpeg;base64," + b64 });
        }
      }`;

code = code.replace(oldCheck, newCheck);
fs.writeFileSync('server.ts', code);
