import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Star } from 'lucide-react'

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Investment Director',
      company: 'GreenTech Capital',
      content: 'Bear Energy has transformed how we source renewable energy deals. The quality of opportunities and the speed of connections is unmatched.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CEO',
      company: 'Solar Dynamics',
      content: 'We closed three major funding rounds through connections made on Bear Energy. The platform is essential for any serious renewable energy developer.',
      rating: 5
    },
    {
      name: 'Emma Thompson',
      role: 'Managing Partner',
      company: 'Clean Energy Ventures',
      content: 'The market intelligence and deal flow visibility we get from Bear Energy gives us a significant competitive advantage in the market.',
      rating: 5
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what renewable energy professionals are saying about Bear Energy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection