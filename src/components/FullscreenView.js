import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Maximize2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import PlanogramGrid from './PlanogramGrid';

const FullscreenView = ({ shelves, shelfLines, ItemWithTooltip, setSelectedProduct, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const lastTouchX = useRef(0);

  // Calculate initial scale based on number of bays and shelves
  const calculateInitialScale = () => {
  const numBays = shelves.length;
  const numShelves = shelfLines.length;

  let scale = 1;

  // Scale based on number of bays (horizontal space)
  if (numBays <= 2) {
    scale = 1;
  } else if (numBays === 3) {
    scale = 0.95;
  } else if (numBays === 4) {
    scale = 0.9;
  } else if (numBays <= 6) {
    scale = 0.85;
  } else {
    scale = 0.8; // many bays
  }

  // Scale further based on number of shelves (vertical space)
  if (numShelves > 4 && numShelves <= 6) {
    scale *= 0.9;
  } else if (numShelves > 6) {
    scale *= 0.8;
  }

  // Clamp the scale to prevent too small or too large zoom
  return Math.max(0.6, Math.min(scale, 1));
};

  useEffect(() => {
    setScale(calculateInitialScale());
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
    setScale(calculateInitialScale());
    setPosition({ x: 0, y: 0 });
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

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mouseleave', handleMouseUp);
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchmove', handleTouchMove);

      return () => {
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mouseleave', handleMouseUp);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [isDragging, dragStart]);

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
          Close fullscreen mode to access product editing and details.
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
            justifyContent: 'center',
            transition: 'background-color 0.2s',
            ':hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }
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
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >


        {/* Controls Container */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Navigation Controls */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center'
          }}>
            {/* Up Button */}
            <button
              onClick={() => handleNavigate('up')}
              style={buttonStyle}
              title="Move Up"
            >
              <ChevronUp size={18} />
            </button>

            {/* Middle Row - Left, Reset, Right */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleNavigate('left')}
                style={buttonStyle}
                title="Move Left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleReset}
                style={buttonStyle}
                title="Reset View"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={() => handleNavigate('right')}
                style={buttonStyle}
                title="Move Right"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Down Button */}
            <button
              onClick={() => handleNavigate('down')}
              style={buttonStyle}
              title="Move Down"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Divider */}
          <div style={{
            width: '100%',
            height: '1px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            margin: '4px 0'
          }} />

          {/* Zoom Controls */}
          <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center'
          }}>
            <button
              onClick={handleZoomIn}
              style={buttonStyle}
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={handleZoomOut}
              style={buttonStyle}
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
          </div>
        </div>



        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <PlanogramGrid
              shelves={shelves}
              shelfLines={shelfLines}
              ItemWithTooltip={ItemWithTooltip}
              setSelectedProduct={setSelectedProduct}
              isViewOnly={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenView; 