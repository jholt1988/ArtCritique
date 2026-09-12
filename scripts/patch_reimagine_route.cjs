const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const route = `
app.post('/api/reimagine', async (req, res) => {
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
});

`;

// Insert before app.get('/api/health')
code = code.replace("app.get('/api/health'", route + "app.get('/api/health'");
fs.writeFileSync('server.ts', code);
