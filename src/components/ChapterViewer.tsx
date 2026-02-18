'use client';

import { useState, useEffect } from 'react';
import { X, Download, Edit, Eye, EyeOff } from 'lucide-react';
import { AIDraft } from '@/types/database';

interface ChapterViewerProps {
  isOpen: boolean;
  onClose: () => void;
  chapterId: string;
  chapterTitle: string;
  chapterNumber: number;
}

export default function ChapterViewer({ 
  isOpen, 
  onClose, 
  chapterId, 
  chapterTitle, 
  chapterNumber 
}: ChapterViewerProps) {
  const [drafts, setDrafts] = useState<AIDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<AIDraft | null>(null);
  const [showFullContent, setShowFullContent] = useState(false);

  useEffect(() => {
    if (isOpen && chapterId) {
      fetchDrafts();
    }
  }, [isOpen, chapterId]);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chapters/${chapterId}/drafts`);
      if (response.ok) {
        const data = await response.json();
        setDrafts(data);
        if (data.length > 0) {
          setSelectedDraft(data[0]); // Show the latest draft by default
        }
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!selectedDraft) return;
    
    const element = document.createElement('a');
    const file = new Blob([selectedDraft.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Chapter-${chapterNumber}-${chapterTitle || 'Untitled'}-Draft-${selectedDraft.pass_number}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Chapter {chapterNumber}
              {chapterTitle && `: ${chapterTitle}`}
            </h2>
            <p className="text-sm text-gray-600">
              {drafts.length} draft{drafts.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Drafts Sidebar */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Drafts</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-600 mt-2">Loading drafts...</p>
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600">No drafts available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {drafts.map((draft) => (
                  <button
                    key={draft.id}
                    onClick={() => setSelectedDraft(draft)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedDraft?.id === draft.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">Draft {draft.pass_number}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(draft.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Model: {draft.model_used}</div>
                      <div>Cost: ${draft.total_cost.toFixed(4)}</div>
                      <div>Words: {draft.content.split(' ').length}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col">
            {selectedDraft ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Model: {selectedDraft.model_used}</span>
                      <span>•</span>
                      <span>Cost: ${selectedDraft.total_cost.toFixed(4)}</span>
                      <span>•</span>
                      <span>Words: {selectedDraft.content.split(' ').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowFullContent(!showFullContent)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        {showFullContent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showFullContent ? 'Show Summary' : 'Show Full'}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="btn-outline flex items-center gap-1 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                      {showFullContent 
                        ? selectedDraft.content 
                        : selectedDraft.content.substring(0, 1000) + (selectedDraft.content.length > 1000 ? '...' : '')
                      }
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-600">
                <div className="text-center">
                  <p>Select a draft to view its content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}