/**
 * Coordinates for Moroccan cities
 * Used for Google Maps integration
 */
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Casablanca': { lat: 33.5731, lng: -7.5898 },
  'Rabat': { lat: 34.0209, lng: -6.8416 },
  'Marrakech': { lat: 31.6295, lng: -7.9811 },
  'Agadir': { lat: 30.4278, lng: -9.5981 },
  'Tanger': { lat: 35.7595, lng: -5.8340 },
  'Fès': { lat: 34.0331, lng: -5.0003 },
  'Meknès': { lat: 33.8950, lng: -5.5547 },
  'Oujda': { lat: 34.6867, lng: -1.9114 },
  'Kenitra': { lat: 34.2611, lng: -6.5802 },
  'Tetouan': { lat: 35.5769, lng: -5.3684 },
  'Mohammedia': { lat: 33.6833, lng: -7.3833 },
  'El Jadida': { lat: 33.2316, lng: -8.5004 },
  'Safi': { lat: 32.2994, lng: -9.2372 },
  'Salé': { lat: 34.0331, lng: -6.7983 },
  'Temara': { lat: 33.9274, lng: -6.9160 },
  'Beni Mellal': { lat: 32.3394, lng: -6.3608 },
  'Khouribga': { lat: 32.8810, lng: -6.9063 },
  'Nador': { lat: 35.1688, lng: -2.9333 },
  'Berkane': { lat: 34.9208, lng: -2.3194 },
  'Saïdia': { lat: 35.0922, lng: -2.2306 },
  'Dakhla': { lat: 23.7081, lng: -15.9575 },
  'Laayoune': { lat: 27.1536, lng: -13.2033 },
  'Errachidia': { lat: 31.9319, lng: -4.4244 },
  'Ouarzazate': { lat: 30.9333, lng: -6.9167 },
  'Taza': { lat: 34.2144, lng: -4.0086 },
  'Chefchaouen': { lat: 35.1714, lng: -5.2697 },
  'Al Hoceima': { lat: 35.2517, lng: -3.9372 },
  'Settat': { lat: 33.0011, lng: -7.6167 },
  'Berrechid': { lat: 33.2656, lng: -7.5875 },
  'Skhirat': { lat: 33.8500, lng: -7.0333 },
  'Ifrane': { lat: 33.5269, lng: -5.1100 },
  'Midelt': { lat: 32.6850, lng: -4.7450 },
  'Tinghir': { lat: 31.5167, lng: -5.5333 },
  'Khemisset': { lat: 33.8167, lng: -6.0667 },
  'Ksar El Kebir': { lat: 35.0000, lng: -5.9000 },
  'Larache': { lat: 35.1939, lng: -6.1556 },
  'Oued Zem': { lat: 32.8667, lng: -6.5667 },
  'Sidi Bennour': { lat: 32.6500, lng: -8.4333 },
};

/**
 * Get coordinates for a city, returns Casablanca as default if not found
 */
export const getCityCoordinates = (city: string): { lat: number; lng: number } => {
  return CITY_COORDINATES[city] || CITY_COORDINATES['Casablanca'];
};

/**
 * Get center coordinates for multiple cities
 */
export const getCenterCoordinates = (cities: string[]): { lat: number; lng: number } => {
  if (cities.length === 0) return CITY_COORDINATES['Casablanca'];
  
  const coords = cities
    .map(city => CITY_COORDINATES[city])
    .filter(coord => coord !== undefined);
  
  if (coords.length === 0) return CITY_COORDINATES['Casablanca'];
  
  const avgLat = coords.reduce((sum, coord) => sum + coord.lat, 0) / coords.length;
  const avgLng = coords.reduce((sum, coord) => sum + coord.lng, 0) / coords.length;
  
  return { lat: avgLat, lng: avgLng };
};





