import { ArtCritique } from '../types';

export interface SampleArtwork {
  id: string;
  title: string;
  artistStyle: string;
  targetContext: string;
  intendedMood: string;
  artistQuestions: string;
  thumbnail: string;
  imageData: string;
  critiquePreset: ArtCritique;
}

// Crisp artistic SVG images that showcase distinct styles, composition setups, and lighting schemes
const CYBERPUNK_ALLEY_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#090514"/>
      <stop offset="60%" stop-color="#150a2a"/>
      <stop offset="100%" stop-color="#2a0845"/>
    </linearGradient>
    <linearGradient id="neonPink" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff007f"/>
      <stop offset="100%" stop-color="#ff00ff"/>
    </linearGradient>
    <linearGradient id="neonCyan" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00f0ff"/>
      <stop offset="100%" stop-color="#0077ff"/>
    </linearGradient>
    <linearGradient id="wetGround" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0d0d1a"/>
      <stop offset="100%" stop-color="#050508"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <!-- Background & Sky -->
  <rect width="800" height="600" fill="url(#skyGrad)"/>
  
  <!-- Distant Skyscrapers (Perspective Lines converging to middle-right) -->
  <polygon points="100,50 220,90 220,420 100,450" fill="#0f0c1b"/>
  <polygon points="220,90 340,140 340,400 220,420" fill="#181329"/>
  <polygon points="560,120 700,60 700,460 560,420" fill="#120e24"/>
  <polygon points="460,160 560,120 560,420 460,390" fill="#1b1533"/>
  
  <!-- Vanishing Center Alley Buildings -->
  <polygon points="340,200 460,200 430,360 370,360" fill="#0d091a"/>
  
  <!-- Windows & Grid details -->
  <g fill="#ff0055" opacity="0.3">
    <rect x="120" y="100" width="8" height="14"/><rect x="140" y="100" width="8" height="14"/>
    <rect x="120" y="130" width="8" height="14"/><rect x="140" y="130" width="8" height="14"/>
    <rect x="120" y="160" width="8" height="14"/><rect x="140" y="160" width="8" height="14"/>
  </g>
  <g fill="#00f0ff" opacity="0.4">
    <rect x="600" y="100" width="10" height="16"/><rect x="630" y="100" width="10" height="16"/>
    <rect x="600" y="140" width="10" height="16"/><rect x="630" y="140" width="10" height="16"/>
    <rect x="600" y="180" width="10" height="16"/><rect x="630" y="180" width="10" height="16"/>
  </g>

  <!-- Wet Street Ground -->
  <polygon points="0,450 800,450 800,600 0,600" fill="url(#wetGround)"/>

  <!-- Neon Signs with Glow -->
  <g filter="url(#glow)">
    <!-- Kanji / Neon Bar Sign Left -->
    <rect x="180" y="180" width="24" height="130" rx="4" fill="#111" stroke="#ff007f" stroke-width="2"/>
    <text x="192" y="215" fill="#ff007f" font-family="sans-serif" font-weight="bold" font-size="18" text-anchor="middle">電</text>
    <text x="192" y="250" fill="#ff007f" font-family="sans-serif" font-weight="bold" font-size="18" text-anchor="middle">脳</text>
    <text x="192" y="285" fill="#ff007f" font-family="sans-serif" font-weight="bold" font-size="18" text-anchor="middle">街</text>
    
    <!-- Cyber Hologram Sign Right -->
    <rect x="520" y="200" width="110" height="36" rx="4" fill="#001524" stroke="#00f0ff" stroke-width="2"/>
    <text x="575" y="224" fill="#00f0ff" font-family="sans-serif" font-weight="bold" font-size="14" text-anchor="middle">SYNTHESIS</text>

    <!-- Streetlamp / Light Beam -->
    <circle cx="300" cy="310" r="8" fill="#ffe066"/>
    <polygon points="300,310 240,490 380,490" fill="#ffe066" opacity="0.12"/>
  </g>

  <!-- Reflections on Rain-slicked Asphalt -->
  <ellipse cx="280" cy="510" rx="45" ry="12" fill="#ff007f" opacity="0.35" filter="url(#glow)"/>
  <ellipse cx="550" cy="520" rx="60" ry="14" fill="#00f0ff" opacity="0.3" filter="url(#glow)"/>
  <ellipse cx="320" cy="500" rx="30" ry="8" fill="#ffe066" opacity="0.25"/>

  <!-- Character Silhouette (Rule of Thirds Left Intersection) -->
  <g>
    <!-- Coat Silhouette -->
    <path d="M 285 365 C 280 350 270 350 265 365 L 250 470 L 295 470 Z" fill="#050308"/>
    <!-- Head & Fedora/Cap -->
    <ellipse cx="275" cy="340" rx="9" ry="11" fill="#050308"/>
    <ellipse cx="275" cy="336" rx="15" ry="4" fill="#050308"/>
    <!-- Cybernetic Eye/Collar Rim Light (Right edge) -->
    <path d="M 285 365 L 295 470" stroke="#00f0ff" stroke-width="2.5" opacity="0.9" fill="none" filter="url(#glow)"/>
    <circle cx="278" cy="342" r="2" fill="#00f0ff" filter="url(#glow)"/>
  </g>

  <!-- Steam / Atmosphere -->
  <ellipse cx="400" cy="380" rx="70" ry="25" fill="#795290" opacity="0.18" filter="url(#glow)"/>
  <ellipse cx="260" cy="460" rx="50" ry="15" fill="#00f0ff" opacity="0.12"/>
