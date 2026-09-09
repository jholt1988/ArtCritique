const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const ollamaLogic = `
  } else if (customBaseUrl && (customBaseUrl.includes('11434') || customBaseUrl.includes('ollama') || customBaseUrl.endsWith('/api/chat'))) {
    let ollamaUrl = customBaseUrl;
    if (!ollamaUrl.endsWith('/api/chat') && !ollamaUrl.endsWith('/api/generate') && !ollamaUrl.includes('/v1')) {
      if (!ollamaUrl.endsWith('/')) ollamaUrl += '/';
      ollamaUrl += 'api/chat';
    }
    
    let systemMessage = requestParams.config?.systemInstruction || '';
    let userPrompt = '';
    const images = [];
        
    for (const part of requestParams.contents?.parts || []) {
      if (part.text) userPrompt += "\\n\\n" + part.text;
      if (part.inlineData) {
        images.push(part.inlineData.data);
      }
    }
    
    if (requestParams.config?.responseMimeType === 'application/json') {
      userPrompt += "\\n\\nCRITICAL: You MUST return strictly valid JSON matching this schema: " + JSON.stringify(requestParams.config.responseSchema);
      userPrompt += "\\n\\nOutput only the raw JSON, do not include any other text, markdown, or commentary.";
    }

    const messages = [];
    if (systemMessage) {
        messages.push({ role: 'system', content: systemMessage });
    }
    const userMessage = { role: 'user', content: userPrompt.trim() };
    if (images.length > 0) {
        userMessage.images = images;
    }
    messages.push(userMessage);

    const modelName = req?.headers['x-custom-model-name'] || 'llama3.2-vision';

    const ollamaPayload = {
        model: modelName,
        messages: messages,
        stream: false,
        options: {
            temperature: requestParams.config?.temperature || 0.3,
            num_ctx: 4096
        }
    };
    
    if (requestParams.config?.responseMimeType === 'application/json') {
        ollamaPayload.format = 'json';
    }

    fs.appendFileSync("/tmp/runpod_log.txt", "SENDING TO OLLAMA: " + JSON.stringify(ollamaPayload) + "\\n");
    const ollamaResponse = await fetch(ollamaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(customApiKey ? { "Authorization": "Bearer " + customApiKey } : {})
      },
      body: JSON.stringify(ollamaPayload)
    });

    if (!ollamaResponse.ok) throw new Error("Ollama HTTP error! status: " + ollamaResponse.status);
    
    const data = await ollamaResponse.json();
    let outputText = data.message?.content || data.response || '';
    
    if (requestParams.config?.responseMimeType === 'application/json') {
      const firstBrace = outputText.indexOf('{');
      const lastBrace = outputText.lastIndexOf('}');
      const firstBracket = outputText.indexOf('[');
      const lastBracket = outputText.lastIndexOf(']');
      
      let startIdx = firstBrace;
      let endIdx = lastBrace;
      
      if (firstBracket !== -1 && lastBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
        startIdx = firstBracket;
        endIdx = lastBracket;
      }
      
      if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
        outputText = outputText.substring(startIdx, endIdx + 1);
      } else {
        outputText = outputText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      }
    }
    
    fs.appendFileSync("/tmp/runpod_log.txt", "OLLAMA TEXT: " + outputText + "\\n"); 
    return { text: outputText };
  } else {
`;

// we need to replace the `} else {` right before `const { ai, modelName } = getAIClient(req);`
code = code.replace(
  /\s*\}\s*else\s*\{\s*const\s*\{\s*ai,\s*modelName\s*\}\s*=\s*getAIClient\(req\);\s*return\s*await\s*ai\.models\.generateContent\(\{/m,
  (match) => {
    return ollamaLogic + `    const { ai, modelName } = getAIClient(req);\n    return await ai.models.generateContent({`;
  }
);

fs.writeFileSync('server.ts', code);
