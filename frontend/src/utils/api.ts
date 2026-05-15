const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export const getApiUrl = (path: string) => `${API_URL}${path}`;
export const getWsUrl = () => WS_URL;

// Helper to handle image paths (handles both relative and absolute URLs)
export const getImagePath = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};
