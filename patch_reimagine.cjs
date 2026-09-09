const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldReimagineRoute = `app.post('/api/reimagine', async (req, res) => {
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

const newReimagineRoute = `app.post('/api/reimagine', async (req, res) => {
  try {
    const { imageBase64, critiqueSummary, customPrompt } = req.body;
    const cleanData = imageBase64.replace(/^data:image\\/[a-zA-Z0-9+]+;base64,/, '');
    
    let customBaseUrl = req.headers['x-custom-base-url'] as string | undefined;
    let customApiKey = req.headers['x-custom-api-key'] as string | undefined;
    let customModelName = req.headers['x-custom-model-name'] as string | undefined;

    const finalPrompt = customPrompt || \`Apply the following Art Director feedback: "\${critiqueSummary}". Redraw, refine, and upscale this artwork to implement these improvements while maintaining the original spirit and composition. Render it as a high-quality masterpiece.\`;

    // 1. RunPod Custom Provider Logic
    if (customBaseUrl?.includes('runpod.ai') && !customBaseUrl.includes('/v1') && !customBaseUrl.includes('/openai')) {
      const runpodPayload = {
        input: {
          prompt: finalPrompt,
          image: "data:image/jpeg;base64," + cleanData,
          init_image: "data:image/jpeg;base64," + cleanData, // Often used in SD img2img
          strength: 0.65 // Typical default for img2img
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
      
      if (!runpodResponse.ok) throw new Error("RunPod HTTP error! status: " + runpodResponse.status);
      
      let data = await runpodResponse.json();
      
      // Polling for async jobs
      if (data.id && (data.status === 'IN_QUEUE' || data.status === 'IN_PROGRESS')) {
        let statusUrl = customBaseUrl.replace(/\\/runsync$/, '/status/' + data.id).replace(/\\/run$/, '/status/' + data.id);
        if (statusUrl === customBaseUrl) {
           if (!statusUrl.endsWith('/')) statusUrl += '/';
           statusUrl += 'status/' + data.id;
        }
           
        let attempts = 0;
        while ((data.status === 'IN_QUEUE' || data.status === 'IN_PROGRESS') && attempts < 120) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          try {
            const statusResponse = await fetch(statusUrl, { headers: { "Authorization": "Bearer " + (customApiKey || '') } });
            if (statusResponse.ok) data = await statusResponse.json();
          } catch (e) {
            console.error("Polling error", e);
          }
          attempts++;
        }
           
        if (data.status !== 'COMPLETED') {
          throw new Error("RunPod job failed or timed out. Status: " + data.status);
        }
      }

      let reimagedUrl = '';
      if (data.output) {
        if (typeof data.output === 'string') reimagedUrl = data.output;
        else if (data.output.image) reimagedUrl = data.output.image;
        else if (data.output.images && data.output.images[0]) reimagedUrl = data.output.images[0];
        else if (data.output.image_url) reimagedUrl = data.output.image_url;
      }
      
      if (!reimagedUrl) throw new Error('No image returned from RunPod output.');
      if (!reimagedUrl.startsWith('data:')) reimagedUrl = "data:image/jpeg;base64," + reimagedUrl;
      
      return res.json({ reimagedUrl });
    }

    // 2. OpenAI / Groq / LiteLLM v1 image generations endpoint mapping
    if (customBaseUrl && (customBaseUrl.includes('/v1') || customBaseUrl.includes('openai'))) {
      let imgUrl = customBaseUrl;
      // If it's a completions endpoint, switch it to generations
      if (imgUrl.endsWith('/chat/completions')) {
        imgUrl = imgUrl.replace('/chat/completions', '/images/generations');
      } else if (!imgUrl.endsWith('/images/generations')) {
        if (!imgUrl.endsWith('/')) imgUrl += '/';
        imgUrl += 'images/generations';
      }

      const openAiPayload = {
        prompt: finalPrompt,
        model: customModelName || 'dall-e-3',
        n: 1,
        response_format: "b64_json"
      };

      const openAiResponse = await fetch(imgUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + (customApiKey || '')
        },
        body: JSON.stringify(openAiPayload)
      });
      
      if (!openAiResponse.ok) {
        // If images/generations is not supported, fallback to GenAI SDK 
        console.warn('OpenAI images/generations failed, falling back to GenAI SDK', openAiResponse.statusText);
      } else {
        const data = await openAiResponse.json();
        const b64 = data.data?.[0]?.b64_json;
        if (b64) {
          return res.json({ reimagedUrl: "data:image/jpeg;base64," + b64 });
        }
      }
    }

    // 3. Fallback: Standard Google GenAI SDK (handles Gemini and compatible custom backends)
    const { ai, modelName } = getAIClient(req);
    const targetModel = (customBaseUrl && customModelName) ? modelName : 'gemini-3.1-flash-lite-image';

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: {
        parts: [
          { inlineData: { data: cleanData, mimeType: 'image/jpeg' } },
          { text: finalPrompt }
        ],
      },
    });

    let reimagedUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
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
      errorMsg = 'Invalid API Key. Please verify your keys in the Custom Provider Settings.';
    }
    res.status(500).json({ error: errorMsg });
  }
});`;

code = code.replace(oldReimagineRoute, newReimagineRoute);
fs.writeFileSync('server.ts', code);
