import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1 className="brand">
        <Link to="/">
          <i className="fab fa-whatsapp"></i> WhatsApp Integration
        </Link>
      </h1>
      <ul>
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/messages">Messages</Link>
        </li>
        <li>
          <Link to="/send">Send Message</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar; 