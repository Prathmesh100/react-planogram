import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Search, Share, Download, Settings, ChevronLeft, ChevronRight, Eye, MoreVertical } from "lucide-react";
import PlanogramGrid from './components/PlanogramGrid';
import ProductInventory from './components/ProductInventory';
import ItemWithTooltip from './components/ItemWithTooltip';
import axios from "axios";

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
    image: "./assets/chips.png",
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



const SHELF_GAP = 32;

const EMPTY_SPACE_WIDTH = 20; // Width of each empty space
const EMPTY_SPACE_MARGIN = 4; // Margin between empty spaces

function App() {

  const [SHELVES, setShelves] = useState([])
  const [apiProducts, setApiProducts] = useState();

  // Initialize shelfLines with empty arrays when SHELVES is empty
  const [shelfLines, setShelfLines] = useState([]);


  // Update shelfLines whenever SHELVES changes
 useEffect(() => {
  if (SHELVES.length > 0 && apiProducts.length > 0) {
    const newShelfLines = SHELVES.map((shelf, shelfIdx) =>
      shelf.subShelves.map((subShelf, subShelfIdx) => {
        const shelfWidth = subShelf.width;
        const productsForShelf = apiProducts.filter(
          (product) =>
            product.shelf - 1 === shelfIdx &&
            product.bay - 1 === subShelfIdx
        );

        productsForShelf.sort((a, b) => a.position - b.position);

        const shelfLine = [];
        let cursor = 0;

        productsForShelf.forEach((product, idx) => {
          const { product_details, position, facings_wide = 1 } = product;

          const rawWidth = product_details?.width ?? 50;
          const rawHeight = product_details?.height ?? 50;

          const unitWidth = rawWidth / 5;
          const height = rawHeight / 5;

          const scaledPosition = (position * 2) % product.shelfwidth;

          // Insert empty space if needed
          if (scaledPosition > cursor) {
            shelfLine.push({
              id: `empty-${shelfIdx}-${subShelfIdx}-${cursor}`,
              width: scaledPosition - cursor,
              height: 0,
              bgColor: '#f0f0f0',
              isEmpty: true
            });
            cursor = scaledPosition;
          }

          // Add multiple facings of the product
          for (let i = 0; i < facings_wide; i++) {
            shelfLine.push({
              ...product_details,
              id: `${product.product_id}-${i}`,
              width: unitWidth,
              height,
              isEmpty: false,
              brand: product_details['tags.brand'],
              name: product_details.name,
              description: `${product_details['tags.subgroup']} - ${product_details.name}`,
              price: `£${(product_details.price || 0).toFixed(2)}`,
              image_url: product_details.image_url,
              gtin: product_details.gtin,
              tpnb: product_details.tpnb,
              dimensionUom: product_details.dimensionUom,
              facings_wide: product.facings_wide,
              facings_high: product.facings_high,
              total_facings: product.total_facings,
              orientation: product.orientation,
              linear: product.linear
            });

            cursor += unitWidth + 2; // Each facing with padding
          }
        });

        // Fill till end of shelf with fixed width empty blocks (20px)
        while (cursor + 20 <= shelfWidth) {
          shelfLine.push({
            id: `empty-${shelfIdx}-${subShelfIdx}-${cursor}-end`,
            width: 20,
            height: 0,
            bgColor: '#f0f0f0',
            isEmpty: true
          });
          cursor += 20;
        }

        return shelfLine;
      })
    );

    setShelfLines(newShelfLines);
  }
}, [SHELVES, apiProducts]);




  const groupProductsByShelfAndBay = (products) => {
    const shelfMap = {};
    const shelfHeights = {};
    const shelfProductCounts = {};
    const shelfMaxBay = {};

    products.forEach((product) => {
      const { shelf, bay, trayheight, shelfwidth } = product;
      const shelfKey = `${shelf}`;
      const shelfBayKey = `${shelf}-${bay}`;

      // Initialize shelf
      if (!shelfMap[shelf]) {
        shelfMap[shelf] = {};
      }

      // Track max bay per shelf
      if (!shelfMaxBay[shelf]) {
        shelfMaxBay[shelf] = bay;
      } else {
        shelfMaxBay[shelf] = Math.max(shelfMaxBay[shelf], bay);
      }

      // Track max height per shelf
      const heightInCm = trayheight;
      if (!shelfHeights[shelf]) {
        shelfHeights[shelf] = heightInCm;
      } else {
        shelfHeights[shelf] = Math.max(shelfHeights[shelf], heightInCm);
      }

      // Track number of products per shelf+bay
      if (!shelfProductCounts[shelfBayKey]) {
        shelfProductCounts[shelfBayKey] = 0;
      }
      shelfProductCounts[shelfBayKey]++;
    });

    // Build shelf map with all bays up to max
    Object.keys(shelfMaxBay).forEach((shelf) => {
      const maxBay = shelfMaxBay[shelf];
      const height = shelfHeights[shelf];

      for (let bay = 1; bay <= maxBay; bay++) {
        const key = `${shelf}-${bay}`;
        const productCount = shelfProductCounts[key] || 0;
        const totalPadding = productCount * 2;

        const shelfwidth = products.find(
          (p) => p.shelf === parseInt(shelf) && p.bay === bay
        )?.shelfwidth ?? 133; // fallback shelfwidth

        if (!shelfMap[shelf][bay]) {
          shelfMap[shelf][bay] = {};
        }

        shelfMap[shelf][bay].width = shelfwidth * 2;
        shelfMap[shelf][bay].height = height * 2;
      }
    });

    return shelfMap;
  };




  // Convert grouped map to structured SHELVES array
  const buildShelvesFromMap = (shelfMap) => {
    const shelves = [];

    const shelfNumbers = Object.keys(shelfMap).map(Number).sort((a, b) => a - b);

    shelfNumbers.forEach((shelfNo) => {
      const bays = shelfMap[shelfNo];
      const bayNumbers = Object.keys(bays).map(Number).sort((a, b) => a - b);

      const subShelves = bayNumbers.map((bayNo) => ({
        height: bays[bayNo].height,
        width: bays[bayNo].width,
      }));

      const totalWidth = subShelves.reduce((sum, bay) => sum + bay.width, 0);
      const maxHeight = Math.max(...subShelves.map((b) => b.height));

      shelves.push({
        height: maxHeight,
        width: totalWidth,
        subShelves,
      });
    });

    return shelves;
  };
  const buildShelvesFromApi = async () => {
    try {
      const response = await axios.get("http://localhost:5000/planogramData/scenario%20N3ADAA");
      const products = response.data;
      const shelfMap = groupProductsByShelfAndBay(products);
      const dynamicShelves = buildShelvesFromMap(shelfMap);
      console.log(dynamicShelves)
      setShelves(dynamicShelves)
      setApiProducts(products);
    } catch (error) {
      console.error("Failed to fetch and build shelves:", error);
      return [];
    }
  };

  useEffect(() => {
    buildShelvesFromApi()
  }, [])

  const [unplacedItems, setUnplacedItems] = useState(initialItems);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('98%');

  // Function to create empty spaces for a shelf
  const createEmptySpaces = (shelfIdx, subShelfIdx, availableWidth) => {
    const totalSpaceWidth = EMPTY_SPACE_WIDTH + EMPTY_SPACE_MARGIN;
    const numEmptySpaces = Math.floor(availableWidth / totalSpaceWidth);

    if (numEmptySpaces <= 0) return [];

    const remainingSpace = availableWidth - (numEmptySpaces * totalSpaceWidth);
    const spaces = [];

    // Create standard empty spaces
    for (let i = 0; i < numEmptySpaces - 1; i++) {
      spaces.push({
        id: `empty-${shelfIdx}-${subShelfIdx}-${Date.now()}-${i}`,
        width: EMPTY_SPACE_WIDTH,
        height: 0,
        bgColor: '#f0f0f0',
        isEmpty: true
      });
    }

    // Add the last space with remaining width
    if (numEmptySpaces > 0) {
      spaces.push({
        id: `empty-${shelfIdx}-${subShelfIdx}-${Date.now()}-${numEmptySpaces - 1}`,
        width: EMPTY_SPACE_WIDTH + remainingSpace,
        height: 0,
        bgColor: '#f0f0f0',
        isEmpty: true
      });
    }

    return spaces;
  };

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

    // Create new arrays to avoid mutating state directly
    const newShelfLines = shelfLines.map(shelf => shelf.map(subShelf => [...subShelf]));
    const newUnplacedItems = [...unplacedItems];

    // Helper function to create an empty space
    const createEmptySpace = (shelfIdx, subShelfIdx) => ({
      id: `empty-${shelfIdx}-${subShelfIdx}-${Date.now()}`,
      width: EMPTY_SPACE_WIDTH,
      height: 0,
      bgColor: '#f0f0f0',
      isEmpty: true
    });

    const isWithinShelfWidth = (shelfIdx, subShelfIdx, position, itemWidth, source) => {
      const shelfRow = shelfLines[shelfIdx][subShelfIdx];
      let availableWidth = 0;
      let currentIndex = position;

      while (currentIndex < shelfRow.length && availableWidth < itemWidth) {
        const slot = shelfRow[currentIndex];

        const isSameItemBeingMoved =
          source.droppableId === `shelf-line-${shelfIdx}-${subShelfIdx}` &&
          currentIndex === source.index;

        if (isSameItemBeingMoved) {
          availableWidth += itemWidth;
        } else if (slot?.isEmpty) {
          availableWidth += slot.width;
        } else {
          break;
        }
        currentIndex++;
      }

      return availableWidth >= itemWidth;
    };




    // Helper function to check if we can place an item at a position
    const canPlaceItem = (shelf, item, position, shelfIdx, subShelfIdx) => {
      // Check if item would fit within shelf width
      if (!isWithinShelfWidth(shelfIdx, subShelfIdx, position, item.width, source)) {
        return false;
      }

      // If moving the same item to the same position, allow it
      const isMovingSameItem = source.droppableId.startsWith('shelf-line-') &&
        destination.droppableId.startsWith('shelf-line-') &&
        source.index === position;

      if (isMovingSameItem) {
        return true;
      }

      for (let i = position; i < position + item.width; i++) {
        if (i >= shelf.length) return false; // Out of bounds

        const currentItem = shelf[i];
        if (currentItem && !currentItem.isEmpty) {
          return false; // Would overlap with non-empty item
        }
      }
      return true;
    };

    // Handle drag from inventory to shelf
    if (source.droppableId === 'items' && destination.droppableId.startsWith('shelf-line-')) {
      const [shelfIdx, subShelfIdx] = destination.droppableId.replace('shelf-line-', '').split('-').map(Number);
      const destShelf = newShelfLines[shelfIdx][subShelfIdx];

      if (!isWithinShelfWidth(shelfIdx, subShelfIdx, destination.index, item.width, source)) {
        alert(`❌ Cannot place '${item.name}' here - would exceed shelf width.`);
        return;
      }

      let totalWidth = 0;
      let endIndex = destination.index;

      while (endIndex < destShelf.length && totalWidth < item.width) {
        const slot = destShelf[endIndex];

        // Stop if we hit a non-empty item that isn't the one being moved (for safety)
        if (!slot?.isEmpty) break;

        totalWidth += slot.width;
        endIndex++;
      }

      // If we didn't collect enough space, cancel placement
      if (totalWidth < item.width) {
        alert(`❌ Not enough consecutive empty space for '${item.name}'`);
        return;
      }

      // Remove all consumed empty slots and insert item
      destShelf.splice(destination.index, endIndex - destination.index, item);

      // Add back leftover space if item didn't use all the empty width
      const leftover = totalWidth - item.width;
      if (leftover > 0) {
        destShelf.splice(destination.index + 1, 0, {
          id: `empty-${shelfIdx}-${subShelfIdx}-${Date.now()}`,
          width: leftover,
          height: 0,
          bgColor: '#f0f0f0',
          isEmpty: true,
        });
      }

      // Remove from inventory
      newUnplacedItems.splice(source.index, 1);
    }

    // Handle drag from shelf to inventory
    else if (source.droppableId.startsWith('shelf-line-') && destination.droppableId === 'items') {
      const [shelfIdx, subShelfIdx] = source.droppableId.replace('shelf-line-', '').split('-').map(Number);
      const sourceShelf = newShelfLines[shelfIdx][subShelfIdx];

      // Remove the item
      const removedItem = sourceShelf.splice(source.index, 1)[0];

      const emptySpaces = [];
      let remainingWidth = removedItem.width;
      const defaultHeight = 0;

      while (remainingWidth > 0) {
        const thisWidth = Math.min(remainingWidth, EMPTY_SPACE_WIDTH + EMPTY_SPACE_MARGIN - 2);
        emptySpaces.push({
          id: `empty-${shelfIdx}-${subShelfIdx}-${Date.now()}-${Math.random()}`, // Ensure uniqueness
          width: thisWidth,
          height: defaultHeight,
          bgColor: '#f0f0f0',
          isEmpty: true,
        });
        remainingWidth -= thisWidth;
      }

      // Insert all empty spaces where the item was
      sourceShelf.splice(source.index, 0, ...emptySpaces);

      // Add item back to unplacedItems
      newUnplacedItems.splice(destination.index, 0, removedItem);
    }

    // Handle moving within inventory
    else if (source.droppableId === 'items' && destination.droppableId === 'items') {
      const [moved] = newUnplacedItems.splice(source.index, 1);
      newUnplacedItems.splice(destination.index, 0, moved);
    }
    // Handle moving within or between shelves
    else if (
      source.droppableId.startsWith("shelf-line-") &&
      destination.droppableId.startsWith("shelf-line-")
    ) {
      const [srcShelfIdx, srcSubShelfIdx] = source.droppableId.replace("shelf-line-", "").split("-").map(Number);
      const [destShelfIdx, destSubShelfIdx] = destination.droppableId.replace("shelf-line-", "").split("-").map(Number);

      const sourceShelf = newShelfLines[srcShelfIdx][srcSubShelfIdx];
      const destShelf = newShelfLines[destShelfIdx][destSubShelfIdx];

      const isSamePosition =
        source.index === destination.index &&
        srcShelfIdx === destShelfIdx &&
        srcSubShelfIdx === destSubShelfIdx;

      if (isSamePosition) return;

      // 🔁 1. Remove item from source
      const [removedItem] = sourceShelf.splice(source.index, 1);

      // 🔁 2. Add empty space in source
      let remainingWidth = removedItem.width;
      const emptySpaces = [];
      while (remainingWidth > 0) {
        const thisWidth = Math.min(remainingWidth, EMPTY_SPACE_WIDTH + EMPTY_SPACE_MARGIN - 2);
        emptySpaces.push({
          id: `empty-${srcShelfIdx}-${srcSubShelfIdx}-${Date.now()}-${Math.random()}`,
          width: thisWidth,
          height: 0,
          bgColor: "#f0f0f0",
          isEmpty: true,
        });
        remainingWidth -= thisWidth;
      }
      sourceShelf.splice(source.index, 0, ...emptySpaces);

      // 🔁 3. Replace multiple empty slots in dest with item
      let totalWidth = 0;
      let endIndex = destination.index;

      while (endIndex < destShelf.length && totalWidth < removedItem.width) {
        const cell = destShelf[endIndex];
        if (!cell?.isEmpty) break;
        totalWidth += cell.width;
        endIndex++;
      }

      if (totalWidth < removedItem.width) {
        alert(`❌ Not enough space to place '${removedItem.name}'.`);
        return;
      }

      // Remove the consumed empty slots
      destShelf.splice(destination.index, endIndex - destination.index, removedItem);

      // Add leftover empty space (if consumed more than item width)
      const leftover = totalWidth - removedItem.width;
      if (leftover > 0) {
        destShelf.splice(destination.index + 1, 0, {
          id: `empty-${destShelfIdx}-${destSubShelfIdx}-${Date.now()}-${Math.random()}`,
          width: leftover,
          height: 0,
          bgColor: "#f0f0f0",
          isEmpty: true,
        });
      }
    }


    // Update state with new arrays
    setShelfLines(newShelfLines);
    setUnplacedItems(newUnplacedItems);
  };

  // Function to generate payload with positions
  const generatePayload = () => {
    const payload = {
      shelves: shelfLines.map((shelfLine, shelfIdx) => ({
        shelfId: `shelf-${shelfIdx + 1}`,
        name: SHELVES[shelfIdx].name || `Shelf ${shelfIdx + 1}`,
        subShelves: shelfLine.map((subShelf, subShelfIdx) => {
          // Calculate positions for non-empty items
          const items = subShelf.reduce((acc, item, index) => {
            if (!item.isEmpty) {
              // Calculate x position based on index and item widths
              let xPosition = 0;
              for (let i = 0; i < index; i++) {
                xPosition += subShelf[i].width + EMPTY_SPACE_MARGIN;
              }

              acc.push({
                id: item.id,
                name: item.name,
                position: {
                  x: xPosition / 2,
                  y: 0, // Since items are in a single row, y is always 0
                  width: item.width * 5,
                  height: item.height * 5
                },
                metadata: {
                  brand: item.brand,
                  price: item.price,
                  description: item.description
                }
              });
            }
            return acc;
          }, []);

          return {
            subShelfId: `subshelf-${shelfIdx + 1}-${subShelfIdx + 1}`,
            width: SHELVES[shelfIdx].subShelves[subShelfIdx].width,
            height: SHELVES[shelfIdx].subShelves[subShelfIdx].height,
            items: items
          };
        })
      }))
    };

    console.log('Planogram Payload:', JSON.stringify(payload, null, 2));
    return payload;
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{
        padding: '16px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px', color: '#2c3e50' }}>Planogram Editor</h1>
        <button
          onClick={generatePayload}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Download size={16} />
          Export Planogram
        </button>
      </div>

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
                setSelectedProduct={setSelectedProduct}
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
                marginBottom: '20px',
                border: '1px solid #e0e0e0',
                overflow: 'hidden'
              }}>
                {selectedProduct.image_url ? (
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '48px' }}>📦</div>
                )}
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
                    {selectedProduct.width * 5} {selectedProduct.dimensionUom}
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
                    {selectedProduct.height * 5} {selectedProduct.dimensionUom}
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '4px' }}>
                    Facings
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                    {selectedProduct.total_facings} ({selectedProduct.facings_wide}×{selectedProduct.facings_high})
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '4px' }}>
                    Linear
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                    {selectedProduct.linear} cm
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
                  Product Details
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#2c3e50' }}>
                  <div>ID: {selectedProduct.id}</div>
                  <div>TPNB: {selectedProduct.tpnb}</div>
                  <div>GTIN: {selectedProduct.gtin}</div>
                  <div>Orientation: {selectedProduct.orientation}°</div>
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