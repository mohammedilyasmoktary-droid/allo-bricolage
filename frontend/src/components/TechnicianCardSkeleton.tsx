import React from 'react';
import { Card, CardContent, Box, Skeleton } from '@mui/material';

const TechnicianCardSkeleton: React.FC = () => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        border: '1px solid #f0f0f0',
      }}
    >
      {/* Photo skeleton */}
      <Box sx={{ position: 'relative', height: 180, bgcolor: '#f5f5f5' }}>
        <Skeleton variant="circular" width={100} height={100} sx={{ mx: 'auto', mt: 3 }} />
        <Skeleton variant="rectangular" width={60} height={20} sx={{ position: 'absolute', top: 12, right: 12, borderRadius: 1 }} />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 2 }} />
        </Box>
        <Skeleton variant="text" width="100%" height={16} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="80%" height={16} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Skeleton variant="text" width={100} height={24} />
          <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 2 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TechnicianCardSkeleton;




