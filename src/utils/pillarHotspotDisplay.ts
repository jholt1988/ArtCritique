/**
 * Hotspot display-selection for PillarCritiqueCard — extracted so the
 * "Show All High-Priority" semantics are testable (see
 * tests/pillarHotspotDisplay.test.mts).
 *
 * CONFIRMED DESIRED BEHAVIOR (product decision, 2026-09-12):
 *  - toggle OFF  -> this pillar's annotations, all severities (pillar card
 *    context); items are scoped so no pillar badge is needed.
 *  - toggle ON   -> ALL critical annotations across the whole artwork
 *    (global "hot list"), each labeled with its pillar — the card is a
 *    launcher for the cross-pillar triage view.
 *
 * The legacy version of this logic lived inline in PillarCritiqueCard.tsx and
 * had a related defect: when ON, the empty state rendered the same string as
 * the OFF state ("No high-priority annotations found."), which is ambiguous
 * about *scope*; the section count label was also not tied to the actual
 * selection set explicitly.
 */
import type { HotspotAnnotation } from '../types';

export interface HotspotSelection {
  /** The exact list to render (toggle-aware). */
  items: HotspotAnnotation[];
  /** Toggle-aware empty-state message (disambiguates pillar vs global scope). */
  emptyMessage: string;
  /** Whether the selection is the global cross-pillar set. */
  isGlobal: boolean;
}

export function selectDisplayHotspots(
  hotspots: HotspotAnnotation[],
  pillarKey: string,
  showAllHighPriority: boolean,
): HotspotSelection {
  if (showAllHighPriority) {
    const critical = hotspots.filter((h) => h.severity === 'critical');
    return {
      items: critical,
      isGlobal: true,
      emptyMessage: 'No high-priority annotations found across the artwork in any pillar.',
    };
  }
  const inPillar = hotspots.filter((h) => h.pillar === pillarKey);
  return {
    items: inPillar,
    isGlobal: false,
    emptyMessage: 'No annotations on the canvas for this pillar yet.',
  };
}
