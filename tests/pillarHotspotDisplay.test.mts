/**
 * Fix-first test for PillarCritiqueCard "Show All High-Priority".
 * Confirms the GLOBAL semantics: the toggle is a cross-pillar critical hot
 * list, each item labeled with its pillar; scope disambiguation lives in the
 * empty-state message.
 * Run: npx tsx tests/pillarHotspotDisplay.test.mts
 */
import { selectDisplayHotspots } from '../src/utils/pillarHotspotDisplay';
import type { HotspotAnnotation } from '../src/types';

let failures = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) console.log(`  \u2713 ${name}`);
  else { failures++; console.log(`  \u2717 ${name}${detail ? ` :: ${detail}` : ''}`); }
}

const hs = (o: Partial<HotspotAnnotation> & { id: string }): HotspotAnnotation => ({
  x: 50, y: 50, pillar: 'composition', title: '', issue: '', recommendation: '',
  severity: 'improvement', ...o,
});

const FIXTURE: HotspotAnnotation[] = [
  hs({ id: 'a1', pillar: 'anatomy',      severity: 'critical' }),
  hs({ id: 'a2', pillar: 'anatomy',      severity: 'improvement' }),
  hs({ id: 'l1', pillar: 'lighting',     severity: 'critical' }),
  hs({ id: 'l2', pillar: 'lighting',     severity: 'strength' }),
  hs({ id: 'c1', pillar: 'composition',  severity: 'critical' }),
  hs({ id: 'c2', pillar: 'composition',  severity: 'improvement' }),
];

console.log('[1] toggle OFF on anatomy card -> only anatomy items, all severities');
const off = selectDisplayHotspots(FIXTURE, 'anatomy', false);
check('isGlobal=false', off.isGlobal === false);
check('items == anatomy set (a1,a2)', off.items.length === 2 && off.items.every(i => i.pillar === 'anatomy'));
check('empty message scoped to pillar', /pillar/i.test(off.emptyMessage));

console.log('\n[2] toggle ON on anatomy card -> every critical item from EVERY pillar');
const on = selectDisplayHotspots(FIXTURE, 'anatomy', true);
check('isGlobal=true', on.isGlobal === true);
check('includes critical from OTHER pillars (l1, c1)', ['l1','c1'].every(id => on.items.some(i => i.id === id)));
check('excludes all non-critical (a2,l2,c2)', on.items.every(i => i.severity === 'critical'));
check('count = 3', on.items.length === 3);
check('each item carries pillar label for its own pillar (l1 -> lighting)', on.items.find(i => i.id === 'l1')?.pillar === 'lighting');

console.log('\n[3] toggle ON, no critical anywhere -> global empty message');
const none = selectDisplayHotspots([hs({id:'x1', severity:'improvement'})], 'lighting', true);
check('empty items', none.items.length === 0);
check('empty message names the GLOBAL scope (not just "pillar")', /across|entire|artwork/i.test(none.emptyMessage));

console.log('\n──────────────────────────────────────────');
if (failures === 0) { console.log('\u2705 ALL PASSED\n'); process.exit(0); }
else { console.log(`\u274c ${failures} FAILED\n`); process.exit(1); }
