import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import ShelfLine from './ShelfLine';

const PlanogramGrid = ({ shelves, shelfLines, ItemWithTooltip }) => {
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
      {shelves.map((shelf, idx) => (
        <Droppable droppableId={`shelf-line-${idx}`} direction="horizontal" key={idx}>
          {(provided, snapshot) => (
            <ShelfLine
              provided={provided}
              snapshot={snapshot}
              shelf={shelf}
              items={shelfLines[idx]}
              shelfIdx={idx}
              ItemWithTooltip={ItemWithTooltip}
              SHELF_GAP={SHELF_GAP}
            />
          )}
        </Droppable>
      ))}
    </div>
  );
};

export default PlanogramGrid; 