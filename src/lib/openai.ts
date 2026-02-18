import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PromptTemplate {
  projectTitle: string;
  genre: string;
  tropes: string[];
  pov: string;
  heatLevel: string;
  chapterNumber: number;
  chapterTitle?: string;
  previousChapterSummary?: string;
  targetWordCount: number;
}

export function generatePrompt(template: PromptTemplate): string {
  const tropesString = template.tropes.join(', ');
  
  let prompt = `You are an expert romance novelist. Write Chapter ${template.chapterNumber}`;
  
  if (template.chapterTitle) {
    prompt += ` titled "${template.chapterTitle}"`;
  }
  
  prompt += ` for the romance novel "${template.projectTitle}".

Genre: ${template.genre}
Tropes: ${tropesString}
Point of View: ${template.pov.replace(/_/g, ' ')}
Heat Level: ${template.heatLevel}
Target Word Count: ${template.targetWordCount} words

Writing Guidelines:
1. Maintain consistent character voices and personalities
2. Include sensory details and emotional depth
3. Balance dialogue with narrative
4. End with a hook that makes readers want to continue
5. Match the specified heat level appropriately
6. Stay true to the genre conventions and tropes`;

  if (template.previousChapterSummary) {
    prompt += `\n\nPrevious Chapter Summary:\n${template.previousChapterSummary}`;
  }

  prompt += `\n\nWrite the complete chapter now:`;

  return prompt;
}

export async function generateAIDraft(
  prompt: string,
  model: string = process.env.OPENAI_MODEL || 'gpt-4o'
): Promise<{
  content: string;
  promptTokens: number;
  completionTokens: number;
  totalCost: number;
  modelUsed: string;
}> {
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert romance novelist with years of experience writing bestselling novels. Your writing is engaging, emotionally resonant, and professionally polished.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content || '';
    const promptTokens = completion.usage?.prompt_tokens || 0;
    const completionTokens = completion.usage?.completion_tokens || 0;
    
    // Calculate cost based on model (prices as of 2024, adjust as needed)
    let totalCost = 0;
    if (model === 'gpt-4o' || model === 'gpt-4o-2024-08-06') {
      // GPT-4o pricing: $5/1M input tokens, $15/1M output tokens
      totalCost = (promptTokens * 0.000005) + (completionTokens * 0.000015);
    } else if (model === 'gpt-4-turbo' || model === 'gpt-4-turbo-preview') {
      // GPT-4 Turbo pricing: $10/1M input tokens, $30/1M output tokens
      totalCost = (promptTokens * 0.00001) + (completionTokens * 0.00003);
    } else if (model === 'gpt-3.5-turbo') {
      // GPT-3.5 Turbo pricing: $0.50/1M input tokens, $1.50/1M output tokens
      totalCost = (promptTokens * 0.0000005) + (completionTokens * 0.0000015);
    }

    return {
      content,
      promptTokens,
      completionTokens,
      totalCost,
      modelUsed: model
    };
  } catch (error) {
    console.error('Error generating AI draft:', error);
    throw new Error('Failed to generate AI draft');
  }
}

export default openai;