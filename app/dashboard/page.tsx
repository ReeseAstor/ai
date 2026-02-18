import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get projects overview
  const { data: projects } = await supabase
    .from('projects')
    .select('*, chapters(count)')
    .order('created_at', { ascending: false })
    .limit(10)

  // Get recent drafts
  const { data: recentDrafts } = await supabase
    .from('ai_drafts')
    .select(`
      *,
      chapter:chapters (
        id,
        chapter_number,
        title,
        project:projects (
          id,
          title
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {profile?.name || user.email} ({profile?.role})
              </span>
              <Link
                href="/projects/new"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                New Project
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Projects</div>
            <div className="text-3xl font-bold text-gray-900">{projects?.length || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Active Projects</div>
            <div className="text-3xl font-bold text-gray-900">
              {projects?.filter(p => p.status === 'writing').length || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Chapters</div>
            <div className="text-3xl font-bold text-gray-900">
              {projects?.reduce((sum, p) => sum + (p.chapters?.[0]?.count || 0), 0) || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Recent Drafts</div>
            <div className="text-3xl font-bold text-gray-900">{recentDrafts?.length || 0}</div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Genre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chapters
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heat Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects?.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.genre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${project.status === 'published' ? 'bg-green-100 text-green-800' : 
                          project.status === 'writing' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'editing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.chapters?.[0]?.count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="capitalize">{project.heat_level.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!projects?.length && (
              <div className="text-center py-8 text-gray-500">
                No projects yet. Create your first project to get started!
              </div>
            )}
          </div>
        </div>

        {/* Recent Drafts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent AI Drafts</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentDrafts?.map((draft) => (
              <div key={draft.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {draft.chapter?.project?.title} - Chapter {draft.chapter?.chapter_number}
                    </p>
                    <p className="text-sm text-gray-500">
                      Pass #{draft.pass_number} • {draft.model_used}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(draft.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {!recentDrafts?.length && (
              <div className="text-center py-8 text-gray-500">
                No drafts generated yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}