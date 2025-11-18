
import React, { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, alt }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Ensure we have at least one image
  const displayImages = images.length > 0 ? images : ['https://via.placeholder.com/600'];

  return (
    <div className="w-full relative bg-gray-100 dark:bg-gray-800">
      {/* Main Image */}
      <div className="aspect-square w-full relative overflow-hidden">
         <img 
            src={displayImages[selectedIndex]} 
            alt={`${alt} - View ${selectedIndex + 1}`} 
            className="w-full h-full object-cover transition-opacity duration-300"
         />
         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-100 dark:from-[#0e1621] to-transparent h-24 pointer-events-none transition-colors"></div>
      </div>

      {/* Thumbnails - Only show if more than 1 image */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto custom-scrollbar z-10">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                 e.stopPropagation();
                 setSelectedIndex(idx);
              }}
              className={`w-12 h-12 md:w-16 md:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === idx ? 'border-blue-500 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt="thumb" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
