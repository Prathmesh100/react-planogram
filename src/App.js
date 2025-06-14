import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Search, Share, Download, Settings, ChevronLeft, ChevronRight, Eye, MoreVertical } from "lucide-react";
import PlanogramGrid from './components/PlanogramGrid';
import ProductInventory from './components/ProductInventory';
import ItemWithTooltip from './components/ItemWithTooltip';

const initialShelves = {
  "shelf-1": { name: "Chips & Nachos", height: 120, width: 400, items: [] },
  "shelf-2": { name: "Snacks & Biscuits", height: 180, width: 600, items: [] },
  "shelf-3": { name: "Sodas & Juices", height: 150, width: 600, items: [] },
  "shelf-4": { name: "Colas & Drinks", height: 200, width: 600, items: [] },
  "shelf-5": { name: "Dairy Products", height: 160, width: 600, items: [] },
  "shelf-6": { name: "Frozen Foods", height: 180, width: 600, items: [] },
};

const initialItems = [
  {
    id: "item-1",
    name: "Chips",
    image: "/images/chips.png",
    width: 40,
    height: 80,
    bgColor: "#f5deb3",
    description: "Crispy potato chips - perfect for snacking anytime. Made with premium potatoes and seasoned to perfection.",
    stackable: true,
    quantity: 1,
    brand: "Lay's",
    price: "$2.99"
  },
  {
    id: "item-2",
    name: "Nachos",
    image: "/images/nachos.png",
    width: 60,
    height: 100,
    bgColor: "#f4a460",
    description: "Crunchy tortilla chips ideal for dipping. Great with salsa, cheese, or guacamole.",
    stackable: true,
    quantity: 1,
    brand: "Tostitos",
    price: "$3.49"
  },
  {
    id: "item-3",
    name: "Nuts",
    image: "/images/nuts.png",
    width: 40,
    height: 70,
    bgColor: "#deb887",
    description: "Mixed nuts containing almonds, cashews, and peanuts. A healthy snack option rich in protein.",
    stackable: true,
    quantity: 1,
    brand: "Planters",
    price: "$4.99"
  },
  {
    id: "item-4",
    name: "Biscuits",
    image: "/images/biscuits.png",
    width: 100,
    height: 30,
    bgColor: "#ffe4c4",
    description: "Sweet and crunchy biscuits made with real butter. Perfect with tea or coffee.",
    stackable: true,
    quantity: 1,
    brand: "Oreo",
    price: "$3.29"
  },
  {
    id: "item-5",
    name: "Candy",
    image: "/images/candy.png",
    width: 40,
    height: 40,
    bgColor: "#ffb6c1",
    description: "Assorted colorful candies with fruity flavors. A delightful treat for all ages.",
    stackable: true,
    quantity: 1,
    brand: "Haribo",
    price: "$1.99"
  },
  {
    id: "item-6",
    name: "Soda",
    image: "/images/soda.png",
    width: 45,
    height: 70,
    bgColor: "#e0f7fa",
    description: "Refreshing carbonated soft drink with a crisp, clean taste. Best served chilled.",
    stackable: false,
    quantity: 1,
    brand: "Sprite",
    price: "$1.79"
  },
  {
    id: "item-7",
    name: "Juice",
    image: "/images/juice.png",
    width: 50,
    height: 100,
    bgColor: "#ffcc80",
    description: "100% natural fruit juice packed with vitamins. No artificial colors or preservatives.",
    stackable: false,
    quantity: 1,
    brand: "Tropicana",
    price: "$3.99"
  },
  {
    id: "item-8",
    name: "Cola",
    image: "/images/cola.png",
    width: 50,
    height: 120,
    bgColor: "#d32f2f",
    description: "Classic cola drink with the perfect balance of sweetness and fizz. An iconic refreshment.",
    stackable: false,
    quantity: 1,
    brand: "Coca-Cola",
    price: "$1.99"
  }
];


