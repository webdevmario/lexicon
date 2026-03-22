import { useState, useCallback, useRef, useEffect } from "react";
import { Search as SearchIcon, ArrowRight, X } from "lucide-react";
import styles from "./SearchInput.module.css";

interface SearchInputProps {
  onSearch: (word: string) => void;
  initialValue?: string;
  autoFocus?: boolean;
  size?: "default" | "large";
  placeholder?: string;
  onFocus?: () => void;
}

export default function SearchInput({
  onSearch,
  initialValue = "",
  autoFocus = false,
  size = "default",
  placeholder = "Search for a word…",
  onFocus,
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed) onSearch(trimmed);
    },
    [value, onSearch],
  );

  const hasValue = value.trim().length > 0;

  return (
    <form
      className={`${styles.form} ${size === "large" ? styles.large : ""}`}
      onSubmit={handleSubmit}
    >
      <SearchIcon
        className={styles.icon}
        size={size === "large" ? 20 : 16}
        strokeWidth={2}
      />
      <input
        ref={inputRef}
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        onFocus={onFocus}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
      />
      {hasValue && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
          }}
          aria-label="Clear"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      )}
      <button
        type="submit"
        className={`${styles.submitBtn} ${hasValue ? styles.visible : ""}`}
        aria-label="Search"
        tabIndex={hasValue ? 0 : -1}
      >
        <ArrowRight size={16} strokeWidth={2.5} />
      </button>
    </form>
  );
}
