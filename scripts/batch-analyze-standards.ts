import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const EVAL_PROMPT = `You are a rigorous AI agent quality auditor. Analyze the provided coding standard and produce a BRIEF evaluation.

Output ONLY this compact format (one line per criterion):
OVERALL: <score>/10 -- <PASS|WARN|FAIL> | <one sentence summary>
1.Purpose:<score> 2.Clarity:<score> 3.Completeness:<score> 4.Consistency:<score> 5.Actionability:<score> 6.ErrorHandling:<score> 7.Security:<score> 8.Documentation:<score>
CRITICAL: <any critical issues or "None">
TOP_FIX: <single most important fix needed>`;

async function main() {
  const zai = await ZAI.create();
  const dir = 'Zai-agent-toolkit/standards';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();

  console.log('DEEP LLM ANALYSIS OF ALL TOOLKIT STANDARDS');
  console.log('='.repeat(90));
  console.log();

  for (const f of files) {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    process.stdout.write(`Analyzing ${f}... `);
    
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: EVAL_PROMPT },
          { role: 'user', content: 'Standard file: ' + f + '\n\n' + content.slice(0, 12000) }
        ],
        temperature: 0.2,
        max_tokens: 512,
      });
      
      const result = completion.choices[0]?.message?.content || 'No response';
      console.log('\n' + result + '\n');
    } catch (e: any) {
      console.log('ERROR: ' + e.message);
    }
  }
}

main().catch(console.error);
