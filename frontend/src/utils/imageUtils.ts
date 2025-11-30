/**
 * Utility functions for handling technician images
 */

/**
 * Get technician image path with fallback
 * @param index - Image index (1-8) or technician ID
 * @returns Image path
 */
export const getTechnicianImage = (index: number | string): string => {
  let imageIndex: number;
  
  if (typeof index === 'string') {
    // Use technician ID to get consistent image
    imageIndex = (index.charCodeAt(0) || 1) % 8 + 1;
  } else {
    imageIndex = index;
  }
  
  // Ensure index is between 1 and 8
  imageIndex = ((imageIndex - 1) % 8) + 1;
  
  return `/images/technicians/technician_${imageIndex}.jpg`;
};

/**
 * Check if image exists (for future use with API)
 */
export const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Get placeholder image data URL (simple colored placeholder)
 */
export const getPlaceholderImage = (text: string, color: string = '#032B5A'): string => {
  // Return a data URL for a simple placeholder
  // In a real app, you might want to use a service like placeholder.com
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>
  `)}`;
};






