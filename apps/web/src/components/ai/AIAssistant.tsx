'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './AIAssistant.module.css';

type Action = { tool: string; args: any; result: any };

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Action[];
};

type AIMode = 'agent' | 'letter' | 'calculate' | 'policy' | 'jd' | 'insights';

const modeConfig: Record<AIMode, { label: string; icon: string; placeholder: string }> = {
  agent: { label: 'Agent', icon: '🤖', placeholder: 'Tell me what to do — e.g. "Create an announcement about the May 20 town hall"' },
  letter: { label: 'Draft Letter', icon: '✉️', placeholder: 'e.g. "Draft an offer letter for Frontend Dev at ₹12L CTC"' },
  calculate: { label: 'Calculate', icon: '🧮', placeholder: 'e.g. "Calculate gratuity for 5 years, last salary ₹80K"' },
  policy: { label: 'Policy Q&A', icon: '📜', placeholder: 'e.g. "What is the maternity leave policy?"' },
  jd: { label: 'Job Description', icon: '📋', placeholder: 'e.g. "Write JD for Senior React Developer"' },
  insights: { label: 'Data Insights', icon: '📊', placeholder: 'e.g. "Attrition rate is 18%, avg tenure 2.1y — insights?"' },
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 Hi! I\'m **BrainvareHRM AI Copilot** — I can actually *do* things in this software for you.\n\n**Try saying:**\n• "Post an announcement about the May 20 town hall"\n• "Show me all pending leave requests"\n• "Approve the latest expense from Karan"\n• "Give Sneha 50 XP for sprint delivery"\n• "Create a wellness program for yoga every Tuesday"\n• "Raise an IT helpdesk ticket for Rahul about a slow laptop"\n\nOr ask policy/letter/calc questions via the mode selector below.', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AIMode>('agent');
  const [showModes, setShowModes] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim(), timestamp: new Date() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          mode,
        }),
      });

      const data = await response.json();

      if (data.error) {
        const isQuota = data.error.includes('quota') || data.error.includes('429') || data.error.includes('exceeded');
        const errorMsg = isQuota
          ? '⚠️ **API quota exceeded.** Your Gemini API key has reached its daily limit.\n\n**To fix:**\n1. Visit [aistudio.google.com/apikey](https://aistudio.google.com/apikey)\n2. Create a new API key\n3. Update `GEMINI_API_KEY` in `.env.local`\n4. Restart the server'
          : `⚠️ ${data.error}`;
        setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, timestamp: new Date() }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response, timestamp: new Date(), actions: data.actions }]);
        // Fire global refresh event if any tool performed a write/mutation
        const didWrite = (data.actions || []).some((a: Action) =>
          a.tool.startsWith('create_') || a.tool.startsWith('update_') ||
          a.tool.startsWith('approve_') || a.tool.startsWith('reject_') ||
          a.tool.startsWith('assign_') || a.tool === 'give_recognition' ||
          a.tool === 'award_xp' || a.tool === 'apply_leave' ||
          a.tool === 'post_social' || a.tool === 'log_overtime' ||
          a.tool === 'resolve_helpdesk_ticket'
        );
        if (didWrite) {
          window.dispatchEvent(new CustomEvent('ai-data-changed'));
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Network error. Please try again.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]);
  };

  return (
    <>
      {/* Floating Button */}
      <button className={styles.fab} onClick={() => setIsOpen(!isOpen)} data-open={isOpen} aria-label="AI Assistant">
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.headerLeft}>
              <span className={styles.aiDot} />
              <div>
                <strong>BrainvareHRM AI</strong>
                <span>Powered by Gemini Flash</span>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button onClick={clearChat} title="Clear chat">🗑️</button>
              <button onClick={() => setIsOpen(false)} title="Close">✕</button>
            </div>
          </div>

          {/* Mode Selector */}
          <div className={styles.modeBar}>
            <button className={styles.modeToggle} onClick={() => setShowModes(!showModes)}>
              {modeConfig[mode].icon} {modeConfig[mode].label} ▾
            </button>
            {showModes && (
              <div className={styles.modeDropdown}>
                {(Object.keys(modeConfig) as AIMode[]).map(m => (
                  <button key={m} className={styles.modeOption} data-active={mode === m} onClick={() => { setMode(m); setShowModes(false); }}>
                    <span>{modeConfig[m].icon}</span>
                    <span>{modeConfig[m].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} className={styles.message} data-role={msg.role}>
                <div className={styles.msgBubble}>
                  <div className={styles.msgContent} dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                  {msg.actions && msg.actions.length > 0 && (
                    <div className={styles.actionsList}>
                      {msg.actions.map((a, j) => (
                        <ActionChip key={j} action={a} />
                      ))}
                    </div>
                  )}
                </div>
                <span className={styles.msgTime}>{msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
            {isLoading && (
              <div className={styles.message} data-role="assistant">
                <div className={styles.msgBubble}>
                  <div className={styles.typingIndicator}><span /><span /><span /></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputArea}>
            <textarea
              className={styles.textarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={modeConfig[mode].placeholder}
              rows={1}
              disabled={isLoading}
            />
            <button className={styles.sendBtn} onClick={sendMessage} disabled={!input.trim() || isLoading}>
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ActionChip({ action }: { action: Action }) {
  const [open, setOpen] = useState(false);
  const isError = !!action.result?.error;
  const summary = isError
    ? `Error: ${action.result.error}`
    : Array.isArray(action.result)
      ? `${action.result.length} result(s)`
      : action.result?.ok ? '✓ Done' : 'Done';
  return (
    <div className={styles.actionItem} data-error={isError}>
      <div className={styles.actionHeader} onClick={() => setOpen(o => !o)}>
        <span className={styles.actionTool}>
          <span className={styles.actionChevron} data-open={open}>▸</span>
          ⚡ {action.tool}
        </span>
        <span className={styles.actionResult}>{summary}</span>
      </div>
      {open && (
        <div className={styles.actionDetail}>
          {action.args && Object.keys(action.args).length > 0 && (
            <>
              <div className={styles.actionLabel}>Input</div>
              <pre>{JSON.stringify(action.args, null, 2)}</pre>
            </>
          )}
          <div className={styles.actionLabel}>Output</div>
          <pre>{JSON.stringify(action.result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMarkdown(text: string): string {
  // Pull out fenced code blocks first so they don't get mangled.
  const codeBlocks: string[] = [];
  let stripped = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
    const safe = escapeHtml(code.replace(/\n$/, ''));
    const langTag = lang ? `<span class="codeBlockLang">${escapeHtml(lang)}</span>` : '';
    codeBlocks.push(`<pre class="codeBlock">${langTag}<code>${safe}</code></pre>`);
    return ` CODE${codeBlocks.length - 1} `;
  });

  // Escape the rest (now safe to do; placeholders are ASCII-safe)
  stripped = escapeHtml(stripped);

  // Inline code
  stripped = stripped.replace(/`([^`]+?)`/g, '<code class="inlineCode">$1</code>');

  // Bold + italic
  stripped = stripped.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  stripped = stripped.replace(/(?<![\w*])\*([^*\n]+?)\*(?![\w*])/g, '<em>$1</em>');

  // Headings
  stripped = stripped
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>');

  // Links [text](url)
  stripped = stripped.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

  // Lists — group consecutive bullet lines into a <ul>
  stripped = stripped.replace(/(?:^|\n)((?:[-*•] .+\n?)+)/g, (_, block: string) => {
    const items = block
      .trim()
      .split('\n')
      .map((l) => l.replace(/^[-*•]\s+/, ''))
      .map((l) => `<li>${l}</li>`)
      .join('');
    return `\n<ul class="mdList">${items}</ul>`;
  });

  // Numbered lists
  stripped = stripped.replace(/(?:^|\n)((?:\d+\.\s+.+\n?)+)/g, (_, block: string) => {
    const items = block
      .trim()
      .split('\n')
      .map((l) => l.replace(/^\d+\.\s+/, ''))
      .map((l) => `<li>${l}</li>`)
      .join('');
    return `\n<ol class="mdList">${items}</ol>`;
  });

  // Paragraphs: split on blank lines, wrap remaining text
  stripped = stripped
    .split(/\n{2,}/)
    .map((para) => {
      if (/^\s*<(h\d|ul|ol|pre| )/.test(para)) return para;
      return `<p>${para.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('');

  // Restore code blocks
  stripped = stripped.replace(/ CODE(\d+) /g, (_, i) => codeBlocks[parseInt(i, 10)]);

  return stripped;
}
