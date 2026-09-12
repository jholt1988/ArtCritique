const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
    const isV1OpenAI = ollamaUrl.includes('/v1') || ollamaUrl.includes('openai') || ollamaUrl.includes('groq') || ollamaUrl.includes('together');
    
    let systemMessage = requestParams.config?.systemInstruction || '';
    let userPrompt = '';
    const images = [];
        
    for (const part of requestParams.contents?.parts || []) {
      if (part.text) userPrompt += "\\n\\n" + part.text;
      if (part.inlineData) {
        images.push("data:" + part.inlineData.mimeType + ";base64," + part.inlineData.data);
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
    
    let userMessage;
    if (isV1OpenAI && images.length > 0) {
      // OpenAI Vision format
      const contentArr = [{ type: "text", text: userPrompt.trim() }];
      for (const img of images) {
         contentArr.push({ type: "image_url", image_url: { url: img } });
      }
      userMessage = { role: 'user', content: contentArr };
    } else {
      // Ollama format or text-only
      userMessage = { role: 'user', content: userPrompt.trim() };
      if (images.length > 0) {
          // Ollama wants just the base64 part, strip the prefix
          userMessage.images = images.map(img => img.replace(/^data:image\\/[a-zA-Z0-9+]+;base64,/, ''));
      }
    }
    messages.push(userMessage);

    const modelName = req?.headers['x-custom-model-name'] || (isV1OpenAI ? 'gpt-4o' : 'llama3.2-vision');

    let payload = {};
    if (isV1OpenAI) {
      payload = {
        model: modelName,
        messages: messages,
        temperature: requestParams.config?.temperature || 0.3,
        max_tokens: 4096
      };
      if (requestParams.config?.responseMimeType === 'application/json') {
          payload.response_format = { type: "json_object" };
      }
    } else {
      payload = {
        model: modelName,
        messages: messages,
        stream: false,
        options: {
            temperature: requestParams.config?.temperature || 0.3,
            num_ctx: 4096
        }
      };
      if (requestParams.config?.responseMimeType === 'application/json') {
          payload.format = 'json';
      }
    }

    fs.appendFileSync("/tmp/runpod_log.txt", "SENDING TO CUSTOM API: " + JSON.stringify(payload) + "\\n");
    const apiResponse = await fetch(ollamaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(customApiKey ? { "Authorization": "Bearer " + customApiKey } : {})
      },
      body: JSON.stringify(payload)
    });

    if (!apiResponse.ok) {
       const errBody = await apiResponse.text().catch(()=>'');
       throw new Error("Custom API HTTP error! status: " + apiResponse.status + " " + errBody);
    }
    
    const data = await apiResponse.json();
    let outputText = data.choices?.[0]?.message?.content || data.message?.content || data.response || '';
`;

code = code.replace(
  /let systemMessage = requestParams\.config\?\.systemInstruction \|\| '';[\s\S]*?let outputText = data\.message\?\.content \|\| data\.response \|\| '';/m,
  replacement
);

fs.writeFileSync('server.ts', code);
