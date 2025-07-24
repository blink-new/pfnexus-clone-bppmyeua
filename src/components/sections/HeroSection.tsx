import React from 'react'
import { Button } from '../ui/button'
import { ArrowRight, Play } from 'lucide-react'

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-green-50 to-emerald-100 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            The Global Renewable Energy
            <span className="text-[#004225] block">Deal Flow Platform</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with investors, developers, and industry professionals. Access exclusive deals, 
            market intelligence, and build partnerships in the renewable energy sector.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="bg-[#004225] hover:bg-[#003319] text-lg px-8 py-3">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            Trusted by 3,500+ renewable energy companies worldwide
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection