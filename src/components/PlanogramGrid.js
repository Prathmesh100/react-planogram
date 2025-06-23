import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import ShelfLine from './ShelfLine';

const PlanogramGrid = ({ shelves, shelfLines, ItemWithTooltip, setSelectedProduct, isViewOnly, onBayClick, focusedBay, dimmedProductIds = [] }) => {
  const SHELF_GAP = 32;
  const MAX_WIDTH = 800; // Maximum width for the main planogram

  // Return early if shelves or shelfLines is empty
  if (!shelves || !shelfLines || shelves.length === 0 || shelfLines.length === 0) {
    return (
      <div style={{
        width: MAX_WIDTH,
        margin: '0 auto',
        background: '#e0e0e0',
        borderRadius: '8px',
        padding: '24px 0',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
      }}>
        <div style={{ color: '#666', fontSize: '14px' }}>Loading shelves...</div>
      </div>
    );
  }

  const maxWidth = Math.max(...shelves.map((s) => s.width + 20));

  const handleBayClick = (shelfIdx, subShelfIdx, event) => {
    // Only handle clicks in fullscreen mode
    if (!isViewOnly || !onBayClick) return;
    
    // Prevent event bubbling
    event.stopPropagation();
    
    onBayClick(shelfIdx, subShelfIdx);
  };

  return (
    <div
      style={{
        width: isViewOnly ? maxWidth : Math.min(maxWidth, MAX_WIDTH),
        maxWidth: isViewOnly ? 'none' : MAX_WIDTH,
        margin: '0 auto',
        background: '#e0e0e0',
        borderRadius: '8px',
        padding: '24px 20px',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        ...(isViewOnly ? {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        } : {
          overflowX: 'auto',
          overflowY: 'auto'
        }),
        maxHeight: isViewOnly ? '100vh' : 'calc(100vh - 200px)',
      }}
    >
      <div style={{
        width: isViewOnly ? '100%' : maxWidth,
        minWidth: isViewOnly ? '100%' : MAX_WIDTH,
        position: 'relative'
      }}>
        {shelves.map((shelf, shelfIdx) => (
          <div
            key={shelfIdx}
            style={{
              display: 'flex',
              gap: '4px',
              padding: '0 4px',
              marginBottom: SHELF_GAP,
              position: 'relative',
            }}
          >
            {shelf.subShelves.map((subShelf, subShelfIdx) => {
              const isFocused = focusedBay?.shelfIndex === shelfIdx && focusedBay?.bayIndex === subShelfIdx;
              
              const shelfContent = (
                <ShelfLine
                  shelf={subShelf}
                  items={shelfLines[shelfIdx]?.[subShelfIdx] || []}
                  shelfIdx={`${shelfIdx}-${subShelfIdx}`}
                  ItemWithTooltip={ItemWithTooltip}
                  SHELF_GAP={SHELF_GAP}
                  setSelectedProduct={setSelectedProduct}
                  isViewOnly={isViewOnly}
                  dimmedProductIds={dimmedProductIds}
                />
              );

              if (isViewOnly) {
                return (
                  <div 
                    key={`${shelfIdx}-${subShelfIdx}`}
                    onClick={(e) => handleBayClick(shelfIdx, subShelfIdx, e)}
                    style={{
                      position: 'relative',
                      width: subShelf.width,
                      height: subShelf.height,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      ...(isFocused ? {
                        outline: '3px solid #3498db',
                        outlineOffset: '2px',
                        borderRadius: '4px',
                        boxShadow: '0 0 12px rgba(52, 152, 219, 0.3)'
                      } : {
                        outline: '1px solid transparent',
                        outlineOffset: '2px',
                        ':hover': {
                          outline: '2px solid rgba(52, 152, 219, 0.5)',
                          outlineOffset: '2px'
                        }
                      })
                    }}
                  >
                    {shelfContent}
                  </div>
                );
              }

              return (
                <Droppable
                  droppableId={`shelf-line-${shelfIdx}-${subShelfIdx}`}
                  direction="horizontal"
                  key={`${shelfIdx}-${subShelfIdx}`}
                >
                  {(provided, snapshot) => (
                    <ShelfLine
                      provided={provided}
                      snapshot={snapshot}
                      shelf={subShelf}
                      items={shelfLines[shelfIdx]?.[subShelfIdx] || []}
                      shelfIdx={`${shelfIdx}-${subShelfIdx}`}
                      ItemWithTooltip={ItemWithTooltip}
                      SHELF_GAP={SHELF_GAP}
                      setSelectedProduct={setSelectedProduct}
                      dimmedProductIds={dimmedProductIds}
                    />
                  )}
                </Droppable>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(PlanogramGrid); 