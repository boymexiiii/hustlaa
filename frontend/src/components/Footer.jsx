import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-lg font-bold mb-4">Hustlaa</h4>
            <p className="text-gray-400">Find skilled artisans near you across all Nigerian states</p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">For Customers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/artisans" className="hover:text-white">Find Artisans</Link></li>
              <li><Link to="/jobs" className="hover:text-white">Browse Jobs</Link></li>
              <li><Link to="/register" className="hover:text-white">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">For Artisans</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/register" className="hover:text-white">Join Us</Link></li>
              <li><Link to="/jobs" className="hover:text-white">Find Jobs</Link></li>
              <li><Link to="/help" className="hover:text-white">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><a href="mailto:support@hustlaa.com" className="hover:text-white">Email Support</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Hustlaa. All rights reserved. | Connecting skilled artisans with customers nationwide</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
