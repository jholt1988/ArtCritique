const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /if \(!aiClient\) \{\s*const apiKey = process\.env\.GEMINI_API_KEY;\s*aiClient = new GoogleGenAI\(\{/,
  `if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey && !customApiKey && !customBaseUrl) {
      throw new Error("Missing Gemini API Key. Please provide one in the Custom Provider Settings or set GEMINI_API_KEY.");
    }
    aiClient = new GoogleGenAI({`
);

fs.writeFileSync('server.ts', code);
