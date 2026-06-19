import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Image as ImageIcon, CheckCircle, Trash2, CameraOff } from 'lucide-react';

export default function CameraCapture({ 
  onCapture, // callback: (files) => void
  singleMode = false, // if true, only allows capturing 1 photo. Otherwise, allows capturing multiple.
  preferredFacingMode = 'user', // 'user' (front) or 'environment' (rear)
  themeColor = 'var(--color-primary)'
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [streamActive, setStreamActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [facingMode, setFacingMode] = useState(preferredFacingMode);
  const [cameraLoading, setCameraLoading] = useState(false);

  // Initialize and stop camera stream
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  // Attach stream to video element when viewfinder mounts and is visible in DOM
  useEffect(() => {
    if (streamActive && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.onloadedmetadata = () => {
        video.play().catch(e => console.warn("Video play interrupted:", e));
      };
    }
  }, [streamActive, videoRef.current]);

  const startCamera = async () => {
    stopCamera();
    setCameraLoading(true);
    setErrorMsg(null);
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setStreamActive(true);
    } catch (err) {
      console.warn('Camera stream error:', err);
      setErrorMsg('Could not access camera. Using file uploader fallback.');
      setStreamActive(false);
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.warn('Capture failed: videoRef or canvasRef is null');
      return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Make canvas match video stream dimensions with fallbacks
    let width = video.videoWidth;
    let height = video.videoHeight;
    
    if (!width || !height) {
      console.warn('Video dimensions are 0. Trying track settings or client dimensions.');
      if (streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          width = settings.width;
          height = settings.height;
        }
      }
      if (!width || !height) {
        width = video.clientWidth || 640;
        height = video.clientHeight || 480;
      }
    }

    canvas.width = width;
    canvas.height = height;

    try {
      // Draw frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to Blob and then File object
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          return;
        }
        
        const filename = `snap_${Date.now()}_${capturedImages.length + 1}.jpg`;
        const file = new File([blob], filename, { type: 'image/jpeg' });

        // Create a temporary local URL for presentation
        const localUrl = URL.createObjectURL(blob);
        const newImage = { file, localUrl, id: filename };

        let updatedList = [];
        if (singleMode) {
          // Clean up previous local URL if overwriting
          if (capturedImages.length > 0) {
            URL.revokeObjectURL(capturedImages[0].localUrl);
          }
          updatedList = [newImage];
        } else {
          updatedList = [...capturedImages, newImage];
        }

        setCapturedImages(updatedList);
        onCapture(updatedList.map(item => item.file));
      }, 'image/jpeg', 0.85);
    } catch (e) {
      console.error('Failed to draw or convert canvas frame:', e);
    }
  };

  const removePhoto = (id, event) => {
    event.stopPropagation();
    const itemToRemove = capturedImages.find(img => img.id === id);
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.localUrl);
    }
    const updatedList = capturedImages.filter(img => img.id !== id);
    setCapturedImages(updatedList);
    onCapture(updatedList.map(item => item.file));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const newImages = files.map((file, idx) => {
      const localUrl = URL.createObjectURL(file);
      return {
        file,
        localUrl,
        id: `${file.name}_${Date.now()}_${idx}`
      };
    });

    let updatedList = [];
    if (singleMode) {
      // Clean up previous
      capturedImages.forEach(img => URL.revokeObjectURL(img.localUrl));
      updatedList = [newImages[0]];
    } else {
      updatedList = [...capturedImages, ...newImages];
    }

    setCapturedImages(updatedList);
    onCapture(updatedList.map(item => item.file));
  };

  return (
    <div className="camera-capture-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {streamActive ? (
        // Camera Viewfinder
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          backgroundColor: '#000',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
        }}>
          {cameraLoading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000a0', color: '#fff', zIndex: 2 }}>
              <div className="loading-spinner"></div>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />

          {/* Viewfinder overlays */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '0',
            right: '0',
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            padding: '0 16px',
            zIndex: '5'
          }}>
            <button
              type="button"
              onClick={toggleCamera}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Switch Camera"
            >
              <RefreshCw size={20} />
            </button>

            <button
              type="button"
              onClick={capturePhoto}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                border: `5px solid ${themeColor}`,
                color: themeColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                transform: 'scale(1)',
                transition: 'transform var(--transition-fast)'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Capture Photo"
            >
              <Camera size={28} />
            </button>

            <button
              type="button"
              onClick={stopCamera}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Switch to Upload"
            >
              <CameraOff size={20} />
            </button>
          </div>
        </div>
      ) : (
        // File Uploader view when stream is disabled
        <div style={{
          width: '100%',
          padding: '30px 20px',
          border: `2px dashed ${themeColor}`,
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(255,255,255,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          textAlign: 'center',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={() => document.getElementById('camera-file-input').click()}
        >
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: themeColor
          }}>
            <Upload size={24} />
          </div>
          <div>
            <p style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
              {errorMsg ? 'Camera access unavailable' : 'Select images from your device'}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              {singleMode ? 'Supports single image upload' : 'Supports multiple image selections'}
            </p>
          </div>
          {navigator.mediaDevices && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startCamera();
              }}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', width: 'auto', fontSize: '0.85rem', marginTop: '4px', gap: '6px' }}
            >
              <Camera size={16} /> Enable Web Camera
            </button>
          )}
          <input
            id="camera-file-input"
            type="file"
            accept="image/*"
            multiple={!singleMode}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Hidden canvas for video captures */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Captured Image Previews Strip */}
      {capturedImages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
            Captured Images ({capturedImages.length}):
          </span>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            overflowX: 'auto', 
            padding: '4px 0',
            scrollbarWidth: 'thin'
          }}>
            {capturedImages.map((img) => (
              <div 
                key={img.id} 
                style={{ 
                  position: 'relative', 
                  flexShrink: 0,
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: `2px solid ${themeColor}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <img 
                  src={img.localUrl} 
                  alt="Captured frame" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <button
                  type="button"
                  onClick={(e) => removePhoto(img.id, e)}
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                    color: '#fff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                  }}
                  title="Remove Image"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
