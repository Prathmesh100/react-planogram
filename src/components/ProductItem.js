import React, { useState } from 'react';

const ProductItem = ({ provided, snapshot, item, onClick, isViewOnly }) => {
  // console.log('ProductItem rendered', item);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getCombinedTransform = () => {
    const dragTransform = provided?.draggableProps?.style?.transform || '';
    const hoverTransform = isHovered ? ' translateY(-2px)' : '';
    return dragTransform + hoverTransform;
  };

  const baseStyle = {
    width: isViewOnly ? '100%' : item.width,
    height: isViewOnly ? '100%' : item.height,
    backgroundColor: snapshot?.isDragging ? '#e3f2fd' : '#ffffff',
    border: '0.1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: snapshot?.isDragging
      ? '0 8px 25px rgba(0,0,0,0.15)'
      : isHovered
      ? '0 4px 12px rgba(0,0,0,0.1)'
      : '0 2px 4px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    position: 'relative',
    transition: 'all 0.2s ease-in-out',
    zIndex: snapshot?.isDragging ? 1000 : isHovered ? 10 : 'auto',
  };

  const content = !imageError && item.image_url ? (
    <img
      src={item.image_url}
      alt={item.name || 'product'}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        mixBlendMode: 'multiply',
        position: isViewOnly ? 'absolute' : 'relative',
        top: isViewOnly ? 0 : 'auto',
        left: isViewOnly ? 0 : 'auto',
      }}
      onError={() => setImageError(true)}
    />
  ) : (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        position: isViewOnly ? 'absolute' : 'relative',
        top: isViewOnly ? 0 : 'auto',
        left: isViewOnly ? 0 : 'auto',
      }}
    />
  );

  if (!provided) {
    return (
      <div
        style={{ ...baseStyle, transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{
        ...baseStyle,
        ...provided.draggableProps.style,
        transform: getCombinedTransform(),
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {content}
    </div>
  );
};


export default ProductItem;
