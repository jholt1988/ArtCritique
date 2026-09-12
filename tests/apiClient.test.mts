/**
 * Test for apiClient fetch timeout.
 *
 *   Old fetchApi:  fetch(...) with no timeout — a hung LLM call froze the
 *                  "Analyzing" spinner indefinitely.
 *   New fetchApi:  wraps fetch with an AbortController that fires after
 *                  `timeoutMs` (default 120 s), and rethrows any abort as a
 *                  plain Error with a human-readable message, because UI
 *                  callers display `err.message` verbatim:
 *                      setErrorMessage(err.message || '...')
 *
 * The stub honors abort: it rejects with a DOMException when the signal
 * aborts, exactly like the real fetch. Node has no global localStorage
 * (getProviderHeaders reads it); the stub answers getItem -> null.
 *
 * Run: npx tsx tests/apiClient.test.mts
 */
// --- localStorage stub: Node 18+ has window.localStorage behind a flag, but
//     not on the global scope. The stub is only read, never written, in the
//     test; it just needs to answer getItem(key) -> null.
(globalThis as any).localStorage = {
  key: () => null,
  getItem: (() => null) as () => string | null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

import * as fs from 'fs';
import { fetchApi, DEFAULT_TIMEOUT_MS } from '../src/utils/apiClient';

let failures = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) console.log(`  \u2713 ${name}`);
  else { failures++; console.log(`  \u2717 ${name}${detail ? ` :: ${detail}` : ''}`); }
}

const origFetch = globalThis.fetch;

console.log('[A] fetchApi rejects with a READABLE error on timeout (not the raw DOMException)');
(globalThis as any).fetch = ((_url: string, opts?: RequestInit) =>
  // A network call that never completes — only the abort signal can end it.
  new Promise<Response>((_resolve, reject) => {
    // Real fetch rejects with a DOMException on abort; match that contract.
    const onAbort = () => reject(new DOMException('The operation was aborted due to timeout.', 'TimeoutError'));
    if (opts?.signal) opts.signal.addEventListener('abort', onAbort, { once: true });
  })) as typeof fetch;

const t0 = Date.now();
try {
  await fetchApi('/api/never-resolves', { timeoutMs: 30 });
  check('fetchApi rejected', false, 'it resolved instead');
} catch (err: any) {
  const ms = Date.now() - t0;
  check('fetchApi rejected', true);
  check('rejected near the timeout budget (not instantly, not forever)', ms >= 25 && ms < 5000, `${ms} ms`);
  check('err is a plain Error, not a DOMException', err instanceof Error && !(err instanceof DOMException), `constructor=${err?.constructor?.name} name=${err?.name}`);
  check('message names the timeout window', /timed out after/.test(err?.message ?? ''), `msg: ${err?.message}`);
  check('message names the URL', /\/api\/never-resolves/.test(err?.message ?? ''), `msg: ${err?.message}`);
  check('message gives an actionable hint (AI backend)', /AI backend/.test(err?.message ?? ''), `msg: ${err?.message}`);
}
(globalThis as any).fetch = origFetch;

console.log('\n[B] non-timeout errors pass through unchanged');
(function () {
  const boom = new TypeError('fetch failed');
  (globalThis as any).fetch = (() => Promise.reject(boom)) as typeof fetch;
  fetchApi('/api/boom', { timeoutMs: 100 }).then(
    () => { check('promise rejected', false, 'it resolved'); finish(); },
    (err) => { check('original error identity preserved', err === boom, `got ${err}`); (globalThis as any).fetch = origFetch; finish(); }
  );
})();

console.log('\n[C] default timeout is generous enough for an LLM vision call but bounded');
check('DEFAULT_TIMEOUT_MS === 120000 (120 s, per LLM vision-call budgets)', DEFAULT_TIMEOUT_MS === 120000, `got ${DEFAULT_TIMEOUT_MS}`);

console.log('\n[D] .no-scrollbar — used by App.tsx, MentorChat.tsx, PortfolioModal.tsx — is defined');
// The CSS side of this PR: the utility class those chip strips use was never
// actually defined; this locks the rule into src/index.css.
const css = fs.readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
check('rule selector present', /\.no-scrollbar\s*\{/.test(css));
check('webKit scrollbar display:none', /\.no-scrollbar::-webkit-scrollbar[^{]*\{\s*display:\s*none\s*;/.test(css), 'css: ' + css.slice(css.indexOf('.no-scrollbar::-webkit'), css.indexOf('.no-scrollbar::-webkit')+120));
check('Firefox scrollbar-width:none', /scrollbar-width:\s*none/.test(css));

function finish() {
  console.log('\n\u2500'.repeat(40));
  if (failures === 0) { console.log('\u2705 ALL PASSED\n'); process.exit(0); }
  else { console.log(`\u274c ${failures} FAILED\n`); process.exit(1); }
}
