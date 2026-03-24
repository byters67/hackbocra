/**
 * Fetch with exponential backoff retry.
 * Only retries on 5xx errors and network failures.
 * 4xx errors return immediately (client error, retrying won't help).
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Don't retry client errors (4xx)
      if (response.ok || response.status < 500) {
        return response;
      }

      // Server error — retry if attempts remain
      if (attempt === maxRetries) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (err) {
      if (attempt === maxRetries) throw err;
      lastError = err instanceof Error ? err : new Error(String(err));
    }

    // Exponential backoff: 1s, 2s, 4s (capped at 10s)
    const delay = Math.min(1000 * 2 ** attempt, 10000);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw lastError || new Error('fetchWithRetry: all retries exhausted');
}
