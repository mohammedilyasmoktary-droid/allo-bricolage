/**
 * Normalizes image URLs to use the correct backend URL
 * Replaces localhost URLs with the production backend URL
 */
export const normalizeImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  
  // If URL already uses https, return as is
  if (url.startsWith('https://')) {
    return url;
  }
  
  // Replace localhost URLs with production backend URL
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const backendBaseUrl = apiBaseUrl.replace('/api', '');
  
  // Replace localhost:5001 with backend URL
  if (url.includes('localhost:5001') || url.includes('localhost:5000')) {
    return url.replace(/http:\/\/localhost:\d+/, backendBaseUrl);
  }
  
  // If URL is relative, make it absolute
  if (url.startsWith('/uploads/')) {
    return `${backendBaseUrl}${url}`;
  }
  
  return url;
};

