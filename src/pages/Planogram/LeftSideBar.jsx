import React from 'react';
import ProductInventory from '../../components/ProductInventory';
import { Paper, Typography, Box } from '@mui/material';

const LeftSideBar = ({ unplacedItems, selectedProduct, setSelectedProduct, ItemWithTooltip }) => {
  
  return (
    <Paper
      elevation={0}
      sx={{
        width: '280px',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        padding: 2,
      }}
    >
      <Box sx={{ width: '100%', borderBottom: '1px solid #e0e0e0', pb: 1 }}>
        <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>
          📦 Product Inventory
        </Typography>
        <Typography variant="caption" sx={{ color: '#7f8c8d' }}>
          {unplacedItems.length} items available
        </Typography>
      </Box>
      <ProductInventory
        unplacedItems={unplacedItems}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
      />
    </Paper>
  );
};

export default React.memo(LeftSideBar);
