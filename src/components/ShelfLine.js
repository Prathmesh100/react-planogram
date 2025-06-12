import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import ProductItem from './ProductItem';

const ShelfLine = ({ provided, snapshot, shelf, items, shelfIdx, ItemWithTooltip, SHELF_GAP }) => (
  <div
    ref={provided.innerRef}
    {...provided.droppableProps}
    style={{
      position: 'relative',
      height: shelf.height,
      width: shelf.width,
      marginBottom: SHELF_GAP,
      borderBottom: '4px solid #b0b0b0',
      display: 'flex',
      alignItems: 'end',
      background: snapshot.isDraggingOver ? '#d0eaff' : 'transparent',
      transition: 'background 0.2s',
    }}
  >
    {items.map((item, itemIdx) => (
      <Draggable draggableId={item.id} index={itemIdx} key={item.id}>
        {(provided, snapshot) => (
          <ItemWithTooltip item={item}>
            <ProductItem
              provided={provided}
              snapshot={snapshot}
              item={item}
            />
          </ItemWithTooltip>
        )}
      </Draggable>
    ))}
    {provided.placeholder}
  </div>
);

export default ShelfLine; 