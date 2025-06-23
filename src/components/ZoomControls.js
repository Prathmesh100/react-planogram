import React from 'react';
import { Box, Button, Paper } from '@mui/material';
import { Restore, ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon } from '@mui/icons-material';
import { Maximize2, RotateCcw } from 'lucide-react';

const ZoomControls = ({ onZoomIn, onZoomOut, onFullscreen, zoomValue, onReset }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 3,
        py: 1,
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)'
      }}
    >
      <Button onClick={onZoomIn} variant="outlined" size="small" sx={{ minWidth: 40, color: "#05AF97", borderColor: '#05AF97' }}>
        <ZoomInIcon />
      </Button>

      <Box sx={{ mx: 2, fontWeight: 600, fontSize: 16 }}>{Math.round(zoomValue * 100)}%</Box>

      <Button onClick={onZoomOut} variant="outlined" size="small" sx={{ minWidth: 40, color: "#05AF97", borderColor: '#05AF97' }}>
        <ZoomOutIcon />
      </Button>
      <Button onClick={onReset} variant="outlined" size="small" sx={{ minWidth: 40, color: "#05AF97", borderColor: '#05AF97' }}>
        <RotateCcw />
      </Button>
      <Button onClick={onFullscreen} variant="outlined" size="small" sx={{ minWidth: 40, color: "#05AF97", borderColor: '#05AF97' }}>
        <Maximize2 />
      </Button>
    </Paper>
  );
};

export default React.memo(ZoomControls); 