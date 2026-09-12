const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
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
`;

code = code.replace(
  /const critiqueJson = JSON\.parse\(response\.text \|\| '\{\}'\);\s*\/\/ Sanitize missing nested objects to prevent frontend crashes/m,
  replacement
);

fs.writeFileSync('server.ts', code);
