import React, { useState } from 'react';

const ProductItem = ({ provided, snapshot, item, onClick }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={onClick}
      style={{
        ...provided.draggableProps.style,
        width: item.width,
        height: item.height,
        backgroundColor: snapshot.isDragging ? '#e3f2fd' : 'white',
        border: '1px solid #e0e0e0',
        // borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: snapshot.isDragging
          ? '0 8px 25px rgba(0,0,0,0.15)'
          : '0 2px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}
    >
      {!imageError && item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name || 'product'}
          style={{ width: '100%', height: '100%', objectFit: 'cover',mixBlendMode: 'multiply' }}
          onError={() => setImageError(true)}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', backgroundColor: 'white' }} />
      )}
    </div>
  );
};

export default ProductItem;
