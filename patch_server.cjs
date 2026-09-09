const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The Gemini API requires the configuration object to generate images instead of passing parts array directly like that for the nano models if we want to ensure we're getting an image back.
// We must specify the Image generation structure.
const oldReimagineRoute = `app.post('/api/reimagine', async (req, res) => {
  try {
    const { imageBase64, critiqueSummary, customPrompt } = req.body;
    const cleanData = imageBase64.replace(/^data:image\\/[a-zA-Z0-9+]+;base64,/, '');
    
    const { ai } = getAIClient(req);
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanData,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: customPrompt || \`Apply the following Art Director feedback: "\${critiqueSummary}". Redraw, refine, and upscale this artwork to implement these improvements while maintaining the original spirit and composition. Render it as a high-quality masterpiece.\`,
          },
        ],
      },
    });

    let reimagedUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        // use the mimeType returned, or fallback to jpeg
        const mime = part.inlineData.mimeType || 'image/jpeg';
        reimagedUrl = \`data:\${mime};base64,\${part.inlineData.data}\`;
        break;
      }
    }

    if (!reimagedUrl) {
      throw new Error('No image was returned by the model.');
    }

    res.json({ reimagedUrl });
  } catch (error: any) {
    console.error('Reimagine error:', error);
    let errorMsg = error?.message || 'Failed to reimagine artwork.';
    if (errorMsg.includes('404') && errorMsg.includes('Not Found')) {
      errorMsg = 'Model not found. The image generation model may not be available on your custom endpoint.';
    } else if (errorMsg.includes('API_KEY_INVALID')) {
      errorMsg = 'Invalid Gemini API Key.';
    }
    res.status(500).json({ error: errorMsg });
  }
});`;

const newReimagineRoute = `app.post('/api/reimagine', async (req, res) => {
  try {
    const { imageBase64, critiqueSummary, customPrompt } = req.body;
    const cleanData = imageBase64.replace(/^data:image\\/[a-zA-Z0-9+]+;base64,/, '');
    
    // We get the AI client
    // Since this model requires the paid key, we should NOT use a dummy key from getAIClient if finalApiKey is missing,
    // but the getAIClient already has a hard error if neither key nor custom endpoint is provided.
    // However, the error message from the client indicated the SDK threw an API_KEY_INVALID error, which means it tried to use an invalid one.
    // The problem was that 'getAIClient' might be returning a dummy key if x-custom-base-url is set but the key is invalid. 
    // We will initialize a clean GoogleGenAI explicitly for this route if needed, or rely on the process env.
    
    const apiKey = req.headers['x-custom-api-key'] || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('API_KEY_INVALID'); // Trigger the error to be sent back
    }
    
    // Use the explicit API key for the paid model
    const ai = new GoogleGenAI({
      apiKey: apiKey as string,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image', // Let's use lite-image first to ensure speed and availability unless specified
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanData,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: customPrompt || \`Apply the following Art Director feedback: "\${critiqueSummary}". Redraw, refine, and upscale this artwork to implement these improvements while maintaining the original spirit and composition. Render it as a high-quality masterpiece.\`,
          },
        ],
      },
    });

    let reimagedUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        // use the mimeType returned, or fallback to jpeg
        const mime = part.inlineData.mimeType || 'image/jpeg';
        reimagedUrl = \`data:\${mime};base64,\${part.inlineData.data}\`;
        break;
      }
    }

    if (!reimagedUrl) {
      throw new Error('No image was returned by the model.');
    }

    res.json({ reimagedUrl });
  } catch (error: any) {
    console.error('Reimagine error:', error);
    let errorMsg = error?.message || 'Failed to reimagine artwork.';
    if (errorMsg.includes('404') && errorMsg.includes('Not Found')) {
      errorMsg = 'Model not found. The image generation model may not be available on your custom endpoint.';
    } else if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid')) {
      errorMsg = 'Invalid Gemini API Key. A valid paid API key is required for image generation.';
    }
    res.status(500).json({ error: errorMsg });
  }
});`;

code = code.replace(oldReimagineRoute, newReimagineRoute);
fs.writeFileSync('server.ts', code);
