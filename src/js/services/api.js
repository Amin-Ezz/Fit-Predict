/**
 * FitPredict API Client
 * Configurable base HTTP client for Django REST Framework integration
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const REQUEST_TIMEOUT_MS = 12000;

export class ApiError extends Error {
  constructor(message, status = null, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Universal request wrapper with timeout and standardized error handling
 * @param {string} endpoint 
 * @param {RequestInit} [options={}] 
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    let responseData = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorMessage = (responseData && typeof responseData === 'object' && (responseData.detail || responseData.message || responseData.error))
        ? (responseData.detail || responseData.message || responseData.error)
        : `خطای سرور (${response.status})`;
      throw new ApiError(errorMessage, response.status, responseData);
    }

    return responseData;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('مهلت ارتباط با سرور به پایان رسید (Timeout). لطفاً اتصال اینترنت خود را بررسی کنید.', 408);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('عدم امکان برقراری ارتباط با سرویس‌دهنده جنگو. سرور ممکن است در دسترس نباشد.', 0, error);
  }
}

export { API_BASE_URL };
