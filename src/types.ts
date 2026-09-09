export type ArtStyle =
  | 'Digital Painting'
  | 'Concept Art'
  | 'Character Design'
  | 'Environment / Matte Painting'
  | 'Stylized / Anime / Comic'
  | '3D Digital Render'
  | 'Fine Art / Impressionism'
  | 'Other / Mixed Media';

export type TargetContext =
  | 'Game / Film Studio Portfolio'
  | 'Art Gallery Exhibition'
  | 'Client Freelance Commission'
  | 'Social Media & Print Sales'
  | 'Personal Mastery & Study';

export interface HotspotAnnotation {
  id: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  pillar: 'composition' | 'lighting' | 'anatomy' | 'storytelling';
  title: string;
  issue: string;
  recommendation: string;
  severity: 'critical' | 'improvement' | 'strength';
}

export interface PillarDetail {
  score: number; // 1 to 10
  headline: string;
  detailedAnalysis: string;
  strengths: string[];
  refinements: string[];
  actionableFix: string;
  techniqueTip: string;
}

export interface ExtractedColor {
  hex: string;
  name: string;
  role: 'Dominant' | 'Secondary' | 'Accent' | 'Highlight' | 'Shadow';
  harmonyNotes: string;
}

export interface ArtCritique {
  id: string;
  timestamp: number;
  artworkTitle: string;
  artistStyle: ArtStyle;
  targetContext: TargetContext;
  intendedMood: string;
  overallScore: number; // 1 to 10 (with 1 decimal)
  galleryReadiness: 'Ready for Top Galleries & AAA Studios' | 'Strong Portfolio Piece (Minor Polish Needed)' | 'Promising Work in Progress (Core Revisions Recommended)' | 'Early Study / Needs Structural Overhaul';
  executiveSummary: string;
  composition: PillarDetail;
  lightingAndColor: PillarDetail;
  anatomyAndPerspective: PillarDetail;
  moodAndStorytelling: PillarDetail;
  hotspots: HotspotAnnotation[];
  colorPalette: ExtractedColor[];
  quickWins: string[];
  portfolioRecommendations: string[];
  clientImpression: string;
}

export interface PortfolioArtwork {
  id: string;
  title: string;
  imageData: string; // base64 or url
  critique: ArtCritique;
  createdAt: number;
  tags: string[];
  version: number;
  revisionNotes?: string;
  parentArtworkId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface CollectionCritique {
  collectionName: string;
  overallScore: number;
  executiveSummary: string;
  strengths: string[];
  areasForImprovement: string[];
  cohesionScore: number;
  portfolioFit: string;
}

export interface PortfolioCollection {
  id: string;
  name: string;
  description: string;
  itemIds: string[];
  critique?: CollectionCritique;
}
