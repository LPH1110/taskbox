import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InlineEditableProps {
  value: string;
  onSave: (newValue: string) => Promise<void> | void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function InlineEditable({
  value,
  onSave,
  className,
  inputClassName,
  placeholder = "Untitled",
  disabled = false,
}: InlineEditableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local state with prop value (Handle external updates)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Auto focus when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Select all text for quick replace
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmed = inputValue.trim();

    // 1. Validation: If empty or unchanged, revert and exit
    if (!trimmed || trimmed === value) {
      setInputValue(value);
      setIsEditing(false);
      return;
    }

    // 2. Optimistic update is handled by parent, we just trigger save
    try {
      await onSave(trimmed);
      setIsEditing(false);
    } catch (error) {
      // 3. Error Handling: Revert if API fails
      setInputValue(value);
      console.error("Failed to save inline edit", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur(); // Trigger onBlur to save
    } else if (e.key === "Escape") {
      // 4. Feature: Cancel editing
      e.preventDefault();
      setInputValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing && !disabled) {
    return (
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn("h-auto py-1 px-2 m-0", inputClassName)}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onClick={() => !disabled && setIsEditing(true)}
      className={cn(
        "cursor-pointer border border-transparent hover:border-border rounded px-2 py-1 transition-colors wrap-break-word min-h-[1.5em]",
        disabled && "cursor-default hover:border-transparent",
        className
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !disabled) setIsEditing(true);
      }}
    >
      {value || (
        <span className="text-muted-foreground italic">{placeholder}</span>
      )}
    </div>
  );
}
