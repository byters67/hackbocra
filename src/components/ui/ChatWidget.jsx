import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";

// V-01 remediation: Keys loaded from environment variables only (no hardcoded fallbacks)
import { supabaseUrl_, supabaseAnonKey_ } from '../../lib/supabase';
const CHAT_API = `${supabaseUrl_}/functions/v1/chat`;

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hi! I'm the BOCRA Assistant. I can help you navigate the site, file complaints, find licensing info, check domain availability, report cyber threats, and more. What do you need help with?",
};

const SUGGESTED_QUESTIONS = [
  "How do I file a complaint?",
  "I want to register a .bw domain",
  "What licences does BOCRA offer?",
  "How do I get type approval?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;

    const userMessage = { role: "user", content: msgText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const history = updatedMessages
        .filter((_, i) => i > 0 && i < updatedMessages.length - 1)
        .slice(-10)
        .map(({ role, content }) => ({ role, content }));

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(CHAT_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKey_}`,
          apikey: supabaseAnonKey_,
        },
        body: JSON.stringify({
          message: msgText,
          history: history.length > 0 ? history : undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          res.status === 429
            ? "You're sending messages too quickly. Please wait a moment."
            : data.error || "Something went wrong"
        );
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      const errorMsg =
        err.name === "AbortError"
          ? "The request timed out. Please try again."
          : "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMsg },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
  };

  const showSuggestions = messages.length === 1;

  return (
    <>
      {/* Chat button — bottom right */}
      <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-[95] flex items-end gap-2">
        {/* Tooltip — shows on hover (desktop only) */}
        {!open && hovered && (
          <div className="hidden sm:block bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-2.5 max-w-[210px] mb-1">
            <p className="text-xs font-medium text-[#00458B]">BOCRA AI Assistant</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Ask about licences, complaints, or regulations</p>
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2 ${
            open
              ? "bg-gray-600 p-3 sm:p-4"
              : "bg-[#00458B] hover:bg-[#00A6CE] p-3 sm:p-4"
          }`}
          aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        >
          {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
        </button>
      </div>

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-[5.5rem] sm:bottom-[140px] right-3 sm:right-6 z-[95] w-[calc(100vw-1.5rem)] sm:w-96 max-h-[calc(100dvh-7rem)] sm:max-h-[480px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="bg-[#00458B] text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#00A6CE] flex items-center justify-center">
                <MessageCircle size={14} />
              </div>
              <div>
                <span className="font-semibold text-sm">BOCRA Assistant</span>
                <span className="text-[9px] text-white/50 ml-2">AI-Powered</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Clear chat"
                title="Start new conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="sm:hidden text-white/70 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-[#00458B] text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="chat-markdown prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:text-gray-900">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  )}
                </div>
              </div>
            ))}

            {showSuggestions && !loading && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-white border border-[#00458B]/30 text-[#00458B] rounded-full px-3 py-1.5 hover:bg-[#00458B] hover:text-white transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Loader size={14} className="animate-spin text-[#00458B]" />
                  <span className="text-xs text-gray-500">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 flex gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about BOCRA..."
              disabled={loading}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00458B] disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-[#00458B] text-white rounded-lg p-2 hover:bg-[#00A6CE] disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
