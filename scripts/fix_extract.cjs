const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
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
`;

// we need to remove from "function extractText(obj" to the "let outputText ="
const startIdx = code.indexOf('function extractText');
const endIdx = code.indexOf('let outputText = extractText(data);');
if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + replacement.trim() + '\n\n    ' + code.substring(endIdx);
    fs.writeFileSync('server.ts', code);
}
