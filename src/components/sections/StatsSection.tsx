import React from 'react'

const StatsSection = () => {
  const stats = [
    {
      number: '3,500+',
      label: 'Companies in Network',
      description: 'Global renewable energy companies, investors, and developers'
    },
    {
      number: '$50B+',
      label: 'Deals Tracked',
      description: 'Total value of renewable energy transactions on our platform'
    },
    {
      number: '150+',
      label: 'Countries',
      description: 'Global reach across all major renewable energy markets'
    },
    {
      number: '95%',
      label: 'Success Rate',
      description: 'Of users find relevant connections within 30 days'
    }
  ]

  return (
    <section className="py-20 bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Powering the Global Renewable Energy Market
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Join thousands of professionals who trust Bear Energy to connect, collaborate, 
            and close deals in the renewable energy sector.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-xl font-semibold text-blue-100 mb-2">
                {stat.label}
              </div>
              <div className="text-blue-200 text-sm">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection