'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ProjectStatus, POVType, HeatLevel } from '@/types/database';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProjectFormData {
  title: string;
  genre: string;
  tropes: string[];
  pov: POVType;
  heat_level: HeatLevel;
  deadline: string;
  target_chapters: number;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    genre: '',
    tropes: [],
    pov: 'third_person_limited',
    heat_level: 'moderate',
    deadline: '',
    target_chapters: 12
  });

  const [tropeInput, setTropeInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to create a project');
        return;
      }

      // Create the project
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          title: formData.title,
          genre: formData.genre,
          tropes: formData.tropes,
          pov: formData.pov,
          heat_level: formData.heat_level,
          status: 'planning' as ProjectStatus,
          deadline: formData.deadline || null,
          cost: 0,
          roi: 0,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial chapters
      const chapters = [];
      for (let i = 1; i <= formData.target_chapters; i++) {
        chapters.push({
          project_id: project.id,
          chapter_number: i,
          title: null,
          status: 'not_started',
          word_count: 0,
          target_word_count: 2000 // Default target
        });
      }

      const { error: chaptersError } = await supabase
        .from('chapters')
        .insert(chapters);

      if (chaptersError) throw chaptersError;

      toast.success('Project created successfully!');
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const addTrope = () => {
    if (tropeInput.trim() && !formData.tropes.includes(tropeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tropes: [...prev.tropes, tropeInput.trim()]
      }));
      setTropeInput('');
    }
  };

  const removeTrope = (trope: string) => {
    setFormData(prev => ({
      ...prev,
      tropes: prev.tropes.filter(t => t !== trope)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTrope();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="btn-secondary flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Project
        </h1>
        <p className="text-gray-600">
          Set up your AI-powered romance novel project
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="Enter your romance novel title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre *
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                className="input-field"
                required
              >
                <option value="">Select genre</option>
                <option value="Contemporary Romance">Contemporary Romance</option>
                <option value="Historical Romance">Historical Romance</option>
                <option value="Paranormal Romance">Paranormal Romance</option>
                <option value="Romantic Suspense">Romantic Suspense</option>
                <option value="Romantic Comedy">Romantic Comedy</option>
                <option value="Erotic Romance">Erotic Romance</option>
                <option value="Fantasy Romance">Fantasy Romance</option>
                <option value="Young Adult Romance">Young Adult Romance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Point of View *
              </label>
              <select
                value={formData.pov}
                onChange={(e) => setFormData(prev => ({ ...prev, pov: e.target.value as POVType }))}
                className="input-field"
                required
              >
                <option value="third_person_limited">Third Person Limited</option>
                <option value="dual_pov">Dual POV</option>
                <option value="multi_pov">Multi POV</option>
                <option value="first_person">First Person</option>
                <option value="third_person_omniscient">Third Person Omniscient</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heat Level *
              </label>
              <select
                value={formData.heat_level}
                onChange={(e) => setFormData(prev => ({ ...prev, heat_level: e.target.value as HeatLevel }))}
                className="input-field"
                required
              >
                <option value="sweet">Sweet</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="steamy">Steamy</option>
                <option value="explicit">Explicit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Chapters
              </label>
              <input
                type="number"
                value={formData.target_chapters}
                onChange={(e) => setFormData(prev => ({ ...prev, target_chapters: parseInt(e.target.value) || 12 }))}
                className="input-field"
                min="1"
                max="50"
              />
            </div>
          </div>
        </div>

        {/* Tropes */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Tropes</h2>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={tropeInput}
                onChange={(e) => setTropeInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input-field flex-1"
                placeholder="Enter a trope (e.g., Enemies to Lovers, Fake Dating)"
              />
              <button
                type="button"
                onClick={addTrope}
                className="btn-primary"
              >
                Add
              </button>
            </div>

            {formData.tropes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tropes.map((trope, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {trope}
                    <button
                      type="button"
                      onClick={() => removeTrope(trope)}
                      className="text-pink-500 hover:text-pink-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
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
              'Create Project'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}