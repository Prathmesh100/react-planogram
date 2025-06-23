import React, { useState } from 'react';

const ItemWithTooltip = ({ item, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '-180px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#ffffff',
            color: '#333',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '12px',
            lineHeight: '1.4',
            textAlign: 'left',
            zIndex: 1000000,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            border: '1px solid #e0e0e0',
            pointerEvents: 'none',
            minWidth: '200px',
            maxWidth: '250px',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            opacity: 1,
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#2c3e50' }}>
            {item.name}
          </div>
          <div style={{ color: '#7f8c8d', marginBottom: '6px', fontSize: '11px' }}>
            Brand: {item.brand}
          </div>
          {item.description && (
            <div style={{ marginBottom: '8px', color: '#5d6d7e', fontSize: '11px', lineHeight: '1.3' }}>
              {item.description}
            </div>
          )}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '8px',
            marginBottom: '8px',
            fontSize: '10px',
            color: '#95a5a6'
          }}>
            <div>Dimensions: {item.width}×{item.height} {item.dimensionUom}</div>
            <div>Facings: {item.total_facings}</div>
            <div>Linear: {item.linear} cm</div>
            <div>Orientation: {item.orientation}°</div>
          </div>
          <div style={{ fontSize: '10px', color: '#95a5a6' }}>
            ID: {item.id}
          </div>
          <div
            style={{
              position: 'absolute',
              top: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '6px solid #ffffff',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(ItemWithTooltip); 