'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Chapter, AIDraft } from '@/types/database';
import { ArrowLeft, Loader2, FileText, Sparkles, Eye, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChapterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const chapterId = params.chapterId as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [aiDrafts, setAiDrafts] = useState<AIDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null);

  useEffect(() => {
    if (projectId && chapterId) {
      fetchChapterData();
    }
  }, [projectId, chapterId]);

  const fetchChapterData = async () => {
    try {
      // Fetch chapter details
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .eq('project_id', projectId)
        .single();

      if (chapterError) throw chapterError;
      setChapter(chapterData);

      // Fetch AI drafts for this chapter
      const { data: draftsData, error: draftsError } = await supabase
        .from('ai_drafts')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('pass_number', { ascending: false });

      if (draftsError) throw draftsError;
      setAiDrafts(draftsData || []);

      // Set the latest draft as selected by default
      if (draftsData && draftsData.length > 0) {
        setSelectedDraft(draftsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching chapter data:', error);
      toast.error('Failed to load chapter data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIDraft = async () => {
    if (!chapter) return;

    setGeneratingDraft(true);

    try {
      const response = await fetch('/api/ai-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId,
          projectId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate AI draft');
      }

      toast.success(data.message || 'AI draft generated successfully!');

      // Refresh chapter and drafts data
      await fetchChapterData();
    } catch (error) {
      console.error('Error generating AI draft:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate AI draft');
    } finally {
      setGeneratingDraft(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'not_started': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'draft_complete': 'bg-green-100 text-green-800',
      'ai_draft': 'bg-purple-100 text-purple-800',
      'under_review': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-emerald-100 text-emerald-800',
      'published': 'bg-primary-100 text-primary-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Chapter not found</p>
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="btn-primary"
          >
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  const selectedDraftData = aiDrafts.find(d => d.id === selectedDraft);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/projects/${projectId}`)}
          className="btn-secondary flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Project
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Chapter {chapter.chapter_number}
              {chapter.title && `: ${chapter.title}`}
            </h1>
            <div className="flex items-center gap-4">
              <span className={`status-badge ${getStatusColor(chapter.status)}`}>
                {chapter.status.replace('_', ' ')}
              </span>
              <span className="text-sm text-gray-600">
                {chapter.word_count} / {chapter.target_word_count} words
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {chapter.status === 'not_started' || chapter.status === 'in_progress' ? (
              <button
                onClick={handleGenerateAIDraft}
                disabled={generatingDraft}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingDraft ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate AI Draft
                  </>
                )}
              </button>
            ) : chapter.status === 'ai_draft' ? (
              <button
                onClick={handleGenerateAIDraft}
                disabled={generatingDraft}
                className="btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingDraft ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Regenerate Draft
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar with drafts */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">AI Drafts</h3>

            {aiDrafts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No drafts yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {aiDrafts.map((draft) => (
                  <button
                    key={draft.id}
                    onClick={() => setSelectedDraft(draft.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedDraft === draft.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        Pass {draft.pass_number}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(draft.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <span>{draft.model_used}</span>
                      <span className="ml-2">${draft.total_cost.toFixed(4)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-3">
          {selectedDraftData ? (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Pass {selectedDraftData.pass_number} Content
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Model: {selectedDraftData.model_used}</span>
                  <span>•</span>
                  <span>Cost: ${selectedDraftData.total_cost.toFixed(4)}</span>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap">
                  {selectedDraftData.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Content Available
                </h3>
                <p className="text-gray-600 mb-6">
                  Generate an AI draft to see the chapter content here.
                </p>
                <button
                  onClick={handleGenerateAIDraft}
                  disabled={generatingDraft}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  {generatingDraft ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate AI Draft
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}