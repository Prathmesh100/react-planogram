import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const initialShelves = {
  "shelf-1": { name: "Chips & Nachos", height: 120, width: 400, items: [] },
  "shelf-2": { name: "Snacks & Biscuits", height: 180, width: 600, items: [] },
  "shelf-3": { name: "Sodas & Juices", height: 150, width: 400, items: [] },
  "shelf-4": { name: "Colas & Drinks", height: 200, width: 600, items: [] },
};

const initialItems = [
  { id: "item-1", name: "Chips", image: "/images/chips.png", width: 60, height: 80 },
  { id: "item-2", name: "Nachos", image: "/images/nachos.png", width: 60, height: 80 },
  { id: "item-3", name: "Nuts", image: "/images/nuts.png", width: 50, height: 60 },
  { id: "item-4", name: "Biscuits", image: "/images/biscuits.png", width: 70, height: 90 },
  { id: "item-5", name: "Candy", image: "/images/candy.png", width: 40, height: 40 },
  { id: "item-6", name: "Soda", image: "/images/soda.png", width: 50, height: 100 },
  { id: "item-7", name: "Juice", image: "/images/juice.png", width: 50, height: 120 },
  { id: "item-8", name: "Cola", image: "/images/cola.png", width: 50, height: 130 },
  { id: "item-9", name: "Tea", image: "/images/tea.png", width: 50, height: 110 },
];

// Tooltip component
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
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#333',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            pointerEvents: 'none'
          }}
        >
          <div><strong>{item.name}</strong></div>
          <div>Width: {item.width}px</div>
          <div>Height: {item.height}px</div>
          <div>ID: {item.id}</div>
          {/* Triangle pointer */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #333'
            }}
          />
        </div>
      )}
    </div>
  );
};

function App() {
  const [shelves, setShelves] = useState(initialShelves);
  const [unplacedItems, setUnplacedItems] = useState(initialItems);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceShelf = source.droppableId !== "items" ? shelves[source.droppableId] : null;
    const destShelf = destination.droppableId !== "items" ? shelves[destination.droppableId] : null;
    const draggedItem = source.droppableId === "items" ? unplacedItems[source.index] : sourceShelf.items[source.index];

    if (destShelf && draggedItem.height > destShelf.height) {
      alert(`❌ '${draggedItem.name}' is too tall for '${destShelf.name}' shelf.`);
      return;
    }

    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === "items") {
        const updated = Array.from(unplacedItems);
        const [moved] = updated.splice(source.index, 1);
        updated.splice(destination.index, 0, moved);
        setUnplacedItems(updated);
      } else {
        const updatedItems = Array.from(sourceShelf.items);
        const [moved] = updatedItems.splice(source.index, 1);
        updatedItems.splice(destination.index, 0, moved);
        setShelves({
          ...shelves,
          [source.droppableId]: {
            ...sourceShelf,
            items: updatedItems,
          },
        });
      }
      return;
    }

    if (source.droppableId === "items") {
      const newUnplaced = Array.from(unplacedItems);
      newUnplaced.splice(source.index, 1);
      const newShelfItems = Array.from(destShelf.items);
      newShelfItems.splice(destination.index, 0, draggedItem);
      setShelves({
        ...shelves,
        [destination.droppableId]: {
          ...destShelf,
          items: newShelfItems,
        },
      });
      setUnplacedItems(newUnplaced);
      return;
    }

    const newSourceItems = Array.from(sourceShelf.items);
    newSourceItems.splice(source.index, 1);
    const newDestItems = Array.from(destShelf.items);
    newDestItems.splice(destination.index, 0, draggedItem);

    setShelves({
      ...shelves,
      [source.droppableId]: {
        ...sourceShelf,
        items: newSourceItems,
      },
      [destination.droppableId]: {
        ...destShelf,
        items: newDestItems,
      },
    });
  };

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh' 
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: '#333', 
        marginBottom: '30px',
        fontSize: '24px'
      }}>
        🧃 Grocery Shelf Planogram
      </h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Droppable droppableId="items" direction="vertical">
            {(provided) => (
              <div 
                style={{
                  width: '200px',
                  backgroundColor: '#fff',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  maxHeight: '600px',
                  overflowY: 'auto'
                }}
                ref={provided.innerRef} 
                {...provided.droppableProps}
              >
                <h4 style={{ 
                  margin: '0 0 15px 0', 
                  color: '#555',
                  textAlign: 'center',
                  borderBottom: '2px solid #eee',
                  paddingBottom: '10px'
                }}>
                  📦 Unplaced Items
                </h4>
                {unplacedItems.map((item, index) => (
                  <Draggable draggableId={item.id} index={index} key={item.id}>
                    {(provided) => (
                      <ItemWithTooltip item={item}>
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            width: item.width,
                            height: item.height,
                            margin: '8px auto',
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#fff",
                            border: "2px solid #ccc",
                            boxShadow: "2px 2px 6px rgba(0,0,0,0.1)",
                            borderRadius: '4px',
                            cursor: 'grab',
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '4px 4px 12px rgba(0,0,0,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '2px 2px 6px rgba(0,0,0,0.1)';
                          }}
                        >
                          <div style={{ 
                            width: '100%', 
                            height: '70%', 
                            backgroundColor: '#f8f8f8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            borderRadius: '2px'
                          }}>
                            📦
                          </div>
                          <div style={{ 
                            fontSize: '10px', 
                            fontWeight: 'bold',
                            color: '#333',
                            marginTop: '4px'
                          }}>
                            {item.name}
                          </div>
                        </div>
                      </ItemWithTooltip>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div style={{ flex: 1 }}>
            {Object.entries(shelves).map(([id, shelf]) => (
              <Droppable droppableId={id} key={id} direction="horizontal">
                {(provided) => (
                  <div
                    style={{
                      height: shelf.height,
                      width: shelf.width,
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "flex-end",
                      border: "4px solid #a0522d",
                      backgroundColor: "#f8f4e3",
                      marginBottom: '20px',
                      padding: '10px',
                      boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.2)",
                      borderRadius: '8px',
                      position: "relative"
                    }}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: '-20px',
                        left: 0,
                        width: "100%",
                        textAlign: "center",
                        fontWeight: "bold",
                        background: "#a0522d",
                        color: "white",
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                        fontSize: '14px',
                        padding: '4px 0'
                      }}
                    >
                      {shelf.name}
                    </div>
                    {shelf.items.map((item, index) => (
                      <Draggable draggableId={item.id} index={index} key={item.id}>
                        {(provided) => (
                          <ItemWithTooltip item={item}>
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                width: item.width,
                                height: item.height,
                                margin: '4px',
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#fff",
                                border: "2px solid #888",
                                boxShadow: "2px 2px 6px rgba(0,0,0,0.15)",
                                boxSizing: "border-box",
                                borderRadius: '4px',
                                cursor: 'grab',
                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '4px 4px 12px rgba(0,0,0,0.25)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '2px 2px 6px rgba(0,0,0,0.15)';
                              }}
                            >
                              <div style={{ 
                                width: '100%', 
                                height: '70%', 
                                backgroundColor: '#f8f8f8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                borderRadius: '2px'
                              }}>
                                📦
                              </div>
                              <div style={{ 
                                fontSize: '10px', 
                                fontWeight: 'bold',
                                color: '#333',
                                marginTop: '4px'
                              }}>
                                {item.name}
                              </div>
                            </div>
                          </ItemWithTooltip>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}

export default App;