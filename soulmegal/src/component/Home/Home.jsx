


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

const Home = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    const isLoggedIn = localStorage.getItem("token"); // Checking for token in localStorage
    if (isLoggedIn) {
      navigate("/video");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="home-container">
      <div className="stars"></div>
      <div className="floating-orbs"></div>

      <div className="home-content">
        <div className="left-section">
          <h1 className="logo">Soulmegle</h1>
          <p className="slogan">"Unleash Conversations, Discover New Connections!"</p>
          <button className="get-started-btn" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
