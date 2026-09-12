const fs = require('fs');
let code = fs.readFileSync('src/components/ArtCanvasViewer.tsx', 'utf8');

code = code.replace(
  /key=\{hotspot\.id\}/g,
  `key={hotspot.id || \`hotspot-\${idx}\`}`
);

fs.writeFileSync('src/components/ArtCanvasViewer.tsx', code);
