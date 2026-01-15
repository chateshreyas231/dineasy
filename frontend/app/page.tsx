'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/SearchBar'
import { RestaurantCard } from '@/components/RestaurantCard'
import { SearchResponse, RestaurantOption } from '@/types'
import { Loader2, Sparkles, Clock, MapPin, Users, Star, Smartphone, Zap, Shield, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [results, setResults] = useState<RestaurantOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedVibe, setSelectedVibe] = useState<string[]>([])
  const [selectedCuisine, setSelectedCuisine] = useState<string[]>([])

  const quickChips = ['Date Night', 'Quiet', 'Live Music', 'Quick Bite', 'Business Lunch', 'Romantic']
  const vibeOptions = ['Quiet', 'Romantic', 'Energetic', 'Cozy', 'Upscale', 'Casual', 'Live Music']
  const cuisineOptions = ['Italian', 'Mexican', 'Japanese', 'American', 'French', 'Mediterranean', 'Asian', 'Indian']

  const handleSearch = async (query: string) => {
    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      // Try to get user location (optional)
      let lat: number | undefined
      let lng: number | undefined
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
          })
          lat = position.coords.latitude
          lng = position.coords.longitude
        } catch (err) {
          console.warn('Location not available:', err)
        }
      }

      const params = new URLSearchParams({ query })
      if (lat !== undefined) params.append('lat', lat.toString())
      if (lng !== undefined) params.append('lng', lng.toString())
      params.append('radiusMeters', '5000') // 5km radius

      const response = await fetch(`${apiUrl}/api/restaurants/search?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      // Transform API response to match RestaurantOption format
      const transformedResults = (data.results || []).map((r: any) => ({
        name: r.name,
        platform: 'Google Places',
        dateTime: new Date().toISOString(), // Placeholder
        partySize: 2,
        cuisine: r.types?.filter((t: string) => t.includes('restaurant')) || [],
        location: r.address,
        rating: r.rating,
        bookingLink: r.website || r.googleMapsUrl,
        placeId: r.placeId,
        lat: r.lat,
        lng: r.lng,
      }))
      setResults(transformedResults)
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while searching')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickChip = (chip: string) => {
    handleSearch(chip)
  }

  const toggleVibe = (vibe: string) => {
    setSelectedVibe(prev => 
      prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
    )
  }

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisine(prev => 
      prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]
    )
  }

  const handleBook = async (restaurant: RestaurantOption) => {
    console.log('Booking:', restaurant)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      await fetch(`${apiUrl}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: restaurant.platform,
          restaurantName: restaurant.name,
          dateTime: restaurant.dateTime,
          partySize: restaurant.partySize,
          bookingLink: restaurant.bookingLink,
          userContact: {
            name: 'Guest User',
            email: 'guest@example.com'
          }
        })
      })
    } catch (err) {
      console.error('Error logging booking:', err)
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 opacity-90" />
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">AI-Powered Restaurant Discovery</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
              Find Your Perfect
              <span className="block text-gradient bg-gradient-to-r from-pink-200 via-purple-200 to-white bg-clip-text text-transparent">
                Table Experience
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Tell us what you feel like. We'll find the perfect restaurant match across all platforms.
            </p>
            
            {/* Search Bar */}
            <div className="mb-8">
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {quickChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleQuickChip(chip)}
                  className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full text-sm font-medium hover:bg-white/20 transition-all hover:scale-105 border border-white/20"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {!hasSearched && (
        <div className="container mx-auto px-4 py-12 -mt-8 relative z-20">
          <div className="bg-[#1E1E2E] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#2D2D3E] glow-purple">
            <h3 className="text-lg font-semibold mb-4 text-white">Refine Your Search</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Vibe</label>
                <div className="flex flex-wrap gap-2">
                  {vibeOptions.map((vibe) => (
                    <button
                      key={vibe}
                      onClick={() => toggleVibe(vibe)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedVibe.includes(vibe)
                          ? 'gradient-primary text-white shadow-lg scale-105 glow-purple'
                          : 'bg-[#252538] text-gray-300 hover:bg-[#2D2D3E] border border-[#2D2D3E]'
                      }`}
                    >
                      {vibe}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Cuisine</label>
                <div className="flex flex-wrap gap-2">
                  {cuisineOptions.map((cuisine) => (
                    <button
                      key={cuisine}
                      onClick={() => toggleCuisine(cuisine)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCuisine.includes(cuisine)
                          ? 'gradient-primary text-white shadow-lg scale-105 glow-purple'
                          : 'bg-[#252538] text-gray-300 hover:bg-[#2D2D3E] border border-[#2D2D3E]'
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-300 text-lg mt-6">Finding your perfect table...</p>
            <p className="text-gray-500 text-sm mt-2">Searching across all platforms</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-6 bg-red-900/20 border border-red-500/30 rounded-xl">
            <p className="text-red-400 font-semibold mb-2">Oops! Something went wrong</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && hasSearched && results.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1E1E2E] mb-4 border border-[#2D2D3E]">
              <MapPin className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-300 text-lg font-medium mb-2">No reservations found</p>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Available Reservations
                <span className="text-gradient ml-2">({results.length})</span>
              </h2>
              <p className="text-gray-400">
                Top matches based on your preferences
              </p>
            </div>
            
            <div className="space-y-4">
              {results.map((restaurant, idx) => (
                <RestaurantCard
                  key={`${restaurant.placeId || restaurant.name}-${idx}`}
                  restaurant={restaurant}
                  onBook={handleBook}
                />
              ))}
            </div>
          </div>
        )}

        {/* Features Section - Show when no search */}
        {!hasSearched && !isLoading && (
          <div className="max-w-6xl mx-auto mt-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Why Choose <span className="text-gradient">Dineasy</span>?
              </h2>
              <p className="text-xl text-gray-400">
                The smartest way to find and book restaurant reservations
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-[#1E1E2E] p-8 rounded-2xl shadow-xl border border-[#2D2D3E] hover:border-purple-500/50 transition-all hover:scale-105">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 glow-purple">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Instant Search</h3>
                <p className="text-gray-400">
                  Search across OpenTable, Resy, Yelp, Tock, and Google in one place. Get results in seconds.
                </p>
              </div>

              <div className="bg-[#1E1E2E] p-8 rounded-2xl shadow-xl border border-[#2D2D3E] hover:border-pink-500/50 transition-all hover:scale-105">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 glow-pink">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Matching</h3>
                <p className="text-gray-400">
                  Our AI understands your intent - from "date night" to "quick business lunch" - and finds the perfect match.
                </p>
              </div>

              <div className="bg-[#1E1E2E] p-8 rounded-2xl shadow-xl border border-[#2D2D3E] hover:border-purple-500/50 transition-all hover:scale-105">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 glow-purple">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">One-Click Booking</h3>
                <p className="text-gray-400">
                  Book directly through your preferred platform. No account needed, just click and reserve.
                </p>
              </div>
            </div>

            {/* Mobile App CTA */}
            <div className="gradient-primary rounded-2xl p-12 text-center text-white glow-purple">
              <div className="max-w-2xl mx-auto">
                <Smartphone className="w-16 h-16 mx-auto mb-6 opacity-90" />
                <h3 className="text-3xl font-bold mb-4">Try Our Mobile App</h3>
                <p className="text-xl mb-8 text-white/90">
                  Get real-time availability alerts, watch your favorite restaurants, and manage your plans on the go.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold">
                    Download for iOS
                  </Button>
                  <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold">
                    Download for Android
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
