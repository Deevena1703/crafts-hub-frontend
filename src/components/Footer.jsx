import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">
            <ShoppingBag className="footer-brand-icon" />
            <span className="footer-brand-text">Crafts Hub</span>
          </div>
          <p className="footer-desc">
            Empowering rural women artisans through digital commerce. Connecting traditional craftsmanship with modern markets.
          </p>
        </div>
        <div>
          <h4 className="footer-heading">Quick Links</h4>
          <div className="footer-links">
            <Link to="/products" className="footer-link">Browse Products</Link>
            <Link to="/categories" className="footer-link">Categories</Link>
            <Link to="/register" className="footer-link">Join as Artisan</Link>
          </div>
        </div>
        <div>
          <h4 className="footer-heading">Contact</h4>
          <p className="footer-desc">support@craftshub.in</p>
          <p className="footer-desc" style={{ marginTop: '0.25rem' }}>Made with ❤️ for SHG Women</p>
        </div>
      </div>
      <div className="footer-bottom">© 2026 Crafts Hub. All rights reserved.</div>
    </div>
  </footer>
);

export default Footer;
