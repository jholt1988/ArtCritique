/**
 * Server-side hotspot normalization.
 *
 * Source of truth is the FRONTEND contract (src/types.ts -> HotspotAnnotation):
 *
 *   { id, x, y, pillar, title, issue, recommendation,
 *     severity: 'critical' | 'improvement' | 'strength' }
 *
 * The LLM schema used to emit a different shape:
 *   { x, y, title, description, type: 'issue' | 'strength' | 'refinement' }
 *
 * Weak / custom models (RunPod, Ollama, OpenAI-compatible) also routinely drop
 * fields, use the wrong enum, or omit `pillar`. `normalizeHotspots` is idempotent
 * and tolerant: it maps EVERY possible incoming hotspot onto the contract above
 * so the UI never reads an undefined field.
 *
 * It is pure (no I/O, no Date.now()) so it is trivially unit-testable and safe to
 * run in a React effect or a server sanitizer.
 */

export type Pillar = 'composition' | 'lighting' | 'anatomy' | 'storytelling';
export type HotspotSeverity = 'critical' | 'improvement' | 'strength';

export interface FrontendHotspot {
  id: string;
  x: number;
  y: number;
  pillar: Pillar;
  title: string;
  issue: string;
  recommendation: string;
  severity: HotspotSeverity;
}

const PILLARS: readonly Pillar[] = ['composition', 'lighting', 'anatomy', 'storytelling'];
const SEVERITIES: readonly HotspotSeverity[] = ['critical', 'improvement', 'strength'];

// Keyword buckets. First match wins; ordering encodes priority (more specific
// pillars first so "anatomy" isn't misread as "composition").
const PILLAR_KEYWORDS: Array<[Pillar, RegExp]> = [
  // anatomy & perspective systems
  [
    'anatomy',
    /anatom|proport|foreshorten|perspectiv|vanishing|horizon line|figure|skeleton|bone|muscle|joint|articulat|hand|fing|facial.?structure|landmark|fore?ground plane/i,
  ],
  // lighting & color
  [
    'lighting',
    /\b(light|lighting|shade|shadow|color|colour|palette|luminance|tonal|tonality|specular|rim light|rimlight|glow|ambient|fill light|key light|bounce light|contrast|saturation|temperature|white balance|chroma|hue|value range)\b/i,
  ],
  // mood & storytelling
  [
    'storytelling',
    /\b(mood|narrative|story|emotion|emotional|atmosphere|theme|thematic|character|intent|message|meaning|focal narrative|client impression|gallery readiness|commercial)\b/i,
  ],
  // composition & visual architecture (catch-all if other three miss)
  [
    'composition',
    /\b(composition|composit|arrangement|hierarchy|balance|negative space|visual weight|focal point|rule of thirds|golden|framing|leading line|crop|cropping|silhouette|staging|spatial|layer|depth|overlap)\b/i,
  ],
];

// Maps LLM `type` / legacy `severity` onto the frontend severity contract.
const SEVERITY_ALIASES: Record<string, HotspotSeverity> = {
  critical: 'critical',
  issue: 'critical',
  high: 'critical',
  high_priority: 'critical',
  major: 'critical',
  blocking: 'critical',
  refinement: 'improvement',
  improvement: 'improvement',
  improvement_area: 'improvement',
  improvementarea: 'improvement',
  improvement_opportunity: 'improvement',
  medium: 'improvement',
  medium_priority: 'improvement',
  minor: 'improvement',
  tweak: 'improvement',
  polish: 'improvement',
  strength: 'strength',
  good: 'strength',
  positive: 'strength',
  best: 'strength',
};

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

function clamp01_100(value: number | null): number {
  if (value === null) return 0;
  const clamped = Math.max(0, Math.min(100, value));
  return Math.round(clamped * 10) / 10; // one decimal to avoid 100.99999
}

function toPillar(raw: unknown, text: string): Pillar {
  if (typeof raw === 'string') {
    const clean = raw.trim().toLowerCase();
    if (PILLARS.includes(clean as Pillar)) return clean as Pillar;
  }
  for (const [pillar, re] of PILLAR_KEYWORDS) {
    if (re.test(text)) return pillar;
  }
  return 'composition';
}

function toSeverity(raw: unknown, text: string): HotspotSeverity {
  if (typeof raw === 'string') {
    const clean = raw.trim().toLowerCase();
    if (SEVERITIES.includes(clean as HotspotSeverity)) return clean as HotspotSeverity;
    if (clean in SEVERITY_ALIASES) return SEVERITY_ALIASES[clean];
  }
  // Fallback: infer from text if the enum is missing/unknown.
  if (/critical|blocking|broken|major|severe/i.test(text)) return 'critical';
  if (/\bstrength\b|great|excellent|positive|working well|do well/i.test(text)) return 'strength';
  return 'improvement';
}

function toText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

const ID_SOURCE_KEYS: string[] = ['id', 'hotspotId', 'hotspot_id', 'uuid'];

/**
 * Normalize a single raw hotspot (of any shape) onto the frontend contract.
 * `index` is used as a fallback seed for `id`, making every output id stable
 * across repeated calls on the same array (React keys stay stable).
 */
export function normalizeHotspot(raw: unknown, index: number): FrontendHotspot {
  const src = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  // Text corpus used for keyword-based inference (title + issue-ish fields).
  const title = toText(src.title) || toText(src.label) || toText(src.name);
  const issue = toText(src.issue) || toText(src.description) || toText(src.details) || toText(src.notes);
  const recommendation = toText(src.recommendation) || toText(src.fix) || toText(src.suggestion) || toText(src.advice);
  const pillarRaw = src.pillar;
  const severityRaw = src.severity ?? src.type; // legacy: `type` was used as severity
  const corpus = [title, issue, recommendation].join(' ');

  const x = clamp01_100(toNumber(src.x));
  const y = clamp01_100(toNumber(src.y));

  const pillar = toPillar(pillarRaw, corpus);
  const severity = toSeverity(severityRaw, corpus);

  // Stable id: prefer supplied, otherwise synthesize from position.
  let id = '';
  for (const key of ID_SOURCE_KEYS) {
    if (src[key] && typeof src[key] === 'string') {
      id = (src[key] as string).trim();
      if (id) break;
    }
  }
  if (!id) {
    id = `hotspot-${index}`;
  }

  return {
    id,
    x,
    y,
    pillar,
    title: title || 'Untitled annotation',
    issue: issue || 'No description provided.',
    recommendation: recommendation || 'See the pillar analysis above for a concrete fix.',
    severity,
  };
}

/**
 * Array-level entry point used by the `/api/critique` sanitizer. Tolerant of
 * null / non-array / garbage entries: each garbage entry becomes a valid
 * `FrontendHotspot` so React keys and rendering never see `undefined`.
 */
export function normalizeHotspots(raw: unknown): FrontendHotspot[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((h, i) => normalizeHotspot(h, i));
}
