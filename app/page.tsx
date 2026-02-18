import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AuthButton } from '@/components/auth/auth-button'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">
                📚 Romance Book Factory
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
              )}
              <AuthButton user={user} />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Romance Book Creation
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your romance story ideas into captivating novels with the power of AI. 
            Manage projects, generate chapters, and collaborate with beta readers all in one place.
          </p>
          
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                Get Started Free →
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg text-primary-600 bg-white border-2 border-primary-600 hover:bg-primary-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI-Generated Content
            </h3>
            <p className="text-gray-600">
              Generate compelling chapters with multiple AI models. Track iterations and costs.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Project Management
            </h3>
            <p className="text-gray-600">
              Organize your romance novels by genre, tropes, POV, and heat level. Track deadlines and ROI.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Beta Reader Feedback
            </h3>
            <p className="text-gray-600">
              Collaborate with beta readers to get valuable feedback and ratings on your chapters.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 bg-white rounded-2xl p-8 shadow-xl">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Platform Features
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600">∞</div>
              <p className="text-gray-600 mt-2">Projects</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">AI</div>
              <p className="text-gray-600 mt-2">Multi-Model</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">24/7</div>
              <p className="text-gray-600 mt-2">Generation</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">ROI</div>
              <p className="text-gray-600 mt-2">Tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}