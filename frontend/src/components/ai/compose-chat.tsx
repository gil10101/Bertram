"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2, Trash2 } from "lucide-react";
import { ProgressiveText } from "./progressive-text";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ComposeChatProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (message: string) => void;
  onClear: () => void;
}

export function ComposeChat({ messages, isLoading, onSend, onClear }: ComposeChatProps) {
  const [input, setInput] = useState("");
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

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-medium text-muted-foreground">AI Assistant</span>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Clear chat"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              Ask me to help write, rewrite, or refine your email.
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {[
                "Make this more concise",
                "Add a professional sign-off",
                "Make the tone friendlier",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setInput(suggestion);
                    textareaRef.current?.focus();
                  }}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "self-end bg-primary text-primary-foreground"
                    : "self-start bg-muted text-foreground",
                )}
              >
                <p className="whitespace-pre-wrap">
                  {msg.role === "assistant" && i >= revealedCount ? (
                    <ProgressiveText
                      text={msg.content}
                      wordDelay={50}
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
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="overflow-hidden rounded-xl border border-border bg-muted/50 shadow-sm transition-colors focus-within:border-primary/50">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to help with your email..."
            disabled={isLoading}
            rows={1}
            className="w-full resize-none bg-transparent px-3 pt-2.5 pb-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
          <div className="flex items-center justify-end px-2 pb-1.5">
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                canSend
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
              )}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
