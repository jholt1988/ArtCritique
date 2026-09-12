/**
 * Failing-first test for the version/parent chain fix.
 * Run: npx tsx tests/versionChain.test.mts
 */
import { resolveChain, resolveEditParent, type VersionedArtwork } from '../src/utils/versionChain.ts';

let failures = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) console.log(`  \u2713 ${name}`);
  else { failures++; console.log(`  \u2717 ${name}${detail ? ` :: ${detail}` : ''}`); }
}

const row = (id: string, title: string, version: number, parentArtworkId: string | null = null): VersionedArtwork =>
  ({ id, title, version, parentArtworkId });

console.log('\n[1] fresh analysis, empty portfolio -> v1, no parent');
const a = resolveChain([], null, 'Cyberpunk Alley');
check('version 1', a.version === 1, String(a.version));
check('null parent', a.parentArtworkId === null);

console.log('\n[2] THE BUG: reimagine while a portfolio item is loaded -> v2 with real parent');
const portfolio = [row('seed_cyberpunk-alley', 'Cyberpunk Alley', 1)];
const editParent = resolveEditParent(portfolio, 'seed_cyberpunk-alley');
check('parent resolves to the loaded row', editParent === 'seed_cyberpunk-alley', String(editParent));
const link = resolveChain(portfolio, editParent, 'Cyberpunk Alley (Master Edit)');
check('version 2', link.version === 2, String(link.version));
check('parent is the seed row', link.parentArtworkId === 'seed_cyberpunk-alley', String(link.parentArtworkId));
check('parent id EXISTS in portfolio', portfolio.some((p) => p.id === link.parentArtworkId));

console.log('\n[3] repeated reimaginings stack versions (v2 -> v3 -> v4), not v2 forever');
const p2 = [
  row('seed_cyberpunk-alley', 'Cyberpunk Alley', 1),
  row('artwork_100', 'Cyberpunk Alley (Master Edit)', 2, 'seed_cyberpunk-alley'),
];
const l3 = resolveChain(p2, 'artwork_100', 'x');
check('editing v2 row yields v3', l3.version === 3, String(l3.version));
check('parent is v2 row', l3.parentArtworkId === 'artwork_100');
const p3 = [...p2, row('artwork_200', 'Cyberpunk Alley (Master Edit)', 3, 'artwork_100')];
const l4 = resolveChain(p3, 'artwork_200', 'x');
check('editing v3 row yields v4', l4.version === 4, String(l4.version));

console.log('\n[4] re-imagining a sample that was never saved -> falls back gracefully');
const loaded = resolveEditParent([], 'seed_valkyrie-portrait');
check('no parent found in empty portfolio', loaded === null);
const fresh = resolveChain([], null, 'Valkyrie Portrait (Master Edit)');
check('starts new chain v1', fresh.version === 1 && fresh.parentArtworkId === null);

console.log('\n[5] parent deleted after load -> falls back to title chain, no crash');
const delParent = resolveEditParent([row('artwork_1', 'X', 1)], 'artwork_gone');
check('deleted parent -> null (title fallback)', delParent === null);
const fb = resolveChain([row('seed_x', 'X', 1)], null, 'X');
check('title chain continues at v2', fb.version === 2 && fb.parentArtworkId === 'seed_x');

console.log('\n[6] re-critique: same-title chain already exists -> continues highest');
const chain = [
  row('seed_x', 'Storm Study', 1),
  row('artwork_1', 'Storm Study', 3, 'seed_x'),
  row('artwork_2', 'Storm Study', 2, 'seed_x'),
];
const cont = resolveChain(chain, null, 'Storm Study');
check('continues from highest (v3 -> v4)', cont.version === 4, String(cont.version));
check('parent is the v3 row', cont.parentArtworkId === 'artwork_1');

console.log('\n[7] different title -> new chain v1');
const nb = resolveChain(p2, null, 'Completely New Piece');
check('v1, null parent', nb.version === 1 && nb.parentArtworkId === null);

console.log('\n[8] whitespace-normalized title matching');
const ws = resolveChain([row('seed_x', 'Neon Port', 1)], null, '  Neon Port  ');
check('trimmed match continues chain', ws.version === 2 && ws.parentArtworkId === 'seed_x');

console.log('\n[9] empty/blank title -> new chain');
const bt = resolveChain(p2, null, '   ');
check('v1, null parent', bt.version === 1 && bt.parentArtworkId === null);

console.log('\n──────────────────────────────────────────');
if (failures === 0) { console.log('\u2705 ALL PASSED\n'); process.exit(0); }
else { console.log(`\u274c ${failures} FAILED\n`); process.exit(1); }
