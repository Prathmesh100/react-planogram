import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import ProductItem from './ProductItem';

const ProductInventory = ({ unplacedItems, selectedProduct, setSelectedProduct, ItemWithTooltip }) => (
  <Droppable droppableId="items" direction="vertical">
    {(provided) => (
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto'
        }}
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {unplacedItems.map((item, index) => (
          <Draggable draggableId={item.id} index={index} key={item.id}>
            {(provided, snapshot) => (
              <ItemWithTooltip item={item}>
                <div
                  onClick={() => setSelectedProduct(item)}
                  style={{
                    borderRadius: '4px',
                    marginBottom: '8px',
                    marginRight: '8px',
                  }}
                >
                  <ProductItem provided={provided} snapshot={snapshot} item={item} />
                </div>
              </ItemWithTooltip>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
);

export default ProductInventory; 