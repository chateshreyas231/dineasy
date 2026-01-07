'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Search, Sparkles, Mic } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading?: boolean
}

export function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl blur-sm" />
        <div className="relative flex gap-2 bg-[#1E1E2E]/90 backdrop-blur-md rounded-2xl shadow-2xl p-2 border border-[#2D2D3E]">
          <div className="flex-1 flex items-center gap-3 px-4">
            <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you feel like? e.g. 'Romantic dinner for 2 tomorrow at 7pm'"
              className="flex-1 bg-transparent text-white placeholder:text-gray-500 focus:outline-none text-base md:text-lg py-2"
              disabled={isLoading}
            />
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Voice input"
            >
              <Mic className="w-5 h-5 text-purple-400" />
            </button>
          </div>
          <Button
            type="submit"
            disabled={isLoading || !query.trim()}
            size="lg"
            className="gradient-primary hover:opacity-90 text-white px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 glow-purple"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
