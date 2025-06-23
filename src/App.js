import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Search, Share, Download, Settings, ChevronLeft, ChevronRight, Eye, MoreVertical, Maximize2, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { toast } from 'react-toastify';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import PlanogramGrid from './components/PlanogramGrid';
import ProductInventory from './components/ProductInventory';
import ItemWithTooltip from './components/ItemWithTooltip';
import RightSideBar from "./pages/Planogram/RightSideBar";
import FullscreenView from './components/FullscreenView';
import { initialItems } from "./utils/initialItems";
import { buildShelvesFromApi } from "./utils/apiUtils";
import FilterPanel from './components/FilterPanel';
import { FilterProvider, useFilter } from './components/FilterContext';
import FilterListIcon from '@mui/icons-material/FilterList';
import ZoomControls from './components/ZoomControls';
import LeftSideBar from "./pages/Planogram/LeftSideBar";
import { onDragEnd as onDragEndUtil, generatePayload as generatePayloadUtil } from './utils/planogramFunctions';

const EMPTY_SPACE_WIDTH = 20; 

function AppContent() {
  const [filterOpen, setFilterOpen] = useState(false);
  const { filters, setFilters, options, setOptions, resetFilters } = useFilter();
  const [SHELVES, setShelves] = useState([])
  const [apiProducts, setApiProducts] = useState();
  const [shelfLines, setShelfLines] = useState([]);
  const [zoomState, setZoomState] = useState({ oldValue: 1, newValue: 1 });
  const [unplacedItems, setUnplacedItems] = useState(initialItems);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(true);

  // Update shelfLines whenever api changes
  useEffect(() => {
    if (SHELVES.length > 0 && apiProducts.length > 0) {
      const zoomFactor = zoomState.newValue;

      const newShelfLines = SHELVES.map((shelf, shelfIdx) =>
        shelf.subShelves.map((subShelf, subShelfIdx) => {
          const shelfWidth = subShelf.width * zoomFactor;

          const productsForShelf = apiProducts.filter(
            (product) =>
              product.shelf - 1 === shelfIdx &&
              product.bay - 1 === subShelfIdx
          );

          productsForShelf.sort((a, b) => a.position - b.position);

          const shelfLine = [];
          let cursor = 0;

          productsForShelf.forEach((product) => {
            const { product_details, position, facings_wide = 1 } = product;

            const rawWidth = product_details?.width ?? 50;
            const rawHeight = product_details?.height ?? 50;

            const unitWidth = (rawWidth / 5) * zoomFactor;
            const height = (rawHeight / 5) * zoomFactor;

            const scaledPosition = Math.min((position * 2) % product.shelfwidth, product.shelfwidth) * zoomFactor;

            // Insert empty space if needed
            if (scaledPosition > cursor) {
              shelfLine.push({
                id: `empty-${shelfIdx}-${subShelfIdx}-${cursor}`,
                width: scaledPosition - cursor,
                height: 0,
                bgColor: '#f0f0f0',
                isEmpty: true,
                xPosition: cursor / 2,
              });
              cursor = scaledPosition;
            }

            // Add multiple horizontal facings of the product
            for (let i = 0; i < facings_wide; i++) {
              shelfLine.push({
                ...product_details,
                id: `${product.product_id}_${i}`,
                product_id: product.product_id,
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
                linear: product.linear,
                xPosition: cursor / 2,
              });

              cursor += unitWidth;
            }
          });

          const remainingWidth = shelfWidth - cursor;

          // Fill till end of shelf with fixed-width empty blocks (20px max)
          while (cursor < shelfWidth) {
            const remaining = shelfWidth - cursor;
            const blockWidth = Math.min(20 * zoomFactor, remaining);

            shelfLine.push({
              id: `empty-${shelfIdx}-${subShelfIdx}-${cursor}-end`,
              width: blockWidth,
              height: 0,
              bgColor: '#f0f0f0',
              isEmpty: true,
              xPosition: cursor / 2,
            });

            cursor += blockWidth;
          }

          return shelfLine;
        })
      );
      console.log('Updated shelfLines:', newShelfLines);

      setShelfLines(newShelfLines);
    }
  }, [apiProducts]);


  useEffect(() => {
    const fetchData = async () => {
      const { dynamicShelves, products } = await buildShelvesFromApi();
      setShelves(dynamicShelves);
      setApiProducts(products);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const scaledShelves = SHELVES.map((shelf) => {
      const scaledSubShelves = shelf.subShelves?.map((sub) => ({
        ...sub,
        width: (sub.width / zoomState.oldValue) * zoomState.newValue,
        height: (sub.height / zoomState.oldValue) * zoomState.newValue,
      })) || [];

      return {
        ...shelf,
        width: (shelf.width / zoomState.oldValue) * zoomState.newValue,
        height: (shelf.height / zoomState.oldValue) * zoomState.newValue,
        subShelves: scaledSubShelves,
      };
    });

    setShelves(scaledShelves);
  }, [zoomState]);

  useEffect(() => {
    const scaledShelfLines = shelfLines.map((shelfLine) => {
      return shelfLine.map((subShelf) => {
        return subShelf.map((item) => {
          if (item.isEmpty) return item;
          return {
            ...item,
            width: (item.width / zoomState.oldValue) * zoomState.newValue,
            height: (item.height / zoomState.oldValue) * zoomState.newValue,
            xPosition: (item.xPosition / zoomState.oldValue) * zoomState.newValue,
          };
        });
      });
    });
    setShelfLines(scaledShelfLines);
  }, [zoomState])

  // Add effect to populate filter options from apiProducts
  useEffect(() => {
    if (apiProducts && apiProducts.length > 0) {
      const subCategories = Array.from(new Set(apiProducts.map(p => p.product_details?.['tags.subgroup']).filter(Boolean)));
      const brands = Array.from(new Set(apiProducts.map(p => p.product_details?.['tags.brand']).filter(Boolean)));
      const priceTiers = Array.from(new Set(apiProducts.map(p => p.product_details?.['tags.price_tier']).filter(Boolean)));
      setOptions({ subCategories, brands, priceTiers });
    }
  }, [apiProducts, setOptions]);

  // Filtered products logic
  const filteredProducts = React.useMemo(() => {
    if (!apiProducts) return [];
    return apiProducts.filter(product => {
      const { product_details } = product;
      const subCategory = product_details?.['tags.subgroup'];
      const brand = product_details?.['tags.brand'];
      const priceTier = product_details?.['tags.price_tier'];
      const subCatMatch = filters.subCategories.length === 0 || filters.subCategories.includes(subCategory);
      const brandMatch = filters.brands.length === 0 || filters.brands.includes(brand);
      const priceTierMatch = filters.priceTiers.length === 0 || filters.priceTiers.includes(priceTier);
      return subCatMatch && brandMatch && priceTierMatch;
    });
  }, [apiProducts, filters]);




  // Compute dimmedProductIds: all product item ids in shelfLines that are not in filteredProducts
  const filteredProductIds = React.useMemo(() => new Set(filteredProducts.map(p => p.product_id)), [filteredProducts]);
  const dimmedProductIds = React.useMemo(() => {
    if (!shelfLines || shelfLines.length === 0) return [];
    // Flatten shelfLines for faster iteration
    return shelfLines.flat(2)
      .filter(item => !item.isEmpty && item.id && item.product_id && !filteredProductIds.has(item.product_id))
      .map(item => item.id);
  }, [shelfLines, filteredProductIds]);

  // Refactored onDragEnd
  const onDragEnd = (result) => {
    onDragEndUtil({
      result,
      shelfLines,
      setShelfLines,
      unplacedItems,
      setUnplacedItems,
      EMPTY_SPACE_WIDTH,
    });
  };

  const generatePayload = () => {
    return generatePayloadUtil({ shelfLines, SHELVES, zoomState });
  };

  return (
    <Box sx={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Planogram Editor
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Download size={16} />}
              onClick={generatePayload}
              sx={{ backgroundColor: '#05AF97' }}
            >
              Export Planogram
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterOpen(true)}
              sx={{ color: '#05AF97', borderColor: '#05AF97' }}
            >
              Filter
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', width: '100%', gap: 2 }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Box sx={{ flex: 1, display: 'flex' }}>
            {/* Left Sidebar - Products */}
            <LeftSideBar unplacedItems={unplacedItems}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
            />

            {/* Center - Planogram Grid */}
            <Box sx={{ flex: 1, bgcolor: '#f8f9fa', p: 2.5, overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <PlanogramGrid
                shelves={SHELVES}
                shelfLines={shelfLines}
                ItemWithTooltip={ItemWithTooltip}
                setSelectedProduct={setSelectedProduct}
                isViewOnly={isFullscreen}
                dimmedProductIds={dimmedProductIds}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <ZoomControls
                  onZoomIn={() => setZoomState((prev) => ({ oldValue: prev.newValue, newValue: prev.newValue + 0.1 }))}
                  onZoomOut={() => setZoomState((prev) => ({ oldValue: prev.newValue, newValue: prev.newValue - 0.1 }))}
                  onReset={() => setZoomState((prev) => ({ oldValue: prev.newValue, newValue: 1 }))}
                  onFullscreen={() => setIsFullscreen(true)}
                  zoomValue={zoomState.newValue}
                />
              </Box>
            </Box>
          </Box>
        </DragDropContext>

        {/* Right Sidebar - Product Details */}
        <RightSideBar selectedProduct={selectedProduct} isViewOnly={isFullscreen} />
      </Box>

      {/* Fullscreen View */}
      {isFullscreen && (
        <FullscreenView
          shelves={SHELVES}
          shelfLines={shelfLines}
          ItemWithTooltip={ItemWithTooltip}
          setSelectedProduct={setSelectedProduct}
          onClose={() => setIsFullscreen(false)}
          dimmedProductIds={dimmedProductIds}
          setFilterOpen={setFilterOpen}
        />
      )}

      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        options={options}
        onReset={resetFilters}
      />
    </Box>
  );
}

function App() {
  return (
    <FilterProvider>
      <AppContent />
    </FilterProvider>
  );
}

export default App;