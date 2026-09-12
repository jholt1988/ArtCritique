/**
 * Failing-first test for the hotspot normalization fix.
 *
 * Root cause under test: the server's LLM schema emits hotspots as
 *   { x, y, title, description, type: 'issue'|'strength'|'refinement' }
 * but the frontend (src/types.ts HotspotAnnotation + ArtCanvasViewer +
 * PillarCritiqueCard) reads:
 *   { id, x, y, pillar, title, issue, recommendation,
 *     severity: 'critical'|'improvement'|'strength' }
 *
 * These tests assert that normalizeHotspots() maps ANY incoming shape
 * onto the frontend contract. Run: npx tsx tests/hotspotNormalize.test.mts
 */
import { normalizeHotspot, normalizeHotspots } from '../hotspotNormalize.mts';

let failures = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    console.log(`  \u2713 ${name}`);
  } else {
    failures++;
    console.log(`  \u2717 ${name}${detail ? ` :: ${detail}` : ''}`);
  }
}

const FRONTEND_KEYS = ['id', 'x', 'y', 'pillar', 'title', 'issue', 'recommendation', 'severity'];

function hasContract(h: any) {
  return FRONTEND_KEYS.every((k) => k in h && h[k] !== undefined && h[k] !== null && !(typeof h[k] === 'string' && h[k].trim() === '' && !['recommendation'].includes(k)));
}

console.log('\n[1] legacy shape (type + description) -> frontend contract');
const legacy = normalizeHotspot(
  { x: 10, y: 20, title: 'Harsh rim light', description: 'The rim light is blown out', type: 'issue' },
  0
);
console.log('  ->', JSON.stringify(legacy));
check('emits id', typeof legacy.id === 'string' && legacy.id.length > 0);
check('keeps x', legacy.x === 10);
check('keeps y', legacy.y === 20);
check('keeps title', legacy.title === 'Harsh rim light');
check('maps description -> issue', legacy.issue === 'The rim light is blown out');
check('maps type issue -> severity critical', legacy.severity === 'critical');
check('pillar is a known pillar', ['composition', 'lighting', 'anatomy', 'storytelling'].includes(legacy.pillar));
check('has full frontend contract', hasContract(legacy));

console.log('\n[2] type refinment -> severity improvement');
const refine = normalizeHotspot({ x: 5, y: 5, title: 'Slight crop', description: 'Crop tighter', type: 'refinement', recommendation: 'Zoom in 5%' }, 1);
check('type refinement -> improvement', refine.severity === 'improvement', refine.severity);
check('keeps explicit recommendation', refine.recommendation === 'Zoom in 5%');

console.log('\n[3] type strength -> severity strength');
const strength = normalizeHotspot({ x: 60, y: 70, title: 'Great focal point', description: 'Eye lands naturally', type: 'strength' }, 2);
check('type strength -> strength', strength.severity === 'strength', strength.severity);

console.log('\n[4] explicit severity already valid -> passthrough');
const valid = normalizeHotspot({ x: 1, y: 2, title: 'T', issue: 'X', recommendation: 'R', severity: 'critical', pillar: 'lighting' }, 3);
check('severity passthrough', valid.severity === 'critical');
check('pillar passthrough (lighting)', valid.pillar === 'lighting', valid.pillar);
check('issue passthrough', valid.issue === 'X');
check('recommendation passthrough', valid.recommendation === 'R');

console.log('\n[5] pillar inference from text when pillar missing');
const inferLight = normalizeHotspot({ x: 0, y: 0, title: 'Lighting is flat', description: 'muddy shading', issue: 'muddy shading' }, 4);
check('infers lighting from "Lighting"', inferLight.pillar === 'lighting', inferLight.pillar);
const inferAnat = normalizeHotspot({ x: 0, y: 0, title: 'Perspective lines converge wrong', issue: 'perspective' }, 5);
check('infers anatomy from "Perspective"', inferAnat.pillar === 'anatomy', inferAnat.pillar);
const inferStory = normalizeHotspot({ x: 0, y: 0, title: 'Mood feels off', issue: 'mood' }, 6);
check('infers storytelling from "Mood"', inferStory.pillar === 'storytelling', inferStory.pillar);
const defComp = normalizeHotspot({ x: 0, y: 0, title: 'Balanced composition', issue: 'composition' }, 7);
check('falls back to composition', defComp.pillar === 'composition', defComp.pillar);

console.log('\n[6] clamps x/y into 0..100');
const clamped = normalizeHotspot({ x: 250, y: -30, title: 'T', issue: 'i' }, 8);
check('x clamped to 100', clamped.x === 100, String(clamped.x));
check('y clamped to 0', clamped.y === 0, String(clamped.y));

console.log('\n[7] numeric string coordinates parsed');
const strnum = normalizeHotspot({ x: '42.5', y: '60', title: 'T', issue: 'i' }, 9);
check('string x parsed to number', strnum.x === 42.5, String(strnum.x));
check('string y parsed to number', strnum.y === 60, String(strnum.y));

console.log('\n[8] normalizeHotspots handles null / non-array / empty array');
check('null -> []', Array.isArray(normalizeHotspots(null)) && (normalizeHotspots(null) as any[]).length === 0);
check('non-array -> []', Array.isArray(normalizeHotspots('nope')) && (normalizeHotspots('nope') as any[]).length === 0);
check('[] -> []', (normalizeHotspots([]) as any[]).length === 0);

console.log('\n[9] array of mixed shapes all land on contract');
const arr = normalizeHotspots([
  { x: 1, y: 1, title: 'A', description: 'd', type: 'issue' },
  { x: 2, y: 2, title: 'B', issue: 'ii', recommendation: 'rr', severity: 'strength' },
  { bogus: true },
]);
check('returns 3 entries', arr.length === 3, String(arr.length));
check('every entry has full contract', arr.every(hasContract));
check('stable unique ids', new Set(arr.map((h) => h.id)).size === 3);

console.log('\n──────────────────────────────────────────');
if (failures === 0) {
  console.log('\u2705 ALL PASSED\n');
  process.exit(0);
} else {
  console.log(`\u274c ${failures} FAILED\n`);
  process.exit(1);
}
