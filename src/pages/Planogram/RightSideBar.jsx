import React, { useEffect, useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const ProductImageCarousel = ({ images = [], alt }) => {
  const [index, setIndex] = useState(0);
  if (!images.length) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        width: 160,
        height: 200,
        backgroundColor: '#f8f9fa',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
      }}
    >
      {images.length > 1 && (
        <IconButton
          size="small"
          sx={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
          onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
        >
          {'<'}
        </IconButton>
      )}
      <img src={images[index]} alt={alt} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      {images.length > 1 && (
        <IconButton
          size="small"
          sx={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
          onClick={() => setIndex((i) => (i + 1) % images.length)}
        >
          {'>'}
        </IconButton>
      )}
    </Box>
  );
};

const RightSideBar = ({ selectedProduct,isViewOnly }) => {
  const [tab, setTab] = useState(1); // 0: KPIs, 1: Product
  const [collapsed, setCollapsed] = useState(true);
  const images = selectedProduct?.images || (selectedProduct?.image_url ? [selectedProduct.image_url] : []);

  const collapsedWidth = 0;
  const expandedWidth = 250;

  useEffect(() => {
    if (selectedProduct) {
      setTab(1); 
      setCollapsed(false);
    }
  }, [selectedProduct])


  return (
    <Box
      sx={{
        position: isViewOnly? "fixed":"relative",
        right: 0,
        height: '100%',
        width: collapsed ? collapsedWidth : expandedWidth,
        backgroundColor: 'white',
        borderLeft: isViewOnly?"0px": '1px solid #e0e0e0',
        boxShadow: '-2px 0 6px rgba(0,0,0,0.05)',
        zIndex: 1201,
        transition: 'width 0.1s ease',
        // overflow: 'hidden',
        // position: 'relative',
      }}
    >
      {/* Toggle Button */}
      <Button
        size="small"
        onClick={() => setCollapsed((c) => !c)}
        sx={{
          position: 'absolute',
          // top: 16,
          left: -30,
          minWidth: 'unset',
          width: 32,
          height: 32,
          borderRadius: '4px 0 0 4px',
          backgroundColor: '#05AF97',
          // border: '1px solid #e0e0e0',
          // boxShadow: 2,

          zIndex: 1202,
          color: 'white',
        }}
      >
        {collapsed ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
      </Button>
      {/* Content */}
      <Box
        sx={{
          height: '100%',
          // px: collapsed ? 0 : 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {!collapsed && (
          <>
            {/* Tabs */}
            <Box sx={{ width: '100%', borderBottom: '1px solid #f0f0f0', bgcolor: '#05AF97' }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="fullWidth"
                sx={{ minHeight: 44 }}
              >
                <Tab
                  label={<Typography sx={{ fontWeight: 600, color: tab === 0 ? '#222' : '#fff', fontSize: 15 }}>KPIs</Typography>}
                  sx={{ minHeight: 44 }}
                />
                <Tab
                  label={<Typography sx={{ fontWeight: 600, color: tab === 1 ? '#222' : '#fff', fontSize: 15 }}>Product</Typography>}
                  sx={{ minHeight: 44 }}
                />
              </Tabs>
            </Box>

            {/* Content Area */}
            {tab === 1 && selectedProduct ? (
              // <Card elevation={0} sx={{ width: '100%', mt: 2, mb: 2, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',overflow: 'auto' }}>
              //   <CardContent>
              //     <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              //       <ProductImageCarousel images={images} alt={selectedProduct.name} />
              //       <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', mb: 0.5, textAlign: 'center' }}>
              //         {selectedProduct.name}
              //       </Typography>
              //       <Divider sx={{ width: '100%', my: 1 }} />
              //       <Box sx={{ width: '100%', mb: 1 }}>
              //         <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 500 }}>
              //           Products &bull; {selectedProduct['tags.subgroup'] || ''} &bull; {selectedProduct['tags.group'] || ''}
              //         </Typography>
              //         <Typography variant="subtitle2" sx={{ color: '#222', fontWeight: 600, mt: 0.5 }}>
              //           {selectedProduct.name}
              //         </Typography>
              //       </Box>
              //       <Box sx={{ width: '100%', mb: 1 }}>
              //         {[
              //           ['EAN / UPC / Bar Code', selectedProduct.gtin || selectedProduct.tpnb || selectedProduct.id],
              //           ['Brand', selectedProduct.brand],
              //           ['Product Status', 'Active'],
              //           ['Sub Brand', selectedProduct['tags.subbrand'] || '-'],
              //           ['Product Code', selectedProduct.product_code || selectedProduct.id],
              //           ['Franchise', selectedProduct['tags.franchise'] || '-'],
              //           ['Need State', selectedProduct['tags.needstate'] || '-'],
              //         ].map(([label, value], idx) => (
              //           <Typography key={idx} variant="body2" sx={{ color: '#7f8c8d', fontWeight: 500 }}>
              //             {label}: <b style={{ color: '#2c3e50' }}>{value}</b>
              //           </Typography>
              //         ))}
              //       </Box>
              //     </Box>
              //   </CardContent>
              // </Card>
              <div style={{
                width: '85%',
                overflowY: 'auto',
                padding: '16px',
              }}>
                {/* Image */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  border: '1px solid #e0e0e0',
                  overflow: 'hidden'
                }}>
                  {selectedProduct.image_url ? (
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: '48px' }}>📦</div>
                  )}
                </div>

                {/* Name, Brand, Price */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{
                    margin: '0 0 8px 0',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#2c3e50',
                    textWrap: 'wrap',
                    wordBreak: 'break-word',
                  }}>
                    {selectedProduct.name}
                  </h4>
                  <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '8px' }}>
                    Brand: {selectedProduct.brand}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#27ae60',
                    textWrap: 'wrap',
                    wordBreak: 'break-word',
                  }}>
                    {selectedProduct.price}
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#7f8c8d',
                    marginBottom: '4px',

                  }}>
                    Description
                  </div>
                  <div style={{
                    fontSize: '13px',
                    lineHeight: '1.4',
                    color: '#2c3e50',
                    textWrap: 'wrap',
                    wordBreak: 'break-word',
                  }}>
                    {selectedProduct.description || 'No description available'}
                  </div>
                </div>

                {/* Specs Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  {[
                    {
                      label: 'Width',
                      value: selectedProduct.width ? `${selectedProduct.width * 5} ${selectedProduct.dimensionUom || 'mm'}` : '-'
                    },
                    {
                      label: 'Height',
                      value: selectedProduct.height ? `${selectedProduct.height * 5} ${selectedProduct.dimensionUom || 'mm'}` : '-'
                    },
                    {
                      label: 'Facings',
                      value: `${selectedProduct.total_facings} (${selectedProduct.facings_wide}×${selectedProduct.facings_high})`
                    },
                    {
                      label: 'Linear',
                      value: `${selectedProduct.linear} cm`
                    }
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '4px' }}>
                        {label}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Metadata */}
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f0f8ff',
                  borderRadius: '6px',
                  border: '1px solid #e3f2fd'
                }}>
                  <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '4px' }}>
                    Product Metadata
                  </div>
                  <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#2c3e50' }}>
                    <div>ID: {selectedProduct.id}</div>
                    <div>TPNB: {selectedProduct.tpnb}</div>
                    <div>GTIN: {selectedProduct.gtin}</div>
                    <div>Orientation: {selectedProduct.orientation}°</div>

                  </div>
                </div>
              </div>
            ) : tab === 0 ? (
              <Box sx={{ textAlign: 'center', color: '#7f8c8d', fontSize: 16, mt: 8 }}>
                KPIs will be shown here.
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', color: '#7f8c8d', fontSize: 16, mt: 8 }}>
                Select a product to view details
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(RightSideBar);
