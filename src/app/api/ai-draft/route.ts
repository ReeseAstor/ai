import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateAIDraft, generatePrompt, PromptTemplate } from '@/lib/openai';
import { Chapter, Project, AIDraft } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterId, projectId } = body;

    if (!chapterId || !projectId) {
      return NextResponse.json(
        { error: 'Chapter ID and Project ID are required' },
        { status: 400 }
      );
    }

    // Fetch chapter details
    const { data: chapter, error: chapterError } = await supabaseAdmin
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single();

    if (chapterError || !chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Fetch project details
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get the latest pass number for this chapter
    const { data: existingDrafts } = await supabaseAdmin
      .from('ai_drafts')
      .select('pass_number')
      .eq('chapter_id', chapterId)
      .order('pass_number', { ascending: false })
      .limit(1);

    const passNumber = existingDrafts && existingDrafts.length > 0 
      ? existingDrafts[0].pass_number + 1 
      : 1;

    // Get previous chapter summary if not the first chapter
    let previousChapterSummary: string | undefined;
    if (chapter.chapter_number > 1) {
      const { data: previousChapter } = await supabaseAdmin
        .from('chapters')
        .select('id')
        .eq('project_id', projectId)
        .eq('chapter_number', chapter.chapter_number - 1)
        .single();

      if (previousChapter) {
        const { data: previousDraft } = await supabaseAdmin
          .from('ai_drafts')
          .select('content')
          .eq('chapter_id', previousChapter.id)
          .order('pass_number', { ascending: false })
          .limit(1);

        if (previousDraft && previousDraft.length > 0) {
          // Create a brief summary of the previous chapter (first 500 chars for context)
          previousChapterSummary = previousDraft[0].content.substring(0, 500) + '...';
        }
      }
    }

    // Generate prompt
    const promptTemplate: PromptTemplate = {
      projectTitle: project.title,
      genre: project.genre,
      tropes: project.tropes,
      pov: project.pov,
      heatLevel: project.heat_level,
      chapterNumber: chapter.chapter_number,
      chapterTitle: chapter.title || undefined,
      previousChapterSummary,
      targetWordCount: chapter.target_word_count
    };

    const prompt = generatePrompt(promptTemplate);

    // Generate AI draft
    const aiResponse = await generateAIDraft(prompt);

    // Save AI draft to database
    const { data: aiDraft, error: aiDraftError } = await supabaseAdmin
      .from('ai_drafts')
      .insert({
        chapter_id: chapterId,
        content: aiResponse.content,
        model_used: aiResponse.modelUsed,
        pass_number: passNumber,
        prompt_tokens: aiResponse.promptTokens,
        completion_tokens: aiResponse.completionTokens,
        total_cost: aiResponse.totalCost
      })
      .select()
      .single();

    if (aiDraftError) {
      console.error('Error saving AI draft:', aiDraftError);
      return NextResponse.json(
        { error: 'Failed to save AI draft' },
        { status: 500 }
      );
    }

    // Update chapter status to 'ai_draft'
    const { error: updateError } = await supabaseAdmin
      .from('chapters')
      .update({ 
        status: 'ai_draft',
        word_count: aiResponse.content.split(' ').length
      })
      .eq('id', chapterId);

    if (updateError) {
      console.error('Error updating chapter status:', updateError);
    }

    // Update project cost
    const { error: costUpdateError } = await supabaseAdmin
      .from('projects')
      .update({ 
        cost: project.cost + aiResponse.totalCost 
      })
      .eq('id', projectId);

    if (costUpdateError) {
      console.error('Error updating project cost:', costUpdateError);
    }

    return NextResponse.json({
      success: true,
      draft: aiDraft,
      message: `AI draft generated successfully (Pass ${passNumber})`
    });

  } catch (error) {
    console.error('Error in AI draft generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}