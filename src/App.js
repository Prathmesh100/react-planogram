import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Search, Share, Download, Settings, ChevronLeft, ChevronRight, Eye, MoreVertical } from "lucide-react";
import PlanogramGrid from './components/PlanogramGrid';
import ProductInventory from './components/ProductInventory';
import ItemWithTooltip from './components/ItemWithTooltip';
import RightSideBar from "./pages/Planogram/RightSideBar";
import { initialItems } from "./utils/initialItems";
import { buildShelvesFromApi } from "./utils/apiUtils";

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

            const unitWidth = (rawWidth / 5)  ;
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

  useEffect(() => {
    const fetchData = async () => {
      const { dynamicShelves, products } = await buildShelvesFromApi();
      setShelves(dynamicShelves);
      setApiProducts(products);
    };
    fetchData();
  }, []);

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

    // Create new arrays to avoid mutating state directly
    const newShelfLines = shelfLines.map(shelf => shelf.map(subShelf => [...subShelf]));
    const newUnplacedItems = [...unplacedItems];


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
        const thisWidth = Math.min(remainingWidth, EMPTY_SPACE_WIDTH);
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

      const [removedItem] = sourceShelf.splice(source.index, 1);

      let remainingWidth = removedItem.width;
      const emptySpaces = [];
      while (remainingWidth > 0) {
        const thisWidth = Math.min(remainingWidth, EMPTY_SPACE_WIDTH);
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
            <div style={{ flex: 1, backgroundColor: '#f8f9fa', padding: '20px', overflowY: 'auto', }}>
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
        <RightSideBar selectedProduct={selectedProduct} />
      </div>
    </div>
  );
}

export default App;