</svg>
`)}`;

const PORTRAIT_VALKYRIE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <radialGradient id="vignette" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#24171e"/>
      <stop offset="60%" stop-color="#120c11"/>
      <stop offset="100%" stop-color="#070406"/>
    </radialGradient>
    <linearGradient id="goldArmor" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe28a"/>
      <stop offset="50%" stop-color="#d49b38"/>
      <stop offset="100%" stop-color="#7a4e0c"/>
    </linearGradient>
    <linearGradient id="skinTone" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#fedfd0"/>
      <stop offset="50%" stop-color="#e8a888"/>
      <stop offset="100%" stop-color="#a8604c"/>
    </linearGradient>
    <linearGradient id="rimLightBlue" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#aee7ff"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="800" height="600" fill="url(#vignette)"/>

  <!-- Dramatic Rim Light Back-Aura -->
  <circle cx="400" cy="270" r="180" fill="#e06a3b" opacity="0.15" filter="url(#softGlow)"/>

  <!-- Character Bust -->
  <!-- Shoulders & Golden Pauldron (Left & Right) -->
  <path d="M 240 450 C 270 380 340 370 400 370 C 460 370 530 380 560 450 L 590 600 L 210 600 Z" fill="#1f1820"/>
  
  <!-- Ornate Golden Breastplate -->
  <path d="M 330 420 Q 400 480 470 420 L 485 580 Q 400 620 315 580 Z" fill="url(#goldArmor)"/>
  <path d="M 400 440 L 400 580" stroke="#ffe28a" stroke-width="3" opacity="0.7"/>

  <!-- Neck & Jaw -->
  <polygon points="365,310 435,310 445,390 355,390" fill="url(#skinTone)"/>
  <!-- Cast shadow under chin -->
  <polygon points="360,315 440,315 400,345" fill="#6d392e" opacity="0.7"/>

  <!-- Face Structure & Planes -->
  <path d="M 350 230 C 350 170 450 170 450 230 C 450 280 425 325 400 325 C 375 325 350 280 350 230 Z" fill="url(#skinTone)"/>

  <!-- Eyes, Eyebrows & Golden War Paint -->
  <g>
    <!-- Left Eye -->
    <path d="M 365 225 Q 380 218 390 225 Q 380 232 365 225" fill="#fdf2f8"/>
    <circle cx="378" cy="225" r="4.5" fill="#38bdf8"/>
    <circle cx="379" cy="223" r="1.5" fill="#ffffff"/>
    <path d="M 362 215 Q 378 208 392 218" stroke="#3b1f1a" stroke-width="3" fill="none"/>

    <!-- Right Eye -->
    <path d="M 410 225 Q 420 218 435 225 Q 420 232 410 225" fill="#fdf2f8"/>
    <circle cx="422" cy="225" r="4.5" fill="#38bdf8"/>
    <circle cx="423" cy="223" r="1.5" fill="#ffffff"/>
    <path d="M 408 218 Q 422 208 438 215" stroke="#3b1f1a" stroke-width="3" fill="none"/>

    <!-- Golden Feather Markings under eyes -->
    <polygon points="370,234 380,234 375,255" fill="#f59e0b" opacity="0.85"/>
    <polygon points="420,234 430,234 425,255" fill="#f59e0b" opacity="0.85"/>

    <!-- Nose & Lips -->
    <path d="M 398 220 L 396 260 L 404 260 Z" fill="#b06954"/>
    <path d="M 388 280 Q 400 274 412 280 Q 400 292 388 280" fill="#993838"/>
  </g>

  <!-- Flowing White Valkyrie Hair -->
  <path d="M 345 210 C 310 260 280 390 290 480 C 310 440 330 380 345 320 Z" fill="#e2e8f0"/>
  <path d="M 455 210 C 490 260 520 390 510 480 C 490 440 470 380 455 320 Z" fill="#cbd5e1"/>
  <path d="M 350 180 C 380 140 420 140 450 180 C 440 160 360 160 350 180 Z" fill="#f8fafc"/>

  <!-- Winged Valkyrie Circlet / Crown -->
  <path d="M 330 195 L 400 170 L 470 195 L 400 205 Z" fill="url(#goldArmor)"/>
  <!-- Winged Feathers on Crown -->
  <polygon points="330,195 260,110 320,180" fill="#f1f5f9" stroke="#d49b38" stroke-width="2"/>
  <polygon points="470,195 540,110 480,180" fill="#f1f5f9" stroke="#d49b38" stroke-width="2"/>
  <circle cx="400" cy="187" r="5" fill="#38bdf8" filter="url(#softGlow)"/>

  <!-- Left Key Light (Warm Sun/Fire) vs Right Cold Ambient Fill -->
  <path d="M 330 180 C 320 280 325 380 340 470" stroke="#fcd34d" stroke-width="4" fill="none" opacity="0.4" filter="url(#softGlow)"/>
  <path d="M 470 180 C 480 280 475 380 460 470" stroke="#38bdf8" stroke-width="3" fill="none" opacity="0.5" filter="url(#softGlow)"/>

  <!-- Floating Sparkles / Embers -->
  <circle cx="260" cy="220" r="2.5" fill="#fcd34d" opacity="0.8"/>
  <circle cx="520" cy="340" r="3" fill="#38bdf8" opacity="0.7"/>
  <circle cx="480" cy="150" r="2" fill="#ffffff" opacity="0.9"/>
