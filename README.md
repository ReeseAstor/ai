# AI Romance Book Factory

An AI-powered platform for generating romance novels using OpenAI's GPT models. This application allows you to manage romance book projects, generate AI drafts for chapters, and track the progress of your novels.

## Features

- 📚 **Project Management**: Create and manage multiple romance novel projects
- 🤖 **AI Draft Generation**: Generate chapter drafts using OpenAI's GPT-4o or GPT-5
- 📊 **Progress Tracking**: Track chapter status, word counts, and project costs
- 💰 **Cost Management**: Automatic tracking of AI generation costs
- 🎨 **Beautiful UI**: Modern, responsive interface with a romantic theme

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI API (GPT-4o/GPT-5)
- **Icons**: Lucide React

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account
- OpenAI API key

### 2. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the database schema:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase_schema.sql`
   - Run the SQL to create all tables and types

3. Run the migration for the ai_draft status:
   - Copy the contents of `supabase_migrations.sql`
   - Run the SQL in the SQL Editor

4. (Optional) Add sample data:
   - Copy the contents of `supabase_seed.sql`
   - Run the SQL to add sample projects and chapters

### 3. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-4o
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 4. Installation

Install dependencies:
```bash
npm install
```

### 5. Run the Application

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Project

1. Navigate to the home page
2. Click "New Project" (functionality to be implemented)
3. Fill in project details including title, genre, tropes, POV, and heat level

### Generating AI Drafts

1. Click on a project to view its details
2. Find the chapter you want to generate
3. Click the "Generate AI Draft" button
4. The AI will generate a draft based on:
   - Project metadata (genre, tropes, POV, heat level)
   - Chapter number and title
   - Previous chapter context (if available)
   - Target word count

### Chapter Status Flow

- `not_started` → Initial state
- `in_progress` → Being worked on
- `ai_draft` → AI draft has been generated
- `draft_complete` → Human-edited draft ready
- `under_review` → Being reviewed
- `approved` → Approved for publication
- `published` → Published

## API Endpoints

### POST /api/ai-draft
Generates an AI draft for a chapter.

**Request Body:**
```json
{
  "chapterId": "chapter-uuid",
  "projectId": "project-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "draft": {
    "id": "draft-uuid",
    "content": "Generated chapter content...",
    "model_used": "gpt-4o",
    "pass_number": 1,
    "total_cost": 0.0234
  },
  "message": "AI draft generated successfully (Pass 1)"
}
```

## Cost Tracking

The application automatically tracks OpenAI API costs:
- GPT-4o: $5/1M input tokens, $15/1M output tokens
- GPT-4 Turbo: $10/1M input tokens, $30/1M output tokens
- GPT-3.5 Turbo: $0.50/1M input tokens, $1.50/1M output tokens

Costs are stored per draft and aggregated at the project level.

## Database Schema

The application uses the following main tables:
- `users`: System users (admins, AI agents, beta readers)
- `projects`: Romance book projects
- `chapters`: Individual chapters within projects
- `ai_drafts`: AI-generated chapter drafts
- `final_chapters`: Approved final versions
- `feedback`: Beta reader feedback

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Project creation and editing UI
- [ ] Chapter content viewer and editor
- [ ] Beta reader feedback system
- [ ] Export to various formats (EPUB, PDF)
- [ ] Advanced prompt customization
- [ ] Multiple AI model support
- [ ] Revision and editing workflows
- [ ] Publishing integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.