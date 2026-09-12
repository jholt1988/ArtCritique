import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import * as fs from 'fs';
import { normalizeHotspots } from './hotspotNormalize.mts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

let aiClient: GoogleGenAI | null = null;
function getAIClient(req?: express.Request): { ai: GoogleGenAI, modelName: string } {
  let customApiKey = req?.headers['x-custom-api-key'] as string | undefined;
  let customBaseUrl = req?.headers['x-custom-base-url'] as string | undefined;
  let customModelName = req?.headers['x-custom-model-name'] as string | undefined;
  let modelName = customModelName || 'gemini-1.5-flash';

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
}

async function smartGenerateContent(req: express.Request, requestParams: any) {
  let customBaseUrl = req?.headers['x-custom-base-url'] as string | undefined;
  let customApiKey = req?.headers['x-custom-api-key'] as string | undefined;

  if (customBaseUrl?.includes('runpod.ai') && !customBaseUrl.includes('/v1') && !customBaseUrl.includes('/openai')) {
    let combinedPrompt = requestParams.config?.systemInstruction || '';
    const images = [];
        
    for (const part of requestParams.contents?.parts || []) {
      if (part.text) combinedPrompt += "\n\n" + part.text;
      if (part.inlineData) {
        images.push("data:" + part.inlineData.mimeType + ";base64," + part.inlineData.data);
      }
    }
    
    if (requestParams.config?.responseMimeType === 'application/json') {
      combinedPrompt += "\n\nCRITICAL: You MUST return strictly valid JSON matching this schema: " + JSON.stringify(requestParams.config.responseSchema);
      combinedPrompt += "\n\nOutput only the raw JSON, do not include any other text, markdown, or commentary.";
    }
    
    const runpodPayload: {
      input: { prompt: string; max_tokens: number; max_new_tokens: number; images?: string[]; image?: string };
    } = { 
      input: { 
        prompt: combinedPrompt.trim(),
        max_tokens: 4000,
        max_new_tokens: 4000
      } 
    };
    if (images.length > 0) {
      runpodPayload.input.images = images;
      runpodPayload.input.image = images[0];
    }

    fs.appendFileSync("/tmp/runpod_log.txt", "SENDING TO RUNPOD: " + JSON.stringify(runpodPayload) + "\n");
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
    
    // Polling logic for RunPod async jobs
    if (data.id && (data.status === 'IN_QUEUE' || data.status === 'IN_PROGRESS')) {
      let statusUrl = customBaseUrl.replace(/\/runsync$/, '/status/' + data.id).replace(/\/run$/, '/status/' + data.id);
      
      // If the user provided a URL that didn't end in run or runsync, attempt to construct it
      if (statusUrl === customBaseUrl) {
         if (!statusUrl.endsWith('/')) statusUrl += '/';
         statusUrl += 'status/' + data.id;
      }
      
      let attempts = 0;
      while ((data.status === 'IN_QUEUE' || data.status === 'IN_PROGRESS') && attempts < 120) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
          const statusResponse = await fetch(statusUrl, {
            headers: {
              "Authorization": "Bearer " + (customApiKey || '')
            }
          });
          if (statusResponse.ok) {
            const newData = await statusResponse.json();
            data = newData;
            // log the polling status for debug
            fs.appendFileSync("/tmp/runpod_log.txt", "RUNPOD POLL: " + JSON.stringify(data) + "\n");
          }
        } catch (e) {
          console.error("Polling error", e);
        }
        attempts++;
      }
      
      if (data.status !== 'COMPLETED') {
        throw new Error("RunPod job failed or timed out. Status: " + data.status);
      }
    }

    // Log for debugging
    fs.appendFileSync("/tmp/runpod_log.txt", "RUNPOD RESPONSE FINAL: " + JSON.stringify(data) + "\n");
    
    function extractText(obj: any): string {
      if (typeof obj === 'string') return obj;
      if (!obj || typeof obj !== 'object') return String(obj);
      
      if (obj.artworkTitle || obj.composition || obj.overallScore || obj.name || obj.itemIds || obj.collectionName) {
        return JSON.stringify(obj);
      }
      
      if (obj.output !== undefined) return extractText(obj.output);
      if (obj.choices && Array.isArray(obj.choices)) return extractText(obj.choices[0]);
      if (obj.message && obj.message.content) return extractText(obj.message.content);
      if (typeof obj.response === 'string' && obj.response.trim() !== '') return extractText(obj.response);
      if (typeof obj.thinking === 'string' && obj.thinking.trim() !== '') return extractText(obj.thinking);
      if (obj.text) return extractText(obj.text);
      if (obj.content) return extractText(obj.content);
      if (Array.isArray(obj)) return extractText(obj[0]);
      
      return JSON.stringify(obj);
    }

    let outputText = extractText(data);

    if (requestParams.config?.responseMimeType === 'application/json') {
      // Find the first { and last } in case there is conversational filler around the JSON
      const firstBrace = outputText.indexOf('{');
      const lastBrace = outputText.lastIndexOf('}');
      const firstBracket = outputText.indexOf('[');
      const lastBracket = outputText.lastIndexOf(']');
      
      let startIdx = firstBrace;
      let endIdx = lastBrace;
      
      // If it's supposed to be an array (for collections/tips)
      if (firstBracket !== -1 && lastBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
        startIdx = firstBracket;
        endIdx = lastBracket;
      }
      
      if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
        outputText = outputText.substring(startIdx, endIdx + 1);
      } else {
        outputText = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
      }
    }

    fs.appendFileSync("/tmp/runpod_log.txt", "EXTRACTED TEXT: " + outputText + "\n"); return { text: outputText };
  } else if (customBaseUrl) {
    let ollamaUrl = customBaseUrl;
    if (ollamaUrl.includes('/v1') && !ollamaUrl.includes('/chat/completions')) {
      if (!ollamaUrl.endsWith('/')) ollamaUrl += '/';
      ollamaUrl += 'chat/completions';
    } else if (!ollamaUrl.endsWith('/api/chat') && !ollamaUrl.endsWith('/api/generate') && !ollamaUrl.includes('/v1') && !ollamaUrl.includes('/chat/completions')) {
      if (!ollamaUrl.endsWith('/')) ollamaUrl += '/';
      ollamaUrl += 'api/chat';
    }
    
    
    const isV1OpenAI = ollamaUrl.includes('/v1') || ollamaUrl.includes('openai') || ollamaUrl.includes('groq') || ollamaUrl.includes('together');
    
    let systemMessage = requestParams.config?.systemInstruction || '';
    let userPrompt = '';
    const images = [];
        
    for (const part of requestParams.contents?.parts || []) {
      if (part.text) userPrompt += "\n\n" + part.text;
      if (part.inlineData) {
        images.push("data:" + part.inlineData.mimeType + ";base64," + part.inlineData.data);
      }
    }
    
    
    let schemaStr = '';
    if (requestParams.config?.responseSchema) {
      // Lowercase all "type" fields to make it standard JSON schema (so models don't get confused by "OBJECT" or "STRING")
      const cleanSchema = JSON.parse(JSON.stringify(requestParams.config.responseSchema).replace(/"type":"([A-Z]+)"/g, (match, p1) => '"type":"' + p1.toLowerCase() + '"'));
      schemaStr = JSON.stringify(cleanSchema);
    }
    
    if (requestParams.config?.responseMimeType === 'application/json') {
      userPrompt += "\n\nCRITICAL: You MUST return strictly valid JSON matching this schema: " + schemaStr;
      userPrompt += "\n\nOutput only the raw JSON, do not include any other text, markdown, or commentary.";
    }


    const messages = [];
    if (systemMessage) {
        messages.push({ role: 'system', content: systemMessage });
    }
    
    let userMessage;
    if (isV1OpenAI && images.length > 0) {
      // OpenAI Vision format
      const contentArr: Array<{ type: string } & Record<string, any>> = [{ type: "text", text: userPrompt.trim() }];
      for (const img of images) {
         contentArr.push({ type: "image_url", image_url: { url: img } });
      }
      userMessage = { role: 'user', content: contentArr };
    } else {
      // Ollama format or text-only
      userMessage = { role: 'user', content: userPrompt.trim() };
      if (images.length > 0) {
          // Ollama wants just the base64 part, strip the prefix
          userMessage.images = images.map(img => img.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, ''));
      }
    }
    messages.push(userMessage);

    const modelName = req?.headers['x-custom-model-name'] || (isV1OpenAI ? 'gpt-4o' : 'llama3.2-vision');

    let payload: Record<string, any> = {};
    if (isV1OpenAI) {
      payload = {
        model: modelName,
        messages: messages,
        temperature: requestParams.config?.temperature || 0.3,
        max_tokens: 2048
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
            num_ctx: 2048
        }
      };
      if (requestParams.config?.responseMimeType === 'application/json') {
          payload.format = 'json';
      }
    }

    fs.appendFileSync("/tmp/runpod_log.txt", "SENDING TO CUSTOM API: " + JSON.stringify(payload) + "\n");
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
    let outputText = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || data.message?.content || data.response || data.text || '';
    
    // If we still can't find the text, maybe it's nested differently. 
    // Fallback to stringifying the whole data if it doesn't look like an error
    if (!outputText && data && !data.error) {
       outputText = JSON.stringify(data);
    }


    
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
        outputText = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
      }
    }
    
    fs.appendFileSync("/tmp/runpod_log.txt", "OLLAMA TEXT: " + outputText + "\n"); 
    return { text: outputText };
  } else {
    const { ai, modelName } = getAIClient(req);
    return await ai.models.generateContent({
      model: modelName,
      ...requestParams
    });
  }
}

