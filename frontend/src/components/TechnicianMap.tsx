import React from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Box, Typography, Paper, Avatar, Rating, Chip } from '@mui/material';
import { Technician } from '../api/technicians';
import { getCityCoordinates, getCenterCoordinates } from '../utils/cityCoordinates';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface TechnicianMapProps {
  technicians: Technician[];
  onTechnicianClick?: (technician: Technician) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: 33.5731, // Casablanca
  lng: -7.5898,
};

const TechnicianMap: React.FC<TechnicianMapProps> = ({ technicians, onTechnicianClick }) => {
  const [selectedTechnician, setSelectedTechnician] = React.useState<Technician | null>(null);
  
  // Google Maps API Key - with guaranteed fallback
  const FALLBACK_KEY = 'AIzaSyAjGf3qCd1j2PiQYZIP993o3sz7TtXyYrw';
  
  // Try to get from environment variables
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.GOOGLE_MAPS_API_KEY;
  
  // Use environment key if valid, otherwise use fallback (guaranteed to have a key)
  const googleMapsApiKey = (envKey && typeof envKey === 'string' && envKey.trim().length > 0) 
    ? envKey.trim() 
    : FALLBACK_KEY;
  
  // Immediate logging for debugging
  console.log('🗝️ Google Maps API Key Status:', {
    hasEnvKey: !!(envKey && envKey.trim()),
    envKeyPreview: envKey ? `${envKey.substring(0, 10)}...` : 'NONE',
    usingFallback: !(envKey && envKey.trim()),
    finalKeyPreview: googleMapsApiKey.substring(0, 10) + '...',
    finalKeyLength: googleMapsApiKey.length,
    willRenderMap: true, // Always true now since we have fallback
  });
  
  // Debug: Log API key status (always log in console for debugging)
  React.useEffect(() => {
    const envVars = Object.keys(import.meta.env).filter(k => k.includes('GOOGLE') || k.includes('MAPS'));
    console.log('🔍 Google Maps API Key Debug:', {
      exists: !!googleMapsApiKey,
      length: googleMapsApiKey?.length || 0,
      startsWith: googleMapsApiKey?.substring(0, 10) || 'N/A',
      preview: googleMapsApiKey ? `${googleMapsApiKey.substring(0, 10)}...` : 'MISSING',
      VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'EXISTS' : 'MISSING',
      GOOGLE_MAPS_API_KEY: import.meta.env.GOOGLE_MAPS_API_KEY ? 'EXISTS' : 'MISSING',
      allViteEnvVars: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')),
      googleRelatedVars: envVars,
      mode: import.meta.env.MODE,
      prod: import.meta.env.PROD,
      dev: import.meta.env.DEV,
    });
  }, [googleMapsApiKey]);

  // Get unique cities from technicians
  const cities = Array.from(new Set(technicians.map(t => t.user?.city).filter(Boolean) as string[]));
  const center = cities.length > 0 ? getCenterCoordinates(cities) : defaultCenter;

  // Group technicians by city and add slight offset for multiple technicians in same city
  const cityGroups = technicians
    .filter(t => t.user?.city)
    .reduce((acc, technician) => {
      const city = technician.user!.city!;
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(technician);
      return acc;
    }, {} as Record<string, Technician[]>);

  const technicianMarkers = Object.entries(cityGroups).flatMap(([city, techs]) => {
    const basePosition = getCityCoordinates(city);
    // Add slight offset for multiple technicians in the same city
    return techs.map((technician, index) => {
      const offset = techs.length > 1 ? {
        lat: basePosition.lat + (Math.random() - 0.5) * 0.01, // ~1km offset
        lng: basePosition.lng + (Math.random() - 0.5) * 0.01,
      } : basePosition;
      return {
        technician,
        position: offset,
        city,
      };
    });
  });

  // This check should never trigger now since we always have a fallback
  // But keeping it as a safety check
  if (!googleMapsApiKey || googleMapsApiKey.length === 0) {
    console.error('❌ CRITICAL: No API key available, even with fallback!');
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Google Maps API key not configured.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Please add <strong>VITE_GOOGLE_MAPS_API_KEY</strong> to your Vercel environment variables.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Check the browser console (F12) for detailed debug information.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Get your API key from: <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>
        </Typography>
      </Paper>
    );
  }

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={cities.length === 1 ? 12 : 7}
        options={{
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        }}
      >
        {technicianMarkers.map((marker, index) => {
          const initial = marker.technician.user?.name?.charAt(0).toUpperCase() || 'T';
          const svgIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#032B5A" stroke="#F4C542" stroke-width="2"/>
              <text x="20" y="26" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#F4C542" text-anchor="middle">${initial}</text>
            </svg>
          `)}`;
          
          return (
            <Marker
              key={marker.technician.id || index}
              position={marker.position}
              onClick={() => setSelectedTechnician(marker.technician)}
              icon={{
                url: svgIcon,
                scaledSize: new google.maps.Size(40, 40),
              }}
            />
          );
        })}

        {selectedTechnician && (
          <InfoWindow
            position={getCityCoordinates(selectedTechnician.user?.city || 'Casablanca')}
            onCloseClick={() => setSelectedTechnician(null)}
          >
            <Box sx={{ p: 1, minWidth: 200, maxWidth: 250 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Avatar
                  src={selectedTechnician.profilePictureUrl}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#F4C542',
                    color: '#032B5A',
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {selectedTechnician.user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                    {selectedTechnician.user?.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Rating value={selectedTechnician.averageRating} readOnly size="small" precision={0.5} />
                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                      {selectedTechnician.averageRating.toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <LocationOnIcon sx={{ fontSize: 16, color: '#032B5A' }} />
                <Typography variant="caption" color="text.secondary">
                  {selectedTechnician.user?.city}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {selectedTechnician.skills.slice(0, 2).map((skill, idx) => (
                  <Chip
                    key={idx}
                    label={skill}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      bgcolor: '#f5f5f5',
                      color: '#032B5A',
                    }}
                  />
                ))}
              </Box>

              <Typography variant="caption" sx={{ color: '#F4C542', fontWeight: 600, display: 'block', mb: 1 }}>
                {selectedTechnician.hourlyRate
                  ? `${selectedTechnician.hourlyRate} MAD/h`
                  : selectedTechnician.basePrice
                  ? `${selectedTechnician.basePrice} MAD`
                  : 'Sur devis'}
              </Typography>

              {onTechnicianClick && (
                <Box
                  component="button"
                  onClick={() => {
                    onTechnicianClick(selectedTechnician);
                    setSelectedTechnician(null);
                  }}
                  sx={{
                    width: '100%',
                    mt: 1,
                    p: 0.75,
                    bgcolor: '#032B5A',
                    color: 'white',
                    border: 'none',
                    borderRadius: 1,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: '#021d3f',
                    },
                  }}
                >
                  Voir le profil
                </Box>
              )}
            </Box>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default TechnicianMap;

