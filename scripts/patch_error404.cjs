const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /if \(errorMsg\.includes\('API_KEY_INVALID'\) \|\| errorMsg\.includes\('API key not valid'\) \|\| errorMsg\.includes\('API key not valid\.'\)\) \{/g,
  `if (errorMsg.includes('404') && errorMsg.includes('Not Found')) {
      errorMsg = 'Model not found. The selected AI model does not exist or is unavailable. Please check the model name in Custom Provider Settings.';
    } else if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid') || errorMsg.includes('API key not valid.')) {`
);

fs.writeFileSync('server.ts', code);
