import { useState, useCallback, useRef, useEffect } from "react";
import { Search as SearchIcon, ArrowRight } from "lucide-react";
import styles from "./SearchInput.module.css";

interface SearchInputProps {
  onSearch: (word: string) => void;
  initialValue?: string;
  autoFocus?: boolean;
  size?: "default" | "large";
  placeholder?: string;
}

export default function SearchInput({
  onSearch,
  initialValue = "",
  autoFocus = false,
  size = "default",
  placeholder = "Search for a word…",
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
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
      />
      {/* Always rendered, just hidden when empty — prevents layout shift */}
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
