const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const importLocalforage = "import localforage from 'localforage';\nimport { ProviderSettingsModal }";
code = code.replace("import { ProviderSettingsModal }", importLocalforage);

const storageLogic = `
  const [collections, setCollections] = useState<PortfolioCollection[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioArtwork[]>([]);
  const [isStorageReady, setIsStorageReady] = useState(false);

  useEffect(() => {
    async function loadStorage() {
      try {
        const savedPortfolio = await localforage.getItem(STORAGE_KEY);
        if (savedPortfolio) {
          setPortfolio(savedPortfolio);
        } else {
          setPortfolio(SAMPLE_ARTWORKS.map((sample, idx) => ({
            id: 'seed_' + sample.id,
            title: sample.title,
            imageData: sample.imageData,
            critique: sample.critiquePreset,
            createdAt: Date.now() - (idx + 1) * 86400000,
            tags: [sample.artistStyle, 'Seed Study'],
            version: 1,
          })));
        }

        const savedCollections = await localforage.getItem(COLLECTIONS_KEY);
        if (savedCollections) {
          setCollections(savedCollections);
        }
      } catch (e) {
        console.error('Failed to load from storage', e);
      } finally {
        setIsStorageReady(true);
      }
    }
    loadStorage();
  }, []);

  useEffect(() => {
    if (!isStorageReady) return;
    localforage.setItem(STORAGE_KEY, portfolio).catch(e => console.error('Failed to write portfolio to storage', e));
  }, [portfolio, isStorageReady]);

  useEffect(() => {
    if (!isStorageReady) return;
    localforage.setItem(COLLECTIONS_KEY, collections).catch(e => console.error('Failed to write collections to storage', e));
  }, [collections, isStorageReady]);
`;

code = code.replace(
  /\/\/ Collections state[\s\S]*?}, \[collections\]\);/,
  storageLogic
);

// If storage isn't ready, let's return a loader right before return (
code = code.replace(
  /  return \(\n    <div className="min-h-screen/m,
  `  if (!isStorageReady) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen`
);

fs.writeFileSync('src/App.tsx', code);
