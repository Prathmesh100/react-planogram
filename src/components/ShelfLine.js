import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import ProductItem from './ProductItem';

const ShelfLine = ({
  provided,
  snapshot,
  shelf,
  items,
  shelfIdx,
  ItemWithTooltip,
  SHELF_GAP,
  setSelectedProduct,
  isViewOnly,
  dimmedProductIds = [],
}) => {
  const shelfContent = (
    <div
      style={{
        position: 'relative',
        height: shelf.height,
        width: shelf.width,
        marginBottom: SHELF_GAP,
        borderBottom: '4px solid #b0b0b0',
        padding:isViewOnly ? '0' : '0 1px',
        display: 'flex',
        alignItems: 'flex-end',
        background: snapshot?.isDraggingOver ? '#d0eaff' : 'transparent',
        transition: 'background 0.2s',
      }}
    >
      
      {items.map((item, itemIdx) => {
        const facingCount = item.facings_high || 1;
        const isDimmed = dimmedProductIds.includes(item.id);
        // VIEW-ONLY MODE
        if (isViewOnly) {
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                width: item.width,
                boxSizing: 'border-box',
                
              }}
            >
              {Array.from({ length: facingCount }).map((_, facingIdx) => (
                <div
                  key={facingIdx}
                  style={{
                    width: item.width,
                    height: item.height,
                    position: 'relative',
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                  }}
                >
                  <ProductItem
                    item={item}
                    onClick={() => setSelectedProduct(item)}
                    isViewOnly={true}
                    dimmed={isDimmed}
                  />
                </div>
              ))}
            </div>
          );
        }

        // EDITABLE/DRAGGABLE MODE
        return (
          <Draggable draggableId={item.id} index={itemIdx} key={item.id}>
            {(provided, snapshot) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  width: item.width,
                  boxSizing: 'border-box',
                
                }}
              >
                {Array.from({ length: facingCount }).map((_, facingIdx) => (
                  <ProductItem
                    key={facingIdx}
                    provided={provided}
                    snapshot={snapshot}
                    item={item}
                    onClick={() => {!item.isEmpty && setSelectedProduct(item)}}
                    isViewOnly={false}
                    dimmed={isDimmed}
                  />
                ))}
              </div>
            )}
          </Draggable>
        );
      })}
      {!isViewOnly && provided?.placeholder}
    </div>
  );

  return isViewOnly ? (
    shelfContent
  ) : (
    <div ref={provided?.innerRef} {...provided?.droppableProps}>
      {shelfContent}
    </div>
  );
};

export default React.memo(ShelfLine);
