import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";


const Navbar = () => {
    return (
        <nav className="navbar">
      <div className="navbar-logo">
        <h1>S</h1> 
      </div>
      <div className="navbar-links">
        <div className="navbar-item">
          <Link to="/">Home</Link>
        </div>
        <div className="navbar-item">
          <Link to="/about">About</Link>
        </div>
        <div className="navbar-item">
          <Link to="/login">Sign In</Link>
        </div>
        <div className="navbar-item">
          <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </nav>
    );
};
export default Navbar;