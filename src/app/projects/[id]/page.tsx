'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Project, Chapter, AIDraft } from '@/types/database';
import { BookOpen, Sparkles, Clock, Target, DollarSign, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingDraft, setGeneratingDraft] = useState<string | null>(null);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [newChapterForm, setNewChapterForm] = useState({
    title: '',
    target_word_count: 2000
  });

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch chapters
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('project_id', projectId)
        .order('chapter_number', { ascending: true });

      if (chaptersError) throw chaptersError;
      setChapters(chaptersData || []);
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChapter = async () => {
    if (!newChapterForm.title.trim()) {
      toast.error('Chapter title is required');
      return;
    }

    try {
      // Get the next chapter number
      const nextChapterNumber = chapters.length > 0
        ? Math.max(...chapters.map(c => c.chapter_number)) + 1
        : 1;

      const { data: newChapter, error } = await supabase
        .from('chapters')
        .insert({
          project_id: projectId,
          chapter_number: nextChapterNumber,
          title: newChapterForm.title.trim(),
          status: 'not_started',
          word_count: 0,
          target_word_count: newChapterForm.target_word_count
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Chapter added successfully!');
      setShowAddChapterModal(false);
      setNewChapterForm({ title: '', target_word_count: 2000 });

      // Refresh project data to include the new chapter
      await fetchProjectData();
    } catch (error) {
      console.error('Error adding chapter:', error);
      toast.error('Failed to add chapter');
    }
  };

  const handleGenerateAIDraft = async (chapterId: string) => {
    setGeneratingDraft(chapterId);

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

      // Refresh chapters to show updated status
      await fetchProjectData();
    } catch (error) {
      console.error('Error generating AI draft:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate AI draft');
    } finally {
      setGeneratingDraft(null);
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

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Project not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Project Header */}
      <div className="card mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`status-badge ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="status-badge bg-pink-100 text-pink-800">
                {project.genre}
              </span>
              <span className="status-badge bg-purple-100 text-purple-800">
                {project.heat_level.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
          <BookOpen className="w-8 h-8 text-primary-600" />
        </div>

        {/* Project Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">POV</p>
              <p className="font-semibold">{project.pov.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Deadline</p>
              <p className="font-semibold">
                {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Cost</p>
              <p className="font-semibold">${project.cost.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">ROI</p>
              <p className="font-semibold">{project.roi.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Tropes */}
        {project.tropes && project.tropes.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Tropes:</p>
            <div className="flex flex-wrap gap-2">
              {project.tropes.map((trope, index) => (
                <span key={index} className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm">
                  {trope}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chapters Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Chapters</h2>
          <button
            onClick={() => setShowAddChapterModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Chapter
          </button>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No chapters yet. Start by adding your first chapter!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Chapter {chapter.chapter_number}
                        {chapter.title && `: ${chapter.title}`}
                      </h3>
                      <span className={`status-badge ${getStatusColor(chapter.status)}`}>
                        {chapter.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Words: {chapter.word_count} / {chapter.target_word_count}</span>
                      <span>•</span>
                      <span>Created: {new Date(chapter.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {chapter.status === 'not_started' || chapter.status === 'in_progress' ? (
                      <button
                        onClick={() => handleGenerateAIDraft(chapter.id)}
                        disabled={generatingDraft === chapter.id}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingDraft === chapter.id ? (
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
                        onClick={() => handleGenerateAIDraft(chapter.id)}
                        disabled={generatingDraft === chapter.id}
                        className="btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingDraft === chapter.id ? (
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
                    ) : (
                      <button
                        onClick={() => router.push(`/projects/${projectId}/chapters/${chapter.id}`)}
                        className="btn-secondary"
                      >
                        View Chapter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Chapter Modal */}
      {showAddChapterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Chapter</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  value={newChapterForm.title}
                  onChange={(e) => setNewChapterForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                  placeholder="Enter chapter title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Word Count
                </label>
                <input
                  type="number"
                  value={newChapterForm.target_word_count}
                  onChange={(e) => setNewChapterForm(prev => ({ ...prev, target_word_count: parseInt(e.target.value) || 2000 }))}
                  className="input-field"
                  min="100"
                  max="10000"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddChapterModal(false);
                  setNewChapterForm({ title: '', target_word_count: 2000 });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChapter}
                className="btn-primary"
              >
                Add Chapter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}