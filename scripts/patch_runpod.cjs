const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const wrapperCode = `
async function smartGenerateContent(req: express.Request, requestParams: any) {
  let customBaseUrl = req?.headers['x-custom-base-url'] as string | undefined;
  let customApiKey = req?.headers['x-custom-api-key'] as string | undefined;

  if (customBaseUrl?.includes('runpod.ai')) {
    let combinedPrompt = requestParams.config?.systemInstruction || '';
    
    for (const part of requestParams.contents?.parts || []) {
      if (part.text) {
        combinedPrompt += "\\n\\n" + part.text;
      }
      if (part.inlineData) {
        // Warning: Passing raw base64 directly in a text prompt might exceed context limits or confuse non-multimodal models.
        combinedPrompt += "\\n\\n[Attached Image Data: data:" + part.inlineData.mimeType + ";base64," + part.inlineData.data + "]";
      }
    }

    if (requestParams.config?.responseMimeType === 'application/json') {
      combinedPrompt += "\\n\\nCRITICAL: You MUST return strictly valid JSON matching this schema: " + JSON.stringify(requestParams.config.responseSchema);
    }

    const runpodPayload = {
      input: {
        prompt: combinedPrompt.trim()
      }
    };

    const runpodResponse = await fetch(customBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + (customApiKey || '')
      },
      body: JSON.stringify(runpodPayload)
    });

    if (!runpodResponse.ok) {
      throw new Error("RunPod HTTP error! status: " + runpodResponse.status);
    }

    const data = await runpodResponse.json();
    
    let outputText = "";
    if (data.output && typeof data.output === 'string') {
      outputText = data.output;
    } else if (data.output && data.output.text) {
      outputText = data.output.text;
    } else {
      outputText = typeof data.output === 'object' ? JSON.stringify(data.output) : String(data.output || data);
    }

    if (requestParams.config?.responseMimeType === 'application/json') {
      outputText = outputText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    }

    return { text: outputText };
  } else {
    const { ai, modelName } = getAIClient(req);
    const response = await ai.models.generateContent({
      model: modelName,
      ...requestParams
    });
    return response;
  }
}
`;

// Insert the wrapper function just before the ART_CRITIQUE_SYSTEM_INSTRUCTION
code = code.replace(
  '// System instruction tailored for master art direction',
  wrapperCode + '\n\n// System instruction tailored for master art direction'
);

// Now, replace the getAIClient and generateContent calls in the routes.
// Critique endpoint
code = code.replace(
  /const { ai, modelName } = getAIClient\(req\);\s*const promptText =/g,
  'const promptText ='
);
code = code.replace(
  /const response = await ai\.models\.generateContent\(\{[\s\S]*?model: modelName,\s*(contents: \{[\s\S]*?config: \{[\s\S]*?\}\s*)\}\);/g,
  'const response = await smartGenerateContent(req, {\n      $1\n    });'
);

// Mentor chat endpoint
code = code.replace(
  /const { ai, modelName } = getAIClient\(req\);\s*const parts: any\[\] = \[\];/g,
  'const parts: any[] = [];'
);

// Group collections endpoint
code = code.replace(
  /const { ai, modelName } = getAIClient\(req\);\s*const itemsSummary =/g,
  'const itemsSummary ='
);

// Critique collection endpoint
code = code.replace(
  /const { ai, modelName } = getAIClient\(req\);\s*const parts: any\[\] = \[\];/g,
  'const parts: any[] = [];'
);

// Collection tips endpoint
code = code.replace(
  /const { ai, modelName } = getAIClient\(req\);\s*const prompt =/g,
  'const prompt ='
);

fs.writeFileSync('server.ts', code);
