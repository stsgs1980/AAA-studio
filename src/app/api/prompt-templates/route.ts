/** Prompt Template API — CRUD + built-in seeding. */
import { db } from '@/lib/db';
import { handleError, success, BadRequest } from '@/lib/api-error';

const BUILTINS = [
  { name: 'Summarizer', description: 'Condense text into key points', category: 'analysis', content: 'Summarize the following text concisely:', systemPrompt: 'You are a summarization expert. Extract key points and present them clearly.', temperature: 0.3, maxTokens: 2048, nodeType: 'llm', tags: '["summary","condense"]', isBuiltin: true },
  { name: 'Translator', description: 'Translate text between languages', category: 'general', content: 'Translate the following to {{language}}:', systemPrompt: 'You are a professional translator. Maintain tone and meaning accurately.', temperature: 0.3, maxTokens: 4096, nodeType: 'llm', tags: '["translate","language"]', isBuiltin: true },
  { name: 'Code Reviewer', description: 'Review code for issues and improvements', category: 'coding', content: 'Review this code for bugs, style issues, and improvements:', systemPrompt: 'You are a senior code reviewer. Identify bugs, security issues, performance problems, and suggest improvements.', temperature: 0.2, maxTokens: 4096, nodeType: 'llm', tags: '["code","review"]', isBuiltin: true },
  { name: 'Sentiment Analyzer', description: 'Analyze sentiment of text', category: 'analysis', content: 'Analyze the sentiment of:', systemPrompt: 'You analyze text sentiment. Classify as positive, negative, or neutral with confidence score and reasoning.', temperature: 0.1, maxTokens: 1024, nodeType: 'llm', tags: '["sentiment","classification"]', isBuiltin: true },
  { name: 'Conversational Agent', description: 'Friendly chatbot with memory', category: 'conversation', content: '', systemPrompt: 'You are a friendly, helpful assistant. Engage naturally, remember context, and provide thoughtful responses.', temperature: 0.7, maxTokens: 4096, nodeType: 'agent', tags: '["chat","memory"]', isBuiltin: true },
  { name: 'Step-by-Step Reasoner', description: 'Chain-of-thought reasoning', category: 'reasoning', content: 'Think step by step:', systemPrompt: 'You reason through problems step by step. Show your reasoning chain clearly before giving the final answer.', temperature: 0.3, maxTokens: 4096, nodeType: 'llm', tags: '["reasoning","chain-of-thought"]', isBuiltin: true },
  { name: 'Creative Writer', description: 'Generate creative content', category: 'creative', content: 'Write about:', systemPrompt: 'You are a creative writer. Be imaginative, use vivid language, and craft engaging content.', temperature: 0.9, maxTokens: 4096, nodeType: 'llm', tags: '["creative","writing"]', isBuiltin: true },
  { name: 'Data Extractor', description: 'Extract structured data from text', category: 'analysis', content: 'Extract the following fields from the text:', systemPrompt: 'You extract structured data from unstructured text. Output valid JSON only.', temperature: 0.1, maxTokens: 2048, nodeType: 'llm', tags: '["extract","json","structured"]', isBuiltin: true },
];

export async function GET() {
  try {
    let templates = await db.promptTemplate.findMany({ orderBy: [{ isBuiltin: 'desc' }, { name: 'asc' }] });
    if (templates.length === 0) {
      await db.promptTemplate.createMany({ data: BUILTINS });
      templates = await db.promptTemplate.findMany({ orderBy: [{ isBuiltin: 'desc' }, { name: 'asc' }] });
    }
    return success(templates.map((t) => ({ ...t, tags: JSON.parse(t.tags), variables: JSON.parse(t.variables ?? '[]') })));
  } catch (e) { return handleError(e); }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.content) throw BadRequest('name and content required');
    const tpl = await db.promptTemplate.create({
      data: {
        name: body.name, description: body.description ?? '', category: body.category ?? 'general',
        content: body.content, systemPrompt: body.systemPrompt ?? '',
        temperature: body.temperature ?? 0.7, maxTokens: body.maxTokens ?? 4096,
        nodeType: body.nodeType ?? 'llm', variables: JSON.stringify(body.variables ?? []),
        tags: JSON.stringify(body.tags ?? []), isBuiltin: false,
      },
    });
    return success(tpl);
  } catch (e) { return handleError(e); }
}
