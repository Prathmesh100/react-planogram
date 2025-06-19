import React, { useState, useRef, useEffect } from 'react';

const ZoomableContainer = ({ children }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Mouse wheel zoom
  const handleWheel = (e) => {
    if (!e.ctrlKey) return; // Only zoom when ctrl+scroll

    e.preventDefault();
    const zoomIntensity = 0.1;
    let newScale = scale - e.deltaY * zoomIntensity * 0.01;
    newScale = Math.min(Math.max(0.4, newScale), 2.5);
    setScale(newScale);
  };

  // Pan start
  const handleMouseDown = (e) => {
    if (e.button !== 1) return; // Middle click only
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  // Pan move
  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setTranslate((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  // Pan stop
  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    node.addEventListener('wheel', handleWheel, { passive: false });
    node.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      node.removeEventListener('wheel', handleWheel);
      node.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [scale]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        cursor: isDragging.current ? 'grabbing' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          minWidth: '100%',
          minHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ZoomableContainer;
