// src/App.js
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./App.css";

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
    <div className="app-container">
      <h2 className="title">🧃 Grocery Shelf Planogram</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="layout">
          <Droppable droppableId="items" direction="vertical">
            {(provided) => (
              <div className="items-panel" ref={provided.innerRef} {...provided.droppableProps}>
                <h4>📦 Unplaced Items</h4>
                {unplacedItems.map((item, index) => (
                  <Draggable draggableId={item.id} index={index} key={item.id}>
                    {(provided) => (
                      <div
                        className="item-box"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          width: item.width,
                          height: item.height,
                          margin: 4,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#fff",
                          border: "1px solid #ccc",
                          boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        <img src={item.image} alt={item.name} style={{ width: "100%", height: "70%", objectFit: "contain" }} /><br />
                        <div style={{ fontSize: 12 }}>{item.name}</div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="shelf-area">
            {Object.entries(shelves).map(([id, shelf]) => (
              <Droppable droppableId={id} key={id} direction="horizontal">
                {(provided) => (
                  <div
                    className="shelf"
                    style={{
                      height: shelf.height,
                      width: shelf.width,
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "flex-end",
                      border: "4px solid #a0522d",
                      backgroundColor: "#f8f4e3",
                      marginBottom: 12,
                      padding: 6,
                      boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.2)",
                      borderRadius: 6,
                      position: "relative"
                    }}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: -18,
                        left: 0,
                        width: "100%",
                        textAlign: "center",
                        fontWeight: "bold",
                        background: "#a0522d",
                        color: "white",
                        borderTopLeftRadius: 6,
                        borderTopRightRadius: 6,
                        fontSize: 14,
                      }}
                    >
                      {shelf.name}
                    </div>
                    {shelf.items.map((item, index) => (
                      <Draggable draggableId={item.id} index={index} key={item.id}>
                        {(provided) => (
                          <div
                            className="item-box"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              width: item.width,
                              height: item.height,
                              margin: 4,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#fff",
                              border: "1px solid #888",
                              boxShadow: "2px 2px 4px rgba(0,0,0,0.15)",
                              boxSizing: "border-box",
                              hover:{scale: 1.05, transition: "transform 0.2s ease-in-out"},
                            }}
                          >
                            <img src={item.image} alt={item.name} style={{ width: "100%", height: "70%", objectFit: "contain" }} /><br />
                            <div style={{ fontSize: 12 }}>{item.name}</div>
                          </div>
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
// src/smooth_without_tooltip.js