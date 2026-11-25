import React, { useState, useEffect } from 'react';
import {
  FaBug,
  FaClock,
  FaChartLine,
  FaLeaf,
  FaHeartbeat,
  FaFlask,
  FaExclamationTriangle
} from 'react-icons/fa';
import '../styles/Dashboard.css';

const Dashboard = ({ detectionData }) => {
  const [totalDetections, setTotalDetections] = useState(0);
  const [diseaseDetectedCount, setDiseaseDetectedCount] = useState(0);
  const [healthyCount, setHealthyCount] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [lastDetection, setLastDetection] = useState(null);

  useEffect(() => {
    if (detectionData && detectionData.success) {
      const hasDisease = detectionData.summary.has_disease;
      const confidence = parseFloat(detectionData.summary.confidence);

      setTotalDetections(prev => prev + 1);

      if (hasDisease) {
        setDiseaseDetectedCount(prev => prev + 1);
      } else {
        setHealthyCount(prev => prev + 1);
      }

      setAvgConfidence(confidence);
      setLastDetection(new Date());
    }
  }, [detectionData]);

  const stats = [
    {
      label: 'Total Scans',
      value: totalDetections,
      icon: FaFlask,
      color: '#2196F3',
      suffix: ''
    },
    {
      label: 'Diseased',
      value: diseaseDetectedCount,
      icon: FaBug,
      color: '#F44336',
      suffix: ''
    },
    {
      label: 'Healthy',
      value: healthyCount,
      icon: FaLeaf,
      color: '#4CAF50',
      suffix: ''
    },
    {
      label: 'Confidence',
      value: avgConfidence.toFixed(1),
      icon: FaChartLine,
      color: '#9C27B0',
      suffix: '%'
    }
  ];

  const formatTime = (date) => {
    if (!date) return 'No scans yet';
    return date.toLocaleTimeString();
  };

  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <h2>Scan mango leaves to spot possible signs of Anthracnose.</h2>

        <div className="last-update">
          <FaClock /> Last scan: {formatTime(lastDetection)}
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div className="stat-item" key={index}>

            <div
              className="stat-icon-wrapper"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              <stat.icon style={{ color: stat.color }} />
            </div>

            <div className="stat-info">
              <div className="stat-value">
                {stat.value}
                {stat.suffix && (
                  <span className="stat-suffix">
                    {stat.suffix}
                  </span>
                )}
              </div>

              <div className="stat-label">
                {stat.label}
              </div>
            </div>

          </div>
        ))}
      </div>

      {detectionData && detectionData.success && (
        <div className="latest-detection">

          <h4>
            <FaHeartbeat /> Latest Analysis
          </h4>

          <p className="detection-status">
            {detectionData.summary.has_disease
              ? '⚠️ Disease Detected'
              : '✅ Healthy Leaf'}
          </p>

          <p className="detection-confidence">
            Confidence: {detectionData.summary.confidence}
          </p>

          {detectionData.summary.symptoms_detected?.length > 0 && (
            <p className="detection-symptoms">
              Result: {detectionData.summary.symptoms_detected.join(', ')}
            </p>
          )}

        </div>
      )}

    </div>
  );
};

export default Dashboard;