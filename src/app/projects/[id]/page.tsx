'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Project, Chapter, AIDraft } from '@/types/database';
import { BookOpen, Sparkles, Clock, Target, DollarSign, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import CreateChapterModal from '@/components/CreateChapterModal';
import ChapterViewer from '@/components/ChapterViewer';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingDraft, setGeneratingDraft] = useState<string | null>(null);
  const [showCreateChapterModal, setShowCreateChapterModal] = useState(false);
  const [showChapterViewer, setShowChapterViewer] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

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

  const handleChapterCreated = (newChapter: Chapter) => {
    setChapters(prev => [...prev, newChapter].sort((a, b) => a.chapter_number - b.chapter_number));
  };

  const handleViewChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setShowChapterViewer(true);
  };

  const getNextChapterNumber = () => {
    if (chapters.length === 0) return 1;
    return Math.max(...chapters.map(c => c.chapter_number)) + 1;
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
            onClick={() => setShowCreateChapterModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
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
                        onClick={() => handleViewChapter(chapter)}
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

      {/* Create Chapter Modal */}
      <CreateChapterModal
        isOpen={showCreateChapterModal}
        onClose={() => setShowCreateChapterModal(false)}
        onChapterCreated={handleChapterCreated}
        projectId={projectId}
        nextChapterNumber={getNextChapterNumber()}
      />

      {/* Chapter Viewer Modal */}
      {selectedChapter && (
        <ChapterViewer
          isOpen={showChapterViewer}
          onClose={() => {
            setShowChapterViewer(false);
            setSelectedChapter(null);
          }}
          chapterId={selectedChapter.id}
          chapterTitle={selectedChapter.title || ''}
          chapterNumber={selectedChapter.chapter_number}
        />
      )}
    </div>
  );
}