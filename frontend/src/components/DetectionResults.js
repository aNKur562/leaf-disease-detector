import React from 'react';
import {
  FaLeaf,
  FaChartBar,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import '../styles/DetectionResults.css';

const DetectionResults = ({ detectionData }) => {
  if (!detectionData || !detectionData.success) {
    return (
      <div className="detection-results">
        <div className="section-header">
          <h2><FaChartBar /> Mango Disease Results</h2>
        </div>

        <div className="no-results">
          <FaLeaf size={50} />
          <p>No disease results yet</p>
          <p className="placeholder-sub">
            Upload a mango leaf image to see the analysis
          </p>
        </div>
      </div>
    );
  }

  const { summary } = detectionData;

  const isDiseased = summary.has_disease;
  const confidence = parseFloat(summary.confidence);

  return (
    <div className="detection-results">

      <div className="section-header">
        <h2><FaChartBar /> Mango Disease Results</h2>
      </div>

      <div className="status-card">
        <div className="status-icon">
          {isDiseased ? <FaExclamationTriangle color="#f44336" /> : <FaCheckCircle color="#4caf50" />}
        </div>

        <div className="status-content">
          <h3>{summary.status}</h3>
          <p>{summary.cause}</p>
        </div>
      </div>

      <div className="results-summary" style={{ marginBottom: 0 }}>
        <div className="summary-card confidence" style={{ width: '100%' }}>
          <h3>{summary.confidence}</h3>
          <p>Confidence</p>

          <div className="confidence-bar-large">
            <div
              className="confidence-fill"
              style={{
                width: `${confidence}%`,
                backgroundColor: isDiseased ? '#f44336' : '#4caf50'
              }}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default DetectionResults;