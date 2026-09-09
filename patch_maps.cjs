const fs = require('fs');

function safeMap(file, regex, replacement) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(regex, replacement);
  fs.writeFileSync(file, code);
}

// In CritiqueOverview.tsx
safeMap('src/components/CritiqueOverview.tsx', /critique\.quickWins\.map/g, '(critique.quickWins || []).map');
safeMap('src/components/CritiqueOverview.tsx', /critique\.portfolioRecommendations\.map/g, '(critique.portfolioRecommendations || []).map');

// In PillarCritiqueCard.tsx
safeMap('src/components/PillarCritiqueCard.tsx', /pillarData\.strengths\.map/g, '(pillarData.strengths || []).map');
safeMap('src/components/PillarCritiqueCard.tsx', /pillarData\.refinements\.map/g, '(pillarData.refinements || []).map');

// In ArtCanvasViewer.tsx
safeMap('src/components/ArtCanvasViewer.tsx', /hotspots\.map/g, '(hotspots || []).map');

// In ColorPaletteBar.tsx
safeMap('src/components/ColorPaletteBar.tsx', /palette\.map/g, '(palette || []).map');

// In CollectionView.tsx
safeMap('src/components/CollectionView.tsx', /collection\.critique\.strengths\.map/g, '(collection.critique.strengths || []).map');
safeMap('src/components/CollectionView.tsx', /collection\.critique\.areasForImprovement\.map/g, '(collection.critique.areasForImprovement || []).map');
safeMap('src/components/CollectionView.tsx', /tips\.map/g, '(tips || []).map');

// In PortfolioModal.tsx
safeMap('src/components/PortfolioModal.tsx', /collection\.critique\.strengths\.map/g, '(collection.critique.strengths || []).map');
safeMap('src/components/PortfolioModal.tsx', /collection\.critique\.areasForImprovement\.map/g, '(collection.critique.areasForImprovement || []).map');
