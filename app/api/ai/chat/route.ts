import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, thoughtContext }: { messages: UIMessage[]; thoughtContext?: any } = await req.json();

    // Build system prompt with investigation context
    const systemPrompt = `You are an AI assistant helping with OSINT (Open Source Intelligence) investigations.

Context: You are analyzing an investigation board where investigators create Thoughts (Questions, Hypotheses, Claims, Observations) and attach Evidence that either Supports, Contradicts, or provides Context.

${thoughtContext ? `Current Thought: ${thoughtContext.title}\nType: ${thoughtContext.type}\nDescription: ${thoughtContext.body}\nConfidence: ${thoughtContext.confidence}%\n\nEvidence Summary:\n${thoughtContext.evidenceSummary}` : ''}

Your role:
- Help investigators think critically about their analysis
- Suggest next investigation steps
- Identify gaps, contradictions, and patterns
- Recommend confidence adjustments based on evidence strength
- Propose new thoughts or evidence to gather
- Be cautious and analytical, not definitive

Always structure your responses to be actionable and specific to OSINT investigations.`;

    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('AI Chat Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate response', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
