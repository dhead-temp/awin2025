import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-gray-400 text-sm">
            © 2025 Answer & Win. All rights reserved. | 
            <a href="#" className="hover:text-emerald-400 ml-1 mr-1">Terms of Service</a> | 
            <a href="#" className="hover:text-emerald-400 ml-1">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;