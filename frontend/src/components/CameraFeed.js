import React, { useState, useEffect, useRef } from 'react';
import { FaCamera, FaUpload, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaLeaf, FaImage, FaTrashAlt } from 'react-icons/fa';
import '../styles/CameraFeed.css';

const CameraFeed = ({ onDetectionComplete }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [modelReady, setModelReady] = useState(false);
  
  // New state for camera
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (window.mangocareBrowser) {
        setModelReady(true);
        clearInterval(checkInterval);
      }
    }, 500);
    return () => clearInterval(checkInterval);
  }, []);

  // Start Camera Stream
  useEffect(() => {
    if (useCamera && videoRef.current) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } // 'environment' forces the back camera
          });
          videoRef.current.srcObject = stream;
        } catch (err) {
          setError("Could not access camera. Please check permissions.");
          console.error(err);
        }
      };
      startCamera();
    }
  }, [useCamera]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob/file
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        setSelectedImage(file);
        setImagePreview(canvas.toDataURL('image/jpeg'));
        
        // Stop the camera stream
        const stream = video.srcObject;
        if (stream) stream.getTracks().forEach(track => track.stop());
        setUseCamera(false);
      }, 'image/jpeg', 0.9);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage || !modelReady) return;

    setUploading(true);
    setUploadProgress(50);
    setError(null);

    try {
      const originalFetch = window.fetch;
      window.fetch = async (url, options) => {
        if (typeof url === 'string' && url.includes('.tflite')) {
          return originalFetch('/mangocare_classifier_float32.tflite', options);
        }
        return originalFetch(url, options);
      };

      const result = await window.mangocareBrowser.classify(selectedImage);
      window.fetch = originalFetch;

      const diseaseName = result.label;
      const confidence = (result.scores[diseaseName] * 100).toFixed(1);
      const isDiseased = diseaseName === "Anthracnose";

      const responseData = {
        success: true,
        summary: {
          has_disease: isDiseased,
          status: isDiseased ? `⚠️ ${diseaseName} Detected` : "✅ Healthy",
          confidence: `${confidence}%`,
        },
        disease: {
          name: diseaseName,
          confidence: `${confidence}%`,
          treatment: isDiseased ? "Apply fungicide and remove infected leaves." : null
        }
      };

      if (onDetectionComplete) onDetectionComplete(responseData);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 2000);

    } catch (err) {
      console.error(err);
      setError("Error: " + err.message);
      window.fetch = window.fetch.bind(window); 
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setUploadProgress(0);
    setError(null);
    setUseCamera(false);
    if (onDetectionComplete) onDetectionComplete(null);
  };

  return (
    <div className="camera-feed">
      <div className="section-header">
        <div className="header-left">
          <div className="icon-wrapper"><FaLeaf /></div>
          <h2>Mango Leaf Disease Detection</h2>
        </div>
        <div className="header-right">
          <span className="status-badge active"><FaCamera /> {modelReady ? "AI Ready" : "Loading AI..."}</span>
        </div>
      </div>

      <div className="feed-container">
        {imagePreview ? (
          <div className="image-preview-wrapper">
            <div className="image-container">
              <img src={imagePreview} alt="Selected leaf" className="preview-image" />
              {uploading && (
                <div className="detection-overlay">
                  <div className="spinner-container"><FaSpinner className="spinner" /></div>
                  <p className="overlay-title">Analyzing Mango Leaf</p>
                  <p className="overlay-subtitle">Running local WASM model...</p>
                </div>
              )}
              {error && (
                <div className="error-overlay">
                  <FaExclamationTriangle className="error-icon" />
                  <p className="error-text">{error}</p>
                </div>
              )}
            </div>
            <div className="image-actions">
              <button className="action-btn detect-btn" onClick={handleUpload} disabled={uploading || !modelReady}>
                {uploading ? <><FaSpinner className="btn-spinner" /> Analyzing...</> : <><FaCheckCircle /> Detect Disease</>}
              </button>
              <button className="action-btn reset-btn" onClick={handleReset} disabled={uploading}>
                <FaTrashAlt /> Choose Different Image
              </button>
            </div>
          </div>
        ) : useCamera ? (
          <div className="camera-stream-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '12px' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className="image-actions" style={{ justifyContent: 'center' }}>
              <button className="action-btn detect-btn" onClick={capturePhoto}>
                <FaCamera /> Capture Photo
              </button>
              <button className="action-btn reset-btn" onClick={() => setUseCamera(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-area">
            <div className="upload-content">
              <div className="upload-icon"><FaImage /></div>
              <h3>Capture or Upload Mango Leaf</h3>
              <p>Use your camera or select an image from your gallery</p>
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                <button onClick={() => setUseCamera(true)} className="upload-button" style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', cursor: 'pointer' }}>
                  <FaCamera /> Open Camera
                </button>
                <label htmlFor="image-upload" className="upload-button">
                  <FaUpload /> Upload Photo
                </label>
              </div>
             <input type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="file-input" id="image-upload" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraFeed;