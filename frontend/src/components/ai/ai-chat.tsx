"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api-client";
import { ArrowUp, Loader2 } from "lucide-react";
import { ProgressiveText } from "./progressive-text";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiChatProps {
  emailId: string;
  provider?: string;
}

export function AiChat({ emailId, provider }: AiChatProps) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const api = createApiClient(getToken);
      const qs = provider ? `?provider=${provider}` : "";
      const result = await api.post<{ reply: string }>(
        `/ai/chat/${emailId}${qs}`,
        { messages: newMessages },
      );
      setMessages((prev) => {
        const next = [...prev, { role: "assistant" as const, content: result.reply }];
        setRevealedCount(next.length - 1);
        return next;
      });
    } catch {
      setMessages((prev) => {
        const next = [...prev, { role: "assistant" as const, content: "Sorry, something went wrong. Please try again." }];
        setRevealedCount(next.length);
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, getToken, emailId, provider]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div className="flex flex-col gap-3">
      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex max-h-[400px] flex-col gap-3 overflow-y-auto rounded-lg border border-border bg-card p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                msg.role === "user"
                  ? "self-end bg-primary text-primary-foreground"
                  : "self-start bg-muted text-foreground",
              )}
            >
              <p className="whitespace-pre-wrap">
                {msg.role === "assistant" && i >= revealedCount ? (
                  <ProgressiveText
                    text={msg.content}
                    wordDelay={25}
                    onComplete={() => setRevealedCount(i + 1)}
                  />
                ) : (
                  msg.content
                )}
              </p>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 self-start rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input */}
      <div className="overflow-hidden rounded-xl border border-border bg-muted/50 shadow-sm transition-colors focus-within:border-primary/50">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this email..."
          disabled={isLoading}
          rows={1}
          className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        <div className="flex items-center justify-end px-3 pb-2">
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              canSend
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
