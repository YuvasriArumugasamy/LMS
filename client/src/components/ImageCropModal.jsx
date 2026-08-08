import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Check } from 'lucide-react';

export const ImageCropModal = ({ isOpen, onClose, imageSrc, onCropComplete }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch device drag handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.7));

  const handleApply = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Circular Clipping Path
      ctx.beginPath();
      ctx.arc(150, 150, 150, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      // Background fill
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 300, 300);

      // Render image with position and zoom scale
      const drawWidth = 300 * zoom;
      const drawHeight = (img.height / img.width) * drawWidth;
      ctx.drawImage(img, position.x, position.y, drawWidth, drawHeight);

      const croppedResultUrl = canvas.toDataURL('image/jpeg', 0.95);
      onCropComplete(croppedResultUrl);
      onClose();
    };
    img.src = imageSrc;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-enterprise shadow-2xl overflow-hidden z-10 border border-slate-200 dark:border-slate-800"
          >
            {/* Header Matching Screenshot */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Drag the image to adjust</h4>
              </div>
              <button
                type="button"
                onClick={handleApply}
                className="text-xs font-extrabold text-primary hover:text-blue-700 uppercase tracking-wider transition-colors"
              >
                Upload
              </button>
            </div>

            {/* Interactive Image Drag & Crop Area */}
            <div
              className="relative w-full h-80 bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              {/* Scalable & Draggable Image */}
              <div
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
                className="pointer-events-none"
              >
                <img src={imageSrc} alt="Adjust" className="max-w-none w-72 h-auto object-cover shadow-2xl" />
              </div>

              {/* Circular Crop Mask Masking Mask */}
              <div className="absolute inset-0 border-[40px] border-slate-950/85 pointer-events-none" />
              <div className="absolute w-60 h-60 rounded-full border-2 border-white/80 pointer-events-none shadow-[0_0_0_9999px_rgba(15,23,42,0.7)]" />

              {/* Zoom Controls (+ / -) on Right Side */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-20">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border-b border-slate-200 dark:border-slate-700 transition-colors"
                  title="Zoom In"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Zoom Out"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              {/* Green Checkmark Confirmation Button at Bottom Right */}
              <button
                type="button"
                onClick={handleApply}
                className="absolute right-5 bottom-5 w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl flex items-center justify-center z-20 transition-all hover:scale-110"
                title="Confirm & Upload"
              >
                <Check className="w-6 h-6 stroke-[3]" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
