/**
 * Version / parent chain resolution for the portfolio.
 *
 * The portfolio models iterative work as a chain per artwork:
 *
 *   v1 (seed/original upload) <- v2 (reimagine) <- v3 (reimagine) <- ...
 *
 * Each PortfolioArtwork row carries `version` and an optional
 * `parentArtworkId` pointing at the row it was derived from.
 *
 * ROOT CAUSE THIS MODULE FIXES:
 * App.tsx built the new row from `currentCritique.id`, which is the AI
 * critique's id ("critique_*" / "sample_critique_*") — never a portfolio row
 * id. The lookup therefore always missed, every edit landed as
 * `version: 2` with a dangling `parentArtworkId`, and repeated edits never
 * stacked (v2, v2, v2 instead of v2, v3, v4).
 *
 * These functions are pure (no React, no Date.now) so they are trivially
 * testable. App.tsx is the only caller.
 */

export interface VersionedArtwork {
  id: string;
  title: string;
  version: number;
  parentArtworkId?: string | null;
}

export interface ChainLink {
  version: number;
  parentArtworkId: string | null;
}

/**
 * Determine which chain a NEW row belongs to, and what version it should be.
 *
 * Resolution order:
 *   1. EXPLICIT parent (`parentPortfolioId`): the user is editing/re-imaging a
 *      specific portfolio row. The new row extends that row's own chain:
 *      version = parent.version + 1 (a re-imagine of a v2 row is v3).
 *   2. TITLE match: a fresh analysis of an image whose title matches an
 *      existing chain continues the HIGHEST version in that chain
 *      (re-critiquing "Cyberpunk Alley" after the artist re-painted it).
 *   3. Neither: a brand-new chain, version 1, no parent.
 */
export function resolveChain(
  portfolio: readonly VersionedArtwork[],
  parentPortfolioId: string | null,
  title: string
): ChainLink {
  if (parentPortfolioId) {
    const parent = portfolio.find((p) => p.id === parentPortfolioId);
    if (parent) {
      return { version: (parent.version || 1) + 1, parentArtworkId: parent.id };
    }
    // Parent was deleted since the artwork was loaded -> fall back to title.
  }

  const cleanTitle = (title || '').trim();
  if (cleanTitle) {
    const chain = portfolio.filter((p) => (p.title || '').trim() === cleanTitle);
    if (chain.length > 0) {
      const newest = chain.reduce((a, b) => ((a.version || 1) >= (b.version || 1) ? a : b));
      return { version: (newest.version || 1) + 1, parentArtworkId: newest.id };
    }
  }

  return { version: 1, parentArtworkId: null };
}

/**
 * Resolve the parent row for a generative edit of the currently loaded
 * artwork. A loaded artwork may have come from:
 *   - a portfolio row          -> `currentArtworkId` is that row's id
 *   - a sample preset          -> `currentArtworkId` is "seed_<sampleId>"
 *                                 (present in the seeded portfolio, or absent)
 *   - a fresh upload           -> `currentArtworkId` is null
 *
 * Returns the portfolio row id to use as parentArtworkId for the new row,
 * or null if the edit starts a new chain.
 */
export function resolveEditParent(
  portfolio: readonly VersionedArtwork[],
  currentArtworkId: string | null
): string | null {
  if (currentArtworkId && portfolio.some((p) => p.id === currentArtworkId)) {
    return currentArtworkId;
  }
  return null;
}
