import React from "react";
import "../styles/footer.css";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export function Footer() {
  return (
    <footer className="footer">

      <div className="footer-content">

        {/* Left Column */}
        <div className="footer-col">
          <h3 className="footer-title">Riyad Al-Bayan Center</h3>

          <p className="footer-text">
            A trusted platform for learning Arabic language and Islamic sciences with
            qualified scholars from around the world. We provide authentic knowledge
            with modern teaching methods.
          </p>

          <p className="footer-quote">
            "Seek knowledge from the cradle to the grave" – Prophet Muhammad ﷺ
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-subtitle">Quick Links</h4>
          <ul className="footer-links">
            <li onClick={() => useNavigate('/about')}>About Us</li>
            <li>Our Teachers</li>
            <li>All Courses</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h4 className="footer-subtitle">Contact Us</h4>

          <ul className="footer-contact">
            <li><FaEnvelope /> info@riyadAlBayan.com</li>
            <li><FaPhone /> +1 (555) 123-4567</li>
            <li><FaMapMarkerAlt /> 123 Knowledge Street, Learning City, LC 12345</li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="footer-divider"></div>

      {/* Bottom Row */}
      <div className="footer-bottom">
        <p className="footer-copy">© 2025 Riyad Al-Bayan Center. All rights reserved.</p>

       <div className="footer-social">
  <a href="https://www.facebook.com/yourpage" target="_blank" rel="noopener noreferrer" className="icon">
    <FaFacebookF />
  </a>
  <a href="https://twitter.com/yourhandle" target="_blank" rel="noopener noreferrer" className="icon">
    <FaTwitter />
  </a>
  <a href="https://www.instagram.com/shabaan1770?igsh=ZzhieTJlZjhvZmV6&utm_source=qr" target="_blank" rel="noopener noreferrer" className="icon">
    <FaInstagram />
  </a>
  <a href="https://youtube.com/channel/UCKOVvwGoqIfy0ffh9gWDexQ?si=JBQ70C6PlgGYDPpY" target="_blank" rel="noopener noreferrer" className="icon">
    <FaYoutube />
  </a>
</div>

      </div>


    </footer>
  );
}
