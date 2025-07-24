import React from 'react'

const PartnersSection = () => {
  const partners = [
    'EDF Renewables',
    'Scatec',
    'Statkraft',
    'Ørsted',
    'Vattenfall',
    'Engie',
    'NextEra Energy',
    'Iberdrola'
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Trusted by Leading Renewable Energy Companies
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
          {partners.map((partner, index) => (
            <div key={index} className="flex justify-center">
              <div className="text-gray-400 font-medium text-sm text-center hover:text-gray-600 transition-colors">
                {partner}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PartnersSection