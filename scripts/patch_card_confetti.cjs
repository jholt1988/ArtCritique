const fs = require('fs');

let code = fs.readFileSync('src/components/PillarCritiqueCard.tsx', 'utf8');

// Add import
code = code.replace(
  /import \{ PillarDetail, HotspotAnnotation \} from '\.\.\/types';/,
  "import { PillarDetail, HotspotAnnotation } from '../types';\nimport confetti from 'canvas-confetti';"
);

// Re-order and rewrite toggle
const originalToggle = `  const toggleRoadmapItem = (idx: number) => {
    setCompletedRoadmapItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const learningObjectives = (pillarData.actionableFix || '')
    .split(/(?<=[.!?])\\s+/)
    .filter(s => s.trim().length > 3)
    .map(s => s.trim());`;

const newToggle = `  const learningObjectives = (pillarData.actionableFix || '')
    .split(/(?<=[.!?])\\s+/)
    .filter(s => s.trim().length > 3)
    .map(s => s.trim());

  const toggleRoadmapItem = (idx: number) => {
    setCompletedRoadmapItems(prev => {
      const next = {
        ...prev,
        [idx]: !prev[idx]
      };
      
      const totalObjectives = learningObjectives.length;
      const completedCount = Object.values(next).filter(Boolean).length;
      
      if (completedCount === totalObjectives && totalObjectives > 0 && !prev[idx]) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#d97706', '#10b981']
        });
      }
      
      return next;
    });
  };`;

code = code.replace(originalToggle, newToggle);

fs.writeFileSync('src/components/PillarCritiqueCard.tsx', code);
