'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const params = new URLSearchParams();
      if (filter === 'upcoming') params.append('upcoming', 'true');
      if (filter === 'past') params.append('upcoming', 'false');

      const response = await fetch(`${API_URL}/api/bookings?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PENDING':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3F0] to-[#E8E5E0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AA907A] mx-auto mb-4"></div>
          <p className="text-[#6B6B6B]">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] to-[#E8E5E0]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#0F0F0F]">My Bookings</h1>
          <Link href="/">
            <Button variant="ghost" className="text-[#AA907A] hover:text-[#8B7565]">
              Search Restaurants
            </Button>
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          {(['all', 'upcoming', 'past'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-[#AA907A] text-white'
                  : 'bg-white/90 text-[#3A3A3A] hover:bg-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {bookings.length === 0 ? (
          <Card className="p-12 text-center bg-white/90 backdrop-blur-sm border border-[#E8E5E0]">
            <Calendar className="w-16 h-16 text-[#9A9A9A] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#0F0F0F] mb-2">No bookings found</h2>
            <p className="text-[#6B6B6B] mb-6">
              {filter === 'upcoming'
                ? "You don't have any upcoming reservations"
                : filter === 'past'
                ? "You don't have any past reservations"
                : "You don't have any bookings yet"}
            </p>
            <Link href="/">
              <Button className="bg-[#AA907A] hover:bg-[#8B7565] text-white">
                Find Restaurants
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const bookingDate = new Date(booking.datetime);
              const isPast = bookingDate < new Date();

              return (
                <Card
                  key={booking.id}
                  className="p-6 bg-white/90 backdrop-blur-sm border border-[#E8E5E0] hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#0F0F0F] mb-2">{booking.restaurantName}</h3>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span className="text-sm font-medium text-[#3A3A3A]">{booking.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-3 text-[#3A3A3A]">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(booking.datetime)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#3A3A3A]">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(booking.datetime)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#3A3A3A]">
                      <Users className="w-4 h-4" />
                      <span>
                        {booking.partySize} {booking.partySize === 1 ? 'guest' : 'guests'}
                      </span>
                    </div>
                    {booking.restaurantAddress && (
                      <div className="flex items-center gap-3 text-[#3A3A3A]">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{booking.restaurantAddress}</span>
                      </div>
                    )}
                  </div>

                  {booking.bookingUrl && booking.status === 'EXTERNAL_REDIRECT' && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Complete your booking on the restaurant's website
                      </p>
                      <a
                        href={booking.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-yellow-600 hover:underline mt-1 inline-block"
                      >
                        Open booking link →
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                      className="flex-1 border-[#DDD8D0] text-[#3A3A3A] hover:bg-[#F5F3F0]"
                    >
                      View Details
                    </Button>
                    {!isPast && booking.status !== 'CANCELLED' && (
                      <Button
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