const ART_CRITIQUE_SYSTEM_INSTRUCTION = `You are a world-class Master Art Director, Senior Concept Artist, and Gallery Curator.
Your task is to conduct a systematic, professional, and constructive master-level critique of digital art, concept art, illustrations, and fine art pieces.
You MUST rigorously evaluate the artwork across the four fundamental artistic pillars:
1. Composition: Evaluating arrangement of elements, visual hierarchy, focal points, balance, visual weight, negative space, and execution of classical composition rules (rule of thirds, golden ratio/spiral, triangle/pyramidal composition, leading lines, framing).
2. Lighting & Color: Spotting inconsistent light sources (key, fill, bounce, ambient, rim/specular), flat or muddy shading, form rendering and core shadows, ambient occlusion, color harmony (gamut choices, saturation control, warm/cool temperature balance), and full tonal value range.
3. Anatomy & Perspective: Checking human/creature/figure proportions, bone landmarks, joint articulation, facial structure planes, foreshortening, and accuracy of perspective grids (1/2/3-point perspective, vanishing points, horizon level consistency, background line convergence).
4. Mood & Storytelling: Assessing whether the artwork effectively communicates the intended emotion, narrative intrigue, atmosphere, thematic resonance, and client/gallery commercial readiness.

Provide 3 to 5 precise Hotspot Annotations with estimated coordinates (x: 0 to 100%, y: 0 to 100%) indicating exact regions on the canvas where a specific issue, strength, or critical refinement is located. Each annotation MUST include: pillar (one of 'composition', 'lighting', 'anatomy', 'storytelling') — which pillar it belongs to; a short title; the issue/description of what is happening at that spot; a concrete recommendation or fix; and severity (one of 'critical', 'improvement', 'strength').
Also extract a 5-color dominant palette representing the work's color script.
Deliver candid, actionable, inspiring, and technically precise feedback. Avoid fluff or generic praise. Provide exact digital painting techniques and brushwork/value adjustments the artist can execute immediately.`;

