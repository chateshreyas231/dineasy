'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card'
import { Button } from './ui/button'
import { RestaurantOption } from '@/types'
import { Calendar, Users, MapPin, Star, ExternalLink, Clock, Sparkles } from 'lucide-react'

interface RestaurantCardProps {
  restaurant: RestaurantOption
  onBook: (restaurant: RestaurantOption) => void
}

export function RestaurantCard({ restaurant, onBook }: RestaurantCardProps) {
  const dateTime = new Date(restaurant.dateTime)
  const formattedDate = dateTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  const formattedTime = dateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })

  const handleBook = () => {
    if (restaurant.bookingLink) {
      window.open(restaurant.bookingLink, '_blank', 'noopener,noreferrer')
      onBook(restaurant)
    }
  }

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border-[#2D2D3E] bg-[#1E1E2E] overflow-hidden hover:border-purple-500/50">
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-6 border-b border-[#2D2D3E]">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                {restaurant.name}
              </CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-3 text-gray-400">
                {restaurant.cuisine && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    {restaurant.cuisine}
                  </span>
                )}
                {restaurant.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {restaurant.location}
                  </span>
                )}
                {restaurant.distance && (
                  <span className="text-gray-500 text-sm">
                    {restaurant.distance.toFixed(1)} mi away
                  </span>
                )}
              </CardDescription>
            </div>
            <span className="px-3 py-1.5 bg-[#252538] rounded-lg text-xs font-semibold text-gray-300 border border-[#2D2D3E]">
              {restaurant.platform}
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-[#252538] px-3 py-2 rounded-lg border border-[#2D2D3E]">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="font-medium text-gray-300">
                {formattedDate} at {formattedTime}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#252538] px-3 py-2 rounded-lg border border-[#2D2D3E]">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="font-medium text-gray-300">
                {restaurant.partySize} {restaurant.partySize === 1 ? 'guest' : 'guests'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            {restaurant.rating && (
              <div className="flex items-center gap-1.5 bg-[#252538] px-3 py-2 rounded-lg border border-[#2D2D3E]">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-300">{restaurant.rating}</span>
                <span className="text-gray-500 text-sm">/ 5.0</span>
              </div>
            )}
            
            {restaurant.priceRange && (
              <div className="px-3 py-2 bg-[#252538] rounded-lg border border-[#2D2D3E]">
                <span className="text-gray-300 font-medium">{restaurant.priceRange}</span>
              </div>
            )}
          </div>
          
          {restaurant.vibeTags && restaurant.vibeTags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {restaurant.vibeTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-gradient-to-r from-purple-900/40 to-pink-900/40 text-purple-300 px-3 py-1.5 rounded-full font-medium border border-purple-500/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {restaurant.description && (
            <p className="text-gray-400 text-sm leading-relaxed pt-2">
              {restaurant.description}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="pt-4 border-t border-[#2D2D3E]">
          <Button
            onClick={handleBook}
            className="w-full gradient-primary hover:opacity-90 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all group glow-purple"
            disabled={!restaurant.bookingLink}
          >
            {restaurant.bookingLink ? (
              <>
                Reserve Now
                <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Booking Unavailable
              </>
            )}
          </Button>
        </CardFooter>
      </div>
    </Card>
  )
}
