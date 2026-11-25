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
  
  // Console State moved here
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);

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
              <main className="main-container" style={{ maxWidth: '1600px' }}>
                <Dashboard detectionData={detectionData} />
                
                {/* Flex layout for side-by-side columns */}
                <div className="detection-section" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  
                  {/* LEFT COLUMN: Camera */}
                  <div style={{ flex: '1 1 50%', minWidth: '300px' }}>
                    <CameraFeed 
                      onDetectionComplete={handleDetectionComplete} 
                      showConsole={showConsole}
                      setShowConsole={setShowConsole}
                      setConsoleLogs={setConsoleLogs}
                    />
                  </div>

                  {/* RIGHT COLUMN: Results + Console */}
                  <div style={{ flex: '1 1 45%', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <DetectionResults detectionData={detectionData} />
                    
                    {/* The Console Display */}
                    {showConsole && (
                      <div style={{ 
                        background: '#1e1e1e', 
                        borderRadius: '8px', 
                        padding: '15px', 
                        fontFamily: 'monospace', 
                        fontSize: '13px', 
                        color: '#4caf50', 
                        minHeight: '350px',
                        maxHeight: '450px',
                        overflowY: 'auto',
                        textAlign: 'left',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                        <div style={{ color: '#888', marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                          --- AI Workflow Console ---
                        </div>
                        {consoleLogs.length === 0 ? (
                          <div style={{ color: '#555' }}>Waiting for image upload...</div>
                        ) : (
                          consoleLogs.map((log, index) => (
                            <div key={index} style={{ marginBottom: '5px', color: log.includes('[ERROR]') ? '#f44336' : log.includes('[RECOMMENDATION]') ? '#ff9800' : '#4caf50' }}>
                              {log}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </main>
              <footer className="footer">
                <p>Mango Leaf Detection System | College Project</p>
              </footer>
            </div>
          </div>
        } />
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