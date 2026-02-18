# AI Romance Book Factory - Setup Guide

## Quick Start

### 1. Environment Setup

1. Copy the environment file:
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

### 2. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Go to the SQL Editor in your Supabase dashboard

3. Run the database schema:
   - Copy the contents of `supabase_schema.sql`
   - Paste and run in the SQL Editor

4. Run the migration:
   - Copy the contents of `supabase_migrations.sql`
   - Paste and run in the SQL Editor

5. (Optional) Add sample data:
   - Copy the contents of `supabase_seed.sql`
   - Paste and run in the SQL Editor

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

✅ **Project Management**: Create and manage romance novel projects
✅ **AI Draft Generation**: Generate chapter drafts using OpenAI's GPT models
✅ **Chapter Management**: Add, view, and manage chapters
✅ **Cost Tracking**: Automatic tracking of AI generation costs
✅ **Beautiful UI**: Modern, responsive interface

## Usage

1. **Create a Project**: Click "New Project" on the home page
2. **Add Chapters**: Click "Add Chapter" in your project
3. **Generate AI Drafts**: Click "Generate AI Draft" for any chapter
4. **View Content**: Click "View Chapter" to see generated content

## Troubleshooting

- Make sure all environment variables are set correctly
- Ensure your Supabase project is properly configured
- Check that your OpenAI API key has sufficient credits
- Verify the database schema was created successfully

## Support

If you encounter any issues, check the console for error messages and ensure all dependencies are installed correctly.