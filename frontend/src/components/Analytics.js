import React, { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaLeaf,
  FaCalendar,
  FaChartBar,
  FaChartPie,
  FaArrowUp,
  FaExclamationTriangle
} from 'react-icons/fa';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

import { Bar, Pie, Line } from 'react-chartjs-2';
import '../styles/Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Analytics = ({ detectionData }) => {

  const [analyticsData, setAnalyticsData] = useState({
    totalDetections: 0,
    diseaseDetectedCount: 0,
    healthyCount: 0,
    averageConfidence: 0,
    recentDetections: [],
    diseaseFrequency: {},
    detectionHistory: []
  });

  useEffect(() => {
    if (detectionData && detectionData.success) {

      const savedData = localStorage.getItem('mangoAnalytics');

      let historicalData = savedData
        ? JSON.parse(savedData)
        : {
            totalDetections: 0,
            diseaseDetectedCount: 0,
            healthyCount: 0,
            confidenceSum: 0,
            recentDetections: [],
            diseaseFrequency: {},
            detectionHistory: []
          };

      const diseaseDetected = detectionData.summary.has_disease;
      const confidence = parseFloat(detectionData.summary.confidence);
      
      // FIX: If it's a disease, get the name from symptoms_detected. If healthy, label it "Healthy".
      const diseases = diseaseDetected 
        ? (detectionData.summary.symptoms_detected || [detectionData.disease.name])
        : ["Healthy"];

      const timestamp = new Date().toISOString();

      historicalData.totalDetections++;

      if (diseaseDetected) {
        historicalData.diseaseDetectedCount++;
      } else {
        historicalData.healthyCount++;
      }

      historicalData.confidenceSum += confidence;

      diseases.forEach(disease => {
        historicalData.diseaseFrequency[disease] =
          (historicalData.diseaseFrequency[disease] || 0) + 1;
      });

      historicalData.recentDetections.unshift({
        timestamp,
        diseaseDetected,
        confidence,
        diseases, // Now this correctly says ["Anthracnose"] or ["Healthy"]
        cause: detectionData.summary.cause
      });

      historicalData.recentDetections = historicalData.recentDetections.slice(0, 10);

      const today = new Date().toLocaleDateString();

      const existingEntry = historicalData.detectionHistory.find(
        entry => entry.date === today
      );

      if (existingEntry) {
        existingEntry.total++;
        if (diseaseDetected) {
          existingEntry.diseaseDetected++;
        } else {
          existingEntry.healthy++;
        }
      } else {
        historicalData.detectionHistory.push({
          date: today,
          total: 1,
          diseaseDetected: diseaseDetected ? 1 : 0,
          healthy: diseaseDetected ? 0 : 1
        });
      }

      historicalData.detectionHistory = historicalData.detectionHistory.slice(-30);

      localStorage.setItem('mangoAnalytics', JSON.stringify(historicalData));

      setAnalyticsData({
        totalDetections: historicalData.totalDetections,
        diseaseDetectedCount: historicalData.diseaseDetectedCount,
        healthyCount: historicalData.healthyCount,
        averageConfidence: historicalData.totalDetections > 0
            ? (historicalData.confidenceSum / historicalData.totalDetections).toFixed(1)
            : 0,
        recentDetections: historicalData.recentDetections,
        diseaseFrequency: historicalData.diseaseFrequency,
        detectionHistory: historicalData.detectionHistory
      });
    }

  }, [detectionData]);


  const clearAnalytics = () => {
    if (window.confirm('Are you sure you want to clear all analytics data?')) {
      localStorage.removeItem('mangoAnalytics');
      setAnalyticsData({
        totalDetections: 0,
        diseaseDetectedCount: 0,
        healthyCount: 0,
        averageConfidence: 0,
        recentDetections: [],
        diseaseFrequency: {},
        detectionHistory: []
      });
    }
  };


  const pieChartData =
    analyticsData.totalDetections > 0
      ? {
          labels: ['Disease Detected', 'Healthy'],
          datasets: [
            {
              data: [
                analyticsData.diseaseDetectedCount,
                analyticsData.healthyCount
              ],
              backgroundColor: ['#f44336', '#4caf50'],
              borderWidth: 0
            }
          ]
        }
      : null;


  const barChartData =
    Object.keys(analyticsData.diseaseFrequency).length > 0
      ? {
          labels: Object.keys(analyticsData.diseaseFrequency),
          datasets: [
            {
              label: 'Frequency',
              data: Object.values(analyticsData.diseaseFrequency),
              backgroundColor: ['#ff9800', '#4caf50'], // Different colors for different bars
              borderRadius: 8
            }
          ]
        }
      : null;


  const lineChartData =
    analyticsData.detectionHistory.length > 0
      ? {
          labels: analyticsData.detectionHistory.map(entry => entry.date),
          datasets: [
            {
              label: 'Disease Detected',
              data: analyticsData.detectionHistory.map(entry => entry.diseaseDetected),
              borderColor: '#f44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Healthy',
              data: analyticsData.detectionHistory.map(entry => entry.healthy),
              borderColor: '#4caf50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        }
      : null;


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 } } },
      tooltip: { enabled: true }
    }
  };


  const diseaseRate =
    analyticsData.totalDetections > 0
      ? ((analyticsData.diseaseDetectedCount / analyticsData.totalDetections) * 100).toFixed(1)
      : 0;


  return (
    <div className="analytics-container">

      <div className="analytics-header">
        <h2><FaChartLine /> Mango Disease Analytics</h2>
        {analyticsData.totalDetections > 0 && (
          <button className="clear-btn" onClick={clearAnalytics}>
            Clear Data
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total"><FaChartBar /></div>
          <div className="stat-info"><h3>{analyticsData.totalDetections}</h3><p>Total Scans</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon diseased"><FaLeaf /></div>
          <div className="stat-info"><h3>{analyticsData.diseaseDetectedCount}</h3><p>Diseases Detected</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon healthy"><FaLeaf /></div>
          <div className="stat-info"><h3>{analyticsData.healthyCount}</h3><p>Healthy Leaves</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon confidence"><FaArrowUp /></div>
          <div className="stat-info"><h3>{analyticsData.averageConfidence}%</h3><p>Avg Confidence</p></div>
        </div>
      </div>

      {analyticsData.totalDetections > 0 && (
        <div className="rate-card">
          <div className="rate-content">
            <FaExclamationTriangle className="rate-icon" />
            <div>
              <h4>Disease Detection Rate</h4>
              <p className="rate-value">{diseaseRate}% of images show disease detection</p>
            </div>
          </div>
          <div className="rate-bar">
            <div className="rate-fill" style={{ width: `${diseaseRate}%`, background: '#f44336' }} />
          </div>
        </div>
      )}

      {analyticsData.totalDetections > 0 && (
        <div className="charts-grid">
          {pieChartData && (
            <div className="chart-card">
              <h3><FaChartPie /> Disease vs Healthy</h3>
              <div className="chart-container"><Pie data={pieChartData} options={chartOptions} /></div>
            </div>
          )}
          {barChartData && (
            <div className="chart-card">
              <h3><FaChartBar /> Detected Conditions</h3>
              <div className="chart-container"><Bar data={barChartData} options={chartOptions} /></div>
            </div>
          )}
          {lineChartData && analyticsData.detectionHistory.length > 1 && (
            <div className="chart-card full-width">
              <h3><FaChartLine /> Detection Trend</h3>
              <div className="chart-container line-chart"><Line data={lineChartData} options={chartOptions} /></div>
            </div>
          )}
        </div>
      )}

      {analyticsData.recentDetections.length > 0 && (
        <div className="recent-detections">
          <h3><FaCalendar /> Recent Scans</h3>
          <div className="table-container">
            <table className="detections-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Confidence</th>
                  <th>Conditions</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.recentDetections.map((detection, index) => (
                  <tr key={index}>
                    <td>{new Date(detection.timestamp).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${detection.diseaseDetected ? 'diseased' : 'healthy'}`}>
                        {detection.diseaseDetected ? '⚠️ Disease' : '✅ Healthy'}
                      </span>
                    </td>
                    <td>{detection.confidence.toFixed(1)}%</td>
                    {/* FIXED: This now correctly says "Anthracnose" or "Healthy" */}
                    <td>{detection.diseases.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {analyticsData.totalDetections === 0 && (
        <div className="empty-analytics">
          <FaChartLine size={60} color="#ccc" />
          <h3>No Analytics Data Yet</h3>
          <p>Upload mango leaf images to start seeing detection statistics</p>
          <p className="hint">Go to Dashboard and upload your first leaf image</p>
        </div>
      )}

    </div>
  );
};

export default Analytics;