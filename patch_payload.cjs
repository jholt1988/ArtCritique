const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
    let combinedPrompt = requestParams.config?.systemInstruction || '';
    const images = [];
        
    for (const part of requestParams.contents?.parts || []) {
      if (part.text) combinedPrompt += "\\n\\n" + part.text;
      if (part.inlineData) {
        images.push("data:" + part.inlineData.mimeType + ";base64," + part.inlineData.data);
      }
    }
    
    if (requestParams.config?.responseMimeType === 'application/json') {
      combinedPrompt += "\\n\\nCRITICAL: You MUST return strictly valid JSON matching this schema: " + JSON.stringify(requestParams.config.responseSchema);
      combinedPrompt += "\\n\\nOutput only the raw JSON, do not include any other text, markdown, or commentary.";
    }
    
    const runpodPayload = { input: { prompt: combinedPrompt.trim() } };
    if (images.length > 0) {
      runpodPayload.input.images = images;
      runpodPayload.input.image = images[0]; // some workers use input.image
    }
`;

// regex replace from "let combinedPrompt = " to "const runpodPayload = { ... };"
const startStr = "let combinedPrompt = requestParams.config?.systemInstruction || '';";
const endStr = "const runpodPayload = { input: { prompt: combinedPrompt.trim() } };";

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + replacement.trim() + code.substring(endIdx + endStr.length);
    fs.writeFileSync('server.ts', code);
} else {
    console.log("Could not find payload construction logic.");
}
