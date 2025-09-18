# Romance Book Factory - AI-Powered Romance Novel Creation Platform

A Next.js 14 application with Supabase integration for creating and managing AI-generated romance novels.

## Features

- **Authentication**: Email/password authentication with role-based access (Admin, AI Agent, Beta Reader)
- **Project Management**: Create and manage romance book projects with metadata tracking
- **Chapter Organization**: Structure books into chapters with status tracking
- **AI Draft Generation**: Generate and iterate on chapter content using AI models
- **Beta Reader Feedback**: Collect ratings and feedback from beta readers
- **Business Metrics**: Track costs and ROI for each project

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd romance-book-factory
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
   - Go to your Supabase project SQL editor
   - Run the SQL script from `supabase_schema.sql`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes for CRUD operations
│   │   ├── projects/      # Project endpoints
│   │   ├── chapters/      # Chapter endpoints
│   │   └── drafts/        # AI draft endpoints
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   └── projects/          # Project management pages
├── components/            # React components
│   └── auth/             # Authentication components
├── lib/                   # Utility libraries
│   └── supabase/         # Supabase client configuration
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get single project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Chapters
- `GET /api/chapters?project_id=` - List chapters for a project
- `POST /api/chapters` - Create new chapter
- `GET /api/chapters/[id]` - Get single chapter
- `PUT /api/chapters/[id]` - Update chapter
- `DELETE /api/chapters/[id]` - Delete chapter

### AI Drafts
- `GET /api/drafts?chapter_id=` - List drafts for a chapter
- `POST /api/drafts` - Create new draft
- `GET /api/drafts/[id]` - Get single draft
- `DELETE /api/drafts/[id]` - Delete draft
- `POST /api/drafts/[id]/finalize` - Convert draft to final chapter

## Database Schema

The application uses the following main tables:

- **users**: System users with roles (admin, ai_agent, beta_reader)
- **projects**: Romance book projects with metadata
- **chapters**: Individual chapters within projects
- **ai_drafts**: AI-generated content iterations
- **final_chapters**: Approved final versions
- **feedback**: Beta reader ratings and comments

## Development

### Building for Production

```bash
npm run build
npm start
```

### Type Generation

TypeScript types are defined in `/types/database.ts`. Update these when modifying the database schema.

## Security

- Row Level Security (RLS) policies are implemented in Supabase
- Authentication required for all API endpoints
- Role-based access control for sensitive operations

## License

MIT