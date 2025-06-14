import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import ShelfLine from './ShelfLine';

const PlanogramGrid = ({ shelves, shelfLines, ItemWithTooltip, setSelectedProduct }) => {
  const SHELF_GAP = 32;
  return (
    <div
      style={{
        width: Math.max(...shelves.map((s) => s.width)),
        margin: '0 auto',
        background: '#e0e0e0',
        borderRadius: '8px',
        padding: '24px 0',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      {shelves.map((shelf, shelfIdx) => (
        <div
          key={shelfIdx}
          style={{
            display: 'flex',
            gap: '4px',
            padding: '0 4px',
            marginBottom: SHELF_GAP
          }}
        >
          {shelf.subShelves.map((subShelf, subShelfIdx) => (
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
                  items={shelfLines[shelfIdx][subShelfIdx]}
                  shelfIdx={`${shelfIdx}-${subShelfIdx}`}
                  ItemWithTooltip={ItemWithTooltip}
                  SHELF_GAP={SHELF_GAP}
                  setSelectedProduct={setSelectedProduct}
                />
              )}
            </Droppable>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PlanogramGrid; 