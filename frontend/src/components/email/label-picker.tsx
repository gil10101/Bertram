"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Tag, Plus, Loader2, Check } from "lucide-react";
import { createApiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Label {
  id: string;
  name: string;
  type?: string;
}

interface LabelPickerProps {
  emailId: string;
  provider?: string;
  currentLabels: string[];
  onLabelsChange?: (labels: string[]) => void;
}

const SYSTEM_LABELS = new Set([
  "INBOX", "SENT", "DRAFT", "TRASH", "SPAM", "STARRED", "UNREAD",
  "IMPORTANT", "CATEGORY_PERSONAL", "CATEGORY_SOCIAL", "CATEGORY_PROMOTIONS",
  "CATEGORY_UPDATES", "CATEGORY_FORUMS",
]);

export function LabelPicker({ emailId, provider, currentLabels, onLabelsChange }: LabelPickerProps) {
  const { getToken } = useAuth();
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const fetchLabels = useCallback(async () => {
    setIsLoading(true);
    try {
      const api = createApiClient(getToken);
      const qs = provider ? `?provider=${provider}` : "";
      const data = await api.get<Label[]>(`/labels${qs}`);
      setLabels(data.filter((l) => !SYSTEM_LABELS.has(l.id) && !SYSTEM_LABELS.has(l.name)));
    } catch (err) {
      console.error("Failed to fetch labels:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, provider]);

  useEffect(() => {
    if (isOpen) {
      fetchLabels();
    }
  }, [isOpen, fetchLabels]);

  const toggleLabel = async (label: Label) => {
    const isApplied = currentLabels.includes(label.id) || currentLabels.includes(label.name);
    const api = createApiClient(getToken);
    const qs = provider ? `?provider=${provider}` : "";

    setTogglingIds((prev) => new Set(prev).add(label.id));

    try {
      if (isApplied) {
        await api.patch(`/emails/${emailId}${qs}`, { remove_labels: [label.id] });
        const updated = currentLabels.filter((l) => l !== label.id && l !== label.name);
        onLabelsChange?.(updated);
      } else {
        await api.patch(`/emails/${emailId}${qs}`, { add_labels: [label.id] });
        const updated = [...currentLabels, label.id];
        onLabelsChange?.(updated);
      }
    } catch (err) {
      console.error("Failed to toggle label:", err);
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(label.id);
        return next;
      });
    }
  };

  const createLabel = async () => {
    const name = newLabelName.trim();
    if (!name) return;

    setIsCreating(true);
    try {
      const api = createApiClient(getToken);
      const qs = provider ? `?provider=${provider}` : "";
      const created = await api.post<Label>(`/labels${qs}`, { name });
      setLabels((prev) => [...prev, created]);
      setNewLabelName("");
    } catch (err) {
      console.error("Failed to create label:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const visibleLabels = currentLabels.filter((l) => !SYSTEM_LABELS.has(l));

  return (
    <div className="flex items-center gap-2">
      {visibleLabels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {visibleLabels.map((l) => {
            const labelObj = labels.find((lb) => lb.id === l || lb.name === l);
            return (
              <Badge key={l} variant="outline" className="text-xs">
                {labelObj?.name ?? l}
              </Badge>
            );
          })}
        </div>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Tag className="h-3.5 w-3.5" />
            Labels
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <div className="p-3">
            <p className="mb-2 text-sm font-medium">Labels</p>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : labels.length === 0 ? (
              <p className="py-2 text-center text-xs text-muted-foreground">
                No labels found
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {labels.map((label) => {
                  const isApplied =
                    currentLabels.includes(label.id) ||
                    currentLabels.includes(label.name);
                  const isToggling = togglingIds.has(label.id);

                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label)}
                      disabled={isToggling}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-input">
                        {isToggling ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isApplied ? (
                          <Check className="h-3 w-3" />
                        ) : null}
                      </div>
                      <span className="truncate">{label.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="border-t p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createLabel();
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="New label..."
                className="h-8 text-xs"
                disabled={isCreating}
              />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                disabled={isCreating || !newLabelName.trim()}
                className="h-8 w-8 shrink-0 p-0"
              >
                {isCreating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </Button>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
