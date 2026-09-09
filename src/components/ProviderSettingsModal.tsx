import React, { useState, useEffect } from 'react';
import { Settings, X, Save, Key, Globe, Cpu, Play } from 'lucide-react';

interface ProviderSettings {
  apiKey: string;
  baseUrl: string;
  modelName: string;
}

interface ProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'artcritique_provider_settings_v1';

export const ProviderSettingsModal: React.FC<ProviderSettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<ProviderSettings>({
    apiKey: '',
    baseUrl: '',
    modelName: 'gemini-1.5-flash',
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isTestingRunpod, setIsTestingRunpod] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsSaved(false);
      setTestResult(null);
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setSettings(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error('Failed to load provider settings', e);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setIsSaved(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (e) {
      console.error('Failed to save provider settings', e);
    }
  };

  const handleTestRunpod = async () => {
    setIsTestingRunpod(true);
    setTestResult(null);
    try {
      const response = await fetch('/api/runpod-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: settings.baseUrl || undefined,
          apiKey: settings.apiKey || undefined,
          prompt: "Say: Hallo World!"
        })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect');
      }
      
      setTestResult({
        success: true,
        message: 'Success: ' + JSON.stringify(data).slice(0, 100) + '...'
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message
      });
    } finally {
      setIsTestingRunpod(false);
    }
  };

  if (!isOpen) return null;

  const isRunpodUrl = settings.baseUrl.includes('runpod.ai');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/50">
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" /> Custom Provider Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-stone-400 leading-relaxed">
            Configure custom API endpoints (e.g. Ollama, RunPod, self-hosted models) or provide your own API key. Leave blank to use the server's default configuration.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" /> Base URL
              </label>
              <input
                type="text"
                placeholder="e.g. https://api.openai.com/v1"
                value={settings.baseUrl}
                onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" /> API Key
              </label>
              <input
                type="password"
                placeholder="sk-..."
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Model Name
              </label>
              <input
                type="text"
                placeholder="e.g. gemini-1.5-flash, gpt-4o"
                value={settings.modelName}
                onChange={(e) => setSettings({ ...settings, modelName: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {isRunpodUrl && (
              <div className="pt-2">
                <button
                  onClick={handleTestRunpod}
                  disabled={isTestingRunpod}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  <Play className="w-4 h-4 text-emerald-400" />
                  {isTestingRunpod ? 'Testing Connection...' : 'Test RunPod Endpoint'}
                </button>
                {testResult && (
                  <div className={`mt-2 p-2 rounded-lg text-xs break-all ${testResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {testResult.message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-stone-800 bg-stone-900/50 flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              isSaved
                ? 'bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
            }`}
          >
            {isSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Quick helper inside file since CheckCircle is not imported
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
