import { useState, useCallback } from 'react';
import { Copy, Check, FileText } from 'lucide-react';

/**
 * "Copy for LLMs" actions for essay/note pages.
 *
 * Pass either:
 *  - `markdownUrl`: a plain-text markdown mirror (also linked as "Markdown"), or
 *  - `getMarkdown`: a function returning the markdown string directly.
 *
 * `variant` switches styling between light and dark page backgrounds.
 */
export default function LLMActions({ markdownUrl, getMarkdown, variant = 'light', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      const text = getMarkdown
        ? await getMarkdown()
        : await (await fetch(markdownUrl)).text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy for LLMs failed:', err);
    }
  }, [markdownUrl, getMarkdown]);

  const tone = variant === 'dark'
    ? 'border-[#8A9A85]/40 text-[#8A9A85] hover:text-[#F5F2EB] hover:border-[#F5F2EB]/60'
    : 'border-[#2A3C24]/20 text-[#2A3C24]/60 hover:text-[#2A3C24] hover:border-[#2A3C24]/50';

  return (
    <div className={`flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider ${className}`}>
      <button
        type="button"
        onClick={handleCopy}
        title="Copy the full text as markdown — paste it into Claude, ChatGPT, or any LLM"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded transition-colors ${tone}`}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied' : 'Copy for LLMs'}
      </button>
      {markdownUrl && (
        <a
          href={markdownUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="View as plain markdown"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded transition-colors ${tone}`}
        >
          <FileText size={12} />
          Markdown
        </a>
      )}
    </div>
  );
}
