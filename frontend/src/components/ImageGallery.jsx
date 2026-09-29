import React, { useState, useEffect } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

const ImageGallery = ({ images = [], hostelName = 'Hostel' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState({});

  const displayImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80'
  ];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // Keyboard navigation in fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsFullscreen(false);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    <div className="space-y-3">
      {/* Main Image Stage */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[16/9] md:aspect-[21/9] group shadow-card">
        {imageError[currentIndex] ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-6 text-center">
            <ImageIcon className="w-12 h-12 mb-2 stroke-1" />
            <p className="font-medium text-sm text-slate-600">Hostel Image Unavailable</p>
          </div>
        ) : (
          <img
            src={displayImages[currentIndex]}
            alt={`${hostelName} - View ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError((prev) => ({ ...prev, [currentIndex]: true }))}
          />
        )}

        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600/90 text-white backdrop-blur shadow-sm flex items-center gap-1">
            ✓ Verified Place
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900/70 text-white backdrop-blur">
            {currentIndex + 1} / {displayImages.length} Photos
          </span>
        </div>

        {/* Fullscreen Trigger */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur transition-all active:scale-90"
          title="Fullscreen preview"
          aria-label="View fullscreen gallery"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Arrows on Stage */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/50 hover:bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/50 hover:bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Bar */}
      {displayImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative rounded-xl overflow-hidden flex-shrink-0 w-20 h-14 transition-all ${
                currentIndex === idx
                  ? 'ring-2 ring-primary-600 scale-95 opacity-100'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center">
            <img
              src={displayImages[currentIndex]}
              alt={`${hostelName} fullscreen view`}
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
            />

            {displayImages.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          <p className="text-white/70 text-sm mt-4">
            {hostelName} — {currentIndex + 1} of {displayImages.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