</svg>
`)}`;

const FANTASY_GROVE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="forestSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#022019"/>
      <stop offset="50%" stop-color="#053b2f"/>
      <stop offset="100%" stop-color="#0d5241"/>
    </linearGradient>
    <linearGradient id="spiritGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6ee7b7"/>
      <stop offset="50%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <filter id="forestBloom">
      <feGaussianBlur stdDeviation="10" result="bloom"/>
      <feMerge>
        <feMergeNode in="bloom"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="800" height="600" fill="url(#forestSky)"/>

  <!-- Distant Atmospheric Canopy -->
  <circle cx="200" cy="180" r="140" fill="#042c22" opacity="0.8"/>
  <circle cx="600" cy="160" r="160" fill="#03261d" opacity="0.85"/>
  <circle cx="400" cy="120" r="130" fill="#063e31" opacity="0.6"/>

  <!-- Ancient Sacred Tree (Central-Right Focal Mass) -->
  <!-- Massive Trunk -->
  <path d="M 420 200 C 410 320 380 460 330 580 L 590 580 C 530 460 510 320 490 200 Z" fill="#141a17"/>
  <!-- Roots Sprawling Out -->
  <path d="M 360 480 Q 260 540 180 580" stroke="#141a17" stroke-width="26" fill="none"/>
  <path d="M 480 490 Q 580 530 680 580" stroke="#141a17" stroke-width="32" fill="none"/>
  <path d="M 420 510 Q 430 560 440 600" stroke="#141a17" stroke-width="20" fill="none"/>

  <!-- Tree Foliage Canopy Clusters -->
  <ellipse cx="450" cy="180" rx="180" ry="90" fill="#0c4a3b"/>
  <ellipse cx="360" cy="140" rx="140" ry="70" fill="#105e4c"/>
  <ellipse cx="540" cy="150" rx="130" ry="65" fill="#083d31"/>

  <!-- Glowing Bioluminescent Spirit Core (The Heart of the Grove) -->
  <g filter="url(#forestBloom)">
    <circle cx="440" cy="380" r="35" fill="url(#spiritGlowGrad)" opacity="0.95"/>
    <circle cx="440" cy="380" r="70" fill="#6ee7b7" opacity="0.25"/>
    <circle cx="440" cy="380" r="120" fill="#34d399" opacity="0.1"/>
  </g>

  <!-- God Rays Streaming from Top Left Canopy to the Core -->
  <polygon points="120,0 220,0 520,440 380,440" fill="#a7f3d0" opacity="0.12"/>
  <polygon points="260,0 340,0 500,410 430,410" fill="#6ee7b7" opacity="0.15"/>

  <!-- Fore-Ground Framing Trees & Vines (Depth layers) -->
  <path d="M 0 0 L 80 0 L 120 600 L 0 600 Z" fill="#080e0c"/>
  <path d="M 720 0 L 800 0 L 800 600 L 680 600 Z" fill="#080e0c"/>
  <!-- Hanging Vines -->
  <path d="M 60 40 Q 90 200 70 320" stroke="#0e1f18" stroke-width="6" fill="none"/>
  <path d="M 740 60 Q 710 240 730 380" stroke="#0e1f18" stroke-width="8" fill="none"/>

  <!-- Floating Spirit Orbs / Fireflies -->
  <g filter="url(#forestBloom)">
    <circle cx="320" cy="350" r="6" fill="#a7f3d0"/>
    <circle cx="280" cy="420" r="4" fill="#6ee7b7"/>
    <circle cx="560" cy="360" r="7" fill="#6ee7b7"/>
    <circle cx="520" cy="460" r="5" fill="#34d399"/>
    <circle cx="400" cy="470" r="4" fill="#a7f3d0"/>
  </g>

  <!-- Ancient Moss Ground Floor -->
  <rect x="0" y="550" width="800" height="50" fill="#061c15"/>
