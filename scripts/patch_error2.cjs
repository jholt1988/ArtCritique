const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /function getAIClient.*?return \{ ai: aiClient, modelName \};\s*\}/s,
  `function getAIClient(req?: express.Request): { ai: GoogleGenAI, modelName: string } {
  let customApiKey = req?.headers['x-custom-api-key'] as string | undefined;
  let customBaseUrl = req?.headers['x-custom-base-url'] as string | undefined;
  let customModelName = req?.headers['x-custom-model-name'] as string | undefined;
  let modelName = customModelName || 'gemini-2.5-flash';

  const finalApiKey = customApiKey || process.env.GEMINI_API_KEY || '';
  
  // Only enforce API key validation if NOT using a custom base URL 
  // (some custom endpoints like Ollama don't require API keys, but the GenAI SDK might still require a dummy one)
  if (!finalApiKey && !customBaseUrl) {
      throw new Error("Missing Gemini API Key. Please provide one in the Custom Provider Settings or set GEMINI_API_KEY in the server.");
  }
  
  // The Gemini SDK throws if initialized with an empty API key, but we want to allow it for Ollama/Runpod if a customBaseUrl is provided.
  // So we pass 'dummy_key' if missing but using a custom backend.
  const sdkApiKey = finalApiKey || (customBaseUrl ? 'dummy_key' : '');

  if (customApiKey || customBaseUrl) {
    const ai = new GoogleGenAI({
      apiKey: sdkApiKey,
      ...(customBaseUrl ? { baseUrl: customBaseUrl } : {}),
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
    return { ai, modelName };
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: sdkApiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }
  return { ai: aiClient, modelName };
}`
);

fs.writeFileSync('server.ts', code);
