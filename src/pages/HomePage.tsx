import React from 'react'
import Header from '../components/layout/Header'
import HeroSection from '../components/sections/HeroSection'
import PartnersSection from '../components/sections/PartnersSection'
import FeaturesSection from '../components/sections/FeaturesSection'
import StatsSection from '../components/sections/StatsSection'
import TestimonialsSection from '../components/sections/TestimonialsSection'
import Footer from '../components/layout/Footer'

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <PartnersSection />
        <FeaturesSection />
        <StatsSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage