import React, { useEffect } from 'react';

const ModelViewer = ({ modelPath, className = "" }) => {
  useEffect(() => {
    // Only import the library if we are in the browser and it's not already loaded
    if (typeof window !== 'undefined' && !customElements.get('model-viewer')) {
      import('@google/model-viewer').catch(err => {
        console.error("Failed to load model-viewer library", err);
      });
    }
  }, []);

  return (
    <div className={`w-full h-full relative ${className}`} style={{ minHeight: '400px' }}>
      <model-viewer
        src={modelPath}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        exposure="1.2"
        environment-image="neutral"
        style={{ width: '100%', height: '100%', backgroundColor: '#fdfcfb' }}
      >
        <button slot="ar-button" style={{
          backgroundColor: '#4A0E2E',
          borderRadius: '8px',
          border: 'none',
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          padding: '10px 16px',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          👋 VIEW IN YOUR ROOM
        </button>
      </model-viewer>
    </div>
  );
};

export default ModelViewer;