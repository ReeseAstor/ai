'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Chapter } from '@/types/database';

interface CreateChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChapterCreated: (chapter: Chapter) => void;
  projectId: string;
  nextChapterNumber: number;
}

export default function CreateChapterModal({ 
  isOpen, 
  onClose, 
  onChapterCreated, 
  projectId, 
  nextChapterNumber 
}: CreateChapterModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    target_word_count: 3000,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          chapter_number: nextChapterNumber,
          title: formData.title || null,
          target_word_count: formData.target_word_count,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chapter');
      }

      const newChapter = await response.json();
      onChapterCreated(newChapter);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        target_word_count: 3000,
      });
    } catch (error) {
      console.error('Error creating chapter:', error);
      alert('Failed to create chapter. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add Chapter {nextChapterNumber}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Chapter Title (optional)
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter chapter title"
            />
          </div>

          <div>
            <label htmlFor="target_word_count" className="block text-sm font-medium text-gray-700 mb-2">
              Target Word Count *
            </label>
            <input
              type="number"
              id="target_word_count"
              value={formData.target_word_count}
              onChange={(e) => setFormData({ ...formData, target_word_count: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              min="500"
              max="10000"
              step="100"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Recommended: 2,000-4,000 words for romance novels
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Chapter
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}