'use client';

import { useState } from 'react';
import { X, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

const GENRES = [
  'Contemporary',
  'Historical',
  'Paranormal',
  'Romantic Suspense',
  'Erotic',
  'Young Adult',
  'Fantasy',
  'Sci-Fi',
];

const HEAT_LEVELS = [
  { value: 'clean', label: 'Clean (No explicit content)' },
  { value: 'mild', label: 'Mild (Some sensual scenes)' },
  { value: 'medium', label: 'Medium (Moderate heat)' },
  { value: 'spicy', label: 'Spicy (High heat)' },
  { value: 'erotic', label: 'Erotic (Very explicit)' },
];

const POV_OPTIONS = [
  { value: 'first_person', label: 'First Person' },
  { value: 'third_person_limited', label: 'Third Person Limited' },
  { value: 'third_person_omniscient', label: 'Third Person Omniscient' },
  { value: 'dual_pov', label: 'Dual POV' },
  { value: 'multiple_pov', label: 'Multiple POV' },
];

const COMMON_TROPES = [
  'Enemies to Lovers',
  'Friends to Lovers',
  'Fake Relationship',
  'Second Chance',
  'Forbidden Love',
  'Billionaire',
  'Small Town',
  'Forced Proximity',
  'Grumpy x Sunshine',
  'Age Gap',
  'Marriage of Convenience',
  'Secret Baby',
  'Workplace Romance',
  'Opposites Attract',
  'Love Triangle',
];

export default function NewProjectModal({ isOpen, onClose, onProjectCreated }: NewProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Contemporary',
    tropes: [] as string[],
    pov: 'third_person_limited',
    heat_level: 'medium',
    deadline: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a project title');
      return;
    }

    if (formData.tropes.length === 0) {
      toast.error('Please select at least one trope');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          title: formData.title,
          genre: formData.genre,
          tropes: formData.tropes,
          pov: formData.pov,
          heat_level: formData.heat_level,
          deadline: formData.deadline || null,
          status: 'planning',
          cost: 0,
          roi: 0,
        });

      if (error) throw error;

      toast.success('Project created successfully!');
      onProjectCreated();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        genre: 'Contemporary',
        tropes: [],
        pov: 'third_person_limited',
        heat_level: 'medium',
        deadline: '',
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const toggleTrope = (trope: string) => {
    setFormData(prev => ({
      ...prev,
      tropes: prev.tropes.includes(trope)
        ? prev.tropes.filter(t => t !== trope)
        : [...prev.tropes, trope]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter your romance novel title"
            />
          </div>

          {/* Genre */}
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
              Genre *
            </label>
            <select
              id="genre"
              value={formData.genre}
              onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {GENRES.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* Tropes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tropes * (Select at least one)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {COMMON_TROPES.map(trope => (
                <button
                  key={trope}
                  type="button"
                  onClick={() => toggleTrope(trope)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.tropes.includes(trope)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {trope}
                </button>
              ))}
            </div>
          </div>

          {/* POV */}
          <div>
            <label htmlFor="pov" className="block text-sm font-medium text-gray-700 mb-2">
              Point of View *
            </label>
            <select
              id="pov"
              value={formData.pov}
              onChange={(e) => setFormData(prev => ({ ...prev, pov: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {POV_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Heat Level */}
          <div>
            <label htmlFor="heat_level" className="block text-sm font-medium text-gray-700 mb-2">
              Heat Level *
            </label>
            <select
              id="heat_level"
              value={formData.heat_level}
              onChange={(e) => setFormData(prev => ({ ...prev, heat_level: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {HEAT_LEVELS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
              Deadline (Optional)
            </label>
            <input
              type="date"
              id="deadline"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}