import { fetchApi } from '../utils/apiClient';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, MessageSquare, CornerDownLeft, Loader2, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ArtCritique, ChatMessage } from '../types';

interface MentorChatProps {
  critique: ArtCritique;
  imageBase64?: string;
  initialPrompt?: string;
  onPromptSent?: () => void;
}

const PROMPT_SUGGESTIONS = [
  'How do I fix the perspective line convergence step-by-step?',
  'What blend modes should I use for the rim light highlights?',
  'How can I fix flat shading and add ambient occlusion?',
  'Suggest 3 master concept artists to study for this specific lighting mood.',
];

export const MentorChat: React.FC<MentorChatProps> = ({ critique, imageBase64, initialPrompt, onPromptSent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your AI Art Director & Senior Mentor. I've finished evaluating **"${critique.artworkTitle}"**. Feel free to ask me for specific digital painting techniques, layer workflows, color adjustments, or portfolio polish advice!`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && !isLoading) {
      handleSendMessage(initialPrompt);
      if (onPromptSent) onPromptSent();
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const question = textToSend || input.trim();
    if (!question || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now() + Math.random().toString(36).substring(2),
      sender: 'user',
      text: question,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetchApi('/api/mentor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentQuestion: question,
          messages: [...messages, userMsg],
          critiqueContext: critique,
          imageBase64: imageBase64,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get mentor response');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: 'assistant_' + Date.now() + Math.random().toString(36).substring(2),
        sender: 'assistant',
        text: data.answer || 'I could not generate advice at this moment.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now() + Math.random().toString(36).substring(2),
          sender: 'assistant',
          text: `⚠️ Mentor connection error: ${err?.message || 'Please try again.'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="mentor-chat-panel" className="rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-col h-[520px] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-stone-900/90 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-500 p-0.5 shadow-md">
            <div className="w-full h-full bg-stone-950 rounded-[7px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
              <span>Art Director & Mentor Chat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-stone-400">
              Live technical painting advice & workflow guidance
            </p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-stone-950 font-medium rounded-tr-xs shadow-md'
                  : 'bg-stone-950/90 text-stone-200 border border-stone-800/80 rounded-tl-xs shadow-sm'
              }`}
            >
              {msg.sender === 'assistant' ? (
                <div className="prose prose-invert prose-xs max-w-none space-y-2">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5">
                <User className="w-3 h-3" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-stone-400 text-xs pl-8">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>Master Mentor is formulating brushwork & technique steps...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 bg-stone-950/60 border-t border-stone-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-stone-400 uppercase font-mono font-bold flex-shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-amber-400" />
          <span>Ask:</span>
        </span>
        {PROMPT_SUGGESTIONS.map((sug, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(sug)}
            className="flex-shrink-0 text-[11px] px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors whitespace-nowrap"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-stone-900/90 border-t border-stone-800 flex items-center gap-2"
      >
        <input
          id="input-mentor-chat"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a technical art direction question (e.g. layer blend modes, color harmony)..."
          className="flex-1 px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-600 text-xs focus:outline-none focus:border-amber-400/80 transition-colors"
        />
        <button
          type="submit"
          id="btn-send-mentor-chat"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
