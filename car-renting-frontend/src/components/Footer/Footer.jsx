import React from 'react';
import './Footer.css';

/* ===== FOOTER TRANG CHỦ (nền tối, có logo và links ngang) ===== */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Brand */}
        <div className="footer-brand-col">
          <div className="footer-brand">The Car Renting System</div>
          <div className="footer-copy">© 2026 The Car Renting System. ALL RIGHTS RESERVED.</div>
        </div>

        {/* Links */}
        <div className="footer-links">
          <span className="footer-link">Privacy Policy</span>
          <span className="footer-link">Terms of Service</span>
          <span className="footer-link">Fleet Guide</span>
          <span className="footer-link">Contact Us</span>
        </div>
      </div>
    </footer>
  );
}

/* ===== FLEET FOOTER (nền #1a1a2e, links giữa, dùng cho các trang nội bộ) ===== */
export function FleetFooter() {
  return (
    <footer className="fleet-footer">
      <div className="fleet-footer-links">
        <span className="fleet-footer-link">Terms of Service</span>
        <span className="fleet-footer-link">Privacy Policy</span>
        <span className="fleet-footer-link">VND Pricing</span>
        <span className="fleet-footer-link">Contact</span>
      </div>
      <div className="fleet-footer-copy">© 2026 The Car Renting System</div>
    </footer>
  );
}

export default Footer;
