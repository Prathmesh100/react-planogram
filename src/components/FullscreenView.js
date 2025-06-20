import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Maximize2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { DragDropContext } from '@hello-pangea/dnd';
import PlanogramGrid from './PlanogramGrid';
import { buildShelvesFromApi, groupProductsByShelfAndBay } from '../utils/apiUtils';

const FullscreenView = ({ shelves, shelfLines, ItemWithTooltip, setSelectedProduct, onClose }) => {
  const SHELF_GAP = 32;
  const CONTAINER_PADDING = 20;
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [focusedBay, setFocusedBay] = useState(null);
  const [shouldCenter, setShouldCenter] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const lastTouchX = useRef(0);
  const initialScaleRef = useRef(1);

  // Calculate initial scale based on number of bays and shelves
  const calculateInitialScale = () => {
    if (!containerRef.current || !contentRef.current) return 1;

    const container = containerRef.current;
    const content = contentRef.current;

    const containerWidth = container.clientWidth - (2 * CONTAINER_PADDING);
    const containerHeight = container.clientHeight - (2 * CONTAINER_PADDING);
    const contentWidth = content.scrollWidth;
    const contentHeight = content.scrollHeight;

    // Calculate scale based on both dimensions
    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;

    // Use the smaller scale to ensure content fits both dimensions
    return Math.min(scaleX, scaleY, 1);
  };

  // Center the content initially
  const centerContent = () => {
    if (!containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const content = contentRef.current;

    const containerWidth = container.clientWidth - (2 * CONTAINER_PADDING);
    const containerHeight = container.clientHeight - (2 * CONTAINER_PADDING);
    const contentWidth = content.scrollWidth * scale;
    const contentHeight = content.scrollHeight * scale;

    const x = (containerWidth - contentWidth) / 2;
    const y = (containerHeight - contentHeight) / 2;

    setPosition({ x, y });
  };

  useEffect(() => {
    // Wait for refs to be available
    if (containerRef.current && contentRef.current) {
      const newScale = calculateInitialScale();
      setScale(newScale);
      initialScaleRef.current = newScale;
      // Center content after scale is set
      // setTimeout(centerContent, 0);
      handleReset()
    }
  }, [shelves, shelfLines]);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      lastTouchX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastTouchX.current;
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y
      }));
      lastTouchX.current = touch.clientX;
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 1) { // Middle mouse button
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 4));
    
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.4));
  };

  const handleReset = () => {
    const newScale = calculateInitialScale();
    setScale(newScale);
    setShouldCenter(true);
    setFocusedBay(null);
  };

  const handleBayClick = (shelfIdx, bayIndex) => {
    // If already focused on this bay, reset the view
    if (focusedBay?.shelfIndex === shelfIdx && focusedBay?.bayIndex === bayIndex) {
      handleReset();
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Calculate the bay's position relative to the content
    let bayX = CONTAINER_PADDING; // Start with container padding
    let bayY = CONTAINER_PADDING;

    // Add widths of previous bays in the same shelf
    for (let i = 0; i < bayIndex; i++) {
      bayX += shelves[shelfIdx].subShelves[i].width;
    }

    // Add heights of previous shelves
    for (let i = 0; i < shelfIdx; i++) {
      bayY += Math.max(...shelves[i].subShelves.map(s => s.height)) + SHELF_GAP;
    }

    // Get bay dimensions
    const bayWidth = shelves[shelfIdx].subShelves[bayIndex].width;
    const bayHeight = shelves[shelfIdx].subShelves[bayIndex].height;

    // Container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Set zoom level
    const zoomLevel = 2;
    
    // Calculate position to center the bay
    const targetX = (containerWidth / 2) - (bayX + bayWidth / 2) * zoomLevel;
    const targetY = (containerHeight / 2) - (bayY + bayHeight / 2) * zoomLevel;

    setScale(zoomLevel);
    setPosition({ x: targetX, y: targetY });
    setFocusedBay({ shelfIndex: shelfIdx, bayIndex });
  };

  const handleNavigate = (direction) => {
    const step = 100; // pixels to move
    switch (direction) {
      case 'left':
        setPosition(prev => ({ ...prev, x: prev.x + step }));
        break;
      case 'right':
        setPosition(prev => ({ ...prev, x: prev.x - step }));
        break;
      case 'up':
        setPosition(prev => ({ ...prev, y: prev.y + step }));
        break;
      case 'down':
        setPosition(prev => ({ ...prev, y: prev.y - step }));
        break;
    }
  };

  // Trackpad/touchpad swipe (wheel event) handler for panning
  const handleWheel = (e) => {
    // Only pan if zoomed in beyond initial scale
    if (scale <= initialScaleRef.current) return;
    // Prevent default scroll behavior
    e.preventDefault();
    // Use deltaX and deltaY for panning
    setPosition(prev => ({
      x: prev.x - e.deltaX,
      y: prev.y - e.deltaY
    }));
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mouseleave', handleMouseUp);
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchmove', handleTouchMove);
      // Add wheel event for trackpad/touchpad swipe
      container.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mouseleave', handleMouseUp);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [isDragging, dragStart, scale]);

  const buttonStyle = {
    padding: '8px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s'
  };

  // Add onDragEnd handler for DragDropContext
  const onDragEnd = () => {
    // In fullscreen view, we don't allow dragging
    return;
  };

  useEffect(() => {
    if (shouldCenter) {
      centerContent();
      setShouldCenter(false);
    }
  }, [scale, shouldCenter]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        color: 'white',
        padding: '0 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Maximize2 size={20} />
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '500' }}>Planogram View</h2>
        </div>
        {/* Instructions */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          color: '#666',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}>
          Click on any bay to zoom in. Click again to reset view.
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          cursor: isDragging ? 'grabbing' : 'grab',
          padding: `${CONTAINER_PADDING}px`
        }}
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <div
            ref={contentRef}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              height: '100%',
              width: 'fit-content'
            }}
          >
            <PlanogramGrid
              shelves={shelves}
              shelfLines={shelfLines}
              ItemWithTooltip={ItemWithTooltip}
              setSelectedProduct={setSelectedProduct}
              onBayClick={handleBayClick}
              focusedBay={focusedBay}
              isViewOnly={true}
            />
          </div>
        </DragDropContext>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '20px'
      }}>
        <button onClick={handleZoomIn} style={buttonStyle}>
          <ZoomIn size={20} />
        </button>
        <button onClick={handleZoomOut} style={buttonStyle}>
          <ZoomOut size={20} />
        </button>
        <button onClick={handleReset} style={buttonStyle}>
          <RotateCcw size={20} />
        </button>
        <button onClick={() => handleNavigate('left')} style={buttonStyle}>
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => handleNavigate('right')} style={buttonStyle}>
          <ChevronRight size={20} />
        </button>
        <button onClick={() => handleNavigate('up')} style={buttonStyle}>
          <ChevronUp size={20} />
        </button>
        <button onClick={() => handleNavigate('down')} style={buttonStyle}>
          <ChevronDown size={20} />
        </button>
      </div>
    </div>
  );
};

export default FullscreenView; 