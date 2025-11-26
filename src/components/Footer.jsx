import React from "react";
import "../styles/footer.css";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

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
            <li>About Us</li>
            <li>Our Teachers</li>
            <li>All Courses</li>
            <li>Testimonials</li>
            <li>FAQs</li>
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
          <span className="icon"><FaFacebookF /></span>
          <span className="icon"><FaTwitter /></span>
          <span className="icon"><FaInstagram /></span>
          <span className="icon"><FaYoutube /></span>
        </div>
      </div>

    </footer>
  );
}
