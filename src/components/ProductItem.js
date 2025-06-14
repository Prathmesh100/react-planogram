import React from 'react';

const ProductItem = ({ provided, snapshot, item, onClick }) => (
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
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: snapshot.isDragging ? '0 8px 25px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.05)'
    }}
  >
    <div style={{
      fontSize: '10px',
      color: '#7f8c8d',
      textAlign: 'center',
      padding: '4px'
    }}>
      {item.name}
    </div>
  </div>
);

export default ProductItem; 