import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Alert } from '@mui/material';

/**
 * Diagnostic component to test image loading
 * Add this temporarily to HomePage to check image paths
 */
const ImageDiagnostic: React.FC = () => {
  const [imageStatus, setImageStatus] = useState<Record<number, 'loading' | 'success' | 'error'>>({});

  useEffect(() => {
    const checkImages = async () => {
      for (let i = 1; i <= 8; i++) {
        const img = new Image();
        // Try SVG first (placeholders), then JPG (real images)
        const svgPath = `/images/technicians/technician_${i}.svg`;
        const jpgPath = `/images/technicians/technician_${i}.jpg`;
        
        // Check SVG first
        img.onload = () => {
          setImageStatus(prev => ({ ...prev, [i]: 'success' }));
        };
        
        img.onerror = () => {
          // If SVG fails, try JPG
          const jpgImg = new Image();
          jpgImg.onload = () => {
            setImageStatus(prev => ({ ...prev, [i]: 'success' }));
          };
          jpgImg.onerror = () => {
            setImageStatus(prev => ({ ...prev, [i]: 'error' }));
          };
          jpgImg.src = jpgPath;
        };
        
        img.src = svgPath;
      }
    };
    
    checkImages();
  }, []);

  const successCount = Object.values(imageStatus).filter(s => s === 'success').length;
  const errorCount = Object.values(imageStatus).filter(s => s === 'error').length;

  return (
    <Card sx={{ mb: 4, p: 3, bgcolor: '#f5f5f5' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#032B5A' }}>
          🔍 Image Diagnostic Tool
        </Typography>
        
        <Alert severity={successCount === 8 ? 'success' : 'warning'} sx={{ mb: 2 }}>
          {successCount === 8 
            ? '✅ All images loaded successfully!' 
            : `⚠️ ${errorCount} image(s) not found. ${successCount} loaded.`}
        </Alert>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mt: 2 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Box key={i} sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                technician_{i}.svg / .jpg
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 80,
                  bgcolor: '#e0e0e0',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid',
                  borderColor: imageStatus[i] === 'success' ? 'success.main' : 
                               imageStatus[i] === 'error' ? 'error.main' : 'grey.300',
                }}
              >
                {imageStatus[i] === 'success' && (
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                    ✓
                  </Typography>
                )}
                {imageStatus[i] === 'error' && (
                  <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                    ✗
                  </Typography>
                )}
                {!imageStatus[i] && (
                  <Typography variant="caption" color="text.secondary">
                    ...
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Expected location:</strong> <code>frontend/public/images/technicians/</code>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>File names:</strong> technician_1.svg (or .jpg), technician_2.svg (or .jpg), ... technician_8.svg (or .jpg)
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            ✅ SVG placeholders are currently in place. Replace with JPG/PNG images when ready.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ImageDiagnostic;

