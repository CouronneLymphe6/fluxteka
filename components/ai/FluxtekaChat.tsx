'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Minimize2, ChevronDown, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

interface WorkflowContext {
  title: string;
  description?: string;
  tools?: string[];
  category?: string;
}

interface FluxtekaChat {
  workflowContext?: WorkflowContext;
}

const QUICK_REPLIES = [
  { emoji: '📧', text: 'Automatiser mes emails' },
  { emoji: '🔗', text: 'Connecter mes outils' },
  { emoji: '👥', text: 'Trouver un expert' },
  { emoji: '❓', text: 'Comment ça marche ?' },
];

const STORAGE_KEY = 'fluxteka_chat_history';
const MAX_STORED = 20;

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function FluxtekaChat({ workflowContext }: FluxtekaChat) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailCapture, setEmailCapture] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        setMessages(parsed.slice(-MAX_STORED));
        setExchangeCount(Math.floor(parsed.filter(m => m.role === 'user').length));
      }
    } catch { /* ignore */ }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
      } catch { /* ignore */ }
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setHasNewMessage(false);
    }
  }, [isOpen]);

  // Welcome message
  const getWelcomeMessage = useCallback((): Message => {
    const content = workflowContext
      ? `Bonjour ! Je vois que tu regardes **"${workflowContext.title}"**. Des questions sur ce workflow ou comment le déployer ? Je suis là pour t'aider. 🚀`
      : `Bonjour ! Je suis l'assistant Fluxteka. Dis-moi ce que tu veux automatiser et je t'aide à trouver la meilleure solution. 💡`;
    return { role: 'assistant', content, id: 'welcome' };
  }, [workflowContext]);

  const welcomeMessage = getWelcomeMessage();

  const allMessages = messages.length === 0 ? [welcomeMessage] : messages;

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text.trim(), id: generateId() };
    const newMessages = messages.length === 0
      ? [welcomeMessage, userMsg]
      : [...messages, userMsg];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const newCount = exchangeCount + 1;
    setExchangeCount(newCount);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.filter(m => m.id !== 'welcome').map(m => ({
            role: m.role,
            content: m.content,
          })),
          workflowContext,
          locale: document.documentElement.lang || 'fr',
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const assistantId = generateId();
      const assistantMsg: Message = { role: 'assistant', content: '', id: assistantId };
      const withAssistant = [...newMessages, assistantMsg];
      setMessages(withAssistant);

      // Stream the response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
        }
      }

      // Show email capture after 3 exchanges
      if (newCount >= 3 && !emailSent && !emailCapture) {
        setTimeout(() => setEmailCapture(true), 800);
      }

      if (!isOpen) setHasNewMessage(true);
    } catch (err) {
      console.error('[Chat] Error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Désolé, une erreur est survenue. Réessaie dans un instant.',
          id: generateId(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, workflowContext, exchangeCount, emailSent, emailCapture, isOpen, welcomeMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    // Store email via newsletter API
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), source: 'chat' }),
      });
    } catch { /* silent */ }
    setEmailSent(true);
    setEmailCapture(false);
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: `Parfait ! Je t'enverrai les workflows les plus pertinents pour ton cas. Y a-t-il autre chose que je peux faire pour toi ?`,
        id: generateId(),
      },
    ]);
  };

  const clearChat = () => {
    setMessages([]);
    setExchangeCount(0);
    setEmailCapture(false);
    setEmailSent(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      {/* ── Floating button ── */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-xl transition-all ${isOpen ? 'hidden' : ''}`}
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        aria-label="Ouvrir l'assistant Fluxteka"
        id="chat-open-btn"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.5 }}
        >
          <Bot className="h-5 w-5" />
        </motion.div>
        <span>Assistant IA</span>
        {hasNewMessage && (
          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
            1
          </span>
        )}
        {/* Pulse ring */}
        <motion.span
          className="absolute inset-0 rounded-2xl border-2 border-indigo-400"
          animate={{ opacity: [0.6, 0], scale: [1, 1.15] }}
          transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
        />
      </motion.button>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 flex w-[370px] max-w-[calc(100vw-24px)] flex-col rounded-2xl border border-white/20 bg-white shadow-2xl overflow-hidden"
            style={{ height: 'min(530px, calc(100vh - 80px))' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-none">Assistant Fluxteka</p>
                <p className="text-[11px] text-indigo-200 mt-0.5">Propulsé par IA · Répond en quelques secondes</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                  title="Effacer la conversation"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                  id="chat-close-btn"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
              {allMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="mr-2 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                      <Bot className="h-3.5 w-3.5 text-indigo-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'rounded-tr-sm bg-indigo-600 text-white'
                        : 'rounded-tl-sm bg-white text-gray-800 shadow-sm border border-gray-100'
                    }`}
                  >
                    {msg.content.split('\n').map((line, i) => (
                      <span key={i}>
                        {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                        {i < msg.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Quick replies — only when first message is shown */}
              {allMessages.length === 1 && (
                <div className="flex flex-wrap gap-1.5 pl-8">
                  {QUICK_REPLIES.map((r) => (
                    <button
                      key={r.text}
                      onClick={() => sendMessage(r.text)}
                      className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
                    >
                      <span>{r.emoji}</span> {r.text}
                    </button>
                  ))}
                </div>
              )}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                    <Bot className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-3.5 py-3 shadow-sm border border-gray-100">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-indigo-400"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Email capture */}
              <AnimatePresence>
                {emailCapture && !emailSent && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mx-1 rounded-xl border border-indigo-200 bg-indigo-50 p-3"
                  >
                    <p className="text-xs font-medium text-indigo-800 mb-2">
                      📬 Pour te suivre et t'envoyer les workflows adaptés à ton cas :
                    </p>
                    <form onSubmit={handleEmailSubmit} className="flex gap-2">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="ton@email.com"
                        className="flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                        required
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        OK
                      </button>
                    </form>
                    <button
                      onClick={() => setEmailCapture(false)}
                      className="mt-1.5 text-[10px] text-indigo-400 hover:text-indigo-600"
                    >
                      Non merci
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 bg-white px-3 py-3">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Pose ta question..."
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 transition-all"
                  id="chat-input"
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-all hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  id="chat-send-btn"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
              <p className="mt-1.5 text-center text-[10px] text-gray-400">
                Assistant IA · <a href="/legal/confidentialite" className="hover:text-indigo-500">Confidentialité</a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
