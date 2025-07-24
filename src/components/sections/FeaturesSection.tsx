import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { 
  TrendingUp, 
  Users, 
  Database, 
  ShoppingCart, 
  Bell, 
  FileText,
  Building,
  Search
} from 'lucide-react'

const FeaturesSection = () => {
  const features = [
    {
      icon: TrendingUp,
      title: 'Deal Flow Management',
      description: 'Track and manage renewable energy deals from origination to closing with comprehensive pipeline tools.'
    },
    {
      icon: Users,
      title: 'Investor Matching',
      description: 'Connect with the right investors using our intelligent matching algorithm based on investment criteria.'
    },
    {
      icon: Database,
      title: 'Global Industry Database',
      description: 'Access detailed profiles of 3,500+ renewable energy companies, investors, and developers worldwide.'
    },
    {
      icon: ShoppingCart,
      title: 'Asset Marketplace',
      description: 'Buy and sell renewable energy projects, assets, and development opportunities in our secure marketplace.'
    },
    {
      icon: Bell,
      title: 'Real-time Notifications',
      description: 'Stay updated with instant alerts on new deals, investor activity, and market opportunities.'
    },
    {
      icon: FileText,
      title: 'Document Sharing',
      description: 'Securely share due diligence documents, financial models, and project information with stakeholders.'
    },
    {
      icon: Building,
      title: 'Company Profiles',
      description: 'Comprehensive company profiles with investment history, portfolio details, and contact information.'
    },
    {
      icon: Search,
      title: 'Advanced Search',
      description: 'Find exactly what you need with powerful search and filtering across deals, companies, and assets.'
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed in Renewable Energy
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and connections you need to source deals, 
            find investors, and grow your renewable energy business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection