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

export const fetchApi = async (url: string, options: RequestInit = {}) => {
  const headers = {
    ...getProviderHeaders(),
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