</svg>
`)}`;

export const SAMPLE_ARTWORKS: SampleArtwork[] = [
  {
    id: 'cyberpunk-alley',
    title: 'Neon Alleyway: Rain & Shadows',
    artistStyle: 'Concept Art',
    targetContext: 'Game / Film Studio Portfolio',
    intendedMood: 'Atmospheric, gritty cyberpunk noir with a sense of quiet isolation and tension',
    artistQuestions: 'Is the silhouette of the detective readable against the wet asphalt? Does the perspective properly draw the eye into the deep background?',
    thumbnail: CYBERPUNK_ALLEY_SVG,
    imageData: CYBERPUNK_ALLEY_SVG,
    critiquePreset: {
      id: 'sample_critique_1',
      timestamp: Date.now() - 3600000 * 2,
      artworkTitle: 'Neon Alleyway: Rain & Shadows',
      artistStyle: 'Concept Art',
      targetContext: 'Game / Film Studio Portfolio',
      intendedMood: 'Atmospheric, gritty cyberpunk noir with a sense of quiet isolation and tension',
      overallScore: 8.4,
      galleryReadiness: 'Strong Portfolio Piece (Minor Polish Needed)',
      executiveSummary: 'A striking environmental concept piece boasting superb color temperature contrast between saturated magenta neon and cold cyan ambient bounce. The atmospheric mood is unmistakable and cinematic.',
      composition: {
        score: 8.5,
        headline: 'Strong One-Point Convergence with Solid Character Staging',
        detailedAnalysis: 'The building silhouettes establish clear diagonal leading lines that guide the viewer through the alleyway towards the vanishing point. The solitary character is well-placed along the lower-left third intersection, balancing the heavy illuminated signs on the right.',
        strengths: [
          'Excellent use of diagonal leading lines from rooftop cornices',
          'Good visual balance offsetting the dense right-side signage with the foreground character silhouette',
          'Rule of thirds placement anchors the human element securely',
        ],
        refinements: [
          'The center background could benefit from a subtle micro-focal point (e.g. distant flying vehicle silhouette or traffic light) to reward the eye at the convergence point',
          'Slightly heavy negative space in the top left sky that could be broken up with utility cables',
        ],
        actionableFix: 'Add 2-3 thin drooping power lines cutting across the upper third from the left skyscraper to the right to strengthen depth layering.',
        techniqueTip: 'Use a single-pixel hard round brush with 40% flow and a stabilizer to draft swooping industrial cables that echo the perspective grid.',
      },
      lightingAndColor: {
        score: 8.8,
        headline: 'Vibrant Complementary Neon Palette with Rich Wet Ground Reflections',
        detailedAnalysis: 'The interplay between warm magenta (#FF007F) and cyber cyan (#00F0FF) creates an immediate commercial concept art appeal. The ground specular highlights correctly mirror the overhead signage with proper vertical stretching for wet asphalt.',
        strengths: [
          'Masterful color temperature segregation between warm signs and cold rain shadows',
          'Realistic vertical elongation of light reflections on rain-slicked pavement',
          'Subtle rim lighting along the character’s coat edge gives crisp form separation',
        ],
        refinements: [
          'The amber streetlamp light beam lacks ambient dust particles and volumetric falloff',
          'Mid-tone values on the central alley building are slightly flattened without enough bounce light',
        ],
        actionableFix: 'Set a soft airbrush to "Color Dodge" or "Linear Dodge (Add)" at 15% opacity and paint a subtle volumetric cone beneath the amber streetlamp.',
        techniqueTip: 'Sample the ambient cyan bounce and brush gentle rim highlights on the left rooftop silhouettes to increase three-dimensional form separation.',
      },
      anatomyAndPerspective: {
        score: 8.2,
        headline: 'Cohesive Linear Perspective Grid with Convincing Architectural Scale',
        detailedAnalysis: 'The vanishing lines from both sides converge cleanly to a consistent horizon line placed around 35% from the canvas base. Window heights scale down harmoniously with distance, establishing a plausible urban scale.',
        strengths: [
          'Accurate convergence angles on both left and right building facades',
          'Natural human silhouette proportions with authentic posture weight',
          'Window spacing accurately reflects foreshortening compression in deep perspective',
        ],
        refinements: [
          'The right holographic sign is slightly misaligned with the wall’s vanishing angle, appearing somewhat planar',
        ],
        actionableFix: 'Skew the right "SYNTHESIS" sign by 8 degrees along the vertical axis so it snaps flush to the building plane.',
        techniqueTip: 'Use Photoshop or Procreate’s Isometric/Perspective Guide overlay tool to lock sign angles directly to the facade vector.',
      },
      moodAndStorytelling: {
        score: 8.6,
        headline: 'Evocative Blade Runner-esque Solitude and Cinematic Narrative',
        detailedAnalysis: 'The viewer immediately feels the humid, neon-drenched isolation of the urban wanderer. The glowing Japanese kanji and rain reflections heighten the cyberpunk mood, making this an ideal concept pitch for game studios.',
        strengths: [
          'Strong cinematic atmosphere that feels instantly production-ready for an AAA environment brief',
          'Clear storytelling: an investigator waiting or stalking in the shadows of high-tech low-life city',
        ],
        refinements: [
          'Adding a subtle narrative prop (like a glowing cigarette tip, an umbrella, or an open holo-pad) would give the character even more immediate purpose',
        ],
        actionableFix: 'Add a tiny bright orange/red ember dot at the mouth level with a tiny wisp of rising smoke.',
        techniqueTip: 'Keep small narrative details high in contrast but low in footprint so they reward close-up inspection without distracting from the environmental scale.',
      },
      hotspots: [
        {
          id: 'hs1',
          x: 35,
          y: 65,
          pillar: 'composition',
          title: 'Character Staging & Silhouette',
          issue: 'Great placement on left third; coat rim light could be slightly crisper against dark pavement',
          recommendation: 'Increase rim light opacity on the coat hem to pop the silhouette out from the dark pavement puddle.',
          severity: 'strength',
        },
        {
          id: 'hs2',
          x: 72,
          y: 35,
          pillar: 'anatomy',
          title: 'Holo-Sign Perspective Skew',
          issue: 'Sign angle is slightly flatter than the 2-point perspective wall slope',
          recommendation: 'Rotate/skew the sign plane by ~8 degrees to match the vanishing line of the building facade.',
          severity: 'improvement',
        },
        {
          id: 'hs3',
          x: 38,
          y: 52,
          pillar: 'lighting',
          title: 'Streetlamp Volumetric Beam',
          issue: 'Light beam edge is too sharp and lacks atmospheric mist scattering',
          recommendation: 'Softly blur the edges of the light cone and add subtle dust motes or rain streaks caught in the beam.',
          severity: 'improvement',
        },
        {
          id: 'hs4',
          x: 48,
          y: 58,
          pillar: 'lighting',
          title: 'Wet Asphalt Specular Reflection',
          issue: 'Reflections have accurate vertical stretching and glowing neon bloom',
          recommendation: 'Excellent technique on ground puddle diffusion. Keep this as a master reference for future cityscapes.',
          severity: 'strength',
        },
      ],
      colorPalette: [
        { hex: '#090514', name: 'Obsidian Night', role: 'Shadow', harmonyNotes: 'Deep foundational background anchor' },
        { hex: '#FF007F', name: 'Hot Neon Magenta', role: 'Dominant', harmonyNotes: 'High saturation focal accent for signs and reflections' },
        { hex: '#00F0FF', name: 'Electric Cyan', role: 'Secondary', harmonyNotes: 'Complementary counterpart to magenta' },
        { hex: '#FFE066', name: 'Amber Streetlamp', role: 'Accent', harmonyNotes: 'Warm triad highlight that breaks the cool spectrum' },
        { hex: '#181329', name: 'Midnight Violet', role: 'Dominant', harmonyNotes: 'Atmospheric mid-tone binding foreground to sky' },
      ],
      quickWins: [
        'Add 2-3 drooping industrial power cables across the upper third for enhanced depth layering',
        'Skew the right holographic billboard to lock into the wall perspective plane',
        'Brush a faint atmospheric rain haze over the distant buildings to enhance aerial perspective',
        'Add a tiny glowing red cigarette or holo-communicator in the detective’s hand',
      ],
      portfolioRecommendations: [
        'Position this as a primary Environment Concept showcase in your game development portfolio',
        'Include a grayscale value study thumbnail and the perspective grid in your breakdown sheet to prove technical methodology to Art Directors',
        'Pair with an interior shot of the noodle bar to demonstrate consistent world-building capability',
      ],
      clientImpression: 'Art Directors at AAA studios will immediately recognize your strong grasp of cinematic color scripting, wet surface rendering, and moody environmental storytelling.',
    },
  },
  {
    id: 'valkyrie-portrait',
    title: 'Valkyrie of the Golden Sun',
    artistStyle: 'Character Design',
    targetContext: 'Art Gallery Exhibition',
    intendedMood: 'Noble, ethereal, and powerful warrior goddess bathed in radiant golden dawn and celestial cold rim light',
    artistQuestions: 'Are the facial planes and eye alignment structurally correct? Does the gold armor look metallic or flat?',
    thumbnail: PORTRAIT_VALKYRIE_SVG,
    imageData: PORTRAIT_VALKYRIE_SVG,
    critiquePreset: {
      id: 'sample_critique_2',
      timestamp: Date.now() - 3600000 * 5,
      artworkTitle: 'Valkyrie of the Golden Sun',
      artistStyle: 'Character Design',
      targetContext: 'Art Gallery Exhibition',
      intendedMood: 'Noble, ethereal, and powerful warrior goddess bathed in radiant golden dawn and celestial cold rim light',
      overallScore: 8.9,
      galleryReadiness: 'Ready for Top Galleries & AAA Studios',
      executiveSummary: 'An exquisite, high-impact digital portrait displaying exceptional facial plane structure, lustrous metallic rendering on the golden pauldron, and sublime dual-light temperature staging.',
      composition: {
        score: 9.0,
        headline: 'Classic Triangular Hero Bust with Hypnotic Focal Hierarchy',
        detailedAnalysis: 'The triangular composition created by the shoulders tapering up to the winged crown stabilizes the figure with commanding authority. The glowing cyan jewel at the forehead and the piercing cyan eyes create an irresistible primary focal point that immediately arrests the viewer.',
        strengths: [
          'Impeccable triangular silhouette conveying majesty and classical statue stability',
          'Focal points are clearly tiered: Eyes/Tiara (Primary) > Golden Armor (Secondary) > Flowing Hair (Tertiary)',
          'Circular backlight aura creates a subtle halo effect reinforcing the deity motif',
        ],
        refinements: [
          'The lower edge of the breastplate terminates a bit abruptly; extending the chest plate engravings slightly would smooth the crop transition',
        ],
        actionableFix: 'Fade the lowest 10% of the armor into a soft dark vignette to ensure the eye never drifts down out of the frame.',
        techniqueTip: 'Use a large soft round airbrush set to multiply with the canvas background color to gently feather bottom cropping.',
      },
      lightingAndColor: {
        score: 9.2,
        headline: 'Masterful Warm Key vs Cold Rim Dual-Lighting Harmony',
        detailedAnalysis: 'The warm golden key light illuminating the left cheek and armor contrasts magnificently with the frosty celestial blue rim light skimming the right jawline and hair. The specular highlights on the gold crown have sharp, high-contrast thresholds that realistically convey polished metal.',
        strengths: [
          'High-contrast value steps on the golden tiara accurately replicate polished metal specular reflections',
          'Soft sub-surface scattering warmth in the skin transition zones prevents plastic doll look',
          'Sharp cyan rim light carves the character out from the deep twilight background',
        ],
        refinements: [
          'The cast shadow from the nose onto the philtrum is slightly soft; a firmer core shadow boundary would strengthen facial depth',
        ],
        actionableFix: 'Use a hard round brush with 80% opacity to define a crisp terminator line along the nose bridge shadow.',
        techniqueTip: 'Remember the rule of form: hard plane changes (like the nose bridge or armor bevels) require hard-edged shadows, while smooth curvatures (cheeks) get soft transitions.',
      },
      anatomyAndPerspective: {
        score: 8.7,
        headline: 'Solid Asaro Head Plane Articulation with Expressive Gaze',
        detailedAnalysis: 'The spacing of the eyes (one eye-width apart) and the alignment of the tear ducts to the nostrils conform beautifully to classical Loomis proportions. The sternocleidomastoid neck muscles attach correctly to the clavicle base.',
        strengths: [
          'Accurate cranial proportions and forehead-to-brow ridge ratio',
          'Believable bone landmarks at the cheekbones and zygomatic arch',
          'Winged crown feathers curve symmetrically along the temporal bone contour',
        ],
        refinements: [
          'The right eye (viewer’s right) has a slightly narrower sclera opening relative to the 3/4 turn angle',
        ],
        actionableFix: 'Widen the outer corner of the right eyelid by 2-3 pixels to match the gaze angle.',
        techniqueTip: 'Flip the canvas horizontally (Canvas Mirror) frequently during rendering to catch subtle eye asymmetry or drift early.',
      },
      moodAndStorytelling: {
        score: 8.8,
        headline: 'Radiant Divinity and Mythological Grandeur',
        detailedAnalysis: 'The golden war paint under the eyes, the luminous circlet, and the floating golden embers coalesce into an unmistakable mythological narrative. The serene, unyielding expression elevates the portrait from a simple character render into an iconic gallery piece.',
        strengths: [
          'Captivating emotional resonance: blends fierce warrior resolve with celestial grace',
          'Floating ember particles suggest proximity to a divine flame or aftermath of victory',
        ],
        refinements: [
          'Adding faint Norse runic engravings faintly glowing along the gorget collar would deepen the lore',
        ],
        actionableFix: 'Inscribe 3 subtle runic glyphs on the chest plate center ridge with a faint 20% cyan glow.',
        techniqueTip: 'Use glyphs with varied line thickness to look historically carved rather than digitally stamped.',
      },
      hotspots: [
        {
          id: 'hs1',
          x: 48,
          y: 38,
          pillar: 'lighting',
          title: 'Facial Plane Shading & Eyes',
          issue: 'Exceptional iris luminosity and sub-surface scattering along cheek transition',
          recommendation: 'Sharpen the nose shadow terminator slightly to push depth even further.',
          severity: 'strength',
        },
        {
          id: 'hs2',
          x: 50,
          y: 31,
          pillar: 'composition',
          title: 'Winged Crown Focal Anchor',
          issue: 'Golden crown and glowing cyan gemstone lock the primary focal point with high prestige',
          recommendation: 'Perfect execution of crown symmetry and metallic lustre.',
          severity: 'strength',
        },
        {
          id: 'hs3',
          x: 53,
          y: 75,
          pillar: 'composition',
          title: 'Lower Armor Cropping',
          issue: 'Armor plate ends abruptly near bottom canvas border',
          recommendation: 'Feather the lower border into a soft dark gradient to keep viewer attention centered upward.',
          severity: 'improvement',
        },
      ],
      colorPalette: [
        { hex: '#FFE28A', name: 'Imperial Gold', role: 'Highlight', harmonyNotes: 'High-key metallic specular on crown and pauldron' },
        { hex: '#FEDFD0', name: 'Porcelain Peach', role: 'Secondary', harmonyNotes: 'Luminous skin tone with warm undertones' },
        { hex: '#38BDF8', name: 'Celestial Sky Cyan', role: 'Accent', harmonyNotes: 'Vibrant cool complement for eyes and magical rim' },
        { hex: '#D49B38', name: 'Ochre Bronze', role: 'Dominant', harmonyNotes: 'Mid-tone body for golden armor reflections' },
        { hex: '#120C11', name: 'Deep Amethyst Shadow', role: 'Shadow', harmonyNotes: 'Rich, non-black backdrop providing maximum contrast' },
      ],
      quickWins: [
        'Flip canvas horizontally to verify eye symmetry and tweak the right eyelid outer curve',
        'Add a soft vignette at the bottom edge to cleanly frame the torso',
        'Sharpen the core cast shadow under the nose and lower lip',
        'Add 2-3 extra floating golden embers near the crown tips for magical depth',
      ],
      portfolioRecommendations: [
        'Place this as the flagship hero image on your portfolio website landing page',
        'Include high-resolution close-up crops of the eye and the golden circlet to prove rendering finesse',
        'Highlight this piece when applying for Senior Character Artist or Cover Illustrator roles',
      ],
      clientImpression: 'Gallery curators and lead Art Directors will be impressed by the polished rendering discipline, restrained color palette, and dignified emotional execution.',
    },
  },
  {
    id: 'fantasy-grove',
    title: 'Heart of the Ancient Grove',
    artistStyle: 'Environment / Matte Painting',
    targetContext: 'Game / Film Studio Portfolio',
    intendedMood: 'Mystical, ancient, tranquil fantasy landscape with divine nature magic awakening',
    artistQuestions: 'Do the god rays feel naturally integrated? Is the tree root structure believable in scale?',
    thumbnail: FANTASY_GROVE_SVG,
    imageData: FANTASY_GROVE_SVG,
    critiquePreset: {
      id: 'sample_critique_3',
      timestamp: Date.now() - 3600000 * 8,
      artworkTitle: 'Heart of the Ancient Grove',
      artistStyle: 'Environment / Matte Painting',
      targetContext: 'Game / Film Studio Portfolio',
      intendedMood: 'Mystical, ancient, tranquil fantasy landscape with divine nature magic awakening',
      overallScore: 8.5,
      galleryReadiness: 'Strong Portfolio Piece (Minor Polish Needed)',
      executiveSummary: 'An enchanting, deeply atmospheric fantasy landscape. The emerald color script and the glowing spirit core create an irresistible sense of wonder, framed effectively by dark foreground foliage.',
      composition: {
        score: 8.6,
        headline: 'Effective Natural Framing (Repoussoir) with Central Mythic Core',
        detailedAnalysis: 'Using dark foreground trees on both the left and right borders creates an effective natural frame (repoussoir) that pushes the glowing ancient tree deep into the midground plane. The roots spread out dynamically, leading the eye across the forest floor.',
        strengths: [
          'Excellent foreground depth staging using dark framing trunks and hanging vines',
          'Roots act as visual arrows pointing back towards the glowing spirit core',
          'Good horizontal balance across the lower forest floor',
        ],
        refinements: [
          'The glowing core is slightly centered; shifting the tree 5% to the right would enhance rule-of-thirds dynamism',
        ],
        actionableFix: 'Slightly asymmetry the canopy volume to give the tree a more organic, windswept personality.',
        techniqueTip: 'Avoid perfectly symmetrical root branching; introduce one massive dominant taproot to break up visual repetition.',
      },
      lightingAndColor: {
        score: 8.7,
        headline: 'Ethereal Bioluminescence with Atmospheric God Rays',
        detailedAnalysis: 'The bioluminescent mint and emerald glow radiates outward with believable light falloff onto the ancient bark. The atmospheric volumetric rays from the canopy add high cinematic value.',
        strengths: [
          'Smooth luminous bloom around the central spirit core',
          'God rays have good angle consistency indicating a clear overhead sun direction',
          'Rich variety of foliage greens from deep forest moss to vibrant neon mint',
        ],
        refinements: [
          'The foreground framing trees are almost pure black; adding subtle dark teal ambient bounce light would reveal bark texture',
        ],
        actionableFix: 'Paint soft teal bounce light along the inner edge of the left foreground trunk.',
        techniqueTip: 'Sample the bright spirit green, set brush to "Overlay" at 10% opacity, and glaze over the root crests facing the light.',
      },
      anatomyAndPerspective: {
        score: 8.2,
        headline: 'Convincing Organic Scale and Aerial Atmosphere',
        detailedAnalysis: 'The massive trunk thickness relative to the distant canopy circles establishes a colossal tree scale. Aerial perspective is handled well with distant trees losing contrast and blending into teal haze.',
        strengths: [
          'Clear 3-layer depth segregation: Foreground (Dark Frame) > Midground (Ancient Tree) > Background (Atmospheric Canopy)',
          'Root anatomy convincingly anchors the heavy trunk weight into the earth',
        ],
        refinements: [
          'Adding a small human or wildlife silhouette (e.g. deer or wandering druid) would instantly give the viewer a definitive scale reference',
        ],
        actionableFix: 'Place a small 15px tall stag silhouette standing on the moss ground near the root base.',
        techniqueTip: 'A known scale reference (bird, figure, deer) multiplies the perceived grandeur of monumental landscape paintings.',
      },
      moodAndStorytelling: {
        score: 8.6,
        headline: 'Deep Mythological Reverence and Tranquil Fantasy Atmosphere',
        detailedAnalysis: 'The piece conveys a serene sanctuary untouched by civilization. Floating fireflies and the glowing core communicate an active magical ecosystem that fits right into high fantasy game worldbuilding.',
        strengths: [
          'Instant emotional calm and sense of discovery',
          'Rich environmental storytelling that invites the viewer to explore deeper into the forest',
        ],
        refinements: [
          'Adding faint ancient carved runes overgrown with glowing moss on the tree trunk would add intriguing historical lore',
        ],
        actionableFix: 'Paint 2-3 faintly glowing Celtic or elven knot patterns wrapping around the main trunk.',
        techniqueTip: 'Blend the rune edges into the bark crevasses so they feel ancient and carved rather than floating on top.',
      },
      hotspots: [
        {
          id: 'hs1',
          x: 55,
          y: 63,
          pillar: 'lighting',
          title: 'Bioluminescent Spirit Core',
          issue: 'Vibrant focal glow with soft atmospheric falloff illuminating surrounding bark',
          recommendation: 'Add tiny glowing spores drifting upward from the sphere to enhance active magic.',
          severity: 'strength',
        },
        {
          id: 'hs2',
          x: 42,
          y: 35,
          pillar: 'lighting',
          title: 'Volumetric God Rays',
          issue: 'Good angle, but opacity is slightly uniform from top to bottom',
          recommendation: 'Fade the rays slightly toward the bottom so they do not overpower the tree bark texture.',
          severity: 'improvement',
        },
        {
          id: 'hs3',
          x: 10,
          y: 40,
          pillar: 'composition',
          title: 'Foreground Frame Trees',
          issue: 'Very dark silhouette creating good depth, but lacks ambient bounce light',
          recommendation: 'Add a subtle 5% teal ambient light on the inner edge to suggest forest mist bouncing light.',
          severity: 'improvement',
        },
      ],
      colorPalette: [
        { hex: '#6EE7B7', name: 'Bioluminescent Mint', role: 'Highlight', harmonyNotes: 'Magical core and particle glow' },
        { hex: '#053B2F', name: 'Deep Evergreen', role: 'Dominant', harmonyNotes: 'Atmospheric forest midtone' },
        { hex: '#34D399', name: 'Spring Emerald', role: 'Accent', harmonyNotes: 'Volumetric ray scattering and moss' },
        { hex: '#022019', name: 'Abyssal Pine', role: 'Shadow', harmonyNotes: 'Distant canopy foundation' },
        { hex: '#080E0C', name: 'Shadow Bark', role: 'Shadow', harmonyNotes: 'Foreground repoussoir frame' },
      ],
      quickWins: [
        'Add a tiny stag or wandering druid silhouette on the moss floor for dramatic scale comparison',
        'Add subtle teal bounce light on the left foreground tree trunk',
        'Introduce faint carved elven runes on the trunk bark near the spirit core',
        'Scatter a dozen extra tiny glowing micro-spores around the roots',
      ],
      portfolioRecommendations: [
        'Feature this in your Environment Art / Visual Development portfolio for animation and fantasy RPGs',
        'Include a layer breakdown demonstrating your lighting pass, ambient occlusion pass, and atmospheric fog layer',
        'Showcase alongside architectural concept pieces to prove environmental versatility',
      ],
      clientImpression: 'Studios looking for visual development artists or matte painters will admire the lush color mood, confident lighting hierarchy, and clean depth plane separation.',
    },
  },
];
