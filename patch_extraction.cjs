const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
    const data = await apiResponse.json();
    let outputText = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || data.message?.content || data.response || data.text || '';
    
    // If we still can't find the text, maybe it's nested differently. 
    // Fallback to stringifying the whole data if it doesn't look like an error
    if (!outputText && data && !data.error) {
       outputText = JSON.stringify(data);
    }
`;

code = code.replace(
  /const data = await apiResponse\.json\(\);\s*let outputText = data\.choices\?\.\[0\]\?\.message\?\.content \|\| data\.message\?\.content \|\| data\.response \|\| '';/m,
  replacement
);

fs.writeFileSync('server.ts', code);
