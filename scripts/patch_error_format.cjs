const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

function replaceCatch(route) {
  const regex = new RegExp(`app\\.post\\('${route}', async \\(req, res\\) => \\{[\\s\\S]*?res\\.status\\(500\\)\\.json\\(\\{ error: error\\?\\.message \\|\\| '.*?' \\}\\);\\s*\\}\\s*\\}\\);`);
  // This is too fragile. Let's just do a global replace on the catch blocks.
}

code = code.replace(/res\.status\(500\)\.json\(\{ error: error\?\.message \|\| ('.*?') \}\);/g, `
    let errorMsg = error?.message || $1;
    if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid') || errorMsg.includes('API key not valid.')) {
      errorMsg = 'Invalid Gemini API Key. Please provide a valid API key in the Custom Provider Settings (gear icon) or check your server environment variables.';
    }
    res.status(500).json({ error: errorMsg });
`);

fs.writeFileSync('server.ts', code);
