'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const GENRES = [
  'Contemporary Romance',
  'Historical Romance',
  'Paranormal Romance',
  'Fantasy Romance',
  'Sci-Fi Romance',
  'Romantic Suspense',
  'Erotic Romance',
  'Young Adult Romance',
  'LGBTQ+ Romance',
  'Western Romance',
]

const COMMON_TROPES = [
  'Enemies to Lovers',
  'Friends to Lovers',
  'Fake Dating',
  'Second Chance',
  'Forbidden Love',
  'Opposites Attract',
  'Soulmates',
  'Love Triangle',
  'Arranged Marriage',
  'Secret Identity',
  'Billionaire Romance',
  'Small Town Romance',
  'Office Romance',
  'Single Parent',
  'Age Gap',
]

export default function NewProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    tropes: [] as string[],
    pov: 'third_person_limited' as any,
    heat_level: 'moderate' as any,
    status: 'planning' as any,
    deadline: '',
    cost: 0,
  })

  const handleTropeToggle = (trope: string) => {
    setFormData(prev => ({
      ...prev,
      tropes: prev.tropes.includes(trope)
        ? prev.tropes.filter(t => t !== trope)
        : [...prev.tropes, trope]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          deadline: formData.deadline || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create project')
      }

      const project = await response.json()
      toast.success('Project created successfully!')
      router.push(`/projects/${project.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Project</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your romance novel title"
              />
            </div>

            {/* Genre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre *
              </label>
              <select
                required
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a genre</option>
                {GENRES.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Tropes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tropes (Select multiple)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {COMMON_TROPES.map(trope => (
                  <label
                    key={trope}
                    className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                      formData.tropes.includes(trope)
                        ? 'bg-primary-100 text-primary-700 border-primary-300'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                    } border`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.tropes.includes(trope)}
                      onChange={() => handleTropeToggle(trope)}
                      className="mr-2"
                    />
                    <span className="text-sm">{trope}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* POV and Heat Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Point of View *
                </label>
                <select
                  required
                  value={formData.pov}
                  onChange={(e) => setFormData({ ...formData, pov: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="first_person">First Person</option>
                  <option value="third_person_limited">Third Person Limited</option>
                  <option value="third_person_omniscient">Third Person Omniscient</option>
                  <option value="dual_pov">Dual POV</option>
                  <option value="multi_pov">Multi POV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heat Level *
                </label>
                <select
                  required
                  value={formData.heat_level}
                  onChange={(e) => setFormData({ ...formData, heat_level: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="sweet">Sweet (No explicit content)</option>
                  <option value="mild">Mild (Kissing only)</option>
                  <option value="moderate">Moderate (Some steam)</option>
                  <option value="steamy">Steamy (Detailed scenes)</option>
                  <option value="explicit">Explicit (Very detailed)</option>
                </select>
              </div>
            </div>

            {/* Status and Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="planning">Planning</option>
                  <option value="writing">Writing</option>
                  <option value="editing">Editing</option>
                  <option value="review">Review</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Estimated Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}