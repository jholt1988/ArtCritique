/**
 * Failing-first structural test for the "stuck loading spinner" bug class.
 *
 * ROOT CAUSE UNDER TEST (App.tsx -> handleCritiqueCollection):
 *   setIsLoading(true);
 *   const collection = collections.find(...);
 *   if (!collection) return;   // <- early return BEFORE the try block
 *   try { ... } finally { setIsLoading(false); }
 *
 * The early return escapes the try/finally, so setIsLoading(false) never runs
 * and the whole app stays frozen in loading state.
 *
 * The invariant every async handler in App.tsx must satisfy:
 *   NO `return` statement may appear between a loading-state setter
 *   (setIsLoading(true) / setIsReimagining(true)) and the handler's first
 *   `try {` — because that `try` is what owns the reset in `finally`.
 *
 * This is a source-structure test (the repo has no React test harness), but it
 * asserts the exact shape of the bug: RED on the current App.tsx, GREEN once
 * the guard is moved above the setter (or the setter into the try).
 *
 * Run: npx tsx tests/loadingGuards.test.mts
 */
import * as fs from 'fs';
import * as path from 'path';

const APP_PATH = path.resolve(import.meta.dirname, '..', 'src', 'App.tsx');
const src = fs.readFileSync(APP_PATH, 'utf8');
const lines = src.split('\n');

let failures = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) console.log(`  \u2713 ${name}`);
  else { failures++; console.log(`  \u2717 ${name}${detail ? ` :: ${detail}` : ''}`); }
}

/** Extract a function body starting from `const <name> ... = ` by brace matching.
 *  Anchor on the arrow `=>` (or a plain `{` for non-arrow), so parameter type
 *  objects do not terminate the extraction. */
function extractFunctionBody(source: string, declName: string): string | null {
  const marker = `const ${declName} = `;
  const start = source.indexOf(marker);
  if (start === -1) return null;
  const arrow = source.indexOf('=>', start);
  const braceSearchFrom = arrow !== -1 && arrow < start + 2000 ? arrow : start;
  const firstBrace = source.indexOf('{', braceSearchFrom);
  if (firstBrace === -1) return null;
  let depth = 0;
  for (let i = firstBrace; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return source.slice(firstBrace, i + 1);
    }
  }
  return null;
}

function analyzeHandler(name: string): void {
  console.log(`\n[${name}]`);
  const body = extractFunctionBody(src, name);
  if (!body) {
    check('handler exists', false, `${name} not found in App.tsx`);
    return;
  }
  check('handler exists', true);

  const setters = [
    { label: 'setIsLoading(true)', re: /setIsLoading\(\s*true\s*\)/ },
    { label: 'setIsReimagining(true)', re: /setIsReimagining\(\s*true\s*\)/ },
  ];
  const firstTry = body.search(/\btry\s*\{/);

  for (const s of setters) {
    const m = body.match(s.re);
    if (!m || m.index === undefined) continue;

    // A reset via try/finally only protects code INSIDE that try. Any return
    // between the setter and the first try escapes the finally.
    const window = firstTry === -1 ? body.slice(m.index) : body.slice(m.index, firstTry);
    const returnMatch = window.match(/(^|[^.\w])return(\s|;|[{[\w(])/);

    check(
      `no early return between ${s.label} and first try (finally can reset it)`,
      !returnMatch,
      returnMatch
        ? `return statement found at \`${window.trim().split('\n').slice(0, 4).join(' | ')}...\``
        : ''
    );
  }
}

// --- Handlers that flip a global loading state and therefore MUST be safe ---
analyzeHandler('handleGenerativeEdit');
analyzeHandler('handleAnalyzeArtwork');
analyzeHandler('handleAutoGroup');
analyzeHandler('handleCritiqueCollection');

// --- Sanity: the reset paths actually exist where the spinners are cleared ---
console.log('\n[reset paths]');
check('handleCritiqueCollection has finally', /handleCritiqueCollection[\s\S]*?finally\s*\{[\s\S]*?setIsLoading\(false\)/.test(src));
check('handleAutoGroup has finally', /handleAutoGroup[\s\S]*?finally\s*\{[\s\S]*?setIsLoading\(false\)/.test(src));
check('handleGenerativeEdit clears reimagining', /handleGenerativeEdit[\s\S]*?finally\s*\{[\s\S]*?setIsReimagining\(false\)/.test(src));
check('handleAnalyzeArtwork clears loading', /handleAnalyzeArtwork[\s\S]*?finally\s*\{[\s\S]*?setIsLoading\(false\)/.test(src));

console.log('\n──────────────────────────────────────────');
if (failures === 0) { console.log('\u2705 ALL PASSED\n'); process.exit(0); }
else { console.log(`\u274c ${failures} FAILED\n`); process.exit(1); }
