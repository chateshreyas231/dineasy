'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();
      // Store access token in memory (or localStorage for now)
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3F0] to-[#E8E5E0] p-4">
      <Card className="w-full max-w-md p-8 bg-white/90 backdrop-blur-sm border border-[#E8E5E0]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F0F0F] mb-2">Welcome Back</h1>
          <p className="text-[#6B6B6B]">Sign in to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#3A3A3A] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-[#DDD8D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA907A] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#3A3A3A] mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-[#DDD8D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA907A] focus:border-transparent"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#AA907A] hover:bg-[#8B7565] text-white"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#6B6B6B]">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#AA907A] font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
