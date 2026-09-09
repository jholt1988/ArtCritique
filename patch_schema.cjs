const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
    let schemaStr = '';
    if (requestParams.config?.responseSchema) {
      // Lowercase all "type" fields to make it standard JSON schema (so models don't get confused by "OBJECT" or "STRING")
      const cleanSchema = JSON.parse(JSON.stringify(requestParams.config.responseSchema).replace(/"type":"([A-Z]+)"/g, (match, p1) => '"type":"' + p1.toLowerCase() + '"'));
      schemaStr = JSON.stringify(cleanSchema);
    }
    
    if (requestParams.config?.responseMimeType === 'application/json') {
      userPrompt += "\\n\\nCRITICAL: You MUST return strictly valid JSON matching this schema: " + schemaStr;
      userPrompt += "\\n\\nOutput only the raw JSON, do not include any other text, markdown, or commentary.";
    }
`;

code = code.replace(
  /if \(requestParams\.config\?\.responseMimeType === 'application\/json'\) \{\s*userPrompt \+= "\\n\\nCRITICAL: You MUST return strictly valid JSON matching this schema: " \+ JSON\.stringify\(requestParams\.config\.responseSchema\);\s*userPrompt \+= "\\n\\nOutput only the raw JSON, do not include any other text, markdown, or commentary\.";\s*\}/m,
  replacement
);

fs.writeFileSync('server.ts', code);
