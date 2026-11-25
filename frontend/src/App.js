import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import CameraFeed from './components/CameraFeed';
import DetectionResults from './components/DetectionResults';
import Analytics from './components/Analytics';

function App() {
  const [detectionData, setDetectionData] = useState(null);

  const handleDetectionComplete = (data) => {
    setDetectionData(data);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <Header transparent={true} />
            <Home />
          </>
        } />
        <Route path="/dashboard" element={
          <div className="app">
            <div className="content-overlay">
              <Header transparent={false} />
              <main className="main-container">
                <Dashboard detectionData={detectionData} />
                <div className="detection-section">
                  <CameraFeed onDetectionComplete={handleDetectionComplete} />
                  <DetectionResults detectionData={detectionData} />
                </div>
              </main>
              <footer className="footer">
                <p>Mango Leaf Detection System  | College Project</p>
              </footer>
            </div>
          </div>
        } />
        // In your App.js, find the Analytics route and update it:
        <Route path="/analytics" element={
          <div className="app">
            <div className="content-overlay">
              <Header transparent={false} />
              <main className="main-container">
                <Analytics detectionData={detectionData} />
              </main>
              <footer className="footer">
                <p>Mango Leaf Detection System | College Project</p>
              </footer>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;