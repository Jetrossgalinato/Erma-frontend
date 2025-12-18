const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ermav2-backend.onrender.com";

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

export const fetchWithRetry = async (
  url: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;

  try {
    const response = await fetch(url, fetchOptions);

    if (response.status === 500 && retries > 0) {
      console.warn(
        `Request failed with 500. Retrying in ${retryDelay}ms... (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return fetchWithRetry(url, {
        ...options,
        retries: retries - 1,
        retryDelay: retryDelay * 2,
      });
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(
        `Request failed. Retrying in ${retryDelay}ms... (${retries} retries left)`,
        error
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return fetchWithRetry(url, {
        ...options,
        retries: retries - 1,
        retryDelay: retryDelay * 2,
      });
    }
    throw error;
  }
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export { API_BASE_URL };
