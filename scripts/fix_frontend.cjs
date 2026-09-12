const fs = require('fs');

function fixFile(path, replacements) {
    let code = fs.readFileSync(path, 'utf8');
    for (let r of replacements) {
        code = code.replace(new RegExp(r[0], 'g'), r[1]);
    }
    fs.writeFileSync(path, code);
}

// 1. CritiqueOverview.tsx
fixFile('src/components/CritiqueOverview.tsx', [
    ['critique\\.composition\\.score', 'critique.composition?.score || 0'],
    ['critique\\.composition\\.headline', 'critique.composition?.headline || "Not evaluated"'],
    ['critique\\.lightingAndColor\\.score', 'critique.lightingAndColor?.score || 0'],
    ['critique\\.lightingAndColor\\.headline', 'critique.lightingAndColor?.headline || "Not evaluated"'],
    ['critique\\.anatomyAndPerspective\\.score', 'critique.anatomyAndPerspective?.score || 0'],
    ['critique\\.anatomyAndPerspective\\.headline', 'critique.anatomyAndPerspective?.headline || "Not evaluated"'],
    ['critique\\.moodAndStorytelling\\.score', 'critique.moodAndStorytelling?.score || 0'],
    ['critique\\.moodAndStorytelling\\.headline', 'critique.moodAndStorytelling?.headline || "Not evaluated"']
]);

// 2. ComparisonViewer.tsx
fixFile('src/components/ComparisonViewer.tsx', [
    ['artA\\.critique\\.composition\\.score', '(artA.critique.composition?.score || 0)'],
    ['artB\\.critique\\.composition\\.score', '(artB.critique.composition?.score || 0)'],
    ['artA\\.critique\\.lightingAndColor\\.score', '(artA.critique.lightingAndColor?.score || 0)'],
    ['artB\\.critique\\.lightingAndColor\\.score', '(artB.critique.lightingAndColor?.score || 0)'],
    ['artA\\.critique\\.anatomyAndPerspective\\.score', '(artA.critique.anatomyAndPerspective?.score || 0)'],
    ['artB\\.critique\\.anatomyAndPerspective\\.score', '(artB.critique.anatomyAndPerspective?.score || 0)'],
    ['artA\\.critique\\.moodAndStorytelling\\.score', '(artA.critique.moodAndStorytelling?.score || 0)'],
    ['artB\\.critique\\.moodAndStorytelling\\.score', '(artB.critique.moodAndStorytelling?.score || 0)']
]);

// 3. PortfolioModal.tsx
fixFile('src/components/PortfolioModal.tsx', [
    ['item\\.critique\\.composition\\.score', '(item.critique.composition?.score || 0)'],
    ['item\\.critique\\.lightingAndColor\\.score', '(item.critique.lightingAndColor?.score || 0)'],
    ['item\\.critique\\.anatomyAndPerspective\\.score', '(item.critique.anatomyAndPerspective?.score || 0)'],
    ['item\\.critique\\.moodAndStorytelling\\.score', '(item.critique.moodAndStorytelling?.score || 0)']
]);

// 4. PortfolioProgress.tsx
fixFile('src/components/PortfolioProgress.tsx', [
    ['item\\.critique\\.overallScore', '(item.critique?.overallScore || 0)']
]);

// 5. PortfolioDashboard.tsx
fixFile('src/components/PortfolioDashboard.tsx', [
    ['item\\.critique\\.overallScore', '(item.critique?.overallScore || 0)']
]);

// 6. utils/exportReport.ts
fixFile('src/utils/exportReport.ts', [
    ['critique\\.composition\\.score', '(critique.composition?.score || 0)'],
    ['critique\\.lightingAndColor\\.score', '(critique.lightingAndColor?.score || 0)'],
    ['critique\\.anatomyAndPerspective\\.score', '(critique.anatomyAndPerspective?.score || 0)'],
    ['critique\\.moodAndStorytelling\\.score', '(critique.moodAndStorytelling?.score || 0)']
]);

// 7. App.tsx
fixFile('src/App.tsx', [
    ['currentCritique\\.composition\\.score', '(currentCritique.composition?.score || 0)'],
    ['currentCritique\\.lightingAndColor\\.score', '(currentCritique.lightingAndColor?.score || 0)'],
    ['currentCritique\\.anatomyAndPerspective\\.score', '(currentCritique.anatomyAndPerspective?.score || 0)'],
    ['currentCritique\\.moodAndStorytelling\\.score', '(currentCritique.moodAndStorytelling?.score || 0)']
]);

