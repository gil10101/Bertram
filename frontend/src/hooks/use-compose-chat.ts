"use client";

import { useState, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api-client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatResult {
  reply: string;
  updated_body?: string;
  updated_subject?: string;
  updated_to?: string;
  updated_cc?: string;
}

interface UseComposeChatOptions {
  onBodyUpdate?: (newBody: string) => void;
  onSubjectUpdate?: (newSubject: string) => void;
  onToUpdate?: (newTo: string) => void;
  onCcUpdate?: (newCc: string) => void;
}

export function useComposeChat({
  onBodyUpdate,
  onSubjectUpdate,
  onToUpdate,
  onCcUpdate,
}: UseComposeChatOptions = {}) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const callbacksRef = useRef({ onBodyUpdate, onSubjectUpdate, onToUpdate, onCcUpdate });
  callbacksRef.current = { onBodyUpdate, onSubjectUpdate, onToUpdate, onCcUpdate };

  const sendMessage = useCallback(
    async (content: string, subject: string, body: string, to: string, cc: string) => {
      const userMsg: Message = { role: "user", content };
      const newMessages = [...messagesRef.current, userMsg];
      messagesRef.current = newMessages;
      setMessages(newMessages);
      setIsLoading(true);
      setError(null);

      try {
        const api = createApiClient(getToken);
        const result = await api.post<ChatResult>(
          "/ai/compose-chat",
          { subject, body, to, cc, messages: newMessages },
        );

        const assistantMsg: Message = { role: "assistant", content: result.reply };
        messagesRef.current = [...newMessages, assistantMsg];
        setMessages(messagesRef.current);

        if (result.updated_body && callbacksRef.current.onBodyUpdate) {
          callbacksRef.current.onBodyUpdate(result.updated_body);
        }
        if (result.updated_subject && callbacksRef.current.onSubjectUpdate) {
          callbacksRef.current.onSubjectUpdate(result.updated_subject);
        }
        if (result.updated_to && callbacksRef.current.onToUpdate) {
          callbacksRef.current.onToUpdate(result.updated_to);
        }
        if (result.updated_cc && callbacksRef.current.onCcUpdate) {
          callbacksRef.current.onCcUpdate(result.updated_cc);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Chat failed"));
        const errMsg: Message = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        };
        messagesRef.current = [...newMessages, errMsg];
        setMessages(messagesRef.current);
      } finally {
        setIsLoading(false);
      }
    },
    [getToken],
  );

  const clear = useCallback(() => {
    messagesRef.current = [];
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clear };
}
