export class ApiError extends Error {
  constructor(message, status = 0) { super(message); this.status = status; }
}
export function normalizeUrl(value, allowHttp = false) {
  const url = new URL(value.trim());
  if (url.protocol !== 'https:' && !(allowHttp && url.protocol === 'http:')) throw new Error('Use o endereço HTTPS do servidor.');
  if (url.username || url.password || url.search || url.hash || !['', '/'].includes(url.pathname)) throw new Error('Informe apenas o endereço do servidor, sem caminho ou credenciais.');
  return url.origin;
}
export function createApi(baseUrl, token, fetcher = fetch, timeoutMs = 15000) {
  return async (path, { method = 'GET', body } = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetcher(`${baseUrl}/api/${path}`, {
        method, signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'X-TechPaper-Client': 'mobile', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const data = response.status === 204 ? null : await response.json().catch(() => null);
      if (!response.ok) throw new ApiError(data?.message || Object.values(data?.errors || {}).flat().join(' ') || `Não foi possível concluir (${response.status}).`, response.status);
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Sem confirmação do servidor. Verifique a conexão e tente novamente.');
    } finally { clearTimeout(timer); }
  };
}
export function positiveInteger(text) {
  if (!/^\d+$/.test(String(text))) throw new Error('Informe uma quantidade inteira positiva.');
  const n = Number(text);
  if (!Number.isSafeInteger(n) || n < 1 || n > 1000000) throw new Error('Quantidade deve estar entre 1 e 1.000.000.');
  return n;
}
export function addItem(items, produtoId, quantidade) {
  positiveInteger(quantidade);
  const existing = items.find(i => i.produtoId === produtoId);
  if (!existing) return [...items, { produtoId, quantidade }];
  return items.map(i => i.produtoId === produtoId ? { ...i, quantidade: positiveInteger(i.quantidade + quantidade) } : i);
}
