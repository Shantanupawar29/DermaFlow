import React from 'react';
import '@google/model-viewer'; // This initializes the library

const ProductViewer3D = ({ modelPath, posterUrl }) => {
  return (
    <div className="w-full h-[500px] bg-[#FDFCFB] rounded-[3rem] overflow-hidden shadow-inner relative">
      <model-viewer
        src={modelPath}
        poster={posterUrl}
        alt="DermaFlow 3D Product"
        auto-rotate
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        touch-action="pan-y"
        style={{ width: '100%', height: '100%', outline: 'none' }}
      >
        {/* The "View in AR" button will only show on mobile devices */}
        <button slot="ar-button" className="absolute bottom-4 right-4 bg-white border border-gray-200 p-3 rounded-xl shadow-lg text-xs font-bold uppercase tracking-widest">
          👋 View in your Room
        </button>
      </model-viewer>
    </div>
  );
};

export default ProductViewer3D;