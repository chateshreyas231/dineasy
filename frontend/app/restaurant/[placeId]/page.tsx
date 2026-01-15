'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Phone, Globe, Calendar, Users, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const placeId = params.placeId as string;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [partySize, setPartySize] = useState(2);

  useEffect(() => {
    loadRestaurant();
  }, [placeId]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/restaurants/${placeId}`);
      
      if (!response.ok) {
        throw new Error('Restaurant not found');
      }

      const data = await response.json();
      setRestaurant(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load restaurant');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBook = async () => {
    if (!selectedTime) {
      alert('Please select a time');
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const bookingDate = new Date(selectedDate);
    bookingDate.setHours(hours, minutes, 0, 0);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/api/bookings/quick-book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          placeId,
          datetime: bookingDate.toISOString(),
          partySize,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Booking failed');
      }

      const result = await response.json();
      
      if (result.mode === 'REDIRECT' && result.redirectUrl) {
        window.open(result.redirectUrl, '_blank');
      }

      router.push(`/bookings?bookingId=${result.bookingId}`);
    } catch (err: any) {
      alert(err.message || 'Booking failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3F0] to-[#E8E5E0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AA907A] mx-auto mb-4"></div>
          <p className="text-[#6B6B6B]">Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3F0] to-[#E8E5E0]">
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'Restaurant not found'}</p>
          <Button onClick={() => router.push('/')} className="bg-[#AA907A] hover:bg-[#8B7565]">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const timeSlots = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] to-[#E8E5E0]">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-6 text-[#AA907A] hover:text-[#8B7565]"
        >
          ← Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Restaurant Info */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm border border-[#E8E5E0]">
            <h1 className="text-3xl font-bold text-[#0F0F0F] mb-4">{restaurant.name}</h1>
            
            {restaurant.rating && (
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-[#FFDA9F] fill-[#FFDA9F]" />
                <span className="text-lg font-semibold text-[#0F0F0F]">{restaurant.rating.toFixed(1)}</span>
                {restaurant.priceLevel && (
                  <span className="text-[#6B6B6B] ml-2">{'$'.repeat(restaurant.priceLevel)}</span>
                )}
              </div>
            )}

            <div className="space-y-3 mb-6">
              {restaurant.formattedAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#AA907A] mt-0.5" />
                  <span className="text-[#3A3A3A]">{restaurant.formattedAddress}</span>
                </div>
              )}
              
              {restaurant.formattedPhoneNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#AA907A]" />
                  <a href={`tel:${restaurant.phone}`} className="text-[#AA907A] hover:underline">
                    {restaurant.formattedPhoneNumber}
                  </a>
                </div>
              )}
              
              {restaurant.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-[#AA907A]" />
                  <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-[#AA907A] hover:underline">
                    Visit Website
                  </a>
                </div>
              )}
            </div>

            {restaurant.types && (
              <div className="flex flex-wrap gap-2">
                {restaurant.types.slice(0, 5).map((type: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-[#AA907A]/10 text-[#AA907A] rounded-full text-sm"
                  >
                    {type.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Booking Section */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm border border-[#E8E5E0]">
            <h2 className="text-2xl font-bold text-[#0F0F0F] mb-6">Book a Table</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#3A3A3A] mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Party Size
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((size) => (
                    <button
                      key={size}
                      onClick={() => setPartySize(size)}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        partySize === size
                          ? 'bg-[#AA907A] border-[#AA907A] text-white'
                          : 'border-[#DDD8D0] text-[#3A3A3A] hover:border-[#AA907A]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A3A3A] mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-[#DDD8D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA907A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A3A3A] mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedTime === time
                          ? 'bg-[#AA907A] border-[#AA907A] text-white'
                          : 'border-[#DDD8D0] text-[#3A3A3A] hover:border-[#AA907A]'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleQuickBook}
                className="w-full bg-[#AA907A] hover:bg-[#8B7565] text-white"
                disabled={!selectedTime}
              >
                Quick Book
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
