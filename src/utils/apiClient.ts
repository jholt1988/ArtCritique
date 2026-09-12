export const getProviderHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const saved = localStorage.getItem('artcritique_provider_settings_v1');
    if (saved) {
      const settings = JSON.parse(saved);
      if (settings.apiKey) headers['x-custom-api-key'] = settings.apiKey;
      if (settings.baseUrl) headers['x-custom-base-url'] = settings.baseUrl;
      if (settings.modelName) headers['x-custom-model-name'] = settings.modelName;
    }
  } catch (e) {
    console.error('Failed to parse provider settings from localStorage', e);
  }

  return headers;
};

export const DEFAULT_TIMEOUT_MS = 120_000;

export const fetchApi = async (
  url: string,
  options: RequestInit & { timeoutMs?: number } = {},
) => {
  const { timeoutMs, ...rest } = options;
  const headers = {
    'Content-Type': 'application/json',
    ...getProviderHeaders(),
    ...(rest.headers as Record<string, string> | undefined),
  };

  const timeout = timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, {
      ...rest,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error(`Request to ${url} timed out after ${timeout} ms — the AI backend may be slow or unreachable.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};
