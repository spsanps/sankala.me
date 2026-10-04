import ReactMarkdown from 'react-markdown';
import { SiteLink } from '../../../../components/site/Elements';

// Quoted messages and prompts, set as screens from the same seatback world as the map.
// They stay real text: a blockquote, with each sender named in words.
const inline = { p: ({ children }) => <>{children}</>, a: ({ href = '', children }) => <SiteLink href={href}>{children}</SiteLink> };
const Text = ({ children }) => <ReactMarkdown components={inline}>{children}</ReactMarkdown>;
const pad = n => String(n).padStart(2, '0');

export function ChatCard({ messages }) {
  return <blockquote className="ijp-chat">
    {messages.map(m => {
      const me = m.sender === 'Me';
      return <div key={m.n} className={`ijp-msg ${me ? 'is-me' : 'is-agent'}`}>
        <p className="ijp-msg-head"><span className="ijp-sender">{me ? 'Me' : 'Agent'}</span><span className="ijp-seq" aria-hidden="true">MSG {pad(m.n)}</span></p>
        <p className="ijp-msg-text"><Text>{m.text}</Text></p>
      </div>;
    })}
  </blockquote>;
}

export function PromptCard({ label, to, text }) {
  return <blockquote className="ijp-prompt">
    <p className="ijp-card-head"><span className={`ijp-card-label${/\.md$/.test(label) ? ' is-file' : ''}`}>{label}</span><span className="ijp-card-to">{to}</span></p>
    <div className="ijp-prompt-text">{text.split('\n\n').map((para, i) => <p key={i}><span className="ijp-caret" aria-hidden="true">›</span><Text>{para}</Text></p>)}</div>
  </blockquote>;
}

export function NotesCard({ notes }) {
  return <blockquote className="ijp-prompt ijp-notes">
    <p className="ijp-card-head"><span className="ijp-card-label">Standing notes</span><span className="ijp-card-to">kept by Claude Code</span></p>
    <ol className="ijp-note-list">
      {notes.map(note => <li key={note.title}><strong>{note.title}.</strong> <Text>{note.text}</Text></li>)}
    </ol>
  </blockquote>;
}
