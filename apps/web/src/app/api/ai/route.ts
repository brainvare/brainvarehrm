import { GoogleGenerativeAI, FunctionCallingMode } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { aiToolDeclarations, aiToolHandlers } from '@/lib/ai-tools';

const SYSTEM_PROMPT = `You are BrainvareHRM AI Copilot — an agentic HR assistant with full read/write access to the BrainvareHRM database via tool calls.

You can:
- **READ**: list employees, departments, leaves, helpdesk tickets, expenses, loans, assets, announcements, policies; get org stats.
- **WRITE**: create announcements, policies, helpdesk tickets, loans, assets, recognitions, surveys, wellness programs, social posts, travel requests, overtime entries; approve/reject leaves & expenses; assign assets; award XP.

Operating principles:
1. **Be agentic.** When the user asks you to do something, call the right tools immediately. Don't just describe what you'd do.
2. **Chain tools.** If a task needs an employee lookup followed by an action, do both — don't ask the user to give you an employee ID.
3. **Confirm destructive ops** in plain English ("I'll reject leave request #XYZ — proceed?") only when the user's intent is ambiguous; otherwise act.
4. **Report results** clearly: state what you did, the IDs created, and any errors.
5. **Indian HR context**: INR currency, Indian labor laws, statutory compliance defaults.
6. **For policy/legal questions** without tool calls, answer concisely with a disclaimer to verify with a qualified professional.
7. **For letters / JDs / calculations** — produce complete, professional output ready to use.

Be concise, decisive, and helpful. The user is an HR admin who values speed.`;

const MAX_TOOL_LOOPS = 5;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Add GEMINI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const { messages, mode } = await request.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];
    let lastError = '';
    const actions: Array<{ tool: string; args: any; result: any }> = [];

    for (const modelName of models) {
      try {
        const useTools = !mode || mode === 'general' || mode === 'agent';

        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT,
          tools: useTools ? [{ functionDeclarations: aiToolDeclarations }] : undefined,
          toolConfig: useTools ? { functionCallingConfig: { mode: FunctionCallingMode.AUTO } } : undefined,
        });

        const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history });
        const lastMessage = messages[messages.length - 1].content;

        let prompt = lastMessage;
        if (mode === 'letter') prompt = `Draft a professional HR letter. Use formal letter formatting (date, ref, subject, body, signature). Request: ${lastMessage}`;
        else if (mode === 'calculate') prompt = `Perform this HR/payroll calculation. Show formula, inputs, step-by-step working, final result. Question: ${lastMessage}`;
        else if (mode === 'policy') prompt = `Answer this HR policy question based on Indian corporate HR practices. Cite labor laws if applicable. Question: ${lastMessage}`;
        else if (mode === 'jd') prompt = `Draft a job description with: About the Role, Key Responsibilities, Requirements, Nice-to-Haves, What We Offer. Request: ${lastMessage}`;
        else if (mode === 'insights') prompt = `Analyze this HR data and provide actionable insights. Data: ${lastMessage}`;

        let result = await chat.sendMessage(prompt);

        for (let loop = 0; loop < MAX_TOOL_LOOPS; loop++) {
          const calls = result.response.functionCalls();
          if (!calls || calls.length === 0) break;

          const responses = await Promise.all(
            calls.map(async (call) => {
              const handler = aiToolHandlers[call.name];
              let toolResult: any;
              if (!handler) {
                toolResult = { error: `Unknown tool: ${call.name}` };
              } else {
                try {
                  toolResult = await handler(call.args || {});
                } catch (e: any) {
                  toolResult = { error: e.message || 'Tool execution failed' };
                }
              }
              actions.push({ tool: call.name, args: call.args, result: toolResult });
              return { functionResponse: { name: call.name, response: { result: toolResult } } };
            })
          );

          result = await chat.sendMessage(responses);
        }

        const response = result.response.text();
        return NextResponse.json({ response, actions });
      } catch (e: any) {
        lastError = e.message || 'Unknown error';
        console.error(`Model ${modelName} failed:`, lastError);
        continue;
      }
    }

    return NextResponse.json({
      error: `All AI models failed. Last error: ${lastError}. Your API key may have exceeded its quota — visit https://aistudio.google.com/apikey to check.`,
    }, { status: 429 });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to get AI response' }, { status: 500 });
  }
}