app.post('/api/critique', async (req, res) => {
  try {
    const {
      image,
      mimeType = 'image/jpeg',
      artworkTitle = 'Untitled Piece',
      artistStyle = 'Digital Painting',
      targetContext = 'Game / Film Studio Portfolio',
      intendedMood = 'Not specified by artist',
      artistQuestions = '',
    } = req.body;

    if (!image) return res.status(400).json({ error: 'Image data is required' });

    const base64Data = image.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
    const promptText = `Please systematically evaluate this artwork titled "${artworkTitle}".
Artist Context:
- Style/Medium: ${artistStyle}
- Target Context/Audience: ${targetContext}
- Intended Mood & Narrative: ${intendedMood}
${artistQuestions ? `- Artist's Specific Questions/Concerns: "${artistQuestions}"` : ''}

Evaluate the artwork meticulously according to the 4 pillars:
1. Composition (Score 1-10)
2. Lighting and Color (Score 1-10)
3. Anatomy and Perspective (Score 1-10)
4. Mood and Storytelling (Score 1-10)

Provide structured JSON adhering precisely to the required schema.`;

    const response = await smartGenerateContent(req, {
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: promptText },
        ],
      },
      config: {
        systemInstruction: ART_CRITIQUE_SYSTEM_INSTRUCTION,
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            artworkTitle: { type: Type.STRING },
            overallScore: { type: Type.NUMBER, description: 'Overall master score from 1.0 to 10.0' },
            galleryReadiness: {
              type: Type.STRING,
              enum: [
                'Ready for Top Galleries & AAA Studios',
                'Strong Portfolio Piece (Minor Polish Needed)',
                'Promising Work in Progress (Core Revisions Recommended)',
                'Early Study / Needs Structural Overhaul',
              ],
            },
            executiveSummary: { type: Type.STRING },
            composition: {
              type: Type.OBJECT,
              properties: { score: { type: Type.NUMBER }, headline: { type: Type.STRING }, detailedAnalysis: { type: Type.STRING } },
              required: ['score', 'headline', 'detailedAnalysis'],
            },
            lightingAndColor: {
              type: Type.OBJECT,
              properties: { score: { type: Type.NUMBER }, headline: { type: Type.STRING }, detailedAnalysis: { type: Type.STRING } },
              required: ['score', 'headline', 'detailedAnalysis'],
            },
            anatomyAndPerspective: {
              type: Type.OBJECT,
              properties: { score: { type: Type.NUMBER }, headline: { type: Type.STRING }, detailedAnalysis: { type: Type.STRING } },
              required: ['score', 'headline', 'detailedAnalysis'],
            },
            moodAndStorytelling: {
              type: Type.OBJECT,
              properties: { score: { type: Type.NUMBER }, headline: { type: Type.STRING }, detailedAnalysis: { type: Type.STRING } },
              required: ['score', 'headline', 'detailedAnalysis'],
            },
            hotspots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER, description: '0 to 100 (percent from left edge)' },
                  y: { type: Type.NUMBER, description: '0 to 100 (percent from top edge)' },
                  pillar: { type: Type.STRING, enum: ['composition', 'lighting', 'anatomy', 'storytelling'], description: 'Which of the four pillars this annotation belongs to' },
                  title: { type: Type.STRING, description: 'Short label for the annotated region' },
                  issue: { type: Type.STRING, description: 'What is happening at this spot (problem or strength)' },
                  recommendation: { type: Type.STRING, description: 'Concrete fix or what to keep' },
                  severity: { type: Type.STRING, enum: ['critical', 'improvement', 'strength'] },
                },
                required: ['x', 'y', 'pillar', 'title', 'issue', 'severity'],
              },
            },
            colorPalette: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hex: { type: Type.STRING },
                  name: { type: Type.STRING },
                  role: { type: Type.STRING, enum: ['Dominant', 'Secondary', 'Accent', 'Highlight', 'Shadow'] },
                  harmonyNotes: { type: Type.STRING },
                },
                required: ['hex', 'name', 'role', 'harmonyNotes'],
              },
            },
            quickWins: { type: Type.ARRAY, items: { type: Type.STRING } },
            portfolioRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            clientImpression: { type: Type.STRING },
          },
          required: [
            'artworkTitle', 'overallScore', 'galleryReadiness', 'executiveSummary',
            'composition', 'lightingAndColor', 'anatomyAndPerspective', 'moodAndStorytelling',
            'hotspots', 'colorPalette', 'quickWins', 'portfolioRecommendations', 'clientImpression',
          ],
        },
      },
    });

    
    
    let critiqueJson = JSON.parse(response.text || '{}');
    
    // Auto-unwrap if the LLM nested the response
    if (!critiqueJson.artworkTitle && !critiqueJson.composition && !critiqueJson.overallScore) {
       if (critiqueJson.critique) critiqueJson = critiqueJson.critique;
       else if (critiqueJson.response) critiqueJson = critiqueJson.response;
       else if (critiqueJson.analysis) critiqueJson = critiqueJson.analysis;
       else if (critiqueJson.review) critiqueJson = critiqueJson.review;
       else if (critiqueJson.properties && critiqueJson.type) throw new Error("The AI model returned a schema definition instead of actual data. Please try again or use a stronger model.");
    }
    
    if (!critiqueJson.artworkTitle && !critiqueJson.overallScore) {
        const snippet = response.text ? response.text.substring(0, 150) + "..." : "Empty response";
        throw new Error("The custom AI model returned an unexpected or empty format that could not be parsed into a critique: " + snippet);
    }
    
    // Sanitize missing nested objects to prevent frontend crashes

    critiqueJson.composition = critiqueJson.composition || { score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing.", strengths: [], refinements: [], actionableFix: "", techniqueTip: "" };
    critiqueJson.lightingAndColor = critiqueJson.lightingAndColor || { score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing.", strengths: [], refinements: [], actionableFix: "", techniqueTip: "" };
    critiqueJson.anatomyAndPerspective = critiqueJson.anatomyAndPerspective || { score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing.", strengths: [], refinements: [], actionableFix: "", techniqueTip: "" };
    critiqueJson.moodAndStorytelling = critiqueJson.moodAndStorytelling || { score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing.", strengths: [], refinements: [], actionableFix: "", techniqueTip: "" };
    critiqueJson.overallScore = critiqueJson.overallScore || 0;
    critiqueJson.hotspots = critiqueJson.hotspots || [];
    critiqueJson.colorPalette = critiqueJson.colorPalette || [];
    critiqueJson.quickWins = critiqueJson.quickWins || [];
    critiqueJson.portfolioRecommendations = critiqueJson.portfolioRecommendations || [];

    critiqueJson.id = 'critique_' + Date.now();
    critiqueJson.timestamp = Date.now();

    // Normalize hotspots onto the frontend contract (HotspotAnnotation):
    // maps legacy {description,type} -> {issue,recommendation,severity}, infers
    // pillar, assigns stable ids, clamps coordinates. Weak/custom models that
    // ignore the responseSchema still produce renderable annotations.
    critiqueJson.hotspots = normalizeHotspots(critiqueJson.hotspots);
    critiqueJson.artistStyle = artistStyle;
    critiqueJson.targetContext = targetContext;
    critiqueJson.intendedMood = intendedMood;

    res.json(critiqueJson);
  } catch (error: any) {
    console.error('Critique generation failed:', error);
    
    let errorMsg = error?.message || 'Failed to analyze artwork.';
    if (errorMsg === 'fetch failed' || errorMsg.includes('ECONNREFUSED')) {
      errorMsg = 'Failed to connect to the custom API endpoint (e.g., Ollama or Runpod). Please verify that the Base URL in Custom Provider Settings is correct, reachable, and the server is running.';
    }
    if (errorMsg.includes('404') && errorMsg.includes('Not Found')) {
      errorMsg = 'Model not found. The selected AI model does not exist or is unavailable. Please check the model name in Custom Provider Settings.';
    } else if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid') || errorMsg.includes('API key not valid.')) {
      errorMsg = 'Invalid Gemini API Key. Please provide a valid API key in the Custom Provider Settings (gear icon) or check your server environment variables.';
    }
    res.status(500).json({ error: errorMsg });

  }
});

app.post('/api/mentor-chat', async (req, res) => {
  try {
    const { messages, critiqueContext, currentQuestion, imageBase64 } = req.body;
    const parts: any[] = [];

    if (imageBase64) {
      const cleanData = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanData } });
    }

    const conversationHistory = (messages || [])
      .map((m: any) => `${m.sender === 'user' ? 'Artist' : 'Master Mentor'}: ${m.text}`)
      .join('\n');

    const prompt = `You are a Master Digital Painting Mentor & Art Director providing coaching to an artist about their piece.
Critique Context on this artwork:
- Title: ${critiqueContext?.artworkTitle || 'Artwork'}
- Overall Score: ${critiqueContext?.overallScore || 'N/A'}/10
- Composition Summary: ${critiqueContext?.composition?.headline || ''}
- Lighting Summary: ${critiqueContext?.lightingAndColor?.headline || ''}
- Anatomy Summary: ${critiqueContext?.anatomyAndPerspective?.headline || ''}
- Mood Summary: ${critiqueContext?.moodAndStorytelling?.headline || ''}

Conversation history:
${conversationHistory}

Artist's latest question:
"${currentQuestion}"

Provide a concise, encouraging, deeply technical, and practical response. Offer specific step-by-step techniques (e.g. blend modes like Color Dodge / Multiply, brush opacity, curve adjustments, reference gathering tips, anatomical landmarks) to help the artist master the concept.`;

    parts.push({ text: prompt });

    const response = await smartGenerateContent(req, {
      contents: { parts },
      config: { temperature: 0.5 },
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Mentor chat error:', error);
    
    let errorMsg = error?.message || 'Failed to get mentor response.';
    if (errorMsg.includes('404') && errorMsg.includes('Not Found')) {
      errorMsg = 'Model not found. The selected AI model does not exist or is unavailable. Please check the model name in Custom Provider Settings.';
    } else if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid') || errorMsg.includes('API key not valid.')) {
      errorMsg = 'Invalid Gemini API Key. Please provide a valid API key in the Custom Provider Settings (gear icon) or check your server environment variables.';
    }
    res.status(500).json({ error: errorMsg });

  }
});

app.post('/api/group-collections', async (req, res) => {
  try {
    const { portfolioItems } = req.body;
    const itemsSummary = portfolioItems.map((p: any) => ({
      id: p.id,
      title: p.title,
      tags: p.tags,
      score: p.critique?.overallScore,
      summary: p.critique?.executiveSummary,
    }));

    const prompt = `You are an expert Art Director curating an artist's portfolio. Based on the following list of artworks, organize them into logical collections (e.g., by subject matter, art style, project, or series). Return a JSON array of collections, where each collection has a 'name' (string), a 'description' (string), and an 'itemIds' array containing the IDs of the artworks that belong to it.
Ensure every artwork belongs to at least one collection, and it can belong to multiple if appropriate.
Artworks:
${JSON.stringify(itemsSummary, null, 2)}`;

    const response = await smartGenerateContent(req, {
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              itemIds: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['name', 'description', 'itemIds']
          }
        }
      }
    });

    let collections = JSON.parse(response.text || '[]');
    if (!Array.isArray(collections)) collections = [];
    res.json(collections);
  } catch (error: any) {
    console.error('Collection grouping failed:', error);
    
    let errorMsg = error?.message || 'Failed to auto-group collections.';
    if (errorMsg.includes('404') && errorMsg.includes('Not Found')) {
      errorMsg = 'Model not found. The selected AI model does not exist or is unavailable. Please check the model name in Custom Provider Settings.';
    } else if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid') || errorMsg.includes('API key not valid.')) {
      errorMsg = 'Invalid Gemini API Key. Please provide a valid API key in the Custom Provider Settings (gear icon) or check your server environment variables.';
    }
    res.status(500).json({ error: errorMsg });

  }
});

app.post('/api/critique-collection', async (req, res) => {
  try {
    const { collectionName, collectionDescription, items } = req.body;
    const parts: any[] = [];
    
    let textPrompt = `You are a Master Art Director critiquing a cohesive collection of an artist's work.
Collection Name: ${collectionName}
Description: ${collectionDescription}
You will see several artworks belonging to this collection. Evaluate them as a unified body of work. Provide a comprehensive JSON review.`;
    
    parts.push({ text: textPrompt });

    items.forEach((item: any) => {
      const cleanData = item.imageData.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanData } });
      parts.push({ text: `Title: ${item.title}` });
    });

    const response = await smartGenerateContent(req, {
      contents: { parts },
      config: {
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            collectionName: { type: Type.STRING },
            overallScore: { type: Type.NUMBER, description: '1.0 to 10.0' },
            executiveSummary: { type: Type.STRING, description: 'Overall thoughts on the collection as a whole' },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
            cohesionScore: { type: Type.NUMBER, description: 'How well the pieces fit together (1-10)' },
            portfolioFit: { type: Type.STRING, description: 'Where this collection belongs in a professional portfolio' }
          },
          required: ['collectionName', 'overallScore', 'executiveSummary', 'strengths', 'areasForImprovement', 'cohesionScore', 'portfolioFit']
        }
      }
    });

    const critique = JSON.parse(response.text || '{}');
    
    critique.strengths = critique.strengths || [];
    critique.areasForImprovement = critique.areasForImprovement || [];
    critique.overallScore = critique.overallScore || 0;
    critique.cohesionScore = critique.cohesionScore || 0;
    critique.executiveSummary = critique.executiveSummary || 'Data missing.';
    critique.portfolioFit = critique.portfolioFit || 'Data missing.';
    critique.collectionName = critique.collectionName || collectionName;

    res.json(critique);
  } catch (error: any) {
    console.error('Collection critique failed:', error);
    
    let errorMsg = error?.message || 'Failed to critique collection.';
    if (errorMsg.includes('404') && errorMsg.includes('Not Found')) {
      errorMsg = 'Model not found. The selected AI model does not exist or is unavailable. Please check the model name in Custom Provider Settings.';
    } else if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid') || errorMsg.includes('API key not valid.')) {
      errorMsg = 'Invalid Gemini API Key. Please provide a valid API key in the Custom Provider Settings (gear icon) or check your server environment variables.';
    }
    res.status(500).json({ error: errorMsg });

  }
});

app.post('/api/collection-tips', async (req, res) => {
  try {
    const { collectionName, critique } = req.body;
    const prompt = `You are a Master Art Director mentoring an artist. The artist has a cohesive collection named "${collectionName}".
Here is the current aggregate critique for this collection:
${JSON.stringify(critique, null, 2)}
Based strictly on this aggregate critique, suggest 3-5 specific, actionable cross-piece styling or thematic adjustment tips that the artist can apply to unify and elevate the entire collection.
Return a JSON array of strings, where each string is a tip.`;

    const response = await smartGenerateContent(req, {
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0.5,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    let tips = JSON.parse(response.text || '[]');
    if (!Array.isArray(tips)) tips = [];
    res.json({ tips });
  } catch (error: any) {
    console.error('Collection tips failed:', error);
    
    let errorMsg = error?.message || 'Failed to generate tips.';
    if (errorMsg.includes('404') && errorMsg.includes('Not Found')) {
      errorMsg = 'Model not found. The selected AI model does not exist or is unavailable. Please check the model name in Custom Provider Settings.';
    } else if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid') || errorMsg.includes('API key not valid.')) {
      errorMsg = 'Invalid Gemini API Key. Please provide a valid API key in the Custom Provider Settings (gear icon) or check your server environment variables.';
    }
    res.status(500).json({ error: errorMsg });

  }
});

app.post('/api/runpod-test', async (req, res) => {
  try {
    const { url, apiKey, prompt } = req.body;
    const targetUrl = url || "https://api.runpod.ai/v2/26fy19ea1giplj/runsync";
    const requestConfig = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey || 'YOUR_API_KEY'}`
      },
      body: JSON.stringify({ "input": { "prompt": prompt || "Say: Hallo World!" } })
    };
    
    const response = await fetch(targetUrl, requestConfig);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('RunPod Test Error:', error);
    
    let errorMsg = error?.message || 'Failed to execute RunPod request.';
    if (errorMsg.includes('404') && errorMsg.includes('Not Found')) {
      errorMsg = 'Model not found. The selected AI model does not exist or is unavailable. Please check the model name in Custom Provider Settings.';
    } else if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid') || errorMsg.includes('API key not valid.')) {
      errorMsg = 'Invalid Gemini API Key. Please provide a valid API key in the Custom Provider Settings (gear icon) or check your server environment variables.';
    }
    res.status(500).json({ error: errorMsg });

  }
});


