'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Chapter, AIDraft, Project } from '@/types/database';
import { 
  BookOpen, 
  Sparkles, 
  Clock, 
  Target, 
  Loader2, 
  Save, 
  ArrowLeft, 
  RefreshCw,
  Eye,
  Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChapterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.id as string;
  
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [aiDrafts, setAIDrafts] = useState<AIDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(0);

  useEffect(() => {
    if (chapterId) {
      fetchChapterData();
    }
  }, [chapterId]);

  const fetchChapterData = async () => {
    try {
      // Fetch chapter details
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .single();

      if (chapterError) throw chapterError;
      setChapter(chapterData);

      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', chapterData.project_id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch AI drafts
      const { data: draftsData, error: draftsError } = await supabase
        .from('ai_drafts')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('pass_number', { ascending: false });

      if (draftsError) throw draftsError;
      setAIDrafts(draftsData || []);
      
      // Set initial edit content from latest draft
      if (draftsData && draftsData.length > 0) {
        setEditContent(draftsData[0].content);
      }
    } catch (error) {
      console.error('Error fetching chapter data:', error);
      toast.error('Failed to load chapter data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIDraft = async () => {
    if (!chapter || !project) return;
    
    setGeneratingDraft(true);
    
    try {
      const response = await fetch('/api/ai-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId: chapter.id,
          projectId: project.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate AI draft');
      }

      toast.success(data.message || 'AI draft generated successfully!');
      
      // Refresh chapter data
      await fetchChapterData();
    } catch (error) {
      console.error('Error generating AI draft:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate AI draft');
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleSaveContent = async () => {
    if (!chapter) return;
    
    setSaving(true);
    
    try {
      // Update chapter content and status
      const { error: updateError } = await supabase
        .from('chapters')
        .update({
          status: 'draft_complete',
          word_count: editContent.split(' ').length,
        })
        .eq('id', chapterId);

      if (updateError) throw updateError;

      // Create a new draft entry for manual edits
      const { error: draftError } = await supabase
        .from('ai_drafts')
        .insert({
          chapter_id: chapterId,
          content: editContent,
          model_used: 'manual_edit',
          pass_number: aiDrafts.length + 1,
          prompt_tokens: 0,
          completion_tokens: 0,
          total_cost: 0,
        });

      if (draftError) throw draftError;

      toast.success('Chapter saved successfully!');
      setIsEditing(false);
      await fetchChapterData();
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast.error('Failed to save chapter');
    } finally {
      setSaving(false);
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

  const formatContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!chapter || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Chapter not found</p>
      </div>
    );
  }

  const currentDraft = aiDrafts[selectedDraftIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="card mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <button
              onClick={() => router.push(`/projects/${project.id}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {project.title}
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Chapter {chapter.chapter_number}
              {chapter.title && `: ${chapter.title}`}
            </h1>
            
            <div className="flex items-center gap-4 text-sm">
              <span className={`status-badge ${getStatusColor(chapter.status)}`}>
                {chapter.status.replace('_', ' ').toUpperCase()}
              </span>
              <div className="flex items-center gap-1 text-gray-600">
                <Target className="w-4 h-4" />
                <span>{chapter.word_count} / {chapter.target_word_count} words</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Created {new Date(chapter.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                {(chapter.status === 'not_started' || chapter.status === 'in_progress' || aiDrafts.length === 0) ? (
                  <button
                    onClick={handleGenerateAIDraft}
                    disabled={generatingDraft}
                    className="btn-primary flex items-center gap-2"
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
                ) : (
                  <>
                    <button
                      onClick={handleGenerateAIDraft}
                      disabled={generatingDraft}
                      className="btn-outline flex items-center gap-2"
                    >
                      {generatingDraft ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Regenerate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(currentDraft?.content || '');
                  }}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveContent}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Draft Version Selector */}
        {aiDrafts.length > 0 && !isEditing && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Draft Version:
              </label>
              <select
                value={selectedDraftIndex}
                onChange={(e) => {
                  const index = parseInt(e.target.value);
                  setSelectedDraftIndex(index);
                  setEditContent(aiDrafts[index].content);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {aiDrafts.map((draft, index) => (
                  <option key={draft.id} value={index}>
                    Pass {draft.pass_number} - {draft.model_used === 'manual_edit' ? 'Manual Edit' : draft.model_used}
                    {' '}({new Date(draft.created_at).toLocaleString()})
                  </option>
                ))}
              </select>
              {currentDraft && currentDraft.total_cost > 0 && (
                <span className="text-sm text-gray-600">
                  Cost: ${currentDraft.total_cost.toFixed(4)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="card">
        {aiDrafts.length === 0 && !isEditing ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No content yet. Generate an AI draft to get started!</p>
            <button
              onClick={handleGenerateAIDraft}
              disabled={generatingDraft}
              className="btn-primary inline-flex items-center gap-2"
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
        ) : isEditing ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Chapter Content</h3>
              <span className="text-sm text-gray-600">
                Word Count: {editContent.split(' ').length}
              </span>
            </div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-[600px] p-4 border border-gray-300 rounded-lg font-serif text-lg leading-relaxed focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Start writing your chapter..."
            />
          </div>
        ) : currentDraft ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Chapter Content
              </h3>
              <span className="text-sm text-gray-600">
                Word Count: {currentDraft.content.split(' ').length}
              </span>
            </div>
            <div className="prose prose-lg max-w-none font-serif">
              {formatContent(currentDraft.content)}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}