const SHELVES = [
  {
    height: 40,
    width: 700,
    subShelves: [
      { height: 40, width: 350 },
      { height: 40, width: 350 }
    ]
  },
  {
    height: 100,
    width: 200,
    subShelves: [
      { height: 100, width: 200 }
    ]
  },
  {
    height: 80,
    width: 900,
    subShelves: [
      { height: 80, width: 300 },
      { height: 80, width: 300 },
      { height: 80, width: 300 }
    ]
  },
  {
    height: 120,
    width: 400,
    subShelves: [
      { height: 120, width: 200 },
      { height: 120, width: 200 }
    ]
  },
  {
    height: 90,
    width: 600,
    subShelves: [
      { height: 90, width: 200 },
      { height: 90, width: 200 },
      { height: 90, width: 200 }
    ]
  }
];
const SHELF_GAP = 32;

function App() {
  // Each shelf line is an array of arrays (one array per sub-shelf)
  const [shelfLines, setShelfLines] = useState(
    Array.from({ length: SHELVES.length }, (_, shelfIdx) =>
      Array.from({ length: SHELVES[shelfIdx].subShelves.length }, () => [])
    )
  );
  const [unplacedItems, setUnplacedItems] = useState(initialItems);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('98%');

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // Helper to get the item being dragged
    let item = null;
    if (source.droppableId === 'items') {
      item = unplacedItems[source.index];
    } else if (source.droppableId.startsWith('shelf-line-')) {
      const [shelfIdx, subShelfIdx] = source.droppableId.replace('shelf-line-', '').split('-').map(Number);
      item = shelfLines[shelfIdx][subShelfIdx][source.index];
    }

    // Dropping onto a shelf line
    if (destination.droppableId.startsWith('shelf-line-')) {
      const [destShelfIdx, destSubShelfIdx] = destination.droppableId.replace('shelf-line-', '').split('-').map(Number);
      const destShelf = shelfLines[destShelfIdx][destSubShelfIdx];
      const ITEM_MARGIN = 4;

      // Calculate total width of items in the sub-shelf
      let occupiedWidth = destShelf.reduce((sum, i) => sum + i.width, 0);
      let itemCount = destShelf.length;

      // If moving within the same shelf, exclude the item's width from the total
      if (source.droppableId === destination.droppableId) {
        occupiedWidth -= item.width;
        itemCount -= 1;
      }

      const SPACING_BUFFER = itemCount > 0 ? ITEM_MARGIN * (itemCount + 1) : 0;
      const totalOccupiedWidth = occupiedWidth + item.width + SPACING_BUFFER;

      if (totalOccupiedWidth > SHELVES[destShelfIdx].subShelves[destSubShelfIdx].width) {
        alert(`❌ Not enough horizontal space on this shelf for '${item.name}'.`);
        return;
      }
      if (item.height > SHELVES[destShelfIdx].subShelves[destSubShelfIdx].height) {
        alert(`❌ '${item.name}' is too tall for this shelf (max height: ${SHELVES[destShelfIdx].subShelves[destSubShelfIdx].height}px).`);
        return;
      }
    }

    // Create new arrays to avoid mutating state directly
    const newShelfLines = shelfLines.map(shelf => shelf.map(subShelf => [...subShelf]));
    const newUnplacedItems = [...unplacedItems];

    // Handle drag from inventory to shelf
    if (source.droppableId === 'items' && destination.droppableId.startsWith('shelf-line-')) {
      const [shelfIdx, subShelfIdx] = destination.droppableId.replace('shelf-line-', '').split('-').map(Number);
      newUnplacedItems.splice(source.index, 1);
      newShelfLines[shelfIdx][subShelfIdx].splice(destination.index, 0, item);
    }
    // Handle drag from shelf to inventory
    else if (source.droppableId.startsWith('shelf-line-') && destination.droppableId === 'items') {
      const [shelfIdx, subShelfIdx] = source.droppableId.replace('shelf-line-', '').split('-').map(Number);
      newShelfLines[shelfIdx][subShelfIdx].splice(source.index, 1);
      newUnplacedItems.splice(destination.index, 0, item);
    }
    // Handle moving within inventory
    else if (source.droppableId === 'items' && destination.droppableId === 'items') {
      const [moved] = newUnplacedItems.splice(source.index, 1);
      newUnplacedItems.splice(destination.index, 0, moved);
    }
    // Handle moving within or between shelves
    else if (source.droppableId.startsWith('shelf-line-') && destination.droppableId.startsWith('shelf-line-')) {
      const [srcShelfIdx, srcSubShelfIdx] = source.droppableId.replace('shelf-line-', '').split('-').map(Number);
      const [destShelfIdx, destSubShelfIdx] = destination.droppableId.replace('shelf-line-', '').split('-').map(Number);
      
      newShelfLines[srcShelfIdx][srcSubShelfIdx].splice(source.index, 1);
      newShelfLines[destShelfIdx][destSubShelfIdx].splice(destination.index, 0, item);
    }

    // Update state with new arrays
    setShelfLines(newShelfLines);
    setUnplacedItems(newUnplacedItems);
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>

      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        {/* Main Content */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ flex: 1, display: 'flex' }}>
            {/* Left Sidebar - Products */}
            <div style={{
              width: '280px',
              backgroundColor: 'white',
              borderRight: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '16px',
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#f8f9fa'
              }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2c3e50'
                }}>
                  📦 Product Inventory
                </h3>
                <div style={{
                  fontSize: '12px',
                  color: '#7f8c8d'
                }}>
                  {unplacedItems.length} items available
                </div>
              </div>
              <ProductInventory
                unplacedItems={unplacedItems}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                ItemWithTooltip={ItemWithTooltip}
              />
            </div>

            {/* Center - Planogram Grid */}
            <div style={{ flex: 1, backgroundColor: '#f8f9fa', padding: '20px', overflowY: 'auto' }}>
              <PlanogramGrid
                shelves={SHELVES}
                shelfLines={shelfLines}
                ItemWithTooltip={ItemWithTooltip}
              />
            </div>
          </div>
        </DragDropContext>

        {/* Right Sidebar - Product Details */}
        <div style={{
          width: '320px',
          backgroundColor: 'white',
          borderLeft: '1px solid #e0e0e0',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Product Details
            </h3>
            <MoreVertical size={16} style={{ cursor: 'pointer', color: '#7f8c8d' }} />
          </div>

          {selectedProduct ? (
            <div>
              <div style={{
                width: '100%',
                height: '200px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                marginBottom: '20px',
                border: '1px solid #e0e0e0'
              }}>
                📦
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#2c3e50'
                }}>
                  {selectedProduct.name}
                </h4>
                <div style={{
                  fontSize: '14px',
                  color: '#7f8c8d',
                  marginBottom: '8px'
                }}>
                  Brand: {selectedProduct.brand}
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#27ae60'
                }}>
                  {selectedProduct.price}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  fontSize: '12px',
                  color: '#7f8c8d',
                  marginBottom: '4px'
                }}>
                  Description
                </div>
                <div style={{
                  fontSize: '13px',
                  lineHeight: '1.4',
                  color: '#2c3e50'
                }}>
                  {selectedProduct.description}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '4px' }}>
                    Width
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                    {selectedProduct.width}px
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '4px' }}>
                    Height
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                    {selectedProduct.height}px
                  </div>
                </div>
              </div>

              <div style={{
                padding: '12px',
                backgroundColor: '#f0f8ff',
                borderRadius: '6px',
                border: '1px solid #e3f2fd'
              }}>
                <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '4px' }}>
                  Product ID
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#2c3e50' }}>
                  {selectedProduct.id}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#7f8c8d',
              fontSize: '14px',
              marginTop: '40px'
            }}>
              Select a product to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;