app.post('/api/reimagine', async (req, res) => {
  try {
    const { imageBase64, critiqueSummary, customPrompt } = req.body;
    const cleanData = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
    
    let customBaseUrl = req.headers['x-custom-base-url'] as string | undefined;
    let customApiKey = req.headers['x-custom-api-key'] as string | undefined;
    let customModelName = req.headers['x-custom-model-name'] as string | undefined;

    const finalPrompt = customPrompt || `Apply the following Art Director feedback: "${critiqueSummary}". Redraw, refine, and upscale this artwork to implement these improvements while maintaining the original spirit and composition. Render it as a high-quality masterpiece.`;

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
        let statusUrl = customBaseUrl.replace(/\/runsync$/, '/status/' + data.id).replace(/\/run$/, '/status/' + data.id);
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
        let errText = await openAiResponse.text();
        throw new Error(`OpenAI image generation failed: ${openAiResponse.status} ${openAiResponse.statusText} - ${errText}`);
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
        reimagedUrl = `data:${mime};base64,${part.inlineData.data}`;
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
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ArtCritique VLM Backend', timestamp: Date.now() });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA catchall: any non-API route (unknown paths, deep client-side routes
    // like /portfolio or /comparison) falls through to index.html so the
    // client router can take over. Uses an explicit regex so API 404s (JSON
    // responses from their handlers) don't collide with the catchall, and
    // unknown API routes return JSON not the SPA shell.
    app.get(/^(?!\/api\/).*/, (req, res, next) => {
        if (req.accepts('html')) {
            return res.sendFile(path.join(distPath, 'index.html'));
        }
        return res.status(404).json({ error: 'Not found' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`ArtCritique VLM Server active on port ${PORT}`));
}

startServer();
