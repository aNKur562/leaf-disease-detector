import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import '../styles/Home.css';

const Home = () => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const myRef = useRef(null);

  useEffect(() => {
    const loadVanta = () => {
      if (!vantaEffect && window.VANTA && window.THREE) {
        const effect = window.VANTA.BIRDS({
          el: myRef.current,
          THREE: window.THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          backgroundColor: 0x0a1f0a,
          color1: 0x2e7d32,
          color2: 0xffd700,
          birdSize: 1.50,
          wingSpan: 20.00,
          speedLimit: 5.00,
          separation: 50.00,
          alignment: 30.00,
          cohesion: 30.00
        });
        setVantaEffect(effect);
      }
    };

    loadVanta();
    
    const timer = setTimeout(() => {
      loadVanta();
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div className="home-container" ref={myRef}>
      <div className="home-overlay">
        <div className="hero-content-simple">
          <h1 className="hero-title-simple">Mango Disease Detection</h1>
          
          <div className="hero-subtitle-simple">
            <div className="text-container-simple">
              <span className="text-line-simple">Detect and Analyze</span>
              <span className="text-line-simple">Mango leaf diseases instantly using AI</span>
            </div>
          </div>

          <Link to="/dashboard" className="get-started-btn-simple">
            <span>Get Started</span>
            <FaArrowRight className="arrow-icon" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;