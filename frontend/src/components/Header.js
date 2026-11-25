import React, { useState, useEffect } from 'react';
import { FaLeaf, FaChartBar } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ transparent = false }) => {
  const location = useLocation();
  
  // Day/Night Timer with live updates
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  const hour = currentTime.getHours();
  const isDayTime = hour >= 6 && hour < 18;
  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dayString = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className={`header ${transparent ? 'transparent' : ''}`}>
      <div className="header-left">
        <Link to="/" className="logo">
          <FaLeaf className="logo-icon" />
          <div className="logo-text">
            <h1>Mango Leaf Detection</h1>
            <span className="tagline">AI-Powered Disease Classification</span>
          </div>
        </Link>
      </div>
      
      <div className="header-right">
        <div className="time-display">
          <div className={`time-icon ${isDayTime ? 'day' : 'night'}`}>
            {isDayTime ? '☀️' : '🌙'}
          </div>
          <div className="time-info">
            <span className="time">{timeString}</span>
            <span className="day-night">{isDayTime ? 'Day Time' : 'Night Time'}</span>
            <span className="date">{dayString}</span>
          </div>
        </div>
        
        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <FaLeaf /> HOME
          </Link>
          <Link 
            to="/dashboard" 
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            <FaLeaf /> DASHBOARD
          </Link>
          <Link 
            to="/analytics" 
            className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`}
          >
            <FaChartBar /> ANALYTICS
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;