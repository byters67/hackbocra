// hooks/useChat.js
// React hook for the BOCRA chatbot — calls the Supabase Edge Function
// Usage: const { messages, sendMessage, isLoading, error, clearMessages } = useChat()

import { useState, useCallback } from "react";
import { supabaseUrl_, supabaseAnonKey_ } from "../lib/supabase";

const CHAT_API = `${supabaseUrl_}/functions/v1/chat`;

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;

    const userMessage = { role: "user", content: content.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setIsLoading(true);
    setError(null);

    try {
      // The edge function expects { message, history } — not the OpenAI messages array
      const history = updatedMessages
        .slice(0, -1)   // exclude the message we just added
        .slice(-10)     // keep last 10 for context window
        .map(({ role, content: c }) => ({ role, content: c }));

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(CHAT_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKey_}`,
          apikey: supabaseAnonKey_,
        },
        body: JSON.stringify({
          message: content.trim(),
          history: history.length > 0 ? history : undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          response.status === 429
            ? "You're sending messages too quickly. Please wait a moment."
            : data.error || "Something went wrong. Please try again."
        );
      }

      setMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      const message =
        err.name === "AbortError"
          ? "The request timed out. Please try again."
          : err instanceof Error
          ? err.message
          : "Something went wrong.";
      setError(message);
      setMessages(messages); // revert user message on failure
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, sendMessage, isLoading, error, clearMessages };
}
