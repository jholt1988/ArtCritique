const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
    const data = await runpodResponse.json();
    
    // Log for debugging
    fs.appendFileSync("/tmp/runpod_log.txt", "RUNPOD RESPONSE: " + JSON.stringify(data) + "\\n");
    
    function extractText(obj) {
      if (typeof obj === 'string') return obj;
      if (!obj || typeof obj !== 'object') return String(obj);
      
      // If it looks like the final critique JSON object already parsed
      if (obj.artworkTitle || obj.composition || obj.overallScore || obj.name || obj.itemIds || obj.collectionName) {
        return JSON.stringify(obj);
      }
      
      if (obj.output !== undefined) return extractText(obj.output);
      if (obj.choices && Array.isArray(obj.choices)) return extractText(obj.choices[0]);
      if (obj.message && obj.message.content) return extractText(obj.message.content);
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
        outputText = outputText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      }
    }

    return { text: outputText };
`;

code = code.replace(
  /const data = await runpodResponse\.json\(\);[\s\S]*?return \{ text: outputText \};/,
  replacement.trim()
);

fs.writeFileSync('server.ts', code);
