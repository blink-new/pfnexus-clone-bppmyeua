import React from 'react'
import { Button } from '../ui/button'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold text-blue-400 mb-4">Bear Energy</div>
            <p className="text-gray-300 mb-6 max-w-md">
              The global renewable energy deal flow platform connecting investors, 
              developers, and industry professionals worldwide.
            </p>
            <div className="text-sm text-gray-400">
              Visit us at: <a href="https://bearenergy.co.uk" className="text-blue-400 hover:text-blue-300">bearenergy.co.uk</a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Deal Flow</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Investor Network</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Asset Marketplace</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Company Database</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Market Reports</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Industry Guides</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Bear Energy. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer