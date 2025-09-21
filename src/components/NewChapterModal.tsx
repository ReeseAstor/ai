'use client';

import { useState } from 'react';
import { X, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface NewChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  nextChapterNumber: number;
  onChapterCreated: () => void;
}

export default function NewChapterModal({ 
  isOpen, 
  onClose, 
  projectId, 
  nextChapterNumber,
  onChapterCreated 
}: NewChapterModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    target_word_count: 3000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('chapters')
        .insert({
          project_id: projectId,
          chapter_number: nextChapterNumber,
          title: formData.title || null,
          target_word_count: formData.target_word_count,
          word_count: 0,
          status: 'not_started',
        });

      if (error) throw error;

      toast.success(`Chapter ${nextChapterNumber} created successfully!`);
      onChapterCreated();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        target_word_count: 3000,
      });
    } catch (error) {
      console.error('Error creating chapter:', error);
      toast.error('Failed to create chapter');
    } finally {
      setLoading(false);
    }
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
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Add Chapter {nextChapterNumber}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Chapter Title */}
          <div>
            <label htmlFor="chapter-title" className="block text-sm font-medium text-gray-700 mb-2">
              Chapter Title (Optional)
            </label>
            <input
              type="text"
              id="chapter-title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., The First Meeting"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave empty for just "Chapter {nextChapterNumber}"
            </p>
          </div>

          {/* Target Word Count */}
          <div>
            <label htmlFor="word-count" className="block text-sm font-medium text-gray-700 mb-2">
              Target Word Count
            </label>
            <input
              type="number"
              id="word-count"
              min="500"
              max="10000"
              step="100"
              value={formData.target_word_count}
              onChange={(e) => setFormData(prev => ({ ...prev, target_word_count: parseInt(e.target.value) }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Typical romance chapter: 2,500-4,000 words
            </p>
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
                  Create Chapter
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}